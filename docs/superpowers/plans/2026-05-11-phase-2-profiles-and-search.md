# Phase 2 — Profiles + Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace placeholder homepage with a real product surface: clickable people/org profiles backed by a hand-curated fictional graph, live-typeahead search, and a homepage CTA.

**Architecture:** A typed graph (`lib/types.ts`, `lib/graph.ts`) sits on top of a hand-edited `data/seed.json`. Server components for static profile pages (`/people/[id]`, `/orgs/[id]`), one client component for typeahead search (`/search`). The existing canvas animation stays as a fixed-position background under everything.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Vitest for the graph-lib unit tests.

**Working directory:** `/Users/xavieryn/github/cyvl-relations` (on `master`, no branches per project preference).

---

## File Structure (new / modified in Phase 2)

- `data/seed.json` — fictional graph (4 cities, 6 orgs, 20 people, ~50 edges). All names sound clearly made-up so the demo nature is obvious.
- `lib/types.ts` — `Person`, `Organization`, `Edge`, `GraphData` types
- `lib/graph.ts` — load seed, build adjacency index, expose `getPerson`, `getOrg`, `neighbors`, `search`
- `lib/graph.test.ts` — vitest unit tests for the lib
- `vitest.config.ts` — minimal config so the lib tests pick up
- `package.json` — add `test` and `test:run` scripts, vitest dev dep
- `app/page.tsx` — rewrite to new homepage (hero + Explore CTA)
- `app/people/[id]/page.tsx` — person profile, static-generated
- `app/orgs/[id]/page.tsx` — org profile, static-generated
- `app/search/page.tsx` — live typeahead search (client component)
- `app/layout.tsx` — add a thin top nav (site title link + Search link)
- `components/EntityLink.tsx` — small shared component: renders a link to a person or org
- `components/TopNav.tsx` — top navigation bar
- `components/SearchClient.tsx` — client component used by `/search`

`components/NetworkBackground.tsx` stays unchanged — already does the right thing as a fixed bg under the whole app.

---

## Data Conventions

- Person `id`: `p-<slug>` (e.g., `p-zip-tessellator`)
- Organization `id`: `o-<slug>` (e.g., `o-pixelville`)
- Edge `kind`: `'works_at' | 'board_of' | 'donated_to' | 'attended' | 'knows'`
- Edges are undirected for traversal. They are stored once with `from` and `to`; the graph lib treats them symmetrically.
- All names are fictional and a bit whimsical so a viewer instantly recognizes this as demo data.

---

## Task 1: Add Vitest and write the type definitions

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/types.ts`
- Modify: `package.json` (add scripts + dev dep via `npm install`)

- [ ] **Step 1: Install Vitest as a dev dep**

Run:
```bash
npm install -D vitest
```
Expected: installs cleanly. Vitest pulls in a small tree, ~30 packages.

- [ ] **Step 2: Add test scripts to `package.json`**

Open `package.json`. In the `"scripts"` block, add the two scripts so it looks like:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest",
  "test:run": "vitest run"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Create `lib/types.ts`**

```ts
export type OrgKind = 'city' | 'company' | 'nonprofit' | 'other';

export type EdgeKind =
  | 'works_at'
  | 'board_of'
  | 'donated_to'
  | 'attended'
  | 'knows';

export type Person = {
  id: string;
  name: string;
  role?: string;
  orgIds: string[];
};

export type Organization = {
  id: string;
  name: string;
  kind: OrgKind;
};

export type Edge = {
  from: string;
  to: string;
  kind: EdgeKind;
  note?: string;
};

export type GraphData = {
  people: Person[];
  orgs: Organization[];
  edges: Edge[];
};

export type Entity =
  | ({ kind: 'person' } & Person)
  | ({ kind: 'org' } & Organization);
```

- [ ] **Step 5: Type-check the file**

Run:
```bash
npx tsc --noEmit
```
Expected: no errors. (If errors mention missing files, ignore them as long as `lib/types.ts` itself is clean.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/types.ts
git commit -m "feat: add Vitest + graph types"
```

---

## Task 2: Write the fictional seed data

