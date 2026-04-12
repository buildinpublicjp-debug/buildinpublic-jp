'use client';

import { useMemo } from 'react';
import type { Phase } from '../../engine/scoring';

// 部屋タイプ定義
export type RoomType = 'bar' | 'restaurant' | 'hotel' | 'karaoke' | 'cafe' | 'lounge';

export interface RoomSlot {
  id: string;
  floor: number; // 0-based
  position: 'left' | 'center' | 'right';
  type: RoomType;
  coupleId?: string;
  phase?: Phase;
}

interface BuildingSectionProps {
  /** ビル名（エリア名） */
  name: string;
  /** 階数 */
  floors: number;
  /** 各階の部屋 */
  rooms: RoomSlot[];
  /** ビルの幅（SVG単位） */
  width?: number;
  /** 選択中の部屋ID */
  selectedRoomId?: string | null;
  /** 部屋クリック時 */
  onRoomClick?: (room: RoomSlot) => void;
}

// フェーズ別の部屋の光の色
const PHASE_GLOW: Record<Phase, string> = {
  seed: '#334488',
  approach: '#336655',
  escalation: '#886633',
  critical: '#883333',
  imminent: '#ff1155',
};

// 部屋タイプ別のアイコン（SVGテキスト）
const ROOM_ICONS: Record<RoomType, string> = {
  bar: '\uD83C\uDF78',      // cocktail
  restaurant: '\uD83C\uDF7D', // plate
  hotel: '\uD83D\uDECF',     // bed
  karaoke: '\uD83C\uDFA4',   // mic
  cafe: '\u2615',             // coffee
  lounge: '\uD83E\uDE91',    // couch
};

// 1階あたりの高さ
const FLOOR_HEIGHT = 48;
// 屋上の高さ
const ROOF_HEIGHT = 16;
// 左右マージン
const WALL_THICKNESS = 4;

