'use client';

import { useMemo } from 'react';

interface NightSkyProps {
  /** Current hour (0-23) for time-of-day sky gradient */
  hour?: number;
}

/**
 * Tokyo night skyline background (#030)
 * - CSS gradient sky (dark blue to black, time-of-day dependent)
 * - SVG silhouette of Tokyo skyline
 * - Twinkling stars
 * Renders behind the cross-section building view.
 */
export function NightSky({ hour = 23 }: NightSkyProps) {
  // Time-based sky gradient
  const skyGradient = useMemo(() => {
    // Deep night (22-4): very dark
    // Dusk/Dawn (5-7, 18-21): subtle blue/purple
    // Day (8-17): still dark since this is a night-themed app
    if (hour >= 5 && hour <= 7) {
      // Dawn
      return 'linear-gradient(180deg, #0a0820 0%, #1a1040 40%, #2d1560 70%, #1a0a30 100%)';
    }
    if (hour >= 18 && hour <= 21) {
      // Dusk
      return 'linear-gradient(180deg, #08061a 0%, #150a30 40%, #1f1045 70%, #0d0620 100%)';
    }
    // Default deep night
    return 'linear-gradient(180deg, #020208 0%, #08041a 40%, #0d0820 70%, #050310 100%)';
  }, [hour]);

  // Generate star positions deterministically
  const stars = useMemo(() => {
    const result: { x: number; y: number; r: number; delay: number; dur: number; bright: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const seed = (i * 7919 + 1013) % 10007;
      result.push({
        x: (seed % 100),
        y: ((seed * 3) % 50), // only in top half
        r: (seed % 3 === 0) ? 0.6 : 0.35,
        delay: (seed % 17) * 0.2,
        dur: 2 + (seed % 5) * 0.5,
        bright: 0.15 + (seed % 4) * 0.1,
      });
    }
    return result;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{ background: skyGradient }}
      />

      {/* Stars SVG */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {stars.map((star, i) => (
          <circle
            key={`sky-star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="white"
            fillOpacity={star.bright}
          >
            <animate
              attributeName="fill-opacity"
              values={`${star.bright * 0.4};${star.bright};${star.bright * 0.4}`}
              dur={`${star.dur}s`}
              begin={`${star.delay}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Tokyo skyline silhouette at bottom */}
        <path
          d="M0,100 L0,88 L3,88 L3,85 L5,85 L5,83 L7,83 L7,80 L9,80 L9,78
             L11,78 L11,75 L13,75 L13,72 L15,72 L15,68 L17,68 L17,65 L18,65
             L18,62 L19,62 L19,65 L21,65 L21,68 L23,68 L23,72 L25,72 L25,70
             L27,70 L27,74 L29,74 L29,72 L31,72 L31,76 L33,76 L33,73 L35,73
             L35,78 L37,78 L37,75 L39,75 L39,80 L41,80 L41,77 L43,77 L43,82
             L45,82 L45,78 L47,78 L47,83 L49,83 L49,80 L51,80 L51,76 L52,76
             L52,72 L53,72 L53,68 L54,68 L54,72 L55,72 L55,76 L57,76 L57,80
             L59,80 L59,78 L61,78 L61,82 L63,82 L63,79 L65,79 L65,83 L67,83
             L67,80 L69,80 L69,76 L71,76 L71,73 L73,73 L73,70 L74,70 L74,67
             L75,67 L75,70 L77,70 L77,74 L79,74 L79,78 L81,78 L81,75 L83,75
             L83,80 L85,80 L85,82 L87,82 L87,85 L89,85 L89,82 L91,82 L91,86
             L93,86 L93,84 L95,84 L95,88 L97,88 L97,86 L100,86 L100,100 Z"
          fill="#04040c"
          fillOpacity="0.9"
        />

        {/* Building window lights (tiny dots on skyline) */}
        {[
          [15,70],[17,67],[18,64],[52,74],[53,70],[54,69],[73,72],[74,69],
          [13,73],[31,74],[45,80],[65,81],[83,78],[91,84],[7,82],[39,77],
        ].map(([wx,wy], i) => (
          <rect
            key={`win-${i}`}
            x={wx} y={wy}
            width="0.5" height="0.4"
            fill="#ffcc66"
            fillOpacity="0.3"
          >
            <animate
              attributeName="fill-opacity"
              values={i % 3 === 0 ? '0.1;0.4;0.1' : '0.3;0.3;0.3'}
              dur={`${3 + i * 0.5}s`}
              repeatCount="indefinite"
            />
          </rect>
        ))}
      </svg>
    </div>
  );
}
