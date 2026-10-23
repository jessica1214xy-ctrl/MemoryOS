# MemoryOS — Design System MASTER（全局设计源）

> 持久化模式：Master + Overrides。设计某页面时先读本文件，再查 `pages/<page>.md`（存在则覆盖对应字段）。
> 关联：`../DESIGN.md`（9 节人类可读契约）、`design-tokens.json`、`design-tokens.css`。
> 更新规则：禁止整篇重写，只追加/修正条目；变更须在末尾变更记录表追加一行。

---

## A. 全局 Token（浅色为主，深色见 `.dark` 块）

### 颜色（A1 身份 + A2 语义）
```
--background        #f8fafc   --surface           #ffffff
--surface-2         #f1f5f9   --foreground        #0f172a
--foreground-2      #334155   --muted-foreground  #64748b
--border            #e2e8f0   --border-strong     #cbd5e1
--primary           #1a56db   --primary-hover     #1545a8   --primary-foreground #ffffff
--interactive       #3b82f6   --interactive-hover #2563eb
--ai                #10b981   --ai-hover          #059669   --ai-foreground     #ffffff  --ai-soft #ecfdf5
--accent-soft       #eff6ff
--warn              #d97706   --warn-foreground   #ffffff
--destructive       #dc2626   --destructive-foreground #ffffff
--ring              #1a56db
```
深色（`[data-theme="dark"]`）：background `#0b1120` / surface `#0f172a` / surface-2 `#1e293b` / foreground `#f8fafc` / foreground-2 `#cbd5e1` / muted-foreground `#94a3b8` / border `#1f2937` / border-strong `#334155` / primary `#3b82f6` / interactive `#60a5fa` / ai `#34d399` / warn `#fbbf24` / destructive `#f87171` / ring `#3b82f6`。

### 字体（A1 身份）
```
--font-sans: "Manrope", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
--font-mono: "JetBrains Mono", "Noto Sans SC", ui-monospace, monospace
```
字号：`--text-xs`0.75rem / `sm`0.875 / `base`1 / `lg`1.125 / `xl`1.25 / `2xl`1.5 / `3xl`1.875 / `4xl`2.25
字重：`--weight-regular`400 / `medium`500 / `semibold`600 / `bold`700
行高：`--leading-tight`1.2 / `snug`1.35 / `normal`1.5 / `relaxed`1.65
字距：`--tracking-tight`-0.01em / `normal`0 / `caps`0.06em

### 间距 / 圆角 / 阴影 / 动效（A2 结构）
```
间距: --space-1 4 / 2 8 / 3 12 / 4 16 / 5 20 / 6 24 / 8 32 / 10 40 / 12 48 / 16 64
圆角: --radius-sm 6 / md 8 / lg 12 / xl 16 / full 9999px   (禁止 ≥24)
阴影: --shadow-xs 0 1px 2px rgba(15,23,42,.04)
      --shadow-sm 0 1px 3px rgba(15,23,42,.06),0 1px 2px rgba(15,23,42,.04)
      --shadow-md 0 4px 12px rgba(15,23,42,.08)      (Modal/Toast)
      --shadow-lg 0 12px 32px rgba(15,23,42,.12)     (Command Palette)
动效: --motion-fast 150ms / --motion-base 200ms / --motion-slow 300ms
      --ease-standard cubic-bezier(0.2,0,0,1) / --ease-out cubic-bezier(0.16,1,0.3,1)
层级: --z-base 0 / --z-dropdown 1000 / --z-sticky 1100 / --z-modal 1200 / --z-toast 1300
```

### 布局
```
--container-max 1200px / --container-narrow 720px
--nav-width 240px / --panel-width 360px
断点: sm 640 / md 768 / lg 1024 / xl 1280
```

### 图标（P0 锁定）
- 库：**lucide-react**（MIT，纯 SVG 线性）；禁止 emoji；禁止混用 Tabler/Heroicons/Radix。
- 尺寸：**仅 16 / 20 / 24 px**（组件 `size` 属性）。
- 描边：`stroke-width 1.75`，`currentColor`。
- 着色：Tailwind 文本色类（`text-foreground` / `text-muted-foreground` / `text-primary` / `text-ai` / `text-destructive`），**不写死 fill**。
- 逃逸口：Lucide 缺某图标时，仅在 `components/icons/` 内补手绘 SVG 组件（仍 SVG、仍无 emoji），不引入第二库。

| 语义 | Lucide | 档 |
|---|---|---|
| 时间线 | Clock | 20 |
| 提醒 | Bell | 20/24 |
| 知识库 | Brain / BookOpen | 20 |
| 搜索 | Search | 16/20 |
| 设备·实验室电脑 | Monitor | 16/20 |
| 设备·手机 | Smartphone | 16/20 |
| 设备·平板 | Tablet | 16/20 |
| 设备·邮箱 | Mail | 16/20 |
| 设备·微信 | MessageCircle（默认；自定义 SVG 为纯替换） | 16/20 |
| 问答助手 | MessageSquare | 20 |
| 同步 | RefreshCw | 16/20 |
| 来源标签 | Tag | 16 |
| 稍后 | Clock / AlarmClock | 16/20 |
| 忽略 | BellOff | 16/20 |
| 归档 | Archive | 16/20 |
| 复制 | Copy | 16/20 |
| 来源引用 | Link | 16 |
| 连接设备 | Plug / Cable | 20/24 |
| 加载 | LoaderCircle | 16/20 |
| 成功 | Check / CheckCheck | 16/20 |
| 警告/错误 | AlertTriangle | 16/20 |
| 发送 | ArrowUp | 20 |
| 设置 | Settings | 20 |
| 关闭 | X | 16/20 |
| AI 标识 | 2px 蓝→绿细线（CSS，非图标） | — |

---

## B. 设计纪律（全页通用）
- 每屏强调蓝（--primary/--interactive）≤2 处；绿（--ai）仅 AI 标记 / 成功 / 提醒正向。
- 卡片：1px `--border` + 表面色；hover 仅变边框色；无大模糊阴影；禁彩色左边框；禁 ≥24px 圆角。
- 唯一渐变：2px 蓝→绿 AI 标记细线，绝不做背景/Hero。无紫→粉渐变。
- 文案：真实示例（论文标注、与导师对话回顾），禁「Welcome to」/ 虚构指标。
- 动效 150ms 收敛，无弹跳缓动；支持 `prefers-reduced-motion`。
- 5 态（Loading/Empty/Error/Populated/Edge）每页覆盖。

---

## C. 页面索引（覆盖见 pages/）
- `pages/timeline.md` — 跨设备统一时间线（首页）
- `pages/knowledge-base.md` — 个人知识库
- `pages/reminders.md` — 主动提醒卡片
- `pages/qa.md` — 自然语言问答入口

---

## 变更记录
| 日期 | 变更 | 原因 | 影响 |
|---|---|---|---|
| 2026-10-16 | 初版 MASTER 建立 | Phase 2 交付 | 全局 Token + 图标映射 |
| 2026-10-16 | 配色锁定 PRD §12 精确值 | 单一事实源 | 品牌蓝 / AI 绿 |
| 2026-10-16 | 微信图标 = MessageCircle 默认 | 架构师确认 Lucide 无微信字形 | 设备源映射 |
| 2026-10-16 | 图标名校正：Loader2→LoaderCircle、Quote→Link | 架构师按已装 Lucide 0.5xx 核验，Loader2 为弃用别名 | 图标映射表 / design-tokens.json |
