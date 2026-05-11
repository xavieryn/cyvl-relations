'use client';

import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import Avatar from '@/components/Avatar';
import StatusPill from '@/components/StatusPill';
import IndustryTags from '@/components/IndustryTags';
import { daysSince, formatShortDate, relativeFromDays } from '@/lib/status';
import type { Organization, Person, TeamMember } from '@/lib/types';

export type SortKey =
  | 'name'
  | 'description'
  | 'industry'
  | 'status'
  | 'timeInStatus'
  | 'lastContact'
  | 'owner'
  | 'mainContact';

export type SortDir = 'asc' | 'desc';

export type DealRow = {
  org: Organization;
  owner?: TeamMember;
  mainContact?: Person;
  source?: Person;
};

type Props = {
  rows: DealRow[];
  sortKey: SortKey;
  sortDir: SortDir;
};

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'industry', label: 'Industry' },
  { key: 'status', label: 'Status' },
  { key: 'timeInStatus', label: 'Time in Status' },
  { key: 'lastContact', label: 'Last Contact' },
  { key: 'owner', label: 'Owner' },
  { key: 'mainContact', label: 'Main Contact' },
];

export default function DealsTable({ rows, sortKey, sortDir }: Props) {
  if (rows.length === 0) {
    return (
      <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.02] px-6 py-16 text-center text-white/50">
        No deals match your filters. Try clearing them.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-white/[0.02]">
      <table className="w-full min-w-[1100px] text-left text-sm text-white/85">
        <thead className="border-b border-white/10 bg-white/[0.03] text-[11px] uppercase tracking-wider text-white/45">
          <tr>
            {COLUMNS.map((col) => (
              <SortableTh
                key={col.key}
                colKey={col.key}
                label={col.label}
                activeKey={sortKey}
                activeDir={sortDir}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <Row key={r.org.id} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortableTh({
  colKey,
  label,
  activeKey,
  activeDir,
}: {
  colKey: SortKey;
  label: string;
  activeKey: SortKey;
  activeDir: SortDir;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const isActive = activeKey === colKey;

  function onClick() {
    const next = new URLSearchParams(params.toString());
    next.set('sort', colKey);
    if (isActive) {
      next.set('dir', activeDir === 'asc' ? 'desc' : 'asc');
    } else {
      // First click on a new column = ascending (Finder behavior)
      next.set('dir', 'asc');
    }
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  return (
    <th className="whitespace-nowrap px-4 py-3 font-medium">
      <button
        type="button"
        onClick={onClick}
        className={`group inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition hover:text-white ${
          isActive ? 'text-[#daff00]' : 'text-white/45'
        } ${pending ? 'opacity-50' : ''}`}
      >
        {label}
        <SortIndicator isActive={isActive} dir={activeDir} />
      </button>
    </th>
  );
}

function SortIndicator({ isActive, dir }: { isActive: boolean; dir: SortDir }) {
  if (!isActive) {
    return (
      <span className="text-white/15 opacity-0 transition group-hover:opacity-100">
        ↕
      </span>
    );
  }
  return <span>{dir === 'asc' ? '↑' : '↓'}</span>;
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function Row({ row }: { row: DealRow }) {
  const { org, owner, mainContact } = row;
  const statusDays = daysSince(org.statusSince);
  const lastDays = daysSince(org.lastContacted);
  const domain = hostnameOf(org.website);

  return (
    <tr className="group border-b border-white/5 transition hover:bg-white/[0.035]">
      {/* Name */}
      <Td>
        <Link href={`/orgs/${org.id}`} className="flex min-w-0 items-center gap-3">
          <Avatar src={org.avatarUrl} name={org.name} kind="org" size={32} />
          <div className="min-w-0">
            <div className="truncate font-medium text-white">{org.name}</div>
            {domain && (
              <div className="truncate text-[11px] text-white/40">{domain}</div>
            )}
          </div>
        </Link>
      </Td>

      {/* Description */}
      <Td className="max-w-[260px]">
        <Link href={`/orgs/${org.id}`} className="block">
          <span className="line-clamp-2 text-white/70">
            {org.description ?? '—'}
          </span>
        </Link>
      </Td>

      {/* Industry */}
      <Td>
        <IndustryTags tags={org.industry} />
      </Td>

      {/* Status */}
      <Td>
        <StatusPill status={org.status} />
      </Td>

      {/* Time in Status */}
      <Td className="whitespace-nowrap text-white/70">
        {statusDays === null
          ? '—'
          : statusDays === 0
            ? 'today'
            : `${statusDays} day${statusDays === 1 ? '' : 's'}`}
      </Td>

      {/* Last Contact */}
      <Td className="whitespace-nowrap">
        {lastDays === null ? (
          <span className="text-white/30">—</span>
        ) : (
          <div className="flex flex-col leading-tight">
            <span className="text-white/85">{formatShortDate(org.lastContacted)}</span>
            <span className="text-[11px] text-white/45">{relativeFromDays(lastDays)}</span>
          </div>
        )}
      </Td>

      {/* Owner */}
      <Td className="whitespace-nowrap">
        {owner ? (
          <div className="flex items-center gap-2">
            <Avatar src={owner.avatarUrl} name={owner.name} kind="person" size={24} />
            <span className="text-white/85">{owner.name}</span>
          </div>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </Td>

      {/* Main Contact */}
      <Td className="whitespace-nowrap">
        {mainContact ? (
          <Link
            href={`/people/${mainContact.id}`}
            className="flex items-center gap-2 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              src={mainContact.avatarUrl}
              name={mainContact.name}
              kind="person"
              size={24}
            />
            <span className="text-white/85 group-hover:text-white">{mainContact.name}</span>
          </Link>
        ) : (
          <span className="text-white/30">—</span>
        )}
      </Td>
    </tr>
  );
}

function hostnameOf(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.host.replace(/^www\./, '');
  } catch {
    return null;
  }
}
