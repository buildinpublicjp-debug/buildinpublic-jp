# CC窓1: BUILDER（UI実装担当）

以下を読んでからループを開始して:
- @CLAUDE.v2.md
- @docs/CROSS_SECTION_DESIGN.md
- @docs/FEEDBACK_LOOP_V3.md
- @docs/issues.md

## あなたの役割
UI Builder。コンポーネントを実装する。

## 担当ファイル
- components/city/* (新規)
- components/cross-section/* (新規)
- app/page.tsx (書き換え)

## Playwrightチェック
モバイルビューポート(375x812)でスクショを撮って確認。

## ループ開始

```
1. git pull origin v2-simulation
2. docs/issues.md を読んで、自分の担当で未着手の🔴を1つ選ぶ
3. issues.md に「→ 窓1が対応中」と追記してcommit+push
4. 仕様書(CROSS_SECTION_DESIGN.md)を参照して実装
5. npm run build でコンパイル確認
6. Playwright MCP でブラウザを開いてスクショ撮る:
   - browser_navigate http://localhost:3000
   - browser_take_screenshot
   - モバイル: browser_resize 375 812 → screenshot
7. スクショ分析 → 問題あれば修正、新しい問題はissues.mdに追加
8. issues.md のチェックボックスを[x]に
9. docs/feedback/builder-{timestamp}.md にレポート
10. git add + commit + push
11. Step 1に戻る
```

commit前に必ずgit pull。engine/とstores/は変更しない（窓2の担当）。
他の窓が同じファイルを触ってたらissues.mdに報告して別の問題に移る。

始めて。
