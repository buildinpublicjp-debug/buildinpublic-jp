'use client';

import type { RoomType } from './BuildingSection';
import type { Phase } from '../../engine/scoring';

interface RoomProps {
  type: RoomType;
  phase: Phase;
  /** 幅 */
  width?: number;
  /** 高さ */
  height?: number;
  /** 現在時刻（0-23）— 照明に影響 */
  hour?: number;
}

// フェーズ別の照明ムード
const PHASE_LIGHTING: Record<Phase, { ambient: string; ambientOpacity: number; warmth: string }> = {
  seed:       { ambient: '#1a2a44', ambientOpacity: 0.3, warmth: '#445566' },
  approach:   { ambient: '#1a2a3a', ambientOpacity: 0.25, warmth: '#556644' },
  escalation: { ambient: '#2a1a1a', ambientOpacity: 0.2, warmth: '#886644' },
  critical:   { ambient: '#2a0a0a', ambientOpacity: 0.15, warmth: '#aa5533' },
  imminent:   { ambient: '#1a0008', ambientOpacity: 0.1, warmth: '#cc3344' },
};

export function Room({ type, phase, width = 260, height = 100, hour = 22 }: RoomProps) {
  const lighting = PHASE_LIGHTING[phase];
  const isNight = hour >= 18 || hour < 6;
  const wallColor = isNight ? '#0d0d1a' : '#1a1a2a';
  const floorColor = isNight ? '#0a0a12' : '#12121a';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* 天井照明 */}
        <radialGradient id={`ceiling-light-${type}`} cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor={lighting.warmth} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lighting.warmth} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 壁 */}
      <rect x="0" y="0" width={width} height={height} fill={wallColor} />

      {/* 床 */}
      <rect x="0" y={height * 0.75} width={width} height={height * 0.25} fill={floorColor} />
      <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75}
        stroke="#334" strokeWidth="0.5" strokeOpacity="0.3" />

      {/* 天井照明エフェクト */}
      <rect x="0" y="0" width={width} height={height}
        fill={`url(#ceiling-light-${type})`} />

      {/* 環境光 */}
      <rect x="0" y="0" width={width} height={height}
        fill={lighting.ambient} fillOpacity={lighting.ambientOpacity} />

      {/* 家具（タイプ別） */}
      {type === 'bar' && <BarFurniture width={width} height={height} phase={phase} />}
      {type === 'restaurant' && <RestaurantFurniture width={width} height={height} phase={phase} />}
      {type === 'hotel' && <HotelFurniture width={width} height={height} phase={phase} />}
      {type === 'karaoke' && <KaraokeFurniture width={width} height={height} phase={phase} />}
      {type === 'cafe' && <CafeFurniture width={width} height={height} phase={phase} />}
      {type === 'lounge' && <LoungeFurniture width={width} height={height} phase={phase} />}
    </svg>
  );
}

interface FurnitureProps {
  width: number;
  height: number;
  phase: Phase;
}

// バー — カウンター + スツール + ボトル棚
function BarFurniture({ width, height, phase }: FurnitureProps) {
  const floorY = height * 0.75;
  const counterY = floorY - 20;
  const counterX = width * 0.2;
  const counterW = width * 0.6;

  return (
    <g>
      {/* カウンター */}
      <rect x={counterX} y={counterY} width={counterW} height={4}
        fill="#3a2a1a" rx="1" />
      <rect x={counterX} y={counterY + 4} width={4} height={floorY - counterY - 4}
        fill="#2a1a0a" />
      <rect x={counterX + counterW - 4} y={counterY + 4} width={4} height={floorY - counterY - 4}
        fill="#2a1a0a" />

      {/* スツール */}
      {[0.3, 0.5, 0.7].map((p, i) => (
        <g key={i}>
          <rect x={width * p - 4} y={floorY - 14} width={8} height={2}
            fill="#444" rx="1" />
          <rect x={width * p - 1} y={floorY - 12} width={2} height={12}
            fill="#333" />
        </g>
      ))}

      {/* ボトル棚（壁面） */}
      <rect x={width * 0.3} y={10} width={width * 0.4} height={30}
        fill="none" stroke="#334" strokeWidth="0.5" />
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i}
          x={width * 0.32 + i * width * 0.07}
          y={14}
          width={4} height={12}
          fill={['#664422', '#226644', '#443366', '#884422', '#224466'][i]}
          fillOpacity="0.5" rx="1" />
      ))}

      {/* グラス（カウンター上） */}
      <path d={`M ${width * 0.4} ${counterY} L ${width * 0.4 - 2} ${counterY - 8} L ${width * 0.4 + 6} ${counterY - 8} L ${width * 0.4 + 4} ${counterY}`}
        fill="none" stroke="#668" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d={`M ${width * 0.6} ${counterY} L ${width * 0.6 - 2} ${counterY - 8} L ${width * 0.6 + 6} ${counterY - 8} L ${width * 0.6 + 4} ${counterY}`}
        fill="none" stroke="#668" strokeWidth="0.5" strokeOpacity="0.4" />
    </g>
  );
}

