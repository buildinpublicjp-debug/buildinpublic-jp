'use client';

import { useGameStore } from '../../stores/gameStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { PHASE_META, scoreToColor } from '../../engine/scoring';
import { MBTI_PROFILES } from '../../engine/mbti';
import { EMOTION_META, EMOTION_KEYS, EmotionState } from '../../engine/emotions';

// MBTI group badges (#040)
function getMbtiBadge(mbti: string): { emoji: string; group: string } {
  const type = mbti.charAt(1); // N/S + T/F combination determines group
  const tf = mbti.charAt(2);
  if (type === 'N' && tf === 'T') return { emoji: '🧠', group: 'Analyst' };
  if (type === 'N' && tf === 'F') return { emoji: '💚', group: 'Diplomat' };
  if (type === 'S' && tf === 'J') return { emoji: '🛡', group: 'Sentinel' };
  // S + P = Explorer
  return { emoji: '🎯', group: 'Explorer' };
}

export function ProfilePanel() {
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const selectPerson = useGameStore(s => s.selectPerson);
  const getPersonById = usePeopleStore(s => s.getPersonById);
  const getRelationshipForPerson = usePeopleStore(s => s.getRelationshipForPerson);
  const getPartner = usePeopleStore(s => s.getPartner);

  if (!selectedPersonId) return null;
  const person = getPersonById(selectedPersonId);
  if (!person) return null;

  const relationship = getRelationshipForPerson(selectedPersonId);
  const partner = getPartner(selectedPersonId);
  const phaseColor = PHASE_META[person.currentPhase].color;
  const mbtiProfile = MBTI_PROFILES[person.mbti];

  return (
    <div
      className="absolute top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-[#0a0a12]/95 backdrop-blur-md border-l border-white/5 overflow-y-auto z-20"
      style={{ animation: 'slideInRight 0.3s ease-out' }}
    >
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={() => selectPerson(null)}
          className="text-white/30 text-xs font-mono mb-3 hover:text-white/50 transition-colors"
        >
          ← CLOSE
        </button>

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-light text-white/90">{person.name.ja}</h2>
            <div className="text-[10px] text-white/30 mt-0.5">{person.name.en} · {person.area}</div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-thin" style={{ color: scoreToColor(person.score) }}>
              {person.score}
            </div>
            <div className="text-[8px] text-white/20">{person.hoursUntilSex}h left</div>
          </div>
        </div>

        {/* Phase badge */}
        <span
          className="text-[8px] tracking-[2px] px-2 py-1 rounded-sm font-mono"
          style={{ color: phaseColor, background: `${phaseColor}15`, border: `1px solid ${phaseColor}33` }}
        >
          {PHASE_META[person.currentPhase].label} · {PHASE_META[person.currentPhase].labelEn}
        </span>

        {/* Basic info */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <InfoBox label="AGE" value={`${person.age}歳`} />
          <InfoBox label="JOB" value={person.job.ja} />
          <InfoBox
            label="MBTI"
            value={`${getMbtiBadge(person.mbti).emoji} ${person.mbti}`}
            sublabel={getMbtiBadge(person.mbti).group}
            color={mbtiProfile?.color}
          />
          <InfoBox label="ATTACHMENT" value={person.attachmentStyle} />
        </div>

        {/* MBTI Detail */}
        {mbtiProfile && (
          <div className="mt-4 p-3 bg-white/[0.02] rounded border border-white/5">
            <div className="text-[8px] tracking-[2px] mb-2" style={{ color: mbtiProfile.color }}>
              {person.mbti} — {mbtiProfile.nickname}
            </div>
            <div className="text-[9px] text-white/40 leading-relaxed">
              💋 {mbtiProfile.foreplayStyle}
            </div>
            <div className="text-[9px] text-white/30 mt-1 leading-relaxed">
              ✋ {mbtiProfile.touch}
            </div>
            <div className="text-[9px] text-white/25 mt-1 leading-relaxed">
              💔 {mbtiProfile.weakness}
            </div>
          </div>
        )}

        {/* Relationship */}
        {relationship && partner && (
          <div className="mt-4 p-3 bg-white/[0.02] rounded border border-white/5">
            <div className="text-[8px] tracking-[2px] text-purple-400/60 mb-2">RELATIONSHIP</div>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="text-[9px] px-2 py-0.5 bg-[#ff0a28]/8 border border-[#ff0a28]/15 rounded-sm text-[#ff0a28]/70">
                {relationship.stage}
              </span>
              <span className="text-[9px] px-2 py-0.5 bg-white/3 border border-white/6 rounded-sm text-white/40">
                {relationship.meetCount}回目
              </span>
            </div>
            <div className="text-[9px] text-white/30">出会い: {relationship.howMet}</div>
            <div className="text-[9px] text-white/30 mt-1">
              相手: {partner.name.ja} ({partner.age}歳 · {partner.mbti})
            </div>
          </div>
        )}

        {/* Situation */}
        <div className="mt-4 p-3 bg-[#ff0a28]/[0.03] border-l-2 border-[#ff0a28]/20 rounded-r">
          <div className="text-[8px] tracking-[2px] text-white/20 mb-1">NOW</div>
          <div className="text-[11px] text-white/70 leading-[1.8] italic font-serif">
            {person.situation}
          </div>
        </div>

        {/* Emotions */}
        <div className="mt-4">
          <div className="text-[8px] tracking-[2px] text-white/15 mb-2">EMOTIONS</div>
          {EMOTION_KEYS.map(key => {
            const value = person.emotions[key];
            if (value < 5) return null;
            const meta = EMOTION_META[key];
            return (
              <div key={key} className="mb-1.5">
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span style={{ color: `${meta.color}88` }}>{meta.label}</span>
                  <span className="text-white/20">{value}</span>
                </div>
                <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${value}%`,
                      background: meta.color,
                      opacity: 0.7,
                      boxShadow: value > 30 ? `0 0 ${Math.floor(value / 10)}px ${meta.color}88, 0 0 ${Math.floor(value / 5)}px ${meta.color}44` : 'none',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Appearance */}
        <div className="mt-4 text-[9px] text-white/20 leading-relaxed">
          {person.appearance.height}cm · {person.appearance.build} · {person.appearance.style}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function InfoBox({ label, value, sublabel, color }: { label: string; value: string; sublabel?: string; color?: string }) {
  return (
    <div className="p-2 bg-white/[0.02] rounded border border-white/5 transition-all hover:bg-white/[0.04] hover:border-white/8">
      <div className="text-[7px] tracking-[1px] text-white/20">{label}</div>
      <div className="text-sm font-light mt-0.5" style={{ color: color || 'rgba(255,255,255,0.6)' }}>
        {value}
      </div>
      {sublabel && (
        <div className="text-[7px] text-white/20 mt-0.5">{sublabel}</div>
      )}
    </div>
  );
}
