'use client';

import { useMemo, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { PHASE_META, scoreToColor } from '../../engine/scoring';
import { MBTI_PROFILES } from '../../engine/mbti';

export function PersonCardSwiper() {
  const people = usePeopleStore(s => s.getSortedByHoursLeft);
  const selectPerson = useGameStore(s => s.selectPerson);
  const switchToPerson = useGameStore(s => s.switchToPerson);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sorted = useMemo(() => people().slice(0, 30), [people]);

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-auto">
      <div className="bg-gradient-to-t from-black/80 to-transparent pt-8 pb-3 px-2">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sorted.map(person => {
            const isSelected = person.id === selectedPersonId;
            const phaseColor = PHASE_META[person.currentPhase].color;
            const mbtiColor = MBTI_PROFILES[person.mbti]?.color || '#666';

            return (
              <button
                key={person.id}
                onClick={() => switchToPerson(person.id)}
                className={`flex-shrink-0 w-[140px] p-2 rounded-md transition-all font-mono text-left ${
                  isSelected
                    ? 'bg-white/8 border border-white/20'
                    : 'bg-white/3 border border-white/5 hover:bg-white/5'
                }`}
              >
                {/* Phase + Score */}
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-[7px] tracking-wider px-1.5 py-0.5 rounded-sm"
                    style={{ color: phaseColor, background: `${phaseColor}18`, border: `1px solid ${phaseColor}33` }}
                  >
                    {PHASE_META[person.currentPhase].label}
                  </span>
                  <span
                    className="text-sm font-light"
                    style={{ color: scoreToColor(person.score) }}
                  >
                    {person.score}
                  </span>
                </div>

                {/* Name + Age */}
                <div className="text-[10px] text-white/70 truncate">{person.name.ja}</div>

                {/* MBTI + Job */}
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className="text-[8px] px-1 py-0.5 rounded-sm"
                    style={{ color: mbtiColor, background: `${mbtiColor}15`, border: `1px solid ${mbtiColor}33` }}
                  >
                    {person.mbti}
                  </span>
                  <span className="text-[8px] text-white/25 truncate">{person.age}歳 {person.job.ja}</span>
                </div>

                {/* Hours left */}
                <div className="text-[7px] text-white/15 mt-1">{person.hoursUntilSex}h</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
