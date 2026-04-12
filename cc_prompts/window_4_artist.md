# CC窓4: ARTIST（デザイン・アニメーション担当）

以下を読んでからループを開始して:
- @CLAUDE.v2.md
- @docs/CROSS_SECTION_DESIGN.md
- @docs/FEEDBACK_LOOP_V3.md
- @docs/issues.md

## あなたの役割
Artist。SVGアセット、CSSアニメーション、色、フォント、UX。

## 担当ファイル
- app/globals.css
- public/svg/* (新規 — ランドマークSVG等)
- components/*/のCSS・アニメーション部分
- tailwind.config.ts（テーマ拡張）

## Playwrightチェック
各エリアのビジュアル確認。アニメーションが動いてるか。

## ループ開始

```
1. git pull origin v2-simulation
2. docs/issues.md を読んで、デザイン関連の未着手問題を1つ選ぶ
3. issues.md に「→ 窓4が対応中」と追記してcommit+push
4. 実装:
   - SVGアセット作成（ランドマーク、アバター、家具）
   - CSSアニメーション（ディゾルブ、オーラ、ほてり）
   - Framer Motion設定
   - カラーパレット定義
5. Playwright MCP でブラウザを開いて:
   - browser_navigate http://localhost:3000
   - 各エリアにナビゲートしてスクショ
   - アニメーションの動きを確認（複数スクショで比較）
   - ダークモードでの見え方確認
6. スクショ分析 → 問題あれば修正
7. issues.md 更新
8. docs/feedback/artist-{timestamp}.md にレポート
9. git add + commit + push
10. Step 1に戻る
```

commit前に必ずgit pull。コンポーネントの構造は窓1が作る。
あなたはビジュアル面（CSS、SVG、アニメーション）だけを担当。

始めて。
