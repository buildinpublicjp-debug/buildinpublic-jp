// Emotion Engine — 12-axis emotional state system

export interface EmotionState {
  desire: number;       // 欲望 0-100
  anxiety: number;      // 不安
  trust: number;        // 信頼
  vulnerability: number;// 脆さ
  excitement: number;   // 興奮
  tenderness: number;   // 柔らかさ
  jealousy: number;     // 独占欲
  shame: number;        // 羞恥
  power: number;        // 支配性
  surrender: number;    // 服従性
  nostalgia: number;    // 郷愁
  denial: number;       // 否認
}

export const EMOTION_KEYS: (keyof EmotionState)[] = [
  'desire','anxiety','trust','vulnerability','excitement','tenderness',
  'jealousy','shame','power','surrender','nostalgia','denial'
];

export const EMOTION_META: Record<keyof EmotionState, { label: string; labelEn: string; color: string; desc: string }> = {
  desire:       { label:'欲望', labelEn:'Desire', color:'#ef4444', desc:'触れたい。近づきたい。' },
  anxiety:      { label:'不安', labelEn:'Anxiety', color:'#f59e0b', desc:'嫌われるかも。間違えるかも。' },
  trust:        { label:'信頼', labelEn:'Trust', color:'#10b981', desc:'この人の前で無防備になれる。' },
  vulnerability:{ label:'脆さ', labelEn:'Vulnerability', color:'#8b5cf6', desc:'壁が降りている。素の自分が見えている。' },
  excitement:   { label:'興奮', labelEn:'Excitement', color:'#f97316', desc:'心拍数。アドレナリン。予測不能性。' },
  tenderness:   { label:'柔らかさ', labelEn:'Tenderness', color:'#ec4899', desc:'守りたい。大切にしたい。' },
  jealousy:     { label:'独占欲', labelEn:'Jealousy', color:'#dc2626', desc:'他の誰にも渡したくない。' },
  shame:        { label:'羞恥', labelEn:'Shame', color:'#6366f1', desc:'こんな自分を見せていいのか。' },
  power:        { label:'支配性', labelEn:'Dominance', color:'#1e293b', desc:'リードしたい。コントロールしたい。' },
  surrender:    { label:'服従性', labelEn:'Surrender', color:'#94a3b8', desc:'委ねたい。任せたい。' },
  nostalgia:    { label:'郷愁', labelEn:'Nostalgia', color:'#78716c', desc:'過去の誰かを重ねている。' },
  denial:       { label:'否認', labelEn:'Denial', color:'#475569', desc:'こんなこと感じてない、と思おうとしている。' },
};

export function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(v)));
}

export function createEmotionState(overrides?: Partial<EmotionState>): EmotionState {
  return {
    desire: 20, anxiety: 15, trust: 25, vulnerability: 10, excitement: 15,
    tenderness: 15, jealousy: 0, shame: 5, power: 30, surrender: 10,
    nostalgia: 5, denial: 15, ...overrides
  };
}

export function applyDelta(emo: EmotionState, delta: Partial<EmotionState>): EmotionState {
  const next = { ...emo };
  for (const [key, value] of Object.entries(delta)) {
    const k = key as keyof EmotionState;
    if (next[k] !== undefined && typeof value === 'number') {
      next[k] = clamp(next[k] + value);
    }
  }
  return next;
}