// レストラン — テーブル + 椅子 + キャンドル
function RestaurantFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;
  const tableY = floorY - 16;

  return (
    <g>
      {/* テーブル */}
      <rect x={width * 0.3} y={tableY} width={width * 0.4} height={3}
        fill="#4a3a2a" rx="1" />
      <rect x={width * 0.35} y={tableY + 3} width={3} height={floorY - tableY - 3}
        fill="#3a2a1a" />
      <rect x={width * 0.62} y={tableY + 3} width={3} height={floorY - tableY - 3}
        fill="#3a2a1a" />

      {/* 椅子 */}
      {[0.25, 0.7].map((p, i) => (
        <g key={i}>
          <rect x={width * p} y={tableY + 2} width={10} height={2} fill="#554" rx="1" />
          <rect x={width * p + 1} y={tableY + 4} width={2} height={floorY - tableY - 4} fill="#443" />
          <rect x={width * p + 7} y={tableY + 4} width={2} height={floorY - tableY - 4} fill="#443" />
          <rect x={width * p} y={tableY - 12} width={2} height={14} fill="#554" />
        </g>
      ))}

      {/* キャンドル */}
      <rect x={width * 0.48} y={tableY - 6} width={2} height={6} fill="#eee8" rx="0.5" />
      <ellipse cx={width * 0.49} cy={tableY - 7} rx={2} ry={3} fill="#ff8800" fillOpacity="0.6">
        <animate attributeName="ry" values="2.5;3.5;2.5" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.5;0.7;0.5" dur="1s" repeatCount="indefinite" />
      </ellipse>

      {/* 皿 */}
      <ellipse cx={width * 0.4} cy={tableY - 1} rx={6} ry={1.5}
        fill="none" stroke="#556" strokeWidth="0.5" />
      <ellipse cx={width * 0.6} cy={tableY - 1} rx={6} ry={1.5}
        fill="none" stroke="#556" strokeWidth="0.5" />
    </g>
  );
}

// ホテル — ベッド + サイドテーブル + 間接照明
function HotelFurniture({ width, height, phase }: FurnitureProps) {
  const floorY = height * 0.75;
  const bedY = floorY - 12;

  return (
    <g>
      {/* ベッド */}
      <rect x={width * 0.2} y={bedY} width={width * 0.6} height={12}
        fill="#2a2035" rx="2" />
      {/* シーツ */}
      <rect x={width * 0.22} y={bedY + 1} width={width * 0.56} height={10}
        fill={phase === 'imminent' ? '#3a1525' : '#252035'} rx="1" />
      {/* 枕 */}
      <rect x={width * 0.25} y={bedY + 2} width={12} height={6}
        fill="#ddd8" rx="2" />
      <rect x={width * 0.55} y={bedY + 2} width={12} height={6}
        fill="#ddd8" rx="2" />
      {/* ヘッドボード */}
      <rect x={width * 0.18} y={bedY - 14} width={width * 0.64} height={14}
        fill="#1a1520" rx="2" stroke="#334" strokeWidth="0.5" />

      {/* サイドテーブル */}
      <rect x={width * 0.08} y={bedY - 4} width={12} height={16}
        fill="#2a2520" rx="1" />
      <rect x={width * 0.82} y={bedY - 4} width={12} height={16}
        fill="#2a2520" rx="1" />

      {/* 間接照明 */}
      <circle cx={width * 0.12} cy={bedY - 2} r={2}
        fill="#ffaa44" fillOpacity="0.6">
        <animate attributeName="fill-opacity" values="0.4;0.7;0.4" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx={width * 0.86} cy={bedY - 2} r={2}
        fill="#ffaa44" fillOpacity="0.6">
        <animate attributeName="fill-opacity" values="0.5;0.7;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
    </g>
  );
}

