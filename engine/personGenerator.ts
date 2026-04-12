// AI Person Generator — seeded random generation for 300 characters

import { MBTIType, MBTI_PROFILES, ALL_MBTI_TYPES, getMBTIChemistry } from './mbti';
import { EmotionState, createEmotionState } from './emotions';
import { Phase, phaseFromHours } from './scoring';
import { AREAS, Area } from '../data/areas';
import { getSituation } from '../data/situationTemplates';

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type Gender = 'male' | 'female';

export interface AIPerson {
  id: string;
  name: { ja: string; en: string };
  age: number;
  gender: Gender;
  mbti: MBTIType;
  attachmentStyle: AttachmentStyle;
  job: { ja: string; en: string };
  area: string;
  appearance: { height: number; build: string; style: string };
  position: { x: number; z: number };
  currentPhase: Phase;
  hoursUntilSex: number;
  emotions: EmotionState;
  situation: string;
  score: number;
  bodyAngle: number;
}

export interface Relationship {
  id: string;
  personA: string;
  personB: string;
  stage: string;
  meetCount: number;
  howMet: string;
  chemistryScore: number;
}

// Seeded PRNG
function srand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const ATTACHMENT_DIST: [AttachmentStyle, number][] = [
  ['secure', 0.56], ['anxious', 0.76], ['avoidant', 0.94], ['disorganized', 1.0]
];

const JA_SURNAMES = ['田中','佐藤','鈴木','高橋','渡辺','伊藤','山本','中村','小林','加藤','吉田','山田','松本','井上','木村','林','斎藤','清水','山口','森'];
const JA_MALE_NAMES = ['翔太','大輝','蓮','悠真','陽翔','湊','悠人','朝陽','蒼','律','健太','拓海','颯太','奏','瑛太','柊','結翔','陸','涼介','海斗'];
const JA_FEMALE_NAMES = ['美咲','陽菜','凛','結衣','さくら','芽衣','莉子','心春','葵','楓','美月','花音','ひなた','詩','紬','琴音','彩花','優奈','真央','七海'];

const M_JOBS = ['エンジニア','営業','バーテンダー','大学生','コンサル','料理人','デザイナー','起業家','医師','音楽家','建築士','教師'];
const F_JOBS = ['看護師','編集者','大学生','カフェ店員','デザイナー','花屋','翻訳家','美容師','マーケター','ダンサー','薬剤師','教師'];
const M_JOBS_EN = ['Engineer','Sales','Bartender','Student','Consultant','Chef','Designer','Entrepreneur','Doctor','Musician','Architect','Teacher'];
const F_JOBS_EN = ['Nurse','Editor','Student','Barista','Designer','Florist','Translator','Stylist','Marketer','Dancer','Pharmacist','Teacher'];

const STAGES = ['初対面','2回目','3回目','曖昧','恋人','マッチングアプリ'];
const HOW_METS = ['マッチングアプリ','友達の紹介','職場','大学','バーで','イベントで','SNSのDM','趣味のコミュニティ','行きつけの店','合コン'];

function pickMBTI(r: () => number): MBTIType {
  const roll = r();
  let cumulative = 0;
  for (const t of ALL_MBTI_TYPES) {
    cumulative += MBTI_PROFILES[t].population;
    if (roll <= cumulative) return t;
  }
  return 'ISFJ';
}

function pickAttachment(r: () => number): AttachmentStyle {
  const roll = r();
  for (const [style, threshold] of ATTACHMENT_DIST) {
    if (roll <= threshold) return style;
  }
  return 'secure';
}

