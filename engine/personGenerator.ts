// AI Person Generator — seeded random generation for 300 characters

import { MBTIType, MBTI_PROFILES, ALL_MBTI_TYPES, getMBTIChemistry } from './mbti';
import { EmotionState, createEmotionState } from './emotions';
import { Phase, phaseFromHours } from './scoring';
import { AREAS, Area } from '../data/areas';
import { getSituation } from '../data/situationTemplates';

export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'disorganized';
export type LoveLanguage = 'words' | 'touch' | 'gifts' | 'service' | 'time';
export type Gender = 'male' | 'female';

export interface PersonProfile {
  birthplace: string;
  family: string;
  education: string;
  job: string;
  favoriteFood: string;
  hobby: string;
  music: string;
  trauma: string;
  biggestFear: string;
  deepestDesire: string;
  loveLanguage: LoveLanguage;
  attachment: AttachmentStyle;
  innerMonologue: string;
}

export interface AIPerson {
  id: string;
  name: { ja: string; en: string };
  age: number;
  gender: Gender;
  mbti: MBTIType;
  attachmentStyle: AttachmentStyle;
  job: { ja: string; en: string };
  area: string;
  appearance: { height: number; build: string; style: string };
  lat: number;
  lng: number;
  position: { x: number; z: number };
  currentPhase: Phase;
  hoursUntilSex: number;
  emotions: EmotionState;
  situation: string;
  score: number;
  bodyAngle: number;
  profile: PersonProfile;
}

export interface Relationship {
  id: string;
  personA: string;
  personB: string;
  stage: string;
  meetCount: number;
  howMet: string;
  chemistryScore: number;
}

// Seeded PRNG
function srand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

const ATTACHMENT_DIST: [AttachmentStyle, number][] = [
  ['secure', 0.56], ['anxious', 0.76], ['avoidant', 0.94], ['disorganized', 1.0]
];

const JA_SURNAMES = ['田中','佐藤','鈴木','高橋','渡辺','伊藤','山本','中村','小林','加藤','吉田','山田','松本','井上','木村','林','斎藤','清水','山口','森'];
const JA_MALE_NAMES = ['翔太','大輝','蓮','悠真','陽翔','湊','悠人','朝陽','蒼','律','健太','拓海','颯太','奏','瑛太','柊','結翔','陸','涼介','海斗'];
const JA_FEMALE_NAMES = ['美咲','陽菜','凛','結衣','さくら','芽衣','莉子','心春','葵','楓','美月','花音','ひなた','詩','紬','琴音','彩花','優奈','真央','七海'];

const M_JOBS = ['エンジニア','営業','バーテンダー','大学生','コンサル','料理人','デザイナー','起業家','医師','音楽家','建築士','教師'];
const F_JOBS = ['看護師','編集者','大学生','カフェ店員','デザイナー','花屋','翻訳家','美容師','マーケター','ダンサー','薬剤師','教師'];
const M_JOBS_EN = ['Engineer','Sales','Bartender','Student','Consultant','Chef','Designer','Entrepreneur','Doctor','Musician','Architect','Teacher'];
const F_JOBS_EN = ['Nurse','Editor','Student','Barista','Designer','Florist','Translator','Stylist','Marketer','Dancer','Pharmacist','Teacher'];

const STAGES = ['初対面','2回目','3回目','曖昧','恋人','マッチングアプリ'];
const HOW_METS = ['マッチングアプリ','友達の紹介','職場','大学','バーで','イベントで','SNSのDM','趣味のコミュニティ','行きつけの店','合コン'];

// --- MBTI-driven profile data ---

const BIRTHPLACES: Record<string, string[]> = {
  analyst: ['東京都文京区','神奈川県横浜市青葉区','千葉県柏市','埼玉県さいたま市浦和区','茨城県つくば市','東京都世田谷区','長野県松本市','京都府京都市左京区'],
  diplomat: ['東京都吉祥寺','神奈川県鎌倉市','北海道札幌市','京都府宇治市','長野県軽井沢町','福岡県太宰府市','奈良県奈良市','沖縄県那覇市'],
  sentinel: ['埼玉県川越市','千葉県船橋市','神奈川県藤沢市','愛知県名古屋市','大阪府堺市','福岡県北九州市','群馬県高崎市','静岡県浜松市'],
  explorer: ['東京都渋谷区','大阪府大阪市中央区','福岡県福岡市中央区','沖縄県北谷町','兵庫県神戸市','広島県広島市','宮城県仙台市','鹿児島県鹿児島市'],
};

