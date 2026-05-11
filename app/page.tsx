import Link from 'next/link';
import NetworkBackground from '@/components/NetworkBackground';
import { allPeople, allOrgs } from '@/lib/graph';
import seed from '@/data/seed.json';

export default function Page() {
  const peopleCount = allPeople().length;
  const orgCount = allOrgs().length;
  const edgeCount = seed.edges.length;

  return (
    <>
      <NetworkBackground />
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
        <div className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#daff00]/10 blur-3xl" />

        <div className="relative">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-[#daff00]/80">
            Relationship Intelligence Demo
          </p>
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
            Cyvl <em className="font-serif italic text-[#daff00]">Relations</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            A relationship graph for city &amp; civic-sector business development. Find the warm path between people and organizations &mdash; without cold-calling.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
            <Stat n={peopleCount} label="People" />
            <Dot />
            <Stat n={orgCount} label="Organizations" />
            <Dot />
            <Stat n={edgeCount} label="Connections" />
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/deals"
              className="inline-flex items-center rounded-full bg-[#daff00] px-7 py-3.5 text-sm font-semibold text-black shadow-[0_8px_28px_-8px_rgba(218,255,0,0.5)] transition hover:bg-[#c8f135] hover:shadow-[0_10px_32px_-6px_rgba(218,255,0,0.7)]"
              style={{ borderRadius: '48px' }}
            >
              View deals →
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/80 transition hover:border-white/50 hover:text-white"
              style={{ borderRadius: '48px' }}
            >
              Search people
            </Link>
          </div>

          <p className="mt-8 text-xs text-white/40">
            All data shown is fictional placeholder content. No real people. No real cities.
          </p>
        </div>
      </main>
    </>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span>
      <span className="font-semibold text-white">{n}</span>{' '}
      <span className="text-white/50">{label}</span>
    </span>
  );
}

function Dot() {
  return <span className="text-white/20">·</span>;
}
