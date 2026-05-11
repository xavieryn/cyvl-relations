# Phase 1 — Placeholder Ship Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a live Vercel URL of `cyvl-relations` showing an animated network-graph landing page with "Cyvl Relations — Relationship intelligence — in progress."

**Architecture:** Next.js 15 App Router + Tailwind + TypeScript. Single client-only component renders ~30 fake nodes via `react-force-graph-2d`. Layout overlays headline + subtitle on top of full-bleed graph background. No data, no routing beyond `/`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, `react-force-graph-2d`, Vercel, GitHub (via `gh` CLI).

**Working directory:** `/Users/xavieryn/github/cyvl-relations` (nested git repo already initialized; spec already committed).

---

## File Structure (created during Phase 1)

- `package.json` — deps + scripts (created by `create-next-app`)
- `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs` — defaults from `create-next-app`
- `app/layout.tsx` — root layout (generated, lightly modified for title)
- `app/page.tsx` — landing page (overwritten with custom content)
- `app/globals.css` — Tailwind import + body bg color
- `components/NetworkBackground.tsx` — client component, animated graph
- `README.md` — overwritten with project description
- `.gitignore` — defaults from `create-next-app`

`create-next-app` scaffolds most of the above. The plan only spells out files we write by hand.

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: entire Next.js scaffold inside `/Users/xavieryn/github/cyvl-relations/`

- [ ] **Step 1: Confirm working directory is empty except for `docs/` and `.git/`**

Run:
```bash
ls -A /Users/xavieryn/github/cyvl-relations/
```
Expected: only `.git`, `docs` listed.

- [ ] **Step 2: Run `create-next-app` non-interactively**

Run from inside `/Users/xavieryn/github/cyvl-relations/`:
```bash
npx --yes create-next-app@latest . --typescript --tailwind --app --eslint --src-dir=false --import-alias="@/*" --use-npm --turbopack --skip-install
```

Flags explained:
- `.` — install into current directory (must be near-empty; `docs/` and `.git/` are tolerated)
- `--typescript` — TS
- `--tailwind` — Tailwind v4 preset
- `--app` — App Router
- `--src-dir=false` — `app/` at root, not under `src/`
- `--turbopack` — use Turbopack in dev (Next 15 default)
- `--skip-install` — defer install so we can pin/add deps next

Expected output: scaffolds files, ends with "Success!"

- [ ] **Step 3: Install dependencies (npm)**

Run:
```bash
npm install
```
Expected: installs and emits no errors. Vulnerabilities warning OK.

- [ ] **Step 4: Verify the dev server boots**

Run:
```bash
timeout 8 npm run dev 2>&1 | head -20 || true
```
Expected: lines like `▲ Next.js 15.x.x` and `Local: http://localhost:3000`. Kill (timeout does it). If port 3000 busy, set `PORT=3030` and try again.

- [ ] **Step 5: Commit the scaffold**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15 + Tailwind + TS"
```

---

## Task 2: Add `react-force-graph-2d` and types

**Files:**
- Modify: `package.json` (deps)

- [ ] **Step 1: Install runtime dep**

Run:
```bash
npm install react-force-graph-2d
```
Expected: installs without error. `react-force-graph-2d` pulls in `d3-force` and a few small deps.

- [ ] **Step 2: Confirm the dep is in `package.json`**

Run:
```bash
node -e "console.log(require('./package.json').dependencies['react-force-graph-2d'])"
```
Expected: a version string like `^1.27.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-force-graph-2d dep"
```

---

## Task 3: Build the `NetworkBackground` client component

**Files:**
- Create: `components/NetworkBackground.tsx`

- [ ] **Step 1: Create the component**

Write `components/NetworkBackground.tsx` with this exact content:

```tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

type Node = { id: string };
type Link = { source: string; target: string };

function buildGraph(nodeCount: number, edgesPerNode: number) {
  const nodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({ id: `n${i}` }));
  const links: Link[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < nodeCount; i++) {
    for (let k = 0; k < edgesPerNode; k++) {
      const j = Math.floor(Math.random() * nodeCount);
      if (j === i) continue;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: `n${i}`, target: `n${j}` });
    }
  }
  return { nodes, links };
}

