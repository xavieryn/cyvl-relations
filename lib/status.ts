import type { DealStatus } from './types';

export type StatusMeta = {
  label: string;
  /** Tailwind classes for the chip pill (bg + border + text). */
  chipCls: string;
  /** Tailwind class for the dot before the label. */
  dotCls: string;
  /** Sort order in pipeline (left → right). */
  order: number;
};

export const STATUS_META: Record<DealStatus, StatusMeta> = {
  prospect: {
    label: 'Prospect',
    chipCls: 'border-white/20 bg-white/5 text-white/70',
    dotCls: 'bg-white/50',
    order: 1,
  },
  discovery: {
    label: 'Discovery',
    chipCls: 'border-[#1b79c5]/40 bg-[#1b79c5]/15 text-[#7ec3f1]',
    dotCls: 'bg-[#1b79c5]',
    order: 2,
  },
  'pilot-discussion': {
    label: 'Pilot Discussion',
    chipCls: 'border-[#ff9e2c]/40 bg-[#ff9e2c]/15 text-[#ffb56a]',
    dotCls: 'bg-[#ff9e2c]',
    order: 3,
  },
  'proposal-sent': {
    label: 'Proposal Sent',
    chipCls: 'border-[#daff00]/40 bg-[#daff00]/15 text-[#daff00]',
    dotCls: 'bg-[#daff00]',
    order: 4,
  },
  'contract-signed': {
    label: 'Contract Signed',
    chipCls: 'border-[#05c168]/40 bg-[#05c168]/15 text-[#7ce0a8]',
    dotCls: 'bg-[#05c168]',
    order: 5,
  },
  'active-customer': {
    label: 'Active Customer',
    chipCls: 'border-[#11845b]/50 bg-[#11845b]/20 text-[#a6e5c5]',
    dotCls: 'bg-[#11845b]',
    order: 6,
  },
  passed: {
    label: 'Passed',
    chipCls: 'border-[#dc2b2b]/40 bg-[#dc2b2b]/15 text-[#ffbec2]',
    dotCls: 'bg-[#dc2b2b]',
    order: 7,
  },
  'on-hold': {
    label: 'On Hold',
    chipCls: 'border-[#86877a]/40 bg-[#86877a]/15 text-[#bebfb6]',
    dotCls: 'bg-[#86877a]',
    order: 8,
  },
};

export function allStatuses(): DealStatus[] {
  return (Object.keys(STATUS_META) as DealStatus[]).sort(
    (a, b) => STATUS_META[a].order - STATUS_META[b].order,
  );
}

/**
 * Whole days between an ISO date string and `now`. Returns null for falsy/invalid input.
 * Positive number = days in the past (date < now).
 */
export function daysSince(iso: string | undefined, now: Date = new Date()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = now.getTime() - t;
  return Math.floor(diff / msPerDay);
}

/** Human-friendly absolute date (e.g. "Aug 17"). */
export function formatShortDate(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
}

/** Human-friendly relative phrase like "2 days ago" / "today" / "yesterday". */
export function relativeFromDays(days: number | null): string {
  if (days === null) return '—';
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months === 1) return '1 month ago';
  if (months < 12) return `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}