const FAMILIES: Record<string, string[]> = {
  analyst: ['一人っ子、両親は研究者','2人兄弟の長男、父は銀行員','3人兄弟の末っ子、母は教師','一人っ子、父は医師、母は薬剤師','2人姉妹の次女、両親は公務員','一人っ子、両親は自営業','2人兄弟の長女、父はエンジニア','3人兄弟の次男、父は公務員'],
  diplomat: ['4人家族の末っ子、父は画家','2人姉妹の姉、母はピアノ教師','一人っ子、両親は離婚、母子家庭','3人兄弟の真ん中、父は僧侶','2人姉妹の妹、両親はカフェ経営','一人っ子、祖母に育てられた','4人兄弟の3番目、父は教師','2人姉妹の姉、母は看護師'],
  sentinel: ['3人兄弟の長男、父は消防士','5人家族の真ん中、実家は農家','2人兄弟の弟、父は警察官','3人姉妹の長女、母は専業主婦','4人兄弟の長男、父は大工','2人兄弟の兄、両親は教師','3人兄弟の次男、実家は和菓子屋','2人姉妹の姉、父は自衛官'],
  explorer: ['一人っ子、両親は海外赴任が多い','2人兄弟の弟、父は料理人','3人兄弟の末っ子、実家はサーフショップ','一人っ子、母はダンサー','2人姉妹の妹、父はミュージシャン','一人っ子、両親はバー経営','4人兄弟の末っ子、父はトラック運転手','2人兄弟の兄、実家は中華料理店'],
};

const EDUCATION: Record<string, string[]> = {
  analyst: ['東京工業大学情報理工学院卒','早稲田大学理工学部卒','京都大学工学部中退','慶應義塾大学経済学部卒','東京大学文学部卒','筑波大学情報学群卒','一橋大学商学部卒','東北大学理学部卒'],
  diplomat: ['明治大学文学部卒','多摩美術大学卒','上智大学外国語学部卒','ICU教養学部卒','立教大学文学部卒','京都精華大学芸術学部卒','日本大学芸術学部卒','青山学院大学文学部卒'],
  sentinel: ['日本大学法学部卒','中央大学商学部卒','専修大学経営学部卒','明治大学商学部卒','法政大学社会学部卒','東洋大学経済学部卒','拓殖大学商学部卒','駒澤大学法学部卒'],
  explorer: ['専門学校卒（調理師）','高卒、独学でスキル習得','武蔵野美術大学中退','日本体育大学卒','代々木アニメーション学院卒','バンタンデザイン研究所卒','ESPエンタテインメント卒','服飾専門学校卒'],
};

const SPECIFIC_JOBS: Record<string, string[]> = {
  analyst: ['外資ITのバックエンドエンジニア','データサイエンティスト','戦略コンサルのアナリスト','スタートアップCTO','量子コンピュータ研究員','フリーランスのアルゴリズムエンジニア','ブロックチェーン開発者','特許事務所の弁理士'],
  diplomat: ['出版社の文芸編集者','NPOのコミュニティマネージャー','臨床心理士','絵本作家','ヨガインストラクター','フリーランスの翻訳家','美術館の学芸員','カウンセラー'],
  sentinel: ['メガバンクの法人営業','市役所の都市計画課','大手メーカーの品質管理','会計事務所の税理士','不動産会社の営業部長','総合病院の事務長','物流会社の配送管理','保険会社のアクチュアリー'],
  explorer: ['フリーランスのカメラマン','ストリートブランドのデザイナー','バーテンダー兼DJ','プロスノーボーダー','パーソナルトレーナー','タトゥーアーティスト','フードトラック経営','サーフィンインストラクター'],
};

