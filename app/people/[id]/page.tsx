import { notFound } from 'next/navigation';
import {
  allPeople,
  getPerson,
  getOrg,
  neighbors,
} from '@/lib/graph';
import EntityLink from '@/components/EntityLink';
import EntityLinks from '@/components/EntityLinks';
import Badge from '@/components/Badge';
import Avatar from '@/components/Avatar';
import EdgeChip from '@/components/EdgeChip';

export const dynamicParams = false;

export function generateStaticParams() {
  return allPeople().map((p) => ({ id: p.id }));
}

type PageProps = { params: Promise<{ id: string }> };

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();

  const orgs = person.orgIds.map(getOrg).filter((o) => o !== undefined);
  const connections = neighbors(person.id);

  return (
    <main className="relative z-10">
      <div className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#1b79c5]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-[#1b79c5]/10 blur-3xl" />
        <div className="relative mx-auto w-full max-w-5xl px-6 py-12 text-white">
          <div className="flex items-start gap-5">
            <Avatar src={person.avatarUrl} name={person.name} kind="person" size={88} />
            <div className="min-w-0">
              <Badge kind="person" label="Person" />
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                {person.name}
              </h1>
              {person.role && (
                <p className="mt-2 text-white/70">{person.role}</p>
              )}
            </div>
          </div>

          {person.description && (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/80">
              {person.description}
            </p>
          )}

          <EntityLinks website={person.website} linkedin={person.linkedin} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-white">
        {orgs.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
              Affiliations
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {orgs.map((o) => (
                <EntityLink
                  key={o.id}
                  id={o.id}
                  name={o.name}
                  kind="org"
                  subtitle={o.kind}
                />
              ))}
            </div>
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
