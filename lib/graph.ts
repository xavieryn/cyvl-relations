import seedJson from '../data/seed.json';
import type {
  GraphData,
  Person,
  Organization,
  Edge,
  Entity,
} from './types';

const graph = seedJson as GraphData;

const peopleById = new Map<string, Person>(
  graph.people.map((p) => [p.id, p]),
);
const orgsById = new Map<string, Organization>(
  graph.orgs.map((o) => [o.id, o]),
);

type Neighbor = { otherId: string; edge: Edge };
const adjacency = new Map<string, Neighbor[]>();

for (const e of graph.edges) {
  if (!adjacency.has(e.from)) adjacency.set(e.from, []);
  if (!adjacency.has(e.to)) adjacency.set(e.to, []);
  adjacency.get(e.from)!.push({ otherId: e.to, edge: e });
  adjacency.get(e.to)!.push({ otherId: e.from, edge: e });
}

export function getPerson(id: string): Person | undefined {
  return peopleById.get(id);
}

export function getOrg(id: string): Organization | undefined {
  return orgsById.get(id);
}

export function neighbors(id: string): Neighbor[] {
  return adjacency.get(id) ?? [];
}

export function allPeople(): Person[] {
  return graph.people;
}

export function allOrgs(): Organization[] {
  return graph.orgs;
}

export function entityKind(id: string): 'person' | 'org' | null {
  if (peopleById.has(id)) return 'person';
  if (orgsById.has(id)) return 'org';
  return null;
}

export function search(query: string): Entity[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: Entity[] = [];
  for (const p of graph.people) {
    if (
      p.name.toLowerCase().includes(q) ||
      (p.role?.toLowerCase().includes(q) ?? false)
    ) {
      results.push({ entityKind: 'person', ...p });
    }
  }
  for (const o of graph.orgs) {
    if (o.name.toLowerCase().includes(q)) {
      results.push({ entityKind: 'org', ...o });
    }
  }
  return results;
}
