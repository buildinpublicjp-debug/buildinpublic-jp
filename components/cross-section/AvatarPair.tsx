'use client';

import { useMemo } from 'react';
import type { Phase } from '../../engine/scoring';
import type { EmotionState } from '../../engine/emotions';
import type { Gender } from '../../engine/personGenerator';

interface AvatarData {
  name: string;
  gender: Gender;
  phase: Phase;
  emotions: EmotionState;
  score: number;
  bodyAngle: number;
}

interface AvatarPairProps {
  personA: AvatarData;
  personB: AvatarData;
  /** SVG描画幅 */
  width?: number;
  /** SVG描画高さ */
  height?: number;
}

// フェーズ別の体の色味（ほてり表現）
const PHASE_SKIN: Record<Phase, { base: string; blush: string; opacity: number }> = {
  seed:       { base: '#e8d5c4', blush: '#e8d5c4', opacity: 0 },
  approach:   { base: '#e8d5c4', blush: '#f0a0a0', opacity: 0.15 },
  escalation: { base: '#eac8b8', blush: '#f08080', opacity: 0.3 },
  critical:   { base: '#eab8a8', blush: '#ff6666', opacity: 0.5 },
  imminent:   { base: '#e8a898', blush: '#ff4444', opacity: 0.7 },
};

// 2人の距離（フェーズが進むほど近い）
const PHASE_DISTANCE: Record<Phase, number> = {
  seed: 60,
  approach: 48,
  escalation: 36,
  critical: 24,
  imminent: 14,
};

// フェーズ別のオーラ乱流強度
const PHASE_TURBULENCE: Record<Phase, { freq: number; scale: number }> = {
  seed:       { freq: 0.01, scale: 2 },
  approach:   { freq: 0.015, scale: 4 },
  escalation: { freq: 0.02, scale: 8 },
  critical:   { freq: 0.03, scale: 12 },
  imminent:   { freq: 0.04, scale: 18 },
};

// 感情からオーラカラーを算出
function emotionToAuraColor(emotions: EmotionState): string {
  const r = Math.min(255, Math.round(emotions.desire * 2.5 + emotions.excitement));
  const g = Math.min(255, Math.round(emotions.trust * 1.5 + emotions.tenderness));
  const b = Math.min(255, Math.round(emotions.vulnerability * 2 + emotions.surrender * 0.5));
  return `rgb(${r},${g},${b})`;
}

// フェーズ別の傾き（escalation以上で相手に傾く）
function phaseToLean(phase: Phase): number {
  switch (phase) {
    case 'seed': return 0;
    case 'approach': return 0;
    case 'escalation': return 3;
    case 'critical': return 6;
    case 'imminent': return 10;
  }
}

// 5つのアバターパターン（髪型・服装のバリエーション）
// nameのハッシュで決定
function nameToPattern(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 5;
}

