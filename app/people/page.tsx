import Link from 'next/link';
import { allPeople, getOrg, neighbors } from '@/lib/graph';
import Avatar from '@/components/Avatar';
import Badge from '@/components/Badge';

export default function PeopleListPage() {
  const people = allPeople().slice().sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 text-white">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#daff00]/80">
          Network
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">People</h1>
        <p className="mt-2 max-w-xl text-sm text-white/55">
          Every contact in the graph. Click in to see role, affiliations, and the full
          activity timeline.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => {
          const primaryOrgId = p.orgIds[0];
          const primaryOrg = primaryOrgId ? getOrg(primaryOrgId) : undefined;
          const connectionCount = neighbors(p.id).length;
          return (
            <Link
              key={p.id}
              href={`/people/${p.id}`}
              className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.02] p-4 transition hover:-translate-y-0.5 hover:border-[#1b79c5]/50 hover:bg-white/[0.05] hover:shadow-[0_8px_24px_-12px_rgba(27,121,197,0.6)]"
            >
              <Avatar src={p.avatarUrl} name={p.name} kind="person" size={48} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge kind="person" label="Person" />
                  <span className="text-[11px] text-white/35">
                    {connectionCount} connection{connectionCount === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-2 truncate font-medium text-white">{p.name}</div>
                {p.role && (
                  <div className="truncate text-sm text-white/55">{p.role}</div>
                )}
                {primaryOrg && (
                  <div className="mt-1 truncate text-xs text-white/40">
                    {primaryOrg.name}
                  </div>
                )}
              </div>
              <span className="self-center text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60">
                →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
