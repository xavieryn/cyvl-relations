import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getPerson, getOrg } from '@/lib/graph';
import { activitiesForPerson, activitiesForOrg, computeStats } from '@/lib/activities';
import { getTeamMember } from '@/lib/team';
import { STATUS_META, daysSince, formatShortDate } from '@/lib/status';
import { activityLabel } from '@/components/ActivityIcon';
import type { Activity, Person, Organization } from '@/lib/types';

export const runtime = 'nodejs';

const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 500;

const SYSTEM_PROMPT = `You are a relationship-intelligence analyst writing brief, candid summaries for a civic-sector business-development team.

Your readers are account owners who know nothing about the contact or organization yet. They want a 3-4 sentence summary that:
- Captures the relationship's current state and tone
- Names 1-2 recurring topics or signals from recent activity
- Recommends ONE concrete next action

Style: direct, professional, no hedging. Active voice. Skip throat-clearing ("Based on the activity..."). Lead with the state-of-relationship, end with the recommendation.

Constraints: 3-4 sentences total. Do not invent facts beyond what the data shows. If the signal is sparse, say so plainly. Do not include disclaimers about the data being fictional — the UI shows that already.`;

type Body = {
  entityKind: 'person' | 'org';
  entityId: string;
};

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function formatActivityLine(a: Activity): string {
  const owner = a.ownerId ? getTeamMember(a.ownerId)?.name : null;
  const date = formatShortDate(a.at);
  const dir = a.direction ? ` [${a.direction}]` : '';
  const sent = a.sentiment && a.sentiment !== 'neutral' ? ` (${a.sentiment})` : '';
  const ownerStr = owner ? ` — with ${owner}` : '';
  return `- ${date}: [${activityLabel(a.kind)}${dir}] ${a.summary}${sent}${ownerStr}`;
}

function buildPersonContext(person: Person): string {
  const acts = activitiesForPerson(person.id).slice(0, 15);
  const stats = computeStats(activitiesForPerson(person.id));
  const lines = acts.map(formatActivityLine).join('\n');

  const orgIds = person.orgIds ?? [];
  const orgNames = orgIds
    .map((id) => getOrg(id)?.name)
    .filter(isString)
    .join(', ');

  return [
    `Subject: ${person.name}`,
    person.role ? `Role: ${person.role}` : '',
    orgNames ? `Affiliations: ${orgNames}` : '',
    person.description ? `Bio: ${person.description}` : '',
    '',
    `Activity summary: ${stats.total} touchpoints over ~90 days. Last activity ${stats.lastActivityDaysAgo ?? 0} days ago. Email flow: ${stats.inboundEmails} inbound / ${stats.outboundEmails} outbound.`,
    '',
    'Recent activity (newest first):',
    lines,
  ]
    .filter(Boolean)
    .join('\n');
}

function buildOrgContext(org: Organization): string {
  const acts = activitiesForOrg(org.id).slice(0, 18);
  const stats = computeStats(activitiesForOrg(org.id));
  const lines = acts.map(formatActivityLine).join('\n');

  const owner = org.ownerId ? getTeamMember(org.ownerId)?.name : null;
  const statusLabel = org.status ? STATUS_META[org.status].label : 'unknown';
  const statusDays = daysSince(org.statusSince);
  const lastDays = daysSince(org.lastContacted);

  return [
    `Subject: ${org.name} (organization, kind: ${org.kind})`,
    org.description ? `Background: ${org.description}` : '',
    `Pipeline stage: ${statusLabel}` + (statusDays !== null ? ` (in this stage for ${statusDays} days)` : ''),
    org.location ? `Location: ${org.location}` : '',
    (org.industry ?? []).length > 0 ? `Industry: ${org.industry!.join(', ')}` : '',
    owner ? `Account owner: ${owner}` : '',
    `Last contact: ${lastDays === null ? 'never' : `${lastDays} days ago`}.`,
    org.notes ? `Internal note: ${org.notes}` : '',
    '',
    `Activity summary: ${stats.total} touchpoints across all known contacts. Email flow: ${stats.inboundEmails} inbound / ${stats.outboundEmails} outbound.`,
    '',
    'Recent activity (newest first):',
    lines,
  ]
    .filter(Boolean)
    .join('\n');
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error: 'missing_api_key',
        message:
          'ANTHROPIC_API_KEY is not set. Add it to .env.local (or the Vercel project env vars) to enable AI persona summaries.',
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: 'invalid_json', message: 'Request body must be JSON.' },
      { status: 400 },
    );
  }

  const { entityKind, entityId } = body;
  if (entityKind !== 'person' && entityKind !== 'org') {
    return NextResponse.json(
      { error: 'invalid_kind', message: 'entityKind must be "person" or "org".' },
      { status: 400 },
    );
  }
  if (!entityId || typeof entityId !== 'string') {
    return NextResponse.json(
      { error: 'missing_id', message: 'entityId is required.' },
      { status: 400 },
    );
  }

  let context: string;
  if (entityKind === 'person') {
    const person = getPerson(entityId);
    if (!person) {
      return NextResponse.json(
        { error: 'not_found', message: `No person with id ${entityId}.` },
        { status: 404 },
      );
    }
    context = buildPersonContext(person);
  } else {
    const org = getOrg(entityId);
    if (!org) {
      return NextResponse.json(
        { error: 'not_found', message: `No org with id ${entityId}.` },
        { status: 404 },
      );
    }
    context = buildOrgContext(org);
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Write the relationship summary based on this context:\n\n${context}`,
        },
      ],
    });

    const text = response.content
      .map((b) => (b.type === 'text' ? b.text : ''))
      .join('')
      .trim();

    return NextResponse.json({
      text,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'auth', message: 'API key was rejected. Check ANTHROPIC_API_KEY.' },
        { status: 401 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'rate_limited', message: 'Rate limited. Try again in a moment.' },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: 'api_error', message: error.message, status: error.status },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { error: 'unknown', message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
