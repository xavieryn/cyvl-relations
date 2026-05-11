import { describe, it, expect } from 'vitest';
import {
  getPerson,
  getOrg,
  neighbors,
  search,
  getMainContact,
  getSourcePerson,
} from './graph';

describe('graph lib', () => {
  it('looks up a known person by id', () => {
    const p = getPerson('p-zip-tessellator');
    expect(p?.name).toBe('Zip Tessellator');
  });

  it('returns undefined for unknown person id', () => {
    expect(getPerson('p-does-not-exist')).toBeUndefined();
  });

  it('looks up a known org by id', () => {
    const o = getOrg('o-pixelville');
    expect(o?.name).toBe('City of Pixelville');
  });

  it('returns undefined for unknown org id', () => {
    expect(getOrg('o-fake')).toBeUndefined();
  });

  it('returns symmetric neighbors for a person with edges', () => {
    const ns = neighbors('p-zip-tessellator');
    const targets = ns.map((n) => n.otherId);
    expect(targets).toContain('o-pixelville');
    expect(targets).toContain('p-mira-cogsworth');
    expect(targets).toContain('p-lark-bandit');
  });

  it('returns empty list for unknown entity id', () => {
    expect(neighbors('nope')).toEqual([]);
  });

  it('search matches case-insensitively across people and orgs', () => {
    const r = search('PIXEL');
    const ids = r.map((e) => e.id);
    expect(ids).toContain('o-pixelville');
    expect(ids).toContain('p-bea-pixelton');
  });

  it('search returns an empty array for empty query', () => {
    expect(search('')).toEqual([]);
  });

  it('search returns an empty array for a no-hit query', () => {
    expect(search('zzzzzzz')).toEqual([]);
  });

  it('getMainContact returns the pinned person for an org', () => {
    const org = getOrg('o-pixelville');
    expect(org).toBeDefined();
    expect(getMainContact(org!)?.id).toBe('p-zip-tessellator');
  });

  it('getMainContact returns undefined when mainContactId missing', () => {
    expect(getMainContact({ id: 'o-x', name: 'X', kind: 'other' })).toBeUndefined();
  });

  it('getSourcePerson returns the pinned source person', () => {
    const org = getOrg('o-pixelville');
    expect(getSourcePerson(org!)?.id).toBe('p-mira-cogsworth');
  });
});
