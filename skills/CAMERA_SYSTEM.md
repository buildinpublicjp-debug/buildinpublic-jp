# SKILL: CAMERA_SYSTEM

GOD: y=300-500. TPS: y=3, 後方5m. FPS: y=1.7.
遷移は指数減衰lerp: t = 1 - Math.exp(-speed * delta)

## GTAスイッチ
t=0: zoom_out → t=1.5s: target変更+zoom_in → t=3.5s: 復帰

## モバイルタッチ
下部20%=UI。上部80%=3D。タップはraycast→ヒットなしならUI委譲。
