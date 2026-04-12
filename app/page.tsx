'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePeopleStore, CoupleData } from '../stores/peopleStore';
import { useGameStore } from '../stores/gameStore';
import { CROSS_SECTION_SLOTS } from '../data/areas';
import { startTimeSync, getTimeOfDay } from '../lib/timeSync';
import { EMOTION_META, EMOTION_KEYS, type EmotionState } from '../engine/emotions';
import { PHASE_META, type Phase, scoreToColor } from '../engine/scoring';
import { MBTI_PROFILES, type MBTIType, getMBTIChemistry } from '../engine/mbti';
import { Minimap } from '../components/hud/Minimap';
import { initAudio, playAmbientTone, toggleMute, isMuted } from '../lib/audio';

// Scene image per room type
const SCENE_MAP: Record<string, string> = {
  bar: '/scenes/bar.svg',
  hotel: '/scenes/hotel.svg',
  restaurant: '/scenes/restaurant.svg',
  karaoke: '/scenes/karaoke.svg',
  apartment: '/scenes/apartment.svg',
};

function getSceneForSlot(index: number): string {
  const slot = CROSS_SECTION_SLOTS[index % CROSS_SECTION_SLOTS.length];
  return SCENE_MAP[slot.roomType] || SCENE_MAP.bar;
}

function getSlotLabel(index: number): string {
  const slot = CROSS_SECTION_SLOTS[index % CROSS_SECTION_SLOTS.length];
  return slot.roomLabel;
}

function getSlotDistrict(index: number): string {
  const slot = CROSS_SECTION_SLOTS[index % CROSS_SECTION_SLOTS.length];
  return slot.district === 'shibuya' ? '渋谷' : slot.district === 'shinjuku' ? '新宿' : '六本木';
}

// Compact emotion bar row
function EmotionRow({ label, labelEn, value, color }: { label: string; labelEn: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-white/40 w-[52px] text-right shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {labelEn}
      </span>
      <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <span className="text-[8px] text-white/25 w-[20px] text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
        {value}
      </span>
    </div>
  );
}

