import type { ActivityStats } from '@/lib/activities';
import { relativeFromDays } from '@/lib/status';
import ActivityIcon, { activityLabel } from '@/components/ActivityIcon';

type Props = { stats: ActivityStats };

export default function ActivityStatsCard({ stats }: Props) {
  if (stats.total === 0) return null;

  const topKinds = (Object.entries(stats.byKind) as [keyof typeof stats.byKind, number][])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <BigStat
          value={stats.total}
          label="touchpoints"
          accent="text-white"
        />
        <BigStat
          value={
            stats.lastActivityDaysAgo === null
              ? '—'
              : relativeFromDays(stats.lastActivityDaysAgo)
          }
          label="last activity"
        />
        {stats.byKind.email > 0 && (
          <BigStat
            value={`${stats.inboundEmails} ↓ / ${stats.outboundEmails} ↑`}
            label="email flow"
          />
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {topKinds.map(([k, n]) => (
            <span
              key={k}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/70"
            >
              <ActivityIcon kind={k} size={14} />
              {activityLabel(k)}
              <span className="text-white/40">·</span>
              <span className="text-white">{n}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BigStat({
  value,
  label,
  accent = 'text-white',
}: {
  value: number | string;
  label: string;
  accent?: string;
}) {
  return (
    <div className="leading-tight">
      <div className={`text-xl font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}