**Files:**
- Create: `data/seed.json`

- [ ] **Step 1: Create `data/seed.json` with this exact content**

```json
{
  "orgs": [
    { "id": "o-pixelville", "name": "City of Pixelville", "kind": "city" },
    { "id": "o-new-whimsy", "name": "City of New Whimsy", "kind": "city" },
    { "id": "o-east-sproutdale", "name": "City of East Sproutdale", "kind": "city" },
    { "id": "o-north-tinkertown", "name": "Town of North Tinkertown", "kind": "city" },
    { "id": "o-pretendo-civic", "name": "Pretendo Civic Co.", "kind": "company" },
    { "id": "o-faux-foundation", "name": "Faux Foundation", "kind": "nonprofit" },
    { "id": "o-imaginary-insights", "name": "Imaginary Insights LLC", "kind": "company" },
    { "id": "o-demo-dynamics", "name": "Demo Dynamics", "kind": "company" },
    { "id": "o-notional-networks", "name": "Notional Networks", "kind": "nonprofit" },
    { "id": "o-mockingbird-strategies", "name": "Mockingbird Strategies", "kind": "company" }
  ],
  "people": [
    { "id": "p-zip-tessellator", "name": "Zip Tessellator", "role": "Mayor of Pixelville", "orgIds": ["o-pixelville"] },
    { "id": "p-bea-pixelton", "name": "Bea Pixelton", "role": "City Councilor, Pixelville", "orgIds": ["o-pixelville"] },
    { "id": "p-quill-brackish", "name": "Quill Brackish", "role": "CTO, City of New Whimsy", "orgIds": ["o-new-whimsy"] },
    { "id": "p-mira-cogsworth", "name": "Mira Cogsworth", "role": "Director, Pretendo Civic Co.", "orgIds": ["o-pretendo-civic"] },
    { "id": "p-felix-underscore", "name": "Felix Underscore", "role": "Senior Analyst, Faux Foundation", "orgIds": ["o-faux-foundation"] },
    { "id": "p-wren-hashbrown", "name": "Wren Hashbrown", "role": "Advisor, Imaginary Insights LLC", "orgIds": ["o-imaginary-insights"] },
    { "id": "p-tibby-quark", "name": "Tibby Quark", "role": "Mayor of East Sproutdale", "orgIds": ["o-east-sproutdale"] },
    { "id": "p-mo-fizzlebottom", "name": "Mo Fizzlebottom", "role": "Town Manager, North Tinkertown", "orgIds": ["o-north-tinkertown"] },
    { "id": "p-juno-paradox", "name": "Juno Paradox", "role": "VP Sales, Demo Dynamics", "orgIds": ["o-demo-dynamics"] },
    { "id": "p-otto-bracket", "name": "Otto Bracket", "role": "Founder, Notional Networks", "orgIds": ["o-notional-networks"] },
    { "id": "p-roo-stardust", "name": "Roo Stardust", "role": "Partner, Mockingbird Strategies", "orgIds": ["o-mockingbird-strategies"] },
    { "id": "p-pip-glomwhistle", "name": "Pip Glomwhistle", "role": "Procurement Officer, Pixelville", "orgIds": ["o-pixelville"] },
    { "id": "p-cosmo-nibble", "name": "Cosmo Nibble", "role": "Council Aide, New Whimsy", "orgIds": ["o-new-whimsy"] },
    { "id": "p-tess-orbit", "name": "Tess Orbit", "role": "Engagement Lead, Pretendo Civic Co.", "orgIds": ["o-pretendo-civic"] },
    { "id": "p-dax-marble", "name": "Dax Marble", "role": "Researcher, Faux Foundation", "orgIds": ["o-faux-foundation"] },
    { "id": "p-vivi-zenith", "name": "Vivi Zenith", "role": "Board Member, Notional Networks", "orgIds": ["o-notional-networks", "o-east-sproutdale"] },
    { "id": "p-sage-pebble", "name": "Sage Pebble", "role": "Consultant, Imaginary Insights LLC", "orgIds": ["o-imaginary-insights"] },
    { "id": "p-rune-quiver", "name": "Rune Quiver", "role": "Engineer, Demo Dynamics", "orgIds": ["o-demo-dynamics"] },
    { "id": "p-mox-loopy", "name": "Mox Loopy", "role": "Civic Fellow", "orgIds": ["o-faux-foundation", "o-pixelville"] },
    { "id": "p-lark-bandit", "name": "Lark Bandit", "role": "Lobbyist, Mockingbird Strategies", "orgIds": ["o-mockingbird-strategies"] }
  ],
  "edges": [
    { "from": "p-zip-tessellator", "to": "o-pixelville", "kind": "works_at" },
    { "from": "p-bea-pixelton", "to": "o-pixelville", "kind": "works_at" },
    { "from": "p-pip-glomwhistle", "to": "o-pixelville", "kind": "works_at" },
    { "from": "p-mox-loopy", "to": "o-pixelville", "kind": "works_at", "note": "civic fellowship placement" },
    { "from": "p-quill-brackish", "to": "o-new-whimsy", "kind": "works_at" },
    { "from": "p-cosmo-nibble", "to": "o-new-whimsy", "kind": "works_at" },
    { "from": "p-tibby-quark", "to": "o-east-sproutdale", "kind": "works_at" },
    { "from": "p-mo-fizzlebottom", "to": "o-north-tinkertown", "kind": "works_at" },
    { "from": "p-mira-cogsworth", "to": "o-pretendo-civic", "kind": "works_at" },
    { "from": "p-tess-orbit", "to": "o-pretendo-civic", "kind": "works_at" },
    { "from": "p-felix-underscore", "to": "o-faux-foundation", "kind": "works_at" },
    { "from": "p-dax-marble", "to": "o-faux-foundation", "kind": "works_at" },
    { "from": "p-mox-loopy", "to": "o-faux-foundation", "kind": "works_at" },
    { "from": "p-wren-hashbrown", "to": "o-imaginary-insights", "kind": "works_at" },
    { "from": "p-sage-pebble", "to": "o-imaginary-insights", "kind": "works_at" },
    { "from": "p-juno-paradox", "to": "o-demo-dynamics", "kind": "works_at" },
    { "from": "p-rune-quiver", "to": "o-demo-dynamics", "kind": "works_at" },
    { "from": "p-otto-bracket", "to": "o-notional-networks", "kind": "works_at" },
    { "from": "p-vivi-zenith", "to": "o-notional-networks", "kind": "board_of" },
    { "from": "p-vivi-zenith", "to": "o-east-sproutdale", "kind": "board_of" },
    { "from": "p-roo-stardust", "to": "o-mockingbird-strategies", "kind": "works_at" },
    { "from": "p-lark-bandit", "to": "o-mockingbird-strategies", "kind": "works_at" },
    { "from": "o-pretendo-civic", "to": "o-pixelville", "kind": "donated_to", "note": "civic-tech sponsorship" },
    { "from": "o-pretendo-civic", "to": "o-new-whimsy", "kind": "donated_to" },
    { "from": "o-demo-dynamics", "to": "o-east-sproutdale", "kind": "donated_to" },
    { "from": "o-mockingbird-strategies", "to": "o-north-tinkertown", "kind": "donated_to" },
    { "from": "p-mira-cogsworth", "to": "p-zip-tessellator", "kind": "knows" },
    { "from": "p-mira-cogsworth", "to": "p-quill-brackish", "kind": "knows" },
    { "from": "p-tess-orbit", "to": "p-bea-pixelton", "kind": "knows" },
    { "from": "p-tess-orbit", "to": "p-cosmo-nibble", "kind": "knows" },
    { "from": "p-felix-underscore", "to": "p-mira-cogsworth", "kind": "knows" },
    { "from": "p-felix-underscore", "to": "p-otto-bracket", "kind": "knows" },
    { "from": "p-dax-marble", "to": "p-mox-loopy", "kind": "knows" },
    { "from": "p-wren-hashbrown", "to": "p-juno-paradox", "kind": "knows" },
    { "from": "p-wren-hashbrown", "to": "p-roo-stardust", "kind": "knows" },
    { "from": "p-sage-pebble", "to": "p-tibby-quark", "kind": "knows" },
    { "from": "p-juno-paradox", "to": "p-quill-brackish", "kind": "knows" },
    { "from": "p-otto-bracket", "to": "p-vivi-zenith", "kind": "knows" },
    { "from": "p-roo-stardust", "to": "p-mo-fizzlebottom", "kind": "knows" },
    { "from": "p-lark-bandit", "to": "p-mo-fizzlebottom", "kind": "knows" },
    { "from": "p-lark-bandit", "to": "p-zip-tessellator", "kind": "knows" },
    { "from": "p-zip-tessellator", "to": "o-faux-foundation", "kind": "attended", "note": "annual gala" },
    { "from": "p-tibby-quark", "to": "o-faux-foundation", "kind": "attended" },
    { "from": "p-quill-brackish", "to": "o-pretendo-civic", "kind": "attended" },
    { "from": "p-mo-fizzlebottom", "to": "o-mockingbird-strategies", "kind": "attended" },
    { "from": "p-pip-glomwhistle", "to": "o-demo-dynamics", "kind": "attended" },
    { "from": "p-cosmo-nibble", "to": "o-imaginary-insights", "kind": "attended" },
    { "from": "p-mira-cogsworth", "to": "p-felix-underscore", "kind": "knows" },
    { "from": "p-vivi-zenith", "to": "p-tibby-quark", "kind": "knows" },
    { "from": "p-bea-pixelton", "to": "p-pip-glomwhistle", "kind": "knows" }
  ]
}
```

