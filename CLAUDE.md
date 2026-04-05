# buildinpublic.jp - Agent Instructions

## このプロジェクトとは
コミュニティのコメント1行からAIがサイトを毎回進化させる実験。
毎日のcron実行でapp/page.tsxが別物になる。
ビルドインパブリックの実験体。

## ディレクトリ構成
```
app/page.tsx          ← 毎回書き換えるメインページ
app/versions/         ← バージョン履歴ページ（触らない）
app/api/submit/       ← フォーム受信API（触らない）
state/
  current_version.json  ← 現在のバージョン情報
  comments.json         ← 今回処理するコメント一覧
  next_plan.md          ← brainスクリプトが生成した実装指示
  versions/             ← 各バージョンの記録（JSON）
scripts/brain.ts      ← AI判断エンジン（触らない）
```

## 実行時のルール（必ず守る）
1. state/next_plan.md を最初に読む
2. app/page.tsx のみを変更する
3. フォーム（コメント送信機能）は必ず残す
4. /versions へのリンクは必ず残す
5. ファイル冒頭コメントに「// v{番号} - {採用コメント}」を書く
6. 変更後は git add app/page.tsx state/ && git commit && git push まで完結させる

## 技術スタック
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase（コメントDB）
- Vercel（自動デプロイ）

## 現在の状態
state/current_version.json を参照

## 過去のバージョン
state/versions/ 以下のJSONファイルを参照

## 重要
このファイルはAIエージェントへの指示書です。
人間は直接編集しません。
