'use client';

import Link from 'next/link';
import Avatar from '@/components/Avatar';
import StatusPill from '@/components/StatusPill';
import IndustryTags from '@/components/IndustryTags';
import { daysSince, formatShortDate, relativeFromDays } from '@/lib/status';
import type { Organization, Person, TeamMember } from '@/lib/types';

export type DealRow = {
  org: Organization;
  owner?: TeamMember;
  mainContact?: Person;
  source?: Person;
};

type Props = { rows: DealRow[] };

export default function DealsTable({ rows }: Props) {
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
            <Th>Name</Th>
            <Th>Description</Th>
            <Th>Industry</Th>
            <Th>Status</Th>
            <Th>Time in Status</Th>
            <Th>Last Contact</Th>
            <Th>Owner</Th>
            <Th>Main Contact</Th>
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

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
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
