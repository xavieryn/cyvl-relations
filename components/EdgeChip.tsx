import type { EdgeKind } from '@/lib/types';

const STYLES: Record<EdgeKind, { label: string; cls: string }> = {
  works_at: {
    label: 'Works at',
    cls: 'border-[#1b79c5]/40 bg-[#1b79c5]/12 text-[#7ec3f1]',
  },
  board_of: {
    label: 'Board of',
    cls: 'border-[#daff00]/40 bg-[#daff00]/12 text-[#daff00]',
  },
  donated_to: {
    label: 'Donated to',
    cls: 'border-[#05c168]/40 bg-[#05c168]/12 text-[#7ce0a8]',
  },
  attended: {
    label: 'Attended',
    cls: 'border-[#ff9e2c]/40 bg-[#ff9e2c]/12 text-[#ffb56a]',
  },
  knows: {
    label: 'Knows',
    cls: 'border-white/20 bg-white/[0.06] text-white/65',
  },
};

export default function EdgeChip({ kind }: { kind: EdgeKind }) {
  const s = STYLES[kind];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
