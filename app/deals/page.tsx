import { allOrgs, getMainContact } from '@/lib/graph';
import { allTeam, getTeamMember } from '@/lib/team';
import DealsTable, { type DealRow } from '@/components/DealsTable';
import DealsFilterBar from '@/components/DealsFilterBar';
import type { DealStatus, Organization } from '@/lib/types';

type SearchParams = { [key: string]: string | string[] | undefined };

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function matches(org: Organization, params: {
  statuses: string[];
  industries: string[];
  ownerId: string;
  query: string;
}): boolean {
  if (params.statuses.length > 0) {
    if (!org.status || !params.statuses.includes(org.status)) return false;
  }
  if (params.industries.length > 0) {
    const have = org.industry ?? [];
    if (!params.industries.some((t) => have.includes(t))) return false;
  }
  if (params.ownerId) {
    if (org.ownerId !== params.ownerId) return false;
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    const hay = [
      org.name,
      org.description ?? '',
      org.location ?? '',
      org.notes ?? '',
      ...(org.industry ?? []),
    ]
      .join(' ')
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filter = {
    statuses: arr(sp.status),
    industries: arr(sp.industry),
    ownerId: typeof sp.owner === 'string' ? sp.owner : '',
    query: typeof sp.q === 'string' ? sp.q : '',
  };

  const orgs = allOrgs();
  const filtered = orgs.filter((o) => matches(o, filter));

  const rows: DealRow[] = filtered
    .slice()
    .sort((a, b) => {
      const aDate = a.lastContacted ? Date.parse(a.lastContacted) : 0;
      const bDate = b.lastContacted ? Date.parse(b.lastContacted) : 0;
      return bDate - aDate;
    })
    .map((org) => ({
      org,
      owner: org.ownerId ? getTeamMember(org.ownerId) : undefined,
      mainContact: getMainContact(org),
    }));

  const allIndustries = Array.from(
    new Set(orgs.flatMap((o) => o.industry ?? [])),
  ).sort();

  return (
    <main className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 text-white">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#daff00]/80">
            Deal Flow
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Relationships
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/55">
            Every city and partner we&apos;re tracking, the stage we&apos;re at,
            and who owns the relationship from our side.
          </p>
        </div>
        <div className="rounded-md border border-[#daff00]/30 bg-[#daff00]/10 px-3 py-1.5 text-xs text-[#daff00]/90">
          Demo · fictional data, read-only
        </div>
      </div>

      <DealsFilterBar
        totalCount={orgs.length}
        filteredCount={filtered.length}
        allIndustries={allIndustries}
        team={allTeam()}
      />

      <DealsTable rows={rows} />
    </main>
  );
}
