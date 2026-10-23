# 页面覆盖：主动提醒卡片 `/reminders`

> 检索规则：先读 `../MASTER.md`，本文件为页面级差异与 5 态覆盖。

## 布局
- 提醒以**卡片流**呈现（非侵入）：顶部「提醒」标题（`Bell` 20px）+ 待办提醒卡列表。也可作为首页时间线顶部的轻量提醒 rail（按 PRD「顶部/卡片流」二选一，默认独立页 + 首页 rail 共用组件）。
- 提醒卡：`bg-surface border border-border radius-lg p-5`；左上 2px 蓝→绿细线标记（主动提醒正向信号）；含：上下文回顾（「你 3 天前和导师聊到 X」，`text-foreground-2`）+ 推荐行动 + 操作区。

## 关键组件
- 提醒卡、上下文回顾文本、操作按钮组（跟进 / 稍后 / 忽略）、状态徽标。

## 状态与配色语义
- 正向/待办：`text-ai` 细线标记 + 主按钮「跟进」(`bg-primary`)。
- 稍后：`warn` 琥珀，`AlarmClock` 图标，「稍后」(`border-border text-foreground`)。
- 忽略：`BellOff` 图标，次级 ghost 按钮。

## 5 态覆盖
| 状态 | 设计 |
|---|---|
| Loading | 提醒卡骨架（2 张 shimmer，200ms）；轮询 `<LoaderCircle spin>` |
| Empty | 引导卡：`Bell` 图标 + 文案「暂无主动提醒，MemoryOS 会在合适时机提醒你」；可附 1 条 PM 提供的模拟引导提醒作示例 |
| Error | 提醒加载失败：`AlertTriangle` + 错误分类 + 「重试」（写回 `GET /api/v1/reminders`） |
| Populated | 提醒卡列表 + 上下文 + 操作；点击「跟进」→ 跳转到相关时间线/知识条目 |
| Edge | 提醒 >20 条折叠为「查看更早」；超长上下文截断「展开」 |

## 交互
- 「跟进」：标记 done，写回状态，卡片淡出（150ms）。
- 「稍后」：写回 `snooze` 状态，卡片移出当前视图（`POST /api/v1/reminders/:id/dismiss` 带 action=snooze）。
- 「忽略」：写回 dismiss，卡片淡出。
- 所有操作有 150ms 反馈；键盘可达（Tab + Enter/Space）。

## 响应式
- 桌面：提醒卡单列 max 720px 居中；移动：全宽卡片流，操作按钮纵向堆叠但保持 ≥44×44 触摸区。

## 验收对应（PRD §8）
- Given 提醒规则到期，When 前端拉取 `/api/v1/reminders`，Then 渲染提醒卡含上下文回顾与跟进/稍后/忽略操作。
- Given 用户点击「稍后/忽略」，When 写回状态，Then 卡片从当前视图移除且状态持久化（再次拉取不再出现）。
