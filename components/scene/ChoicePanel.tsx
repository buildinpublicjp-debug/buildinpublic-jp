'use client';

import { useState } from 'react';
import type { EmotionState } from '../../engine/emotions';

export interface Choice {
  text: string;
  hint: string;
  delta: Partial<EmotionState>;
}

interface ChoicePanelProps {
  choices: Choice[];
  visible: boolean;
  onChoose: (delta: Partial<EmotionState>) => void;
}

export default function ChoicePanel({ choices, visible, onChoose }: ChoicePanelProps) {
  const [chosen, setChosen] = useState(false);

  if (!visible || chosen) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
      {choices.map((c, i) => (
        <button
          key={i}
          onClick={() => {
            setChosen(true);
            onChoose(c.delta);
          }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px',
            padding: '10px 14px',
            color: '#e2e8f0',
            textAlign: 'left',
            cursor: 'pointer',
            opacity: 0,
            animation: `choiceFadeIn 0.4s ease ${0.15 * i}s forwards`,
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: 500 }}>{c.text}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
            {c.hint}
          </div>
        </button>
      ))}

      <style>{`
        @keyframes choiceFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
