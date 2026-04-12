# buildinpublic.jp v2 — CLAUDE.md (Harness v1)

## ミッション
実在する東京の街で300人のAIキャラの親密さをフォトリアリスティック3Dでシミュレーション。

## 現在のステータス: 🟡 IMPROVEMENTS

### ✅ Bug 1: Google Maps エラーメッセージ (RESOLVED)
- CityScene.tsx: TilesPlugin args 型エラー修正、errorTarget=6
- Minimap: OpenStreetMap iframe使用（Google Maps Embed不要）

### ✅ Bug 2: カメラ壊れる (RESOLVED)
- CameraController: ECEF法線方向に50m上空へflyTo実装済み
- CityScene CameraPositioner: computeCameraPose() でWGS84法線計算

### ✅ Bug 3: ドット巨大 (RESOLVED)
- People.tsx: DOT_RADIUS=0.016, geometry args=[0.02, 8, 8] (ECEF 2cm)
- ANCHOR相対座標でfloat32精度問題回避

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js 14 (App Router) |
| 3D | React Three Fiber + Three.js |
| 3Dタイル | 3d-tiles-renderer + GoogleCloudAuthPlugin |
| 状態管理 | Zustand |
| スタイル | Tailwind CSS |
| DB | Supabase |
| AI | Claude API (@anthropic-ai/sdk) |

## ディレクトリ構造

```
engine/              ← 純粋関数のみ。React依存なし
  emotions.ts        ← 12軸感情エンジン
  scoring.ts         ← 前戯度スコア + フェーズ判定
  mbti.ts            ← MBTI 16タイプ + ケミストリーマトリクス
  personGenerator.ts ← 300人生成 + 150組ペアリング

data/
  areas.ts           ← 東京20エリア（lat/lng + 3D座標）
  situationTemplates.ts ← フェーズ別テンプレート

stores/              ← Zustand。Reactコンポーネント内からのみ使用
  gameStore.ts       ← カメラモード、選択、UI、言語
  peopleStore.ts     ← 300人の状態管理

lib/
  geoUtils.ts        ← lat/lng ↔ ECEF座標変換
  anthropic.ts       ← Claude API wrapper

components/
  viewport/
    CityScene.tsx    ← Google 3D Tiles (TilesRenderer)
    CameraController.tsx ← GOD/TPS/FPS + GTA switch (expLerp)
    People.tsx       ← 300人 InstancedMesh (ECEF配置)
    Lighting.tsx     ← 時間帯連動
    Effects.tsx      ← ポストプロセス (placeholder)
  hud/
    TopBar.tsx       ← 時刻 + フェーズ統計
    CameraModeSwitch.tsx ← FPS/TPS/GOD切替
    PersonCardSwiper.tsx ← 下部スワイプカード
    Minimap.tsx      ← OpenStreetMap ミニマップ
  profile/
    ProfilePanel.tsx ← 右スライドイン プロフィール
  scene/
    SceneOverlay.tsx ← ギャルゲーモード テキストウィンドウ
    ChoicePanel.tsx  ← 選択肢
    EmotionBar.tsx   ← スコアバー
  switch/
    SwitchOverlay.tsx ← GTAスイッチ演出
```

## コーディングルール

### 絶対ルール
- `useFrame` 内で `setState` 禁止（再レンダリング地獄）
- `useFrame` 内で `new THREE.Object3D()` 禁止（モジュールスコープで事前生成）
- シャドウマップ使わない（パフォーマンス）
- OrbitControls使わない（GlobeControlsと競合）
- `engine/` はReact依存なし（純粋関数のみ）
- `stores/` でgetState()を使ってReact再レンダリングを回避

### パフォーマンス
- InstancedMeshで同じジオメトリを1 draw callで描画
- useEffectで初期matrix/colorを1回だけセット
- useFrame内ではselected/imminentのみmatrix更新（全300人毎フレーム更新しない）
- phase変更時のみcolor更新（dirty flagパターン）

### 3D Tiles 設定
- TilesRenderer の errorTarget: 2-6（低いほど高解像度、重い）
- loadSiblings: false（必要なタイルだけロード）
- Canvas camera: { near: 1, far: 1e10 }（グローブスケール）

### ECEF座標系
- 地球中心が原点。1ユニット=1メートル
- 地球半径: 6,371,000m
- 東京の高度0mでのECEF座標: 約(-3954000, 3717000, 3354000)
- 「上方向」= normalize(position)（地球中心からの法線）
- カメラの「高度50m」= position + normalize(position) * 50

## SKILL参照

| 実装内容 | 読むSKILL |
|---------|----------|
| 3D都市描画 | skills/R3F_CITY.md |
| カメラ遷移 | skills/CAMERA_SYSTEM.md |
| 感情計算 | skills/EMOTION_ENGINE.md |
| キャラ生成 | skills/CHARACTER_GEN.md |

## デバッグ手順

### 3D Tilesが表示されない場合
1. DevTools > Console で tile.googleapis.com のエラーを確認
2. DevTools > Network で tile.googleapis.com のステータスコードを確認
3. 403 → APIキーまたはMap Tiles APIの有効化を確認
4. 200だがテクスチャなし → errorTargetを下げる
5. .env.local のキーが正しいか cat で確認

### パフォーマンスが悪い場合
1. DevTools > Console に `renderer.info` を出力
2. draw call数、triangle数を確認
3. errorTargetを上げる（6→12）
4. loadSiblingsをfalseにする

## 次のタスク（優先順位順）
1. ~~🔴 Bug 1-3 を修正~~ ✅ DONE
2. 🟡 errorTarget調整でテクスチャ品質改善（現在 errorTarget=6）
3. 🟡 ミニマップにドット表示
4. ✅ ギャルゲーモード統合（SceneOverlay → page.tsx） DONE
5. 🟢 BGM/環境音
