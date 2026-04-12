'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePeopleStore } from '../stores/peopleStore';
import { useGameStore } from '../stores/gameStore';
import { CityMap } from '../components/city/CityMap';
import { BuildingSection, RoomSlot } from '../components/cross-section/BuildingSection';
import { AvatarPair } from '../components/cross-section/AvatarPair';
import { CROSS_SECTION_SLOTS, DISTRICTS, type District } from '../data/areas';
import { startTimeSync, getTimeTheme, getTimeOfDay } from '../lib/timeSync';
import { ViewTransition } from '../components/cross-section/ViewTransition';
import { initAudio, playAmbientTone, toggleMute, isMuted } from '../lib/audio';
import { NightSky } from '../components/cross-section/NightSky';

// Typewriter text component for literary atmosphere (#035)
function TypewriterText({ text, className, style }: { text: string; className?: string; style?: React.CSSProperties }) {
  const [displayed, setDisplayed] = useState('');
  const prevTextRef = useRef(text);

  useEffect(() => {
    // Reset when text changes
    if (text !== prevTextRef.current) {
      setDisplayed('');
      prevTextRef.current = text;
    }

    let idx = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      idx++;
      setDisplayed(text.slice(0, idx));
      if (idx >= text.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [text]);

  return (
    <div className={className} style={style}>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </div>
  );
}

export default function Home() {
  const initialize = usePeopleStore(s => s.initialize);
  const initialized = usePeopleStore(s => s.initialized);
  const viewMode = useGameStore(s => s.viewMode);
  const setViewMode = useGameStore(s => s.setViewMode);
  const selectedAreaId = useGameStore(s => s.selectedAreaId);
  const selectArea = useGameStore(s => s.selectArea);
  const interactionMode = useGameStore(s => s.interactionMode);
  const setInteractionMode = useGameStore(s => s.setInteractionMode);
  const currentHour = useGameStore(s => s.currentHour);
  const setCurrentHour = useGameStore(s => s.setCurrentHour);

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedCoupleIndex, setSelectedCoupleIndex] = useState<number | null>(null);
  const [audioStarted, setAudioStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  // Feedback form state (#043)
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

  // Initialize people + time sync
  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    return startTimeSync(setCurrentHour);
  }, [setCurrentHour]);

  // Start ambient audio on first user interaction
  const handleStartAudio = useCallback(() => {
    if (audioStarted) return;
    initAudio();
    setAudioStarted(true);
  }, [audioStarted]);

  // Update ambient tone when hour changes
  useEffect(() => {
    if (!audioStarted) return;
    const timeOfDay = getTimeOfDay(currentHour);
    const stop = playAmbientTone(timeOfDay);
    return stop;
  }, [currentHour, audioStarted]);

  const timeTheme = getTimeTheme(currentHour);

  // Handle couple selection from CityMap
  const handleSelectCouple = useCallback((relationshipId: string, personAId: string, personBId: string) => {
    const person = usePeopleStore.getState().getPersonById(personAId);
    if (person) {
      // Find which district this person belongs to
      const slot = CROSS_SECTION_SLOTS.find(s => {
        const rels = usePeopleStore.getState().relationships;
        const rel = rels[s.coupleIndex % rels.length];
        return rel.id === relationshipId;
      });
      if (slot) {
        selectArea(slot.district);
        setSelectedCoupleIndex(slot.coupleIndex);
        setSelectedRoomId(slot.district + '-' + slot.floor);
      }
    }
  }, [selectArea]);

  // Handle back to GOD view
  const handleBack = useCallback(() => {
    selectArea(null);
    setSelectedRoomId(null);
    setSelectedCoupleIndex(null);
  }, [selectArea]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff0a28] text-sm tracking-[6px] mb-2">BUILDINPUBLIC.JP</div>
          <div className="text-white/30 text-xs tracking-[3px] animate-pulse">GENERATING 300 LIVES...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden transition-all duration-1000"
      style={{ background: timeTheme.bg }}
      onClick={handleStartAudio}
    >
      {/* 時間帯オーバーレイ */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-1000 z-0"
        style={{ opacity: timeTheme.overlay * 0.5 }}
      />

      {/* ディゾルブ遷移付きビュー切替 */}
      <ViewTransition viewKey={viewMode + (selectedAreaId || '')} duration={600}>
        {/* GOD VIEW — デフォルメマップ */}
        {viewMode === 'god' && (
          <div className="relative w-full h-full z-10">
            <CityMap onSelectCouple={handleSelectCouple} />

            {/* 時刻表示 + 音声トグル */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!audioStarted) { initAudio(); setAudioStarted(true); }
                  setMuted(toggleMute());
                }}
                className="text-[10px] tracking-[2px] text-white/25 hover:text-white/50 transition-colors pointer-events-auto"
              >
                {muted ? 'MUTED' : 'SOUND'}
              </button>
              <div className="text-[10px] tracking-[3px] text-white/25 font-mono">
                {String(currentHour).padStart(2, '0')}:00 JST
              </div>
            </div>
          </div>
        )}

        {/* CROSS-SECTION VIEW — 断面図 */}
        {viewMode === 'cross-section' && selectedAreaId && (
          <CrossSectionView
            district={selectedAreaId as District}
            selectedRoomId={selectedRoomId}
            selectedCoupleIndex={selectedCoupleIndex}
            interactionMode={interactionMode}
            currentHour={currentHour}
            onRoomSelect={(roomId, coupleIndex) => {
              setSelectedRoomId(roomId);
              setSelectedCoupleIndex(coupleIndex);
            }}
            onBack={handleBack}
            onToggleMode={() => setInteractionMode(interactionMode === 'watch' ? 'play' : 'watch')}
          />
        )}
      </ViewTransition>

      {/* /versions link (#042) */}
      <a
        href="/versions"
        className="absolute bottom-3 left-4 z-30 text-[9px] tracking-[2px] text-white/15 hover:text-white/40 transition-colors"
      >
        VERSIONS
      </a>

      {/* Feedback form (#043) */}
      <div className="absolute bottom-3 right-4 z-30">
        {feedbackOpen ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className="bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 w-[220px]"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'feedbackSlideUp 0.2s ease-out' }}
          >
            {feedbackSent ? (
              <div className="text-[10px] text-white/50 text-center py-2 tracking-[2px]">SENT</div>
            ) : (
              <>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="What should evolve next?"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded text-[11px] text-white/70 p-2 resize-none focus:outline-none focus:border-white/25 placeholder:text-white/20"
                  required
                />
                <div className="flex justify-between items-center mt-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackOpen(false)}
                    className="text-[8px] tracking-[2px] text-white/20 hover:text-white/40"
                  >
                    CLOSE
                  </button>
                  <button
                    type="submit"
                    className="text-[8px] tracking-[2px] text-[#ff3366]/70 hover:text-[#ff3366] px-2 py-1 border border-[#ff3366]/20 rounded hover:border-[#ff3366]/40 transition-colors"
                  >
                    SEND
                  </button>
                </div>
              </>
            )}
          </form>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setFeedbackOpen(true); }}
            className="text-[9px] tracking-[2px] text-white/15 hover:text-white/40 transition-colors"
          >
            FEEDBACK
          </button>
        )}
      </div>

      {/* Google Fonts for Noto Serif JP (#035) + animation styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500&display=swap');
        @keyframes feedbackSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// 断面図ビュー
interface CrossSectionViewProps {
  district: District;
  selectedRoomId: string | null;
  selectedCoupleIndex: number | null;
  interactionMode: 'watch' | 'play';
  currentHour: number;
  onRoomSelect: (roomId: string, coupleIndex: number) => void;
  onBack: () => void;
  onToggleMode: () => void;
}

function CrossSectionView({
  district,
  selectedRoomId,
  selectedCoupleIndex,
  interactionMode,
  currentHour,
  onRoomSelect,
  onBack,
  onToggleMode,
}: CrossSectionViewProps) {
  const relationships = usePeopleStore(s => s.relationships);
  const people = usePeopleStore(s => s.people);
  const districtInfo = DISTRICTS[district];
  const slots = CROSS_SECTION_SLOTS.filter(s => s.district === district);

  // Build rooms for BuildingSection
  const rooms: RoomSlot[] = slots.map(slot => {
    const rel = relationships[slot.coupleIndex % relationships.length];
    const personA = people.find(p => p.id === rel?.personA);
    return {
      id: district + '-' + slot.floor,
      floor: slot.floor - 1, // 0-based for BuildingSection
      position: 'center' as const,
      type: slot.roomType as RoomSlot['type'],
      coupleId: rel?.id,
      phase: personA?.currentPhase,
    };
  });

  // Get selected couple data
  const selectedCouple = selectedCoupleIndex !== null ? (() => {
    const rel = relationships[selectedCoupleIndex % relationships.length];
    if (!rel) return null;
    const a = people.find(p => p.id === rel.personA);
    const b = people.find(p => p.id === rel.personB);
    if (!a || !b) return null;
    return { relationship: rel, personA: a, personB: b };
  })() : null;

  return (
    <div className="relative w-full h-full z-10 flex flex-col">
      {/* Night sky background (#030) */}
      <NightSky hour={currentHour} />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 z-20">
        <button
          onClick={onBack}
          className="text-white/40 text-xs tracking-[2px] hover:text-white/70 transition-colors pointer-events-auto"
        >
          ← BACK
        </button>
        <div className="text-center">
          <div className="text-xs tracking-[4px] font-bold" style={{ color: districtInfo.color }}>
            {districtInfo.nameEn.toUpperCase()}
          </div>
          <div className="text-[9px] text-white/30 tracking-[2px]">
            {districtInfo.name} — {slots.length} couples
          </div>
        </div>
        <div className="text-[10px] tracking-[2px] text-white/25 font-mono">
          {String(currentHour).padStart(2, '0')}:00
        </div>
      </div>

      {/* Main content: Building + Avatar */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 overflow-hidden">
        {/* Building cross-section */}
        <div className="w-full max-w-sm flex-shrink-0" style={{ height: '50%' }}>
          <BuildingSection
            name={districtInfo.nameEn.toUpperCase()}
            floors={slots.length}
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onRoomClick={(room) => {
              const slot = slots.find(s => district + '-' + s.floor === room.id);
              if (slot) {
                onRoomSelect(room.id, slot.coupleIndex);
              }
            }}
          />
        </div>

        {/* Selected couple avatar pair */}
        {selectedCouple && (
          <div className="w-full max-w-sm flex-shrink-0" style={{ height: '30%' }}>
            <div className="relative w-full h-full">
              <AvatarPair
                personA={{
                  name: selectedCouple.personA.name.ja,
                  gender: selectedCouple.personA.gender,
                  phase: selectedCouple.personA.currentPhase,
                  emotions: selectedCouple.personA.emotions,
                  score: selectedCouple.personA.score,
                  bodyAngle: selectedCouple.personA.bodyAngle,
                }}
                personB={{
                  name: selectedCouple.personB.name.ja,
                  gender: selectedCouple.personB.gender,
                  phase: selectedCouple.personB.currentPhase,
                  emotions: selectedCouple.personB.emotions,
                  score: selectedCouple.personB.score,
                  bodyAngle: selectedCouple.personB.bodyAngle,
                }}
              />
              {/* Situation text with typewriter effect (#035) */}
              <div className="absolute bottom-0 left-0 right-0 text-center px-4">
                <TypewriterText
                  text={selectedCouple.personA.situation}
                  className="text-[12px] text-white/50 leading-[2] italic"
                  style={{ fontFamily: "'Noto Serif JP', serif", letterSpacing: '0.05em' }}
                />
              </div>
            </div>
          </div>
        )}

        {!selectedCouple && (
          <div className="text-white/20 text-xs tracking-[3px] text-center">
            TAP A ROOM TO VIEW
          </div>
        )}
      </div>

      {/* Bottom bar: WATCH/PLAY toggle */}
      <div className="flex items-center justify-center gap-6 px-4 py-4 z-20">
        <button
          onClick={onToggleMode}
          className={`text-[10px] tracking-[3px] transition-all duration-300 pointer-events-auto ${
            interactionMode === 'watch'
              ? 'text-white/70 border-b border-white/30'
              : 'text-white/25 hover:text-white/40'
          }`}
        >
          WATCH
        </button>
        <div className="w-px h-3 bg-white/10" />
        <button
          onClick={onToggleMode}
          className={`text-[10px] tracking-[3px] transition-all duration-300 pointer-events-auto ${
            interactionMode === 'play'
              ? 'text-[#ff3366] border-b border-[#ff3366]/50'
              : 'text-white/25 hover:text-white/40'
          }`}
        >
          PLAY
        </button>
      </div>
    </div>
  );
}
