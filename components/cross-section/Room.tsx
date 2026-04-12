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

// バー — カウンター + ボトル棚 + グラス + ペンダントライト
function BarFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;
  const counterY = floorY - 20;
  const counterX = width * 0.2;
  const counterW = width * 0.6;

  return (
    <g>
      {/* カウンター */}
      <rect x={counterX} y={counterY} width={counterW} height={5}
        fill="#4a3a2a" rx="1" />
      {/* カウンター表面ハイライト */}
      <rect x={counterX + 2} y={counterY} width={counterW - 4} height={1}
        fill="#6a5a4a" fillOpacity="0.4" rx="0.5" />
      {/* カウンター脚 */}
      <rect x={counterX + 4} y={counterY + 5} width={4} height={floorY - counterY - 5}
        fill="#2a1a0a" />
      <rect x={counterX + counterW - 8} y={counterY + 5} width={4} height={floorY - counterY - 5}
        fill="#2a1a0a" />
      {/* カウンター前パネル */}
      <rect x={counterX} y={counterY + 5} width={counterW} height={floorY - counterY - 5}
        fill="#2a1a0a" fillOpacity="0.3" />
      {/* カウンター影 */}
      <rect x={counterX + 2} y={floorY} width={counterW - 4} height={2}
        fill="#000" fillOpacity="0.2" rx="1" />

      {/* スツール */}
      {[0.3, 0.5, 0.7].map((p, i) => (
        <g key={i}>
          <ellipse cx={width * p} cy={floorY - 14} rx={5} ry={1.5}
            fill="#555" />
          <rect x={width * p - 1} y={floorY - 12} width={2} height={12}
            fill="#444" />
          {/* スツール影 */}
          <ellipse cx={width * p} cy={floorY + 1} rx={4} ry={0.8}
            fill="#000" fillOpacity="0.15" />
        </g>
      ))}

      {/* ボトル棚（壁面） */}
      <rect x={width * 0.28} y={6} width={width * 0.44} height={34}
        fill="#1a1510" stroke="#3a2a1a" strokeWidth="0.5" rx="1" />
      {/* 棚板 */}
      {[14, 24].map(sy => (
        <line key={sy} x1={width * 0.29} y1={sy} x2={width * 0.71} y2={sy}
          stroke="#3a2a1a" strokeWidth="0.5" />
      ))}
      {/* ボトル */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect
            x={width * 0.31 + i * width * 0.08}
            y={8}
            width={4} height={5}
            fill={['#664422', '#226644', '#443366', '#884422', '#224466'][i]}
            fillOpacity="0.6" rx="0.5" />
          <rect
            x={width * 0.31 + i * width * 0.08 + 1}
            y={6}
            width={2} height={2}
            fill={['#664422', '#226644', '#443366', '#884422', '#224466'][i]}
            fillOpacity="0.4" rx="0.5" />
        </g>
      ))}
      {/* 下段ボトル */}
      {[0, 1, 2, 3].map(i => (
        <rect key={`b2-${i}`}
          x={width * 0.33 + i * width * 0.09}
          y={16}
          width={5} height={7}
          fill={['#aa6633', '#336688', '#885533', '#338866'][i]}
          fillOpacity="0.5" rx="0.5" />
      ))}

      {/* グラス（カウンター上） */}
      {[0.38, 0.55, 0.65].map((p, i) => (
        <g key={`glass-${i}`}>
          <path d={`M ${width * p} ${counterY} L ${width * p - 2} ${counterY - 7} L ${width * p + 5} ${counterY - 7} L ${width * p + 3} ${counterY}`}
            fill="none" stroke="#8899aa" strokeWidth="0.4" strokeOpacity="0.4" />
          {/* グラス内の液体 */}
          <path d={`M ${width * p - 1} ${counterY - 3} L ${width * p + 4} ${counterY - 3} L ${width * p + 3} ${counterY} L ${width * p} ${counterY}`}
            fill={['#cc8844', '#44aa88', '#cc8844'][i]} fillOpacity="0.2" />
          {/* グラスハイライト */}
          <line x1={width * p + 4} y1={counterY - 6} x2={width * p + 4} y2={counterY - 2}
            stroke="white" strokeWidth="0.3" strokeOpacity="0.2" />
        </g>
      ))}

      {/* ペンダントライト */}
      {[0.35, 0.5, 0.65].map((p, i) => (
        <g key={`light-${i}`}>
          <line x1={width * p} y1={0} x2={width * p} y2={8}
            stroke="#444" strokeWidth="0.5" />
          <path d={`M ${width * p - 4} ${8} Q ${width * p} ${12} ${width * p + 4} ${8}`}
            fill="#222" stroke="#444" strokeWidth="0.3" />
          <circle cx={width * p} cy={9} r={1}
            fill="#ffaa44" fillOpacity="0.8">
            <animate attributeName="fill-opacity" values="0.6;0.9;0.6"
              dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
          {/* ライトの光 */}
          <ellipse cx={width * p} cy={counterY - 4} rx={12} ry={8}
            fill="#ffaa44" fillOpacity="0.03" />
        </g>
      ))}
    </g>
  );
}

