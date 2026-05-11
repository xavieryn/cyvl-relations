# Cyvl Relations — Design Spec

**Date:** 2026-05-11
**Owner:** Xavier Nishikawa
**Status:** Draft (pending review)

## 1. Overview

A free web app, hosted on Vercel, that demonstrates a stripped-down relationship-intelligence concept inspired by RelSci and Affinity. Users can browse a small graph of people and organizations, view profile pages, and find the shortest connection path between any two entities.

Built incrementally. Phase 1 is a placeholder landing page that ships today so it can be shown to the user's boss. Later phases progressively add the real product surface.

## 2. Goals

- Ship a live URL to the user's boss within hours of starting.
- Keep total cost at $0 — Vercel free tier, no paid data sources, no paid DB.
- Demonstrate the *idea* of a relationship-intelligence tool without claiming domain expertise the author does not yet have.
- Build on a stack (Next.js + TypeScript) that can grow into the real product without rewrite.

## 3. Non-Goals

- No real data scraping pipeline in early phases. Seed data is hand-curated and generic (no real CYVL clients or jargon).
- No authentication, accounts, or persistence in Phase 1–3.
- No mobile app. Responsive web only.
- Not trying to compete with RelSci or Affinity. This is a demo.

## 4. Architecture

### Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Graph visualization:** `react-force-graph-2d` (lightweight, sufficient for <500 nodes)
- **Path-finding:** plain in-memory bidirectional BFS on adjacency list (~30 LOC)
- **Data store:** seed JSON file checked into the repo. No database until Phase 4+.
- **Hosting:** Vercel free tier, connected to GitHub repo
- **Repo:** `github.com/<user>/cyvl-relations`, public

### Why this stack

- Next.js + Vercel = zero-config deploy, generous free tier.
- TypeScript catches data-model bugs early once the graph grows.
- In-memory graph is fine up to ~10k nodes. Defer Neo4j / Postgres until real data justifies it.
- `react-force-graph-2d` is small, well-documented, and proven for this use case. Swap to Sigma.js later if perf demands it.

### Modules

1. **Graph store** — typed loader that reads `data/seed.json` and exposes `Person`, `Organization`, `Edge` types plus an adjacency list. Pure, testable.
2. **Path finder** — function `findPath(graph, fromId, toId) -> Edge[] | null`. Bidirectional BFS. Pure, testable.
3. **UI** — Next.js pages: landing, profile, search, path-finder.

Each module has one clear job and a narrow interface. The path finder does not know about the UI. The UI does not know about JSON. Data flows: JSON → graph store → (path finder | UI).

### Data model

```ts
type Person = { id: string; name: string; role?: string; orgIds: string[] };
type Organization = { id: string; name: string; kind: 'city' | 'company' | 'nonprofit' | 'other' };
type Edge = {
  from: string;          // Person.id or Organization.id
  to: string;
  kind: 'works_at' | 'board_of' | 'donated_to' | 'attended' | 'knows';
  note?: string;
};
type GraphData = { people: Person[]; orgs: Organization[]; edges: Edge[] };
```

Edges are undirected for path-finding (treat as bidirectional in BFS). The `kind` field exists for display only in early phases.

## 5. Phase Breakdown

### Phase 1 — Placeholder ship (target: today, 1–2 hr)

**Deliverable:** live URL with animated landing page.

- `npx create-next-app@latest cyvl-relations` (TypeScript, Tailwind, App Router)
- `app/page.tsx`: full-bleed animated network graph background + headline "Cyvl Relations" + subtitle "Relationship intelligence — in progress"
- `components/NetworkBackground.tsx`: ~30 random nodes drifting, edges pulsing. Use `react-force-graph-2d` with random fake data. Cap at ~50 nodes for mobile perf.
- Push to a new public GitHub repo
- Connect repo to Vercel, deploy to production
- Verify live URL works on mobile + desktop

**Success:** boss receives a working URL.

### Phase 2 — Static demo with seed data (3–5 hr)

**Deliverable:** clickable profiles backed by hand-curated JSON.

