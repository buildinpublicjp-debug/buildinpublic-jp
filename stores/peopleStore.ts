// People store — 300 AI persons + relationships

import { create } from 'zustand';
import { AIPerson, Relationship, generateAllPeople, generateRelationships } from '../engine/personGenerator';
import type { Phase } from '../engine/scoring';

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
}));