export default function NetworkBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const graph = useMemo(() => buildGraph(30, 2), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10"
      aria-hidden="true"
    >
      {size.w > 0 && (
        <ForceGraph2D
          graphData={graph}
          width={size.w}
          height={size.h}
          backgroundColor="#0a0a0f"
          nodeColor={() => '#7dd3fc'}
          nodeRelSize={3}
          linkColor={() => 'rgba(125, 211, 252, 0.25)'}
          linkWidth={1}
          enableZoomInteraction={false}
          enablePanInteraction={false}
          enableNodeDrag={false}
          cooldownTime={Infinity}
          d3VelocityDecay={0.2}
        />
      )}
    </div>
  );
}
```

Notes:
- `dynamic(... { ssr: false })` is required — the lib touches `window` and breaks SSR.
- 30 nodes × 2 edges-each is plenty visually and stays smooth on mobile.
- `cooldownTime={Infinity}` keeps the force simulation gently moving forever (the "alive" look).
- Interactions disabled so the graph stays a background.

- [ ] **Step 2: Commit**

```bash
git add components/NetworkBackground.tsx
git commit -m "feat: add animated NetworkBackground component"
```

---

## Task 4: Wire the landing page

**Files:**
- Modify: `app/page.tsx` (overwrite)
- Modify: `app/layout.tsx` (update metadata)
- Modify: `app/globals.css` (set body bg + font fallback)

- [ ] **Step 1: Overwrite `app/page.tsx` with the landing layout**

```tsx
import NetworkBackground from '@/components/NetworkBackground';

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <NetworkBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Cyvl Relations
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/70 sm:text-lg">
          Relationship intelligence — in progress.
        </p>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx` metadata**

Locate the `metadata` export in `app/layout.tsx` and replace its object with:

```ts
export const metadata: Metadata = {
  title: 'Cyvl Relations',
  description: 'Relationship intelligence — in progress.',
};
```

Keep all surrounding imports and the `RootLayout` component as generated.

- [ ] **Step 3: Make `app/globals.css` body dark**

`create-next-app` generates a `globals.css` whose body uses CSS vars for light/dark. Replace the body rule (or the `:root` + body section) with:

```css
@import "tailwindcss";

html, body {
  background: #0a0a0f;
  color: #ffffff;
}

