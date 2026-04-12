'use client';

import { useState, useMemo } from 'react';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore, type AnalysisLayer } from '../../stores/gameStore';
import type { Phase } from '../../engine/scoring';
import { CROSS_SECTION_SLOTS, DISTRICTS } from '../../data/areas';
import type { District } from '../../data/areas';

// 3エリア定義（デフォルメ座標）
interface MapArea {
  name: string;
  nameEn: string;
  district: District;
  // デフォルメマップ上の位置 (0-100%)
  cx: number;
  cy: number;
  // エリア範囲の半径
  radius: number;
  // エリアの雰囲気カラー
  color: string;
  // 含まれる実データエリア名
  includes: string[];
  // ランドマーク
  landmark: string;
}

const MAP_AREAS: MapArea[] = [
  {
    name: '渋谷',
    nameEn: 'SHIBUYA',
    district: 'shibuya',
    cx: 25,
    cy: 55,
    radius: 28,
    color: '#ff3366',
    includes: ['円山町', '神泉', '渋谷駅前', '恵比寿', '中目黒', '表参道', '下北沢', '三軒茶屋'],
    landmark: '109',
  },
  {
    name: '新宿',
    nameEn: 'SHINJUKU',
    district: 'shinjuku',
    cx: 50,
    cy: 25,
    radius: 24,
    color: '#ff6600',
    includes: ['歌舞伎町', '新宿三丁目', '神楽坂', '池袋', '高円寺'],
    landmark: 'ゴールデン街',
  },
  {
    name: '六本木',
    nameEn: 'ROPPONGI',
    district: 'roppongi',
    cx: 75,
    cy: 55,
    radius: 24,
    color: '#9933ff',
    includes: ['六本木', '西麻布', '麻布十番', '銀座', '自由が丘', '吉祥寺', '錦糸町'],
    landmark: 'HILLS',
  },
];

// フェーズ別の色
const PHASE_COLORS: Record<Phase, string> = {
  seed: '#4488ff',
  approach: '#44ddaa',
  escalation: '#ffaa00',
  critical: '#ff4444',
  imminent: '#ff0066',
};

// フェーズ別のパルスアニメーション速度（ms）
const PHASE_PULSE: Record<Phase, number> = {
  seed: 3000,
  approach: 2400,
  escalation: 1800,
  critical: 1200,
  imminent: 600,
};

// ハートビートのスケールアニメーション values（フェーズ別）
const HEARTBEAT_SCALE: Record<Phase, { values: string; dur: string }> = {
  seed:       { values: '1;1.15;1;1.05;1',   dur: '3s' },
  approach:   { values: '1;1.2;1;1.1;1',     dur: '2.4s' },
  escalation: { values: '1;1.25;1;1.1;1',    dur: '1.8s' },
  critical:   { values: '1;1.3;0.95;1.15;1', dur: '1.2s' },
  imminent:   { values: '1;1.4;0.9;1.2;1',   dur: '0.6s' },
};

// 雨を表示するかの判定（時間ベース: 毎時23分-53分の間に降る）
function shouldShowRain(): boolean {
  const min = new Date().getMinutes();
  return min >= 23 && min <= 53;
}

interface CoupleOnMap {
  id: string;
  nameA: string;
  nameB: string;
  phase: Phase;
  score: number;
  area: string;
  // マップ上のオフセット位置
  offsetX: number;
  offsetY: number;
  // Layer data
  desire: number;      // average desire 0-100
  trust: number;       // average trust 0-100
  anxiety: number;     // average anxiety 0-100
  chemistry: number;   // MBTI chemistry score 0-100
  personAId: string;
  personBId: string;
}

// Desire layer: blue(0) → yellow(50) → red(100)
function desireColor(value: number): string {
  const t = value / 100;
  if (t < 0.5) {
    const r = Math.round(60 + t * 2 * 195);
    const g = Math.round(100 + t * 2 * 155);
    const b = Math.round(255 - t * 2 * 155);
    return `rgb(${r},${g},${b})`;
  }
  const r = 255;
  const g = Math.round(255 - (t - 0.5) * 2 * 230);
  const b = Math.round(100 - (t - 0.5) * 2 * 100);
  return `rgb(${r},${g},${b})`;
}

