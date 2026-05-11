import { allOrgs, getMainContact } from '@/lib/graph';
import { allTeam, getTeamMember } from '@/lib/team';
import DealsTable, { type DealRow, type SortKey, type SortDir } from '@/components/DealsTable';
import DealsFilterBar from '@/components/DealsFilterBar';
import { STATUS_META } from '@/lib/status';
import type { Organization } from '@/lib/types';

type SearchParams = { [key: string]: string | string[] | undefined };

function arr(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function matches(
  org: Organization,
  params: {
    statuses: string[];
    industries: string[];
    ownerId: string;
    query: string;
  },
): boolean {
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

const VALID_SORT_KEYS: SortKey[] = [
  'name',
  'description',
  'industry',
  'status',
  'timeInStatus',
  'lastContact',
  'owner',
  'mainContact',
];

function compareRows(a: DealRow, b: DealRow, key: SortKey): number {
  const collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
  switch (key) {
    case 'name':
      return collator.compare(a.org.name, b.org.name);
    case 'description':
      return collator.compare(a.org.description ?? '', b.org.description ?? '');
    case 'industry': {
      const ai = (a.org.industry?.[0] ?? '￿').toLowerCase();
      const bi = (b.org.industry?.[0] ?? '￿').toLowerCase();
      return collator.compare(ai, bi);
    }
    case 'status': {
      const ao = a.org.status ? STATUS_META[a.org.status].order : 999;
      const bo = b.org.status ? STATUS_META[b.org.status].order : 999;
      return ao - bo;
    }
    case 'timeInStatus': {
      const aDate = a.org.statusSince ? Date.parse(a.org.statusSince) : 0;
      const bDate = b.org.statusSince ? Date.parse(b.org.statusSince) : 0;
      // ASC = lowest days = most recent statusSince = highest date value first.
      // Flip sign so ascending click goes "shortest time in status first".
      return bDate - aDate;
    }
    case 'lastContact': {
      const aDate = a.org.lastContacted ? Date.parse(a.org.lastContacted) : 0;
      const bDate = b.org.lastContacted ? Date.parse(b.org.lastContacted) : 0;
      // ASC = oldest first; DESC = newest first.
      return aDate - bDate;
    }
    case 'owner': {
      return collator.compare(a.owner?.name ?? '￿', b.owner?.name ?? '￿');
    }
    case 'mainContact': {
      return collator.compare(
        a.mainContact?.name ?? '￿',
        b.mainContact?.name ?? '￿',
      );
    }
    default:
      return 0;
  }
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

  // Sort state from URL (defaults: lastContact desc)
  const rawSort = typeof sp.sort === 'string' ? sp.sort : 'lastContact';
  const sortKey: SortKey = VALID_SORT_KEYS.includes(rawSort as SortKey)
    ? (rawSort as SortKey)
    : 'lastContact';
  const sortDir: SortDir = sp.dir === 'asc' ? 'asc' : 'desc';

  const orgs = allOrgs();
  const filtered = orgs.filter((o) => matches(o, filter));

  const rows: DealRow[] = filtered.map((org) => ({
    org,
    owner: org.ownerId ? getTeamMember(org.ownerId) : undefined,
    mainContact: getMainContact(org),
  }));

  rows.sort((a, b) => {
    const cmp = compareRows(a, b, sortKey);
    return sortDir === 'asc' ? cmp : -cmp;
  });

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

      <DealsTable rows={rows} sortKey={sortKey} sortDir={sortDir} />
    </main>
  );
}
