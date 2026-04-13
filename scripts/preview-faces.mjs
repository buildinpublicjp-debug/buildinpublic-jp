#!/usr/bin/env node
// Preview face genomes for the test pair
// Usage: node scripts/preview-faces.mjs

import { generateFaceGenome, genomeToPortraitPrompt, printGenome } from '../engine/faceGenome.mjs';

console.log('\n🧬 buildinpublic.jp — Face Genome Preview');
console.log('==========================================\n');

// ── Character 1: 高橋 颯太 (ESTP ♂ 27) ──
const sota = generateFaceGenome(
  '東京都渋谷区',  // birthplace (grew up)
  'male',
  27,
  'explorer',       // MBTI group
  1001              // seed for variation
);
printGenome(sota, '高橋 颯太 (ESTP ♂ 27, 渋谷育ち)');

const sotaPrompt = genomeToPortraitPrompt(sota, {
  name: '高橋 颯太',
  age: 27,
  gender: 'male',
  job: 'フリーランスカメラマン',
  distinctiveFeatures: [
    'small scar on left eyebrow from childhood',
    'silver ring on right middle finger',
    'silver chain necklace',
  ],
  outfit: 'black oversized vintage band tee, slim dark jeans',
});

console.log('\n📝 Nano Banana Prompt (Sota):');
console.log('─'.repeat(50));
console.log(sotaPrompt);
console.log('─'.repeat(50));

// ── Character 2: 山口 紬 (INFJ ♀ 24) ──
const tsumugi = generateFaceGenome(
  '神奈川県鎌倉市', // birthplace
  'female',
  24,
  'diplomat',        // MBTI group
  2002               // seed
);
printGenome(tsumugi, '山口 紬 (INFJ ♀ 24, 鎌倉出身)');

const tsumugiPrompt = genomeToPortraitPrompt(tsumugi, {
  name: '山口 紬',
  age: 24,
  gender: 'female',
  job: '臨床心理士',
  distinctiveFeatures: [
    'faint beauty mark below right eye',
    'thin gold bracelet on left wrist',
    'long straight dark hair, middle-parted, falling just past shoulders',
  ],
  outfit: 'cream knit top with subtle texture, small leather crossbody bag',
});

console.log('\n📝 Nano Banana Prompt (Tsumugi):');
console.log('─'.repeat(50));
console.log(tsumugiPrompt);
console.log('─'.repeat(50));

// ── Contrast test: 沖縄出身キャラ ──
const okinawa = generateFaceGenome(
  '沖縄県那覇市',
  'female',
  22,
  'explorer',
  3003
);
printGenome(okinawa, '比嘉 七海 (ESFP ♀ 22, 那覇出身)');

const okinawaPrompt = genomeToPortraitPrompt(okinawa, {
  name: '比嘉 七海',
  age: 22,
  gender: 'female',
  job: 'ダンサー',
  distinctiveFeatures: [
    'two small ear piercings on left ear',
    'natural sun-kissed glow',
  ],
  outfit: 'white crop top, high-waisted wide pants, colorful beaded bracelet',
});

console.log('\n📝 Nano Banana Prompt (Nanami — Okinawa contrast):');
console.log('─'.repeat(50));
console.log(okinawaPrompt);
console.log('─'.repeat(50));

// ── Contrast test: 関西出身キャラ ──
const kansai = generateFaceGenome(
  '京都府京都市左京区',
  'male',
  29,
  'analyst',
  4004
);
printGenome(kansai, '斎藤 律 (INTJ ♂ 29, 京都出身)');

const kansaiPrompt = genomeToPortraitPrompt(kansai, {
  name: '斎藤 律',
  age: 29,
  gender: 'male',
  job: 'データサイエンティスト',
  distinctiveFeatures: [
    'rectangular thin-frame glasses',
    'precise neat appearance',
  ],
  outfit: 'navy crew-neck sweater over white collared shirt, clean minimal',
});

console.log('\n📝 Nano Banana Prompt (Ritsu — Kyoto contrast):');
console.log('─'.repeat(50));
console.log(kansaiPrompt);
console.log('─'.repeat(50));

console.log('\n✅ 4 face genomes generated.');
console.log('Compare: Okinawa (jomon ~0.72) vs Kyoto (jomon ~0.22)');
console.log('These two should look noticeably different.\n');
