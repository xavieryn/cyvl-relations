import { notFound } from 'next/navigation';
import {
  allOrgs,
  getOrg,
  getPerson,
  neighbors,
} from '@/lib/graph';
import EntityLink from '@/components/EntityLink';

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

  return (
    <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-12 text-white">
      <h1 className="text-4xl font-semibold tracking-tight">{org.name}</h1>
      <p className="mt-2 capitalize text-white/70">{org.kind}</p>

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
                    subtitle={`${edge.kind.replace('_', ' ')}${op.role ? ` — ${op.role}` : ''}`}
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
