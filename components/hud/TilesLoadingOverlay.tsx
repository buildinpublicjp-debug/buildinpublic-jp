'use client';

import { useTilesLoadingStore } from '../../stores/tilesLoadingStore';

export function TilesLoadingOverlay() {
  const loading = useTilesLoadingStore(s => s.loading);
  const progress = useTilesLoadingStore(s => s.progress);

  if (!loading) return null;

  const pct = Math.round(progress * 100);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-500"
      style={{ opacity: progress > 0.95 ? 0 : 1 }}
    >
      <div className="text-center">
        <div className="text-[#ff0a28] text-[10px] tracking-[4px] font-mono mb-3">
          LOADING SHIBUYA...
        </div>

        {/* Progress bar */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mx-auto">
          <div
            className="h-full bg-[#ff0a28] rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="text-white/20 text-[8px] tracking-[2px] font-mono mt-2">
          {pct}%
        </div>
      </div>
    </div>
  );
}
