'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { allStatuses, STATUS_META } from '@/lib/status';
import type { DealStatus, TeamMember } from '@/lib/types';

type Props = {
  totalCount: number;
  filteredCount: number;
  allIndustries: string[];
  team: TeamMember[];
};

export default function DealsFilterBar({
  totalCount,
  filteredCount,
  allIndustries,
  team,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const activeStatuses = params.getAll('status') as DealStatus[];
  const activeIndustries = params.getAll('industry');
  const activeOwner = params.get('owner') ?? '';
  const activeQuery = params.get('q') ?? '';

  const activeCount =
    activeStatuses.length +
    activeIndustries.length +
    (activeOwner ? 1 : 0) +
    (activeQuery ? 1 : 0);

  function update(updater: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    updater(next);
    startTransition(() => {
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function toggleMulti(key: string, value: string) {
    update((p) => {
      const current = p.getAll(key);
      p.delete(key);
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      for (const v of next) p.append(key, v);
    });
  }

  function setSingle(key: string, value: string) {
    update((p) => {
      if (value) p.set(key, value);
      else p.delete(key);
    });
  }

  function resetAll() {
    startTransition(() => router.push(pathname));
  }

  return (
    <div className="sticky top-12 z-10 mb-6 border-b border-white/5 bg-black/70 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 py-3">
        {/* Filter pill */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
              activeCount > 0
                ? 'border-[#daff00]/50 bg-[#daff00]/10 text-white'
                : 'border-white/20 bg-white/[0.04] text-white/80 hover:border-white/40'
            }`}
          >
            <FilterIcon />
            Filter
            {activeCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#daff00] px-1.5 text-[11px] font-bold text-black">
                {activeCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute left-0 top-full z-20 mt-2 w-[320px] rounded-lg border border-white/15 bg-black/95 p-4 shadow-2xl backdrop-blur">
              {/* Search */}
              <FilterSection label="Search">
                <input
                  type="search"
                  defaultValue={activeQuery}
                  placeholder="Name, location, notes…"
                  onChange={(e) => setSingle('q', e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
              </FilterSection>

              {/* Status */}
              <FilterSection label="Status">
                <div className="flex flex-col gap-1.5">
                  {allStatuses().map((s) => (
                    <label
                      key={s}
                      className="flex cursor-pointer items-center gap-2 text-sm text-white/80"
                    >
                      <input
                        type="checkbox"
                        checked={activeStatuses.includes(s)}
                        onChange={() => toggleMulti('status', s)}
                        className="accent-[#daff00]"
                      />
                      <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dotCls}`} />
                      {STATUS_META[s].label}
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Industry */}
              {allIndustries.length > 0 && (
                <FilterSection label="Industry">
                  <div className="flex flex-wrap gap-1.5">
                    {allIndustries.map((t) => {
                      const active = activeIndustries.includes(t);
                      return (
                        <button
                          key={t}
                          onClick={() => toggleMulti('industry', t)}
                          className={`rounded-md border px-2 py-0.5 text-[11px] transition ${
                            active
                              ? 'border-[#daff00]/60 bg-[#daff00]/15 text-[#daff00]'
                              : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </FilterSection>
              )}

              {/* Owner */}
              <FilterSection label="Owner">
                <select
                  value={activeOwner}
                  onChange={(e) => setSingle('owner', e.target.value)}
                  className="w-full rounded-md border border-white/15 bg-white/[0.05] px-2.5 py-1.5 text-sm text-white outline-none focus:border-white/40"
                >
                  <option value="" className="bg-black">Anyone</option>
                  {team.map((m) => (
                    <option key={m.id} value={m.id} className="bg-black">
                      {m.name}
                    </option>
                  ))}
                </select>
              </FilterSection>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={resetAll}
                  disabled={activeCount === 0}
                  className="text-xs text-white/60 hover:text-white disabled:opacity-30"
                >
                  Reset all
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md border border-white/20 bg-white/[0.05] px-3 py-1 text-xs text-white/85 hover:border-white/40"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeStatuses.map((s) => (
          <Chip
            key={s}
            onRemove={() => toggleMulti('status', s)}
            dot={STATUS_META[s].dotCls}
          >
            {STATUS_META[s].label}
          </Chip>
        ))}
        {activeIndustries.map((t) => (
          <Chip key={t} onRemove={() => toggleMulti('industry', t)}>
            {t}
          </Chip>
        ))}
        {activeOwner && (
          <Chip onRemove={() => setSingle('owner', '')}>
            Owner: {team.find((m) => m.id === activeOwner)?.name ?? activeOwner}
          </Chip>
        )}
        {activeQuery && (
          <Chip onRemove={() => setSingle('q', '')}>“{activeQuery}”</Chip>
        )}

        <div className="ml-auto text-xs text-white/50">
          <span className={pending ? 'opacity-50' : ''}>
            {filteredCount} of {totalCount} organizations
          </span>
        </div>
      </div>
    </div>
  );
}

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
        {label}
      </div>
      {children}
    </div>
  );
}

function Chip({
  children,
  onRemove,
  dot,
}: {
  children: React.ReactNode;
  onRemove: () => void;
  dot?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.05] py-1 pl-2 pr-1 text-xs text-white/80">
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {children}
      <button
        onClick={onRemove}
        aria-label="Remove filter"
        className="ml-0.5 rounded-full px-1 text-white/40 hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </span>
  );
}

function FilterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 4h18l-7 9v5l-4 2v-7L3 4z" />
    </svg>
  );
}
