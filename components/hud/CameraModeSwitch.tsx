'use client';

import { useGameStore } from '../../stores/gameStore';

const MODES = [
  { key: 'fps' as const, label: 'FPS' },
  { key: 'tps' as const, label: 'TPS' },
  { key: 'god' as const, label: 'GOD' },
] as const;

export function CameraModeSwitch() {
  const cameraMode = useGameStore(s => s.cameraMode);
  const setCameraMode = useGameStore(s => s.setCameraMode);

  return (
    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1 pointer-events-auto">
      {MODES.map(m => (
        <button
          key={m.key}
          onClick={() => setCameraMode(m.key)}
          className={`px-3 py-1.5 text-[9px] font-mono tracking-wider rounded-sm backdrop-blur-sm transition-all ${
            cameraMode === m.key
              ? 'bg-[#ff0a28]/15 border border-[#ff0a28]/30 text-[#ff0a28]/90'
              : 'bg-black/40 border border-white/8 text-white/30 hover:text-white/50'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
