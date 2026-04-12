// Date memory templates — past encounters that build relationship history
// Used by timeline UI to show couple's journey

import type { Phase } from '../engine/scoring';

export interface DateMemory {
  id: string;
  location: string;
  locationEn: string;
  description: string;
  descriptionEn: string;
  phase: Phase;
  emoji: string;
}

// Template pools per phase — filled by seeded RNG per couple
export const DATE_MEMORY_POOLS: Record<Phase, Omit<DateMemory, 'id'>[]> = {
  seed: [
    { location: 'マッチングアプリ', locationEn: 'Dating App', description: 'プロフィール写真に目が止まった', descriptionEn: 'Caught by a profile photo', phase: 'seed', emoji: '📱' },
    { location: '渋谷スクランブル', locationEn: 'Shibuya Crossing', description: '人混みの中で目が合った', descriptionEn: 'Eyes met in the crowd', phase: 'seed', emoji: '🚶' },
    { location: 'カフェ', locationEn: 'Cafe', description: '共通の友達の紹介', descriptionEn: 'Introduced by a mutual friend', phase: 'seed', emoji: '☕' },
    { location: '会社', locationEn: 'Office', description: 'エレベーターで毎朝すれ違う', descriptionEn: 'Passing in the elevator every morning', phase: 'seed', emoji: '🏢' },
    { location: 'ジム', locationEn: 'Gym', description: '隣のマシンでたまに話す', descriptionEn: 'Chatting on the next machine', phase: 'seed', emoji: '💪' },
  ],
  approach: [
    { location: '代官山レストラン', locationEn: 'Daikanyama Restaurant', description: '初めての食事。3時間話した', descriptionEn: 'First dinner. Talked for 3 hours', phase: 'approach', emoji: '🍝' },
    { location: '上野公園', locationEn: 'Ueno Park', description: '桜の下で缶ビール', descriptionEn: 'Canned beer under cherry blossoms', phase: 'approach', emoji: '🌸' },
    { location: '新宿ゴールデン街', locationEn: 'Golden Gai', description: '狭いバーで肩が触れた', descriptionEn: 'Shoulders touched in a tiny bar', phase: 'approach', emoji: '🍺' },
    { location: '映画館', locationEn: 'Cinema', description: '暗闇で手が触れそうになった', descriptionEn: 'Hands almost touched in the dark', phase: 'approach', emoji: '🎬' },
    { location: '東京タワー', locationEn: 'Tokyo Tower', description: '夜景を見ながら黙った', descriptionEn: 'Fell silent watching the night view', phase: 'approach', emoji: '🗼' },
  ],
  escalation: [
    { location: '中目黒川沿い', locationEn: 'Nakameguro River', description: '帰り道、手を繋いだ', descriptionEn: 'Held hands on the way home', phase: 'escalation', emoji: '🤝' },
    { location: '恵比寿のバー', locationEn: 'Ebisu Bar', description: 'カウンターで膝が触れた', descriptionEn: 'Knees touched at the counter', phase: 'escalation', emoji: '🥃' },
    { location: 'カラオケ', locationEn: 'Karaoke', description: 'デュエットで顔が近づいた', descriptionEn: 'Faces got close during a duet', phase: 'escalation', emoji: '🎤' },
    { location: 'ディズニーシー', locationEn: 'DisneySea', description: '待ち時間に肩にもたれた', descriptionEn: 'Leaned on shoulder during the wait', phase: 'escalation', emoji: '🎢' },
    { location: '鎌倉', locationEn: 'Kamakura', description: '海を見ながら将来の話をした', descriptionEn: 'Talked about the future watching the sea', phase: 'escalation', emoji: '🌊' },
  ],
  critical: [
    { location: '六本木のクラブ', locationEn: 'Roppongi Club', description: '踊りながら耳元で囁いた', descriptionEn: 'Whispered in the ear while dancing', phase: 'critical', emoji: '💃' },
    { location: 'タクシーの後部座席', locationEn: 'Taxi Backseat', description: '行き先をまだ言っていない', descriptionEn: 'Haven\'t said the destination yet', phase: 'critical', emoji: '🚕' },
    { location: '深夜の公園', locationEn: 'Late Night Park', description: 'ベンチでキスした', descriptionEn: 'Kissed on a bench', phase: 'critical', emoji: '🌙' },
    { location: '彼女の最寄駅', locationEn: 'Her Station', description: '改札の前で立ち止まった', descriptionEn: 'Stopped in front of the gate', phase: 'critical', emoji: '🚉' },
  ],
  imminent: [
    { location: 'ラブホ街', locationEn: 'Love Hotel Area', description: 'ネオンが2人を照らしている', descriptionEn: 'Neon lights on two silhouettes', phase: 'imminent', emoji: '🏩' },
    { location: '彼女の部屋', locationEn: 'Her Apartment', description: '「散らかってるけど」', descriptionEn: '"It\'s messy but..."', phase: 'imminent', emoji: '🚪' },
    { location: 'ホテルのロビー', locationEn: 'Hotel Lobby', description: 'チェックインを済ませた', descriptionEn: 'Checked in', phase: 'imminent', emoji: '🛎️' },
  ],
};

// Generate memories for a couple based on their current phase
export function generateDateTimeline(
  couplePhase: Phase,
  seed: number
): DateMemory[] {
  const phases: Phase[] = ['seed', 'approach', 'escalation', 'critical', 'imminent'];
  const currentIdx = phases.indexOf(couplePhase);
  const timeline: DateMemory[] = [];

  let s = seed;
  const rng = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

  for (let i = 0; i <= currentIdx; i++) {
    const pool = DATE_MEMORY_POOLS[phases[i]];
    const pick = pool[Math.floor(rng() * pool.length)];
    timeline.push({ ...pick, id: `mem-${i}-${seed}` });
  }

  return timeline;
}
