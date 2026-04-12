// MBTI System — 16 types with foreplay-specific traits + chemistry matrix

export type MBTIType = 'INTJ'|'INTP'|'ENTJ'|'ENTP'|'INFJ'|'INFP'|'ENFJ'|'ENFP'|'ISTJ'|'ISFJ'|'ESTJ'|'ESFJ'|'ISTP'|'ISFP'|'ESTP'|'ESFP';

export interface MBTIProfile {
  type: MBTIType;
  nickname: string;
  color: string;
  group: 'analyst' | 'diplomat' | 'sentinel' | 'explorer';
  foreplayStyle: string;
  touch: string;
  weakness: string;
  tells: string;
  population: number; // percentage
}

export const MBTI_PROFILES: Record<MBTIType, MBTIProfile> = {
  INTJ: { type:'INTJ', nickname:'策略家', color:'#8b5cf6', group:'analyst', population:0.02,
    foreplayStyle:'計算された接近。全てに意図がある。沈黙を武器にする。',
    touch:'接触は少ないが、触れた時の意味が重い。手首、顎。',
    weakness:'計画外の展開に弱い。相手が予測不能だと崩れる。',
    tells:'瞳孔が開く。声のトーンが0.5音下がる。' },
  INTP: { type:'INTP', nickname:'論理学者', color:'#6366f1', group:'analyst', population:0.03,
    foreplayStyle:'知的会話が前戯。アイデアで興奮する。身体が後からついてくる。',
    touch:'不器用。でも考えた末の接触は異常に的確。',
    weakness:'感情を言語化できない。行動で示すしかない瞬間にフリーズする。',
    tells:'急に黙る。思考が止まった=感情が動いた。' },
  ENTJ: { type:'ENTJ', nickname:'指揮官', color:'#dc2626', group:'analyst', population:0.02,
    foreplayStyle:'リードする。場所、タイミング、全てをコントロールしたがる。',
    touch:'大胆。腰に手を回す、顎を上げさせる。',
    weakness:'相手にリードされると動揺する。その動揺が色気になる。',
    tells:'声が低くなる。目が据わる。' },
  ENTP: { type:'ENTP', nickname:'討論者', color:'#f59e0b', group:'analyst', population:0.03,
    foreplayStyle:'言葉で攻める。冗談の中に本気を混ぜる。境界線を試す。',
    touch:'遊び半分に見せかけた本気のタッチ。',
    weakness:'真剣な沈黙。ふざけられない瞬間に本性が出る。',
    tells:'冗談が止まる。声のテンポが落ちる。' },
  INFJ: { type:'INFJ', nickname:'提唱者', color:'#8b5cf6', group:'diplomat', population:0.02,
    foreplayStyle:'相手の深層を読む。言葉にならないものを感じ取る。',
    touch:'意味のある接触だけ。指の絡め方まで意識してる。',
    weakness:'自分の内面を読まれると崩壊的に心を開く。',
    tells:'瞬きが減る。声が囁きに近づく。' },
  INFP: { type:'INFP', nickname:'仲介者', color:'#ec4899', group:'diplomat', population:0.04,
    foreplayStyle:'理想の瞬間を心の中で100回シミュレーションしてる。',
    touch:'控えめだが、触れた瞬間の感情の深さが異常。指先が震える。',
    weakness:'理想と現実のギャップ。でもそのギャップが逆に生々しい。',
    tells:'頬が赤くなる。目が潤む。言葉が詩的になる。' },
  ENFJ: { type:'ENFJ', nickname:'主人公', color:'#10b981', group:'diplomat', population:0.03,
    foreplayStyle:'相手を主役にする。「あなたのことをもっと知りたい」が本気。',
    touch:'包み込む系。肩を抱く、手を両手で包む。',
    weakness:'自分が欲しがってることを認められない。',
    tells:'世話焼きが止まる。自分のことを話し始める。' },
  ENFP: { type:'ENFP', nickname:'運動家', color:'#f97316', group:'diplomat', population:0.08,
    foreplayStyle:'テンションの波で巻き込む。楽しい→急に真剣→また楽しい。',
    touch:'自然で頻繁。腕を掴む、肩に頭を乗せる。全部軽く見えて本気。',
    weakness:'深い沈黙。普段の明るさが消えた瞬間の引力がやばい。',
    tells:'声のボリュームが下がる。いつもの笑顔が消えて、ただ見つめる。' },
  ISTJ: { type:'ISTJ', nickname:'管理者', color:'#475569', group:'sentinel', population:0.11,
    foreplayStyle:'ルーティンの中に特別を忍ばせる。',
    touch:'少ないが、一度始まったら止まらない。堰を切ったように。',
    weakness:'ルーティンが崩れた時。予定外の展開で防壁が消える。',
    tells:'ネクタイを緩める。袖をまくる。身体を楽にする仕草。' },
  ISFJ: { type:'ISFJ', nickname:'擁護者', color:'#0ea5e9', group:'sentinel', population:0.13,
    foreplayStyle:'世話を焼くことが前戯。「寒くない？」全部口実。',
    touch:'ケアの延長。コートをかける、額の髪を払う。',
    weakness:'自分が守られる側になった瞬間。',
    tells:'世話焼きが過剰になる。手が震え始める。' },
  ESTJ: { type:'ESTJ', nickname:'幹部', color:'#b91c1c', group:'sentinel', population:0.09,
    foreplayStyle:'段取りを組む。決断力が色気。',
    touch:'迷いがない。手を引く、ドアを開ける。',
    weakness:'コントロールできない感情。「お願い」する側に回った時。',
    tells:'声が少しだけ柔らかくなる。敬語が崩れる。' },
  ESFJ: { type:'ESFJ', nickname:'領事', color:'#059669', group:'sentinel', population:0.12,
    foreplayStyle:'場の空気を作る天才。1人だけ特別にする。',
    touch:'さりげなく多い。特別な人への接触だけ0.5秒長い。',
    weakness:'2人きりになった瞬間。社交モードが切れた後の素。',
    tells:'周りを気にしなくなる。' },
  ISTP: { type:'ISTP', nickname:'巨匠', color:'#64748b', group:'explorer', population:0.05,
    foreplayStyle:'言葉より行動。黙って隣にいる。必要な時だけ動く。',
    touch:'実用的に見えて色気がある。ジャケットを肩にかける。',
    weakness:'感情を聞かれること。代わりにキスする。',
    tells:'道具いじりが止まる。手が所在なさげになる。' },
  ISFP: { type:'ISFP', nickname:'冒険家', color:'#a855f7', group:'explorer', population:0.09,
    foreplayStyle:'五感で生きてる。身体が先に反応する。',
    touch:'芸術的。指の動きが繊細。相手の輪郭をなぞるように。',
    weakness:'言葉。感じていることを説明しようとして、近づく。',
    tells:'呼吸が深くなる。目を閉じる時間が長くなる。' },
  ESTP: { type:'ESTP', nickname:'起業家', color:'#ef4444', group:'explorer', population:0.04,
    foreplayStyle:'即興。その場の空気を読んで最適な一手を打つ。',
    touch:'大胆で自然。肩を組む、手を引く。躊躇がない。',
    weakness:'スローダウン。ゆっくり見つめられると軽さが嘘だったとバレる。',
    tells:'動きが止まる。普段の落ち着きのなさが消える。' },
  ESFP: { type:'ESFP', nickname:'エンターテイナー', color:'#f43f5e', group:'explorer', population:0.09,
    foreplayStyle:'楽しませることが前戯。踊る、笑わせる、驚かせる。全部がフリ。',
    touch:'最も自然で頻繁。ハグ、頬キス、腕組み。境界線が元々薄い。',
    weakness:'静かな真剣さ。パーティーが終わった後の沈黙で素の脆さが見える。',
    tells:'声が小さくなる。冗談を言わなくなる。' },
};

