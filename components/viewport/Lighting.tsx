'use client';

import { useGameStore } from '../../stores/gameStore';

export function Lighting() {
  const hour = useGameStore(s => s.currentHour);
  const isNight = hour >= 20 || hour <= 5;

  return (
    <>
      <ambientLight intensity={isNight ? 0.08 : 0.4} color={isNight ? '#0a0a20' : '#b0c0e0'} />
      <directionalLight position={[100, 200, 50]} intensity={isNight ? 0.03 : 0.6} color={isNight ? '#1a1a40' : '#ffffff'} />
      <fog attach="fog" args={['#050508', 200, 1000]} />
    </>
  );
}
