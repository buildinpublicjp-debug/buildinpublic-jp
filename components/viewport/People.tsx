'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore } from '../../stores/gameStore';
import { PHASE_META, Phase } from '../../engine/scoring';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

export function People() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const people = usePeopleStore(s => s.people);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const selectPerson = useGameStore(s => s.selectPerson);
  const { raycaster, camera, pointer } = useThree();

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const time = clock.getElapsedTime();

    people.forEach((person, i) => {
      const isSelected = person.id === selectedPersonId;
      const isImminent = person.currentPhase === 'imminent';
      const pulse = isImminent ? 1 + Math.sin(time * 3 + i) * 0.3 : 1;
      const scale = isSelected ? 2 : (isImminent ? 1.5 : 0.8);

      tempObject.position.set(person.position.x, 1, person.position.z);
      tempObject.scale.setScalar(scale * pulse);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, tempColor.set(PHASE_META[person.currentPhase].color));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

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
      <instancedMesh ref={meshRef} args={[undefined, undefined, people.length]}>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial />
      </instancedMesh>
    </group>
  );
}
