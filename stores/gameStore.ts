// Main game state — camera mode, selected person, UI state

import { create } from 'zustand';
import type { Phase } from '../engine/scoring';

type CameraMode = 'god' | 'tps' | 'fps';
export type ViewMode = 'god' | 'cross-section' | 'scene';
type SwitchPhase = null | 'zoom_out' | 'zoom_in';
type UIPanel = null | 'profile' | 'scene';

interface FlyTarget {
  lat: number;
  lng: number;
  startTime: number;
}

interface GameState {
  // View
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedAreaId: string | null;
  selectArea: (areaId: string | null) => void;

  // Camera
  cameraMode: CameraMode;
  switchPhase: SwitchPhase;
  setCameraMode: (mode: CameraMode) => void;
  setSwitchPhase: (phase: SwitchPhase) => void;

  // Selection
  selectedPersonId: string | null;
  selectPerson: (id: string | null) => void;
  switchToPerson: (id: string) => void;

  // Fly
  flyTarget: FlyTarget | null;
  setFlyTarget: (target: FlyTarget | null) => void;

  // UI
  activePanel: UIPanel;
  setActivePanel: (panel: UIPanel) => void;
  showStats: boolean;
  toggleStats: () => void;

  // Filter
  phaseFilter: Phase | 'all';
  setPhaseFilter: (filter: Phase | 'all') => void;

  // Time
  currentHour: number;
  setCurrentHour: (hour: number) => void;

  // Language
  language: 'ja' | 'en';
  setLanguage: (lang: 'ja' | 'en') => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  viewMode: 'god',
  setViewMode: (mode) => set({ viewMode: mode }),
  selectedAreaId: null,
  selectArea: (areaId) => set({ selectedAreaId: areaId, viewMode: areaId ? 'cross-section' : 'god' }),

  cameraMode: 'god',
  switchPhase: null,
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSwitchPhase: (phase) => set({ switchPhase: phase }),

  selectedPersonId: null,
  selectPerson: (id) => set({ selectedPersonId: id, activePanel: id ? 'profile' : null }),
  switchToPerson: (id) => {
    const { usePeopleStore } = require('../stores/peopleStore');
    const person = usePeopleStore.getState().getPersonById(id);
    if (person) {
      set({
        selectedPersonId: id,
        activePanel: 'profile',
        flyTarget: { lat: person.lat, lng: person.lng, startTime: Date.now() },
      });
    }
  },

  flyTarget: null,
  setFlyTarget: (target) => set({ flyTarget: target }),

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),
  showStats: false,
  toggleStats: () => set(s => ({ showStats: !s.showStats })),

  phaseFilter: 'all',
  setPhaseFilter: (filter) => set({ phaseFilter: filter }),

  currentHour: new Date().getHours(),
  setCurrentHour: (hour) => set({ currentHour: hour }),

  language: 'ja',
  setLanguage: (lang) => set({ language: lang }),
}));
