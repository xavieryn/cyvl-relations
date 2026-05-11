'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Entity, Organization } from '@/lib/types';

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

export default function SearchClient({ entities, orgs }: Props) {
  const [query, setQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let filtered = entities;
    if (orgFilter) {
      // Narrow to people in that org + the org itself
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
        className="w-full rounded-md border border-white/20 bg-white/[0.04] px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-white/40"
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
            className="block rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/30 hover:bg-white/[0.07]"
          >
            <div className="font-medium text-white">{e.name}</div>
            <div className="text-sm text-white/60">{subtitleFor(e)}</div>
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
