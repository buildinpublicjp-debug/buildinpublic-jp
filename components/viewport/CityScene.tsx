'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { AREAS } from '../../data/areas';

function srand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

// OPTIMIZED: Fewer buildings, no PointLights
export function CityScene() {
  const buildings = useMemo(() => {
    const data: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    AREAS.forEach((area, idx) => {
      const count = Math.min(area.weight * 3, 20); // REDUCED from weight*8
      const r = srand(idx * 997 + 42);
      for (let i = 0; i < count; i++) {
        const x = area.x + (r() - 0.5) * 50;
        const z = area.z + (r() - 0.5) * 50;
        const h = 3 + r() * 30;
        const w = 3 + r() * 5;
        data.push({ pos: [x, h / 2, z], scale: [w, h, w] });
      }
    });
    return data;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const tempObj = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    if (!meshRef.current) return;
    buildings.forEach((b, i) => {
      tempObj.position.set(...b.pos);
      tempObj.scale.set(...b.scale);
      tempObj.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObj.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [buildings, tempObj]);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial color="#08080f" />
      </mesh>

      {/* Grid */}
      <gridHelper args={[2000, 50, '#111118', '#0c0c12']} />

      {/* Buildings - single InstancedMesh, no lights */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, buildings.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#0e0e18" />
      </instancedMesh>

      {/* Street light markers - emissive only, NO PointLight */}
      {AREAS.map((area, i) => (
        <mesh key={i} position={[area.x, 3, area.z]}>
          <sphereGeometry args={[0.3, 6, 6]} />
          <meshBasicMaterial color="#ffaa40" />
        </mesh>
      ))}
    </group>
  );
}
