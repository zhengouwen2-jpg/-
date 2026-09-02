# 吸尘器 Viewer 适用场景悬停展开验证

验证日期：2026-08-30

## 结果

- 综合结果：通过（`vacuum-integration.json` 中 `pass: true`，浏览器错误数为 0）。
- 桌面端：爆炸进度超过 8% 后场景卡收拢；悬停标题展开当前场景；悬停具体卡片只显示临时预览；离开后恢复收拢。
- 持久状态：点击场景后更新 `activeSceneId`；悬停只更新 `previewSceneId`，不改变相机、爆炸进度、播放状态或模型矩阵。
- 播放状态：场景悬停期间自动爆炸动画继续运行。
- 键盘：聚焦展开、方向键切换、焦点离开后清除临时预览均通过。
- 平板：1024 x 768 横向场景带悬停展开通过。
- 手机：390 x 844 触屏点击锁定展开，点击模型画布解除锁定通过。
- 回归：懒加载、滚轮、视角、缩放、标签、装配树、全屏降级和移动端控制区均通过。

## 构建

- Vite 生产构建通过：113 个模块完成转换。
- 输出：`dist/index.html`、`dist/assets/index-BHlzO7ig.css`、`dist/assets/index-gTvpF_dQ.js`。

## 源文件完整性

- Rhino SHA-256：`EB465D5AD324F367489E0C0DCF51D77135BF7A2474DC6D8646D82436549DE021`
- GLB SHA-256：`8B225B78536430C5FE3756D2046AD0D5A5D88143154B4C2F6725F0227F5EE11E`
- 项目源 GLB 与网站内 GLB 哈希一致；Rhino 与 GLB 均未修改。

## 截图

- `vacuum-viewer-scene-hover.png`
- `vacuum-viewer-tablet.png`
- `vacuum-viewer-mobile-scene-locked.png`
- `vacuum-portfolio-desktop.png`
- `vacuum-portfolio-mobile.png`
