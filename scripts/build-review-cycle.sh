#!/bin/bash
# ビルド→レビュー交互ループ
# ビルドチームが作る→レビューチームが問題見つける→ビルドチームが直す→繰り返し
# 使い方: bash scripts/build-review-cycle.sh
# 止め方: touch scripts/.stop-loop

PROJECT_DIR=~/buildinpublic-jp
STOP_FILE="$PROJECT_DIR/scripts/.stop-loop"
rm -f "$STOP_FILE"

CYCLE=0

echo "=== ビルド⇄レビュー 交互ループ開始 ==="
echo "止め方: touch scripts/.stop-loop"

while true; do
  if [ -f "$STOP_FILE" ]; then
    echo "停止。"
    break
  fi

  CYCLE=$((CYCLE + 1))
  echo ""
  echo "========================================"
  echo "  サイクル #$CYCLE — ビルドフェーズ"
  echo "========================================"
  
  bash "$PROJECT_DIR/scripts/infinite-loop.sh" build
  
  if [ -f "$STOP_FILE" ]; then break; fi
  
  echo ""
  echo "========================================"
  echo "  サイクル #$CYCLE — レビューフェーズ"
  echo "========================================"
  
  bash "$PROJECT_DIR/scripts/infinite-loop.sh" review
  
  echo "サイクル #$CYCLE 完了。次のサイクルへ..."
  sleep 10
done

echo "=== 交互ループ終了。合計サイクル: $CYCLE ==="