// Inner info overlay when character is tapped
function InnerInfoOverlay({
  personA,
  personB,
  chemistry,
  onClose,
}: {
  personA: { name: string; mbti: MBTIType; emotions: EmotionState };
  personB: { name: string; mbti: MBTIType; emotions: EmotionState };
  chemistry: { score: number; desc: string; dynamic: string };
  onClose: () => void;
}) {
  const profileA = MBTI_PROFILES[personA.mbti];
  const profileB = MBTI_PROFILES[personB.mbti];

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onClick={onClose}
    >
      {/* Frosted backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      <motion.div
        className="relative z-10 w-[90%] max-w-md px-5 py-6 space-y-5"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chemistry header */}
        <div className="text-center space-y-2">
          <div className="text-[10px] tracking-[4px] text-white/30" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            CHEMISTRY {chemistry.score}%
          </div>
          <div className="text-[13px] text-white/70 leading-relaxed" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {chemistry.desc}
          </div>
          <div className="text-[10px] text-white/35 italic" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {chemistry.dynamic}
          </div>
        </div>

        <div className="h-px bg-white/8" />

        {/* Person A inner */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {personA.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: profileA.color + '20', color: profileA.color, fontFamily: "'IBM Plex Mono', monospace" }}>
              {personA.mbti}
            </span>
          </div>
          <div className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {profileA.foreplayStyle}
          </div>
          <div className="text-[10px] text-white/25 italic" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            弱点: {profileA.weakness}
          </div>
        </div>

        <div className="h-px bg-white/8" />

        {/* Person B inner */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/60" style={{ fontFamily: "'Noto Serif JP', serif" }}>
              {personB.name}
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: profileB.color + '20', color: profileB.color, fontFamily: "'IBM Plex Mono', monospace" }}>
              {personB.mbti}
            </span>
          </div>
          <div className="text-[11px] text-white/40 leading-relaxed" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {profileB.foreplayStyle}
          </div>
          <div className="text-[10px] text-white/25 italic" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            弱点: {profileB.weakness}
          </div>
        </div>

        {/* Close hint */}
        <div className="text-center pt-2">
          <span className="text-[8px] tracking-[3px] text-white/15" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            TAP TO CLOSE
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const initialize = usePeopleStore(s => s.initialize);
  const initialized = usePeopleStore(s => s.initialized);
  const setCurrentHour = useGameStore(s => s.setCurrentHour);
  const currentHour = useGameStore(s => s.currentHour);

  const [coupleIndex, setCoupleIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [showInner, setShowInner] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  // Feedback form state
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleFeedbackSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: feedbackText.trim() }),
    });
    setFeedbackText('');
    setFeedbackSent(true);
    setTimeout(() => { setFeedbackSent(false); setFeedbackOpen(false); }, 2000);
  }, [feedbackText]);

  useEffect(() => { initialize(); }, [initialize]);
  useEffect(() => { return startTimeSync(setCurrentHour); }, [setCurrentHour]);

  const handleStartAudio = useCallback(() => {
    if (audioStarted) return;
    initAudio();
    setAudioStarted(true);
  }, [audioStarted]);

  useEffect(() => {
    if (!audioStarted) return;
    const timeOfDay = getTimeOfDay(currentHour);
    return playAmbientTone(timeOfDay);
  }, [currentHour, audioStarted]);

  // Get all 10 cross-section couples
  const couples = usePeopleStore(s => {
    if (!s.initialized) return [];
    return s.getCrossSectionCouples();
  });

  const currentCouple = couples[coupleIndex] || null;
  const sceneImage = getSceneForSlot(coupleIndex);
  const slotLabel = getSlotLabel(coupleIndex);
  const slotDistrict = getSlotDistrict(coupleIndex);

  const chemistry = useMemo(() => {
    if (!currentCouple) return null;
    return getMBTIChemistry(currentCouple.personA.mbti, currentCouple.personB.mbti);
  }, [currentCouple]);

  const goNext = useCallback(() => {
    if (couples.length === 0) return;
    setDirection(1);
    setShowInner(false);
    setCoupleIndex(i => (i + 1) % couples.length);
  }, [couples.length]);

  const goPrev = useCallback(() => {
    if (couples.length === 0) return;
    setDirection(-1);
    setShowInner(false);
    setCoupleIndex(i => (i - 1 + couples.length) % couples.length);
  }, [couples.length]);

  // Swipe gesture
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev();
      else goNext();
    }
    setTouchStart(null);
  }, [touchStart, goNext, goPrev]);

  if (!initialized || couples.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#030308] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff0a28] text-sm tracking-[6px] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            BUILDINPUBLIC.JP
          </div>
          <div className="text-white/30 text-xs tracking-[3px] animate-pulse" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            GENERATING 300 LIVES...
          </div>
        </div>
      </div>
    );
  }

  const phaseA = currentCouple.personA.currentPhase;
  const phaseMeta = PHASE_META[phaseA];
  const avgScore = Math.round((currentCouple.personA.score + currentCouple.personB.score) / 2);

  // Merge emotions for display (average of both)
  const mergedEmotions: EmotionState = {} as EmotionState;
  for (const key of EMOTION_KEYS) {
    (mergedEmotions as unknown as Record<string, number>)[key] = Math.round(
      (currentCouple.personA.emotions[key] + currentCouple.personB.emotions[key]) / 2
    );
  }

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-black"
      onClick={handleStartAudio}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* === FULL SCREEN SCENE IMAGE === */}
      <AnimatePresence custom={direction} mode="popLayout">
        <motion.div
          key={coupleIndex}
          className="absolute inset-0"
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sceneImage}
            alt=""
            className="object-cover w-full h-full"
          />
          {/* Vignette overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)',
            }}
          />
          {/* Phase-tinted overlay */}
          <div
            className="absolute inset-0 pointer-events-none transition-colors duration-1000"
            style={{ backgroundColor: phaseMeta.color, opacity: 0.04 }}
          />
        </motion.div>
      </AnimatePresence>

      {/* === SCORE BAR (top edge) === */}
      <div className="absolute top-0 left-0 right-0 h-[2px] z-30 bg-black/30">
        <motion.div
          className="h-full"
          style={{ background: scoreToColor(avgScore, 1), boxShadow: `0 0 8px ${scoreToColor(avgScore, 0.5)}` }}
          animate={{ width: `${avgScore}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* === MINIMAP (top-left) === */}
      <div className="absolute top-3 left-3 z-30 scale-[0.6] origin-top-left opacity-70 hover:opacity-100 transition-opacity">
        <Minimap />
      </div>

      {/* === TOP INFO BAR === */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
        {/* Couple names */}
        <div className="text-[14px] text-white/80 tracking-[1px]" style={{ fontFamily: "'Noto Serif JP', serif" }}>
          {currentCouple.personA.name.ja}
          <span className="text-white/25 mx-2">×</span>
          {currentCouple.personB.name.ja}
        </div>

        {/* MBTI badges */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: MBTI_PROFILES[currentCouple.personA.mbti].color + '25',
              color: MBTI_PROFILES[currentCouple.personA.mbti].color,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {currentCouple.personA.mbti}
          </span>
          <span className="text-[8px] text-white/20">×</span>
          <span
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: MBTI_PROFILES[currentCouple.personB.mbti].color + '25',
              color: MBTI_PROFILES[currentCouple.personB.mbti].color,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {currentCouple.personB.mbti}
          </span>
        </div>

        {/* Phase + Location */}
        <div className="flex items-center justify-center gap-3 mt-1.5">
          <span
            className="text-[8px] tracking-[2px] px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: phaseMeta.color + '20',
              color: phaseMeta.color,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {phaseMeta.labelEn.toUpperCase()}
          </span>
          <span className="text-[9px] text-white/30" style={{ fontFamily: "'Noto Serif JP', serif" }}>
            {slotDistrict} — {slotLabel}
          </span>
        </div>
      </div>

      {/* === TIME + SOUND (top-right) === */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!audioStarted) { initAudio(); setAudioStarted(true); }
            setMuted(toggleMute());
          }}
          className="text-[9px] tracking-[2px] text-white/20 hover:text-white/50 transition-colors pointer-events-auto"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {muted ? 'MUTED' : 'SOUND'}
        </button>
        <div className="text-[9px] tracking-[2px] text-white/20" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {String(currentHour).padStart(2, '0')}:00
        </div>
      </div>

      {/* === COUPLE COUNTER (center-top under info) === */}
      <div className="absolute top-[90px] left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="text-[8px] tracking-[4px] text-white/15" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {String(coupleIndex + 1).padStart(2, '0')} / {String(couples.length).padStart(2, '0')}
        </div>
      </div>

      {/* === CENTER TAP ZONE (for inner info) === */}
      <button
        className="absolute inset-0 z-20 cursor-pointer"
        onClick={() => setShowInner(true)}
        aria-label="Show character details"
      />

      {/* === NAVIGATION ARROWS === */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev(); }}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-16 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors pointer-events-auto"
        aria-label="Previous couple"
      >
        <span className="text-xl" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>◀</span>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNext(); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-16 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors pointer-events-auto"
        aria-label="Next couple"
      >
        <span className="text-xl" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>▶</span>
      </button>

      {/* === SITUATION TEXT (center-bottom, above emotion panel) === */}
      <div className="absolute bottom-[220px] left-0 right-0 z-25 px-8 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={coupleIndex + '-sit'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-[12px] text-white/40 leading-[2] italic"
            style={{ fontFamily: "'Noto Serif JP', serif", letterSpacing: '0.05em' }}
          >
            {currentCouple.personA.situation}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* === BOTTOM EMOTION PANEL === */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="bg-black/65 backdrop-blur-sm border-t border-white/5 px-4 pt-3 pb-4">
          {/* Score display */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] tracking-[3px] text-white/25" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              FOREPLAY SCORE
            </span>
            <span
              className="text-[14px] font-bold"
              style={{ color: scoreToColor(avgScore, 1), fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {avgScore}
            </span>
          </div>

          {/* Hours left */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[8px] tracking-[3px] text-white/20" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              TIME LEFT
            </span>
            <span className="text-[10px] text-white/35" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {currentCouple.personA.hoursUntilSex}h
            </span>
          </div>

          {/* 12-axis emotion bars — two columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {EMOTION_KEYS.map(key => (
              <EmotionRow
                key={key}
                label={EMOTION_META[key].label}
                labelEn={EMOTION_META[key].labelEn.slice(0, 8)}
                value={mergedEmotions[key]}
                color={EMOTION_META[key].color}
              />
            ))}
          </div>

          {/* Chemistry hint */}
          {chemistry && (
            <div className="mt-3 text-center">
              <span className="text-[8px] tracking-[2px] text-white/15" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                CHEMISTRY {chemistry.score}% — TAP FOR DETAILS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* === INNER INFO OVERLAY === */}
      <AnimatePresence>
        {showInner && currentCouple && chemistry && (
          <InnerInfoOverlay
            personA={{ name: currentCouple.personA.name.ja, mbti: currentCouple.personA.mbti, emotions: currentCouple.personA.emotions }}
            personB={{ name: currentCouple.personB.name.ja, mbti: currentCouple.personB.mbti, emotions: currentCouple.personB.emotions }}
            chemistry={chemistry}
            onClose={() => setShowInner(false)}
          />
        )}
      </AnimatePresence>

      {/* === /versions link === */}
      <a
        href="/versions"
        className="absolute bottom-3 left-3 z-40 text-[8px] tracking-[2px] text-white/10 hover:text-white/30 transition-colors"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        VERSIONS
      </a>

      {/* === FEEDBACK === */}
      <div className="absolute bottom-3 right-3 z-40">
        {feedbackOpen ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            {feedbackSent ? (
              <div className="text-[10px] text-white/50 text-center py-2 tracking-[2px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>SENT</div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What should evolve next?"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded text-[11px] text-white/70 p-2 resize-none focus:outline-none focus:border-white/25 placeholder:text-white/20"
                  style={{ fontFamily: "'Noto Serif JP', serif" }}
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <button type="button" onClick={() => setFeedbackOpen(false)} className="text-[8px] tracking-[2px] text-white/20 hover:text-white/40" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>CLOSE</button>
                  <button type="submit" className="text-[8px] tracking-[2px] text-[#ff3366]/70 hover:text-[#ff3366] px-2 py-1 border border-[#ff3366]/20 rounded hover:border-[#ff3366]/40 transition-colors" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>SEND</button>
                </div>
              </>
            )}
          </form>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setFeedbackOpen(true); }}
            className="text-[8px] tracking-[2px] text-white/10 hover:text-white/30 transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            FEEDBACK
          </button>
        )}
      </div>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
      `}</style>
    </div>
  );
}
