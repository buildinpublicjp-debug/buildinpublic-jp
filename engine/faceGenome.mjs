// Face Genome System — quantitative facial parameters → AI prompt
// Based on Jomon-Yayoi anthropological spectrum + regional variation
//
// jomonRatio: 0.0 (full Yayoi) → 1.0 (full Jomon)
// Each facial feature interpolates between Yayoi and Jomon endpoints

// ─── Region → Jomon Ratio Base ───────────────────────────
export const REGION_JOMON = {
  '北海道':    { base: 0.65, label: 'Hokkaido (strong Ainu/Jomon influence)' },
  '東北':      { base: 0.48, label: 'Tohoku (moderate Jomon retention)' },
  '北関東':    { base: 0.38, label: 'North Kanto' },
  '南関東':    { base: 0.32, label: 'South Kanto (Tokyo metro, highly mixed)' },
  '中部':      { base: 0.35, label: 'Chubu' },
  '北陸':      { base: 0.30, label: 'Hokuriku' },
  '関西':      { base: 0.22, label: 'Kansai (strongest Yayoi influence)' },
  '中国':      { base: 0.28, label: 'Chugoku' },
  '四国':      { base: 0.33, label: 'Shikoku' },
  '北九州':    { base: 0.25, label: 'North Kyushu (Yayoi entry point)' },
  '南九州':    { base: 0.45, label: 'South Kyushu (Jomon pockets)' },
  '沖縄':      { base: 0.72, label: 'Okinawa (Ryukyuan, strongest Jomon)' },
};

// Map specific birthplaces to regions
export function birthplaceToRegion(birthplace) {
  const map = {
    '東京': '南関東', '神奈川': '南関東', '千葉': '南関東', '埼玉': '北関東',
    '茨城': '北関東', '群馬': '北関東', '栃木': '北関東',
    '大阪': '関西', '京都': '関西', '兵庫': '関西', '奈良': '関西', '滋賀': '関西',
    '愛知': '中部', '静岡': '中部', '長野': '中部', '岐阜': '中部', '新潟': '中部',
    '福岡': '北九州', '佐賀': '北九州', '大分': '北九州', '長崎': '北九州',
    '鹿児島': '南九州', '宮崎': '南九州', '熊本': '南九州',
    '沖縄': '沖縄', '北海道': '北海道', '札幌': '北海道',
    '宮城': '東北', '仙台': '東北', '青森': '東北', '岩手': '東北', '秋田': '東北', '山形': '東北', '福島': '東北',
    '広島': '中国', '岡山': '中国', '山口': '中国',
    '富山': '北陸', '石川': '北陸', '福井': '北陸',
    '香川': '四国', '徳島': '四国', '愛媛': '四国', '高知': '四国',
    '渋谷': '南関東', '新宿': '南関東', '吉祥寺': '南関東', '中目黒': '南関東',
    '鎌倉': '南関東', '横浜': '南関東', '藤沢': '南関東',
    'つくば': '北関東', '柏': '南関東', '船橋': '南関東', '川越': '北関東',
    '軽井沢': '中部', '松本': '中部',
    '太宰府': '北九州', '北谷': '沖縄', '那覇': '沖縄',
    '名古屋': '中部', '浜松': '中部', '堺': '関西', '神戸': '関西',
    '北九州': '北九州', '福岡': '北九州',
  };
  for (const [key, region] of Object.entries(map)) {
    if (birthplace.includes(key)) return region;
  }
  return '南関東'; // fallback: Tokyo area
}

// ─── Facial Feature Interpolation ────────────────────────
// Each feature has a Yayoi pole (j=0) and Jomon pole (j=1)
// with 3-5 discrete steps for prompt clarity

const FACE_SHAPE = [
  { max: 0.25, m: 'oblong face with flat profile', f: 'elongated oval face with smooth flat profile' },
  { max: 0.45, m: 'oval face with gentle contours', f: 'soft oval face with subtle bone structure' },
  { max: 0.65, m: 'balanced face with moderate depth', f: 'balanced oval face with visible cheekbones' },
  { max: 0.85, m: 'broad face with strong bone structure', f: 'heart-shaped face with defined structure' },
  { max: 1.01, m: 'wide rugged face with prominent brow ridge', f: 'wide face with strong defined features' },
];

