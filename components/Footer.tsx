import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-white/50 sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="text-white">
            Cyvl <em className="font-serif italic text-[#daff00]">Relations</em>
          </div>
          <div className="mt-1 text-xs text-white/40">
            Fictional demo. No real people. No real cities.
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <Link href="/" className="hover:text-white">
            Home
          </Link>
          <Link href="/search" className="hover:text-white">
            Search
          </Link>
          <a
            href="https://github.com/xavieryn/cyvl-relations"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </footer>
  );
}
