# CC Window 2: ENGINE — シミュレーション+感情エンジン設計

## あなたの役割
300人のAI人物の生成・感情計算・リアルタイム状態更新システムを設計する。

既に実装済み:
- engine/emotions.ts (12軸感情エンジン)
- engine/scoring.ts (スコア計算)
- engine/mbti.ts (16タイプ+ケミストリー)
- engine/personGenerator.ts (300人生成)

## 設計範囲
1. Web Workerでのシミュレーションループ設計
2. Claude APIバッチでバックストーリー深化
3. SNS投稿生成パイプライン
4. 家族構成生成

参照: @skills/EMOTION_ENGINE.md @skills/CHARACTER_GEN.md
出力先: docs/plans/plan_simulation_engine.md
