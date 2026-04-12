'use client';

import { useGameStore } from '../../stores/gameStore';

export function SwitchOverlay() {
  const switchPhase = useGameStore(s => s.switchPhase);

  return (
    <div
      className={`fixed inset-0 z-30 flex items-center justify-center pointer-events-none transition-all duration-1000 ${
        switchPhase === 'zoom_out' ? 'bg-black/30' : 'bg-transparent'
      }`}
    >
      {switchPhase === 'zoom_out' && (
        <div className="text-white/15 text-[10px] tracking-[5px] font-mono animate-pulse">
          SWITCHING...
        </div>
      )}
    </div>
  );
}
