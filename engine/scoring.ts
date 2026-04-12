// Foreplay Score Calculator

import { EmotionState, clamp } from './emotions';

export function calcForeplayScore(his: EmotionState, hers: EmotionState): number {
  const desireSync = Math.min(his.desire, hers.desire) * 0.30;
  const vulnSum = (his.vulnerability + hers.vulnerability) * 0.12;
  const trustBase = Math.min(his.trust, hers.trust) * 0.18;
  const exciteAvg = (his.excitement + hers.excitement) * 0.08;
  const tenderSum = (his.tenderness + hers.tenderness) * 0.05;
  const powerDynamic = Math.abs(his.power - hers.power) * 0.06;
  const surrenderBonus = Math.min(his.surrender, hers.surrender) * 0.04;

  const anxietyPenalty = Math.max(0, (his.anxiety + hers.anxiety - 80)) * 0.04;
  const denialPenalty = (his.denial + hers.denial) * 0.03;
  const jealousyEffect = Math.min(20, his.jealousy + hers.jealousy) * 0.02
    - Math.max(0, (his.jealousy + hers.jealousy - 40)) * 0.03;

  return clamp(Math.round(
    desireSync + vulnSum + trustBase + exciteAvg + tenderSum +
    powerDynamic + surrenderBonus + jealousyEffect -
    anxietyPenalty - denialPenalty
  ));
}

export function phaseFromHours(hoursLeft: number): Phase {
  if (hoursLeft < 2) return 'imminent';
  if (hoursLeft < 5) return 'critical';
  if (hoursLeft < 10) return 'escalation';
  if (hoursLeft < 18) return 'approach';
  return 'seed';
}

export type Phase = 'seed' | 'approach' | 'escalation' | 'critical' | 'imminent';

export const PHASE_META: Record<Phase, { label: string; labelEn: string; color: string }> = {
  seed:       { label: '種まき', labelEn: 'Seed', color: '#64a0ff' },
  approach:   { label: '接近', labelEn: 'Approach', color: '#ffc832' },
  escalation: { label: '加速', labelEn: 'Escalation', color: '#ff8200' },
  critical:   { label: '臨界', labelEn: 'Critical', color: '#ff3214' },
  imminent:   { label: '直前', labelEn: 'Imminent', color: '#ff0a28' },
};

export function scoreToColor(score: number, alpha = 0.8): string {
  if (score > 88) return `rgba(255,10,40,${alpha})`;
  if (score > 75) return `rgba(255,60,0,${alpha})`;
  if (score > 60) return `rgba(255,130,0,${alpha})`;
  if (score > 40) return `rgba(255,190,0,${alpha})`;
  return `rgba(100,160,255,${alpha})`;
}
