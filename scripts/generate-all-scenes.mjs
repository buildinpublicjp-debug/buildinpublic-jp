#!/usr/bin/env node
// Auto-generate all scene images and videos
// Usage: GEMINI_API_KEY=xxx node scripts/generate-all-scenes.mjs
//   or: source .env.local && node scripts/generate-all-scenes.mjs

import { generateImage, generateVideo, sleep } from './gemini-client.mjs';
import { generateImagePrompt, generateMotionPrompt, getAllScenePhases } from './scene-prompts.mjs';
import path from 'path';
import fs from 'fs';

const SCENES_DIR = path.resolve('public/scenes');

async function main() {
  console.log('\n🚀 buildinpublic.jp — Scene Asset Generator');
  console.log('==========================================\n');
  
  fs.mkdirSync(SCENES_DIR, { recursive: true });
  
  const allCombos = getAllScenePhases();
  console.log(`📋 ${allCombos.length} scene-phase combinations to generate\n`);
  
  let successImages = 0;
  let successVideos = 0;
  let errors = 0;
  
  for (let i = 0; i < allCombos.length; i++) {
    const { scene, phase } = allCombos[i];
    const baseName = `${scene}-${phase}`;
    const imgPath = path.join(SCENES_DIR, `${baseName}.png`);
    const vidPath = path.join(SCENES_DIR, `${baseName}.mp4`);
    
    console.log(`\n[${ i + 1}/${allCombos.length}] ${scene} × ${phase}`);
    console.log('─'.repeat(40));
    
    // Skip if already exists
    if (fs.existsSync(imgPath) && fs.existsSync(vidPath)) {
      console.log('⏭️  Already exists, skipping');
      successImages++;
      successVideos++;
      continue;
    }
    
    // Generate image
    if (!fs.existsSync(imgPath)) {
      const imagePrompt = generateImagePrompt(scene, phase);
      const result = await generateImage(imagePrompt, imgPath);
      if (result) {
        successImages++;
      } else {
        errors++;
        continue; // Skip video if image failed
      }
      await sleep(3000); // Rate limit
    } else {
      console.log('📸 Image exists, skipping');
      successImages++;
    }
    
    // Generate video from image
    if (!fs.existsSync(vidPath)) {
      const motionPrompt = generateMotionPrompt(scene, phase);
      const result = await generateVideo(imgPath, motionPrompt, vidPath);
      if (result) {
        successVideos++;
      } else {
        errors++;
      }
      await sleep(5000); // Longer wait for video rate limit
    } else {
      console.log('🎬 Video exists, skipping');
      successVideos++;
    }
  }
  
  console.log('\n==========================================');
  console.log(`✅ Images: ${successImages}/${allCombos.length}`);
  console.log(`✅ Videos: ${successVideos}/${allCombos.length}`);
  console.log(`❌ Errors: ${errors}`);
  console.log('==========================================\n');
  
  // List generated files
  const files = fs.readdirSync(SCENES_DIR).filter(f => f.endsWith('.png') || f.endsWith('.mp4'));
  console.log(`📁 public/scenes/ (${files.length} files):`);
  files.forEach(f => {
    const stat = fs.statSync(path.join(SCENES_DIR, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(0)}KB)`);
  });
}

main().catch(err => {
  console.error('\n💀 Fatal error:', err);
  process.exit(1);
});
