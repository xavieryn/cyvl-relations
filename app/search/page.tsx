import { allPeople, allOrgs } from '@/lib/graph';
import type { Entity } from '@/lib/types';
import SearchClient from '@/components/SearchClient';

export default function SearchPage() {
  const entities: Entity[] = [
    ...allPeople().map((p) => ({ entityKind: 'person' as const, ...p })),
    ...allOrgs().map((o) => ({ entityKind: 'org' as const, ...o })),
  ];

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-white">
      <h1 className="text-3xl font-semibold tracking-tight">Search</h1>
      <p className="mt-2 mb-8 text-white/60">
        Type a name, role, or organization.
      </p>
      <SearchClient entities={entities} />
    </main>
  );
}
