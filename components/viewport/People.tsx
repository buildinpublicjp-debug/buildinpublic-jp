'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore } from '../../stores/gameStore';
import { PHASE_META } from '../../engine/scoring';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

// Human proportions (meters, real-world scale for Google 3D Tiles)
const BODY_HEIGHT = 1.2;
const HEAD_OFFSET = BODY_HEIGHT + 0.15;
const PERSON_SCALE = 1.0;

export function People() {
  const bodyRef = useRef<THREE.InstancedMesh>(null!);
  const headRef = useRef<THREE.InstancedMesh>(null!);
  const people = usePeopleStore(s => s.people);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const selectPerson = useGameStore(s => s.selectPerson);
  const { raycaster, camera, pointer } = useThree();

  useFrame(({ clock }) => {
    if (!bodyRef.current || !headRef.current) return;
    const time = clock.getElapsedTime();

    people.forEach((person, i) => {
      const isSelected = person.id === selectedPersonId;
      const isImminent = person.currentPhase === 'imminent';
      const pulse = isImminent ? 1 + Math.sin(time * 3 + i) * 0.15 : 1;
      const s = (isSelected ? 1.3 : 1.0) * pulse * PERSON_SCALE;

      const px = person.position.x;
      const pz = person.position.z;
      const angle = person.bodyAngle;

      // Slight idle sway animation
      const sway = Math.sin(time * 0.8 + i * 1.7) * 0.03;

      // === BODY (capsule-like cylinder) ===
      tempObject.position.set(px, BODY_HEIGHT * 0.5 * s, pz);
      tempObject.scale.set(s, s, s);
      tempObject.rotation.set(sway, angle, 0);
      tempObject.updateMatrix();
      bodyRef.current.setMatrixAt(i, tempObject.matrix);
      bodyRef.current.setColorAt(i, tempColor.set(PHASE_META[person.currentPhase].color));

      // === HEAD ===
      tempObject.position.set(
        px + Math.sin(sway) * 0.05,
        HEAD_OFFSET * s,
        pz
      );
      tempObject.scale.set(s, s, s);
      tempObject.rotation.set(0, angle, 0);
      tempObject.updateMatrix();
      headRef.current.setMatrixAt(i, tempObject.matrix);

      // Head color: skin tone base, slightly tinted by phase
      const phaseColor = new THREE.Color(PHASE_META[person.currentPhase].color);
      const skinBase = new THREE.Color('#e8c4a0');
      skinBase.lerp(phaseColor, 0.15); // subtle phase tint on skin
      headRef.current.setColorAt(i, skinBase);
    });

    bodyRef.current.instanceMatrix.needsUpdate = true;
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
    headRef.current.instanceMatrix.needsUpdate = true;
    if (headRef.current.instanceColor) headRef.current.instanceColor.needsUpdate = true;
  });

  const handleClick = () => {
    if (!bodyRef.current) return;
    raycaster.setFromCamera(pointer, camera);
    // Check body hits
    const bodyHits = raycaster.intersectObject(bodyRef.current);
    if (bodyHits.length > 0 && bodyHits[0].instanceId !== undefined) {
      const person = people[bodyHits[0].instanceId];
      if (person) selectPerson(person.id);
      return;
    }
    // Check head hits
    if (!headRef.current) return;
    const headHits = raycaster.intersectObject(headRef.current);
    if (headHits.length > 0 && headHits[0].instanceId !== undefined) {
      const person = people[headHits[0].instanceId];
      if (person) selectPerson(person.id);
    }
  };

  return (
    <group onClick={handleClick}>
      {/* Body — rounded cylinder, phase-colored */}
      <instancedMesh ref={bodyRef} args={[undefined, undefined, people.length]}>
        <cylinderGeometry args={[0.18, 0.14, BODY_HEIGHT, 8, 1]} />
        <meshStandardMaterial roughness={0.7} metalness={0.05} />
      </instancedMesh>

      {/* Head — sphere, skin-toned */}
      <instancedMesh ref={headRef} args={[undefined, undefined, people.length]}>
        <sphereGeometry args={[0.13, 10, 8]} />
        <meshStandardMaterial roughness={0.5} metalness={0.0} />
      </instancedMesh>
    </group>
  );
}
