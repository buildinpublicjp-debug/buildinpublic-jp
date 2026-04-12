// People store — 300 AI persons + relationships

import { create } from 'zustand';
import { AIPerson, Relationship, generateAllPeople, generateRelationships } from '../engine/personGenerator';
import type { Phase } from '../engine/scoring';
import type { District } from '../data/areas';
import { CROSS_SECTION_SLOTS } from '../data/areas';

export interface CoupleData {
  relationship: Relationship;
  personA: AIPerson;
  personB: AIPerson;
}

interface PeopleState {
  people: AIPerson[];
  relationships: Relationship[];
  initialized: boolean;

  initialize: () => void;
  getPersonById: (id: string) => AIPerson | undefined;
  getRelationshipForPerson: (id: string) => Relationship | undefined;
  getPartner: (personId: string) => AIPerson | undefined;
  getPeopleByPhase: (phase: Phase | 'all') => AIPerson[];
  getSortedByHoursLeft: () => AIPerson[];
  getCrossSectionCouples: () => CoupleData[];
  getCouplesByDistrict: (district: District) => CoupleData[];
  getMvpRelationshipIds: () => Set<string>;
}

export const usePeopleStore = create<PeopleState>((set, get) => ({
  people: [],
  relationships: [],
  initialized: false,

  initialize: () => {
    if (get().initialized) return;
    const people = generateAllPeople(300);
    const relationships = generateRelationships(people);
    set({ people, relationships, initialized: true });
  },

  getPersonById: (id) => get().people.find(p => p.id === id),

  getRelationshipForPerson: (id) =>
    get().relationships.find(r => r.personA === id || r.personB === id),

  getPartner: (personId) => {
    const rel = get().getRelationshipForPerson(personId);
    if (!rel) return undefined;
    const partnerId = rel.personA === personId ? rel.personB : rel.personA;
    return get().getPersonById(partnerId);
  },

  getPeopleByPhase: (phase) => {
    if (phase === 'all') return get().people;
    return get().people.filter(p => p.currentPhase === phase);
  },

  getSortedByHoursLeft: () =>
    [...get().people].sort((a, b) => a.hoursUntilSex - b.hoursUntilSex),

  getCrossSectionCouples: () => {
    const rels = get().relationships;
    const slots = CROSS_SECTION_SLOTS;
    return slots.map(slot => {
      const rel = rels[slot.coupleIndex % rels.length];
      const personA = get().getPersonById(rel.personA);
      const personB = get().getPersonById(rel.personB);
      return { relationship: rel, personA: personA!, personB: personB! };
    });
  },

  getCouplesByDistrict: (district) => {
    const all = get().getCrossSectionCouples();
    const slots = CROSS_SECTION_SLOTS;
    return all.filter((_, i) => slots[i].district === district);
  },

  getMvpRelationshipIds: () => {
    const rels = get().relationships;
    const ids = new Set<string>();
    for (const slot of CROSS_SECTION_SLOTS) {
      const rel = rels[slot.coupleIndex % rels.length];
      if (rel) ids.add(rel.id);
    }
    return ids;
  },
}));
