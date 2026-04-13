#!/usr/bin/env node
// Test: Generate 1 character portrait + variants using Nano Banana 2 (Vertex AI)
// Then generate 1 scene video with Veo 3.1 Fast
//
// Usage:
//   export GCP_PROJECT_ID=your-project-id
//   gcloud auth application-default login
//   node scripts/test-character.mjs
//
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { TEST_PAIR } from './character-anchors.mjs';
import { generateVideo, sleep } from './gemini-client.mjs';

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = 'us-central1';

if (!PROJECT_ID) {
  console.error('❌ GCP_PROJECT_ID not set');
  process.exit(1);
}

function getAccessToken() {
  return execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
}

// ─── Nano Banana 2 Image Generation (Gemini 3.1 Flash Image) ──────
async function generateNanoBanana(prompt, outputPath, referenceImagePath = null) {
  console.log(`🍌 Nano Banana 2: ${path.basename(outputPath)}`);

  const parts = [];

  // If we have a reference image, include it
  if (referenceImagePath && fs.existsSync(referenceImagePath)) {
    const imgBuf = fs.readFileSync(referenceImagePath);
    parts.push({
      inlineData: {
        mimeType: 'image/png',
        data: imgBuf.toString('base64'),
      },
    });
    parts.push({ text: `Using this reference image of the person, ${prompt}` });
  } else {
    parts.push({ text: prompt });
  }

  // Try multiple model names (Google naming is inconsistent)
  const modelCandidates = [
    'gemini-2.5-flash-preview-image-generation',
    'gemini-2.0-flash-exp',
  ];

  for (const modelId of modelCandidates) {
    try {
      const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${modelId}:generateContent`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
            maxOutputTokens: 8192,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(`  ⚠️ Model ${modelId}: ${response.status} - trying next...`);
        continue;
      }

      // Extract image from response
      const candidates = data.candidates;
      if (candidates && candidates[0]) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const buffer = Buffer.from(part.inlineData.data, 'base64');
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, buffer);
            console.log(`  ✅ Saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB) [${modelId}]`);
            return outputPath;
          }
        }
      }

      console.log(`  ⚠️ Model ${modelId}: No image in response`);
    } catch (err) {
      console.log(`  ⚠️ Model ${modelId}: ${err.message}`);
    }
  }

  // Fallback: Try Imagen 3
  console.log('  🔄 Falling back to Imagen 3...');
  return await generateImagen3(prompt, outputPath);
}

async function generateImagen3(prompt, outputPath) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/imagen-3.0-generate-002:predict`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '1:1',
          personGeneration: 'allow_adult',
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(`  ❌ Imagen 3 error: ${response.status}`);
      return null;
    }

    if (data.predictions && data.predictions[0]) {
      const buffer = Buffer.from(data.predictions[0].bytesBase64Encoded, 'base64');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      console.log(`  ✅ Saved (Imagen 3): ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return outputPath;
    }
  } catch (err) {
    console.error(`  ❌ Imagen 3 failed: ${err.message}`);
  }
  return null;
}

// ─── Main ──────────────────────────────────────────────────
async function main() {
  console.log('\n🧪 buildinpublic.jp — Character Identity Test');
  console.log('=============================================');
  console.log(`Project: ${PROJECT_ID}`);
  console.log('Character: 山口 紬 (INFJ ♀ 24, 臨床心理士)');
  console.log('=============================================\n');

  const OUT = path.resolve('public/characters/infj_f_24_001');
  fs.mkdirSync(OUT, { recursive: true });

  const her = TEST_PAIR.her;
  const results = { portraits: [], instagram: [], video: null };

  // ─── Phase 1: Master Portrait ───
  console.log('\n── Phase 1: Master Portrait ──');
  const masterPath = path.join(OUT, 'portrait-front.png');
  const master = await generateNanoBanana(her.portraitPrompt, masterPath);
  if (!master) {
    console.log('\n❌ Master portrait failed. Check GCP auth and project.');
    process.exit(1);
  }
  results.portraits.push(master);
  await sleep(3000);

  // ─── Phase 2: Three-Quarter Variant ───
  console.log('\n── Phase 2: Three-Quarter Angle ──');
  const tqPath = path.join(OUT, 'portrait-threequarter.png');
  const tq = await generateNanoBanana(
    her.variantPrompts.threeQuarter,
    tqPath,
    masterPath // Use master as reference
  );
  if (tq) results.portraits.push(tq);
  await sleep(3000);

  // ─── Phase 3: Instagram Variants ───
  console.log('\n── Phase 3: Instagram Variants ──');
  for (const [key, prompt] of Object.entries(her.variantPrompts)) {
    if (key === 'threeQuarter') continue;
    const igPath = path.join(OUT, `instagram-${key}.png`);
    const ig = await generateNanoBanana(prompt, igPath, masterPath);
    if (ig) results.instagram.push(ig);
    await sleep(3000);
  }

  // ─── Phase 4: Scene Video (optional) ───
  console.log('\n── Phase 4: Scene Video (bar-escalation) ──');
  const sceneImgPath = path.join(OUT, 'scene-bar-escalation.png');
  const sceneImg = await generateNanoBanana(
    TEST_PAIR.scenePrompt.image,
    sceneImgPath
  );

  if (sceneImg) {
    await sleep(3000);
    const vidPath = path.join(OUT, 'scene-bar-escalation.mp4');
    const vid = await generateVideo(sceneImgPath, TEST_PAIR.scenePrompt.motion, vidPath);
    if (vid) results.video = vid;
  }

  // ─── Summary ───
  console.log('\n=============================================');
  console.log('📊 Results:');
  console.log(`  Portraits: ${results.portraits.length}/2`);
  console.log(`  Instagram: ${results.instagram.length}/3`);
  console.log(`  Video: ${results.video ? '✅' : '❌'}`);
  console.log(`\n📁 Output: ${OUT}`);

  const files = fs.readdirSync(OUT);
  files.forEach(f => {
    const stat = fs.statSync(path.join(OUT, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(0)}KB)`);
  });

  console.log('\n💰 Estimated cost:');
  console.log(`  Images: ~${results.portraits.length + results.instagram.length + 1} × ¥12 = ~¥${(results.portraits.length + results.instagram.length + 1) * 12}`);
  console.log(`  Video: ${results.video ? '8s × ¥22 = ¥176' : 'N/A'}`);
  console.log('\n👀 Open the images and check:');
  console.log('  1. Does she look real? (pores, skin texture, asymmetry)');
  console.log('  2. Is the face CONSISTENT across portraits and instagram?');
  console.log('  3. Is the identity anchor preserved? (beauty mark, hair, cheekbones)');
  console.log('=============================================\n');
}

main().catch(err => {
  console.error('\n💀 Fatal:', err);
  process.exit(1);
});