export function AvatarPair({ personA, personB, width = 200, height = 120 }: AvatarPairProps) {
  const distance = PHASE_DISTANCE[personA.phase];
  const centerX = width / 2;
  const baseY = height * 0.75;

  // 2人の位置
  const posA = { x: centerX - distance / 2, y: baseY };
  const posB = { x: centerX + distance / 2, y: baseY };

  const skinA = PHASE_SKIN[personA.phase];
  const skinB = PHASE_SKIN[personB.phase];

  const auraA = useMemo(() => emotionToAuraColor(personA.emotions), [personA.emotions]);
  const auraB = useMemo(() => emotionToAuraColor(personB.emotions), [personB.emotions]);

  // スコアに応じたオーラの強度
  const avgScore = (personA.score + personB.score) / 2;
  const auraIntensity = Math.min(1, avgScore / 80);

  const turbulence = PHASE_TURBULENCE[personA.phase];
  const leanA = phaseToLean(personA.phase);
  const leanB = phaseToLean(personB.phase);

  const patternA = nameToPattern(personA.name);
  const patternB = nameToPattern(personB.name);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* #032 感情オーラ用SVGフィルター */}
        <filter id="aura-filter-a" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={turbulence.freq}
            numOctaves="3"
            result="turbulence"
          >
            <animate attributeName="seed" values="0;50;100;50;0" dur="6s" repeatCount="indefinite" />
            <animate attributeName="baseFrequency"
              values={`${turbulence.freq};${turbulence.freq * 1.5};${turbulence.freq}`}
              dur="4s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={turbulence.scale} />
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        <filter id="aura-filter-b" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={turbulence.freq}
            numOctaves="3"
            result="turbulence"
          >
            <animate attributeName="seed" values="30;80;130;80;30" dur="7s" repeatCount="indefinite" />
            <animate attributeName="baseFrequency"
              values={`${turbulence.freq};${turbulence.freq * 1.3};${turbulence.freq}`}
              dur="5s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale={turbulence.scale} />
          <feGaussianBlur stdDeviation="1.5" />
        </filter>

        {/* アバターAのオーラ */}
        <radialGradient id="aura-a" cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={auraA} stopOpacity={0.5 * auraIntensity} />
          <stop offset="60%" stopColor={auraA} stopOpacity={0.2 * auraIntensity} />
          <stop offset="100%" stopColor={auraA} stopOpacity={0} />
        </radialGradient>

        {/* アバターBのオーラ */}
        <radialGradient id="aura-b" cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={auraB} stopOpacity={0.5 * auraIntensity} />
          <stop offset="60%" stopColor={auraB} stopOpacity={0.2 * auraIntensity} />
          <stop offset="100%" stopColor={auraB} stopOpacity={0} />
        </radialGradient>

        {/* 2人の間の混ざるオーラ */}
        <linearGradient id="aura-merge" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor={auraA} stopOpacity={0.2 * auraIntensity} />
          <stop offset="50%" stopColor="#ff88aa" stopOpacity={0.3 * auraIntensity} />
          <stop offset="100%" stopColor={auraB} stopOpacity={0.2 * auraIntensity} />
        </linearGradient>
      </defs>

      {/* 2人の間のオーラ — スコアが高いほど強い */}
      {avgScore > 20 && (
        <ellipse
          cx={centerX}
          cy={baseY - 10}
          rx={distance * 0.8}
          ry={25}
          fill="url(#aura-merge)"
        >
          <animate
            attributeName="rx"
            values={`${distance * 0.7};${distance * 0.9};${distance * 0.7}`}
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0.8;1;0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* アバターA — #031 CSS transition で位置が滑らかに変化 + lean */}
      <g style={{ transition: 'transform 1.5s ease-in-out' }}
         transform={`translate(${posA.x}, ${posA.y})`}>
        <DeformedAvatar
          x={0}
          y={0}
          gender={personA.gender}
          skinBase={skinA.base}
          blushColor={skinA.blush}
          blushOpacity={skinA.opacity}
          auraFilterId="aura-filter-a"
          auraGradient="url(#aura-a)"
          facingRight={true}
          bodyAngle={personA.bodyAngle}
          leanAngle={leanA}
          pattern={patternA}
        />
      </g>

      {/* アバターB */}
      <g style={{ transition: 'transform 1.5s ease-in-out' }}
         transform={`translate(${posB.x}, ${posB.y})`}>
        <DeformedAvatar
          x={0}
          y={0}
          gender={personB.gender}
          skinBase={skinB.base}
          blushColor={skinB.blush}
          blushOpacity={skinB.opacity}
          auraFilterId="aura-filter-b"
          auraGradient="url(#aura-b)"
          facingRight={false}
          bodyAngle={personB.bodyAngle}
          leanAngle={leanB}
          pattern={patternB}
        />
      </g>

      {/* 名前 */}
      <text
        x={posA.x}
        y={baseY + 18}
        textAnchor="middle"
        fontSize="6"
        fill="white"
        fillOpacity="0.6"
      >
        {personA.name}
      </text>
      <text
        x={posB.x}
        y={baseY + 18}
        textAnchor="middle"
        fontSize="6"
        fill="white"
        fillOpacity="0.6"
      >
        {personB.name}
      </text>

      {/* スコア表示 */}
      <text
        x={centerX}
        y={height - 4}
        textAnchor="middle"
        fontSize="5"
        fill="#ff6688"
        fillOpacity={0.3 + auraIntensity * 0.5}
        letterSpacing="1"
      >
        {Math.round(avgScore)}%
      </text>
    </svg>
  );
}

// デフォルメアバター（トモコレ風 2-3頭身キャラ）
interface DeformedAvatarProps {
  x: number;
  y: number;
  gender: Gender;
  skinBase: string;
  blushColor: string;
  blushOpacity: number;
  auraFilterId: string;
  auraGradient: string;
  facingRight: boolean;
  bodyAngle: number;
  leanAngle: number;
  pattern: number;
}

// 髪型パス生成（5パターン: 0-2 男性, 3-4 女性）
function getHairPath(
  x: number, headY: number, headR: number, gender: Gender, pattern: number
): { path: string; fill: string; extra?: string } {
  const effectivePattern = gender === 'male' ? pattern % 3 : 3 + (pattern % 2);
  const colors = ['#1a1a2a', '#2a1a0a', '#3a2a1a', '#1a0a0a', '#2a0a1a'];
  const fill = colors[effectivePattern];

  switch (effectivePattern) {
    case 0: // 男性: 短髪 (ツンツン)
      return {
        path: `M ${x - headR} ${headY - 2} Q ${x - headR + 2} ${headY - headR - 6} ${x} ${headY - headR - 3} Q ${x + headR - 2} ${headY - headR - 6} ${x + headR} ${headY - 2}`,
        fill,
        extra: `M ${x - 3} ${headY - headR - 1} L ${x - 5} ${headY - headR - 6} M ${x} ${headY - headR - 2} L ${x + 1} ${headY - headR - 7} M ${x + 4} ${headY - headR - 1} L ${x + 5} ${headY - headR - 5}`,
      };
    case 1: // 男性: サイド分け
      return {
        path: `M ${x - headR - 1} ${headY - 1} Q ${x - headR} ${headY - headR - 3} ${x + 2} ${headY - headR - 2} Q ${x + headR + 1} ${headY - headR - 1} ${x + headR + 1} ${headY}`,
        fill,
      };
    case 2: // 男性: マッシュ
      return {
        path: `M ${x - headR - 1} ${headY + 1} Q ${x - headR - 1} ${headY - headR - 4} ${x} ${headY - headR - 3} Q ${x + headR + 1} ${headY - headR - 4} ${x + headR + 1} ${headY + 1} L ${x + headR} ${headY - 1} Q ${x} ${headY - headR + 2} ${x - headR} ${headY - 1} Z`,
        fill,
      };
    case 3: // 女性: ロングヘア
      return {
        path: `M ${x - headR - 2} ${headY + 10} Q ${x - headR - 2} ${headY - headR - 3} ${x} ${headY - headR - 3} Q ${x + headR + 2} ${headY - headR - 3} ${x + headR + 2} ${headY + 10} L ${x + headR} ${headY + 8} Q ${x + headR} ${headY - headR} ${x} ${headY - headR - 1} Q ${x - headR} ${headY - headR} ${x - headR} ${headY + 8} Z`,
        fill,
      };
    case 4: // 女性: ボブ
      return {
        path: `M ${x - headR - 1} ${headY + 4} Q ${x - headR - 2} ${headY - headR - 3} ${x} ${headY - headR - 3} Q ${x + headR + 2} ${headY - headR - 3} ${x + headR + 1} ${headY + 4} Q ${x + headR} ${headY + 5} ${x + headR - 2} ${headY + 6} L ${x - headR + 2} ${headY + 6} Q ${x - headR} ${headY + 5} ${x - headR - 1} ${headY + 4} Z`,
        fill,
      };
    default:
      return { path: '', fill };
  }
}

// 服の形生成
function getClothingPath(x: number, y: number, bodyW: number, bodyH: number, gender: Gender): string {
  const top = y - bodyH / 2 - 2;
  const bot = y + bodyH / 2;
  const left = x - bodyW / 2 - 1;
  const right = x + bodyW / 2 + 1;

  if (gender === 'female') {
    // ワンピース風
    return `M ${left + 2} ${top + 2} Q ${x} ${top} ${right - 2} ${top + 2} L ${right + 2} ${bot} Q ${x} ${bot + 2} ${left - 2} ${bot} Z`;
  }
  // シャツ風
  return `M ${left + 1} ${top + 1} L ${right - 1} ${top + 1} L ${right} ${bot} L ${left} ${bot} Z`;
}

function DeformedAvatar({
  x, y, gender, skinBase, blushColor, blushOpacity,
  auraFilterId, auraGradient, facingRight, bodyAngle, leanAngle, pattern,
}: DeformedAvatarProps) {
  // 2-3頭身: 大きめの頭 + 小さい体
  const headR = 10;
  const headY = y - 28;
  const bodyW = 14;
  const bodyH = 16;
  const bodyY = y - 8;

  // 向き
  const scaleX = facingRight ? 1 : -1;
  const eyeOffsetX = 3 * scaleX;

  // 体の傾き + #031 lean toward
  const baseTilt = facingRight ? -bodyAngle * 0.3 : bodyAngle * 0.3;
  const lean = facingRight ? -leanAngle : leanAngle;
  const tilt = baseTilt + lean;

  // 服色（MBTIから取得する想定だがここではパターン別）
  const clothingColors = ['#445588', '#885544', '#448855', '#884488', '#886644'];
  const clothingColor = clothingColors[pattern % clothingColors.length];

  const hair = getHairPath(x, headY, headR, gender, pattern);

  return (
    <g transform={`rotate(${tilt}, ${x}, ${y})`}>
      {/* #032 感情オーラ（SVGフィルターベース） */}
      <ellipse
        cx={x}
        cy={y - 15}
        rx={20}
        ry={28}
        fill={auraGradient}
        filter={`url(#${auraFilterId})`}
      >
        <animate
          attributeName="ry"
          values="26;30;26"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 腕（体の後ろ側） */}
      <line
        x1={x - 5 * scaleX}
        y1={bodyY - 4}
        x2={x - 10 * scaleX}
        y2={bodyY + 6}
        stroke={skinBase}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 脚 */}
      <line x1={x - 3} y1={y} x2={x - 4} y2={y + 8} stroke={skinBase} strokeWidth="2.5" strokeLinecap="round" />
      <line x1={x + 3} y1={y} x2={x + 4} y2={y + 8} stroke={skinBase} strokeWidth="2.5" strokeLinecap="round" />
      {/* 靴 */}
      <ellipse cx={x - 4} cy={y + 9} rx={2.5} ry={1.2} fill="#222" />
      <ellipse cx={x + 4} cy={y + 9} rx={2.5} ry={1.2} fill="#222" />

      {/* 体（服） */}
      <path
        d={getClothingPath(x, bodyY, bodyW, bodyH, gender)}
        fill={clothingColor}
        fillOpacity="0.85"
        stroke={clothingColor}
        strokeWidth="0.5"
        strokeOpacity="0.4"
      />

      {/* 服のハイライト */}
      <line
        x1={x - bodyW / 4}
        y1={bodyY - bodyH / 2}
        x2={x - bodyW / 4 - 1}
        y2={bodyY + bodyH / 2 - 2}
        stroke="white"
        strokeWidth="0.5"
        strokeOpacity="0.15"
      />

      {/* ほてり — 体 */}
      {blushOpacity > 0 && (
        <ellipse
          cx={x}
          cy={bodyY}
          rx={bodyW / 2}
          ry={bodyH / 2}
          fill={blushColor}
          fillOpacity={blushOpacity * 0.3}
        >
          <animate
            attributeName="fill-opacity"
            values={`${blushOpacity * 0.2};${blushOpacity * 0.4};${blushOpacity * 0.2}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

      {/* 腕（前側） */}
      <line
        x1={x + 5 * scaleX}
        y1={bodyY - 4}
        x2={x + 10 * scaleX}
        y2={bodyY + 4}
        stroke={skinBase}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 首 */}
      <rect
        x={x - 2}
        y={y - 20}
        width={4}
        height={6}
        fill={skinBase}
        rx="1"
      />

      {/* 頭 */}
      <circle
        cx={x}
        cy={headY}
        r={headR}
        fill={skinBase}
      />

      {/* 髪 */}
      <path d={hair.path} fill={hair.fill} fillOpacity="0.9" />
      {hair.extra && (
        <path d={hair.extra} fill="none" stroke={hair.fill} strokeWidth="1" strokeOpacity="0.8" />
      )}

      {/* 目（2つのドット） */}
      <circle cx={x + eyeOffsetX - 2.5 * scaleX} cy={headY - 1} r={1.3} fill="#1a1a2a" />
      <circle cx={x + eyeOffsetX + 2.5 * scaleX} cy={headY - 1} r={1.3} fill="#1a1a2a" />
      {/* 目のハイライト */}
      <circle cx={x + eyeOffsetX - 2.5 * scaleX + 0.4} cy={headY - 1.5} r={0.4} fill="white" fillOpacity="0.9" />
      <circle cx={x + eyeOffsetX + 2.5 * scaleX + 0.4} cy={headY - 1.5} r={0.4} fill="white" fillOpacity="0.9" />

      {/* ほっぺ（ほてり表現） */}
      {blushOpacity > 0 && (
        <>
          <circle
            cx={x + eyeOffsetX - 5 * scaleX}
            cy={headY + 3}
            r={2.5}
            fill={blushColor}
            fillOpacity={blushOpacity}
          >
            <animate
              attributeName="fill-opacity"
              values={`${blushOpacity * 0.6};${blushOpacity};${blushOpacity * 0.6}`}
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx={x + eyeOffsetX + 5 * scaleX}
            cy={headY + 3}
            r={2.5}
            fill={blushColor}
            fillOpacity={blushOpacity}
          >
            <animate
              attributeName="fill-opacity"
              values={`${blushOpacity * 0.5};${blushOpacity * 0.9};${blushOpacity * 0.5}`}
              dur="1.8s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* 口 */}
      <path
        d={`M ${x - 2} ${headY + 4} Q ${x} ${headY + 6} ${x + 2} ${headY + 4}`}
        fill="none"
        stroke="#cc8888"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />

      {/* #027 アイドル呼吸アニメーション */}
      <animateTransform
        attributeName="transform"
        type="translate"
        values="0 0; 0 -0.5; 0 0"
        dur="3s"
        repeatCount="indefinite"
        additive="sum"
      />
    </g>
  );
}
