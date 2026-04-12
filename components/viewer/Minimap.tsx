'use client'

import { memo } from 'react'
import { CROSS_SECTION_SLOTS, DISTRICTS, type District } from '@/data/areas'
import { PHASE_META } from '@/engine/scoring'
import type { CoupleData } from '@/stores/peopleStore'

// Rough Tokyo district positions (normalized 0-1 within minimap)
const DISTRICT_POS: Record<District, { x: number; y: number }> = {
  shibuya:  { x: 0.28, y: 0.68 },
  shinjuku: { x: 0.45, y: 0.22 },
  roppongi: { x: 0.72, y: 0.52 },
}

// Spread dots within a district so they don't overlap
function dotPos(slotIndex: number): { x: number; y: number } {
  const slot = CROSS_SECTION_SLOTS[slotIndex]
  const base = DISTRICT_POS[slot.district]
  const localIndex = CROSS_SECTION_SLOTS
    .filter(s => s.district === slot.district)
    .findIndex(s => s.coupleIndex === slot.coupleIndex)
  const offsets = [
    { dx: -0.06, dy: -0.04 },
    { dx: 0.06, dy: -0.02 },
    { dx: -0.03, dy: 0.06 },
    { dx: 0.07, dy: 0.05 },
  ]
  const off = offsets[localIndex] || { dx: 0, dy: 0 }
  return { x: base.x + off.dx, y: base.y + off.dy }
}

interface Props {
  couples: CoupleData[]
  currentIndex: number
  onSelect: (index: number) => void
}

export const Minimap = memo(function Minimap({ couples, currentIndex, onSelect }: Props) {
  const W = 130
  const H = 90

  return (
    <div
      className="rounded-md overflow-hidden flex-shrink-0"
      style={{
        width: W,
        height: H,
        background: 'rgba(10,10,18,0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* District labels */}
        {(Object.entries(DISTRICTS) as [District, typeof DISTRICTS[District]][]).map(([key, d]) => {
          const pos = DISTRICT_POS[key]
          return (
            <text
              key={key}
              x={pos.x * W}
              y={pos.y * H - 8}
              textAnchor="middle"
              fill={d.color}
              fontSize={6}
              fontFamily="'IBM Plex Mono', monospace"
              opacity={0.5}
            >
              {d.nameEn.toUpperCase()}
            </text>
          )
        })}

        {/* Couple dots */}
        {couples.map((couple, i) => {
          const pos = dotPos(i)
          const phase = couple.personA.currentPhase
          const color = PHASE_META[phase].color
          const isCurrent = i === currentIndex

          return (
            <g
              key={i}
              onClick={() => onSelect(i)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse ring for current */}
              {isCurrent && (
                <circle
                  cx={pos.x * W}
                  cy={pos.y * H}
                  r={6}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={0.4}
                >
                  <animate
                    attributeName="r"
                    from="4"
                    to="8"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.5"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={pos.x * W}
                cy={pos.y * H}
                r={isCurrent ? 3.5 : 2.5}
                fill={color}
                opacity={isCurrent ? 1 : 0.5}
              />
            </g>
          )
        })}
      </svg>
    </div>
  )
})
