'use client';

import { useEffect, useState } from 'react';

type Props = {
  entityKind: 'person' | 'org';
  entityId: string;
  /** Used as the cache key tail — when activity changes, this changes, invalidating the cache. */
  cacheTag?: string;
};

type Status = 'idle' | 'loading' | 'done' | 'error';

type Cached = {
  text: string;
  cachedAt: number;
  tag: string;
};

const CACHE_PREFIX = 'cyvl_persona_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function cacheKey(kind: string, id: string): string {
  return `${CACHE_PREFIX}:${kind}:${id}`;
}

function readCache(kind: string, id: string, tag: string): Cached | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(cacheKey(kind, id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Cached;
    if (parsed.tag !== tag) return null;
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(kind: string, id: string, value: Cached) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(cacheKey(kind, id), JSON.stringify(value));
  } catch {
    /* quota, etc — fine to drop */
  }
}

export default function PersonaCard({ entityKind, entityId, cacheTag = '' }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [text, setText] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [cachedAt, setCachedAt] = useState<number | null>(null);

  useEffect(() => {
    const cached = readCache(entityKind, entityId, cacheTag);
    if (cached) {
      setText(cached.text);
      setCachedAt(cached.cachedAt);
      setStatus('done');
    } else {
      setStatus('idle');
      setText('');
    }
  }, [entityKind, entityId, cacheTag]);

  async function generate() {
    setStatus('loading');
    setText('');
    setErrMsg('');
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityKind, entityId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrMsg(data.message || data.error || 'Something went wrong.');
        setStatus('error');
        return;
      }
      setText(data.text);
      const now = Date.now();
      setCachedAt(now);
      writeCache(entityKind, entityId, { text: data.text, cachedAt: now, tag: cacheTag });
      setStatus('done');
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Network error.');
      setStatus('error');
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#daff00]/30 bg-gradient-to-br from-[#daff00]/[0.08] via-white/[0.02] to-transparent p-5">
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#daff00]/15 blur-3xl" />

      <div className="relative flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#daff00] text-base font-bold text-black">
          ✨
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              AI Relationship Summary
            </h3>
            <span className="rounded-full border border-[#daff00]/30 bg-[#daff00]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#daff00]">
              Beta
            </span>
          </div>
          <p className="mt-1 text-xs text-white/45">
            Claude synthesizes the activity stream into a current-state read on the relationship.
          </p>

          <div className="mt-4">
            {status === 'idle' && (
              <button
                onClick={generate}
                className="inline-flex items-center gap-2 rounded-full bg-[#daff00] px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_28px_-12px_rgba(218,255,0,0.6)] transition hover:bg-[#c8f135]"
              >
                Generate summary →
              </button>
            )}

            {status === 'loading' && (
              <div className="flex items-center gap-3 text-sm text-white/70">
                <span className="inline-flex gap-1">
                  <Dot delay={0} />
                  <Dot delay={150} />
                  <Dot delay={300} />
                </span>
                Reading the activity stream…
              </div>
            )}

            {status === 'done' && (
              <>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/90">
                  {text}
                </p>
                <div className="mt-4 flex items-center gap-3 text-[11px] text-white/40">
                  {cachedAt && (
                    <span>
                      Generated {formatAgo(cachedAt)} · Claude Opus 4.7
                    </span>
                  )}
                  <button
                    onClick={generate}
                    className="ml-auto rounded-md border border-white/15 px-2 py-1 text-white/60 transition hover:border-white/40 hover:text-white"
                  >
                    Regenerate
                  </button>
                </div>
              </>
            )}

            {status === 'error' && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                <div className="font-medium">Couldn&apos;t generate summary.</div>
                <div className="mt-1 text-xs text-red-200/80">{errMsg}</div>
                <button
                  onClick={generate}
                  className="mt-2 rounded-md border border-white/15 px-2 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#daff00]"
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}

function formatAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 30) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
