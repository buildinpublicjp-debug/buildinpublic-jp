// Audio engine — BGM + ambient sound layers using Web Audio API
// No external dependencies (package.json is frozen)

import type { TimeOfDay } from './timeSync';
import type { District } from '../data/areas';

export type SoundLayer = 'bgm' | 'ambient' | 'sfx';

interface AudioState {
  context: AudioContext | null;
  masterGain: GainNode | null;
  layers: Map<SoundLayer, { gain: GainNode; sources: AudioBufferSourceNode[] }>;
  muted: boolean;
  volume: number;
}

const state: AudioState = {
  context: null,
  masterGain: null,
  layers: new Map(),
  muted: false,
  volume: 0.3,
};

// Initialize audio context (must be called from user gesture)
export function initAudio(): AudioContext {
  if (state.context) return state.context;

  const ctx = new AudioContext();
  state.context = ctx;
  state.masterGain = ctx.createGain();
  state.masterGain.gain.value = state.volume;
  state.masterGain.connect(ctx.destination);

  // Create layer gain nodes
  for (const layer of ['bgm', 'ambient', 'sfx'] as SoundLayer[]) {
    const gain = ctx.createGain();
    gain.connect(state.masterGain);
    state.layers.set(layer, { gain, sources: [] });
  }

  return ctx;
}

// Generate ambient tone using oscillators (no audio files needed)
export function playAmbientTone(timeOfDay: TimeOfDay): () => void {
  const ctx = state.context;
  if (!ctx || !state.masterGain) return () => {};

  const layer = state.layers.get('ambient');
  if (!layer) return () => {};

  // Stop existing ambient
  stopLayer('ambient');

  // Time-of-day dependent ambient parameters
  const params = AMBIENT_PARAMS[timeOfDay];

  // Create layered drones
  const oscillators: OscillatorNode[] = [];

  for (const osc of params.oscillators) {
    const oscillator = ctx.createOscillator();
    const oscGain = ctx.createGain();

    oscillator.type = osc.type;
    oscillator.frequency.value = osc.freq;
    oscGain.gain.value = osc.volume;

    oscillator.connect(oscGain);
    oscGain.connect(layer.gain);
    oscillator.start();

    // Slow frequency drift for organic feel
    oscillator.frequency.setValueAtTime(osc.freq, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(osc.freq * 1.002, ctx.currentTime + 8);
    oscillator.frequency.linearRampToValueAtTime(osc.freq * 0.998, ctx.currentTime + 16);
    oscillator.frequency.linearRampToValueAtTime(osc.freq, ctx.currentTime + 24);

    oscillators.push(oscillator);
  }

  // Set ambient layer volume
  layer.gain.gain.setValueAtTime(0, ctx.currentTime);
  layer.gain.gain.linearRampToValueAtTime(params.layerVolume, ctx.currentTime + 2);

  return () => {
    const now = ctx.currentTime;
    layer.gain.gain.linearRampToValueAtTime(0, now + 1);
    setTimeout(() => {
      oscillators.forEach(o => { try { o.stop(); } catch {} });
    }, 1500);
  };
}

// District-specific ambient variation
export function getDistrictAmbientFreqs(district: District): number[] {
  switch (district) {
    case 'shibuya':  return [110, 220, 330]; // warm, busy
    case 'shinjuku': return [130, 196, 392]; // neon, edgy
    case 'roppongi': return [98, 196, 294];  // deep, sophisticated
  }
}

// Play a phase-change notification sound
export function playPhaseChime(phase: string): void {
  const ctx = state.context;
  if (!ctx || !state.masterGain) return;

  const layer = state.layers.get('sfx');
  if (!layer) return;

  const freqs: Record<string, number[]> = {
    seed: [440, 550],
    approach: [550, 660],
    escalation: [660, 880],
    critical: [880, 1100],
    imminent: [1100, 1320, 1650],
  };

  const notes = freqs[phase] ?? [440];
  let time = ctx.currentTime;

  for (const freq of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);

    osc.connect(gain);
    gain.connect(layer.gain);
    osc.start(time);
    osc.stop(time + 0.6);

    time += 0.15;
  }
}

export function stopLayer(layer: SoundLayer): void {
  const l = state.layers.get(layer);
  if (!l) return;
  l.sources.forEach(s => { try { s.stop(); } catch {} });
  l.sources = [];
}

export function setVolume(vol: number): void {
  state.volume = Math.max(0, Math.min(1, vol));
  if (state.masterGain && state.context) {
    state.masterGain.gain.linearRampToValueAtTime(
      state.muted ? 0 : state.volume,
      state.context.currentTime + 0.1
    );
  }
}

export function toggleMute(): boolean {
  state.muted = !state.muted;
  if (state.masterGain && state.context) {
    state.masterGain.gain.linearRampToValueAtTime(
      state.muted ? 0 : state.volume,
      state.context.currentTime + 0.3
    );
  }
  return state.muted;
}

export function isMuted(): boolean {
  return state.muted;
}

// Ambient parameters per time of day
interface AmbientParams {
  layerVolume: number;
  oscillators: { type: OscillatorType; freq: number; volume: number }[];
}

const AMBIENT_PARAMS: Record<TimeOfDay, AmbientParams> = {
  night: {
    layerVolume: 0.15,
    oscillators: [
      { type: 'sine', freq: 55, volume: 0.04 },
      { type: 'sine', freq: 82.5, volume: 0.02 },
      { type: 'triangle', freq: 165, volume: 0.01 },
    ],
  },
  dawn: {
    layerVolume: 0.12,
    oscillators: [
      { type: 'sine', freq: 110, volume: 0.03 },
      { type: 'sine', freq: 165, volume: 0.02 },
      { type: 'triangle', freq: 330, volume: 0.008 },
    ],
  },
  morning: {
    layerVolume: 0.1,
    oscillators: [
      { type: 'sine', freq: 220, volume: 0.02 },
      { type: 'triangle', freq: 440, volume: 0.01 },
    ],
  },
  afternoon: {
    layerVolume: 0.08,
    oscillators: [
      { type: 'sine', freq: 196, volume: 0.02 },
      { type: 'sine', freq: 294, volume: 0.015 },
    ],
  },
  dusk: {
    layerVolume: 0.14,
    oscillators: [
      { type: 'sine', freq: 98, volume: 0.035 },
      { type: 'sine', freq: 147, volume: 0.02 },
      { type: 'triangle', freq: 220, volume: 0.012 },
    ],
  },
  evening: {
    layerVolume: 0.16,
    oscillators: [
      { type: 'sine', freq: 73.4, volume: 0.04 },
      { type: 'sine', freq: 110, volume: 0.025 },
      { type: 'triangle', freq: 220, volume: 0.012 },
    ],
  },
};
