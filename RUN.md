# MemoryOS 运行说明（MVP Demo）

跨设备个人记忆型 Agent —— 面向研究生的「第二大脑」：跨设备时间线 + 个人知识库 + 主动提醒。

## 启动
```bash
npm install        # 已完成
npm run dev        # 开发模式，访问 http://localhost:3000
# 或
npm run build && npm run start
```

## 已实现（三核心能力）
- **跨设备统一时间线**：实验室电脑 / 手机 / 平板 / 微信 / 邮箱 五类设备源事件归一为一条时间线，支持按设备筛选、断点「可续接」标记。数据由 `lib/seed.ts` 模拟生成（模拟多设备事件流，非真实连接器）。
- **个人知识库 + 自然语言问答**：右栏「问问你的记忆」对话框，基于个人知识库检索并**附可点击引用**（跳转原始事件）。接 CloudBase AI 网关（免密钥）；未配置时回退**演示检索回答**（界面标注「演示模式」）。
- **主动提醒卡片**：基于时间线生成「3 天前收藏未读」「该回导师邮件」等提醒，支持忽略 / 稍后 / 已处理，写回状态。
- **自动记忆卡片**：把「与导师同步 / 实验进展」沉淀为结构化记忆，可在知识库页查看、可被问答检索。

## 技术栈（Spec 锁定）
Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + lucide-react + SWR。
设计 Token 来自 `design-system/design-tokens.json`，零硬编码、Lucide 单一图标库、禁紫粉渐变。

## 接入真实大模型（可选）
设置环境变量后问答即走 CloudBase AI 网关（免密钥），无需改代码：
```bash
CLOUDBASE_AI_GATEWAY=https://<你的网关地址>   CLOUDBASE_AI_MODEL=deepseek-v3   npm run dev
```
未设置则为演示模式（基于个人知识库关键词检索 + 引用溯源）。

## 已知约束 / 发布闸门
- 隐私红线：生产环境须核验 CloudBase「不用于模型训练」书面承诺（PM 牵头的 Launch Gate，不阻塞本 MVP 构建）。
- MVP 范围：F1–F5；真实微信/邮箱连接器、知识图谱、离线等为 P1/P2。
