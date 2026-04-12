# SKILL: R3F_CITY

## Mapbox + R3F 共存
Mapboxを背景DOM、R3F Canvasをoverlay。座標同期必要。

## InstancedMesh（300人を1 draw call）
tempObject/tempColorはモジュールスコープで事前生成。useFrame内でnewしない。

## LOD
300m+: Mapboxの箱のみ。100-300m: Instanced建物。30-100m: テクスチャ追加。30m未満: 精密モデル。

## 注意
- ブルームはSelectiveBloom
- シャドウマップ使わない
- useFrame内でsetStateしない