export function BuildingSection({
  name,
  floors,
  rooms,
  width = 280,
  selectedRoomId,
  onRoomClick,
}: BuildingSectionProps) {
  const totalHeight = floors * FLOOR_HEIGHT + ROOF_HEIGHT;

  // 各部屋の位置を計算
  const roomPositions = useMemo(() => {
    const positions: { room: RoomSlot; x: number; y: number; w: number; h: number }[] = [];
    const innerWidth = width - WALL_THICKNESS * 2;

    for (const room of rooms) {
      if (room.floor >= floors) continue;

      const roomW = room.position === 'center' ? innerWidth : innerWidth / 2 - 2;
      let roomX = WALL_THICKNESS;
      if (room.position === 'center') {
        roomX = WALL_THICKNESS;
      } else if (room.position === 'right') {
        roomX = WALL_THICKNESS + innerWidth / 2 + 2;
      }

      const roomY = totalHeight - ROOF_HEIGHT - (room.floor + 1) * FLOOR_HEIGHT + 4;

      positions.push({
        room,
        x: roomX,
        y: roomY,
        w: roomW,
        h: FLOOR_HEIGHT - 8,
      });
    }
    return positions;
  }, [rooms, floors, width, totalHeight]);

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* X線グロウ効果 */}
        <filter id={`xray-${name}`}>
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 部屋内の光源 */}
        {Object.entries(PHASE_GLOW).map(([phase, color]) => (
          <radialGradient key={phase} id={`room-glow-${name}-${phase}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* ビル外壁 — X線スタイル（輪郭のみ） */}
      <rect
        x="0"
        y={ROOF_HEIGHT}
        width={width}
        height={totalHeight - ROOF_HEIGHT}
        fill="none"
        stroke="#334466"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        rx="2"
      />

      {/* 屋上 */}
      <path
        d={`M ${width * 0.1} ${ROOF_HEIGHT} L ${width * 0.3} 2 L ${width * 0.7} 2 L ${width * 0.9} ${ROOF_HEIGHT}`}
        fill="none"
        stroke="#334466"
        strokeWidth="1"
        strokeOpacity="0.3"
      />

      {/* 階の仕切り線 */}
      {Array.from({ length: floors - 1 }, (_, i) => {
        const y = totalHeight - (i + 1) * FLOOR_HEIGHT;
        return (
          <line
            key={i}
            x1={WALL_THICKNESS}
            y1={y}
            x2={width - WALL_THICKNESS}
            y2={y}
            stroke="#334466"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            strokeDasharray="4 4"
          />
        );
      })}

      {/* 階番号 */}
      {Array.from({ length: floors }, (_, i) => {
        const y = totalHeight - i * FLOOR_HEIGHT - FLOOR_HEIGHT / 2;
        return (
          <text
            key={`fl-${i}`}
            x={width + 6}
            y={y + 3}
            fontSize="8"
            fill="#445566"
            fillOpacity="0.4"
          >
            {i + 1}F
          </text>
        );
      })}

      {/* 部屋 */}
      {roomPositions.map(({ room, x, y, w, h }) => {
        const isSelected = selectedRoomId === room.id;
        const hasPeople = !!room.coupleId;
        const phase = room.phase ?? 'seed';
        const glowColor = PHASE_GLOW[phase];

        return (
          <g
            key={room.id}
            className="cursor-pointer"
            onClick={() => onRoomClick?.(room)}
            style={{ pointerEvents: 'all' }}
          >
            {/* 部屋背景 */}
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              fill={hasPeople ? glowColor : '#0a0a14'}
              fillOpacity={hasPeople ? 0.15 : 0.5}
              stroke={isSelected ? '#ffffff' : '#334466'}
              strokeWidth={isSelected ? 1.5 : 0.5}
              strokeOpacity={isSelected ? 0.8 : 0.3}
              rx="1"
            />

            {/* カップルがいる場合のグロウ */}
            {hasPeople && (
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={`url(#room-glow-${name}-${phase})`}
                rx="1"
              >
                <animate
                  attributeName="fill-opacity"
                  values="0.6;1;0.6"
                  dur={phase === 'imminent' ? '1s' : phase === 'critical' ? '2s' : '3s'}
                  repeatCount="indefinite"
                />
              </rect>
            )}

            {/* 窓（X線ビュー — 部屋内が透けて見える表現） */}
            {!hasPeople && (
              <>
                <rect
                  x={x + w * 0.15}
                  y={y + 4}
                  width={w * 0.3}
                  height={h * 0.5}
                  fill="none"
                  stroke="#334466"
                  strokeWidth="0.3"
                  strokeOpacity="0.2"
                />
                <rect
                  x={x + w * 0.55}
                  y={y + 4}
                  width={w * 0.3}
                  height={h * 0.5}
                  fill="none"
                  stroke="#334466"
                  strokeWidth="0.3"
                  strokeOpacity="0.2"
                />
              </>
            )}

            {/* 部屋タイプアイコン */}
            <text
              x={x + w / 2}
              y={y + h / 2 + 3}
              textAnchor="middle"
              fontSize={hasPeople ? '14' : '10'}
              fillOpacity={hasPeople ? 0.8 : 0.2}
            >
              {ROOM_ICONS[room.type]}
            </text>

            {/* 選択時のハイライト */}
            {isSelected && (
              <rect
                x={x - 1}
                y={y - 1}
                width={w + 2}
                height={h + 2}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
                strokeOpacity="0.5"
                rx="2"
              >
                <animate
                  attributeName="stroke-opacity"
                  values="0.5;0.2;0.5"
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </rect>
            )}
          </g>
        );
      })}

      {/* ビル名 */}
      <text
        x={width / 2}
        y={totalHeight + 14}
        textAnchor="middle"
        fontSize="10"
        fill="#667788"
        fillOpacity="0.5"
        letterSpacing="2"
      >
        {name}
      </text>
    </svg>
  );
}
