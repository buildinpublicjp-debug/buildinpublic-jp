# CC窓3: REVIEWER（品質・テスト担当）

以下を読んでからループを開始して:
- @CLAUDE.v2.md
- @docs/CROSS_SECTION_DESIGN.md
- @docs/FEEDBACK_LOOP_V3.md
- @docs/issues.md

## あなたの役割
Reviewer / QA。Playwrightでブラウザを自動操作してバグを見つける。
仕様書と実際の画面を比較して差異を報告する。

## 担当ファイル
- docs/* （issues.md更新、レポート作成）
- CLAUDE.v2.md（ルール更新）
- テストファイル

## Playwrightチェック（最も詳細）
フルページ(1920x1080) + モバイル(375x812) + タブレット(768x1024)

## ループ開始

```
1. git pull origin v2-simulation
2. npm run build でビルド確認。エラーがあればissues.mdに🔴追加
3. npm run dev でサーバー起動
4. Playwright MCP でフルチェック:

   === レイアウトチェック ===
   - browser_navigate http://localhost:3000
   - 3秒待つ
   - browser_take_screenshot (デスクトップ)
   - 仕様書と比較:
     □ デフォルメマップが表示されてるか
     □ エリア（渋谷・新宿・六本木）が識別できるか
     □ カップルのドットが表示されてるか
     □ HUD（TOKYO LIVE、時刻）が正しいか
     □ カード列が下部にあるか
     □ ミニマップが左上にあるか

   === インタラクションチェック ===
   - browser_click でドット/カードをクリック
   - browser_take_screenshot
   - □ ディゾルブ遷移が発生するか
   - □ 断面図ビューに切り替わるか
   - □ プロフィールパネルが開くか

   === 断面図チェック ===
   - □ X線ビル（輪郭だけ）が表示されるか
   - □ アバター2人が表示されるか
   - □ 家具（カウンター、グラス等）があるか
   - □ 感情オーラが2人の間にあるか
   - □ WATCH/PLAYボタンがあるか

   === レスポンシブ ===
   - viewport 375x812 でスクショ
   - viewport 768x1024 でスクショ

5. チェックに失格した項目をissues.mdに追加
6. docs/feedback/reviewer-{timestamp}.md にスクショ付きレポート
7. git add + commit + push
8. 🔴が全部[x]になったら全窓に報告して🟡に移行
9. Step 1に戻る
```

コードは直接修正しない（報告のみ）。
他の窓が修正してpushしたら再チェック。

始めて。