// レストラン — テーブル + 椅子 + キャンドル(animated flame) + 皿 + ワイングラス
function RestaurantFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;
  const tableY = floorY - 16;

  return (
    <g>
      {/* テーブルクロス */}
      <rect x={width * 0.28} y={tableY - 1} width={width * 0.44} height={5}
        fill="#3a2035" fillOpacity="0.4" rx="1" />
      {/* テーブル */}
      <rect x={width * 0.3} y={tableY} width={width * 0.4} height={3}
        fill="#5a4a3a" rx="1" />
      {/* テーブルハイライト */}
      <rect x={width * 0.32} y={tableY} width={width * 0.36} height={0.8}
        fill="#7a6a5a" fillOpacity="0.3" rx="0.3" />
      {/* テーブル脚 */}
      <rect x={width * 0.35} y={tableY + 3} width={3} height={floorY - tableY - 3}
        fill="#3a2a1a" />
      <rect x={width * 0.62} y={tableY + 3} width={3} height={floorY - tableY - 3}
        fill="#3a2a1a" />
      {/* テーブル影 */}
      <ellipse cx={width * 0.5} cy={floorY + 1} rx={width * 0.18} ry={1}
        fill="#000" fillOpacity="0.15" />

      {/* 椅子 */}
      {[0.22, 0.72].map((p, i) => (
        <g key={i}>
          {/* 座面 */}
          <rect x={width * p} y={tableY + 2} width={12} height={2.5} fill="#665544" rx="1" />
          {/* 脚 */}
          <rect x={width * p + 1} y={tableY + 4.5} width={1.5} height={floorY - tableY - 4.5} fill="#554433" />
          <rect x={width * p + 9.5} y={tableY + 4.5} width={1.5} height={floorY - tableY - 4.5} fill="#554433" />
          {/* 背もたれ */}
          <rect x={width * p + (i === 0 ? 0 : 10)} y={tableY - 14} width={2} height={16} fill="#665544" rx="0.5" />
          <rect x={width * p + (i === 0 ? 0 : 10)} y={tableY - 14} width={12} height={2} fill="#665544" rx="0.5" />
          {/* 椅子影 */}
          <ellipse cx={width * p + 6} cy={floorY + 1} rx={5} ry={0.6}
            fill="#000" fillOpacity="0.1" />
        </g>
      ))}

      {/* キャンドル */}
      <rect x={width * 0.48} y={tableY - 7} width={2.5} height={7} fill="#eee8" rx="0.5" />
      {/* 炎 — animated */}
      <ellipse cx={width * 0.492} cy={tableY - 8.5} rx={2} ry={3.5} fill="#ff8800" fillOpacity="0.7">
        <animate attributeName="ry" values="3;4;2.5;3.5;3" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="rx" values="1.8;2.2;1.5;2;1.8" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.6;0.8;0.5;0.7;0.6" dur="0.7s" repeatCount="indefinite" />
      </ellipse>
      {/* 炎の内側（明るいコア） */}
      <ellipse cx={width * 0.492} cy={tableY - 8} rx={1} ry={2} fill="#ffcc44" fillOpacity="0.5">
        <animate attributeName="ry" values="1.5;2.5;1.5" dur="0.5s" repeatCount="indefinite" />
      </ellipse>
      {/* キャンドルの光 */}
      <circle cx={width * 0.49} cy={tableY - 6} r={15}
        fill="#ffaa44" fillOpacity="0.04" />

      {/* 皿 */}
      {[0.38, 0.6].map((p, i) => (
        <g key={`plate-${i}`}>
          <ellipse cx={width * p} cy={tableY - 1} rx={7} ry={2}
            fill="none" stroke="#667" strokeWidth="0.5" />
          <ellipse cx={width * p} cy={tableY - 1} rx={5} ry={1.2}
            fill="none" stroke="#556" strokeWidth="0.3" />
        </g>
      ))}

      {/* ワイングラス */}
      {[0.35, 0.64].map((p, i) => (
        <g key={`wine-${i}`}>
          {/* ボウル */}
          <ellipse cx={width * p} cy={tableY - 5} rx={2.5} ry={3}
            fill="none" stroke="#8899aa" strokeWidth="0.3" strokeOpacity="0.5" />
          {/* ワイン */}
          <ellipse cx={width * p} cy={tableY - 4} rx={2} ry={1.5}
            fill="#881133" fillOpacity="0.3" />
          {/* ステム */}
          <line x1={width * p} y1={tableY - 2} x2={width * p} y2={tableY - 0.5}
            stroke="#8899aa" strokeWidth="0.3" strokeOpacity="0.4" />
          {/* ベース */}
          <line x1={width * p - 2} y1={tableY - 0.5} x2={width * p + 2} y2={tableY - 0.5}
            stroke="#8899aa" strokeWidth="0.3" strokeOpacity="0.4" />
        </g>
      ))}
    </g>
  );
}

