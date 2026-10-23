# MemoryOS DESIGN.md

> 生成日期：2026-10-16 | 设计师：颜好看 | 基于：PRD v1（§8 验收 / §12 设计约束）+ 架构规格 v1（第 5 节图标锁定）
> 三轴刻度：Variance=5 / Motion=4 / Density=4
> 品类寄存器：Product 寄存器（app UI，非营销落地页）

---

## 1. Visual Theme & Atmosphere（视觉主题与氛围）

- **视觉主题关键词**：冷静（calm）、可信（trustworthy）、连续（continuous）、个人化（personal）
- **氛围描述**：浅色优先的「第二大脑」工作台——中性灰白为底，单一品牌蓝承载交互，AI 绿仅作功能标记；用发丝边框与表面阶梯表达层级，不靠阴影与渐变堆砌。像一间安静的个人研究室，而非花哨的 AI 仪表盘。
- **对标品牌**：Mem.ai（时间线即首页 / 语义检索 / 低摩擦捕获）、Linear（单强调色 + 发丝边框 + 表面阶梯的克制纪律）、Raycast（命令面板入口 + 等宽元数据）。Reflect 的宇宙紫风因触发紫系模板味被主动排除。
- **设计语言命名**：`Calm Continuity`（平静连续性）。

---

## 2. Color Palette & Roles（色彩与角色）

> 全部色值经 Design Token 管理（见 `design-system/design-tokens.json` / `design-tokens.css`），前端禁止硬编码。唯一例外 `#fff`/`#000` 仅用于极个别语义前景，**本项目基本不使用纯黑纯白**。

### 浅色主题（主）
| Token | 值 | 角色 |
|---|---|---|
| `--background` | `#f8fafc` | 应用画布（微冷中性，非纯白） |
| `--surface` | `#ffffff` | 卡片 / 面板 |
| `--surface-2` | `#f1f5f9` | 凹陷 / 次级表面、hover 基底 |
| `--foreground` | `#0f172a` | 主文本（近黑，非 `#000`） |
| `--foreground-2` | `#334155` | 次级文本 |
| `--muted-foreground` | `#64748b` | 三级 / 元数据 |
| `--border` | `#e2e8f0` | 发丝边框 |
| `--border-strong` | `#cbd5e1` | 强分隔 |
| `--primary` | `#1a56db` | 品牌 / 交互蓝（CTA、选中态、聚焦环） |
| `--primary-hover` | `#1545a8` | 主色 hover |
| `--primary-foreground` | `#ffffff` | 主色上的前景（按钮文字） |
| `--interactive` | `#3b82f6` | 次级交互蓝（链接、实时态、同步指示） |
| `--interactive-hover` | `#2563eb` | 次级交互 hover |
| `--ai` | `#10b981` | AI 生成标识 / 成功态 / 主动提醒正向信号（绿） |
| `--ai-hover` | `#059669` | AI 绿 hover |
| `--ai-foreground` | `#ffffff` | AI 绿上的前景 |
| `--ai-soft` | `#ecfdf5` | AI 绿淡底（标记区背景） |
| `--accent-soft` | `#eff6ff` | 主色淡底（选中 / 激活行） |
| `--warn` | `#d97706` | 待跟进 / 稍后提醒（琥珀） |
| `--warn-foreground` | `#ffffff` | 琥珀上的前景 |
| `--destructive` | `#dc2626` | 删除 / 错误（仅语义） |
| `--destructive-foreground` | `#ffffff` | 危险色上的前景 |
| `--ring` | `#1a56db` | 焦点环（= 主色） |

### 深色主题（次，表面阶梯非纯黑）
| Token | 值 |
|---|---|
| `--background` | `#0b1120` |
| `--surface` | `#0f172a` |
| `--surface-2` | `#1e293b` |
| `--foreground` | `#f8fafc` |
| `--foreground-2` | `#cbd5e1` |
| `--muted-foreground` | `#94a3b8` |
| `--border` | `#1f2937` |
| `--border-strong` | `#334155` |
| `--primary` | `#3b82f6` |
| `--primary-hover` | `#60a5fa` |
| `--interactive` | `#60a5fa` |
| `--ai` | `#34d399` |
| `--ai-hover` | `#10b981` |
| `--warn` | `#fbbf24` |
| `--destructive` | `#f87171` |
| `--ring` | `#3b82f6` |