const FAVORITE_FOODS: Record<string, string[]> = {
  analyst: ['神保町さぼうるのナポリタン','荻窪の春木屋の中華そば','南インド料理専門店の本格ミールス','人形町の玉ひでの親子丼','新橋のまる富のかつ丼','秋葉原のジャンクガレッジの二郎系','御茶ノ水のエチオピアのカレー','四谷の坂本屋のとんかつ'],
  diplomat: ['代々木上原のパス・ディ・リッシュのパスタ','鎌倉のイワタコーヒーのホットケーキ','下北沢のBig-Pigの焼き菓子','吉祥寺の小ざさの羊羹','谷中のカヤバ珈琲のたまごサンド','恵比寿のアフターグロウのスコーン','清澄白河のiki ESPRESSOのラテ','中目黒のトラヴァイエのクロワッサン'],
  sentinel: ['新橋の岡むら屋のメンチカツ定食','浅草の大黒家の天丼','巣鴨のときわ食堂の焼き魚定食','神田まつやの蕎麦','日本橋たいめいけんのオムライス','築地の井上のラーメン','赤羽のまるます家の刺身定食','上野の蓬莱屋のヒレカツ'],
  explorer: ['渋谷のAFURIの柚子塩ラーメン','代官山の蔦屋書店隣のタコス','三軒茶屋のシバカリーワラのチキンカレー','中目黒の焼肉ジャンボ','六本木の一蘭のとんこつ','恵比寿のブラッチェリアのピザ','新宿ゴールデン街のもつ煮','原宿のLuke\'sのロブスターロール'],
};

const HOBBIES: Record<string, string[]> = {
  analyst: ['プログラミング','チェス','天体観測','数学パズル','ボードゲーム設計','論文読み漁り','ワイン研究','SF読書'],
  diplomat: ['古本屋巡り','水彩画','詩を書く','瞑想','カフェでジャーナリング','美術館巡り','手紙を書く','オルゴール収集'],
  sentinel: ['ゴルフ','家庭菜園','DIY','登山','料理の段取り研究','御朱印集め','盆栽','ジグソーパズル'],
  explorer: ['サーフィン','スケートボード','ストリートスナップ撮影','DJing','ボルダリング','バイクツーリング','古着屋巡り','格闘技'],
};

const MUSIC: Record<string, string[]> = {
  analyst: ['Radiohead','Aphex Twin','Tool','King Crimson','Autechre','Steely Dan','Miles Davis','Boards of Canada'],
  diplomat: ['Bon Iver','Sufjan Stevens','坂本龍一','Sigur Rós','Ichiko Aoba','Fleet Foxes','Nick Drake','Novo Amor'],
  sentinel: ['Mr.Children','サザンオールスターズ','Official髭男dism','back number','BUMP OF CHICKEN','宇多田ヒカル','スピッツ','DREAMS COME TRUE'],
  explorer: ['King Gnu','Kendrick Lamar','BROCKHAMPTON','藤井風','millennium parade','Bad Bunny','Tyler, the Creator','NewJeans'],
};

const TRAUMAS: Record<string, string[]> = {
  analyst: ['小学校で「変わってる」と孤立した経験','親に感情を否定され続けた','初めて信頼した友人に裏切られた','完璧を求めすぎて体を壊した','知的に対等な人に出会えない孤独','「お前は冷たい」と言われ続けた恋愛','努力が評価されなかった受験失敗','自分の感情が分からなくなった時期'],
  diplomat: ['親の期待に応えられなかった罪悪感','大切な人を助けられなかった無力感','いじめを見て見ぬふりした自己嫌悪','共依存的な恋愛で自分を見失った','創作物を全否定されたトラウマ','「繊細すぎる」と何度も言われた','親友の自殺未遂に立ち会った','理想と現実の落差で鬱になった時期'],
  sentinel: ['父親のように生きることへの恐怖','レールから外れた瞬間のパニック','信頼していた上司の裏切り','「つまらない人間」と言われたこと','完璧な家庭像の崩壊','自分の気持ちより正しさを選んだ後悔','変化を恐れて大切な人を失った','「感情がない」と恋人に泣かれた'],
  explorer: ['親に放置されて育った寂しさ','衝動的な行動で大切な人を傷つけた','居場所がないと感じ続けた青春','バンドメンバーの突然の死','怪我でスポーツを諦めた','「軽い」「本気じゃない」と決めつけられる','いつも途中で飽きる自分への嫌悪','刺激がないと生きている実感が持てない'],
};

const FEARS: Record<string, string[]> = {
  analyst: ['無能だと思われること','人に理解されないまま死ぬこと','コントロールを失うこと','感情に飲まれて判断力を失うこと'],
  diplomat: ['本当の自分を見せたら嫌われること','大切な人を傷つけてしまうこと','自分の人生に意味がないこと','愛されるに値しない人間だと証明されること'],
  sentinel: ['社会的な信用を失うこと','変化に対応できず取り残されること','家族を守れないこと','自分の人生が誰の記憶にも残らないこと'],
  explorer: ['自由を奪われること','退屈な人生で終わること','本当に深い関係を築けないこと','一つのことに縛られて可能性を失うこと'],
};

