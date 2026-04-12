# CC4窓 Agent Team — QUICK START

## Step 1: リポジトリをclone
```bash
git clone https://github.com/buildinpublicjp-debug/buildinpublic-jp.git
cd buildinpublic-jp
git checkout v2-simulation
```

## Step 2: CC4窓を開く

### Window 4（INFRA）を最初に
```bash
cc
# → cc_prompts/window_4_infra.md の内容を投げる
# → package.json更新 + ディレクトリ作成 + npm install
```

### 残り3窓を並列で
```bash
# Window 1
cc  # → cc_prompts/window_1_architect.md + @skills/R3F_CITY.md + @skills/CAMERA_SYSTEM.md

# Window 2  
cc  # → cc_prompts/window_2_engine.md + @skills/EMOTION_ENGINE.md + @skills/CHARACTER_GEN.md

# Window 3
cc  # → cc_prompts/window_3_ux.md
```

## Step 3: プランが出そろったら相互レビュー
```
Window 1に: 「docs/plans/plan_simulation_engine.md を読んでレビューして」
Window 2に: 「docs/plans/plan_ux_ui.md を読んでレビューして」
...
```

## Step 4: 実装開始
レビュー収束後、各窓に「プランに基づいて実装開始」。

## ℹ️ エンジンは実装済み

以下は既に動くコードが入っている:
- `engine/emotions.ts` — 12軸感情エンジン
- `engine/scoring.ts` — 前戯度スコア計算
- `engine/mbti.ts` — MBTI 16タイプ + ケミストリー10+組
- `engine/personGenerator.ts` — 300人生成 + 150組ペアリング
- `data/areas.ts` — 東京20エリア
- `data/situationTemplates.ts` — フェーズ別テンプレート
- `stores/gameStore.ts` — Zustandゲームステート
- `stores/peopleStore.ts` — Zustandピープルステート