That's exactly 10 orgs, 20 people, 50 edges.

- [ ] **Step 2: Validate the JSON parses**

Run:
```bash
node -e "const d = require('./data/seed.json'); console.log('orgs', d.orgs.length, 'people', d.people.length, 'edges', d.edges.length)"
```
Expected: `orgs 10 people 20 edges 50`.

- [ ] **Step 3: Commit**

```bash
git add data/seed.json
git commit -m "feat: add fictional seed graph (10 orgs, 20 people, 50 edges)"
```

---

## Task 3: Write the graph lib (TDD)

**Files:**
- Create: `lib/graph.test.ts`
- Create: `lib/graph.ts`

- [ ] **Step 1: Write failing tests in `lib/graph.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { getPerson, getOrg, neighbors, search } from './graph';

describe('graph lib', () => {
  it('looks up a known person by id', () => {
    const p = getPerson('p-zip-tessellator');
    expect(p?.name).toBe('Zip Tessellator');
  });

  it('returns undefined for unknown person id', () => {
    expect(getPerson('p-does-not-exist')).toBeUndefined();
  });

  it('looks up a known org by id', () => {
    const o = getOrg('o-pixelville');
    expect(o?.name).toBe('City of Pixelville');
  });

  it('returns undefined for unknown org id', () => {
    expect(getOrg('o-fake')).toBeUndefined();
  });

  it('returns symmetric neighbors for a person with edges', () => {
    const ns = neighbors('p-zip-tessellator');
    const targets = ns.map((n) => n.otherId);
    expect(targets).toContain('o-pixelville');
    expect(targets).toContain('p-mira-cogsworth');
    expect(targets).toContain('p-lark-bandit');
  });

  it('returns empty list for unknown entity id', () => {
    expect(neighbors('nope')).toEqual([]);
  });

  it('search matches case-insensitively across people and orgs', () => {
    const r = search('PIXEL');
    const ids = r.map((e) => e.id);
    expect(ids).toContain('o-pixelville');
    expect(ids).toContain('p-bea-pixelton');
  });

  it('search returns an empty array for empty query', () => {
    expect(search('')).toEqual([]);
  });

  it('search returns an empty array for a no-hit query', () => {
    expect(search('zzzzzzz')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:
```bash
npm run test:run
```
Expected: FAIL — "Cannot find module './graph'" or similar.

- [ ] **Step 3: Implement `lib/graph.ts`**

```ts
import seed from '../data/seed.json' assert { type: 'json' };
import type {
  GraphData,
  Person,
  Organization,
  Edge,
  Entity,
} from './types';

