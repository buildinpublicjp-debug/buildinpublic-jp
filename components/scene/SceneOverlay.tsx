'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { createEmotionState, applyDelta, type EmotionState } from '../../engine/emotions';
import { calcForeplayScore } from '../../engine/scoring';
import EmotionBar from './EmotionBar';
import ChoicePanel, { type Choice } from './ChoicePanel';

// --- Scenario data: Bar Bossa, 3 scenes ---

interface Scene {
  speaker: string;
  text: string;
  choices: Choice[];
}

const SCENARIOS: Scene[] = [
  {
    speaker: 'あなた',
    text: '渋谷の裏通り。「Bar Bossa」の重いドアを押すと、ボサノヴァと珈琲の匂いが混ざった空気が流れてきた。カウンターの端に、一人の女性が本を読んでいる。目が合った。0.5秒。それだけで空気が変わった。',
    choices: [
      {
        text: '隣に座る',
        hint: '肩が触れる距離',
        delta: { desire: 8, excitement: 5, vulnerability: 3, anxiety: -2 },
      },
      {
        text: '一席空けて座る',
        hint: '礼儀正しい距離感',
        delta: { trust: 6, tenderness: 3, denial: -3 },
      },
      {
        text: 'カウンターの反対側に座る',
        hint: '視線だけが届く距離',
        delta: { power: 5, nostalgia: 4, anxiety: 5 },
      },
    ],
  },
  {
    speaker: '彼女',
    text: '「...その本、私も読んだことある」\n彼女がこちらを見た。黒髪が揺れて、イヤリングが光る。声は低くて、少し掠れていた。バーテンダーがグラスを置く音がやけに大きく聞こえた。',
    choices: [
      {
        text: '「どの部分が好き？」',
        hint: '知的な糸口を探る',
        delta: { trust: 7, excitement: 4, desire: 3, shame: -2 },
      },
      {
        text: '「嘘。読んでないでしょ」',
        hint: '軽い挑発で距離を詰める',
        delta: { excitement: 10, desire: 6, power: 4, trust: -3 },
      },
      {
        text: '黙って微笑む',
        hint: '沈黙を武器にする',
        delta: { vulnerability: 8, surrender: 5, tenderness: 4, denial: -4 },
      },
    ],
  },
  {
    speaker: 'あなた',
    text: '2杯目のカクテルが空く頃、気づくと距離が縮まっていた。彼女の指がグラスの縁をなぞる。無意識なのか、意図的なのか分からない。でも、目が離せない。「...もう1杯、どう？」 声が自分のものじゃないみたいだった。',
    choices: [
      {
        text: '「ここじゃなくて、静かな場所で」',
        hint: '一線を越える提案',
        delta: { desire: 15, excitement: 8, vulnerability: 6, anxiety: 8 },
      },
      {
        text: '彼女のグラスに手を重ねる',
        hint: '言葉より先に触れる',
        delta: { desire: 12, tenderness: 10, surrender: 8, shame: 5 },
      },
      {
        text: '「今夜は、この距離がいい」',
        hint: '余韻を残す撤退',
        delta: { trust: 12, nostalgia: 8, tenderness: 6, denial: 6 },
      },
    ],
  },
];

// --- Typewriter hook ---

function useTypewriter(text: string, speed = 40) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const skipRef = useRef(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    skipRef.current = false;
    let i = 0;
    const iv = setInterval(() => {
      if (skipRef.current) {
        setDisplayed(text);
        setDone(true);
        clearInterval(iv);
        return;
      }
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        setDone(true);
        clearInterval(iv);
      }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  const skip = useCallback(() => {
    skipRef.current = true;
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skip };
}

// --- Main overlay ---

export default function SceneOverlay() {
  const activePanel = useGameStore((s) => s.activePanel);
  const setActivePanel = useGameStore((s) => s.setActivePanel);

  const [sceneIndex, setSceneIndex] = useState(0);
  const [playerEmo, setPlayerEmo] = useState(() => createEmotionState());
  const [npcEmo] = useState(() =>
    createEmotionState({ desire: 25, trust: 20, vulnerability: 15, excitement: 20 })
  );
  const [score, setScore] = useState(() => calcForeplayScore(playerEmo, npcEmo));
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  const scene = SCENARIOS[sceneIndex];
  const { displayed, done, skip } = useTypewriter(scene?.text ?? '', 40);

  // Show choices when typewriter finishes
  useEffect(() => {
    if (done && scene) setChoicesVisible(true);
  }, [done, scene]);

  if (activePanel !== 'scene') return null;

  const handleChoose = (delta: Partial<EmotionState>) => {
    const nextEmo = applyDelta(playerEmo, delta);
    setPlayerEmo(nextEmo);
    const nextScore = calcForeplayScore(nextEmo, npcEmo);
    setScore(nextScore);
    setChoicesVisible(false);

    // Advance to next scene or end
    if (sceneIndex < SCENARIOS.length - 1) {
      setFadingOut(true);
      setTimeout(() => {
        setSceneIndex((i) => i + 1);
        setFadingOut(false);
      }, 600);
    } else {
      // End scene
      setFadingOut(true);
      setTimeout(() => {
        setActivePanel(null);
        // Reset for next time
        setSceneIndex(0);
        setPlayerEmo(createEmotionState());
        setFadingOut(false);
      }, 800);
    }
  };

  return (
    <>
      <EmotionBar score={score} />

      {/* Full-screen overlay */}
      <div
        onClick={() => {
          if (!done) skip();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7) 100%)',
          opacity: fadingOut ? 0 : 1,
          transition: 'opacity 0.5s ease',
          cursor: done ? 'default' : 'pointer',
        }}
      >
        {/* Text window — bottom 30% */}
        <div
          style={{
            minHeight: '30vh',
            maxHeight: '40vh',
            padding: '16px 20px 24px',
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Speaker name */}
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
              marginBottom: '8px',
              textTransform: 'uppercase',
            }}
          >
            {scene.speaker}
          </div>

          {/* Typewriter text */}
          <div
            style={{
              fontSize: '14px',
              lineHeight: 1.8,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
              minHeight: '60px',
            }}
          >
            {displayed}
            {!done && (
              <span
                style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '14px',
                  background: 'rgba(255,255,255,0.6)',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                  animation: 'cursorBlink 0.8s infinite',
                }}
              />
            )}
          </div>

          {/* Tap hint */}
          {!done && (
            <div
              style={{
                fontSize: '10px',
                color: 'rgba(255,255,255,0.25)',
                marginTop: '8px',
                textAlign: 'center',
              }}
            >
              tap to skip
            </div>
          )}

          {/* Choices */}
          <ChoicePanel
            choices={scene.choices}
            visible={choicesVisible}
            onChoose={handleChoose}
          />

          {/* Score label */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              right: '16px',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'monospace',
            }}
          >
            score: {score}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </>
  );
}
