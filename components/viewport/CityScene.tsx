'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AREAS } from '../../data/areas';

// Seeded random for consistent building placement
function srand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

interface BuildingData {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
}

function generateBuildings(): BuildingData[] {
  const buildings: BuildingData[] = [];

  AREAS.forEach((area, areaIdx) => {
    const count = area.weight * 8;
    const r = srand(areaIdx * 997 + 42);

    for (let i = 0; i < count; i++) {
      const x = area.x + (r() - 0.5) * 60;
      const z = area.z + (r() - 0.5) * 60;
      const height = 3 + r() * 35;
      const width = 2 + r() * 6;
      const depth = 2 + r() * 6;

      // Vary building colors slightly
      const brightness = 8 + Math.floor(r() * 12);
      const color = `rgb(${brightness}, ${brightness - 2}, ${brightness + 5})`;

      buildings.push({
        position: [x, height / 2, z],
        scale: [width, height, depth],
        color,
      });
    }
  });

  return buildings;
}

function generateStreetLights(): [number, number, number][] {
  const lights: [number, number, number][] = [];
  AREAS.forEach((area, idx) => {
    const r = srand(idx * 333);
    for (let i = 0; i < 6; i++) {
      lights.push([
        area.x + (r() - 0.5) * 40,
        4,
        area.z + (r() - 0.5) * 40,
      ]);
    }
  });
  return lights;
}

export function CityScene() {
  const buildings = useMemo(() => generateBuildings(), []);
  const streetLights = useMemo(() => generateStreetLights(), []);

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={false}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#0a0a12" />
      </mesh>

      {/* Grid lines on ground */}
      <gridHelper args={[2000, 100, '#111118', '#0d0d14']} position={[0, 0, 0]} />

      {/* Buildings - InstancedMesh for performance */}
      <BuildingInstances buildings={buildings} />

      {/* Street lights - warm glow */}
      {streetLights.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Light pole */}
          <mesh position={[0, -2, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 4, 6]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Light glow */}
          <pointLight color="#ffb050" intensity={3} distance={15} decay={2} />
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshStandardMaterial color="#ffcc80" emissive="#ffaa40" emissiveIntensity={2} />
          </mesh>
        </group>
      ))}

      {/* Area name labels (floating text would go here - using simple markers for now) */}
      {AREAS.map((area, i) => (
        <mesh key={i} position={[area.x, 0.5, area.z]}>
          <ringGeometry args={[8, 10, 32]} />
          <meshBasicMaterial color="#ffffff" opacity={0.02} transparent side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Instanced buildings for performance (single draw call)
function BuildingInstances({ buildings }: { buildings: BuildingData[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  useMemo(() => {
    if (!meshRef.current) return;
    buildings.forEach((b, i) => {
      tempObject.position.set(...b.position);
      tempObject.scale.set(...b.scale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, tempColor.set(b.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [buildings, tempObject, tempColor]);

  // Window lights flickering
  useFrame(({ clock }) => {
    // Subtle building color variation over time (simulates window lights)
    const t = clock.getElapsedTime();
    if (Math.floor(t * 2) % 10 === 0 && meshRef.current) {
      const idx = Math.floor(Math.random() * buildings.length);
      const brightness = 8 + Math.random() * 15;
      meshRef.current.setColorAt(idx, tempColor.set(`rgb(${brightness}, ${brightness - 2}, ${brightness + 5})`));
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.9} metalness={0.1} />
    </instancedMesh>
  );
}
