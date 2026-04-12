# フィードバックループ プロトコル

## 概要
CC窓は以下のループを自律的に回し続ける。人間の介入なしで問題を発見→修正→検証する。

## ループ手順

```
┌─────────────────────────────────────────┐
│  1. DIAGNOSE（診断）                     │
│     └→ npm run build でコンパイル確認    │
│     └→ npm run dev + curl で動作確認     │
│     └→ ブラウザConsole/Networkログ取得    │
│                                          │
│  2. IDENTIFY（特定）                     │
│     └→ エラーメッセージから原因ファイル特定│
│     └→ CLAUDE.v2.md のバグリストと照合    │
│     └→ 優先度判定（🔴→🟡→🟢）           │
│                                          │
│  3. FIX（修正）                          │
│     └→ SKILLファイル参照                 │
│     └→ コード修正                        │
│     └→ git diff で変更確認               │
│                                          │
│  4. VERIFY（検証）                       │
│     └→ npm run build（コンパイル通るか）  │
│     └→ npm run dev + curl（200返すか）   │
│     └→ 修正したバグが再現しないか確認     │
│                                          │
│  5. REPORT（報告）                       │
│     └→ docs/feedback/YYYY-MM-DD-HH.md   │
│        に結果を書き出す                   │
│     └→ git commit + push                │
│                                          │
│  6. NEXT（次へ）                         │
│     └→ CLAUDE.v2.md のバグリストを更新   │
│     └→ 次の🔴バグがあればStep 1に戻る    │
│     └→ 🔴がなければ🟡に進む              │
│     └→ 全部解決したら報告して待機         │
└─────────────────────────────────────────┘
```

## 診断コマンド集

```bash
# コンパイルチェック
npx next build 2>&1 | tail -30

# dev server起動 + HTTP確認
npm run dev &
sleep 8 && curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

# .env.local確認
cat .env.local

# 最新コード取得
git pull origin v2-simulation

# 変更差分確認
git diff --stat

# TypeScriptエラー確認
npx tsc --noEmit 2>&1 | head -50
```

## レポートフォーマット

```markdown
# Feedback Report — {timestamp}

## Diagnosed
- [ ] Build: PASS/FAIL
- [ ] Dev server: HTTP {code}
- [ ] Console errors: {count}
- [ ] Network errors: {count}

## Fixed
- {ファイル名}: {何を修正したか}

## Verified
- [ ] Build passes after fix
- [ ] Dev server returns 200
- [ ] Bug no longer reproduces

## Remaining
- 🔴 {残っているcritical bugs}
- 🟡 {残っているimportant issues}

## Next Action
- {次にやること}
```

## 重要ルール

1. **1ループ = 1バグ**。複数のバグを同時に直そうとしない
2. **修正前に必ずgit stash or commit**。戻せるようにする
3. **SKILLファイルを読んでから修正**。闇雲にコードを変えない
4. **ループが3回回っても直らないバグは「STUCK」としてレポート**。人間に判断を委ねる
5. **他のCC窓が触ってるファイルは変更しない**。コンフリクト回避
6. **docs/feedback/ にレポートを残す**。作業の透明性を確保
