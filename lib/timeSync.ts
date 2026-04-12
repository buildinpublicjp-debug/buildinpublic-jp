// Real-time clock sync — updates gameStore.currentHour every minute
// Also provides time-of-day phase for background/lighting changes

export type TimeOfDay = 'night' | 'dawn' | 'morning' | 'afternoon' | 'evening' | 'dusk';

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 0 && hour < 5) return 'night';
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'dusk';
  if (hour >= 19 && hour < 21) return 'evening';
  return 'night';
}

export interface TimeTheme {
  bg: string;       // CSS background gradient
  overlay: number;  // overlay opacity 0-1
  warmth: number;   // color temperature shift 0-1
}

const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
  night:     { bg: 'linear-gradient(180deg, #0a0a2e 0%, #1a1a3e 100%)', overlay: 0.7, warmth: 0 },
  dawn:      { bg: 'linear-gradient(180deg, #2d1b4e 0%, #e8a87c 100%)', overlay: 0.3, warmth: 0.4 },
  morning:   { bg: 'linear-gradient(180deg, #87ceeb 0%, #e0f0ff 100%)', overlay: 0.0, warmth: 0.2 },
  afternoon: { bg: 'linear-gradient(180deg, #5ba3d9 0%, #f0e6d2 100%)', overlay: 0.0, warmth: 0.5 },
  dusk:      { bg: 'linear-gradient(180deg, #ff6b6b 0%, #ffa07a 50%, #2d1b4e 100%)', overlay: 0.2, warmth: 0.8 },
  evening:   { bg: 'linear-gradient(180deg, #1a1a3e 0%, #2d1b4e 100%)', overlay: 0.5, warmth: 0.3 },
};

export function getTimeTheme(hour: number): TimeTheme {
  return TIME_THEMES[getTimeOfDay(hour)];
}

let timeSyncInterval: ReturnType<typeof setInterval> | null = null;

export function startTimeSync(setCurrentHour: (hour: number) => void): () => void {
  setCurrentHour(new Date().getHours());

  timeSyncInterval = setInterval(() => {
    setCurrentHour(new Date().getHours());
  }, 60_000);

  return () => {
    if (timeSyncInterval) {
      clearInterval(timeSyncInterval);
      timeSyncInterval = null;
    }
  };
}
