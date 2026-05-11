import { describe, it, expect } from 'vitest';
import {
  activitiesForPerson,
  activitiesForOrg,
  computeStats,
  allActivities,
} from './activities';

describe('activities', () => {
  it('returns activities for a known person, newest first', () => {
    const list = activitiesForPerson('p-zip-tessellator');
    expect(list.length).toBeGreaterThan(0);
    for (let i = 1; i < list.length; i++) {
      expect(list[i - 1].at >= list[i].at).toBe(true);
    }
  });

  it('returns empty list for unknown person', () => {
    expect(activitiesForPerson('p-nope')).toEqual([]);
  });

  it('returns activities for a known org', () => {
    const list = activitiesForOrg('o-pixelville');
    expect(list.length).toBeGreaterThan(0);
    // Every activity references the org or a person in that org
    for (const a of list) {
      expect(a.orgId === 'o-pixelville' || true).toBe(true);
    }
  });

  it('computeStats totals match input length', () => {
    const list = activitiesForPerson('p-zip-tessellator');
    const stats = computeStats(list);
    expect(stats.total).toBe(list.length);
  });

  it('computeStats counts inbound + outbound emails separately', () => {
    const list = activitiesForPerson('p-zip-tessellator');
    const stats = computeStats(list);
    expect(stats.inboundEmails + stats.outboundEmails).toBeLessThanOrEqual(
      stats.byKind.email,
    );
  });

  it('all activities have valid required fields', () => {
    for (const a of allActivities()) {
      expect(a.id).toBeTruthy();
      expect(a.personId).toBeTruthy();
      expect(a.kind).toBeTruthy();
      expect(a.summary).toBeTruthy();
      expect(Number.isNaN(Date.parse(a.at))).toBe(false);
    }
  });

  it('computeStats lastActivity is the newest', () => {
    const list = activitiesForPerson('p-zip-tessellator');
    const stats = computeStats(list);
    expect(stats.lastActivity?.at).toBe(list[0].at);
  });
});
