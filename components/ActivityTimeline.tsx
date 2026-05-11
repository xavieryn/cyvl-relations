'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ActivityIcon, { activityLabel } from '@/components/ActivityIcon';
import { formatShortDate, daysSince, relativeFromDays } from '@/lib/status';
import { getPerson, getOrg } from '@/lib/graph';
import { getTeamMember } from '@/lib/team';
import type { Activity, ActivityKind, ActivitySentiment } from '@/lib/types';

const SENTIMENT_BORDER: Record<ActivitySentiment, string> = {
  positive: 'border-l-[#05c168]/60',
  neutral: 'border-l-white/15',
  concern: 'border-l-[#dc2b2b]/60',
};

const ALL_KINDS: ActivityKind[] = [
  'email',
  'video-call',
  'phone-call',
  'meeting',
  'in-person',
  'note',
  'event',
];

type Props = {
  activities: Activity[];
  /** When provided, hide the personId column (since we're already on that person's page). */
  hidePerson?: boolean;
};

type Bucket = { label: string; items: Activity[] };

export default function ActivityTimeline({ activities, hidePerson = false }: Props) {
  const [kindFilters, setKindFilters] = useState<Set<ActivityKind>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (kindFilters.size === 0) return activities;
    return activities.filter((a) => kindFilters.has(a.kind));
  }, [activities, kindFilters]);

  const buckets = useMemo(() => bucketByRecency(filtered), [filtered]);

  function toggleKind(k: ActivityKind) {
    setKindFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (activities.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
        No activity logged yet.
      </div>
    );
  }

  return (
    <div>
      {/* Kind filter chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        {ALL_KINDS.map((k) => {
          const count = activities.filter((a) => a.kind === k).length;
          if (count === 0) return null;
          const active = kindFilters.has(k);
          return (
            <button
              key={k}
              onClick={() => toggleKind(k)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${
                active
                  ? 'border-[#daff00]/60 bg-[#daff00]/15 text-[#daff00]'
                  : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30'
              }`}
            >
              <ActivityIcon kind={k} size={16} />
              {activityLabel(k)}
              <span className="text-white/45">·</span>
              <span>{count}</span>
            </button>
          );
        })}
        {kindFilters.size > 0 && (
          <button
            onClick={() => setKindFilters(new Set())}
            className="text-xs text-white/50 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {buckets.map((bucket) => (
        <div key={bucket.label} className="mb-6">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            {bucket.label}
          </div>
          <ul className="space-y-2">
            {bucket.items.map((a) => (
              <ActivityRow
                key={a.id}
                a={a}
                expanded={expanded.has(a.id)}
                onToggle={() => toggleExpand(a.id)}
                hidePerson={hidePerson}
              />
            ))}
          </ul>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
          No activity matches the selected kinds.
        </div>
      )}
    </div>
  );
}

function ActivityRow({
  a,
  expanded,
  onToggle,
  hidePerson,
}: {
  a: Activity;
  expanded: boolean;
  onToggle: () => void;
  hidePerson: boolean;
}) {
  const sentiment = a.sentiment ?? 'neutral';
  const days = daysSince(a.at);
  const person = !hidePerson ? getPerson(a.personId) : null;
  const org = a.orgId ? getOrg(a.orgId) : null;
  const owner = a.ownerId ? getTeamMember(a.ownerId) : null;
  const participants =
    a.participantIds?.map(getPerson).filter((p) => p !== undefined) ?? [];

  return (
    <li className={`group rounded-lg border border-white/10 bg-white/[0.02] border-l-2 ${SENTIMENT_BORDER[sentiment]}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.04]"
      >
        <ActivityIcon kind={a.kind} size={28} />

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-sm font-medium text-white">
              {a.summary}
            </span>
            {a.direction === 'inbound' && (
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                inbound
              </span>
            )}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-white/45">
            <span>{activityLabel(a.kind)}</span>
            <span className="text-white/25">·</span>
            <span>{formatShortDate(a.at)}</span>
            <span className="text-white/25">·</span>
            <span>{relativeFromDays(days)}</span>
            {owner && (
              <>
                <span className="text-white/25">·</span>
                <span>with {owner.name}</span>
              </>
            )}
            {!hidePerson && person && (
              <>
                <span className="text-white/25">·</span>
                <span>{person.name}</span>
              </>
            )}
          </div>
        </div>

        <span className="self-center text-xs text-white/30 transition group-hover:text-white/60">
          {expanded ? '−' : '+'}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 px-3 py-2.5 text-sm text-white/75">
          {a.detail ? (
            <p className="leading-relaxed">{a.detail}</p>
          ) : (
            <p className="text-white/45 italic">No detail captured.</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-white/45">
            {org && (
              <span>
                Org:{' '}
                <Link href={`/orgs/${org.id}`} className="text-white/70 hover:text-white">
                  {org.name}
                </Link>
              </span>
            )}
            {participants.length > 0 && (
              <span>
                Also:{' '}
                {participants.map((p, i) => (
                  <span key={p!.id}>
                    {i > 0 && ', '}
                    <Link
                      href={`/people/${p!.id}`}
                      className="text-white/70 hover:text-white"
                    >
                      {p!.name}
                    </Link>
                  </span>
                ))}
              </span>
            )}
            <span>Sentiment: {sentiment}</span>
          </div>
        </div>
      )}
    </li>
  );
}

function bucketByRecency(activities: Activity[]): Bucket[] {
  const buckets: Bucket[] = [
    { label: 'This week', items: [] },
    { label: 'Last 30 days', items: [] },
    { label: 'Last 90 days', items: [] },
    { label: 'Older', items: [] },
  ];
  for (const a of activities) {
    const d = daysSince(a.at);
    if (d === null) {
      buckets[3].items.push(a);
      continue;
    }
    if (d <= 7) buckets[0].items.push(a);
    else if (d <= 30) buckets[1].items.push(a);
    else if (d <= 90) buckets[2].items.push(a);
    else buckets[3].items.push(a);
  }
  return buckets.filter((b) => b.items.length > 0);
}
