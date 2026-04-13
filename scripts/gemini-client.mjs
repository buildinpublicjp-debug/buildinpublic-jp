// Vertex AI client for image and video generation
// Uses GCP credits (¥47,966 available, expires 2026/7/12)
// Auth: gcloud auth application-default login
//
// Models:
//   Image: Imagen 3 (imagen-3.0-generate-002)
//   Video: Veo 3.1 Fast (veo-3.1-fast-generate-001) — $0.15/sec
//
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ─── Config ───────────────────────────────────────────────
const PROJECT_ID = process.env.GCP_PROJECT_ID;
const LOCATION = 'us-central1';
const BASE_URL = `https://${LOCATION}-aiplatform.googleapis.com/v1`;
const PUBLISHER = `projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google`;

const IMAGE_MODEL = 'imagen-3.0-generate-002';
const VIDEO_MODEL = 'veo-3.1-fast-generate-001'; // $0.15/sec (Fast)
// const VIDEO_MODEL = 'veo-3.1-generate-001'; // $0.40/sec (Standard)

if (!PROJECT_ID) {
  console.error('❌ GCP_PROJECT_ID not set.');
  console.error('   export GCP_PROJECT_ID=your-project-id');
  console.error('   gcloud auth application-default login');
  process.exit(1);
}

// ─── Auth ─────────────────────────────────────────────────
function getAccessToken() {
  try {
    return execSync('gcloud auth print-access-token', { encoding: 'utf-8' }).trim();
  } catch (err) {
    console.error('❌ Failed to get access token. Run: gcloud auth application-default login');
    process.exit(1);
  }
}

function authHeaders() {
  return {
    'Authorization': `Bearer ${getAccessToken()}`,
    'Content-Type': 'application/json',
  };
}

// ─── Image Generation (Imagen 3) ─────────────────────────
export async function generateImage(prompt, outputPath) {
  console.log(`🎨 Generating image: ${path.basename(outputPath)}`);

  try {
    const url = `${BASE_URL}/${PUBLISHER}/models/${IMAGE_MODEL}:predict`;

    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: '16:9',
          personGeneration: 'allow_adult',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Image API error ${response.status}:`, JSON.stringify(data).slice(0, 300));
      return null;
    }

    if (data.predictions && data.predictions[0]) {
      const imageData = data.predictions[0].bytesBase64Encoded;
      const buffer = Buffer.from(imageData, 'base64');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, buffer);
      console.log(`✅ Image saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
      return outputPath;
    }

    console.error('❌ No image data in response:', JSON.stringify(data).slice(0, 200));
    return null;
  } catch (err) {
    console.error(`❌ Image generation failed: ${err.message}`);
    return null;
  }
}

// ─── Video Generation (Veo 3.1 Fast) ─────────────────────
export async function generateVideo(imagePath, motionPrompt, outputPath) {
  console.log(`🎬 Generating video: ${path.basename(outputPath)}`);

  try {
    // Read and encode the source image
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBase64 = imageBuffer.toString('base64');
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';

    const url = `${BASE_URL}/${PUBLISHER}/models/${VIDEO_MODEL}:predictLongRunning`;

    const response = await fetch(url, {
      method: 'POST',
      headers: authHeaders(),
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
          durationSeconds: 8,
          sampleCount: 1,
          personGeneration: 'allow_adult',
          generateAudio: false,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Video API error ${response.status}:`, JSON.stringify(data).slice(0, 300));
      return null;
    }

    // Long-running operation — poll for result
    if (data.name) {
      console.log(`⏳ Video operation started: ${data.name}`);
      return await pollOperation(data.name, outputPath);
    }

    // Direct response (unlikely for video but handle it)
    if (data.predictions && data.predictions[0]) {
      return saveVideoFromPrediction(data.predictions[0], outputPath);
    }

    console.error('❌ Unexpected response:', JSON.stringify(data).slice(0, 300));
    return null;
  } catch (err) {
    console.error(`❌ Video generation failed: ${err.message}`);
    return null;
  }
}

// ─── Poll Long-Running Operation ─────────────────────────
async function pollOperation(operationName, outputPath, maxAttempts = 90) {
  // operationName format: projects/.../locations/.../publishers/.../models/.../operations/UUID
  const pollUrl = `${BASE_URL}/${operationName}`;

  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);

    try {
      const response = await fetch(pollUrl, {
        headers: authHeaders(),
      });
      const data = await response.json();

      if (data.done) {
        if (data.error) {
          console.error(`❌ Video generation failed:`, data.error.message || JSON.stringify(data.error));
          return null;
        }

        // Extract video from response
        const result = data.response || data;
        if (result.predictions && result.predictions[0]) {
          return saveVideoFromPrediction(result.predictions[0], outputPath);
        }

        // Check for generateVideoResponse format
        if (result.generateVideoResponse?.generatedSamples) {
          const sample = result.generateVideoResponse.generatedSamples[0];
          if (sample.video?.bytesBase64Encoded) {
            const buffer = Buffer.from(sample.video.bytesBase64Encoded, 'base64');
            fs.mkdirSync(path.dirname(outputPath), { recursive: true });
            fs.writeFileSync(outputPath, buffer);
            console.log(`✅ Video saved: ${outputPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
            return outputPath;
          }
          // GCS URI output
          if (sample.video?.uri) {
            console.log(`✅ Video available at GCS: ${sample.video.uri}`);
            console.log(`   Run: gsutil cp ${sample.video.uri} ${outputPath}`);
            return sample.video.uri;
          }
        }

        console.error('❌ Video completed but no extractable data:', JSON.stringify(data).slice(0, 500));
        return null;
      }

      // Still processing
      const elapsed = ((i + 1) * 5);
      process.stdout.write(`\r⏳ Waiting... ${elapsed}s`);
    } catch (err) {
      console.error(`\n⚠️ Poll error (attempt ${i + 1}): ${err.message}`);
    }
  }

  console.error('\n❌ Video generation timed out (7.5 min)');
  return null;
}

// ─── Save Video Helper ───────────────────────────────────
function saveVideoFromPrediction(prediction, outputPath) {
  const videoData = prediction.bytesBase64Encoded;
  if (!videoData) {
    // Check if GCS URI
    if (prediction.gcsUri) {
      console.log(`✅ Video at GCS: ${prediction.gcsUri}`);
      console.log(`   Run: gsutil cp ${prediction.gcsUri} ${outputPath}`);
      return prediction.gcsUri;
    }
    console.error('❌ No video data in prediction');
    return null;
  }

  const buffer = Buffer.from(videoData, 'base64');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buffer);
  console.log(`\n✅ Video saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`);
  return outputPath;
}

// ─── Utility ─────────────────────────────────────────────
export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
