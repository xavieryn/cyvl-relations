'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NotificationCounts } from '@/lib/notifications';

type Props = {
  notifications: NotificationCounts;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  match: (path: string) => boolean;
};

type SavedView = {
  label: string;
  href: string;
  hint?: string;
};

const PRIMARY_NAV: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    match: (p) => p === '/',
    icon: <IconHome />,
  },
  {
    label: 'Deals',
    href: '/deals',
    match: (p) => p === '/deals' || p.startsWith('/deals?'),
    icon: <IconTable />,
  },
  {
    label: 'People',
    href: '/people',
    match: (p) => p === '/people' || p.startsWith('/people/'),
    icon: <IconUsers />,
  },
  {
    label: 'Search',
    href: '/search',
    match: (p) => p.startsWith('/search'),
    icon: <IconSearch />,
  },
];

const SAVED_VIEWS: SavedView[] = [
  { label: 'All organizations', href: '/deals' },
  { label: 'My pipeline', href: '/deals?owner=t-self', hint: 'You own' },
  { label: 'Active customers', href: '/deals?status=active-customer' },
  { label: 'Hot pilots', href: '/deals?status=pilot-discussion&status=proposal-sent' },
];

export default function Sidebar({ notifications }: Props) {
  const pathname = usePathname() ?? '/';

  return (
    <aside className="sticky top-0 h-screen w-64 shrink-0 overflow-y-auto border-r border-white/10 bg-black/70 backdrop-blur">
      <div className="flex h-full flex-col px-4 py-5">
        {/* Brand */}
        <Link
          href="/"
          className="mb-5 flex items-center gap-2 px-2 text-sm font-semibold tracking-tight text-white"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-[#daff00] text-xs font-bold text-black">
            C
          </span>
          <span>
            Cyvl <em className="font-serif italic text-[#daff00]">Relations</em>
          </span>
        </Link>

        {/* Search shortcut */}
        <Link
          href="/search"
          className="mb-5 flex items-center justify-between rounded-md border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55 transition hover:border-white/30 hover:bg-white/[0.07] hover:text-white/80"
        >
          <span className="flex items-center gap-2">
            <IconSearch />
            Search
          </span>
          <span className="rounded border border-white/15 px-1.5 py-0.5 text-[10px] text-white/40">
            ⌘K
          </span>
        </Link>

        {/* Primary nav */}
        <nav className="space-y-0.5">
          {PRIMARY_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={item.match(pathname)}
            />
          ))}
        </nav>

        {/* Notifications */}
        <SidebarSection title="Notifications">
          <NotifLink
            href="/deals?stale=1"
            label="Stale accounts"
            count={notifications.staleAccounts}
            dot="bg-[#ff9e2c]"
          />
          <NotifLink
            href="/deals?unanswered=1"
            label="Unanswered emails"
            count={notifications.unansweredEmails}
            dot="bg-[#1b79c5]"
          />
          <NotifLink
            href="/deals?status=active-customer"
            label="Renewals due"
            count={notifications.renewalsDue}
            dot="bg-[#daff00]"
          />
        </SidebarSection>

        {/* Saved views */}
        <SidebarSection title="Saved Views">
          {SAVED_VIEWS.map((v) => (
            <Link
              key={v.label}
              href={v.href}
              className="block rounded-md px-2 py-1.5 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white"
            >
              <span className="flex items-center justify-between">
                <span className="truncate">{v.label}</span>
                {v.hint && (
                  <span className="text-[10px] uppercase tracking-wider text-white/35">
                    {v.hint}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </SidebarSection>

        {/* Bottom: settings + version */}
        <div className="mt-auto pt-4">
          <SidebarLink
            href="/settings"
            icon={<IconCog />}
            label="Settings"
            active={pathname.startsWith('/settings')}
          />
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/35">
            <span>Demo · v0.2</span>
            <a
              href="https://github.com/xavieryn/cyvl-relations"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/70"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition ${
        active
          ? 'bg-white/[0.08] text-white'
          : 'text-white/70 hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      <span className={active ? 'text-[#daff00]' : 'text-white/50'}>{icon}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function NotifLink({
  href,
  label,
  count,
  dot,
}: {
  href: string;
  label: string;
  count: number;
  dot: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-white/75 transition hover:bg-white/[0.06] hover:text-white"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
        <span className="truncate">{label}</span>
      </span>
      {count > 0 ? (
        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/10 px-1.5 text-[11px] font-semibold text-white">
          {count}
        </span>
      ) : (
        <span className="text-[11px] text-white/30">0</span>
      )}
    </Link>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {title}
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

/* --- Inline icons (16px) --- */

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  );
}
function IconTable() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 10h18M9 4v16" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
function IconCog() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09c0 .66.39 1.26 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82c.25.61.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09c-.66 0-1.26.39-1.51 1z" />
    </svg>
  );
}
