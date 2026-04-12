# 問題リスト — 全CC窓が読み書きする

*最終更新: 2026-04-12 16:35 (窓3 reviewer — loop2)*
*仕様書: docs/CROSS_SECTION_DESIGN.md*

## 🔴 CRITICAL（まず動くようにする）

- [x] #001 app/page.tsxをR3F/3DTilesからデフォルメ断面図ビューに書き換え → 窓2が修正済み
- [x] #002 components/city/CityMap.tsx 新規作成 — 渋谷・新宿・六本木のデフォルメSVGマップ → 窓1が修正済み
- [x] #003 components/cross-section/BuildingSection.tsx 新規作成 — X線断面図ビル → 窓1が修正済み
- [x] #004 components/cross-section/AvatarPair.tsx 新規作成 — デフォルメアバター2人 → 窓1が修正済み
- [x] #005 components/cross-section/Room.tsx 新規作成 — 部屋+家具（バー、ホテル、レストラン） → 窓1が修正済み
- [x] #006 stores/gameStore.ts にviewMode追加（'god' | 'cross-section' | 'scene'） → 窓2が修正済み

## 🟡 IMPORTANT（体験を完成させる）

- [x] #007 ディゾルブ遷移（GOD VIEW → 断面図）— CSS transition → 窓1が修正済み（ViewTransition.tsx + page.tsx統合）
- [x] #008 感情オーラSVGアニメーション（2人の間で色が混ざる） → 窓1がAvatarPair.tsx内で実装済み（aura-merge gradient + animate）
- [x] #009 体の色変化（ほてり表現） → 窓1がAvatarPair.tsx内で実装済み（PHASE_SKIN blush + ほっぺアニメ）
- [x] #010 WATCH/PLAYモード切替UI → 窓2が修正済み（store + page.tsx統合）
- [x] #011 BGM+環境音レイヤー（Web Audio API） → 窓2が修正済み（lib/audio.ts + page.tsx統合）
- [x] #012 リアルタイム時刻連動（昼夜の背景変化） → 窓2が修正済み（timeSync + page.tsx統合）
- [x] #013 ミニマップにカップルのドット表示 → CityMap(GOD VIEW)でカップルドット表示済み。断面図移行で旧Minimap不要

## 🟢 NICE TO HAVE（磨き上げ）

- [x] #014 ランドマークSVG（109、ゴールデン街、六本木ヒルズ） → 窓4が修正済み（SVG3点+カラーパレット+アニメーション基盤）
- [ ] #015 デートの記憶タイムライン（ディズニー、上野公園等） → 窓2が対応中（data/dateMemories.ts）
- [x] #016 PLAYモードの選択肢UI（ギャルゲー統合） → 窓1が修正済み（PlayChoices.tsx — フェーズ別3択+リアクション）
- [x] #017 モバイルレスポンシブ対応 → 窓4が修正済み（CSS media queries + safe area + タッチフィードバック）
- [x] #018 ローディングアニメーション → 窓4が修正済み（SVG+CSSアニメーション）
- [ ] #019 [窓3発見] .nextキャッシュ不整合でdev server起動時にmiddleware-manifest.jsonエラー → .next削除で回避。根本原因は古いビルドキャッシュ → 未着手
- [x] #020 [窓3発見] メインビューのドットが巨大すぎる → CityMap移行で解消
- [x] #021 [窓3発見] モバイルでミニマップ占有 → CityMap移行で解消（ミニマップ不要に）
- [ ] #022 [窓3発見] CityMapのペア数が仕様と不一致 — SHIBUYA 99pairs表示。MVP仕様は渋谷4組+新宿3組+六本木3組=10組だが全150組表示中 → 未着手
- [ ] #023 [窓3発見] SHIBUYAエリアのドットが密集しすぎて個別識別不能。ドット間の距離が足りない → 未着手
- [ ] #024 [窓3発見] ドットクリック→断面図遷移の動作未確認（Playwright MCP切断のため）→ 次ループで検証