- `data/seed.json`: ~20 people, ~10 orgs, ~50 edges. Generic names ("City of Springfield", "Acme Civic Tech"). No real CYVL accounts.
- `lib/graph.ts`: loader + adjacency list
- `app/people/[id]/page.tsx`: name, role, org affiliations, list of direct connections
- `app/orgs/[id]/page.tsx`: name, kind, list of affiliated people
- `app/search/page.tsx`: filter people by name, org, role. Plain HTML form, no client framework.
- Replace placeholder landing with a real homepage (still keeps the animated graph as a hero element)

**Success:** can navigate person → org → person via clicks.

### Phase 3 — Path Finder (2–4 hr)

**Deliverable:** "find connection between A and B" feature, the core differentiator.

- `lib/pathfinder.ts`: bidirectional BFS, returns ordered edge list or null
- `lib/pathfinder.test.ts`: unit tests for known paths in seed data
- `app/path/page.tsx`: two combobox inputs (from, to), submit triggers path find, result rendered as horizontal chain + highlighted on graph
- Empty/no-path state, self-path edge case

**Success:** picking two people returns a 1–4 hop chain, visualized.

### Phase 4 — Real data ingestion (later, only if pursued)

**Deliverable:** seed data replaced with rows pulled from one public source.

- Pick **one** public source first (candidates: SAM.gov contract awards, city council member listings, IRS Form 990 nonprofit boards). Defer choice until Phase 1–3 done.
- Write a Node.js ingestion script in `scripts/ingest.ts` that fetches, normalizes, and writes JSON.
- Run manually, commit output. No background jobs yet.
- Add ingestion provenance to each `Edge` (`source: string`).

**Success:** at least 100 real people / orgs in the graph, with citations.

### Phase 5 — Auth + persistence (only if needed)

**Deliverable:** users can save lists, take notes.

- NextAuth with GitHub OAuth (or email magic link via Resend free tier)
- Supabase Postgres free tier for user-scoped data only (graph stays in JSON or moves to Neo4j Aura free tier)
- `/me` page with saved searches, watchlists

**Success:** signed-in user state persists across sessions.

## 6. Risks & Unknowns

- **Vercel free tier limits:** 100 GB bandwidth / month. Plenty for a demo.
- **Animation performance:** force-graph above ~200 nodes can stutter on low-end mobile. Cap node count.
- **Domain credibility:** the user has flagged that they do not fully understand CYVL's market. Seed data must stay generic to avoid misrepresentation. Use placeholder cities, fictional companies.
- **Public-record scraping legality (Phase 4):** public-record data is legal to use but ToS varies. Defer until a real plan exists.
- **Scope creep:** path finder, graph store, and viz are well-understood industry primitives (LinkedIn, Neo4j, Affinity all do them). Resist re-engineering them. Keep the differentiation focused on data + UI, not algorithms.

## 7. Success Criteria

- **Phase 1:** live URL, smooth animation on iPhone Safari + desktop Chrome, boss link sent.
- **Phase 2:** user can click from a person profile to a connected org and back. Search returns relevant results.
- **Phase 3:** given any two people in the seed, the app returns the shortest path or reports no connection.
- **Overall:** all phases through Phase 3 deployable to Vercel free tier with no paid services.

## 8. Industry References

- LinkedIn distributed graph + bidirectional BFS: https://engineering.linkedin.com/real-time-distributed-graph/using-set-cover-algorithm-optimize-query-latency-large-scale-distributed
- Neo4j shortest path for social networks: https://neo4j.com/use-cases/social-network/
- Affinity relationship intelligence: https://www.affinity.co/product/relationship-intelligence
- RelSci platform: https://relsci.com/
- React graph visualization library comparison: https://cambridge-intelligence.com/react-graph-visualization-library/

## 9. Open Questions

- Which public data source for Phase 4? Defer.
- Custom domain or stay on `cyvl-relations.vercel.app`? Default: Vercel subdomain. Buy a domain only if boss wants it.
- Repo visibility: public or private? Default: public (Vercel free tier works with both; public is easier to share).