const graph = seed as GraphData;

const peopleById = new Map<string, Person>(
  graph.people.map((p) => [p.id, p]),
);
const orgsById = new Map<string, Organization>(
  graph.orgs.map((o) => [o.id, o]),
);

type Neighbor = { otherId: string; edge: Edge };
const adjacency = new Map<string, Neighbor[]>();

for (const e of graph.edges) {
  if (!adjacency.has(e.from)) adjacency.set(e.from, []);
  if (!adjacency.has(e.to)) adjacency.set(e.to, []);
  adjacency.get(e.from)!.push({ otherId: e.to, edge: e });
  adjacency.get(e.to)!.push({ otherId: e.from, edge: e });
}

export function getPerson(id: string): Person | undefined {
  return peopleById.get(id);
}

export function getOrg(id: string): Organization | undefined {
  return orgsById.get(id);
}

export function neighbors(id: string): Neighbor[] {
  return adjacency.get(id) ?? [];
}

export function allPeople(): Person[] {
  return graph.people;
}

export function allOrgs(): Organization[] {
  return graph.orgs;
}

export function entityKind(id: string): 'person' | 'org' | null {
  if (peopleById.has(id)) return 'person';
  if (orgsById.has(id)) return 'org';
  return null;
}

export function search(query: string): Entity[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Entity[] = [];
  for (const p of graph.people) {
    if (
      p.name.toLowerCase().includes(q) ||
      (p.role?.toLowerCase().includes(q) ?? false)
    ) {
      results.push({ kind: 'person', ...p });
    }
  }
  for (const o of graph.orgs) {
    if (o.name.toLowerCase().includes(q)) {
      results.push({ kind: 'org', ...o });
    }
  }
  return results;
}
```

- [ ] **Step 4: Verify TypeScript handles the JSON import**

Check `tsconfig.json`. If `"resolveJsonModule"` is not `true`, set it (it's on by default in Next.js's TS config). Run:

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('tsconfig.json','utf8')).compilerOptions.resolveJsonModule ?? 'default-true')"
```
If output is `false`, edit `tsconfig.json` to set `"resolveJsonModule": true` inside `compilerOptions`. Otherwise the Next.js preset has it enabled by default — proceed.

