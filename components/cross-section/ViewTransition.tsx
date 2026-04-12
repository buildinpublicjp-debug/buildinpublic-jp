'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

interface ViewTransitionProps {
  /** 現在表示するビューのキー */
  viewKey: string;
  /** トランジション時間(ms) */
  duration?: number;
  children: ReactNode;
}

/**
 * 3段階遷移コンポーネント (#034 遷移エフェクト強化)
 * viewKeyが変わると:
 * Stage 1: ドット拡大 — 現ビューが縮小＋フェード (zoom-out feel)
 * Stage 2: 白フラッシュ — ビルアウトライン登場感
 * Stage 3: 新ビューがズームイン＋フェードイン (camera zoom-in)
 */
export function ViewTransition({ viewKey, duration = 800, children }: ViewTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'stage1' | 'stage2' | 'stage3'>('idle');
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [showFlash, setShowFlash] = useState(false);
  const prevKeyRef = useRef(viewKey);
  const timeoutRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = () => {
    for (const t of timeoutRef.current) clearTimeout(t);
    timeoutRef.current = [];
  };

  useEffect(() => {
    if (viewKey !== prevKeyRef.current) {
      clearTimeouts();

      // Stage 1: 現ビューを縮小＋透明化 (dot expand feel)
      setPhase('stage1');

      // Stage 2: flash + swap content
      const t1 = setTimeout(() => {
        setShowFlash(true);
        setDisplayedChildren(children);
        setPhase('stage2');

        // End flash
        const t2 = setTimeout(() => {
          setShowFlash(false);
        }, duration * 0.15);
        timeoutRef.current.push(t2);

        // Stage 3: new view zooms in
        const t3 = setTimeout(() => {
          setPhase('stage3');

          const t4 = setTimeout(() => {
            setPhase('idle');
          }, duration * 0.4);
          timeoutRef.current.push(t4);
        }, duration * 0.1);
        timeoutRef.current.push(t3);
      }, duration * 0.35);
      timeoutRef.current.push(t1);

      prevKeyRef.current = viewKey;
    } else {
      // 同じビュー内での更新
      setDisplayedChildren(children);
    }

    return clearTimeouts;
  }, [viewKey, children, duration]);

  // Phase-based transforms
  let opacity: number;
  let scale: number;
  let filter: string;
  let transitionTiming: string;

  switch (phase) {
    case 'stage1':
      // Zoom out + fade: current view shrinks away
      opacity = 0;
      scale = 1.15;
      filter = 'blur(2px)';
      transitionTiming = `opacity ${duration * 0.3}ms ease-in, transform ${duration * 0.35}ms ease-in, filter ${duration * 0.3}ms ease-in`;
      break;
    case 'stage2':
      // Swap moment: new view starts small
      opacity = 0.3;
      scale = 0.92;
      filter = 'blur(1px)';
      transitionTiming = `opacity ${duration * 0.1}ms linear, transform ${duration * 0.1}ms linear, filter ${duration * 0.1}ms linear`;
      break;
    case 'stage3':
      // Zoom in: new view grows to full
      opacity = 1;
      scale = 1;
      filter = 'blur(0px)';
      transitionTiming = `opacity ${duration * 0.35}ms ease-out, transform ${duration * 0.4}ms cubic-bezier(0.22, 1, 0.36, 1), filter ${duration * 0.3}ms ease-out`;
      break;
    default:
      opacity = 1;
      scale = 1;
      filter = 'blur(0px)';
      transitionTiming = 'none';
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* メインコンテンツ */}
      <div
        className="w-full h-full"
        style={{
          opacity,
          transform: `scale(${scale})`,
          filter,
          transition: transitionTiming,
          transformOrigin: 'center center',
        }}
      >
        {displayedChildren}
      </div>

      {/* Stage 2 フラッシュオーバーレイ (building outline fade-in feel) */}
      <div
        className="absolute inset-0 pointer-events-none z-50"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
          opacity: showFlash ? 1 : 0,
          transition: `opacity ${duration * 0.15}ms ease-out`,
        }}
      />
    </div>
  );
}