const EYES = [
  { max: 0.20, m: 'narrow single-lid eyes with epicanthic fold', f: 'delicate single-lid eyes with soft epicanthic fold' },
  { max: 0.35, m: 'narrow eyes with subtle inner crease', f: 'almond eyes with soft partial crease' },
  { max: 0.50, m: 'medium almond eyes with natural double-lid', f: 'gentle almond eyes with natural double-lid' },
  { max: 0.70, m: 'defined double-lid eyes with visible crease', f: 'large expressive double-lid eyes with clear crease' },
  { max: 0.85, m: 'deep-set eyes with pronounced double-lid', f: 'large deep-set eyes with prominent double-lid' },
  { max: 1.01, m: 'very deep-set hooded eyes under strong brow ridge', f: 'very large deep-set eyes with wide double-lid' },
];

const NOSE = [
  { max: 0.25, m: 'low flat nose bridge with rounded tip', f: 'small low nose bridge with soft rounded tip' },
  { max: 0.45, m: 'medium-low nose bridge with soft contour', f: 'gentle nose with subtle bridge' },
  { max: 0.65, m: 'medium nose bridge with straight profile', f: 'defined nose bridge with delicate tip' },
  { max: 0.85, m: 'moderately high nose bridge with defined tip', f: 'high nose bridge with refined narrow tip' },
  { max: 1.01, m: 'prominent high nose bridge with strong profile', f: 'very defined high nose bridge' },
];

const LIPS = [
  { max: 0.30, m: 'thin refined lips', f: 'thin delicate lips' },
  { max: 0.55, m: 'medium natural lips', f: 'soft natural lips with gentle cupid\'s bow' },
  { max: 0.80, m: 'medium-full lips', f: 'full soft lips' },
  { max: 1.01, m: 'full prominent lips', f: 'full plush lips' },
];

const BROWS = [
  { max: 0.30, m: 'thin straight brows', f: 'thin soft arched brows' },
  { max: 0.55, m: 'natural medium brows', f: 'natural feminine brows with soft arch' },
  { max: 0.80, m: 'thick defined brows', f: 'full defined brows with natural shape' },
  { max: 1.01, m: 'very thick bold brows', f: 'thick prominent brows' },
];

const SKIN_TONE = [
  { max: 0.25, f: 'fair porcelain skin', m: 'fair light skin' },
  { max: 0.45, f: 'light ivory skin', m: 'light warm ivory skin' },
  { max: 0.65, f: 'warm natural skin', m: 'warm natural skin tone' },
  { max: 0.85, f: 'warm honey skin', m: 'warm tan skin' },
  { max: 1.01, f: 'warm olive-brown skin', m: 'warm olive-brown skin' },
];

const HAIR_TEXTURE = [
  { max: 0.35, desc: 'pin-straight black hair' },
  { max: 0.55, desc: 'straight dark brown-black hair' },
  { max: 0.75, desc: 'dark hair with slight natural wave' },
  { max: 1.01, desc: 'dark hair with visible natural wave and body' },
];

const JAW = [
  { max: 0.30, m: 'narrow tapered jaw', f: 'slim V-line jaw' },
  { max: 0.55, m: 'medium jaw with soft angle', f: 'gentle tapered jaw' },
  { max: 0.80, m: 'strong angular jaw', f: 'defined jaw with subtle angle' },
  { max: 1.01, m: 'broad prominent jaw with wide angle', f: 'strong defined jawline' },
];

const FACIAL_HAIR_POTENTIAL = [
  { max: 0.35, desc: 'clean-shaven, minimal facial hair capability' },
  { max: 0.55, desc: 'light stubble capable' },
  { max: 0.75, desc: 'visible stubble, moderate growth' },
  { max: 1.01, desc: 'heavy stubble to short beard capable' },
];

function pick(table, ratio, gender) {
  for (const row of table) {
    if (ratio <= row.max) {
      if (gender === 'male' && row.m) return row.m;
      if (gender === 'female' && row.f) return row.f;
      return row.desc || row.m || row.f;
    }
  }
  return table[table.length - 1].desc || '';
}

// ─── MBTI Expression Layer ──────────────────────────────
const MBTI_EXPRESSION = {
  analyst: {
    male: 'analytical focused gaze, slight tension between brows, composed closed mouth',
    female: 'intelligent observing eyes, subtle concentration in brow, controlled expression',
  },
  diplomat: {
    male: 'warm empathetic eyes, relaxed gentle brow, slightly soft mouth',
    female: 'deeply warm gentle eyes, soft open brow arch, lips slightly parted in thought',
  },
  sentinel: {
    male: 'steady reliable gaze, level composed brows, firm neutral mouth',
    female: 'calm steady eyes, neat composed brows, confident gentle smile line',
  },
  explorer: {
    male: 'bright alert eyes with spark, relaxed brow, subtle confident half-smirk',
    female: 'lively curious eyes, naturally relaxed brow, playful slight smile',
  },
};

