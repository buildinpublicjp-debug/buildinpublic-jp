'use client';

import { useMemo } from 'react';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore } from '../../stores/gameStore';
import { PHASE_META } from '../../engine/scoring';

const SIZE = 200;

// Bounding box covering all 20 Tokyo areas (with padding)
const BOUNDS = { minLat: 35.60, maxLat: 35.74, minLng: 139.57, maxLng: 139.82 };

function toPixel(lat: number, lng: number) {
  return {
    x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * SIZE,
    y: ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * SIZE,
  };
}

export function Minimap() {
  const people = usePeopleStore(s => s.people);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const switchToPerson = useGameStore(s => s.switchToPerson);
  const dots = useMemo(() =>
    people.map(p => ({
      id: p.id,
      ...toPixel(p.lat, p.lng),
      color: PHASE_META[p.currentPhase].color,
      phase: p.currentPhase,
    })),
    [people],
  );

  return (
    <div className="absolute top-12 left-3 pointer-events-auto z-20">
      <div
        className="rounded-lg overflow-hidden border border-white/10"
        style={{
          width: SIZE,
          height: SIZE,
          position: 'relative',
        }}
      >
        {/* OpenStreetMap background */}
        <iframe
          src="https://www.openstreetmap.org/export/embed.html?bbox=139.57,35.60,139.82,35.74&layer=mapnik"
          width={SIZE}
          height={SIZE}
          style={{ border: 0, borderRadius: '8px', opacity: 0.85 }}
          loading="lazy"
        />

        {/* People dots overlay */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {dots.map(dot => {
            const isSelected = dot.id === selectedPersonId;
            const isImminent = dot.phase === 'imminent';
            const size = isSelected ? 8 : isImminent ? 6 : 4;
            // Skip dots outside the visible area
            if (dot.x < 0 || dot.x > SIZE || dot.y < 0 || dot.y > SIZE) return null;
            return (
              <div
                key={dot.id}
                onClick={() => switchToPerson(dot.id)}
                style={{
                  position: 'absolute',
                  left: dot.x - size / 2,
                  top: dot.y - size / 2,
                  width: size,
                  height: size,
                  borderRadius: '50%',
                  backgroundColor: dot.color,
                  opacity: isSelected ? 1 : 0.8,
                  border: isSelected ? '1.5px solid #fff' : 'none',
                  boxShadow: isSelected ? '0 0 6px rgba(255,255,255,0.5)' : 'none',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  transform: isSelected ? 'scale(1.3)' : 'none',
                  transition: 'transform 0.2s',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