// カラオケ — ソファ + マイク + モニター
function KaraokeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;

  return (
    <g>
      {/* ソファ（L字） */}
      <rect x={width * 0.1} y={floorY - 14} width={width * 0.35} height={14}
        fill="#332244" rx="3" />
      <rect x={width * 0.1} y={floorY - 26} width={14} height={26}
        fill="#332244" rx="3" />

      {/* テーブル */}
      <rect x={width * 0.3} y={floorY - 10} width={width * 0.2} height={3}
        fill="#222" rx="1" />

      {/* モニター（壁面） */}
      <rect x={width * 0.55} y={10} width={width * 0.3} height={height * 0.35}
        fill="#111" rx="2" stroke="#334" strokeWidth="0.5" />
      {/* 画面グロウ */}
      <rect x={width * 0.56} y={11} width={width * 0.28} height={height * 0.33}
        fill="#112244" fillOpacity="0.5" rx="1">
        <animate attributeName="fill" values="#112244;#221144;#112244" dur="4s" repeatCount="indefinite" />
      </rect>

      {/* マイク */}
      <line x1={width * 0.45} y1={floorY - 8} x2={width * 0.45} y2={floorY - 24}
        stroke="#888" strokeWidth="1" />
      <circle cx={width * 0.45} cy={floorY - 26} r={3}
        fill="#444" stroke="#666" strokeWidth="0.5" />

      {/* ドリンク */}
      <rect x={width * 0.35} y={floorY - 16} width={4} height={6}
        fill="#224466" fillOpacity="0.5" rx="0.5" />
    </g>
  );
}

// カフェ — 丸テーブル + カップ
function CafeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;
  const tableY = floorY - 14;

  return (
    <g>
      {/* 丸テーブル */}
      <ellipse cx={width * 0.5} cy={tableY} rx={width * 0.15} ry={3}
        fill="#5a4a3a" />
      <rect x={width * 0.49} y={tableY} width={3} height={floorY - tableY}
        fill="#4a3a2a" />

      {/* カップ */}
      {[0.44, 0.54].map((p, i) => (
        <g key={i}>
          <rect x={width * p} y={tableY - 5} width={5} height={5}
            fill="none" stroke="#887" strokeWidth="0.5" rx="0.5" />
          {/* 湯気 */}
          <path
            d={`M ${width * p + 1.5} ${tableY - 6} Q ${width * p + 2.5} ${tableY - 10} ${width * p + 1} ${tableY - 12}`}
            fill="none" stroke="#fff" strokeWidth="0.3" strokeOpacity="0.2">
            <animate attributeName="stroke-opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* 椅子 */}
      {[0.3, 0.65].map((p, i) => (
        <g key={i}>
          <rect x={width * p} y={floorY - 12} width={10} height={2} fill="#665" rx="1" />
          <rect x={width * p + 4} y={floorY - 10} width={2} height={10} fill="#554" />
        </g>
      ))}

      {/* 窓（壁面） */}
      <rect x={width * 0.1} y={8} width={width * 0.25} height={height * 0.4}
        fill="none" stroke="#334466" strokeWidth="0.5" />
      <line x1={width * 0.225} y1={8} x2={width * 0.225} y2={8 + height * 0.4}
        stroke="#334466" strokeWidth="0.3" />
    </g>
  );
}

// ラウンジ — ソファ + ローテーブル + 間接照明
function LoungeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;

  return (
    <g>
      {/* ソファ左 */}
      <rect x={width * 0.1} y={floorY - 14} width={width * 0.25} height={14}
        fill="#2a2535" rx="3" />
      <rect x={width * 0.1} y={floorY - 22} width={width * 0.25} height={8}
        fill="#252030" rx="3" />

      {/* ソファ右 */}
      <rect x={width * 0.65} y={floorY - 14} width={width * 0.25} height={14}
        fill="#2a2535" rx="3" />
      <rect x={width * 0.65} y={floorY - 22} width={width * 0.25} height={8}
        fill="#252030" rx="3" />

      {/* ローテーブル */}
      <rect x={width * 0.38} y={floorY - 8} width={width * 0.24} height={3}
        fill="#1a1a20" rx="1" stroke="#334" strokeWidth="0.3" />
      <rect x={width * 0.42} y={floorY - 5} width={2} height={5} fill="#222" />
      <rect x={width * 0.56} y={floorY - 5} width={2} height={5} fill="#222" />

      {/* グラス */}
      <path d={`M ${width * 0.44} ${floorY - 9} L ${width * 0.43} ${floorY - 16} L ${width * 0.48} ${floorY - 16} L ${width * 0.47} ${floorY - 9}`}
        fill="none" stroke="#668" strokeWidth="0.4" strokeOpacity="0.5" />

      {/* 間接照明（天井） */}
      {[0.2, 0.5, 0.8].map((p, i) => (
        <circle key={i} cx={width * p} cy={4} r={1.5}
          fill="#ffaa44" fillOpacity="0.4">
          <animate attributeName="fill-opacity" values="0.3;0.5;0.3"
            dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </g>
  );
}
