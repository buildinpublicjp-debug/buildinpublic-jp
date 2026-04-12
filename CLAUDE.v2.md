# buildinpublic.jp v2 — Agent Instructions

## プロダクト

実在する東京の街で300人のAIキャラの親密さの進行をリアルタイムシミュレーション。
GTA5キャラスイッチ × 龍が如く街密度 × トモコレ覗き見 × ギャルゲー没入感。

## 技術スタック

- Next.js 14 (App Router)
- React Three Fiber + Three.js (3D都市)
- Mapbox GL JS (3D Buildings)
- Zustand (状態管理)
- Tailwind CSS
- Framer Motion (UI遷移)
- Supabase (DB + Auth + Realtime)
- Claude API (シナリオ動的生成)
- i18next (多言語 JA/EN)

## ディレクトリ構造

```
engine/         ← シミュレーションロジック
  emotions.ts   ← 感情エンジン(12軸)
  scoring.ts    ← 前戯度スコア計算
  mbti.ts       ← MBTI 16タイプ + ケミストリー
  personGenerator.ts ← 300人生成

data/           ← 静的データ
  areas.ts      ← 東京20エリア
  situationTemplates.ts ← フェーズ別テンプレート

stores/         ← Zustand
  gameStore.ts  ← カメラ、UI、言語
  peopleStore.ts ← 300人の状態

skills/         ← 開発パターン集
  R3F_CITY.md
  CAMERA_SYSTEM.md
  EMOTION_ENGINE.md
  CHARACTER_GEN.md

docs/           ← 設計書
  PRODUCT_DESIGN.md
  plans/        ← CCプラン出力先

cc_prompts/     ← CC4窓用プロンプト
```

## コーディングルール

- `engine/` の関数は純粋関数。React依存なし
- `stores/` はZustandのみ。Reactコンポーネント内からのみ使用
- R3Fコンポーネントは `components/viewport/` に配置
- `useFrame` 内で `setState` 禁止
- シャドウマップ使わない
- OrbitControls使わない
- 新規 .ts ファイル作成時は既存のimportパスを確認

## SKILLファイル

実装前に必ず `skills/` ディレクトリの該当SKILLを読むこと。
