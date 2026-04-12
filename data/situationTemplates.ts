// Situation text templates by phase

import type { Phase } from '../engine/scoring';

interface CharRef { age: number; mbti: string; job: string; }

type SituationFn = (area: string, him: CharRef, her: CharRef) => string;

const TEMPLATES: Record<Phase, SituationFn[]> = {
  imminent: [
    (a,h,s) => `${a}。ホテルの部屋のドアが閉まった。${h.job}の彼(${h.age})は窓際に立っている。${s.job}の彼女(${s.age})がベッドに腰掛けた。`,
    (a,h,s) => `彼女の部屋。${s.age}歳の${s.job}が「散らかってるけど」と言った。嘘だ。花まで飾ってある。`,
    (a,h,s) => `キスした直後。額をくっつけたまま。${h.mbti}の彼は次の一手を計算している。${s.mbti}の彼女は計算なんかしていない。`,
    (a,h,s) => `「シャワー浴びてくる」。彼女が立ち上がった。ドアが閉まる。水の音。${h.job}の彼は天井を見ている。`,
  ],
  critical: [
    (a,h,s) => `終電を逃した。${a}の路地。${h.age}歳と${s.age}歳。2人ともそれを知っている。`,
    (a,h,s) => `${a}のラブホ街。看板のネオンが2人を照らしている。${s.mbti}の彼女は少し前を歩いている。`,
    (a,h,s) => `「帰りたくないな」。${s.job}の彼女(${s.age})がそう言った。${a}の街灯の下。`,
    (a,h,s) => `タクシーの後部座席。行き先はまだ言っていない。膝が触れている。`,
  ],
  escalation: [
    (a,h,s) => `${a}の2軒目のバー。カウンター。${h.age}歳の${h.job}と${s.age}歳の${s.job}。肩が触れている。どちらも離れない。`,
    (a,h,s) => `笑い過ぎて彼女(${s.mbti})が彼の肩にもたれかかった。1秒。2秒。まだ離れない。`,
    (a,h,s) => `${a}の居酒屋の個室。足がテーブルの下で触れた。${h.job}の彼は箸を止めた。`,
    (a,h,s) => `彼女(${s.age})が髪をかき上げた。うなじが見えた。${h.mbti}の彼はそこから目を逸らせない。`,
  ],
  approach: [
    (a,h,s) => `${a}の駅の改札。${h.age}歳の${h.job}が待っている。改札の向こうから${s.age}歳の${s.job}が歩いてくる。`,
    (a,h,s) => `レストランに向かって歩いている。${h.mbti}と${s.mbti}。並んで歩く距離は50cm。`,
    (a,h,s) => `${a}のイタリアン。対面のテーブル席。乾杯。グラスが触れる音。目が合う。`,
  ],
  seed: [
    (a,h,s) => `${h.age}歳の${h.job}はシャワーを浴びている。いつもより丁寧に。今夜、${s.age}歳の${s.job}と会う。`,
    (a,h,s) => `${s.age}歳の${s.job}は鏡の前にいる。ピアスを2回変えた。「気合い入れすぎかな」と思って、最初のに戻した。`,
    (a,h,s) => `仕事中。${h.job}の彼(${h.age})は30分に1回スマホを確認する。既読がついた。返事はまだ。`,
  ],
};

export function getSituation(
  phase: Phase, area: string, him: CharRef, her: CharRef, r: () => number
): string {
  const templates = TEMPLATES[phase];
  return templates[Math.floor(r() * templates.length)](area, him, her);
}