### 配比与纪律
- 中性色 80–90% / 品牌蓝 ≤8% / 语义绿+琥珀+红 ≤5%。
- **每屏强调蓝（--primary / --interactive）≤2 处**（仅 CTA 或选中态）；绿（--ai）仅作 AI 内容标记与成功/提醒正向信号，不抢戏。
- **唯一渐变**：AI 生成内容块 / 主动提醒卡的 2px 蓝→绿细线标记（`--primary`→`--ai`），纯功能标识，**绝不做背景 / Hero 填充**。无紫→粉渐变（P0 红线）。

---

## 3. Typography（排版）

- **字体栈**
  - `--font-sans`（display + body 单字族靠字重分层）：`"Manrope", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
  - `--font-mono`（时间戳 / 设备来源 / Token 计数）：`"JetBrains Mono", "Noto Sans SC", ui-monospace, monospace`
  - 中文由 `Noto Sans SC` 回退覆盖（微信 / 中文碎片必备）。
  - 选型说明：避开 Inter / Plus Jakarta Sans 等训练数据默认 monoculture；Manrope 现代、微圆角、小字号清晰、带温度；JetBrains Mono 承载时间线精确元数据。
- **字号阶梯（8 级，px / rem）**：`--text-xs` 12/0.75 · `--text-sm` 14/0.875 · `--text-base` 16/1 · `--text-lg` 18/1.125 · `--text-xl` 20/1.25 · `--text-2xl` 24/1.5 · `--text-3xl` 30/1.875 · `--text-4xl` 36/2.25
- **字重（3 级 + 展示）**：400 正文 / 500 标签与次级 / 600 标题与强调 / 700 展示型大标题（克制使用）
- **行高**：tight 1.2（大标题）/ snug 1.35（小标题）/ normal 1.5（正文）/ relaxed 1.65（长文阅读）
- **字距**：标题 `-0.01em`（负字距）；ALL CAPS 标签 `≥0.06em`；正文 `0`。
- **正文基准**：15–16px / 行高 1.5–1.6；中文正文 ≥16px。

---

## 4. Components（组件规范）

> 全部组件以 Tailwind v4 + shadcn 兼容 Token 命名实现，使 `text-muted-foreground` / `text-primary` 等类直接解析（见 `design-tokens.css`）。

- **Button**
  - Primary：`bg-primary text-primary-foreground`，radius `--radius-md`(8px)，padding 10px 16px；hover `bg-primary-hover`。
  - Secondary：`bg-transparent border border-border text-primary`；hover `bg-accent-soft`。
  - Ghost：`bg-transparent text-foreground`；hover `bg-surface-2`。
  - Destructive：`bg-destructive text-destructive-foreground`。
  - 状态：default / hover / focus-visible(`--ring` 3px 环) / active(scale 0.98) / disabled(opacity 0.5, 禁点) / loading(内嵌 `LoaderCircle` 旋转)。
- **Input / Search**
  - `bg-surface border border-border radius-md`；focus `border-primary + ring`；error `border-destructive + ring-destructive`；disabled `bg-surface-2 text-muted-foreground`。
  - 必须有可见 `<label>`（或 aria-label），占位符不得替代标签。
- **Card（记忆单元 / 知识卡 / 提醒卡）**
  - `bg-surface border border-border radius-lg(12px) p-5`；**无默认大模糊阴影**（反幽灵卡）。
  - hover：仅 `border-color → primary`（或 `--border-strong`）。
  - selected：`border-primary + bg-accent-soft`。
  - **禁止彩色左边框**（AI 反模式 #1）。
- **Navigation**
  - 桌面：左侧 Sidebar（240px，`--nav-width`），含 时间线 / 记忆 / 问答 + 设备连接；选中项 `text-primary` + 左侧 2px `bg-primary` 指示条。
  - 移动：底部 TabBar（≤4 项：时间线 / 知识库 / 提醒 / 问问），每项图标 24px + 文字 10px，触摸区 ≥44×44px。
- **Modal / Command Palette / Toast**
  - 仅此三类可用轻量 `shadow-md/lg`（其余靠边框）。
  - 命令面板（问问入口）：居中浮层，输入 + 实时结果，Esc 关闭，支持键盘上下选择。
- **Badge / Tag / Avatar**
  - 来源徽章：`pill(9999px) border-border text-muted-foreground`，内附设备 Lucide 图标 16px。
  - Avatar：圆形（`radius-full`），首字母或渐变占位，**不用 emoji**。
- **图标**：统一 **Lucide（lucide-react）**，尺寸仅 16/20/24px，stroke 1.75，`currentColor` 继承 Tailwind 文本色类。详见 §4 图标映射与 `MASTER.md`。

### 图标映射（语义 → Lucide 名，设计稿→代码 1:1）
| 语义 | Lucide | 尺寸档 |
|---|---|---|
| 时间线 | `Clock` | 20 |
| 主动提醒 | `Bell` | 20/24 |
| 知识库 | `Brain` / `BookOpen` | 20 |
| 搜索 | `Search` | 16/20 |
| 设备·实验室电脑 | `Monitor` | 16/20 |
| 设备·手机 | `Smartphone` | 16/20 |
| 设备·平板 | `Tablet` | 16/20 |
| 设备·邮箱 | `Mail` | 16/20 |
| 设备·微信 | `MessageCircle`（默认；架构师若提供手绘 SVG 逃逸口则纯替换） | 16/20 |
| 问答助手 | `MessageSquare` | 20 |
| 跨设备同步 | `RefreshCw` | 16/20 |
| 来源标签 | `Tag` | 16 |
| 稍后提醒 | `Clock` / `AlarmClock` | 16/20 |
| 忽略提醒 | `BellOff` | 16/20 |
| 归档 | `Archive` | 16/20 |
| 复制答案 | `Copy` | 16/20 |
| 来源引用 | `Link` | 16 |
| 连接设备 | `Plug` / `Cable` | 20/24 |
| 加载中 | `LoaderCircle`（旋转） | 16/20 |
| 成功 | `Check` / `CheckCheck` | 16/20 |
| 警告/错误 | `AlertTriangle` | 16/20 |
| 发送 | `ArrowUp` | 20 |
| 设置 | `Settings` | 20 |
| 关闭 | `X` | 16/20 |
| AI 生成标识 | 2px 蓝→绿细线（CSS 渐变，非图标，仅 AI 内容） | — |

---

## 5. Layout & Spacing（布局与间距）

- **间距基准**：4px 网格 → `--space-1`4 / `2`8 / `3`12 / `4`16 / `5`20 / `6`24 / `8`32 / `10`40 / `12`48 / `16`64。
- **圆角阶梯**：`--radius-sm`6 / `md`8 / `lg`12 / `xl`16 / `full`9999px。**禁止 ≥24px 过度圆角**（AI 软糖味）。
- **容器最大宽度**：`--container-max` 1200px（工作台）/ `--container-narrow` 720px（阅读/问答）。
- **响应式断点**：sm 640 / md 768 / lg 1024 / xl 1280。
- **网格系统**：12 列 / gap 24px（桌面工作台三栏：左 240px 导航 + 中央弹性 + 右 360px 问答面板）；移动端单列，右面板转底部可唤起草。
- **节区节奏**：桌面 section 间距 48–64px；移动 32px。

---

## 6. Depth & Elevation（深度与阴影）

- **阴影阶梯**：`--shadow-xs/sm`（卡片极轻，可选）/ `--shadow-md`（Modal/Toast）/ `--shadow-lg`（Command Palette 浮层）。
- **层级表达主力**：表面阶梯（`background → surface → surface-2`）+ 1px `--border`，**不依赖投影**。卡片默认无阴影。
- **z-index**：`--z-base`0 / `--z-dropdown`1000 / `--z-sticky`1100 / `--z-modal`1200 / `--z-toast`1300。
- **毛玻璃/模糊**：仅用于命令面板半透明背板等有功能目的处，不作装饰。

---

## 7. Do's & Don'ts（设计守则）

### ✅ 应该做
1. 所有颜色走 Design Token，零硬编码（仅 `#fff`/`#000` 极个别例外，且本项目基本不用）。
2. 图标只用 Lucide，尺寸 16/20/24px，着色走 Tailwind 文本色类。
3. 每屏强调蓝 ≤2 处；绿仅作 AI 标记 / 成功 / 提醒正向。
4. 卡片用 1px 边框 + 表面色表达层级，hover 仅变边框色。
5. 时间线 / 知识库 / 提醒 / 问答四页均覆盖 5 态（Loading/Empty/Error/Populated/Edge）。
6. 焦点可见（`focus-visible` + `--ring`），键盘可达，支持 `prefers-reduced-motion`。
7. 文案用真实内容示例（论文标注、与导师的对话回顾），不用「Welcome to」类占位。
8. 动效 150ms 收敛值，无弹跳缓动。

