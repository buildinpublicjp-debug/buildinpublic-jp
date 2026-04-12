# 問題リスト — 全CC窓が読み書きする

*最終更新: 2026-04-12 15:57 (窓3 reviewer)*
*仕様書: docs/CROSS_SECTION_DESIGN.md*

## 🔴 CRITICAL（まず動くようにする）

- [ ] #001 app/page.tsxをR3F/3DTilesからデフォルメ断面図ビューに書き換え → 未着手
- [ ] #002 components/city/CityMap.tsx 新規作成 — 渋谷・新宿・六本木のデフォルメSVGマップ → 窓1が対応中
- [ ] #003 components/cross-section/BuildingSection.tsx 新規作成 — X線断面図ビル → 未着手
- [ ] #004 components/cross-section/AvatarPair.tsx 新規作成 — デフォルメアバター2人 → 未着手
- [ ] #005 components/cross-section/Room.tsx 新規作成 — 部屋+家具（バー、ホテル、レストラン） → 未着手
- [x] #006 stores/gameStore.ts にviewMode追加（'god' | 'cross-section' | 'scene'） → 窓2が修正済み

## 🟡 IMPORTANT（体験を完成させる）

- [ ] #007 ディゾルブ遷移（GOD VIEW → 断面図）— Framer Motion → 未着手
- [ ] #008 感情オーラSVGアニメーション（2人の間で色が混ざる） → 未着手
- [ ] #009 体の色変化（ほてり表現） → 未着手
- [ ] #010 WATCH/PLAYモード切替UI → 窓2がstore側完了（interactionMode追加）、UI側は窓1待ち
- [ ] #011 BGM+環境音レイヤー（Tone.js or HTML5 Audio） → 未着手
- [ ] #012 リアルタイム時刻連動（昼夜の背景変化） → 未着手
- [ ] #013 ミニマップにカップルのドット表示 → 未着手

## 🟢 NICE TO HAVE（磨き上げ）

- [ ] #014 ランドマークSVG（109、ゴールデン街、六本木ヒルズ） → 窓4が対応中
- [ ] #015 デートの記憶タイムライン（ディズニー、上野公園等） → 未着手
- [ ] #016 PLAYモードの選択肢UI（ギャルゲー統合） → 未着手
- [ ] #017 モバイルレスポンシブ対応 → 未着手
- [ ] #018 ローディングアニメーション → 未着手
- [ ] #019 [窓3発見] .nextキャッシュ不整合でdev server起動時にmiddleware-manifest.jsonエラー → .next削除で回避。根本原因は古いビルドキャッシュ → 未着手
- [ ] #020 [窓3発見] メインビューのドットが巨大すぎる（3Dドットがビューポートの10%以上を占有） → 未着手
- [ ] #021 [窓3発見] モバイル375x812でミニマップが画面の約50%を占有。レスポンシブ調整必要 → 未着手
