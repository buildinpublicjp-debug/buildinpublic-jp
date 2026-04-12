'use client';

import { TilesRenderer, TilesPlugin, GlobeControls, TilesAttributionOverlay } from '3d-tiles-renderer/r3f';
import { GoogleCloudAuthPlugin } from '3d-tiles-renderer/plugins';

// Shibuya, Tokyo coordinates
const SHIBUYA_LAT = 35.6595;
const SHIBUYA_LNG = 139.7004;

export function CityScene() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <group>
        {/* Fallback: simple ground when no API key */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[2000, 2000]} />
          <meshBasicMaterial color="#08080f" />
        </mesh>
        <gridHelper args={[2000, 50, '#111118', '#0c0c12']} />
      </group>
    );
  }

  return (
    <TilesRenderer>
      <TilesPlugin
        plugin={GoogleCloudAuthPlugin}
        args={{ apiToken: apiKey }}
      />
      <GlobeControls />
      <TilesAttributionOverlay />
    </TilesRenderer>
  );
}
