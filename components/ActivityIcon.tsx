import type { ActivityKind } from '@/lib/types';

type IconCfg = {
  symbol: string;
  ring: string;
  bg: string;
  text: string;
};

const CFG: Record<ActivityKind, IconCfg> = {
  email: { symbol: '✉', ring: 'ring-[#1b79c5]/40', bg: 'bg-[#1b79c5]/20', text: 'text-[#7ec3f1]' },
  meeting: { symbol: '◎', ring: 'ring-[#ff9e2c]/40', bg: 'bg-[#ff9e2c]/20', text: 'text-[#ffb56a]' },
  'video-call': { symbol: '▶', ring: 'ring-[#daff00]/40', bg: 'bg-[#daff00]/20', text: 'text-[#daff00]' },
  'phone-call': { symbol: '☎', ring: 'ring-[#86877a]/40', bg: 'bg-[#86877a]/20', text: 'text-white/85' },
  'in-person': { symbol: '◆', ring: 'ring-[#05c168]/40', bg: 'bg-[#05c168]/20', text: 'text-[#7ce0a8]' },
  note: { symbol: '✎', ring: 'ring-white/20', bg: 'bg-white/[0.06]', text: 'text-white/70' },
  event: { symbol: '★', ring: 'ring-[#ff9e2c]/40', bg: 'bg-[#ff9e2c]/15', text: 'text-[#ffb56a]' },
};

const LABEL: Record<ActivityKind, string> = {
  email: 'Email',
  meeting: 'Meeting',
  'video-call': 'Video call',
  'phone-call': 'Call',
  'in-person': 'In person',
  note: 'Note',
  event: 'Event',
};

export function activityLabel(kind: ActivityKind): string {
  return LABEL[kind];
}

export default function ActivityIcon({
  kind,
  size = 32,
}: {
  kind: ActivityKind;
  size?: number;
}) {
  const c = CFG[kind];
  return (
    <span
      style={{ width: size, height: size, fontSize: size / 2 }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full ring-2 ${c.ring} ${c.bg} ${c.text}`}
      aria-label={LABEL[kind]}
    >
      {c.symbol}
    </span>
  );
}
