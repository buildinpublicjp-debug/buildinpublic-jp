'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { TilesRenderer, TilesPlugin, GlobeControls } from '3d-tiles-renderer/r3f';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/plugins';
// @ts-ignore
import { WGS84_ELLIPSOID } from '3d-tiles-renderer/three';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useTilesLoadingStore } from '../../stores/tilesLoadingStore';

// Shibuya, Tokyo
const SHIBUYA_LAT = 35.6595 * THREE.MathUtils.DEG2RAD;
const SHIBUYA_LNG = 139.7004 * THREE.MathUtils.DEG2RAD;
const FLY_ALTITUDE = 50;
const FLY_DURATION = 2000; // ms

const _ecef = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _up = new THREE.Vector3();
const _tmpMat = new THREE.Matrix4();

function computeCameraPose(latRad: number, lngRad: number, alt: number) {
  WGS84_ELLIPSOID.getCartographicToPosition(latRad, lngRad, 0, _ecef);
  _normal.copy(_ecef).normalize();
  _camPos.set(
    _ecef.x + _normal.x * alt,
    _ecef.y + _normal.y * alt,
    _ecef.z + _normal.z * alt,
  );
  _lookAt.copy(_ecef);
  _up.set(-_normal.z, _normal.x, _normal.y).normalize();
  _tmpMat.lookAt(_camPos, _lookAt, _up);
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(_tmpMat);
  return { position: _camPos.clone(), quaternion };
}

function CameraPositioner() {
  const camera = useThree(s => s.camera);
  const initialized = useRef(false);
  const flyTarget = useGameStore(s => s.flyTarget);
  const setFlyTarget = useGameStore(s => s.setFlyTarget);

  const flyStartPos = useRef(new THREE.Vector3());
  const flyStartQuat = useRef(new THREE.Quaternion());
  const flyEndPos = useRef(new THREE.Vector3());
  const flyEndQuat = useRef(new THREE.Quaternion());
  const flyStartTime = useRef(0);
  const isFlying = useRef(false);

  // Initial camera position — run synchronously on first render
  if (!initialized.current) {
    initialized.current = true;
    const { position, quaternion } = computeCameraPose(SHIBUYA_LAT, SHIBUYA_LNG, FLY_ALTITUDE);
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
    camera.updateMatrixWorld(true);
  }

  // Start fly animation when flyTarget changes
  useEffect(() => {
    if (!flyTarget) return;
    flyStartPos.current.copy(camera.position);
    flyStartQuat.current.copy(camera.quaternion);
    const { position, quaternion } = computeCameraPose(
      flyTarget.lat * THREE.MathUtils.DEG2RAD,
      flyTarget.lng * THREE.MathUtils.DEG2RAD,
      FLY_ALTITUDE,
    );
    flyEndPos.current.copy(position);
    flyEndQuat.current.copy(quaternion);
    flyStartTime.current = Date.now();
    isFlying.current = true;
  }, [flyTarget, camera]);

  // Animate camera fly
  useFrame(() => {
    if (!isFlying.current) return;
    const elapsed = Date.now() - flyStartTime.current;
    const t = Math.min(elapsed / FLY_DURATION, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    camera.position.lerpVectors(flyStartPos.current, flyEndPos.current, ease);
    camera.quaternion.slerpQuaternions(flyStartQuat.current, flyEndQuat.current, ease);
    camera.updateMatrixWorld(true);
    if (t >= 1) {
      isFlying.current = false;
      setFlyTarget(null);
    }
  });

  return null;
}

function TilesLoadMonitor() {
  const setLoading = useTilesLoadingStore(s => s.setLoading);
  const setProgress = useTilesLoadingStore(s => s.setProgress);
  const startTime = useRef(Date.now());
  const settled = useRef(false);

  useFrame(() => {
    if (settled.current) return;
    const elapsed = (Date.now() - startTime.current) / 1000;
    const timeProgress = 1 - Math.exp(-elapsed / 3);
    setProgress(Math.min(timeProgress, 0.99));
    if (timeProgress > 0.8 && !settled.current) {
      settled.current = true;
      setProgress(1);
      setTimeout(() => setLoading(false), 500);
    }
  });

  return null;
}

export function CityScene() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <group>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial color="#08080f" />
        </mesh>
        <gridHelper args={[2000, 50, '#111118', '#0c0c12']} />
      </group>
    );
  }

  return (
    <>
      <CameraPositioner />
      <TilesLoadMonitor />
      <TilesRenderer
        errorTarget={6}
        maxDepth={20}
        loadSiblings={false}
      >
        <TilesPlugin
          plugin={GoogleCloudAuthPlugin}
          args={{ apiToken: apiKey } as unknown as any[]}
        />
        <GlobeControls
          minDistance={2}
          cameraRadius={2}
          minAltitude={0}
          maxAltitude={Math.PI / 2}
          enableDamping
        />
      </TilesRenderer>
    </>
  );
}
