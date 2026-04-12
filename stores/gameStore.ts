// Main game state — camera mode, selected person, UI state

import { create } from 'zustand';
import type { Phase } from '../engine/scoring';

type CameraMode = 'god' | 'tps' | 'fps';
type SwitchPhase = null | 'zoom_out' | 'zoom_in';
type UIPanel = null | 'profile' | 'scene';

interface GameState {
  // Camera
  cameraMode: CameraMode;
  switchPhase: SwitchPhase;
  setCameraMode: (mode: CameraMode) => void;
  setSwitchPhase: (phase: SwitchPhase) => void;

  // Selection
  selectedPersonId: string | null;
  selectPerson: (id: string | null) => void;
  switchToPerson: (id: string) => void;

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
  cameraMode: 'god',
  switchPhase: null,
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setSwitchPhase: (phase) => set({ switchPhase: phase }),

  selectedPersonId: null,
  selectPerson: (id) => set({ selectedPersonId: id, activePanel: id ? 'profile' : null }),
  switchToPerson: (id) => {
    set({ switchPhase: 'zoom_out' });
    setTimeout(() => {
      set({ selectedPersonId: id, switchPhase: 'zoom_in' });
      setTimeout(() => set({ switchPhase: null }), 2000);
    }, 1500);
  },

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