### ❌ 不应该做（含行业反模式）
1. **禁止 emoji 作功能图标**（P0 红线）。
2. **禁止紫→粉渐变主视觉**（P0 红线；唯一渐变仅 2px 蓝→绿 AI 标记细线）。
3. 禁止彩色左边框作卡片强调（用边框色变化替代）。
4. 禁止「1px 边框 + blur≥16px 阴影」幽灵卡。
5. 禁止 ≥24px 过度圆角。
6. 禁止默认靛蓝 `#6366f1` 作强调（本项目用 `#1a56db`/`#3b82f6`）。
7. 禁止千篇一律 Hero（首页即统一时间线，展示真实产品内容）。
8. 禁止占位文案与虚构指标（「10,000+ 用户」等无来源数字不放）。

---

## 8. Responsive & Accessibility（响应式与无障碍）

- **响应式策略**：mobile-first。桌面三栏工作台；平板可折叠侧栏；移动底部 TabBar + 右面板转底部抽屉。
- **无障碍**：
  - 对比度：正文 ≥4.5:1，大字 ≥3:1（已校验中性阶 + 主色蓝 on 白）。
  - 键盘导航：所有交互可 Tab 到达，焦点环 `--ring` 可见；命令面板全键盘可达。
  - 仅颜色传达含义处补图标 / 文字（如提醒状态除色外有 `Bell`/`BellOff`/`Clock` 图标）。
  - `prefers-reduced-motion`：关闭非必要动画，保留状态切换。