// ホテル — ベッド + 枕/ブランケット + サイドランプ + カーテン
function HotelFurniture({ width, height, phase }: FurnitureProps) {
  const floorY = height * 0.75;
  const bedY = floorY - 12;

  return (
    <g>
      {/* カーテン（左右） */}
      <path d={`M 0 0 Q 8 ${height * 0.3} 4 ${height * 0.65} L 0 ${height * 0.65} Z`}
        fill="#2a1525" fillOpacity="0.6" />
      <path d={`M ${width} 0 Q ${width - 8} ${height * 0.3} ${width - 4} ${height * 0.65} L ${width} ${height * 0.65} Z`}
        fill="#2a1525" fillOpacity="0.6" />
      {/* カーテンのドレープライン */}
      <path d={`M 2 5 Q 6 ${height * 0.2} 3 ${height * 0.5}`}
        fill="none" stroke="#3a2535" strokeWidth="0.5" strokeOpacity="0.4" />
      <path d={`M ${width - 2} 5 Q ${width - 6} ${height * 0.2} ${width - 3} ${height * 0.5}`}
        fill="none" stroke="#3a2535" strokeWidth="0.5" strokeOpacity="0.4" />

      {/* ベッドフレーム */}
      <rect x={width * 0.18} y={bedY - 2} width={width * 0.64} height={16}
        fill="#1a1520" rx="2" stroke="#2a2530" strokeWidth="0.5" />
      {/* マットレス */}
      <rect x={width * 0.2} y={bedY} width={width * 0.6} height={12}
        fill="#2a2035" rx="2" />
      {/* シーツ */}
      <rect x={width * 0.22} y={bedY + 1} width={width * 0.56} height={10}
        fill={phase === 'imminent' ? '#3a1525' : '#252035'} rx="1" />
      {/* ブランケット（下半分） */}
      <rect x={width * 0.22} y={bedY + 5} width={width * 0.56} height={6}
        fill={phase === 'imminent' ? '#4a2030' : '#2a2540'} fillOpacity="0.7" rx="1" />
      {/* ブランケットの折り返し */}
      <line x1={width * 0.22} y1={bedY + 5} x2={width * 0.78} y2={bedY + 5}
        stroke="#ffffff" strokeWidth="0.3" strokeOpacity="0.1" />

      {/* 枕 */}
      <rect x={width * 0.24} y={bedY + 1.5} width={14} height={5}
        fill="#ddd" fillOpacity="0.15" rx="2.5" />
      <rect x={width * 0.56} y={bedY + 1.5} width={14} height={5}
        fill="#ddd" fillOpacity="0.15" rx="2.5" />
      {/* 枕ハイライト */}
      <ellipse cx={width * 0.28} cy={bedY + 3} rx={4} ry={1}
        fill="white" fillOpacity="0.05" />
      <ellipse cx={width * 0.6} cy={bedY + 3} rx={4} ry={1}
        fill="white" fillOpacity="0.05" />

      {/* ヘッドボード */}
      <rect x={width * 0.16} y={bedY - 16} width={width * 0.68} height={14}
        fill="#1a1520" rx="2" stroke="#2a2530" strokeWidth="0.5" />
      {/* ヘッドボード装飾 */}
      <rect x={width * 0.2} y={bedY - 14} width={width * 0.6} height={10}
        fill="none" stroke="#2a2530" strokeWidth="0.3" rx="1" />

      {/* サイドテーブル */}
      <rect x={width * 0.06} y={bedY - 4} width={14} height={18}
        fill="#2a2520" rx="1" />
      <rect x={width * 0.82} y={bedY - 4} width={14} height={18}
        fill="#2a2520" rx="1" />
      {/* テーブルトップハイライト */}
      <rect x={width * 0.065} y={bedY - 4} width={13} height={1}
        fill="#3a3530" fillOpacity="0.5" rx="0.5" />
      <rect x={width * 0.825} y={bedY - 4} width={13} height={1}
        fill="#3a3530" fillOpacity="0.5" rx="0.5" />
      {/* テーブル影 */}
      <rect x={width * 0.07} y={floorY} width={12} height={1.5}
        fill="#000" fillOpacity="0.15" rx="0.5" />
      <rect x={width * 0.83} y={floorY} width={12} height={1.5}
        fill="#000" fillOpacity="0.15" rx="0.5" />

      {/* ベッドサイドランプ */}
      {[width * 0.1, width * 0.88].map((lx, i) => (
        <g key={`lamp-${i}`}>
          {/* ランプ台 */}
          <rect x={lx - 1.5} y={bedY - 10} width={3} height={6}
            fill="#444" rx="0.5" />
          {/* ランプシェード */}
          <path d={`M ${lx - 4} ${bedY - 10} L ${lx - 2} ${bedY - 16} L ${lx + 2} ${bedY - 16} L ${lx + 4} ${bedY - 10}`}
            fill="#3a2a1a" fillOpacity="0.6" stroke="#4a3a2a" strokeWidth="0.3" />
          {/* 光 */}
          <circle cx={lx} cy={bedY - 8} r={3}
            fill="#ffaa44" fillOpacity="0.5">
            <animate attributeName="fill-opacity" values="0.3;0.6;0.3"
              dur={`${2.5 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
          {/* 光のスプレッド */}
          <ellipse cx={lx} cy={bedY} rx={10} ry={6}
            fill="#ffaa44" fillOpacity="0.03" />
        </g>
      ))}

      {/* ベッド影 */}
      <rect x={width * 0.2} y={floorY} width={width * 0.6} height={2}
        fill="#000" fillOpacity="0.2" rx="1" />
    </g>
  );
}

// カラオケ — L字ソファ + 大型モニター + マイク + ディスコボール
function KaraokeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;

  return (
    <g>
      {/* L字ソファ */}
      <rect x={width * 0.08} y={floorY - 14} width={width * 0.38} height={14}
        fill="#332244" rx="3" />
      <rect x={width * 0.08} y={floorY - 28} width={14} height={28}
        fill="#332244" rx="3" />
      {/* ソファクッション */}
      <rect x={width * 0.1} y={floorY - 12} width={width * 0.34} height={10}
        fill="#3a2a50" fillOpacity="0.5" rx="2" />
      <rect x={width * 0.1} y={floorY - 24} width={10} height={22}
        fill="#3a2a50" fillOpacity="0.5" rx="2" />
      {/* ソファ影 */}
      <rect x={width * 0.1} y={floorY} width={width * 0.36} height={2}
        fill="#000" fillOpacity="0.15" rx="1" />

      {/* テーブル */}
      <rect x={width * 0.3} y={floorY - 10} width={width * 0.22} height={3}
        fill="#222" rx="1" stroke="#333" strokeWidth="0.3" />
      {/* テーブル脚 */}
      <rect x={width * 0.34} y={floorY - 7} width={2} height={7} fill="#1a1a1a" />
      <rect x={width * 0.48} y={floorY - 7} width={2} height={7} fill="#1a1a1a" />

      {/* モニター（壁面） */}
      <rect x={width * 0.55} y={8} width={width * 0.34} height={height * 0.4}
        fill="#0a0a0a" rx="2" stroke="#333" strokeWidth="0.8" />
      {/* 画面 */}
      <rect x={width * 0.56} y={9} width={width * 0.32} height={height * 0.38}
        fill="#112244" fillOpacity="0.6" rx="1">
        <animate attributeName="fill" values="#112244;#221144;#112244" dur="4s" repeatCount="indefinite" />
      </rect>
      {/* 画面テキストライン（歌詞） */}
      {[0.3, 0.45, 0.6].map((py, i) => (
        <rect key={`lyric-${i}`}
          x={width * 0.6} y={8 + height * 0.4 * py}
          width={width * 0.24 * (i === 1 ? 0.7 : 0.9)} height={1.5}
          fill={i === 1 ? '#ffcc44' : '#88aacc'} fillOpacity={i === 1 ? 0.4 : 0.2} rx="0.5" />
      ))}
      {/* モニター影 */}
      <rect x={width * 0.57} y={8 + height * 0.4 + 2} width={width * 0.3} height={2}
        fill="#000" fillOpacity="0.15" rx="1" />

      {/* マイク */}
      <line x1={width * 0.48} y1={floorY - 8} x2={width * 0.48} y2={floorY - 28}
        stroke="#999" strokeWidth="1" />
      {/* マイクヘッド */}
      <ellipse cx={width * 0.48} cy={floorY - 30} rx={3.5} ry={4}
        fill="#555" stroke="#777" strokeWidth="0.5" />
      {/* マイクグリル */}
      <line x1={width * 0.48 - 2} y1={floorY - 31} x2={width * 0.48 + 2} y2={floorY - 31}
        stroke="#666" strokeWidth="0.3" />
      <line x1={width * 0.48 - 2} y1={floorY - 29.5} x2={width * 0.48 + 2} y2={floorY - 29.5}
        stroke="#666" strokeWidth="0.3" />
      {/* マイク台座 */}
      <ellipse cx={width * 0.48} cy={floorY - 6} rx={5} ry={1.5}
        fill="#444" />

      {/* ディスコボール */}
      <line x1={width * 0.72} y1={0} x2={width * 0.72} y2={6}
        stroke="#555" strokeWidth="0.5" />
      <circle cx={width * 0.72} cy={9} r={4}
        fill="#888" fillOpacity="0.3" stroke="#aaa" strokeWidth="0.3" />
      {/* ディスコボールのきらめき */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const bx = width * 0.72 + Math.cos(rad) * 3;
        const by = 9 + Math.sin(rad) * 3;
        return (
          <circle key={`sparkle-${i}`} cx={bx} cy={by} r={0.5}
            fill="white" fillOpacity="0.4">
            <animate attributeName="fill-opacity" values="0.2;0.6;0.2"
              dur={`${0.8 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        );
      })}

      {/* ドリンク */}
      <rect x={width * 0.34} y={floorY - 16} width={4} height={6}
        fill="#224466" fillOpacity="0.5" rx="0.5" />
      <rect x={width * 0.42} y={floorY - 15} width={3.5} height={5}
        fill="#662244" fillOpacity="0.5" rx="0.5" />
    </g>
  );
}

// カフェ — 丸テーブル + 椅子 + コーヒーカップ(animated steam) + 大きな窓
function CafeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;
  const tableY = floorY - 14;

  return (
    <g>
      {/* 大きな窓 */}
      <rect x={width * 0.06} y={4} width={width * 0.3} height={height * 0.55}
        fill="#0a1020" stroke="#334466" strokeWidth="0.8" rx="1" />
      {/* 窓の十字 */}
      <line x1={width * 0.21} y1={4} x2={width * 0.21} y2={4 + height * 0.55}
        stroke="#334466" strokeWidth="0.4" />
      <line x1={width * 0.06} y1={4 + height * 0.275} x2={width * 0.36} y2={4 + height * 0.275}
        stroke="#334466" strokeWidth="0.4" />
      {/* 窓の外の光（月明かり） */}
      <rect x={width * 0.07} y={5} width={width * 0.28} height={height * 0.53}
        fill="#112244" fillOpacity="0.15" rx="0.5" />
      {/* 窓からの光の差し込み */}
      <path d={`M ${width * 0.06} ${4 + height * 0.55} L ${width * 0.15} ${floorY} L ${width * 0.4} ${floorY} L ${width * 0.36} ${4 + height * 0.55}`}
        fill="#334466" fillOpacity="0.03" />

      {/* 丸テーブル */}
      <ellipse cx={width * 0.55} cy={tableY} rx={width * 0.16} ry={3}
        fill="#5a4a3a" />
      {/* テーブルハイライト */}
      <ellipse cx={width * 0.53} cy={tableY - 0.5} rx={width * 0.08} ry={1}
        fill="#6a5a4a" fillOpacity="0.3" />
      {/* テーブル脚 */}
      <rect x={width * 0.545} y={tableY} width={3} height={floorY - tableY}
        fill="#4a3a2a" />
      {/* テーブル台座 */}
      <ellipse cx={width * 0.555} cy={floorY - 1} rx={6} ry={1.5}
        fill="#4a3a2a" />
      {/* テーブル影 */}
      <ellipse cx={width * 0.55} cy={floorY + 1} rx={width * 0.14} ry={1}
        fill="#000" fillOpacity="0.15" />

      {/* コーヒーカップ */}
      {[0.49, 0.59].map((p, i) => (
        <g key={i}>
          {/* ソーサー */}
          <ellipse cx={width * p + 2} cy={tableY - 1} rx={4} ry={1}
            fill="none" stroke="#887766" strokeWidth="0.3" />
          {/* カップ */}
          <rect x={width * p} y={tableY - 5.5} width={5} height={4.5}
            fill="#887766" fillOpacity="0.3" rx="0.5" />
          {/* カップ取っ手 */}
          <path d={`M ${width * p + 5} ${tableY - 5} Q ${width * p + 8} ${tableY - 3.5} ${width * p + 5} ${tableY - 2}`}
            fill="none" stroke="#887766" strokeWidth="0.4" strokeOpacity="0.4" />
          {/* コーヒー */}
          <ellipse cx={width * p + 2.5} cy={tableY - 5} rx={2} ry={0.5}
            fill="#3a2010" fillOpacity="0.4" />
          {/* 湯気（animated） */}
          <path
            d={`M ${width * p + 1} ${tableY - 6.5} Q ${width * p + 2.5} ${tableY - 10} ${width * p + 1} ${tableY - 13}`}
            fill="none" stroke="#fff" strokeWidth="0.4" strokeOpacity="0.15">
            <animate attributeName="stroke-opacity" values="0.05;0.2;0.05" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="d"
              values={`M ${width * p + 1} ${tableY - 6.5} Q ${width * p + 2.5} ${tableY - 10} ${width * p + 1} ${tableY - 13};M ${width * p + 1} ${tableY - 6.5} Q ${width * p - 0.5} ${tableY - 10} ${width * p + 2} ${tableY - 14};M ${width * p + 1} ${tableY - 6.5} Q ${width * p + 2.5} ${tableY - 10} ${width * p + 1} ${tableY - 13}`}
              dur="3s" repeatCount="indefinite" />
          </path>
          <path
            d={`M ${width * p + 3} ${tableY - 6.5} Q ${width * p + 4} ${tableY - 9} ${width * p + 3.5} ${tableY - 12}`}
            fill="none" stroke="#fff" strokeWidth="0.3" strokeOpacity="0.1">
            <animate attributeName="stroke-opacity" values="0.03;0.15;0.03" dur="2s" repeatCount="indefinite" />
          </path>
        </g>
      ))}

      {/* 椅子 */}
      {[0.4, 0.68].map((p, i) => (
        <g key={`chair-${i}`}>
          {/* 座面 */}
          <rect x={width * p} y={floorY - 12} width={10} height={2} fill="#665544" rx="1" />
          {/* 脚 */}
          <rect x={width * p + 1} y={floorY - 10} width={1.5} height={10} fill="#554433" />
          <rect x={width * p + 7.5} y={floorY - 10} width={1.5} height={10} fill="#554433" />
          {/* 背もたれ */}
          <rect x={width * p + (i === 0 ? 0 : 9)} y={floorY - 22} width={1.5} height={12} fill="#665544" rx="0.5" />
          {/* 椅子影 */}
          <ellipse cx={width * p + 5} cy={floorY + 1} rx={4} ry={0.5}
            fill="#000" fillOpacity="0.1" />
        </g>
      ))}
    </g>
  );
}