export const ALL_MBTI_TYPES: MBTIType[] = Object.keys(MBTI_PROFILES) as MBTIType[];

export interface Chemistry {
  score: number;
  desc: string;
  dynamic: string;
}

const CHEMISTRY_MAP: Record<string, Chemistry> = {
  'INTJ×ENFP': { score:95, desc:'知性×情熱の爆発。INTJの計算をENFPが全部壊す。', dynamic:'支配構造の逆転が起き続ける' },
  'INFJ×ENTP': { score:92, desc:'INFJが見透かす×ENTPが試す。「バレてるんだろ」「最初から」', dynamic:'最も前戯的会話が生まれる' },
  'ENFP×INFJ': { score:93, desc:'黄金ペア。ENFPが表面を壊す→INFJの深層に触れる。', dynamic:'感情の津波' },
  'ISTP×ESFP': { score:90, desc:'身体言語だけで会話が成立する。言葉がいらない。', dynamic:'最も非言語的な前戯' },
  'INTJ×ENTP': { score:88, desc:'知的チェスマッチ。読めなかった瞬間がキス。', dynamic:'議論が前戯になる' },
  'ISFP×ENTJ': { score:86, desc:'ENTJの支配性×ISFPの受容性。「嫌だ」の破壊力。', dynamic:'力関係の反転が前戯のクライマックス' },
  'INFP×ENFJ': { score:85, desc:'ENFJが安全地帯→INFPが心を開く→ENFJも開きたくなる。', dynamic:'ケアの連鎖が親密さに変わる' },
  'ESTP×ISFJ': { score:84, desc:'ESTPの大胆さ×ISFJの献身。初めて「ありがとう」と言う夜。', dynamic:'野生と母性の交差' },
  'ISTP×INFJ': { score:82, desc:'行動をINFJが意味づける。「別に」の裏を全部読む。', dynamic:'行動と解釈のすれ違いが色気' },
  'ENTJ×INTP': { score:80, desc:'ENTJがリード→INTPが「なぜ？」→ENTJが初めて立ち止まる。', dynamic:'知的服従と反逆のゲーム' },
};

export function getMBTIChemistry(type1: MBTIType, type2: MBTIType): Chemistry {
  const key1 = `${type1}×${type2}`;
  const key2 = `${type2}×${type1}`;
  if (CHEMISTRY_MAP[key1]) return CHEMISTRY_MAP[key1];
  if (CHEMISTRY_MAP[key2]) return CHEMISTRY_MAP[key2];
  if (type1 === type2) return { score:60, desc:'鏡。理解は早いが緊張が生まれにくい。', dynamic:'共鳴するが火花が散りにくい' };
  const opp = type1[0]!==type2[0] && type1[1]!==type2[1];
  if (opp) return { score:82, desc:'正反対の引力。理解できないことが魅力。', dynamic:'異質さが前戯の燃料' };
  return { score:70, desc:'部分的な共鳴。共通する機能が橋になる。', dynamic:'じわじわ効いてくる' };
}
