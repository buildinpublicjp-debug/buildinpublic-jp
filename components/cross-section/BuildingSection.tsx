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
  // #046: 1Fが下、高い階が上（自然な建物レイアウト）
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

      // #046: floor 0 (1F) is at the bottom of the building
      const roomY = ROOF_HEIGHT + (floors - 1 - room.floor) * FLOOR_HEIGHT + 4;

      positions.push({
        room,
        x: roomX,
        y: roomY,
        w: roomW,
        h: FLOOR_HEIGHT - 8,
      });
    }
    return positions;
  }, [rooms, floors, width]);

  // エレベーターシャフト位置
  const elevatorX = width - WALL_THICKNESS - 12;
  const elevatorW = 10;
  const elevatorTop = ROOF_HEIGHT;
  const elevatorBottom = totalHeight;

  return (
    <svg
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* #029 X線ネオングロウ効果 */}
        <filter id={`xray-glow-${name}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id={`wall-glow-${name}`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" in="SourceGraphic" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 部屋内の光源 */}
        {Object.entries(PHASE_GLOW).map(([phase, color]) => (
          <radialGradient key={phase} id={`room-glow-${name}-${phase}`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      {/* #029 ビル外壁 — 半透明ブルーホワイトネオングロウ */}
      <rect
        x="0"
        y={ROOF_HEIGHT}
        width={width}
        height={totalHeight - ROOF_HEIGHT}
        fill="none"
        stroke="#4488cc"
        strokeWidth="1.5"
        strokeOpacity="0.6"
        rx="2"
        filter={`url(#wall-glow-${name})`}
      />

      {/* 屋上 */}
      <path
        d={`M ${width * 0.1} ${ROOF_HEIGHT} L ${width * 0.3} 2 L ${width * 0.7} 2 L ${width * 0.9} ${ROOF_HEIGHT}`}
        fill="none"
        stroke="#4488cc"
        strokeWidth="1"
        strokeOpacity="0.4"
        filter={`url(#wall-glow-${name})`}
      />

      {/* #029 外壁の窓フレーム（空部屋のある階の外壁に小さな矩形を等間隔配置） */}
      {Array.from({ length: floors }, (_, i) => {
        // #046: floor index i: floor 0 (1F) at bottom
        const floorTopY = ROOF_HEIGHT + (floors - 1 - i) * FLOOR_HEIGHT;
        const windowY = floorTopY + 10;
        const windowH = FLOOR_HEIGHT * 0.45;
        // 左壁側の窓
        return (
          <g key={`win-${i}`}>
            {/* 左壁窓 */}
            <rect x={1} y={windowY} width={2.5} height={windowH}
              fill="none" stroke="#4488cc" strokeWidth="0.3" strokeOpacity="0.25" rx="0.3" />
            {/* 右壁窓 */}
            <rect x={width - 3.5} y={windowY} width={2.5} height={windowH}
              fill="none" stroke="#4488cc" strokeWidth="0.3" strokeOpacity="0.25" rx="0.3" />
          </g>
        );
      })}

      {/* #029 階の仕切り線 — 薄い点線の内壁 */}
      {Array.from({ length: floors - 1 }, (_, i) => {
        // #046: divider between floor i and i+1
        const y = ROOF_HEIGHT + (i + 1) * FLOOR_HEIGHT;
        return (
          <line
            key={i}
            x1={WALL_THICKNESS}
            y1={y}
            x2={width - WALL_THICKNESS}
            y2={y}
            stroke="#4488cc"
            strokeWidth="0.5"
            strokeOpacity="0.2"
            strokeDasharray="3 3"
          />
        );
      })}

      {/* #029 階段（ジグザグ線 — 左側） */}
      {Array.from({ length: floors - 1 }, (_, i) => {
        const topY = ROOF_HEIGHT + (floors - 2 - i) * FLOOR_HEIGHT;
        const botY = topY + FLOOR_HEIGHT;
        const stairX = WALL_THICKNESS + 6;
        const stepCount = 6;
        const stepH = FLOOR_HEIGHT / stepCount;
        const stepW = 4;

        const points = Array.from({ length: stepCount + 1 }, (__, s) => {
          const sx = stairX + (s % 2 === 0 ? 0 : stepW);
          const sy = topY + s * stepH;
          return `${sx},${sy}`;
        }).join(' ');

        return (
          <polyline
            key={`stair-${i}`}
            points={points}
            fill="none"
            stroke="#4488cc"
            strokeWidth="0.4"
            strokeOpacity="0.15"
          />
        );
      })}

      {/* #029 エレベーターシャフト（右側の垂直矩形 + 動くインジケーター） */}
      <rect
        x={elevatorX}
        y={elevatorTop}
        width={elevatorW}
        height={elevatorBottom - elevatorTop}
        fill="none"
        stroke="#4488cc"
        strokeWidth="0.4"
        strokeOpacity="0.15"
        strokeDasharray="2 2"
      />
      {/* エレベーターケーブル */}
      <line
        x1={elevatorX + elevatorW / 2}
        y1={elevatorTop}
        x2={elevatorX + elevatorW / 2}
        y2={elevatorBottom}
        stroke="#4488cc"
        strokeWidth="0.3"
        strokeOpacity="0.1"
      />
      {/* エレベーター箱（動くインジケーター） */}
      <rect
        x={elevatorX + 1}
        y={elevatorTop + 4}
        width={elevatorW - 2}
        height={8}
        fill="#4488cc"
        fillOpacity="0.08"
        stroke="#4488cc"
        strokeWidth="0.4"
        strokeOpacity="0.3"
        rx="1"
      >
        <animate
          attributeName="y"
          values={`${elevatorTop + 4};${elevatorBottom - 14};${elevatorTop + 4}`}
          dur="8s"
          repeatCount="indefinite"
        />
      </rect>

      {/* #046: 階番号 — 1Fが下、上に行くほど数字が増える */}
      {Array.from({ length: floors }, (_, i) => {
        const y = ROOF_HEIGHT + (floors - 1 - i) * FLOOR_HEIGHT + FLOOR_HEIGHT / 2;
        return (
          <text
            key={`fl-${i}`}
            x={width + 6}
            y={y + 3}
            fontSize="8"
            fill="#4488cc"
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
              stroke={isSelected ? '#ffffff' : '#4488cc'}
              strokeWidth={isSelected ? 1.5 : 0.5}
              strokeOpacity={isSelected ? 0.8 : 0.2}
              strokeDasharray={isSelected ? 'none' : '4 2'}
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
                  stroke="#4488cc"
                  strokeWidth="0.3"
                  strokeOpacity="0.15"
                />
                <rect
                  x={x + w * 0.55}
                  y={y + 4}
                  width={w * 0.3}
                  height={h * 0.5}
                  fill="none"
                  stroke="#4488cc"
                  strokeWidth="0.3"
                  strokeOpacity="0.15"
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