// ラウンジ — デュアルソファ + ローテーブル + カクテルグラス + 天井スポットライト
function LoungeFurniture({ width, height }: FurnitureProps) {
  const floorY = height * 0.75;

  return (
    <g>
      {/* ソファ左 */}
      <rect x={width * 0.08} y={floorY - 14} width={width * 0.28} height={14}
        fill="#2a2535" rx="3" />
      <rect x={width * 0.08} y={floorY - 22} width={width * 0.28} height={8}
        fill="#252030" rx="3" />
      {/* 左ソファクッション */}
      <rect x={width * 0.1} y={floorY - 12} width={width * 0.24} height={10}
        fill="#302540" fillOpacity="0.4" rx="2" />
      {/* ソファ影 */}
      <rect x={width * 0.1} y={floorY} width={width * 0.26} height={2}
        fill="#000" fillOpacity="0.15" rx="1" />

      {/* ソファ右 */}
      <rect x={width * 0.64} y={floorY - 14} width={width * 0.28} height={14}
        fill="#2a2535" rx="3" />
      <rect x={width * 0.64} y={floorY - 22} width={width * 0.28} height={8}
        fill="#252030" rx="3" />
      {/* 右ソファクッション */}
      <rect x={width * 0.66} y={floorY - 12} width={width * 0.24} height={10}
        fill="#302540" fillOpacity="0.4" rx="2" />
      {/* ソファ影 */}
      <rect x={width * 0.66} y={floorY} width={width * 0.26} height={2}
        fill="#000" fillOpacity="0.15" rx="1" />

      {/* ローテーブル */}
      <rect x={width * 0.38} y={floorY - 8} width={width * 0.24} height={3}
        fill="#1a1a20" rx="1" stroke="#334" strokeWidth="0.3" />
      {/* テーブルトップハイライト */}
      <rect x={width * 0.39} y={floorY - 8} width={width * 0.22} height={0.8}
        fill="#2a2a30" fillOpacity="0.5" rx="0.3" />
      {/* テーブル脚 */}
      <rect x={width * 0.42} y={floorY - 5} width={2} height={5} fill="#222" />
      <rect x={width * 0.56} y={floorY - 5} width={2} height={5} fill="#222" />
      {/* テーブル影 */}
      <ellipse cx={width * 0.5} cy={floorY + 1} rx={width * 0.1} ry={0.8}
        fill="#000" fillOpacity="0.15" />

      {/* カクテルグラス */}
      {[0.44, 0.54].map((p, i) => (
        <g key={`cocktail-${i}`}>
          {/* 三角グラス */}
          <path d={`M ${width * p} ${floorY - 16} L ${width * p - 3} ${floorY - 12} L ${width * p + 3} ${floorY - 12}`}
            fill="none" stroke="#8899aa" strokeWidth="0.4" strokeOpacity="0.5" />
          {/* ステム */}
          <line x1={width * p} y1={floorY - 12} x2={width * p} y2={floorY - 9}
            stroke="#8899aa" strokeWidth="0.3" strokeOpacity="0.4" />
          {/* ベース */}
          <line x1={width * p - 2} y1={floorY - 9} x2={width * p + 2} y2={floorY - 9}
            stroke="#8899aa" strokeWidth="0.3" strokeOpacity="0.4" />
          {/* 液体 */}
          <path d={`M ${width * p - 0.5} ${floorY - 14} L ${width * p - 2} ${floorY - 12} L ${width * p + 2} ${floorY - 12}`}
            fill={i === 0 ? '#cc4466' : '#44aacc'} fillOpacity="0.2" />
        </g>
      ))}

      {/* 天井スポットライト */}
      {[0.2, 0.5, 0.8].map((p, i) => (
        <g key={`spot-${i}`}>
          {/* ライト本体 */}
          <rect x={width * p - 3} y={0} width={6} height={3}
            fill="#333" rx="1" />
          <circle cx={width * p} cy={4} r={2}
            fill="#ffaa44" fillOpacity="0.5">
            <animate attributeName="fill-opacity" values="0.3;0.6;0.3"
              dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
          </circle>
          {/* 光の円錐 */}
          <path d={`M ${width * p - 2} 4 L ${width * p - 12} ${floorY} L ${width * p + 12} ${floorY} L ${width * p + 2} 4`}
            fill="#ffaa44" fillOpacity="0.015" />
          {/* 床の光スポット */}
          <ellipse cx={width * p} cy={floorY - 1} rx={10} ry={2}
            fill="#ffaa44" fillOpacity="0.03" />
        </g>
      ))}
    </g>
  );
}
