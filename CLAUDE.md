# buildinpublic.jp - Agent Instructions (Harness v2)

## ミッション
コミュニティのコメント1行からAIがサイトを毎回進化させる実験。
毎日のcron実行でapp/page.tsxが別物になる。

---

## GUIDE（実行前に読む指示書）

### 現在の状態を確認せよ
まず以下を順番に読む:
1. `state/current_version.json` - 今どのバージョンか
2. `state/next_plan.md` - 今回の実装指示（brainが生成済み）
3. `state/versions/` の最新JSON - 前回何をやったか

### 変更してよいファイル
```
app/page.tsx          ← ここだけ変更する
state/                ← commitに含める
```

### 絶対に変更してはいけないファイル
```
app/versions/page.tsx
app/api/submit/route.ts
app/layout.tsx
scripts/brain.ts
.github/
CLAUDE.md
```

### 実装ルール
1. `state/next_plan.md` の指示を完全に読み、その方向性で実装する
2. Next.js 14 App Router + Tailwind CSS のみ使う
3. フォーム（コメント送信）は必ず残す
4. `/versions` へのリンクは必ず残す
5. ファイル冒頭に `// v{番号} - {採用コメント}` を書く
6. 外部ライブラリを新たにインストールしない（package.jsonを変更しない）

---

## SENSOR（実行後に自己確認せよ）

実装が終わったら、commitする前に以下を自分でチェックする:

- [ ] app/page.tsx 以外のファイルを変更していないか？
- [ ] フォームが残っているか？（`fetch('/api/submit'` が含まれているか）
- [ ] `/versions` へのリンクが残っているか？
- [ ] TypeScriptの型エラーがないか（明らかなものだけでよい）
- [ ] ファイル冒頭にバージョンコメントがあるか？

全てOKならcommitしてpushする。

---

## commitの手順（正確にこの通りにやる）

```bash
git config user.name "buildinpublic-bot"
git config user.email "bot@buildinpublic.jp"
git add app/page.tsx state/
git commit -m "evolve: v$(node -e "console.log(require('./state/current_version.json').number)")"
git push
```

---

## 技術スタック
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase（コメントDB）
- Vercel（自動デプロイ、pushで自動発火）

---

## エントロピー管理
このファイルはハーネスの指示書。モデルが更新されるたびに最適化される。
過剰な実装より、シンプルで動く実装を優先する。
