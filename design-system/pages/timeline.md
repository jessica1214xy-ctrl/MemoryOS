# 页面覆盖：跨设备统一时间线（首页）`/timeline`

> 检索规则：先读 `../MASTER.md`，本文件为页面级差异与 5 态覆盖。

## 布局
- 工作台三栏：左 Sidebar（240px，时间线项 `Clock` 选中态 `text-primary` + 左侧 2px `bg-primary` 指示）/ 中央时间线 / 右问答面板（360px，见 qa.md）。
- 中央区：顶部来源筛选 chips（5 设备：实验室电脑 `Monitor` / 手机 `Smartphone` / 平板 `Tablet` / 邮箱 `Mail` / 微信 `MessageCircle`，pill `radius-full` + 设备图标 16px + 文案，可多选）+ 按日分组标题（mono 日期）。
- 时间线条目卡：`bg-surface border border-border radius-lg p-5`；左侧设备图标 16px（按设备取色：`text-muted-foreground` 默认，选中源 `text-primary`）+ mono 时间戳（`font-mono text-muted-foreground text-sm`）+ 摘要（`text-foreground`）+ 来源标签 pill（设备图标 + 文案，`text-muted-foreground`）+ 可选「AI 提炼」徽章（`bg-ai-soft text-ai`，左上 2px 蓝→绿细线标记）。

## 关键组件
- 设备筛选 chip、时间线条目卡、日分组标题、新事件插入动画容器。

## 5 态覆盖
| 状态 | 设计 |
|---|---|
| Loading | 顶部骨架屏条目（3 条 shimmer，200ms）；轮询 `<LoaderCircle spin>` 指示同步中 |
| Empty | 引导卡：图标 `Plug` + 文案「连接你的第一个设备，开始汇聚记忆」+ 主按钮「连接设备」（`bg-primary`）；**用 PM 提供的架构师模拟引导事件作为首屏真实示例，不出现「Welcome to」占位** |
| Error | 时间线加载失败：卡片 `AlertTriangle` + 错误分类（网络/权限）+ 「重试」按钮（写回 `GET /api/v1/timeline`） |
| Populated | 真实条目渲染 + 分组 + 来源标签；新事件由 SWR 5s 轮询置顶插入（200ms slide-in） |
| Edge | 超长摘要折叠为「展开」；单日超 50 条分页/虚拟滚动；时区异常显示 UTC 偏移 |

## 交互
- 新事件入场：150–200ms `ease-out` 下滑淡入，置顶。
- 点击条目：展开详情抽屉（右侧或居中），展示原文片段 + 来源跳转。
- 筛选 chip：点击 toggle，列表即时按 `device` 过滤（客户端，无整页刷新）。

## 响应式
- 桌面（≥1024）：三栏完整。
- 平板（768–1023）：侧栏可折叠，时间线占主区。
- 移动（<768）：单列；侧栏→底部 TabBar；筛选 chips 横向滚动；右问答面板→底部上滑抽屉。

## 验收对应（PRD §8）
- Given 新事件写入 timeline_events，When 前端 SWR 每 5s 轮询到 `since` 后的新条目，Then 该条目以 200ms 动画置顶插入且带设备图标+时间戳。
- Given 首屏无数据，When 进入时间线，Then 渲染 PM 提供的引导事件而非占位文案。
