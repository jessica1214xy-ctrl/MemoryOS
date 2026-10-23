# 页面覆盖：个人知识库 `/knowledge`

> 检索规则：先读 `../MASTER.md`，本文件为页面级差异与 5 态覆盖。

## 布局
- 中央区：顶部自然语言搜索栏（`Search` 16px + 输入「问问你的记忆」）+ 结果网格（知识卡）。
- 知识卡：`bg-surface border border-border radius-lg p-5`；标题（`text-2xl font-semibold`）+ 摘要（`text-foreground-2`）+ 来源设备徽章（Lucide 图标 + 文案 pill）+ 反向链接计数（`Link` 16px）。
- 每卡左上 2px 蓝→绿细线标记（AI 提炼标识，仅当内容由 AI 归纳时出现）。

## 关键组件
- 搜索栏、知识卡、来源设备徽章、反向链接、空/错/边界态提示。

## 5 态覆盖
| 状态 | 设计 |
|---|---|
| Loading | 搜索中：骨架卡（3 张 shimmer，200ms）+ 输入栏 `LoaderCircle spin` |
| Empty | 引导卡：`Brain` 图标 + 文案「用自然语言问问你的记忆，例如『我上周和导师聊了什么』」+ 3 个示例提问 chips（点击填入搜索栏）；无「Welcome to」占位 |
| Error | 检索失败：卡片 `AlertTriangle` + 错误分类（模型/网络/权限）+ 「重试」+ 降级（展示最近本地缓存片段） |
| Populated | 知识卡列表 + 来源归属 + 反向链接；点击卡 → 详情/原文跳转 |
| Edge | 超长摘要折叠「展开更多」；结果 >100 条分页；单条超长截断 + 「查看完整」 |

## 交互
- 搜索：输入即语义检索（debounce 300ms），回车或点示例 chip 触发 `POST /api/v1/kb/query`。
- 来源徽章：点击跳转到对应时间线条目（跨页联动）。
- hover：卡片 `border-color → primary`。

## 响应式
- 桌面：结果 2–3 列网格（gap 24px）；移动：单列；搜索栏常驻顶部 sticky。

## 验收对应（PRD §8）
- Given 用户输入自然语言问题，When 调用 `/api/v1/kb/query`，Then 返回带 `source` 引用的答案且每条引用可点击跳转来源时间线条目。
- Given 知识库为空，When 进入页面，Then 展示示例提问而非占位文案。
