import { describe, it, expect } from 'vitest';
import {
  STATUS_META,
  allStatuses,
  daysSince,
  formatShortDate,
  relativeFromDays,
} from './status';
import type { DealStatus } from './types';

describe('status meta', () => {
  it('has an entry for every status', () => {
    const expected: DealStatus[] = [
      'prospect',
      'discovery',
      'pilot-discussion',
      'proposal-sent',
      'contract-signed',
      'active-customer',
      'passed',
      'on-hold',
    ];
    for (const s of expected) {
      expect(STATUS_META[s]).toBeDefined();
      expect(STATUS_META[s].label.length).toBeGreaterThan(0);
    }
  });

  it('allStatuses returns them in pipeline order', () => {
    const order = allStatuses();
    expect(order[0]).toBe('prospect');
    expect(order[order.length - 1]).toBe('on-hold');
  });
});

describe('daysSince', () => {
  const now = new Date('2026-05-11T12:00:00Z');

  it('returns whole days for a past date', () => {
    expect(daysSince('2026-05-01T12:00:00Z', now)).toBe(10);
  });

  it('returns 0 for the same day', () => {
    expect(daysSince('2026-05-11T11:00:00Z', now)).toBe(0);
  });

  it('returns negative for a future date', () => {
    expect(daysSince('2026-05-13T12:00:00Z', now)).toBe(-2);
  });

  it('returns null for undefined', () => {
    expect(daysSince(undefined, now)).toBeNull();
  });

  it('returns null for invalid date string', () => {
    expect(daysSince('not-a-date', now)).toBeNull();
  });
});

describe('formatShortDate', () => {
  it('formats to Mon D', () => {
    expect(formatShortDate('2026-08-17T00:00:00Z')).toMatch(/Aug 1[67]/);
  });

  it('returns em-dash for undefined', () => {
    expect(formatShortDate(undefined)).toBe('—');
  });
});

describe('relativeFromDays', () => {
  it('today for 0', () => {
    expect(relativeFromDays(0)).toBe('today');
  });
  it('yesterday for 1', () => {
    expect(relativeFromDays(1)).toBe('yesterday');
  });
  it('N days ago for small N', () => {
    expect(relativeFromDays(5)).toBe('5 days ago');
  });
  it('months for 30+', () => {
    expect(relativeFromDays(60)).toBe('2 months ago');
  });
  it('em-dash for null', () => {
    expect(relativeFromDays(null)).toBe('—');
  });
});