body {
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
```

If `create-next-app` generated additional CSS variable blocks, delete them — the bg/colors above replace whatever it shipped.

- [ ] **Step 4: Smoke-test in the dev server**

Run:
```bash
timeout 12 npm run dev 2>&1 | tee /tmp/cyvl-dev.log | head -30 &
sleep 5
curl -s -o /tmp/cyvl-page.html -w "HTTP %{http_code}\n" http://localhost:3000/
grep -c "Cyvl Relations" /tmp/cyvl-page.html
kill %1 2>/dev/null || true
```
Expected:
- `HTTP 200`
- `grep` returns `1` (the headline is server-rendered)

If the dev server is busy on port 3000, set `PORT=3030` in both the `npm run dev` and the `curl` calls.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: landing page with animated network background"
```

---

## Task 5: Replace README

**Files:**
- Modify: `README.md` (overwrite)

- [ ] **Step 1: Overwrite `README.md`**

```markdown
# Cyvl Relations

Relationship intelligence — in progress.

A Vercel-hosted demo exploring the idea of a relationship graph for city/government business development. Inspired by RelSci and Affinity, but stripped down: free, public, and small.

## Status

Phase 1: animated landing page. More to come.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind v4
- react-force-graph-2d
- Vercel

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: replace generated README with project description"
```

---

## Task 6: Production build sanity check

**Files:** none modified.

- [ ] **Step 1: Run `next build`**

Run:
```bash
npm run build 2>&1 | tail -30
```
Expected: ends with a route table showing `/` and a "Compiled successfully" / "✓" line. No errors. Warnings about no `metadataBase` are OK.

If the build fails, do NOT proceed. Read the error, fix it, re-run, commit the fix.

- [ ] **Step 2: Run the production server briefly**

Run:
```bash
timeout 8 npm run start 2>&1 | tee /tmp/cyvl-prod.log | head -20 &
sleep 4
curl -s -o /tmp/cyvl-prod.html -w "HTTP %{http_code}\n" http://localhost:3000/
grep -c "Cyvl Relations" /tmp/cyvl-prod.html
kill %1 2>/dev/null || true
```
Expected: `HTTP 200`, `grep` returns `1`.

- [ ] **Step 3: No commit (no source changes).**

---

## Task 7: Push to GitHub

**Files:** none modified locally. Creates remote repo.

**Prereq:** `gh` CLI authenticated. Verify with `gh auth status`. If not, the user must run `gh auth login` interactively first — pause and ask.

- [ ] **Step 1: Verify `gh` auth**

```bash
gh auth status 2>&1 | head -3
```
Expected: `Logged in to github.com as ...`. If not, stop and prompt the user.

- [ ] **Step 2: Create the remote repo and push**

```bash
gh repo create cyvl-relations --public --source=. --remote=origin --push
```
Expected: prints the repo URL, e.g. `https://github.com/<user>/cyvl-relations`. The current branch (likely `master`) is pushed.

If `gh repo create` errors because the repo already exists, run instead:
```bash
gh repo view --json url --jq .url || true
git remote add origin https://github.com/<USER>/cyvl-relations.git
git push -u origin HEAD
```
(Replace `<USER>` with the GitHub username from `gh auth status`.)

- [ ] **Step 3: Confirm the push**

```bash
gh repo view --web=false --json url,defaultBranchRef
```
Expected: JSON with `url` field pointing to the new repo.

---

## Task 8: Deploy to Vercel (production)

**Files:** none modified locally. Creates a Vercel project.

**Prereq:** Vercel CLI installed and authenticated. Check with `vercel whoami`. If not authenticated, run `vercel login` (interactive — pause and ask the user).

- [ ] **Step 1: Install Vercel CLI if missing**

```bash
which vercel || npm install -g vercel
vercel --version
```
Expected: a version number.

- [ ] **Step 2: Authenticate if needed**

```bash
vercel whoami 2>&1 || true
```
If "Error: Not logged in" or similar, **pause** and prompt the user to run `vercel login` interactively, then continue.

- [ ] **Step 3: Link and deploy to production**

Run from project root:
```bash
vercel --yes --prod
```
What this does:
- Detects Next.js framework
- Creates a Vercel project named `cyvl-relations` linked to this directory
- Builds and deploys to production in one go
- Prints the production URL (e.g. `https://cyvl-relations-<hash>-<user>.vercel.app` and the alias `https://cyvl-relations.vercel.app` if available)

Expected: ends with `✅  Production: https://...`.

- [ ] **Step 4: Verify the production URL responds**

Capture the production URL printed by step 3 (also available via `vercel ls --prod | head -5`). Then:

```bash
PROD_URL="<paste the https URL from step 3>"
curl -s -o /tmp/cyvl-vercel.html -w "HTTP %{http_code}\n" "$PROD_URL"
grep -c "Cyvl Relations" /tmp/cyvl-vercel.html
```
Expected: `HTTP 200`, grep returns `1`.

- [ ] **Step 5: Connect the Vercel project to the GitHub repo for auto-deploys**

```bash
vercel link --yes  # idempotent confirmation that .vercel/ exists
vercel git connect 2>&1 || true
```
If `vercel git connect` is interactive in the current CLI version, instruct the user instead: "Open the Vercel dashboard for the `cyvl-relations` project → Settings → Git → Connect to `<user>/cyvl-relations`. Future pushes to the default branch will redeploy automatically."

- [ ] **Step 6: Final report**

Print to the user:
- GitHub repo URL
- Production URL
- Status: ready to send to boss

---

## Self-Review Notes

**Spec coverage (Phase 1 only):**
- Live URL → Tasks 7 + 8
- Animated graph background → Tasks 2 + 3
- Headline + subtitle → Task 4
- Vercel free tier, $0 cost → all tasks (no paid services invoked)
- Smooth on mobile + desktop → 30-node cap + disabled interactions (Task 3)
- Boss link → Task 8 step 6

**Out of scope (later phases):**
- Profile pages, search, path finder, data ingestion, auth — all explicitly Phase 2+ per spec.

**Open prerequisites the user may need to handle interactively:**
- `gh auth login` if `gh` not authenticated
- `vercel login` if Vercel CLI not authenticated

These pause the plan and prompt the user; no automation around browser-based auth.
