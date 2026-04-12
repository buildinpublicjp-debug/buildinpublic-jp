import { create } from 'zustand';

interface TilesLoadingState {
  loading: boolean;
  progress: number; // 0-1
  setLoading: (loading: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useTilesLoadingStore = create<TilesLoadingState>((set) => ({
  loading: true,
  progress: 0,
  setLoading: (loading) => set({ loading }),
  setProgress: (progress) => set({ progress }),
}));
