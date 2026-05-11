export type OrgKind = 'city' | 'company' | 'nonprofit' | 'other';

export type EdgeKind =
  | 'works_at'
  | 'board_of'
  | 'donated_to'
  | 'attended'
  | 'knows';

export type DealStatus =
  | 'prospect'
  | 'discovery'
  | 'pilot-discussion'
  | 'proposal-sent'
  | 'contract-signed'
  | 'active-customer'
  | 'passed'
  | 'on-hold';

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
};

export type ActivityKind =
  | 'email'
  | 'meeting'
  | 'video-call'
  | 'phone-call'
  | 'in-person'
  | 'note'
  | 'event';

export type ActivitySentiment = 'positive' | 'neutral' | 'concern';

export type Activity = {
  id: string;
  kind: ActivityKind;
  /** ISO date. Time-of-day optional; defaults to noon if absent. */
  at: string;
  /** Primary person this activity is about. */
  personId: string;
  /** Organization context, if any. */
  orgId?: string;
  /** Internal teammate who logged / participated in the activity. */
  ownerId?: string;
  /** Short one-line summary shown in the timeline. */
  summary: string;
  /** Optional longer body / preview. */
  detail?: string;
  /** Other person IDs that participated (e.g., colleagues, intros). */
  participantIds?: string[];
  /** Affective tone, used for accent coloring. */
  sentiment?: ActivitySentiment;
  /** For emails. */
  direction?: 'inbound' | 'outbound';
};

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
  // Pipeline / deal-flow fields
  status?: DealStatus;
  statusSince?: string;       // ISO date
  lastContacted?: string;     // ISO date
  ownerId?: string;           // TeamMember.id
  mainContactId?: string;     // Person.id
  sourceOfIntroductionId?: string; // Person.id or TeamMember.id
  location?: string;
  industry?: string[];
  notes?: string;
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