// Layer button config
const LAYER_BUTTONS: { id: AnalysisLayer; label: string }[] = [
  { id: 'default', label: 'DEFAULT' },
  { id: 'desire', label: 'DESIRE' },
  { id: 'trust', label: 'TRUST' },
  { id: 'anxiety', label: 'ANXIETY' },
  { id: 'chemistry', label: 'CHEMISTRY' },
];

interface CityMapProps {
  onSelectCouple?: (relationshipId: string, personAId: string, personBId: string) => void;
}

export function CityMap({ onSelectCouple }: CityMapProps) {
  const relationships = usePeopleStore(s => s.relationships);
  const getCrossSectionCouples = usePeopleStore(s => s.getCrossSectionCouples);
  const activeLayer = useGameStore(s => s.activeLayer);
  const setActiveLayer = useGameStore(s => s.setActiveLayer);
  const [hoveredCouple, setHoveredCouple] = useState<string | null>(null);

  const showRain = useMemo(() => shouldShowRain(), []);

  // MVP10組のみをエリアにマッピング（同心円配置で密集回避）
  const couples = useMemo(() => {
    const mvpCouples = getCrossSectionCouples();
    const result: CoupleOnMap[] = [];

    // MVPカップルをディストリクト別に分類
    const areaGroups: Record<string, { rel: typeof relationships[0]; a: (typeof mvpCouples)[0]['personA']; b: (typeof mvpCouples)[0]['personB']; }[]> = {};
    for (const area of MAP_AREAS) {
      areaGroups[area.name] = [];
    }

    // CROSS_SECTION_SLOTSのdistrict情報を使ってマッピング
    for (let i = 0; i < mvpCouples.length; i++) {
      const couple = mvpCouples[i];
      const slot = CROSS_SECTION_SLOTS[i];
      const mapArea = MAP_AREAS.find(ma => ma.district === slot.district);
      if (!mapArea) continue;
      areaGroups[mapArea.name].push({ rel: couple.relationship, a: couple.personA, b: couple.personB });
    }

    // エリアごとに同心円配置
    for (const area of MAP_AREAS) {
      const group = areaGroups[area.name];
      const count = group.length;
      if (count === 0) continue;

      const MIN_DOT_SPACING = 4;
      const maxRadius = area.radius * 0.5;

      for (let i = 0; i < count; i++) {
        const { rel, a, b } = group[i];
        let ox: number, oy: number;

        if (i === 0) {
          ox = area.cx;
          oy = area.cy;
        } else {
          const ringRadius = Math.min(maxRadius, MIN_DOT_SPACING + 2);
          const angle = ((i - 1) / (count - 1)) * Math.PI * 2;
          ox = area.cx + Math.cos(angle) * ringRadius;
          oy = area.cy + Math.sin(angle) * ringRadius;
        }

        result.push({
          id: rel.id,
          nameA: a.name.ja,
          nameB: b.name.ja,
          phase: a.currentPhase,
          score: a.score,
          area: area.name,
          offsetX: ox,
          offsetY: oy,
          desire: (a.emotions.desire + b.emotions.desire) / 2,
          trust: (a.emotions.trust + b.emotions.trust) / 2,
          anxiety: (a.emotions.anxiety + b.emotions.anxiety) / 2,
          chemistry: rel.chemistryScore,
          personAId: a.id,
          personBId: b.id,
        });
      }
    }

    return result;
  }, [getCrossSectionCouples, relationships]);

  // エリア別カップル数
  const areaStats = useMemo(() => {
    const stats: Record<string, { total: number; imminent: number }> = {};
    for (const area of MAP_AREAS) {
      const areaCouples = couples.filter(c => c.area === area.name);
      stats[area.name] = {
        total: areaCouples.length,
        imminent: areaCouples.filter(c => c.phase === 'imminent' || c.phase === 'critical').length,
      };
    }
    return stats;
  }, [couples]);

  // クリックハンドラ
  const handleCoupleClick = (coupleId: string) => {
    const rel = relationships.find(r => r.id === coupleId);
    if (rel && onSelectCouple) {
      onSelectCouple(rel.id, rel.personA, rel.personB);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a14] overflow-hidden select-none">
      {/* 背景グリッド */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* タイトル */}
      <div className="absolute top-4 left-4 z-20">
        <div className="text-[10px] tracking-[4px] text-white/30 uppercase">Tokyo Intimacy Map</div>
        <div className="text-[10px] tracking-[2px] text-white/20 mt-1">
          {couples.length} couples monitored
        </div>
      </div>

      {/* SVGマップ */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* エリア別のグロウフィルター */}
          {MAP_AREAS.map(area => (
            <filter key={area.name} id={`glow-${area.nameEn}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          ))}

          {/* カップルドットのグロウ */}
          <filter id="dot-glow">
            <feGaussianBlur stdDeviation="0.3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* imminent用の強グロウ */}
          <filter id="dot-glow-strong">
            <feGaussianBlur stdDeviation="0.6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* 夜空グラデーション */}
          <linearGradient id="sky-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#020208" />
            <stop offset="60%" stopColor="#0a0514" />
            <stop offset="100%" stopColor="#0d0820" />
          </linearGradient>

          {/* ネオンサインのグロウ */}
          <filter id="neon-glow">
            <feGaussianBlur stdDeviation="0.4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* ランタンのグロウ */}
          <filter id="lantern-glow">
            <feGaussianBlur stdDeviation="0.25" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 夜空背景 */}
        <rect x="0" y="0" width="100" height="100" fill="url(#sky-bg)" />

        {/* 星 (#030) */}
        {[[8,5],[22,3],[37,8],[55,4],[70,6],[85,2],[15,12],[42,10],[63,8],[90,11],
          [12,2],[30,6],[48,3],[62,5],[78,9],[95,4],[5,10],[35,1],[72,3],[88,7]].map(([sx,sy],i) => (
          <circle key={`star-${i}`} cx={sx} cy={sy} r={i % 3 === 0 ? 0.2 : 0.12} fill="white" fillOpacity="0.25">
            <animate attributeName="fill-opacity" values={i % 2 === 0 ? '0.1;0.5;0.1' : '0.2;0.4;0.2'}
              dur={`${2+i*0.3}s`} repeatCount="indefinite" />
          </circle>
        ))}

        {/* 東京スカイライン (#030) */}
        <path
          d="M0,100 L0,80 L5,80 L5,75 L8,75 L8,72 L10,72 L10,70 L12,70 L12,68 L15,68 L15,65 L18,65 L18,60 L20,60 L20,55 L22,55 L22,58 L25,58 L25,62 L28,62 L28,60 L30,60 L30,65 L32,65 L32,62 L35,62 L35,70 L38,70 L38,68 L42,68 L42,72 L45,72 L45,75 L50,75 L50,70 L55,70 L55,72 L58,72 L58,68 L62,68 L62,72 L65,72 L65,75 L68,75 L68,70 L70,70 L70,65 L72,65 L72,68 L75,68 L75,62 L78,62 L78,65 L80,65 L80,60 L82,60 L82,55 L85,55 L85,60 L88,60 L88,65 L90,65 L90,68 L92,68 L92,72 L95,72 L95,75 L97,75 L97,80 L100,80 L100,100 Z"
          fill="#06060f"
          fillOpacity="0.8"
        />

        {/* 雨エフェクト (#038) - 時間ベースで表示 */}
        {showRain && (
          <g opacity="0.3">
            {Array.from({ length: 25 }, (_, i) => {
              const x = (i * 4.1 + 3) % 100;
              const delay = (i * 0.13) % 1.5;
              const dur = 0.8 + (i % 5) * 0.15;
              return (
                <line
                  key={`rain-${i}`}
                  x1={x} y1={0} x2={x - 1.5} y2={4}
                  stroke="#6688cc"
                  strokeWidth="0.08"
                  strokeOpacity="0.5"
                >
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values={`0,${-5};${-3},${105}`}
                    dur={`${dur}s`}
                    begin={`${delay}s`}
                    repeatCount="indefinite"
                  />
                </line>
              );
            })}
          </g>
        )}

        {/* エリア間の接続線 */}
        <line x1={MAP_AREAS[0].cx} y1={MAP_AREAS[0].cy} x2={MAP_AREAS[1].cx} y2={MAP_AREAS[1].cy}
          stroke="white" strokeOpacity="0.05" strokeWidth="0.2" strokeDasharray="1 1" />
        <line x1={MAP_AREAS[1].cx} y1={MAP_AREAS[1].cy} x2={MAP_AREAS[2].cx} y2={MAP_AREAS[2].cy}
          stroke="white" strokeOpacity="0.05" strokeWidth="0.2" strokeDasharray="1 1" />
        <line x1={MAP_AREAS[0].cx} y1={MAP_AREAS[0].cy} x2={MAP_AREAS[2].cx} y2={MAP_AREAS[2].cy}
          stroke="white" strokeOpacity="0.05" strokeWidth="0.2" strokeDasharray="1 1" />

        {/* エリア */}
        {MAP_AREAS.map(area => (
          <g key={area.name}>
            {/* エリアの地盤（グラデーション円） */}
            <circle
              cx={area.cx}
              cy={area.cy}
              r={area.radius}
              fill={area.color}
              fillOpacity="0.03"
              stroke={area.color}
              strokeOpacity="0.15"
              strokeWidth="0.15"
              strokeDasharray="0.5 0.5"
            />

            {/* エリア内輪 */}
            <circle
              cx={area.cx}
              cy={area.cy}
              r={area.radius * 0.6}
              fill="none"
              stroke={area.color}
              strokeOpacity="0.08"
              strokeWidth="0.1"
            />

            {/* エリア名 (#041 fix: Math.max(3,...) でviewBox外に出ないように) */}
            <text
              x={area.cx}
              y={Math.max(3, area.cy - area.radius - 2)}
              textAnchor="middle"
              fontSize="2.5"
              fill={area.color}
              fillOpacity="0.6"
              fontWeight="bold"
              letterSpacing="0.3"
            >
              {area.nameEn}
            </text>

            {/* ランドマークアニメーション (#037) */}
            {area.landmark === '109' && (
              /* Shibuya 109: blinking neon sign */
              <g filter="url(#neon-glow)">
                <rect
                  x={area.cx - 2.5} y={area.cy + area.radius + 0.5}
                  width="5" height="2.2" rx="0.3"
                  fill="none" stroke="#ff3366" strokeWidth="0.12"
                >
                  <animate attributeName="stroke-opacity" values="0.6;0.2;0.6;0.9;0.6"
                    dur="2s" repeatCount="indefinite" />
                </rect>
                <text
                  x={area.cx} y={area.cy + area.radius + 2.1}
                  textAnchor="middle" fontSize="1.4" fill="#ff3366" fontWeight="bold"
                  letterSpacing="0.15"
                >
                  <animate attributeName="fill-opacity" values="0.7;0.3;0.7;0.9;0.7"
                    dur="2s" repeatCount="indefinite" />
                  109
                </text>
              </g>
            )}

            {area.landmark === 'ゴールデン街' && (
              /* Shinjuku Golden Gai: swaying lanterns */
              <g>
                {[-2, 0, 2].map((lx, li) => (
                  <g key={`lantern-${li}`} filter="url(#lantern-glow)">
                    <rect
                      x={area.cx + lx - 0.4} y={area.cy + area.radius + 0.8}
                      width="0.8" height="1.3" rx="0.2"
                      fill="#ff6600" fillOpacity="0.6"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={`-3,${area.cx + lx},${area.cy + area.radius + 0.8};3,${area.cx + lx},${area.cy + area.radius + 0.8};-3,${area.cx + lx},${area.cy + area.radius + 0.8}`}
                        dur={`${1.5 + li * 0.3}s`}
                        repeatCount="indefinite"
                      />
                    </rect>
                    <line
                      x1={area.cx + lx} y1={area.cy + area.radius + 0.3}
                      x2={area.cx + lx} y2={area.cy + area.radius + 0.8}
                      stroke="#ff6600" strokeWidth="0.06" strokeOpacity="0.4"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values={`-3,${area.cx + lx},${area.cy + area.radius + 0.3};3,${area.cx + lx},${area.cy + area.radius + 0.3};-3,${area.cx + lx},${area.cy + area.radius + 0.3}`}
                        dur={`${1.5 + li * 0.3}s`}
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                ))}
                <text
                  x={area.cx} y={area.cy + area.radius + 3.2}
                  textAnchor="middle" fontSize="1.2" fill="white" fillOpacity="0.15"
                  letterSpacing="0.15"
                >
                  Golden Gai
                </text>
              </g>
            )}

            {area.landmark === 'HILLS' && (
              /* Roppongi: neon sign effect */
              <g filter="url(#neon-glow)">
                <text
                  x={area.cx} y={area.cy + area.radius + 2.5}
                  textAnchor="middle" fontSize="1.6" fill="#9933ff" fontWeight="bold"
                  letterSpacing="0.4"
                >
                  <animate attributeName="fill" values="#9933ff;#cc66ff;#9933ff;#6600cc;#9933ff"
                    dur="3s" repeatCount="indefinite" />
                  <animate attributeName="fill-opacity" values="0.6;0.9;0.6;0.4;0.6"
                    dur="3s" repeatCount="indefinite" />
                  HILLS
                </text>
              </g>
            )}

            {/* カップル数 */}
            <text
              x={area.cx}
              y={area.cy - area.radius + 4}
              textAnchor="middle"
              fontSize="1.8"
              fill="white"
              fillOpacity="0.3"
            >
              {DISTRICTS[area.district].coupleCount} pairs
            </text>
          </g>
        ))}

        {/* ANXIETY layer: area-level darkness overlay */}
        {activeLayer === 'anxiety' && MAP_AREAS.map(area => {
          const areaCouples = couples.filter(c => c.area === area.name);
          const avgAnxiety = areaCouples.length > 0
            ? areaCouples.reduce((sum, c) => sum + c.anxiety, 0) / areaCouples.length
            : 0;
          // Higher anxiety = darker overlay
          const darkness = avgAnxiety / 100 * 0.6;
          return (
            <circle
              key={`anxiety-${area.name}`}
              cx={area.cx}
              cy={area.cy}
              r={area.radius}
              fill="#000000"
              fillOpacity={darkness}
              style={{ pointerEvents: 'none' }}
            >
              <animate
                attributeName="fill-opacity"
                values={`${darkness};${darkness * 1.3};${darkness}`}
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* TRUST layer: lines between couple pairs showing trust level */}
        {activeLayer === 'trust' && couples.map((couple, i) => {
          // Draw a trust arc/line from dot A to dot B with width based on trust
          const trustWidth = 0.05 + (couple.trust / 100) * 0.25;
          const trustOpacity = 0.2 + (couple.trust / 100) * 0.6;
          const trustColor = couple.trust > 60 ? '#10b981' : couple.trust > 35 ? '#fbbf24' : '#ef4444';
          const dotOffsetA = 0.3;
          const dotOffsetB = -0.3;
          return (
            <line
              key={`trust-${couple.id}`}
              x1={couple.offsetX + dotOffsetA}
              y1={couple.offsetY - 0.1}
              x2={couple.offsetX + dotOffsetB}
              y2={couple.offsetY + 0.1}
              stroke={trustColor}
              strokeOpacity={trustOpacity}
              strokeWidth={trustWidth}
              strokeLinecap="round"
              style={{ pointerEvents: 'none' }}
            >
              <animate
                attributeName="stroke-opacity"
                values={`${trustOpacity};${trustOpacity * 0.5};${trustOpacity}`}
                dur="2.5s"
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {/* カップルドット (#033 改善 + SimCity layers) */}
        {couples.map(couple => {
          const isHovered = hoveredCouple === couple.id;
          // Layer-dependent color
          const defaultColor = PHASE_COLORS[couple.phase];
          const layerColor = activeLayer === 'desire' ? desireColor(couple.desire)
            : activeLayer === 'trust' ? (couple.trust > 60 ? '#10b981' : couple.trust > 35 ? '#fbbf24' : '#ef4444')
            : activeLayer === 'anxiety' ? `hsl(${40 - couple.anxiety * 0.4}, 90%, ${50 + couple.anxiety * 0.3}%)`
            : activeLayer === 'chemistry' ? `hsl(${280 + couple.chemistry * 0.8}, 80%, ${40 + couple.chemistry * 0.4}%)`
            : defaultColor;
          const color = layerColor;
          const pulse = PHASE_PULSE[couple.phase];
          const isImminent = couple.phase === 'imminent';
          const isCritical = couple.phase === 'critical';
          const isSeedOrApproach = couple.phase === 'seed' || couple.phase === 'approach';
          const dotR = isHovered ? 0.8 : isImminent ? 0.7 : isCritical ? 0.6 : 0.5;
          const heartbeat = HEARTBEAT_SCALE[couple.phase];

          // Chemistry layer: glow size based on score
          const chemGlow = activeLayer === 'chemistry' ? 0.5 + (couple.chemistry / 100) * 2.5 : 0;

          const dotOffsetA = 0.3;
          const dotOffsetB = -0.3;

          return (
            <g key={couple.id}>
              {/* Chemistry glow aura */}
              {activeLayer === 'chemistry' && (
                <circle
                  cx={couple.offsetX}
                  cy={couple.offsetY}
                  r={chemGlow}
                  fill={color}
                  fillOpacity={0.08 + (couple.chemistry / 100) * 0.15}
                  style={{ pointerEvents: 'none' }}
                >
                  <animate
                    attributeName="r"
                    values={`${chemGlow};${chemGlow * 1.3};${chemGlow}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values={`${0.08 + (couple.chemistry / 100) * 0.15};${0.15 + (couple.chemistry / 100) * 0.2};${0.08 + (couple.chemistry / 100) * 0.15}`}
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* パルスリング */}
              <circle
                cx={couple.offsetX}
                cy={couple.offsetY}
                r={isHovered ? 1.8 : 1.2}
                fill="none"
                stroke={color}
                strokeOpacity="0.3"
                strokeWidth="0.1"
                style={{ pointerEvents: 'all', cursor: 'pointer' }}
                onMouseEnter={() => setHoveredCouple(couple.id)}
                onMouseLeave={() => setHoveredCouple(null)}
                onClick={() => handleCoupleClick(couple.id)}
              >
                <animate
                  attributeName="r"
                  values={isHovered ? '1.8;3;1.8' : '1.2;2;1.2'}
                  dur={`${pulse}ms`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="stroke-opacity"
                  values="0.3;0;0.3"
                  dur={`${pulse}ms`}
                  repeatCount="indefinite"
                />
              </circle>

              {/* imminentフェーズの第2ハートビートリング */}
              {isImminent && activeLayer === 'default' && (
                <circle
                  cx={couple.offsetX}
                  cy={couple.offsetY}
                  r={2}
                  fill="none"
                  stroke={color}
                  strokeOpacity="0"
                  strokeWidth="0.15"
                >
                  <animate
                    attributeName="r"
                    values="0.8;3.5;0.8"
                    keyTimes="0;0.3;1"
                    dur={`${pulse}ms`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-opacity"
                    values="0.6;0;0.6"
                    keyTimes="0;0.5;1"
                    dur={`${pulse}ms`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* 透明ヒットエリア */}
              <circle
                cx={couple.offsetX}
                cy={couple.offsetY}
                r={6}
                fill="transparent"
                className="cursor-pointer"
                style={{ pointerEvents: 'all' }}
                onMouseEnter={() => setHoveredCouple(couple.id)}
                onMouseLeave={() => setHoveredCouple(null)}
                onClick={() => handleCoupleClick(couple.id)}
              />

              {/* カップル共有オーラ */}
              <circle
                cx={couple.offsetX}
                cy={couple.offsetY}
                r={isHovered ? 1.2 : 0.9}
                fill={color}
                fillOpacity={isImminent ? 0.12 : 0.06}
                style={{ pointerEvents: 'none' }}
              >
                <animate
                  attributeName="r"
                  values={isHovered ? '1.2;1.5;1.2' : '0.9;1.1;0.9'}
                  dur={heartbeat.dur}
                  repeatCount="indefinite"
                />
              </circle>

              {/* カップルドットA */}
              <circle
                cx={couple.offsetX + dotOffsetA}
                cy={couple.offsetY - 0.1}
                r={dotR * 0.7}
                fill={color}
                fillOpacity={isHovered ? 1 : isSeedOrApproach ? 0.5 : 0.8}
                filter={isImminent ? 'url(#dot-glow-strong)' : 'url(#dot-glow)'}
                style={{ pointerEvents: 'none' }}
              >
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values={heartbeat.values}
                  dur={heartbeat.dur}
                  repeatCount="indefinite"
                  additive="sum"
                />
              </circle>

              {/* カップルドットB */}
              <circle
                cx={couple.offsetX + dotOffsetB}
                cy={couple.offsetY + 0.1}
                r={dotR * 0.7}
                fill={color}
                fillOpacity={isHovered ? 1 : isSeedOrApproach ? 0.4 : 0.7}
                filter={isImminent ? 'url(#dot-glow-strong)' : 'url(#dot-glow)'}
                style={{ pointerEvents: 'none' }}
              >
                <animateTransform
                  attributeName="transform"
                  type="scale"
                  values={heartbeat.values}
                  dur={heartbeat.dur}
                  repeatCount="indefinite"
                  additive="sum"
                />
              </circle>

              {/* カップル接続線 */}
              {activeLayer !== 'trust' && (
                <line
                  x1={couple.offsetX + dotOffsetA}
                  y1={couple.offsetY - 0.1}
                  x2={couple.offsetX + dotOffsetB}
                  y2={couple.offsetY + 0.1}
                  stroke={color}
                  strokeOpacity={isHovered ? 0.5 : 0.2}
                  strokeWidth="0.06"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* ホバー時のツールチップ */}
              {isHovered && (
                <g>
                  <rect
                    x={couple.offsetX + 1.2}
                    y={couple.offsetY - 3.5}
                    width="14"
                    height={activeLayer === 'default' ? 4 : 5.5}
                    rx="0.5"
                    fill="#0a0a14"
                    fillOpacity="0.9"
                    stroke={color}
                    strokeOpacity="0.3"
                    strokeWidth="0.1"
                  />
                  <text
                    x={couple.offsetX + 2}
                    y={couple.offsetY - 1.9}
                    fontSize="1.5"
                    fill="white"
                    fillOpacity="0.9"
                  >
                    {couple.nameA} × {couple.nameB}
                  </text>
                  <text
                    x={couple.offsetX + 2}
                    y={couple.offsetY - 0.3}
                    fontSize="1.2"
                    fill={color}
                    fillOpacity="0.7"
                  >
                    {couple.phase.toUpperCase()} — {couple.score}%
                  </text>
                  {activeLayer !== 'default' && (
                    <text
                      x={couple.offsetX + 2}
                      y={couple.offsetY + 1.2}
                      fontSize="1.1"
                      fill="white"
                      fillOpacity="0.5"
                    >
                      {activeLayer === 'desire' && `DESIRE: ${Math.round(couple.desire)}`}
                      {activeLayer === 'trust' && `TRUST: ${Math.round(couple.trust)}`}
                      {activeLayer === 'anxiety' && `ANXIETY: ${Math.round(couple.anxiety)}`}
                      {activeLayer === 'chemistry' && `CHEMISTRY: ${couple.chemistry}`}
                    </text>
                  )}
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Layer switch bar (bottom center) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded-full px-1.5 py-1 border border-white/5">
        {LAYER_BUTTONS.map(btn => {
          const isActive = activeLayer === btn.id;
          return (
            <button
              key={btn.id}
              onClick={(e) => { e.stopPropagation(); setActiveLayer(btn.id); }}
              className={`px-2 py-0.5 rounded-full text-[7px] tracking-[1.5px] transition-all duration-200 pointer-events-auto ${
                isActive
                  ? 'bg-white/10 text-white/80 shadow-[0_0_8px_rgba(255,255,255,0.1)]'
                  : 'text-white/25 hover:text-white/50 hover:bg-white/5'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* TOKYO INTIMACY INDEX (right side panel) */}
      <IntimacyIndex couples={couples} />

      {/* フェーズ凡例（左下） — only in default layer */}
      {activeLayer === 'default' && (
        <div className="absolute bottom-12 left-4 z-20">
          <div className="text-[7px] tracking-[2px] text-white/20 uppercase mb-1.5">Phase</div>
          {(Object.entries(PHASE_COLORS) as [Phase, string][]).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[7px] text-white/35 uppercase tracking-wider">{phase}</span>
            </div>
          ))}
        </div>
      )}

      {/* Layer-specific legend */}
      {activeLayer !== 'default' && (
        <div className="absolute bottom-12 left-4 z-20">
          <div className="text-[7px] tracking-[2px] text-white/20 uppercase mb-1.5">
            {activeLayer}
          </div>
          {activeLayer === 'desire' && (
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #3c64ff, #ffaa00, #ff1a1a)' }} />
              <span className="text-[7px] text-white/30">0 → 100</span>
            </div>
          )}
          {activeLayer === 'trust' && (
            <>
              {[['#ef4444', 'LOW'], ['#fbbf24', 'MID'], ['#10b981', 'HIGH']].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5 mb-0.5">
                  <div className="w-4 h-0.5 rounded-full" style={{ backgroundColor: c as string }} />
                  <span className="text-[7px] text-white/30 tracking-wider">{l}</span>
                </div>
              ))}
            </>
          )}
          {activeLayer === 'anxiety' && (
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #1a1a2e, #000)' }} />
              <span className="text-[7px] text-white/30">LOW → HIGH</span>
            </div>
          )}
          {activeLayer === 'chemistry' && (
            <div className="flex items-center gap-1">
              <div className="w-8 h-1.5 rounded-full" style={{ background: 'linear-gradient(90deg, #4a2080, #cc66ff)' }} />
              <span className="text-[7px] text-white/30">WEAK → STRONG</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// TOKYO INTIMACY INDEX — right-side stats panel
function IntimacyIndex({ couples }: { couples: CoupleOnMap[] }) {
  const stats = useMemo(() => {
    if (couples.length === 0) return { activity: 0, avgDesire: 0, successRate: 0 };
    const avgDesire = couples.reduce((s, c) => s + c.desire, 0) / couples.length;
    const imminentCount = couples.filter(c => c.phase === 'imminent' || c.phase === 'critical').length;
    const successRate = (imminentCount / couples.length) * 100;
    // Activity = weighted average of desire, chemistry, and inverse anxiety
    const avgChem = couples.reduce((s, c) => s + c.chemistry, 0) / couples.length;
    const avgAnxiety = couples.reduce((s, c) => s + c.anxiety, 0) / couples.length;
    const activity = Math.min(100, avgDesire * 0.4 + avgChem * 0.35 + (100 - avgAnxiety) * 0.25);
    return {
      activity: Math.round(activity),
      avgDesire: Math.round(avgDesire),
      successRate: Math.round(successRate),
    };
  }, [couples]);

  const rows = [
    { label: 'ACTIVITY', value: stats.activity, color: stats.activity > 60 ? '#ff3366' : stats.activity > 40 ? '#ff8800' : '#4488ff' },
    { label: 'AVG DESIRE', value: stats.avgDesire, color: stats.avgDesire > 60 ? '#ff2244' : stats.avgDesire > 40 ? '#ffaa00' : '#6688ff' },
    { label: 'SUCCESS %', value: stats.successRate, color: stats.successRate > 30 ? '#ff0066' : stats.successRate > 15 ? '#ff6600' : '#44aaff' },
  ];

  return (
    <div className="absolute top-14 right-3 z-20 w-[90px]">
      <div className="text-[6px] tracking-[2px] text-white/25 uppercase mb-2 text-center">
        Tokyo Intimacy
      </div>
      <div className="text-[6px] tracking-[1.5px] text-white/15 uppercase mb-3 text-center">
        INDEX
      </div>
      {rows.map(row => (
        <div key={row.label} className="mb-2">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[6px] tracking-[1px] text-white/30">{row.label}</span>
            <span className="text-[8px] font-mono tabular-nums" style={{ color: row.color }}>
              {row.value}
            </span>
          </div>
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${row.value}%`,
                backgroundColor: row.color,
                boxShadow: `0 0 4px ${row.color}40`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
