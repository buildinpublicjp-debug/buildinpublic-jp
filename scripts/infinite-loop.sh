#!/bin/bash
# 永久フィードバックループ — セッションが終わっても自動再起動
# 使い方: bash scripts/infinite-loop.sh [build|review]
# 止め方: Ctrl+C を2回、または touch scripts/.stop-loop

MODE=${1:-build}
PROJECT_DIR=~/buildinpublic-jp
STOP_FILE="$PROJECT_DIR/scripts/.stop-loop"

# 停止ファイルがあれば削除
rm -f "$STOP_FILE"

echo "=== 永久フィードバックループ開始 ==="
echo "モード: $MODE"
echo "停止方法: touch scripts/.stop-loop または Ctrl+C x2"
echo ""

LOOP_COUNT=0

while true; do
  # 停止ファイルチェック
  if [ -f "$STOP_FILE" ]; then
    echo "停止ファイル検出。ループ終了。"
    rm -f "$STOP_FILE"
    break
  fi

  LOOP_COUNT=$((LOOP_COUNT + 1))
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo ""
  echo "=== ループ #$LOOP_COUNT 開始 ($TIMESTAMP) ==="
  
  cd "$PROJECT_DIR"
  git pull origin v2-simulation 2>/dev/null

  if [ "$MODE" = "build" ]; then
    # ビルドチーム
    claude --dangerously-skip-permissions -p "
@CLAUDE.v2.md と @docs/CROSS_SECTION_DESIGN.md と @docs/issues.md を読んで。

4人のエージェントチームを作って:
リード: director（タスク管理のみ、コード書かない）
チームメイト1: builder（components/city/*, components/cross-section/*）
チームメイト2: integrator（stores/*, lib/*, app/page.tsx）
チームメイト3: artist（CSS, SVG, アニメーション）

docs/issues.md の未完了タスクを全部処理して。
各チームメイトはPlaywright MCPでブラウザ確認。
全タスク完了したらcommit+pushして終了。
" 2>&1 | tee "docs/feedback/build-loop-$LOOP_COUNT.log"

  elif [ "$MODE" = "review" ]; then
    # レビューチーム
    claude --dangerously-skip-permissions -p "
@CLAUDE.v2.md と @docs/CROSS_SECTION_DESIGN.md と @docs/issues.md を読んで。

REVIEW TEAM。ビルドチームの成果物を独立検証。贔屓なし。
3人のチーム:
リード: judge（統合レポート）
チームメイト1: ux-tester（Playwrightで3ビューポートテスト）
チームメイト2: code-reviewer（コード品質レビュー）

Playwrightでlocalhost:3000を自分で開いてスクショ撮って分析。
問題をdocs/issues.mdに#追加。コードは修正しない。
全部終わったらdocs/review-report.mdに書いてcommit+pushして終了。
" 2>&1 | tee "docs/feedback/review-loop-$LOOP_COUNT.log"
  fi

  echo ""
  echo "=== ループ #$LOOP_COUNT 完了 ==="
  echo "30秒後に次のループを開始..."
  echo "止めるには: touch scripts/.stop-loop"
  sleep 30
done

echo "=== 永久フィードバックループ終了 ==="
echo "合計ループ: $LOOP_COUNT"
