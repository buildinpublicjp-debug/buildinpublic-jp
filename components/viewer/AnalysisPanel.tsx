'use client'

import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CoupleData } from '@/stores/peopleStore'
import { PHASE_META, type Phase } from '@/engine/scoring'
import { EMOTION_META, type EmotionState } from '@/engine/emotions'
import type { InteractionMode } from '@/stores/gameStore'

// Top emotions to display
const DISPLAY_EMOTIONS: (keyof EmotionState)[] = [
  'desire', 'trust', 'excitement', 'vulnerability', 'tenderness', 'anxiety',
]

// Phase-specific choices for PLAY mode
const PHASE_CHOICES: Record<Phase, { text: string; hint: string; emoji: string }[]> = {
  seed: [
    { text: 'LINEを送る', hint: '偶然を装ったメッセージ', emoji: '📱' },
    { text: '待たせる', hint: '既読スルーで焦らす', emoji: '⏳' },
    { text: '偶然を装う', hint: '同じ場所に現れる', emoji: '🎭' },
  ],
  approach: [
    { text: '隣に座らせる', hint: '距離を縮める一手', emoji: '🪑' },
    { text: '2杯目を注文', hint: 'もう少しここにいよう', emoji: '🍷' },
    { text: '店を出させる', hint: '次の場所へ誘導', emoji: '🚶' },
  ],
  escalation: [
    { text: '手を触れさせる', hint: '偶然のような接触', emoji: '✋' },
    { text: '秘密を打ち明ける', hint: '親密さの扉を開く', emoji: '🤫' },
    { text: '嫉妬させる', hint: '他の異性の話題', emoji: '💢' },
  ],
  critical: [
    { text: '終電を逃させる', hint: '時間の制約を解除', emoji: '🚃' },
    { text: 'タクシーに乗せる', hint: '2人きりの密室', emoji: '🚕' },
    { text: '一度引かせる', hint: '緊張と緩和の演出', emoji: '↩️' },
  ],
  imminent: [
    { text: '照明を落とす', hint: '空間を変える', emoji: '🌙' },
    { text: '音楽をかける', hint: 'ムードを整える', emoji: '🎵' },
    { text: '見つめさせる', hint: '言葉を止める', emoji: '👁️' },
  ],
}

interface Props {
  couple: CoupleData
  score: number
  chemistry: { score: number; desc: string; dynamic: string }
  phase: Phase
  interactionMode: InteractionMode
  onChoice?: (choiceIndex: number) => void
}

export const AnalysisPanel = memo(function AnalysisPanel({
  couple,
  score,
  chemistry,
  phase,
  interactionMode,
  onChoice,
}: Props) {
  const [chosenIndex, setChosenIndex] = useState<number | null>(null)
  const phaseMeta = PHASE_META[phase]
  const choices = PHASE_CHOICES[phase]

  const handleChoice = (i: number) => {
    setChosenIndex(i)
    onChoice?.(i)
    setTimeout(() => setChosenIndex(null), 2000)
  }

  return (
    <div
      className="mx-3 rounded-t-xl overflow-hidden"
      style={{
        background: 'rgba(8,8,16,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderBottom: 'none',
      }}
    >
      <div className="px-4 pt-4 pb-3">
        {/* Score + Phase + Chemistry row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Score circle */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="absolute inset-0" viewBox="0 0 40 40">
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="2"
                />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke={phaseMeta.color}
                  strokeWidth="2"
                  strokeDasharray={`${score} ${100 - score}`}
                  strokeDashoffset="25"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <span
                className="text-[11px] font-mono font-bold"
                style={{ color: phaseMeta.color }}
              >
                {score}
              </span>
            </div>

            <div>
              <div className="text-[9px] font-mono tracking-[2px] text-white/30">CHEMISTRY</div>
              <div className="text-[11px] text-white/60">{chemistry.desc}</div>
            </div>
          </div>

          <div className="text-right">
            <div
              className="text-[10px] font-mono font-bold tracking-wider"
              style={{ color: phaseMeta.color }}
            >
              {phaseMeta.label}
            </div>
            <div className="text-[9px] font-mono text-white/25">
              残り{couple.personA.hoursUntilSex.toFixed(1)}h
            </div>
          </div>
        </div>

        {/* Emotion bars */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-3">
          {DISPLAY_EMOTIONS.map(key => {
            const meta = EMOTION_META[key]
            const avgVal = Math.round(
              (couple.personA.emotions[key] + couple.personB.emotions[key]) / 2
            )
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-white/30 w-12 text-right tracking-wider">
                  {meta.label}
                </span>
                <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${avgVal}%`,
                      background: meta.color,
                      opacity: 0.7,
                    }}
                  />
                </div>
                <span className="text-[8px] font-mono text-white/20 w-5">
                  {avgVal}
                </span>
              </div>
            )
          })}
        </div>

        {/* Meeting context */}
        <div className="flex items-center gap-3 text-[9px] font-mono text-white/25 border-t border-white/5 pt-2">
          <span>{couple.relationship.howMet}</span>
          <span className="text-white/10">·</span>
          <span>{couple.relationship.stage}</span>
          <span className="text-white/10">·</span>
          <span>相性 {chemistry.score}%</span>
        </div>
      </div>

      {/* PLAY mode choices */}
      <AnimatePresence>
        {interactionMode === 'play' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-4 py-3">
              <div className="text-[8px] font-mono tracking-[3px] text-white/20 mb-2">
                INTERVENE
              </div>
              <div className="flex flex-col gap-2">
                {choices.map((choice, i) => (
                  <button
                    key={i}
                    onClick={() => handleChoice(i)}
                    disabled={chosenIndex !== null}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all
                      hover:bg-white/5 active:bg-white/8 disabled:opacity-40"
                    style={{
                      border: chosenIndex === i
                        ? `1px solid ${phaseMeta.color}40`
                        : '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <span className="text-sm">{choice.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-white/70">{choice.text}</div>
                      <div className="text-[9px] text-white/25">{choice.hint}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})
