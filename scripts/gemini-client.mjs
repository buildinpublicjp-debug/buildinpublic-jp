// Gemini API client for image and video generation
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY not set. Add it to .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Generate a photorealistic image
export async function generateImage(prompt, outputPath) {
  console.log(`🎨 Generating image: ${path.basename(outputPath)}`);
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const result = await model.generateContent([
      { text: prompt },
      { text: 'Generate this as a photorealistic image.' },
    ]);
    
    const response = result.response;
    const candidates = response.candidates;
    
    if (candidates && candidates[0]) {
      const parts = candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, 'base64');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Image saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
          return outputPath;
        }
      }
    }
    
    console.log('⚠️ No image in response. Trying Imagen model...');
    return await generateImageImagen(prompt, outputPath);
  } catch (err) {
    console.error(`❌ Image generation failed: ${err.message}`);
    return null;
  }
}

// Fallback: Use Imagen model
async function generateImageImagen(prompt, outputPath) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: '16:9' },
        }),
      }
    );
    
    const data = await response.json();
    if (data.predictions && data.predictions[0]) {
      const imageData = data.predictions[0].bytesBase64Encoded;
      const buffer = Buffer.from(imageData, 'base64');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Image saved (Imagen): ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return outputPath;
    }
    
    console.error('❌ No image data in Imagen response');
    return null;
  } catch (err) {
    console.error(`❌ Imagen fallback failed: ${err.message}`);
    return null;
  }
}

// Generate video from image using Veo
export async function generateVideo(imagePath, motionPrompt, outputPath) {
  console.log(`🎬 Generating video: ${path.basename(outputPath)}`);
  
  try {
    // Read the image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const mimeType = 'image/png';
    
    // Use Veo 3.1 Lite for video generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-lite-generate-001:predictLongRunning?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instances: [{
            prompt: motionPrompt,
            image: {
              bytesBase64Encoded: imageBase64,
              mimeType,
            },
          }],
          parameters: {
            aspectRatio: '16:9',
            durationSeconds: 4,
            resolution: '720p',
          },
        }),
      }
    );
    
    const data = await response.json();
    
    // Poll for completion
    if (data.name) {
      console.log(`⏳ Video queued: ${data.name}`);
      return await pollVideoResult(data.name, outputPath);
    }
    
    // Direct result
    if (data.predictions && data.predictions[0]) {
      const videoData = data.predictions[0].bytesBase64Encoded;
      const buffer = Buffer.from(videoData, 'base64');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Video saved: ${outputPath}`);
      return outputPath;
    }
    
    console.error('❌ Unexpected video response:', JSON.stringify(data).slice(0, 200));
    return null;
  } catch (err) {
    console.error(`❌ Video generation failed: ${err.message}`);
    return null;
  }
}

async function pollVideoResult(operationName, outputPath, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 5000)); // Wait 5s between polls
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${API_KEY}`
      );
      const data = await response.json();
      
      if (data.done) {
        if (data.response && data.response.predictions) {
          const videoData = data.response.predictions[0].bytesBase64Encoded;
          const buffer = Buffer.from(videoData, 'base64');
          fs.mkdirSync(path.dirname(outputPath), { recursive: true });
          fs.writeFileSync(outputPath, buffer);
          console.log(`✅ Video saved: ${outputPath}`);
          return outputPath;
        }
        console.error('❌ Video completed but no data');
        return null;
      }
      
      process.stdout.write('.');
    } catch (err) {
      console.error(`⚠️ Poll error: ${err.message}`);
    }
  }
  
  console.error('❌ Video generation timed out (5 min)');
  return null;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
