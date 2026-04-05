# buildinpublic.jp - Agent Instructions (Harness v3)

---

## ミッション

コミュニティの集合的意志をAIが解釈し、毎日サイトを別の何かに進化させる実験。
面白いかどうかだけが基準。機能するかより、スクショしたくなるかが重要。

---

## STEP 1: コンテキストを読む（必ず最初に実行）

以下を順番に読んで、今の状況を把握する:

1. `state/current_version.json` — 現在のバージョン番号と説明
2. `state/next_plan.md` — brainが生成した今回の方向性とプラン
3. `app/page.tsx` の現在の内容 — 既存のビジュアル言語を把握する
4. `state/versions/` の最新1〜2件 — 直近のバージョンと被らないよう確認

---

## STEP 2: 内部デザインブリーフを書く（実装前に自分用に整理する）

実装を始める前に、以下を自分の中で明確にする:

```
ターゲット: スマホで見る人（iPhone想定）
今回の方向性: （next_plan.mdから1行で）
既存ビジュアルから継承するもの: （現page.tsxから読み取る）
既存ビジュアルから脱却するもの: （今回の方向性に合わせて）
絶対に壊してはいけないもの: フォーム・/versionsリンク
クリエイティブの自由度: レイアウト・色・タイポ・アニメーション全て自由
```

---

## STEP 3: 実装する

### 何を守るか（制約 = 変えてはいけない）

- `app/page.tsx` **のみ**を変更する
- フォーム機能（`fetch('/api/submit'`）を必ず残す
- `/versions` へのリンクを必ず残す
- `package.json` を変更しない（外部ライブラリ追加禁止）
- ファイル冒頭に `// v{番号} - {方向性}` を書く

### 何は自由か（クリエイティブの余地 = 思い切りやる）

- レイアウト全体の構造
- 配色・背景・グラデーション
- タイポグラフィのサイズ・ウェイト・フォント指定
- アニメーション・トランジション
- インタラクション（ホバー・クリック・スクロール）
- コンテンツのトーン・コピー
- UIパターン（カード・モーダル・全画面・ゲームUI等）

### 実装の方針

next_plan.mdには方向性が書いてある。その**ビジュアルの感触・空気感**を実現することが目的。
プランを逐語的に実装するのではなく、プランが目指す「見た目の体験」を自分で解釈して実装する。

**良い実装**: 見た瞬間に「なんでこうなった」と言いたくなる
**悪い実装**: 色を変えただけ、フォントを変えただけ、説明しないと伝わらない

---

## STEP 4: セルフチェック（commitする前に確認）

- [ ] app/page.tsx 以外を変更していない
- [ ] `fetch('/api/submit'` が存在する
- [ ] `/versions` へのリンクが存在する
- [ ] TypeScriptエラーが明らかにないか確認した
- [ ] 直近バージョン（state/versions/最新）と明らかに違う見た目になっている

---

## STEP 5: commit & push

```bash
git config user.name "buildinpublic-bot"
git config user.email "bot@buildinpublic.jp"
git add app/page.tsx state/
git commit -m "evolve: v$(node -e "console.log(require('./state/current_version.json').number)")"
git push
```

---

## 技術スタック

- Next.js 14 (App Router) — `'use client'` を使えばReact hooksが使える
- TypeScript
- Tailwind CSS — アニメーションは `animate-*` クラスまたはインラインCSSで
- Vercel（pushで自動デプロイ）

## 変更禁止ファイル

```
app/versions/page.tsx
app/api/submit/route.ts
app/layout.tsx
app/globals.css
scripts/
.github/
CLAUDE.md
vercel.json
```
