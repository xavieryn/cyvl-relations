'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Entity } from '@/lib/types';

type Props = { entities: Entity[] };

function subtitleFor(e: Entity): string {
  if (e.entityKind === 'person') return e.role ?? 'Person';
  return `Organization · ${e.kind}`;
}

function hrefFor(e: Entity): string {
  return e.entityKind === 'person' ? `/people/${e.id}` : `/orgs/${e.id}`;
}

export default function SearchClient({ entities }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entities.slice(0, 30);
    return entities.filter((e) => {
      if (e.name.toLowerCase().includes(q)) return true;
      if (e.entityKind === 'person' && e.role && e.role.toLowerCase().includes(q)) {
        return true;
      }
      return false;
    });
  }, [query, entities]);

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
      <div className="mt-2 text-xs text-white/40">
        {results.length} result{results.length === 1 ? '' : 's'}
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
          No matches. Try a different query.
        </div>
      )}
    </div>
  );
}
