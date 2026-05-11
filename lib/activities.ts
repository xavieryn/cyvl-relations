import activitiesJson from '../data/activities.json';
import type { Activity, ActivityKind } from './types';
import { daysSince } from './status';

const all = (activitiesJson.activities as Activity[]) ?? [];

const byPerson = new Map<string, Activity[]>();
const byOrg = new Map<string, Activity[]>();

for (const a of all) {
  if (!byPerson.has(a.personId)) byPerson.set(a.personId, []);
  byPerson.get(a.personId)!.push(a);
  if (a.orgId) {
    if (!byOrg.has(a.orgId)) byOrg.set(a.orgId, []);
    byOrg.get(a.orgId)!.push(a);
  }
}

// Each list is sorted newest-first
function sortDesc(list: Activity[]): Activity[] {
  return list.slice().sort((a, b) => b.at.localeCompare(a.at));
}

for (const [k, v] of byPerson) byPerson.set(k, sortDesc(v));
for (const [k, v] of byOrg) byOrg.set(k, sortDesc(v));

export function activitiesForPerson(personId: string): Activity[] {
  return byPerson.get(personId) ?? [];
}

export function activitiesForOrg(orgId: string): Activity[] {
  return byOrg.get(orgId) ?? [];
}

export function allActivities(): Activity[] {
  return all;
}

export type ActivityStats = {
  total: number;
  byKind: Record<ActivityKind, number>;
  lastActivityDaysAgo: number | null;
  lastActivity: Activity | null;
  firstActivity: Activity | null;
  inboundEmails: number;
  outboundEmails: number;
};

const EMPTY_KIND_COUNTS: Record<ActivityKind, number> = {
  email: 0,
  meeting: 0,
  'video-call': 0,
  'phone-call': 0,
  'in-person': 0,
  note: 0,
  event: 0,
};

export function computeStats(activities: Activity[]): ActivityStats {
  const byKind: Record<ActivityKind, number> = { ...EMPTY_KIND_COUNTS };
  let inbound = 0;
  let outbound = 0;
  for (const a of activities) {
    byKind[a.kind] = (byKind[a.kind] ?? 0) + 1;
    if (a.kind === 'email') {
      if (a.direction === 'inbound') inbound++;
      if (a.direction === 'outbound') outbound++;
    }
  }
  const last = activities[0] ?? null;
  const first = activities[activities.length - 1] ?? null;
  return {
    total: activities.length,
    byKind,
    lastActivity: last,
    firstActivity: first,
    lastActivityDaysAgo: last ? daysSince(last.at) : null,
    inboundEmails: inbound,
    outboundEmails: outbound,
  };
}
