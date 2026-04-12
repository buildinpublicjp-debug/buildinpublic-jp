'use client';

import { useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { usePeopleStore } from '../stores/peopleStore';
import { useGameStore } from '../stores/gameStore';
import { CityScene } from '../components/viewport/CityScene';
import { CameraController } from '../components/viewport/CameraController';
import { People } from '../components/viewport/People';
import { Lighting } from '../components/viewport/Lighting';
import { Effects } from '../components/viewport/Effects';
import { TopBar } from '../components/hud/TopBar';
import { CameraModeSwitch } from '../components/hud/CameraModeSwitch';
import { PersonCardSwiper } from '../components/hud/PersonCardSwiper';
import { ProfilePanel } from '../components/profile/ProfilePanel';
import { SwitchOverlay } from '../components/switch/SwitchOverlay';

export default function Home() {
  const initialize = usePeopleStore(s => s.initialize);
  const initialized = usePeopleStore(s => s.initialized);
  const activePanel = useGameStore(s => s.activePanel);
  const switchPhase = useGameStore(s => s.switchPhase);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#ff0a28] text-sm tracking-[6px] mb-2">BUILDINPUBLIC.JP</div>
          <div className="text-white/30 text-xs tracking-[3px] animate-pulse">GENERATING 300 LIVES...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050508] overflow-hidden">
      {/* 3D Viewport */}
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        camera={{ fov: 60, near: 0.1, far: 2000 }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Suspense fallback={null}>
          <CameraController />
          <Lighting />
          <CityScene />
          <People />
          <Effects />
        </Suspense>
      </Canvas>

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <TopBar />
        <CameraModeSwitch />
        <PersonCardSwiper />
      </div>

      {/* Profile Panel */}
      {activePanel === 'profile' && <ProfilePanel />}

      {/* GTA Switch Overlay */}
      {switchPhase && <SwitchOverlay />}
    </div>
  );
}
