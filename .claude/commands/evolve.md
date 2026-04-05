# /evolve - buildinpublic.jp 進化コマンド

このコマンドを実行したら、以下のステップを順番に完全に実行してください。
途中で止まらず、最後のgit pushまで一気に完結させてください。

---

## STEP 1: 現在の状態を把握する

以下を順番に読む:
- `state/current_version.json`
- `state/versions/` の最新JSONファイル（あれば直近2件）
- `app/page.tsx` の現在の内容

---

## STEP 2: コメントを読む

`state/comments.json` を読む（今回処理する新規コメント）
`state/all_comments.json` があれば読む（全コメント履歴）

コメントがなければ「コメントなし」と報告して終了する。

---

## STEP 3: 集合的無意識を読み取る（深く考える）

全コメントを横断的に分析して、以下を自分の中で整理する:

- コミュニティが**表面上は言っていない**が底に流れている本質的な欲求は何か？
- 個別リクエストの文字通りの意味ではなく、「このコミュニティは何を本当に求めているか」
- 今のバージョンとのギャップで最大のインパクトが出る方向はどこか

---

## STEP 4: 100案生成 → スコアリング → 1案決定

100個の進化の方向性を内部的に生成して、以下の基準でスコアをつける:

**高得点（これが重要）:**
- スクショしたくなるビジュアル → SNS拡散力
- 「なんでこうなった」と言いたくなる → コメント誘発力
- 前バージョンと全然違う → ギャップが大きい
- 一言タイトルになる（「AIがサイトを告白画面にした」等）

**低得点:**
- 色変え・フォント変えだけ
- 説明しないと伝わらない
- 前バージョンと似ている

最高スコアの1案に決め込む。

---

## STEP 5: プランを出力する（人間が確認できるように）

以下のフォーマットで出力する:

```
### コミュニティの集合的意志
（読み取った本質的な欲求・空気感）

### 採用案
- 方向性: （一言タイトル）
- 拡大解釈: （どう解釈・発展させたか）
- スコア: XX / 100
- 動画タイトル案: 「AIがbuildinpublic.jpを〇〇にした」

### 実装プラン
（何をどう作るか）
```

---

## STEP 6: CLAUDE.md を読む

`CLAUDE.md` を読んで実装ルールを確認する。

---

## STEP 7: app/page.tsx を実装する

STEP 4で決めた方向性を、CLAUDE.mdのルールに従って実装する。

**守ること:**
- `app/page.tsx` のみ変更
- `fetch('/api/submit'` のフォームを残す
- `/versions` へのリンクを残す
- `package.json` を変更しない
- ファイル冒頭に `// v{番号} - {方向性}` を書く

**自由にやること:**
- レイアウト・配色・タイポグラフィ・アニメーション全て自由
- 「見た瞬間になんでこうなったと言いたくなる」実装を目指す

---

## STEP 8: state/ を更新する

`state/current_version.json` のnumberを+1して更新する。
`state/versions/v{番号}.json` を作成して以下を記録:
```json
{
  "number": "v{番号}",
  "comment": "採用した方向性",
  "reason": "判断理由",
  "score": XX,
  "video_title": "動画タイトル案",
  "date": "今日の日付"
}
```

---

## STEP 9: セルフチェック

- [ ] app/page.tsx 以外を変更していない
- [ ] fetch('/api/submit' が存在する
- [ ] /versions へのリンクが存在する
- [ ] 前バージョンと明らかに違う見た目になっている

---

## STEP 10: commit & push

```bash
git config user.name "buildinpublic-bot"
git config user.email "bot@buildinpublic.jp"
git add app/page.tsx state/
git commit -m "evolve: v$(node -e "console.log(require('./state/current_version.json').number)")"
git push
```

pushが完了したら「完了」と報告する。
