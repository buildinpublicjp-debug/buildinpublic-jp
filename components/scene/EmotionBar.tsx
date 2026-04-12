'use client';

import { scoreToColor } from '../../engine/scoring';

interface EmotionBarProps {
  score: number; // 0-100
}

export default function EmotionBar({ score }: EmotionBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '1px',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${score}%`,
          background: scoreToColor(score, 1),
          transition: 'width 0.8s cubic-bezier(0.22,1,0.36,1), background 0.8s ease',
          boxShadow: `0 0 6px ${scoreToColor(score, 0.6)}`,
        }}
      />
    </div>
  );
}
