'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { usePeopleStore } from '../../stores/peopleStore';

// Smooth exponential decay lerp
function expLerp(current: number, target: number, speed: number, delta: number): number {
  const t = 1 - Math.exp(-speed * delta);
  return current + (target - current) * t;
}

export function CameraController() {
  const { camera } = useThree();
  const cameraMode = useGameStore(s => s.cameraMode);
  const switchPhase = useGameStore(s => s.switchPhase);
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const getPersonById = usePeopleStore(s => s.getPersonById);

  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((_, delta) => {
    const person = selectedPersonId ? getPersonById(selectedPersonId) : null;
    let targetPos = { x: 0, y: 400, z: 200 };
    let targetLook = { x: 0, y: 0, z: 0 };
    let speed = 3;

    // === GTA SWITCH ===
    if (switchPhase === 'zoom_out') {
      targetPos = { x: 0, y: 600, z: 100 };
      targetLook = { x: 0, y: 0, z: 0 };
      speed = 2;
    } else if (switchPhase === 'zoom_in' && person) {
      targetPos = { x: person.position.x, y: 100, z: person.position.z + 30 };
      targetLook = { x: person.position.x, y: 0, z: person.position.z };
      speed = 2.5;
    }
    // === NORMAL MODES ===
    else if (person) {
      const angle = person.bodyAngle;

      if (cameraMode === 'tps') {
        // Third person: behind and above
        targetPos = {
          x: person.position.x + Math.cos(angle) * 8,
          y: 4,
          z: person.position.z + Math.sin(angle) * 8,
        };
        targetLook = {
          x: person.position.x,
          y: 1.5,
          z: person.position.z,
        };
        speed = 4;
      } else if (cameraMode === 'fps') {
        // First person: eye level
        targetPos = {
          x: person.position.x + Math.cos(angle) * 0.3,
          y: 1.7,
          z: person.position.z + Math.sin(angle) * 0.3,
        };
        targetLook = {
          x: person.position.x - Math.cos(angle) * 3,
          y: 1.5,
          z: person.position.z - Math.sin(angle) * 3,
        };
        speed = 5;
      } else {
        // God view focused on person
        targetPos = {
          x: person.position.x,
          y: 150,
          z: person.position.z + 60,
        };
        targetLook = {
          x: person.position.x,
          y: 0,
          z: person.position.z,
        };
        speed = 3;
      }
    }
    // === NO SELECTION: ORBIT ===
    else {
      const time = Date.now() * 0.00005;
      targetPos = {
        x: Math.cos(time) * 100,
        y: 400,
        z: Math.sin(time) * 100 + 100,
      };
      targetLook = { x: 0, y: 0, z: 0 };
      speed = 1.5;
    }

    // Apply exponential lerp to camera position
    camera.position.x = expLerp(camera.position.x, targetPos.x, speed, delta);
    camera.position.y = expLerp(camera.position.y, targetPos.y, speed, delta);
    camera.position.z = expLerp(camera.position.z, targetPos.z, speed, delta);

    // Apply exponential lerp to look target
    lookTarget.current.x = expLerp(lookTarget.current.x, targetLook.x, speed, delta);
    lookTarget.current.y = expLerp(lookTarget.current.y, targetLook.y, speed, delta);
    lookTarget.current.z = expLerp(lookTarget.current.z, targetLook.z, speed, delta);

    camera.lookAt(lookTarget.current);
  });

  return null;
}