// ─── Age Modifiers ──────────────────────────────────────
function ageModifier(age, gender) {
  if (age < 22) return gender === 'female'
    ? 'youthful soft features, smooth skin, rounded face'
    : 'youthful features, smooth jawline, minimal lines';
  if (age < 26) return gender === 'female'
    ? 'young adult, subtle maturity in bone structure'
    : 'young adult, jaw definition emerging';
  if (age < 30) return gender === 'female'
    ? 'late twenties, refined facial structure'
    : 'late twenties, mature jaw and brow definition';
  return gender === 'female'
    ? 'early thirties, elegant mature features'
    : 'early thirties, fully developed facial structure, subtle expression lines';
}

// ─── Main: Generate Face Genome ─────────────────────────
export function generateFaceGenome(birthplace, gender, age, mbtiGroup, seed) {
  const region = birthplaceToRegion(birthplace);
  const regionData = REGION_JOMON[region] || REGION_JOMON['南関東'];

  // Seeded random variation ±0.12
  const srand = (s) => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const variation = (srand(seed * 7919 + 31) - 0.5) * 0.24;
  const jomon = Math.max(0.05, Math.min(0.95, regionData.base + variation));

  const genome = {
    region,
    regionLabel: regionData.label,
    jomonRatio: Math.round(jomon * 100) / 100,
    faceShape: pick(FACE_SHAPE, jomon, gender),
    eyes: pick(EYES, jomon, gender),
    nose: pick(NOSE, jomon, gender),
    lips: pick(LIPS, jomon, gender),
    brows: pick(BROWS, jomon, gender),
    jaw: pick(JAW, jomon, gender),
    skinTone: pick(SKIN_TONE, jomon, gender),
    hairTexture: pick(HAIR_TEXTURE, jomon, gender),
    facialHair: gender === 'male' ? pick(FACIAL_HAIR_POTENTIAL, jomon, gender) : null,
    expression: MBTI_EXPRESSION[mbtiGroup]?.[gender] || '',
    ageMod: ageModifier(age, gender),
  };

  return genome;
}

// ─── Generate Nano Banana Portrait Prompt ────────────────
export function genomeToPortraitPrompt(genome, {
  name, age, gender, job, distinctiveFeatures = [], outfit = '', cameraNote = ''
} = {}) {
  const genderWord = gender === 'male' ? 'man' : 'woman';
  const genderAdj = gender === 'male' ? 'masculine' : 'feminine';

  const features = [
    `Japanese ${genderWord}, ${age} years old`,
    genome.faceShape,
    genome.jaw,
    genome.eyes,
    genome.nose,
    genome.lips,
    genome.brows,
    genome.skinTone,
    genome.hairTexture,
    genome.ageMod,
    genome.facialHair,
    genome.expression,
    ...distinctiveFeatures,
  ].filter(Boolean);

  const prompt = `Photorealistic portrait photograph.

${features.join('. ')}.

${outfit ? `Wearing: ${outfit}.` : ''}
${cameraNote || 'Shot on Sony A7III, 85mm f/1.8 lens. Soft natural window light from the left. Shallow depth of field. Neutral warm-gray background.'}

The face must feel genuinely real — visible pores, natural skin texture and imperfections, slight facial asymmetry, individual micro-expressions. NOT a perfect AI face. This person should look like someone you could pass on a Tokyo street.

No text, no UI, no watermark, no logo. No heavy makeup or filters.`;

  return prompt.trim();
}

// ─── Preview: Print genome summary ──────────────────────
export function printGenome(genome, name) {
  console.log(`\n┌─ Face Genome: ${name}`);
  console.log(`│ Region: ${genome.region} (${genome.regionLabel})`);
  console.log(`│ Jomon Ratio: ${genome.jomonRatio} (${genome.jomonRatio > 0.5 ? 'Jomon-leaning' : genome.jomonRatio < 0.35 ? 'Yayoi-leaning' : 'Mixed'})`);
  console.log(`│`);
  console.log(`│ Face:  ${genome.faceShape}`);
  console.log(`│ Jaw:   ${genome.jaw}`);
  console.log(`│ Eyes:  ${genome.eyes}`);
  console.log(`│ Nose:  ${genome.nose}`);
  console.log(`│ Lips:  ${genome.lips}`);
  console.log(`│ Brows: ${genome.brows}`);
  console.log(`│ Skin:  ${genome.skinTone}`);
  console.log(`│ Hair:  ${genome.hairTexture}`);
  if (genome.facialHair) console.log(`│ Facial hair: ${genome.facialHair}`);
  console.log(`│ Expression: ${genome.expression}`);
  console.log(`│ Age mod: ${genome.ageMod}`);
  console.log(`└──────────────────────────────────`);
}
