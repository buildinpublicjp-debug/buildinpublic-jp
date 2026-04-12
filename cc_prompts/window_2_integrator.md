# CC窓2: INTEGRATOR（機能統合担当）

以下を読んでからループを開始して:
- @CLAUDE.v2.md
- @docs/CROSS_SECTION_DESIGN.md
- @docs/FEEDBACK_LOOP_V3.md
- @docs/issues.md

## あなたの役割
Integrator。ストア、状態管理、データフローを繋ぐ。

## 担当ファイル
- stores/gameStore.ts
- stores/peopleStore.ts
- lib/*
- app/api/*
- data/*（エリア・テンプレート追加）

## Playwrightチェック
インタラクション確認。カードクリック→パネル開く→モード切替。

## ループ開始

```
1. git pull origin v2-simulation
2. docs/issues.md を読んで、自分の担当で未着手の🔴を1つ選ぶ
3. issues.md に「→ 窓2が対応中」と追記してcommit+push
4. 仕様書を参照して実装
5. npm run build でコンパイル確認
6. Playwright MCP でブラウザを開いて:
   - browser_navigate http://localhost:3000
   - browser_click でカードをクリック
   - browser_take_screenshot でプロフィールパネル確認
   - browser_click でモード切替ボタンを押す
   - browser_take_screenshot で遷移確認
7. スクショ分析 → 問題あれば修正、新しい問題はissues.mdに追加
8. issues.md のチェックボックスを[x]に
9. docs/feedback/integrator-{timestamp}.md にレポート
10. git add + commit + push
11. Step 1に戻る
```

commit前に必ずgit pull。components/は窓1の担当。
窓1が作ったコンポーネントにstoreを繋ぐのがメイン仕事。

始めて。
