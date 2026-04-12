'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { usePeopleStore } from '../../stores/peopleStore';
// @ts-ignore
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';

const _ecef = new THREE.Vector3();
const _normal = new THREE.Vector3();

const FLY_ALTITUDE = 50;
const FLY_DURATION = 2000; // ms

function computeFlyPose(lat: number, lng: number, alt: number) {
  // ECEF position of the surface point
  WGS84_ELLIPSOID.getCartographicToPosition(
    lat * THREE.MathUtils.DEG2RAD,
    lng * THREE.MathUtils.DEG2RAD,
    0,
    _ecef,
  );

  // Surface normal = direction away from Earth center
  _normal.copy(_ecef).normalize();

  // Camera = surface + normal * altitude
  const position = new THREE.Vector3(
    _ecef.x + _normal.x * alt,
    _ecef.y + _normal.y * alt,
    _ecef.z + _normal.z * alt,
  );

  // Look target = the surface point
  const lookAt = _ecef.clone();

  return { position, lookAt, up: _normal.clone() };
}

export function CameraController() {
  const { camera } = useThree();
  const selectedPersonId = useGameStore(s => s.selectedPersonId);
  const getPersonById = usePeopleStore(s => s.getPersonById);

  // Fly animation state
  const flyStartPos = useRef(new THREE.Vector3());
  const flyStartLook = useRef(new THREE.Vector3());
  const flyStartUp = useRef(new THREE.Vector3(0, 1, 0));
  const flyEndPos = useRef(new THREE.Vector3());
  const flyEndLook = useRef(new THREE.Vector3());
  const flyEndUp = useRef(new THREE.Vector3(0, 1, 0));
  const flyStartTime = useRef(0);
  const isFlying = useRef(false);
  const currentLook = useRef(new THREE.Vector3());
  const currentUp = useRef(new THREE.Vector3(0, 1, 0));

  // Trigger fly when person is selected
  useEffect(() => {
    if (!selectedPersonId) return;
    const person = getPersonById(selectedPersonId);
    if (!person) return;

    const { position, lookAt, up } = computeFlyPose(person.lat, person.lng, FLY_ALTITUDE);

    flyStartPos.current.copy(camera.position);
    flyStartLook.current.copy(currentLook.current);
    flyStartUp.current.copy(currentUp.current);
    flyEndPos.current.copy(position);
    flyEndLook.current.copy(lookAt);
    flyEndUp.current.copy(up);
    flyStartTime.current = Date.now();
    isFlying.current = true;
  }, [selectedPersonId]);

  // Animate camera fly
  useFrame(() => {
    if (!isFlying.current) return;

    const elapsed = Date.now() - flyStartTime.current;
    const t = Math.min(elapsed / FLY_DURATION, 1);
    // Ease in-out cubic
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(flyStartPos.current, flyEndPos.current, ease);
    currentLook.current.lerpVectors(flyStartLook.current, flyEndLook.current, ease);
    currentUp.current.lerpVectors(flyStartUp.current, flyEndUp.current, ease).normalize();

    camera.up.copy(currentUp.current);
    camera.lookAt(currentLook.current);
    camera.updateMatrixWorld(true);

    if (t >= 1) {
      isFlying.current = false;
    }
  });

  return null;
}
