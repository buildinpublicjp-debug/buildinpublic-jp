// Tokyo area definitions with 3D world coordinates and weights

export interface Area {
  name: string;
  nameEn: string;
  lat: number;
  lng: number;
  x: number;  // 3D world X
  z: number;  // 3D world Z
  weight: number; // probability weight for person placement
  vibe: string;
}

// Cross-section view: 3 districts, 10 couples total
export type RoomType = 'bar' | 'hotel' | 'restaurant' | 'karaoke' | 'apartment';
export type District = 'shibuya' | 'shinjuku' | 'roppongi';

export interface CrossSectionSlot {
  district: District;
  floor: number;      // 1-based floor in building cross-section
  roomType: RoomType;
  roomLabel: string;   // display name
  coupleIndex: number; // index into generated couples array
}

export const DISTRICTS: Record<District, { name: string; nameEn: string; color: string; coupleCount: number }> = {
  shibuya:  { name: '渋谷', nameEn: 'Shibuya',  color: '#ff6b9d', coupleCount: 4 },
  shinjuku: { name: '新宿', nameEn: 'Shinjuku', color: '#c084fc', coupleCount: 3 },
  roppongi: { name: '六本木', nameEn: 'Roppongi', color: '#60a5fa', coupleCount: 3 },
};

export const CROSS_SECTION_SLOTS: CrossSectionSlot[] = [
  // Shibuya: 4 couples
  { district: 'shibuya', floor: 1, roomType: 'bar',        roomLabel: 'Bar Moon',       coupleIndex: 0 },
  { district: 'shibuya', floor: 2, roomType: 'karaoke',     roomLabel: 'カラオケ館',      coupleIndex: 1 },
  { district: 'shibuya', floor: 3, roomType: 'hotel',       roomLabel: 'Hotel Lipps',    coupleIndex: 2 },
  { district: 'shibuya', floor: 4, roomType: 'apartment',   roomLabel: '彼女の部屋',      coupleIndex: 3 },
  // Shinjuku: 3 couples
  { district: 'shinjuku', floor: 1, roomType: 'restaurant', roomLabel: 'ゴールデン街 酒場', coupleIndex: 4 },
  { district: 'shinjuku', floor: 2, roomType: 'bar',        roomLabel: 'Bar Velvet',     coupleIndex: 5 },
  { district: 'shinjuku', floor: 3, roomType: 'hotel',      roomLabel: 'Hotel 歌舞伎',    coupleIndex: 6 },
  // Roppongi: 3 couples
  { district: 'roppongi', floor: 1, roomType: 'restaurant', roomLabel: 'Trattoria Sei',  coupleIndex: 7 },
  { district: 'roppongi', floor: 2, roomType: 'bar',        roomLabel: 'Lounge Hills',   coupleIndex: 8 },
  { district: 'roppongi', floor: 3, roomType: 'apartment',  roomLabel: '彼の部屋',        coupleIndex: 9 },
];

export const AREAS: Area[] = [
  { name:'円山町', nameEn:'Maruyama-cho', lat:35.657, lng:139.693, x:0, z:0, weight:8, vibe:'ラブホ密集地帯' },
  { name:'歌舞伎町', nameEn:'Kabukicho', lat:35.695, lng:139.703, x:120, z:-180, weight:9, vibe:'ネオン過多' },
  { name:'六本木', nameEn:'Roppongi', lat:35.663, lng:139.731, x:80, z:40, weight:7, vibe:'国際的前戯' },
  { name:'西麻布', nameEn:'Nishi-Azabu', lat:35.659, lng:139.724, x:50, z:30, weight:5, vibe:'隠れ家バー' },
  { name:'恵比寿', nameEn:'Ebisu', lat:35.647, lng:139.710, x:-20, z:60, weight:6, vibe:'デート適性高' },
  { name:'中目黒', nameEn:'Nakameguro', lat:35.644, lng:139.699, x:-40, z:50, weight:4, vibe:'桜と川沿い' },
  { name:'神泉', nameEn:'Shinsen', lat:35.656, lng:139.692, x:-10, z:5, weight:5, vibe:'隠れ家の入口' },
  { name:'下北沢', nameEn:'Shimokitazawa', lat:35.661, lng:139.668, x:-80, z:-20, weight:4, vibe:'サブカルの熱' },
  { name:'三軒茶屋', nameEn:'Sangenjaya', lat:35.644, lng:139.670, x:-70, z:50, weight:3, vibe:'三角地帯の飲み屋' },
  { name:'池袋', nameEn:'Ikebukuro', lat:35.730, lng:139.711, x:60, z:-250, weight:6, vibe:'雑多なエネルギー' },
  { name:'新宿三丁目', nameEn:'Shinjuku 3', lat:35.690, lng:139.706, x:80, z:-150, weight:5, vibe:'ゴールデン街隣接' },
  { name:'銀座', nameEn:'Ginza', lat:35.672, lng:139.765, x:200, z:20, weight:4, vibe:'大人の前戯' },
  { name:'神楽坂', nameEn:'Kagurazaka', lat:35.703, lng:139.741, x:130, z:-100, weight:4, vibe:'石畳の路地' },
  { name:'麻布十番', nameEn:'Azabu-Juban', lat:35.654, lng:139.737, x:100, z:45, weight:4, vibe:'商店街の親密感' },
  { name:'表参道', nameEn:'Omotesando', lat:35.665, lng:139.712, x:30, z:30, weight:3, vibe:'おしゃれ女子密度' },
  { name:'渋谷駅前', nameEn:'Shibuya Station', lat:35.659, lng:139.701, x:10, z:20, weight:7, vibe:'スクランブルの熱量' },
  { name:'吉祥寺', nameEn:'Kichijoji', lat:35.703, lng:139.580, x:-250, z:-100, weight:3, vibe:'完成されたデート空間' },
  { name:'自由が丘', nameEn:'Jiyugaoka', lat:35.608, lng:139.669, x:-80, z:120, weight:2, vibe:'女性比率トップクラス' },
  { name:'高円寺', nameEn:'Koenji', lat:35.705, lng:139.650, x:-120, z:-200, weight:2, vibe:'サブカル飲み屋' },
  { name:'錦糸町', nameEn:'Kinshicho', lat:35.696, lng:139.814, x:300, z:-150, weight:3, vibe:'東東京ディープ' },
];
