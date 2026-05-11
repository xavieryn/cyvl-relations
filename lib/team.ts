import teamJson from '../data/team.json';
import type { TeamMember } from './types';

const team = (teamJson.members as TeamMember[]) ?? [];

const byId = new Map<string, TeamMember>(team.map((m) => [m.id, m]));

export function allTeam(): TeamMember[] {
  return team;
}

export function getTeamMember(id: string): TeamMember | undefined {
  return byId.get(id);
}