Also — the `import seed from '...' assert { type: 'json' }` syntax can fail under Vitest's resolver depending on Node version. If Step 5 below fails with an import-assertion error, replace the first line of `lib/graph.ts` with:

```ts
import seedJson from '../data/seed.json';
const graph = seedJson as GraphData;
```

and remove the `assert { type: 'json' }` clause. Drop the now-unused intermediate `const graph = seed as GraphData;` line.

- [ ] **Step 5: Run tests to verify they pass**

Run:
```bash
npm run test:run
```
Expected: PASS — 9 tests across `lib/graph.test.ts`.

If Step 4's fallback applies, apply it now and rerun.

- [ ] **Step 6: Commit**

```bash
git add lib/graph.ts lib/graph.test.ts
git commit -m "feat: graph lib with person/org/neighbor/search queries"
```

---

## Task 4: Build the `EntityLink` shared component

**Files:**
- Create: `components/EntityLink.tsx`

- [ ] **Step 1: Create `components/EntityLink.tsx`**

```tsx
import Link from 'next/link';

type Props = {
  id: string;
  name: string;
  kind: 'person' | 'org';
  subtitle?: string;
};

export default function EntityLink({ id, name, kind, subtitle }: Props) {
  const href = kind === 'person' ? `/people/${id}` : `/orgs/${id}`;
  return (
    <Link
      href={href}
      className="block rounded-md border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-white/30 hover:bg-white/[0.07]"
    >
      <div className="font-medium text-white">{name}</div>
      {subtitle && <div className="text-sm text-white/60">{subtitle}</div>}
    </Link>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EntityLink.tsx
git commit -m "feat: EntityLink shared component"
```

---

## Task 5: Build the `TopNav` and update layout

**Files:**
- Create: `components/TopNav.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/TopNav.tsx`**