- **触摸目标**：最小 44×44px；按钮间距 ≥8px。
- **5 态覆盖**：见各页 `design-system/pages/*.md`。

---

## 9. Agent Implementation Guide（实现指南）

> 完整机器可读 Token 见 `design-system/design-tokens.json`；CSS 变量见 `design-system/design-tokens.css`；全局源见 `design-system/MASTER.md`。

- **Tailwind v4 接入**：在 `app/globals.css` 用 `@import "tailwindcss";` + `@theme` 注入本 Token（见 `design-tokens.css`）。图标用 `lucide-react`，`<Clock size={20} className="text-muted-foreground" />`。
- **主题切换**：`[data-theme="dark"]` 切换，组件读取 Token 不写死色。
- **已知坑（来自架构规格 §7）**：图标仅 lucide-react；AI Route Handler 须 `runtime='nodejs'`；多租户查询带 `user_id`；前端只走 js-sdk 登录 + 自家 `/api/v1/*`。
- **验收对应（PRD §8）**：时间线新事件置顶动画（SWR 5s 轮询 + 入场过渡）、问答流式 + 来源引用跳转、提醒 dismiss/snooze 状态写回——均在各页 pages 文档中给出 Given/When/Then 可核对项。

---

## 变更记录
| 日期 | 变更 | 原因 | 影响 |
|---|---|---|---|
| 2026-10-16 | 初版 DESIGN.md（9 节）产出 | Phase 2 交付 | 全项目设计契约源 |
| 2026-10-16 | 配色改用 PRD §12 精确值（`#1a56db`/`#3b82f6`/`#10b981`） | 单一事实源，避免值漂移 | 品牌蓝 / AI 绿 token |
| 2026-10-16 | 微信图标默认 `MessageCircle` | 架构师确认 Lucide 无微信字形，优先 Lucide 内解决；后续可纯替换 SVG | 设备源图标映射 |
| 2026-10-16 | 图标名校正：`Loader2`→`LoaderCircle`、`Quote`→`Link` | 架构师按已装 Lucide 0.5xx 核验，Loader2 为弃用别名；引用用 Link 更贴切 | 图标映射表 / design-tokens.json |
