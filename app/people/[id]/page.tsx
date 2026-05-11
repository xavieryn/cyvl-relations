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
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-white">
      <div className="border-l-2 border-[#1b79c5] pl-5">
        <Badge kind="person" label="Person" />
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{person.name}</h1>
        {person.role && (
          <p className="mt-2 text-white/70">{person.role}</p>
        )}
      </div>

      {person.description && (
        <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/80">
          {person.description}
        </p>
      )}

      <EntityLinks website={person.website} linkedin={person.linkedin} />

      {orgs.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Affiliations
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {orgs.map((o) => (
              <EntityLink key={o.id} id={o.id} name={o.name} kind="org" subtitle={o.kind} />
            ))}
          </div>
        </section>
      )}

      {connections.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/50">
            Connections
          </h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {connections.map(({ otherId, edge }) => {
              const op = getPerson(otherId);
              const oo = getOrg(otherId);
              if (op) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={op.id}
                    name={op.name}
                    kind="person"
                    subtitle={`${edge.kind.replace('_', ' ')}${edge.note ? ` — ${edge.note}` : ''}`}
                  />
                );
              }
              if (oo) {
                return (
                  <EntityLink
                    key={`${otherId}-${edge.kind}`}
                    id={oo.id}
                    name={oo.name}
                    kind="org"
                    subtitle={`${edge.kind.replace('_', ' ')}${edge.note ? ` — ${edge.note}` : ''}`}
                  />
                );
              }
              return null;
            })}
          </div>
        </section>
      )}
    </main>
  );
}
