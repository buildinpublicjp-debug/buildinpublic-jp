#!/usr/bin/env node
// Quick test: Vertex AI connectivity + single image + single video
// Usage: GCP_PROJECT_ID=xxx node scripts/test-vertex.mjs

import { generateImage, generateVideo, sleep } from './gemini-client.mjs';
import path from 'path';
import fs from 'fs';

const TEST_DIR = path.resolve('public/scenes/test');
fs.mkdirSync(TEST_DIR, { recursive: true });

async function main() {
  console.log('\n🧪 Vertex AI Connection Test');
  console.log('================================\n');
  console.log(`Project: ${process.env.GCP_PROJECT_ID}`);
  console.log(`Video Model: Veo 3.1 Fast ($0.15/sec)`);
  console.log(`Image Model: Imagen 3\n`);

  // Step 1: Test image generation
  console.log('--- Step 1: Image Generation ---');
  const imgPath = path.join(TEST_DIR, 'test-bar-escalation.png');

  const imagePrompt = `Cinematic photograph, photorealistic. Shot on Sony A7III with 35mm f/1.4 lens. Shallow depth of field with natural bokeh. Film grain texture. Color grading: warm amber highlights, teal shadows.

A tiny 6-seat Tokyo bar in a Roppongi backstreet, dark walnut counter, 3 shelves of whiskey bottles with warm amber LED backlight, single brass pendant light above.

Two Japanese people. Distance: 30cm, bodies angled toward each other.
Him (27): Leaning in, confident mask cracking. Neck flushed.
Her (24): Calm, knowing eyes. Faint smile.

Through window: blurred Tokyo neon as bokeh circles. Cool blue-cyan night.

Do NOT include text, UI, labels, or speech bubbles.`;

  const imgResult = await generateImage(imagePrompt, imgPath);

  if (!imgResult) {
    console.log('\n❌ Image generation failed. Check auth and project ID.');
    console.log('   gcloud auth application-default login');
    console.log('   gcloud config set project YOUR_PROJECT_ID');
    process.exit(1);
  }

  // Step 2: Test video generation
  console.log('\n--- Step 2: Video Generation ---');
  const vidPath = path.join(TEST_DIR, 'test-bar-escalation.mp4');

  const motionPrompt = `Slow, intimate, almost still. Minimal movement. Camera: completely static, locked tripod. Cross-section view.

His fingers 2cm from her wrist. Smoke rising from ashtray. Pendant light flickers.

Ambient: warm light flickers gently. Background bokeh shifts slightly. Subtle breathing visible on both.

8 seconds, seamless. Photorealistic. Film grain.`;

  const vidResult = await generateVideo(imgPath, motionPrompt, vidPath);

  if (!vidResult) {
    console.log('\n⚠️ Video generation failed or timed out.');
    console.log('   Image was generated OK — video API may need different permissions.');
    process.exit(1);
  }

  console.log('\n================================');
  console.log('✅ Both image and video generated!');
  console.log(`   Image: ${imgPath}`);
  console.log(`   Video: ${vidPath}`);
  console.log('\n💰 Estimated cost: ~¥176 (8 sec × $0.15/sec)');
  console.log('   Credit remaining: ~¥47,790 / ¥47,966');
  console.log('\nReady to run: GCP_PROJECT_ID=xxx node scripts/generate-all-scenes.mjs');
}

main().catch(err => {
  console.error('\n💀 Fatal:', err);
  process.exit(1);
});
