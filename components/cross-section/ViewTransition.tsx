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
 * ディゾルブ遷移コンポーネント
 * viewKeyが変わると、旧ビューがフェードアウトし新ビューがフェードインする
 */
export function ViewTransition({ viewKey, duration = 600, children }: ViewTransitionProps) {
  const [phase, setPhase] = useState<'idle' | 'out' | 'in'>('idle');
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const prevKeyRef = useRef(viewKey);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (viewKey !== prevKeyRef.current) {
      // ビューが変わった → ディゾルブ開始
      setPhase('out');

      timeoutRef.current = setTimeout(() => {
        // フェードアウト完了 → 新しいchildrenに切り替えてフェードイン
        setDisplayedChildren(children);
        setPhase('in');

        timeoutRef.current = setTimeout(() => {
          setPhase('idle');
        }, duration / 2);
      }, duration / 2);

      prevKeyRef.current = viewKey;
    } else {
      // 同じビュー内での更新
      setDisplayedChildren(children);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [viewKey, children, duration]);

  const opacity = phase === 'out' ? 0 : phase === 'in' ? 1 : 1;
  const scale = phase === 'out' ? 0.98 : phase === 'in' ? 1 : 1;

  return (
    <div
      className="w-full h-full"
      style={{
        opacity,
        transform: `scale(${scale})`,
        transition: `opacity ${duration / 2}ms ease-in-out, transform ${duration / 2}ms ease-in-out`,
      }}
    >
      {displayedChildren}
    </div>
  );
}
