'use client';

import { useMemo } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { PHASE_META } from '../../engine/scoring';

export function TopBar() {
  const hour = useGameStore(s => s.currentHour);
  const people = usePeopleStore(s => s.people);

  const stats = useMemo(() => {
    const phases = { imminent: 0, critical: 0, escalation: 0, approach: 0, seed: 0 };
    people.forEach(p => { phases[p.currentPhase]++; });
    return phases;
  }, [people]);

  const now = new Date();
  const timeStr = `${String(hour).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isNight = hour >= 21 || hour <= 3;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-auto">
      <div>
        <div className="text-[7px] tracking-[5px] text-[#ff0a28]/40 font-mono">BUILDINPUBLIC.JP</div>
        <div className="text-xs font-light text-white/50 mt-0.5 font-mono">
          TOKYO <span className="text-[#ff0a28]/70">LIVE</span>
        </div>
      </div>

      <div className="text-right">
        <div className={`text-xl font-thin font-mono ${isNight ? 'text-[#ff0a28]/80' : 'text-white/40'}`}>
          {timeStr}
        </div>
        <div className="flex gap-1 mt-1 justify-end">
          {Object.entries(stats).map(([phase, count]) => (
            <span
              key={phase}
              className="text-[7px] font-mono px-1.5 py-0.5 rounded-sm"
              style={{
                color: PHASE_META[phase as keyof typeof PHASE_META].color,
                background: `${PHASE_META[phase as keyof typeof PHASE_META].color}15`,
                border: `1px solid ${PHASE_META[phase as keyof typeof PHASE_META].color}33`,
              }}
            >
              {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