```tsx
import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0a0a0f]/70 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          Cyvl Relations
        </Link>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <Link href="/search" className="hover:text-white">
            Search
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` to render the nav**

The current body element is `<body className="min-h-full flex flex-col">{children}</body>`. Replace it with this body markup (keep all the surrounding imports and the `RootLayout` function shape):

```tsx
<body className="min-h-full flex flex-col">
  <TopNav />
  {children}
</body>
```

Add the import at the top of the file (after the existing imports):

```tsx
import TopNav from "@/components/TopNav";
```

- [ ] **Step 3: Smoke-build**

Run:
```bash
npm run build 2>&1 | tail -10
```
Expected: build succeeds. Route table still shows `/` and `/_not-found`.

- [ ] **Step 4: Commit**

```bash
git add components/TopNav.tsx app/layout.tsx
git commit -m "feat: top navigation"
```

---

## Task 6: Build the `/people/[id]` profile page

**Files:**
- Create: `app/people/[id]/page.tsx`

- [ ] **Step 1: Create `app/people/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import {
  allPeople,
  getPerson,
  getOrg,
  neighbors,
} from '@/lib/graph';
import EntityLink from '@/components/EntityLink';

export const dynamicParams = false;

export function generateStaticParams() {
  return allPeople().map((p) => ({ id: p.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();

  const orgs = person.orgIds.map(getOrg).filter((o) => o !== undefined);
  const connections = neighbors(person.id);

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-white">
      <h1 className="text-4xl font-semibold tracking-tight">{person.name}</h1>
      {person.role && (
        <p className="mt-2 text-white/70">{person.role}</p>
      )}

      {orgs.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Affiliations
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {orgs.map((o) => (
              <EntityLink key={o.id} id={o.id} name={o.name} kind="org" subtitle={o.kind} />
            ))}
          </div>
        </section>
      )}

      {connections.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Connections
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {connections.map(({ otherId, edge }) => {
              const op = getPerson(otherId);
              const oo = getOrg(otherId);
              if (op) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={op.id}
                    name={op.name}
                    kind="person"
                    subtitle={`${edge.kind.replace('_', ' ')}${edge.note ? ` — ${edge.note}` : ''}`}
                  />
                );
              }
              if (oo) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={oo.id}
                    name={oo.name}
                    kind="org"
                    subtitle={`${edge.kind.replace('_', ' ')}${edge.note ? ` — ${edge.note}` : ''}`}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Smoke-build and curl a sample profile**

Run:
```bash
npm run build 2>&1 | tail -15
```
Expected: build succeeds. Route table now includes `/people/[id]` (likely listed as `● /people/[id]` with 20 generated static pages).

Then start prod and check one:
```bash
npm run start > /tmp/cyvl-prod.log 2>&1 &
PID=$!
sleep 4
curl -s -o /tmp/p.html -w "HTTP %{http_code}\n" http://localhost:3000/people/p-zip-tessellator
grep -c "Zip Tessellator" /tmp/p.html
grep -c "City of Pixelville" /tmp/p.html
kill $PID 2>/dev/null
wait $PID 2>/dev/null
true
```
Expected: `HTTP 200`, both greps return `1`.

- [ ] **Step 3: Commit**

```bash
git add app/people/[id]/page.tsx
git commit -m "feat: /people/[id] profile page"
```

---

## Task 7: Build the `/orgs/[id]` profile page

**Files:**
- Create: `app/orgs/[id]/page.tsx`

- [ ] **Step 1: Create `app/orgs/[id]/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import {
  allOrgs,
  getOrg,
  getPerson,
  neighbors,
} from '@/lib/graph';
import EntityLink from '@/components/EntityLink';

export const dynamicParams = false;

