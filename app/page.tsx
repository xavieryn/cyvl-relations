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
