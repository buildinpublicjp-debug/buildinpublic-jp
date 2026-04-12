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

// 感情からオーラカラーを算出
function emotionToAuraColor(emotions: EmotionState): string {
  const r = Math.min(255, Math.round(emotions.desire * 2.5 + emotions.excitement));
  const g = Math.min(255, Math.round(emotions.trust * 1.5 + emotions.tenderness));
  const b = Math.min(255, Math.round(emotions.vulnerability * 2 + emotions.surrender * 0.5));
  return `rgb(${r},${g},${b})`;
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

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* アバターAのオーラ */}
        <radialGradient id="aura-a" cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={auraA} stopOpacity={0.4 * auraIntensity} />
          <stop offset="100%" stopColor={auraA} stopOpacity={0} />
        </radialGradient>

        {/* アバターBのオーラ */}
        <radialGradient id="aura-b" cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor={auraB} stopOpacity={0.4 * auraIntensity} />
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

      {/* アバターA */}
      <DeformedAvatar
        x={posA.x}
        y={posA.y}
        gender={personA.gender}
        skinBase={skinA.base}
        blushColor={skinA.blush}
        blushOpacity={skinA.opacity}
        auraGradient="url(#aura-a)"
        facingRight={true}
        bodyAngle={personA.bodyAngle}
      />

      {/* アバターB */}
      <DeformedAvatar
        x={posB.x}
        y={posB.y}
        gender={personB.gender}
        skinBase={skinB.base}
        blushColor={skinB.blush}
        blushOpacity={skinB.opacity}
        auraGradient="url(#aura-b)"
        facingRight={false}
        bodyAngle={personB.bodyAngle}
      />

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

// デフォルメアバター（トモコレ風のシンプルなキャラ）
interface DeformedAvatarProps {
  x: number;
  y: number;
  gender: Gender;
  skinBase: string;
  blushColor: string;
  blushOpacity: number;
  auraGradient: string;
  facingRight: boolean;
  bodyAngle: number;
}

function DeformedAvatar({
  x, y, gender, skinBase, blushColor, blushOpacity,
  auraGradient, facingRight, bodyAngle,
}: DeformedAvatarProps) {
  // トモコレ風: 大きめの頭 + 小さい体
  const headR = 10;
  const headY = y - 28;
  const bodyW = 12;
  const bodyH = 16;

  // 向き
  const scaleX = facingRight ? 1 : -1;
  const eyeOffsetX = 3 * scaleX;

  // 体の傾き（bodyAngle: 相手に向かって傾く）
  const tilt = facingRight ? -bodyAngle * 0.3 : bodyAngle * 0.3;

  // 性別による微調整
  const hairLength = gender === 'female' ? 14 : 6;

  return (
    <g transform={`rotate(${tilt}, ${x}, ${y})`}>
      {/* オーラ */}
      <ellipse
        cx={x}
        cy={y - 15}
        rx={18}
        ry={24}
        fill={auraGradient}
      >
        <animate
          attributeName="ry"
          values="22;26;22"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* 体 */}
      <ellipse
        cx={x}
        cy={y - 8}
        rx={bodyW / 2}
        ry={bodyH / 2}
        fill={skinBase}
        fillOpacity="0.9"
      />

      {/* ほてり — 体 */}
      {blushOpacity > 0 && (
        <ellipse
          cx={x}
          cy={y - 8}
          rx={bodyW / 2}
          ry={bodyH / 2}
          fill={blushColor}
          fillOpacity={blushOpacity * 0.5}
        >
          <animate
            attributeName="fill-opacity"
            values={`${blushOpacity * 0.3};${blushOpacity * 0.6};${blushOpacity * 0.3}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
      )}

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
      <ellipse
        cx={x}
        cy={headY - 3}
        rx={headR + 1}
        ry={hairLength}
        fill={gender === 'female' ? '#2a1a0a' : '#1a1a2a'}
        fillOpacity="0.9"
        clipPath={`inset(0 0 ${hairLength - headR + 2}px 0)`}
      />
      {/* 前髪 */}
      <path
        d={`M ${x - headR} ${headY - 2} Q ${x} ${headY - headR - 4} ${x + headR} ${headY - 2}`}
        fill={gender === 'female' ? '#2a1a0a' : '#1a1a2a'}
        fillOpacity="0.9"
      />

      {/* 目 */}
      <circle cx={x + eyeOffsetX} cy={headY - 1} r={1.5} fill="#1a1a2a" />
      <circle cx={x + eyeOffsetX} cy={headY - 1} r={0.5} fill="white" fillOpacity="0.8" />

      {/* ほっぺ（ほてり表現） */}
      {blushOpacity > 0 && (
        <>
          <circle
            cx={x + eyeOffsetX + 4 * scaleX}
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
        </>
      )}

      {/* 口 */}
      <path
        d={`M ${x + eyeOffsetX - 2} ${headY + 4} Q ${x + eyeOffsetX} ${headY + 6} ${x + eyeOffsetX + 2} ${headY + 4}`}
        fill="none"
        stroke="#cc8888"
        strokeWidth="0.5"
        strokeOpacity="0.6"
      />
    </g>
  );
}