const DESIRES: Record<string, string[]> = {
  analyst: ['誰にも到達できない高みに立つこと','完全に理解し合える知的パートナー','世界の仕組みを解き明かすこと','自分の理論が世界を変えること'],
  diplomat: ['魂レベルで繋がれる人と出会うこと','自分の存在が誰かを救うこと','完全に安心して自分をさらけ出せる関係','美しいものを生み出し続けること'],
  sentinel: ['盤石な基盤の上で愛する人を守ること','社会に不可欠な存在になること','何十年後も変わらない絆','自分の作ったものが次世代に残ること'],
  explorer: ['まだ誰も見たことのない景色を見ること','全ての瞬間を全力で生きること','どんな自分でも受け入れてくれる場所','限界を超え続けること'],
};

const LOVE_LANG_BY_GROUP: Record<string, LoveLanguage[]> = {
  analyst: ['words','time','words','time'],
  diplomat: ['words','time','touch','gifts'],
  sentinel: ['service','gifts','service','time'],
  explorer: ['touch','time','touch','gifts'],
};

const MONOLOGUES: Record<string, string[]> = {
  analyst: ['...このパターン、前にも見た。でも今回は違う変数がある。','全部計算通り。なのに胸が苦しいのは計算外。','感情はノイズだと思ってた。でもこのノイズが一番大事なシグナルかもしれない。','理解したい。でも理解した瞬間に魔法が消えるのも知ってる。'],
  diplomat: ['この人の中に、まだ誰にも見せてない部屋がある気がする。','世界が美しく見える日と、全部が嘘に見える日の差が激しい。','本当の自分を出したら壊れるかもしれない。でも隠し続ける方が壊れる。','誰かの心に触れたい。でもその手が震えてる。'],
  sentinel: ['予定通りに進んでる。問題ない。...本当に問題ないのか？','ちゃんとしなきゃ。でも「ちゃんと」って誰が決めたんだろう。','この安定が崩れるのが怖い。でも崩れないと何も変わらないのも知ってる。','守りたいものが増えるほど、失うのが怖くなる。'],
  explorer: ['今この瞬間が全て。明日のことは明日の自分に任せる。','退屈が一番怖い。心臓が動いてるか確かめたくなる。','自由でいたい。でも誰かに「いてほしい」って言われたい矛盾。','深く潜るのが怖いだけかもしれない。水面でバタバタしてるだけかも。'],
};

function generateProfile(mbti: MBTIType, age: number, gender: Gender, attachment: AttachmentStyle, r: () => number): PersonProfile {
  const group = MBTI_PROFILES[mbti].group;
  const pick = <T>(arr: T[]): T => arr[Math.floor(r() * arr.length)];

  return {
    birthplace: pick(BIRTHPLACES[group]),
    family: pick(FAMILIES[group]),
    education: age < 22 ? `${pick(['早稲田大学','慶應義塾大学','明治大学','日本大学','東京都立大学','法政大学'])}${pick(['文学部','経済学部','社会学部','理工学部'])}在学中` : pick(EDUCATION[group]),
    job: pick(SPECIFIC_JOBS[group]),
    favoriteFood: pick(FAVORITE_FOODS[group]),
    hobby: pick(HOBBIES[group]),
    music: pick(MUSIC[group]),
    trauma: pick(TRAUMAS[group]),
    biggestFear: pick(FEARS[group]),
    deepestDesire: pick(DESIRES[group]),
    loveLanguage: pick(LOVE_LANG_BY_GROUP[group]),
    attachment,
    innerMonologue: pick(MONOLOGUES[group]),
  };
}

function pickMBTI(r: () => number): MBTIType {
  const roll = r();
  let cumulative = 0;
  for (const t of ALL_MBTI_TYPES) {
    cumulative += MBTI_PROFILES[t].population;
    if (roll <= cumulative) return t;
  }
  return 'ISFJ';
}

function pickAttachment(r: () => number): AttachmentStyle {
  const roll = r();
  for (const [style, threshold] of ATTACHMENT_DIST) {
    if (roll <= threshold) return style;
  }
  return 'secure';
}

