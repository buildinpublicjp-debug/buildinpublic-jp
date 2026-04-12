'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePeopleStore, CoupleData } from '../stores/peopleStore';
import { useGameStore } from '../stores/gameStore';
import { CROSS_SECTION_SLOTS } from '../data/areas';
import { startTimeSync, getTimeOfDay } from '../lib/timeSync';
import { EMOTION_META, EMOTION_KEYS, type EmotionState } from '../engine/emotions';
import { PHASE_META, type Phase, scoreToColor } from '../engine/scoring';
import { MBTI_PROFILES, type MBTIType, getMBTIChemistry } from '../engine/mbti';
import { Minimap } from '../components/hud/Minimap';
import { initAudio, playAmbientTone, toggleMute, isMuted } from '../lib/audio';

// Scene image per room type — photorealistic PNG from Gemini
const SCENE_MAP: Record<string, string> = {
  bar: '/scenes/bar.png',
  hotel: '/scenes/hotel.png',
  restaurant: '/scenes/izakaya.png',
  karaoke: '/scenes/izakaya.png',
  apartment: '/scenes/hotel.png',
};