export function generatePerson(id: number): AIPerson {
  const r = srand(id * 7919 + 42);
  const gender: Gender = r() > 0.5 ? 'male' : 'female';
  const age = 18 + Math.floor(r() * 18);
  const mbti = pickMBTI(r);
  const attachment = pickAttachment(r);

  const surname = JA_SURNAMES[Math.floor(r() * JA_SURNAMES.length)];
  const firstName = gender === 'male'
    ? JA_MALE_NAMES[Math.floor(r() * JA_MALE_NAMES.length)]
    : JA_FEMALE_NAMES[Math.floor(r() * JA_FEMALE_NAMES.length)];

  const jobIdx = Math.floor(r() * 12);
  const job = gender === 'male'
    ? { ja: M_JOBS[jobIdx], en: M_JOBS_EN[jobIdx] }
    : { ja: F_JOBS[jobIdx], en: F_JOBS_EN[jobIdx] };

  const areaWeights = AREAS.flatMap(a => Array(a.weight).fill(a));
  const area = areaWeights[Math.floor(r() * areaWeights.length)];

  const hoursLeft = r() * 24;
  const phase = phaseFromHours(hoursLeft);
  const desire = phase==='imminent'?85+r()*15:phase==='critical'?70+r()*20:phase==='escalation'?50+r()*25:phase==='approach'?30+r()*20:15+r()*20;
  const score = Math.round(Math.min(99, desire*0.4+(100-hoursLeft/24*100)*0.3+r()*15));

  const emotions = createEmotionState({
    desire: Math.round(desire),
    anxiety: Math.round(phase==='seed'?20+r()*25:phase==='approach'?25+r()*20:15+r()*20),
    trust: Math.round(30+r()*30),
    excitement: Math.round(desire*0.8+r()*10),
  });

  const situation = getSituation(phase, area.name,
    { age, mbti, job: job.ja },
    { age: 18+Math.floor(r()*18), mbti: pickMBTI(r), job: gender==='male'?F_JOBS[Math.floor(r()*12)]:M_JOBS[Math.floor(r()*12)] },
    r
  );

  return {
    id: `person_${id}`,
    name: { ja: `${surname} ${firstName}`, en: `${firstName} ${surname}` },
    age, gender, mbti, attachmentStyle: attachment, job, area: area.name,
    appearance: {
      height: gender==='male' ? 165+Math.round(r()*20) : 150+Math.round(r()*18),
      build: ['slim','average','athletic','muscular'][Math.floor(r()*4)],
      style: ['casual','smart','street','minimal'][Math.floor(r()*4)],
    },
    position: { x: area.x + (r()-0.5)*40, z: area.z + (r()-0.5)*40 },
    currentPhase: phase,
    hoursUntilSex: Math.round(hoursLeft*10)/10,
    emotions, situation, score,
    bodyAngle: r() * Math.PI * 2,
  };
}

export function generateAllPeople(count = 300): AIPerson[] {
  return Array.from({ length: count }, (_, i) => generatePerson(i));
}

export function generateRelationships(people: AIPerson[]): Relationship[] {
  const males = people.filter(p => p.gender === 'male');
  const females = people.filter(p => p.gender === 'female');
  const pairs: Relationship[] = [];
  const usedM = new Set<string>();
  const usedF = new Set<string>();

  const candidates: { m: AIPerson; f: AIPerson; score: number }[] = [];
  for (const m of males) {
    for (const f of females) {
      candidates.push({ m, f, score: getMBTIChemistry(m.mbti, f.mbti).score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const r = srand(12345);
  for (const c of candidates) {
    if (usedM.has(c.m.id) || usedF.has(c.f.id)) continue;
    const stage = STAGES[Math.floor(r() * STAGES.length)];
    pairs.push({
      id: `rel_${pairs.length}`,
      personA: c.m.id, personB: c.f.id,
      stage, meetCount: stage==='初対面'?1:1+Math.floor(r()*15),
      howMet: HOW_METS[Math.floor(r()*HOW_METS.length)],
      chemistryScore: c.score,
    });
    usedM.add(c.m.id);
    usedF.add(c.f.id);
    if (pairs.length >= 150) break;
  }
  return pairs;
}