export function generatePerson(id: number): AIPerson {
  const r = srand(id * 7919 + 42);
  const gender: Gender = r() > 0.5 ? 'male' : 'female';
  const age = 18 + Math.floor(r() * 18);
  const mbti = pickMBTI(r);
  const attachment = pickAttachment(r);

  const surname = JA_SURNAMES[Math.floor(r() * JA_SURNAMES.length)];
  const firstName = gender === 'male'
    ? JA_MALE_NAMES[Math.floor(r() * JA_MALE_NAMES.length)]
    : JA_FEMALE_NAMES[Math.floor(r() * JA_FEMALE_NAMES.length)];

  const jobIdx = Math.floor(r() * 12);
  const job = gender === 'male'
    ? { ja: M_JOBS[jobIdx], en: M_JOBS_EN[jobIdx] }
    : { ja: F_JOBS[jobIdx], en: F_JOBS_EN[jobIdx] };

  const areaWeights = AREAS.flatMap(a => Array(a.weight).fill(a));
  const area = areaWeights[Math.floor(r() * areaWeights.length)];

  const hoursLeft = r() * 24;
  const phase = phaseFromHours(hoursLeft);
  const desire = phase==='imminent'?85+r()*15:phase==='critical'?70+r()*20:phase==='escalation'?50+r()*25:phase==='approach'?30+r()*20:15+r()*20;
  const score = Math.round(Math.min(99, desire*0.4+(100-hoursLeft/24*100)*0.3+r()*15));

  const emotions = createEmotionState({
    desire: Math.round(desire),
    anxiety: Math.round(phase==='seed'?20+r()*25:phase==='approach'?25+r()*20:15+r()*20),
    trust: Math.round(30+r()*30),
    excitement: Math.round(desire*0.8+r()*10),
  });

  const situation = getSituation(phase, area.name,
    { age, mbti, job: job.ja },
    { age: 18+Math.floor(r()*18), mbti: pickMBTI(r), job: gender==='male'?F_JOBS[Math.floor(r()*12)]:M_JOBS[Math.floor(r()*12)] },
    r
  );

  return {
    id: `person_${id}`,
    name: { ja: `${surname} ${firstName}`, en: `${firstName} ${surname}` },
    age, gender, mbti, attachmentStyle: attachment, job, area: area.name,
    appearance: {
      height: gender==='male' ? 165+Math.round(r()*20) : 150+Math.round(r()*18),
      build: ['slim','average','athletic','muscular'][Math.floor(r()*4)],
      style: ['casual','smart','street','minimal'][Math.floor(r()*4)],
    },
    lat: area.lat + (r()-0.5) * 0.005,
    lng: area.lng + (r()-0.5) * 0.005,
    position: { x: area.x + (r()-0.5)*40, z: area.z + (r()-0.5)*40 },
    currentPhase: phase,
    hoursUntilSex: Math.round(hoursLeft*10)/10,
    emotions, situation, score,
    bodyAngle: r() * Math.PI * 2,
    profile: generateProfile(mbti, age, gender, attachment, r),
  };
}

export function generateAllPeople(count = 300): AIPerson[] {
  return Array.from({ length: count }, (_, i) => generatePerson(i));
}

export function generateRelationships(people: AIPerson[]): Relationship[] {
  const males = people.filter(p => p.gender === 'male');
  const females = people.filter(p => p.gender === 'female');
  const pairs: Relationship[] = [];
  const usedM = new Set<string>();
  const usedF = new Set<string>();

  const candidates: { m: AIPerson; f: AIPerson; score: number }[] = [];
  for (const m of males) {
    for (const f of females) {
      candidates.push({ m, f, score: getMBTIChemistry(m.mbti, f.mbti).score });
    }
  }
  candidates.sort((a, b) => b.score - a.score);

  const r = srand(12345);
  for (const c of candidates) {
    if (usedM.has(c.m.id) || usedF.has(c.f.id)) continue;
    const stage = STAGES[Math.floor(r() * STAGES.length)];
    pairs.push({
      id: `rel_${pairs.length}`,
      personA: c.m.id, personB: c.f.id,
      stage, meetCount: stage==='初対面'?1:1+Math.floor(r()*15),
      howMet: HOW_METS[Math.floor(r()*HOW_METS.length)],
      chemistryScore: c.score,
    });
    usedM.add(c.m.id);
    usedF.add(c.f.id);
    if (pairs.length >= 150) break;
  }
  return pairs;
}
