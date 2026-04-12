'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';

export function Lighting() {
  const hour = useGameStore(s => s.currentHour);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const dirRef = useRef<THREE.DirectionalLight>(null!);

  useFrame(() => {
    if (!ambientRef.current || !dirRef.current) return;

    // Time-based lighting
    const isNight = hour >= 20 || hour <= 5;
    const isDusk = hour >= 17 && hour < 20;
    const isDawn = hour >= 5 && hour < 8;

    if (isNight) {
      ambientRef.current.intensity = 0.05;
      ambientRef.current.color.set('#0a0a20');
      dirRef.current.intensity = 0.02;
      dirRef.current.color.set('#1a1a40');
    } else if (isDusk) {
      ambientRef.current.intensity = 0.15;
      ambientRef.current.color.set('#2a1520');
      dirRef.current.intensity = 0.3;
      dirRef.current.color.set('#ff6030');
    } else if (isDawn) {
      ambientRef.current.intensity = 0.12;
      ambientRef.current.color.set('#1a1525');
      dirRef.current.intensity = 0.2;
      dirRef.current.color.set('#ffaa60');
    } else {
      ambientRef.current.intensity = 0.4;
      ambientRef.current.color.set('#b0c0e0');
      dirRef.current.intensity = 0.8;
      dirRef.current.color.set('#ffffff');
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.05} color="#0a0a20" />
      <directionalLight ref={dirRef} position={[100, 200, 50]} intensity={0.02} color="#1a1a40" />
      {/* Hemisphere for sky color */}
      <hemisphereLight args={['#0a0a20', '#050510', 0.1]} />
      {/* Fog for depth */}
      <fog attach="fog" args={['#050508', 100, 800]} />
    </>
  );
}
