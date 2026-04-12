# 自律フィードバックループ v3 — 4窓協調システム

## アーキテクチャ

```
┌─────────────────────────────────────────────────────────┐
│                    共有ファイル                          │
│  docs/issues.md        ← 全窓が読み書きする問題リスト    │
│  docs/feedback/*.md    ← 各窓のレポート                  │
│  docs/CROSS_SECTION_DESIGN.md ← 仕様書（正の基準）      │
│  CLAUDE.v2.md          ← コーディングルール              │
└─────────────────────────────────────────────────────────┘
        ↑ git pull/push で同期
┌───────┼───────┬───────┼───────┬───────┼───────┬───────┼───────┐
│  窓1: UI      │  窓2: 機能     │  窓3: 品質     │  窓4: デザイン │
│  builder      │  integrator    │  reviewer      │  artist        │
│               │                │                │                │
│  責務:        │  責務:         │  責務:         │  責務:         │
│  ・コンポーネ │  ・ストア接続  │  ・ビルド確認  │  ・CSS/アニメ  │
│    ント実装   │  ・データフロー│  ・Playwright  │  ・SVGアセット │
│  ・レイアウト │  ・API統合     │    でスクショ  │  ・色/フォント │
│  ・レスポンシブ│  ・状態管理    │  ・バグ発見    │  ・UX改善     │
│               │                │  ・レポート    │                │
│  Playwright:  │  Playwright:   │  Playwright:   │  Playwright:   │
│  モバイル     │  クリック操作  │  フルページ    │  アニメーション│
│  375x812      │  インタラクション│  1920x1080   │  各エリア確認  │
└───────────────┴────────────────┴────────────────┴────────────────┘
```

## セットアップ（全窓共通、初回のみ）
```bash
claude mcp add playwright npx @playwright/mcp@latest
```

## 共有問題リスト: docs/issues.md

全窓が読み書きする。形式:
```markdown
## 🔴 CRITICAL
- [ ] #001 [窓3発見] 建物が表示されない → 窓1が対応中
- [x] #002 [窓2発見] カメラが壊れる → 窓2が修正済み

## 🟡 IMPORTANT  
- [ ] #003 [窓4発見] フォントが読みにくい → 未着手

## 🟢 NICE TO HAVE
- [ ] #004 [窓3発見] ローディングアニメがない → 未着手
```

## 各窓のループ

```
while true:
  1. git pull origin v2-simulation
  2. docs/issues.md を読む
  3. 自分の役割に関連する未着手の問題を1つ選ぶ
  4. docs/issues.md に「→ 窓Nが対応中」と書いてcommit+push
  5. 問題を修正する
  6. Playwrightでブラウザを開いてスクショ撮る（自分の観点で）
  7. スクショを分析して修正が正しいか確認
  8. 修正OK → docs/issues.md のチェックボックスを[x]にする
  9. 新しい問題を発見 → docs/issues.md に追加
  10. docs/feedback/窓N-YYYYMMDD-HHMM.md にレポート
  11. git add + commit + push
  12. Step 1に戻る
```

## コンフリクト回避ルール

1. **ファイル所有権**: 各窓は自分の担当ファイルだけを編集
   - 窓1(builder): components/city/*, components/cross-section/*
   - 窓2(integrator): stores/*, lib/*, app/page.tsx, app/api/*
   - 窓3(reviewer): docs/*, テスト、CLAUDE.v2.md
   - 窓4(artist): styles/*, public/*, アニメーション関連CSS

2. **engine/ は全窓読み取り専用**。変更が必要な場合はissues.mdに起票

3. **commit前に必ず git pull**。コンフリクトしたらgit stash → pull → stash pop

4. **docs/issues.md の編集は追記のみ**。他の窓の記述を消さない

## 停止条件

- docs/issues.md の🔴が全部[x]になったら窓3(reviewer)が全窓に報告
- 全窓が🟡も完了したらスタンバイモードに移行
- 3回ループしても直らない問題は「STUCK」マークして次へ
