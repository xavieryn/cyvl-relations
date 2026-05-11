export type OrgKind = 'city' | 'company' | 'nonprofit' | 'other';

export type EdgeKind =
  | 'works_at'
  | 'board_of'
  | 'donated_to'
  | 'attended'
  | 'knows';

export type Person = {
  id: string;
  name: string;
  role?: string;
  orgIds: string[];
  description?: string;
  website?: string;
  linkedin?: string;
  avatarUrl?: string;
};

export type Organization = {
  id: string;
  name: string;
  kind: OrgKind;
  description?: string;
  website?: string;
  linkedin?: string;
  avatarUrl?: string;
};

export type Edge = {
  from: string;
  to: string;
  kind: EdgeKind;
  note?: string;
};

export type GraphData = {
  people: Person[];
  orgs: Organization[];
  edges: Edge[];
};

export type Entity =
  | ({ entityKind: 'person' } & Person)
  | ({ entityKind: 'org' } & Organization);
