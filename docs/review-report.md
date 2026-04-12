# Review Report — v2-simulation branch

*レビュー日: 2026-04-12*
*レビューチーム: judge (統合), ux-tester (Playwrightブラウザテスト), code-reviewer (ソースコード静的解析)*

---

## 総合判定: 🟡 要改善

基本構造は健全。TypeScriptコンパイルエラーゼロ、engine/の純粋関数ルール準拠、3D→2D移行は概ね完了。
ただし **UX上の深刻な問題が4件** あり、モバイルでの操作性が事実上破綻している。

---

## UX Test Results (Playwright MCP)

### Desktop (1280x800)
| 項目 | 結果 | 備考 |
|------|------|------|
| ページ表示 | ✅ OK | エラー画面なし |
| CityMap表示 | ✅ OK | SVGダークテーマ、同心円配置 |
| 3エリア識別 | ❌ NG | SHINJUKUラベルがSVG描画領域外(y=-27.5px) |
| ドット表示 | ✅ OK | Phase別色分け＋凡例表示 |
| コンソールエラー | ✅ なし | favicon 404のみ |
| ドットクリック→遷移 | ✅ OK | 断面図に遷移、BACKで戻れる |
| 断面図表示 | ✅ OK | ビル断面図、アバター、相性%、テキスト表示 |

### Mobile (375x812)
| 項目 | 結果 | 備考 |
|------|------|------|
| レイアウト | ✅ OK | 縦長画面に適応 |
| タッチ操作 | ❌ NG | ドットr=0.5→3.75px、44px最小推奨を大幅下回る |

---

## Code Review Results

### TypeScript Compilation
- **結果: PASS** — `npx tsc --noEmit` エラーゼロ

### CLAUDE.v2.md ルール準拠
| ルール | 状態 |
|--------|------|
| useFrame内setState禁止 | ✅ R3F不使用で該当なし |
| useFrame内new Object3D禁止 | ✅ 同上 |
| engine/にReact依存なし | ✅ 全て純粋関数 |
| OrbitControls禁止 | ✅ 該当なし |

### ファイル別の問題

#### 🔴 Critical
- **`stores/gameStore.ts:80`** — `require('../stores/peopleStore')` でCommonJS動的インポート使用。型安全性が完全に失われる（any型）。循環参照回避のためだが、イベントバスやコールバック注入で解決すべき

#### 🟡 Important
- **`app/page.tsx:12`** — `isMuted` が未使用import
- **`components/cross-section/AvatarPair.tsx:79-92`** — SVGグラデーションID(`aura-a`, `aura-b`, `aura-merge`)がハードコード。複数AvatarPairレンダリング時にID衝突（現状は1つのみなので実害なし）
- **`components/cross-section/Room.tsx:40`** — SVGグラデーションIDにタイプ名使用。同RoomTypeの複数Room同時表示でID衝突
- **`components/cross-section/ViewTransition.tsx:47`** — useEffect依存配列にchildrenが含まれ、毎レンダリングでstate更新
- **`lib/audio.ts:54,60-82`** — `playAmbientTone`で生成したOscillatorNodeが`sources`配列に追加されないため、`stopLayer('ambient')`が実質無効
- **`stores/peopleStore.ts:69`** — non-null assertion(`!`)で`undefined`を無視

#### 🟢 Nice to have
- **`app/page.tsx:63-76`** — `AREA_TO_DISTRICT`マップがコールバック内で毎回再構築（モジュールスコープに移動推奨）
- **`engine/scoring.ts`** — `calcForeplayScore`がどこからもインポートされていない（デッドコード）
- **`lib/geoUtils.ts`** — CLAUDE.v2.mdに記載あるが実ファイル不在（v2移行で不要になった可能性）

---

## 新規発見問題サマリー (#041-#048)

| # | 深刻度 | 問題 | 発見者 |
|---|--------|------|--------|
| #041 | 🔴 | SHINJUKUラベルがSVG描画領域外 | ux-tester |
| #042 | 🔴 | `/versions`リンクが存在しない（CLAUDE.md必須） | ux-tester |
| #043 | 🔴 | `fetch('/api/submit')`フォーム機能が存在しない（CLAUDE.md必須） | ux-tester |
| #044 | 🔴 | モバイルでドットのタッチターゲットが小さすぎる(3.75px) | ux-tester |
| #045 | 🔴 | gameStore.tsでrequire使用、型安全性喪失 | code-reviewer |
| #046 | 🟡 | 断面図のフロア順序が逆（1Fが最上部） | ux-tester |
| #047 | 🟡 | audio.tsのstopLayerがambientトーンに対して実質無効 | code-reviewer |
| #048 | 🟡 | デスクトップでもドットのクリック領域が小さい | ux-tester |
