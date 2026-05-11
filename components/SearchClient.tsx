'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Entity, Organization } from '@/lib/types';
import Avatar from '@/components/Avatar';

type Props = {
  entities: Entity[];
  orgs: Organization[];
};

function subtitleFor(e: Entity): string {
  if (e.entityKind === 'person') return e.role ?? 'Person';
  return `Organization · ${e.kind}`;
}

function hrefFor(e: Entity): string {
  return e.entityKind === 'person' ? `/people/${e.id}` : `/orgs/${e.id}`;
}

const HOVER: Record<Entity['entityKind'], string> = {
  person: 'hover:border-[#1b79c5]/50 hover:shadow-[0_8px_24px_-12px_rgba(27,121,197,0.6)]',
  org: 'hover:border-[#ff9e2c]/50 hover:shadow-[0_8px_24px_-12px_rgba(255,158,44,0.6)]',
};

export default function SearchClient({ entities, orgs }: Props) {
  const [query, setQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = entities;
    if (orgFilter) {
      filtered = filtered.filter((e) => {
        if (e.entityKind === 'org') return e.id === orgFilter;
        return e.orgIds.includes(orgFilter);
      });
    }

    if (!q) return orgFilter ? filtered : filtered.slice(0, 30);

    return filtered.filter((e) => {
      if (e.name.toLowerCase().includes(q)) return true;
      if (e.entityKind === 'person' && e.role && e.role.toLowerCase().includes(q)) {
        return true;
      }
      return false;
    });
  }, [query, orgFilter, entities]);

  const activeOrg = orgFilter ? orgs.find((o) => o.id === orgFilter) : null;

  return (
    <div className="w-full">
      <input
        type="search"
        placeholder="Search people or organizations…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="w-full rounded-lg border border-white/20 bg-white/[0.04] px-4 py-3 text-base text-white outline-none placeholder:text-white/40 transition focus:border-[#daff00]/60 focus:bg-white/[0.06]"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs uppercase tracking-wider text-white/40">
          Filter by org
        </label>
        <select
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
          className="rounded-md border border-white/20 bg-white/[0.04] px-3 py-1.5 text-sm text-white outline-none focus:border-white/40"
        >
          <option value="">All organizations</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id} className="bg-black">
              {o.name}
            </option>
          ))}
        </select>

        {activeOrg && (
          <button
            onClick={() => setOrgFilter('')}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ff9e2c]/40 bg-[#ff9e2c]/15 px-3 py-1 text-xs text-[#ffb56a] transition hover:border-[#ff9e2c]/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff9e2c]" />
            {activeOrg.name}
            <span className="ml-1 text-white/50">×</span>
          </button>
        )}

        <span className="ml-auto text-xs text-white/40">
          {results.length} result{results.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {results.map((e) => (
          <Link
            key={`${e.entityKind}-${e.id}`}
            href={hrefFor(e)}
            className={`group flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.06] ${HOVER[e.entityKind]}`}
          >
            <Avatar
              src={e.avatarUrl}
              name={e.name}
              kind={e.entityKind}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium text-white">{e.name}</div>
              <div className="truncate text-sm text-white/55">{subtitleFor(e)}</div>
            </div>
            <span className="text-white/30 transition group-hover:translate-x-0.5 group-hover:text-white/60">
              →
            </span>
          </Link>
        ))}
      </div>

      {results.length === 0 && (
        <div className="mt-12 text-center text-white/40">
          No matches. Try a different query or clear the org filter.
        </div>
      )}
    </div>
  );
}
