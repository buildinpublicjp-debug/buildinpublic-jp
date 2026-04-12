'use client';

import { useState, useMemo } from 'react';
import { usePeopleStore } from '../../stores/peopleStore';
import type { Phase } from '../../engine/scoring';

// 3エリア定義（デフォルメ座標）
interface MapArea {
  name: string;
  nameEn: string;
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
}

interface CityMapProps {
  onSelectCouple?: (relationshipId: string, personAId: string, personBId: string) => void;
}

export function CityMap({ onSelectCouple }: CityMapProps) {
  const people = usePeopleStore(s => s.people);
  const relationships = usePeopleStore(s => s.relationships);
  const [hoveredCouple, setHoveredCouple] = useState<string | null>(null);

  // カップルをエリアにマッピング（同心円配置で密集回避）
  const couples = useMemo(() => {
    const result: CoupleOnMap[] = [];

    // まずエリアごとにカップルを分類
    const areaGroups: Record<string, { rel: typeof relationships[0]; a: typeof people[0]; b: typeof people[0] }[]> = {};
    for (const area of MAP_AREAS) {
      areaGroups[area.name] = [];
    }

    for (const rel of relationships) {
      const a = people.find(p => p.id === rel.personA);
      const b = people.find(p => p.id === rel.personB);
      if (!a || !b) continue;

      const mapArea = MAP_AREAS.find(ma =>
        ma.includes.includes(a.area) || ma.includes.includes(b.area)
      );
      if (!mapArea) continue;
      areaGroups[mapArea.name].push({ rel, a, b });
    }

    // エリアごとに同心円配置
    for (const area of MAP_AREAS) {
      const group = areaGroups[area.name];
      const count = group.length;
      if (count === 0) continue;

      // 同心円: 1つ目は中心、残りはリングに配置
      // 最小距離を確保するためリング半径を調整
      const MIN_DOT_SPACING = 3; // SVG単位での最小間隔
      const maxRadius = area.radius * 0.7;

      for (let i = 0; i < count; i++) {
        const { rel, a, b } = group[i];
        let ox: number, oy: number;

        if (i === 0) {
          // 中心
          ox = area.cx;
          oy = area.cy;
        } else {
          // リング配置: 均等角度で、リングを増やす
          const dotsPerRing = Math.max(6, Math.floor(2 * Math.PI * MIN_DOT_SPACING * (Math.ceil(i / 6)) / MIN_DOT_SPACING));
          const ringIndex = Math.ceil(i / 6); // どのリングか
          const posInRing = (i - 1) % 6; // リング内の位置
          const ringRadius = Math.min(maxRadius, MIN_DOT_SPACING * ringIndex + 3);
          const angle = (posInRing / Math.min(6, count - 1 - (ringIndex - 1) * 6)) * Math.PI * 2 + ringIndex * 0.5; // オフセットで重なり回避

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
        });
      }
    }

    return result;
  }, [people, relationships]);

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
        </defs>

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

            {/* エリア名 */}
            <text
              x={area.cx}
              y={area.cy - area.radius - 2}
              textAnchor="middle"
              fontSize="2.5"
              fill={area.color}
              fillOpacity="0.6"
              fontWeight="bold"
              letterSpacing="0.3"
            >
              {area.nameEn}
            </text>

            {/* ランドマーク */}
            <text
              x={area.cx}
              y={area.cy + area.radius + 3}
              textAnchor="middle"
              fontSize="1.5"
              fill="white"
              fillOpacity="0.2"
              letterSpacing="0.2"
            >
              {area.landmark}
            </text>

            {/* カップル数 */}
            <text
              x={area.cx}
              y={area.cy - area.radius + 4}
              textAnchor="middle"
              fontSize="1.8"
              fill="white"
              fillOpacity="0.3"
            >
              {areaStats[area.name]?.total ?? 0} pairs
            </text>
          </g>
        ))}

        {/* カップルドット */}
        {couples.map(couple => {
          const isHovered = hoveredCouple === couple.id;
          const color = PHASE_COLORS[couple.phase];
          const pulse = PHASE_PULSE[couple.phase];

          return (
            <g key={couple.id}>
              {/* パルスリング */}
              <circle
                cx={couple.offsetX}
                cy={couple.offsetY}
                r={isHovered ? 1.8 : 1.2}
                fill="none"
                stroke={color}
                strokeOpacity="0.3"
                strokeWidth="0.1"
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

              {/* メインドット */}
              <circle
                cx={couple.offsetX}
                cy={couple.offsetY}
                r={isHovered ? 0.8 : 0.5}
                fill={color}
                fillOpacity={isHovered ? 1 : 0.8}
                filter="url(#dot-glow)"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredCouple(couple.id)}
                onMouseLeave={() => setHoveredCouple(null)}
                onClick={() => {
                  const rel = relationships.find(r => r.id === couple.id);
                  if (rel && onSelectCouple) {
                    onSelectCouple(rel.id, rel.personA, rel.personB);
                  }
                }}
                style={{ pointerEvents: 'all' }}
              />

              {/* ホバー時のツールチップ */}
              {isHovered && (
                <g>
                  <rect
                    x={couple.offsetX + 1.2}
                    y={couple.offsetY - 3}
                    width="14"
                    height="4"
                    rx="0.5"
                    fill="#0a0a14"
                    fillOpacity="0.9"
                    stroke={color}
                    strokeOpacity="0.3"
                    strokeWidth="0.1"
                  />
                  <text
                    x={couple.offsetX + 2}
                    y={couple.offsetY - 1.4}
                    fontSize="1.5"
                    fill="white"
                    fillOpacity="0.9"
                  >
                    {couple.nameA} × {couple.nameB}
                  </text>
                  <text
                    x={couple.offsetX + 2}
                    y={couple.offsetY + 0.2}
                    fontSize="1.2"
                    fill={color}
                    fillOpacity="0.7"
                  >
                    {couple.phase.toUpperCase()} — {couple.score}%
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* フェーズ凡例（右下） */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="text-[8px] tracking-[2px] text-white/20 uppercase mb-2">Phase</div>
        {(Object.entries(PHASE_COLORS) as [Phase, string][]).map(([phase, color]) => (
          <div key={phase} className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-[8px] text-white/40 uppercase tracking-wider">{phase}</span>
          </div>
        ))}
      </div>

      {/* 操作ヒント */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="text-[8px] text-white/15 tracking-wider">TAP A DOT TO ENTER</div>
      </div>
    </div>
  );
}

// 簡易シードランダム
function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
