import { STATUS_META } from '@/lib/status';
import type { DealStatus } from '@/lib/types';

type Props = { status?: DealStatus; size?: 'sm' | 'md' };

export default function StatusPill({ status, size = 'sm' }: Props) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/40">
        —
      </span>
    );
  }
  const meta = STATUS_META[status];
  const padding = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider ${padding} ${meta.chipCls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dotCls}`} />
      {meta.label}
    </span>
  );
}
