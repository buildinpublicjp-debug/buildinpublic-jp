'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore } from '../../stores/gameStore';
import { PHASE_META, Phase } from '../../engine/scoring';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

function phaseToColor(phase: Phase): string {
  return PHASE_META[phase].color;
}

export function People() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const glowRef = useRef<THREE.InstancedMesh>(null!);
  const people = usePeopleStore(s => s.people);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const selectPerson = useGameStore(s => s.selectPerson);
  const { raycaster, camera, pointer } = useThree();

  // Update positions every frame
  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return;
    const time = clock.getElapsedTime();

    people.forEach((person, i) => {
      const isSelected = person.id === selectedPersonId;
      const isImminent = person.currentPhase === 'imminent';

      // Person dot
      const pulseScale = isImminent ? 1 + Math.sin(time * 3 + i) * 0.3 : 1;
      const baseScale = isSelected ? 1.5 : (isImminent ? 1.2 : 0.8);

      tempObject.position.set(person.position.x, 1, person.position.z);
      tempObject.scale.setScalar(baseScale * pulseScale);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, tempColor.set(phaseToColor(person.currentPhase)));

      // Glow ring (larger, transparent)
      const glowScale = baseScale * 3 * (isImminent ? (1 + Math.sin(time * 2 + i) * 0.4) : 1);
      tempObject.position.set(person.position.x, 0.5, person.position.z);
      tempObject.scale.setScalar(glowScale);
      tempObject.updateMatrix();
      glowRef.current.setMatrixAt(i, tempObject.matrix);
      glowRef.current.setColorAt(i, tempColor.set(phaseToColor(person.currentPhase)));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    glowRef.current.instanceMatrix.needsUpdate = true;
    if (glowRef.current.instanceColor) glowRef.current.instanceColor.needsUpdate = true;
  });

  // Click handler
  const handleClick = () => {
    if (!meshRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      const person = people[intersects[0].instanceId];
      if (person) selectPerson(person.id);
    }
  };

  return (
    <group onClick={handleClick}>
      {/* Person dots */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, people.length]}>
        <sphereGeometry args={[0.5, 12, 12]} />
        <meshStandardMaterial emissive="white" emissiveIntensity={0.5} roughness={0.3} />
      </instancedMesh>

      {/* Glow halos */}
      <instancedMesh ref={glowRef} args={[undefined, undefined, people.length]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial transparent opacity={0.08} side={THREE.DoubleSide} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}
