'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePeopleStore } from '@/stores/peopleStore'
import { useGameStore } from '@/stores/gameStore'
import { CROSS_SECTION_SLOTS, DISTRICTS } from '@/data/areas'
import { PHASE_META, calcForeplayScore } from '@/engine/scoring'
import { getMBTIChemistry } from '@/engine/mbti'
import type { RoomType } from '@/data/areas'
import { Minimap } from './Minimap'
import { AnalysisPanel } from './AnalysisPanel'

// Map room types to scene images
// hotel.png is a city map, so use bar/izakaya for all intimate scenes
const SCENE_MAP: Record<RoomType, string> = {
  bar:        '/scenes/bar.png',
  karaoke:    '/scenes/bar.png',
  restaurant: '/scenes/izakaya.png',
  hotel:      '/scenes/izakaya.png',
  apartment:  '/scenes/bar.png',
}

// Slide transition variants
const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? '80%' : '-80%',
    opacity: 0,
    scale: 1.04,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? '-80%' : '80%',
    opacity: 0,
    scale: 0.96,
  }),
}

interface Props {
  currentHour: number
}

export default function SceneViewer({ currentHour }: Props) {
  const relationships = usePeopleStore(s => s.relationships)
  const people = usePeopleStore(s => s.people)
  const interactionMode = useGameStore(s => s.interactionMode)
  const setInteractionMode = useGameStore(s => s.setInteractionMode)

  // Memoize couples to avoid infinite re-render
  const couples = useMemo(() => {
    return CROSS_SECTION_SLOTS.map(slot => {
      const rel = relationships[slot.coupleIndex % relationships.length]
      const personA = people.find(p => p.id === rel.personA)
      const personB = people.find(p => p.id === rel.personB)
      return { relationship: rel, personA: personA!, personB: personB! }
    })
  }, [relationships, people])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [minutes, setMinutes] = useState(new Date().getMinutes())
  const touchStart = useRef<number | null>(null)

  // Update minutes every 30s
  useEffect(() => {
    const iv = setInterval(() => setMinutes(new Date().getMinutes()), 30000)
    return () => clearInterval(iv)
  }, [])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setDirection(1)
        setCurrentIndex(i => (i + 1) % couples.length)
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setDirection(-1)
        setCurrentIndex(i => (i - 1 + couples.length) % couples.length)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [couples.length])

  // Touch swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return
    const diff = e.changedTouches[0].clientX - touchStart.current
    if (Math.abs(diff) > 60) {
      if (diff < 0) {
        setDirection(1)
        setCurrentIndex(i => (i + 1) % couples.length)
      } else {
        setDirection(-1)
        setCurrentIndex(i => (i - 1 + couples.length) % couples.length)
      }
    }
    touchStart.current = null
  }, [couples.length])

  const goNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex(i => (i + 1) % couples.length)
  }, [couples.length])

  const goPrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex(i => (i - 1 + couples.length) % couples.length)
  }, [couples.length])

  const handleMinimapSelect = useCallback((i: number) => {
    setDirection(i > currentIndex ? 1 : -1)
    setCurrentIndex(i)
  }, [currentIndex])

  // Current couple data
  const couple = couples[currentIndex]
  const slot = CROSS_SECTION_SLOTS[currentIndex]
  const district = DISTRICTS[slot.district]
  const sceneImg = SCENE_MAP[slot.roomType]
  const phase = couple.personA.currentPhase
  const phaseMeta = PHASE_META[phase]
  const score = calcForeplayScore(couple.personA.emotions, couple.personB.emotions)
  const chemistry = getMBTIChemistry(couple.personA.mbti, couple.personB.mbti)

  const timeStr = `${String(currentHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

  return (
    <div
      className="fixed inset-0 bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Background scene image ── */}
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 200, damping: 30 },
            opacity: { duration: 0.35 },
            scale: { duration: 0.35 },
          }}
          className="absolute inset-0"
        >
          <img
            src={sceneImg}
            alt={slot.roomLabel}
            className="w-full h-full object-cover"
            draggable={false}
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* ── HUD Layer ── */}
      <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">

        {/* ── Top row: minimap + time on first line, couple info below ── */}
        <div className="p-3 pointer-events-auto">
          {/* Row 1: minimap / time */}
          <div className="flex items-start justify-between mb-2">
            <Minimap
              couples={couples}
              currentIndex={currentIndex}
              onSelect={handleMinimapSelect}
            />
            <div className="text-right pt-1 flex-shrink-0">
              <div
                className="text-white/50 text-[12px] tracking-[2px]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {timeStr}
              </div>
              <div
                className="text-white/20 text-[7px] tracking-[4px] mt-0.5"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                JST
              </div>
            </div>
          </div>

          {/* Row 2: couple names + MBTI + phase (full width) */}
          <div className="text-center">
            <div
              className="text-white text-[15px] tracking-wide leading-tight whitespace-nowrap"
              style={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700 }}
            >
              {couple.personA.name.ja}
              <span className="text-white/30 mx-1.5 font-light">×</span>
              {couple.personB.name.ja}
            </div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span
                className="text-white/40 text-[10px] tracking-[2px]"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {couple.personA.mbti}·{couple.personB.mbti}
              </span>
              <span className="text-white/15 text-[10px]">|</span>
              <span
                className="text-[10px] text-white/35"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {couple.relationship.meetCount}回目
              </span>
              <span className="text-white/15 text-[10px]">|</span>
              <span
                className="text-[10px] font-bold tracking-wider"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: phaseMeta.color,
                }}
              >
                {phaseMeta.labelEn.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Spacer ── */}
        <div className="flex-1" />

        {/* ── Scene label ── */}
        <div className="px-5 mb-2 pointer-events-none">
          <div
            className="text-white/25 text-[9px] tracking-[3px]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {slot.roomLabel}
            <span className="text-white/10 mx-2">—</span>
            <span style={{ color: district.color + '80' }}>{district.name}</span>
          </div>
          {/* Situation text */}
          <div
            className="text-white/40 text-[11px] leading-relaxed mt-1 max-w-[80%]"
            style={{ fontFamily: "'Noto Serif JP', serif" }}
          >
            {couple.personA.situation}
          </div>
        </div>

        {/* ── Analysis panel ── */}
        <div className="pointer-events-auto">
          <AnalysisPanel
            couple={couple}
            score={score}
            chemistry={chemistry}
            phase={phase}
            interactionMode={interactionMode}
          />
        </div>

        {/* ── Bottom bar: index / WATCH-PLAY / versions ── */}
        <div
          className="flex items-center justify-between px-4 py-3 pointer-events-auto"
          style={{ background: 'rgba(8,8,16,0.82)' }}
        >
          {/* Couple index */}
          <div
            className="text-[9px] text-white/20 tracking-[2px]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {currentIndex + 1} / {couples.length}
          </div>

          {/* WATCH / PLAY toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setInteractionMode('watch')}
              className="transition-all duration-300"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.15em',
                color: interactionMode === 'watch' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)',
                borderBottom: interactionMode === 'watch' ? '1px solid rgba(255,255,255,0.3)' : '1px solid transparent',
                paddingBottom: 2,
              }}
            >
              WATCH
            </button>
            <div className="w-px h-3 bg-white/10" />
            <button
              onClick={() => setInteractionMode('play')}
              className="transition-all duration-300"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                letterSpacing: '0.15em',
                color: interactionMode === 'play' ? phaseMeta.color : 'rgba(255,255,255,0.2)',
                borderBottom: interactionMode === 'play' ? `1px solid ${phaseMeta.color}60` : '1px solid transparent',
                paddingBottom: 2,
              }}
            >
              PLAY
            </button>
          </div>

          {/* Links */}
          <div className="flex items-center gap-3">
            <a
              href="/versions"
              className="text-[8px] text-white/15 hover:text-white/35 tracking-[2px] transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              VER
            </a>
          </div>
        </div>
      </div>

      {/* ── Navigation arrows ── */}
      <button
        onClick={goPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20
          w-14 h-28 flex items-center justify-start pl-3
          text-white/20 hover:text-white/60 hover:bg-gradient-to-r hover:from-black/30 hover:to-transparent
          transition-all duration-200 active:scale-95"
        aria-label="Previous couple"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 4L7 10L13 16" />
        </svg>
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20
          w-14 h-28 flex items-center justify-end pr-3
          text-white/20 hover:text-white/60 hover:bg-gradient-to-l hover:from-black/30 hover:to-transparent
          transition-all duration-200 active:scale-95"
        aria-label="Next couple"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 4L13 10L7 16" />
        </svg>
      </button>

    </div>
  )
}
