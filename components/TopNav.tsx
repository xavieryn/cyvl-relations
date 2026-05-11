import Link from 'next/link';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/70 backdrop-blur">
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
