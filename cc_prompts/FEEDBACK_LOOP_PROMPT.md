# CC窓起動プロンプト — 自律フィードバックループモード

以下を全CC窓の冒頭に貼る。これでCC窓が自律的にバグを潰し続ける。

---

## 起動プロンプト（コピペ用）

```
@CLAUDE.v2.md と @docs/FEEDBACK_LOOP.md を読んで。

フィードバックループモードで動いて。以下を自律的に繰り返して:

1. git pull origin v2-simulation
2. npx tsc --noEmit でTypeScriptエラーを確認
3. npm run build でビルド確認
4. npm run dev でdev server起動
5. curl で HTTP 200 確認
6. CLAUDE.v2.md の🔴バグリストから1つ選んで修正
7. 修正後に再度 build + dev 確認
8. 結果を docs/feedback/ にレポート
9. git add + commit + push
10. 次の🔴バグへ。🔴がなくなったら🟡へ。

3回ループしても直らないバグは「STUCK」と報告して次に進んで。
修正するファイルは事前にgit diffで変更箇所を確認してからコミット。
他の窓が同じファイルを触ってる可能性があるから、コミット前にgit pullして。

今の最優先バグ:
1. Google Mapsエラーメッセージが画面に表示される → エラー元を特定して消す
2. カード選択時にカメラが壊れる → ECEF法線方向に上空50mにflyTo
3. 人のドットが巨大 → ジオメトリサイズを1/50に

始めて。
```
