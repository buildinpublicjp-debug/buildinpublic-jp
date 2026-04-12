'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { usePeopleStore } from '../../stores/peopleStore';
import { useGameStore } from '../../stores/gameStore';
import { PHASE_META } from '../../engine/scoring';
// @ts-ignore
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';

const DEG2RAD = THREE.MathUtils.DEG2RAD;
const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const DOT_RADIUS = 0.016;

// Anchor point: Shibuya center ECEF (used as local origin to avoid float32 issues)
const ANCHOR = new THREE.Vector3();
WGS84_ELLIPSOID.getCartographicToPosition(
  35.6595 * DEG2RAD,
  139.7004 * DEG2RAD,
  0,
  ANCHOR,
);

export function People() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const selectPerson = useGameStore(s => s.selectPerson);
  const { raycaster, camera, pointer } = useThree();
  const initialized = useRef(false);

  // Pre-compute positions relative to anchor (small values, safe for float32)
  const relativePositions = useMemo(() => {
    const people = usePeopleStore.getState().people;
    return people.map(p => {
      const v = new THREE.Vector3();
      WGS84_ELLIPSOID.getCartographicToPosition(
        p.lat * DEG2RAD,
        p.lng * DEG2RAD,
        5,
        v,
      );
      return new THREE.Vector3(v.x - ANCHOR.x, v.y - ANCHOR.y, v.z - ANCHOR.z);
    });
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current || relativePositions.length === 0) return;
    const people = usePeopleStore.getState().people;
    if (people.length === 0) return;
    const selectedPersonId = useGameStore.getState().selectedPersonId;
    const time = clock.getElapsedTime();

    for (let i = 0; i < people.length; i++) {
      const person = people[i];
      const isSelected = person.id === selectedPersonId;
      const isImminent = person.currentPhase === 'imminent';

      const pulse = isImminent ? 1 + Math.sin(time * 3 + i) * 0.3 : 1;
      const scale = isSelected ? DOT_RADIUS * 2.5 : isImminent ? DOT_RADIUS * 1.8 : DOT_RADIUS;

      tempObject.position.copy(relativePositions[i]);
      tempObject.scale.setScalar(scale * pulse);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      if (!initialized.current) {
        meshRef.current.setColorAt(i, tempColor.set(PHASE_META[person.currentPhase].color));
      }
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (!initialized.current && meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
      initialized.current = true;
    }
  });

  const handleClick = () => {
    if (!meshRef.current) return;
    const people = usePeopleStore.getState().people;
    if (people.length === 0) return;
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
      const person = people[intersects[0].instanceId];
      if (person) selectPerson(person.id);
    }
  };

  return (
    <group position={[ANCHOR.x, ANCHOR.y, ANCHOR.z]} onClick={handleClick}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 300]} renderOrder={999} frustumCulled={false}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshBasicMaterial depthTest={false} />
      </instancedMesh>
    </group>
  );
}