export function generateStaticParams() {
  return allOrgs().map((o) => ({ id: o.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function OrgPage({ params }: PageProps) {
  const { id } = await params;
  const org = getOrg(id);
  if (!org) notFound();

  const connections = neighbors(org.id);

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-white">
      <h1 className="text-4xl font-semibold tracking-tight">{org.name}</h1>
      <p className="mt-2 capitalize text-white/70">{org.kind}</p>

      {connections.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Connections
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {connections.map(({ otherId, edge }) => {
              const op = getPerson(otherId);
              const oo = getOrg(otherId);
              if (op) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={op.id}
                    name={op.name}
                    kind="person"
                    subtitle={`${edge.kind.replace('_', ' ')}${op.role ? ` — ${op.role}` : ''}`}
                  />
                );
              }
              if (oo) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={oo.id}
                    name={oo.name}
                    kind="org"
                    subtitle={`${edge.kind.replace('_', ' ')}${edge.note ? ` — ${edge.note}` : ''}`}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Smoke-build and curl a sample org**

Run:
```bash
npm run build 2>&1 | tail -15
```
Expected: build succeeds. Route table includes `/orgs/[id]`.

```bash
npm run start > /tmp/cyvl-prod.log 2>&1 &
PID=$!
sleep 4
curl -s -o /tmp/o.html -w "HTTP %{http_code}\n" http://localhost:3000/orgs/o-pixelville
grep -c "City of Pixelville" /tmp/o.html
grep -c "Zip Tessellator" /tmp/o.html
kill $PID 2>/dev/null
wait $PID 2>/dev/null
true
```
Expected: `HTTP 200`, both greps return `1`.

- [ ] **Step 3: Commit**

```bash
git add app/orgs/[id]/page.tsx
git commit -m "feat: /orgs/[id] profile page"
```

---

## Task 8: Build the `/search` page with live typeahead

**Files:**
- Modify: `lib/types.ts` (rename `Entity` discriminator)
- Modify: `lib/graph.ts` (update `search()` to use new discriminator)
- Create: `components/SearchClient.tsx`
- Create: `app/search/page.tsx`

**Why the rename:** `Entity` is currently `{ kind: 'person' } & Person | { kind: 'org' } & Organization`. But `Organization` already has a `kind: OrgKind` field, so the union discriminator collides with the org's own field. Rename the discriminator to `entityKind` first, then build the search UI.

- [ ] **Step 1: Rename the `Entity` discriminator in `lib/types.ts`**

Open `lib/types.ts`. Replace the `Entity` type at the bottom of the file with:

```ts
export type Entity =
  | ({ entityKind: 'person' } & Person)
  | ({ entityKind: 'org' } & Organization);
```

- [ ] **Step 2: Update `lib/graph.ts` to emit the renamed discriminator**

In `lib/graph.ts`, inside the `search` function, change:

```ts
results.push({ kind: 'person', ...p });
```

to:

```ts
results.push({ entityKind: 'person', ...p });
```

And change:

```ts
results.push({ kind: 'org', ...o });
```

to:

```ts
results.push({ entityKind: 'org', ...o });
```

- [ ] **Step 3: Re-run lib tests to confirm nothing else broke**

```bash
npm run test:run
```
Expected: 9 tests PASS.

- [ ] **Step 4: Create `components/SearchClient.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `app/search/page.tsx`**

```tsx
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
```

- [ ] **Step 6: Smoke-build and curl**

```bash
npm run build 2>&1 | tail -15
```
Expected: build succeeds.

```bash
npm run start > /tmp/cyvl-prod.log 2>&1 &
PID=$!
sleep 4
curl -s -o /tmp/s.html -w "HTTP %{http_code}\n" http://localhost:3000/search
grep -c "Search people or organizations" /tmp/s.html
kill $PID 2>/dev/null
wait $PID 2>/dev/null
true
```
Expected: `HTTP 200`, grep returns `1`.

- [ ] **Step 7: Commit**

```bash
git add lib/types.ts lib/graph.ts components/SearchClient.tsx app/search/page.tsx
git commit -m "feat: /search with live typeahead"
```

---

## Task 9: Rewrite the homepage with Explore CTA

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Rewrite `app/page.tsx`**

```tsx
import Link from 'next/link';
import NetworkBackground from '@/components/NetworkBackground';

export default function Page() {
  return (
    <>
      <NetworkBackground />
      <main className="relative z-10 flex min-h-[calc(100vh-49px)] flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Cyvl Relations
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          A demo relationship graph for city &amp; civic-sector business development. Find the path between people and organizations.
        </p>
        <Link
          href="/search"
          className="mt-10 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-white/60 hover:bg-white/20"
        >
          Explore the graph →
        </Link>
        <p className="mt-6 text-xs text-white/40">
          All data shown is fictional placeholder content for demo purposes.
        </p>
      </main>
    </>
  );
}
```

The `min-h-[calc(100vh-49px)]` accounts for the sticky top nav so the hero stays full-viewport without scrolling on a fresh load. If the nav height differs visibly (e.g., scrollbars), tweak the constant.

- [ ] **Step 2: Smoke-build and curl homepage**

```bash
npm run build 2>&1 | tail -10
npm run start > /tmp/cyvl-prod.log 2>&1 &
PID=$!
sleep 4
curl -s -o /tmp/h.html -w "HTTP %{http_code}\n" http://localhost:3000/
grep -c "Explore the graph" /tmp/h.html
grep -c "fictional placeholder content" /tmp/h.html
kill $PID 2>/dev/null
wait $PID 2>/dev/null
true
```
Expected: `HTTP 200`, both greps return `1`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage with Explore CTA and demo-data disclaimer"
```

---

## Task 10: Push (Vercel auto-deploys)

**Files:** none modified.

- [ ] **Step 1: Push to GitHub**

```bash
git push origin master
```
Expected: Vercel sees the push (via the connection from Phase 1) and triggers a production deploy automatically.

- [ ] **Step 2: Wait for the deploy and verify**

```bash
sleep 30
curl -s -L -o /tmp/v.html -w "HTTP %{http_code}\n" https://cyvl-relations.vercel.app
grep -c "Explore the graph" /tmp/v.html
curl -s -L -o /tmp/vp.html -w "HTTP %{http_code}\n" https://cyvl-relations.vercel.app/people/p-zip-tessellator
grep -c "Zip Tessellator" /tmp/vp.html
curl -s -L -o /tmp/vs.html -w "HTTP %{http_code}\n" https://cyvl-relations.vercel.app/search
grep -c "Search people or organizations" /tmp/vs.html
```
Expected: all `HTTP 200`, all three greps return `1`. If the homepage still shows the old "in progress" copy, the deploy hasn't propagated — wait another 30 seconds and retry.

If after two minutes the new content isn't live, fall back to a direct CLI deploy:
```bash
vercel --yes --prod
```
That force-pushes the current commit to production.

- [ ] **Step 3: Final report to the user**

Print:
- The new homepage URL: `https://cyvl-relations.vercel.app`
- Two sample profile URLs (one person, one org)
- The `/search` URL
- Note that all data is fictional placeholder content

---

## Self-Review Notes

**Spec coverage (Phase 2):**
- `data/seed.json` with hand-curated demo data → Task 2 (20 people / 10 orgs / 50 edges)
- `/people/[id]` profile pages → Task 6
- `/orgs/[id]` profile pages → Task 7
- `/search` with name/role/org filter → Task 8 (live typeahead, fulfills spec's plain-search requirement and more)
- Replace placeholder homepage with real one that keeps the animated graph → Task 9 (hero + CTA + animation as bg)

**Spec deltas (intentional):**
- Spec mentioned "plain HTML form, no client framework" for search; we use a small client component for live typeahead since you picked that option in brainstorming. Net code delta: ~30 LOC.
- Spec listed "search filter by name, org, role"; this plan ships name + role filter. Filtering by org_id can be added in Phase 3 if requested.

**Placeholder scan:** Removed the messy draft revisions in Task 8 Step 1; the final SearchClient code uses the renamed `entityKind` discriminator and is clean.

**Type consistency:**
- `Entity` discriminator renamed from `kind` → `entityKind` (Task 8 Step 2) to avoid colliding with `Organization.kind` (`OrgKind`).
- `search()` in `lib/graph.ts` updated to emit `entityKind` (Task 8 Step 2).
- Profile pages don't use `Entity`; they use `Person` / `Organization` directly, so they're unaffected.

**Out of scope (Phase 3):**
- Path finder (`/path` page, BFS lib) is explicitly the next phase per the master spec.
