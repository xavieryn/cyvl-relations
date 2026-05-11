import { notFound } from 'next/navigation';
import {
  allOrgs,
  getOrg,
  getPerson,
  neighbors,
} from '@/lib/graph';
import { activitiesForOrg, computeStats } from '@/lib/activities';
import EntityLink from '@/components/EntityLink';
import EntityLinks from '@/components/EntityLinks';
import Badge from '@/components/Badge';
import Avatar from '@/components/Avatar';
import EdgeChip from '@/components/EdgeChip';
import ActivityTimeline from '@/components/ActivityTimeline';
import ActivityStatsCard from '@/components/ActivityStats';

export const dynamicParams = false;

export function generateStaticParams() {
  return allOrgs().map((o) => ({ id: o.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function OrgPage({ params }: PageProps) {
  const { id } = await params;
  const org = getOrg(id);
  if (!org) notFound();

  const connections = neighbors(org.id);
  const activities = activitiesForOrg(org.id);
  const stats = computeStats(activities);

  return (
    <main className="relative z-10">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#ff9e2c]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-[#ff9e2c]/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12 text-white">
          <div className="flex items-start gap-5">
            <Avatar src={org.avatarUrl} name={org.name} kind="org" size={88} />
            <div className="min-w-0">
              <Badge kind="org" label={`Organization · ${org.kind}`} />
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                {org.name}
              </h1>
            </div>
          </div>

          {org.description && (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/80">
              {org.description}
            </p>
          )}

          <EntityLinks website={org.website} linkedin={org.linkedin} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-white">
        {activities.length > 0 && (
          <section className="mb-10">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                Activity &amp; Relationship
              </h2>
              <span className="text-[11px] text-white/35">
                Fictional activity for demo
              </span>
            </div>
            <div className="mb-5">
              <ActivityStatsCard stats={stats} />
            </div>
            <ActivityTimeline activities={activities} />
          </section>
        )}

        {connections.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              Connections <span className="ml-1 text-white/30">({connections.length})</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {connections.map(({ otherId, edge }) => {
                const op = getPerson(otherId);
                const oo = getOrg(otherId);
                const target = op ?? oo;
                if (!target) return null;
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={target.id}
                    name={target.name}
                    kind={op ? 'person' : 'org'}
                    subtitle={edge.note ?? (op?.role ?? (oo ? oo.kind : ''))}
                    badge={<EdgeChip kind={edge.kind} />}
                  />
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
