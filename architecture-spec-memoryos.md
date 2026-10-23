# MemoryOS 技术架构规格（Phase 1 调研产出）

> 作者：首席架构师 高见远
> 日期：2026-10-16
> 阶段：Phase 1 并行调研（技术选型 + 架构约束）
> 关联：PRD（PM 产出）、设计稿（Designer 产出）、知识库引用见文末
> 本文档为"规格即契约"——自包含、钉版本、内嵌坑、列范围。

---

## 0. 执行摘要 / 裁决

**verdict: PASS**

核心三能力在选定技术栈下均**技术可行**，无需降级为伪实现：

1. 跨设备时间线（模拟事件流落库 + 响应式展示）—— 可行
2. 真实 LLM 知识库问答（云端免密钥大模型 + RAG）—— 可行
3. 应用内主动提醒卡片（时间/事件规则触发）—— 可行

选定底座：**腾讯云开发 CloudBase**（一体化后端），前端 **Next.js 16（App Router）+ React 19 + Tailwind CSS v4**，图标库 **Lucide（lucide-react）**。

选定理由唯一决定性因素：用户硬性要求"**云端免密钥大模型调用**"。CloudBase 内置 AI 网关（DeepSeek / 混元等），按平台 Token 资源包计费，开发者**不持有、不管理任何模型 API Key**；同时 CloudBase 提供 PostgreSQL + pgvector（可做真 RAG）、Auth（微信/手机号/邮箱）、Storage，一套平台覆盖 MVP 全部后端需求，国内访问与微信生态原生适配。

---

## 1. 技术对比矩阵

### 1.1 前端框架

| 方案 | 评估 | 与 CloudBase 适配 | 结论 |
|------|------|------------------|------|
| **Next.js 16（App Router + React 19）** | 生态最大；App Router 成熟；Server Components + Route Handlers 可直接承担后端 API，部署到 CloudBase 云托管/云函数为一键式 | 最佳（CloudBase 官方支持整体部署 Next.js） | **推荐** |
| Vue 3 + Nuxt 3 | 上手快、SSR 全栈完备 | CloudBase 部署/AI 集成示例偏小程序与 Node，文档少 | 备选 |
| React 18 SPA（Vite） | 纯前端简单、构建快 | 需另行部署静态资源 + 单独云函数做后端，割裂 | 备选（不推荐，后端需重复搭） |

### 1.2 云端后端 / BaaS（核心维度：免密钥大模型 + 国内）

| 方案 | 免密钥大模型 | 数据库 | 认证 | 国内生态 | 结论 |
|------|------------|--------|------|----------|------|
| **CloudBase（腾讯云开发）** | 内置 AI 网关（DeepSeek/混元/GLM/Kimi），平台 Token 计费，**无需自管 Key** | PostgreSQL + pgvector / 文档 DB | 微信/手机号/邮箱/匿名 原生 | 微信生态免鉴权、国内节点 | **推荐** |
| Supabase | 无内置网关，需自管 LLM Key | PostgreSQL + pgvector | 40+ OAuth，但微信/手机号需自接 | 国际节点为主，国内慢 | 备选（海外场景） |
| Vercel + Neon | 需自管 Key | Neon Postgres + pgvector | 需接 Auth.js/Clerk | 国内访问慢 | 备选 |

### 1.3 云数据库（含向量能力）

| 方案 | pgvector 向量检索 | 实时能力 | 国内 | 与后端统一 | 结论 |
|------|------------------|----------|------|------------|------|
| **CloudBase PostgreSQL** | 内置 `vector` 扩展（HNSW/IVFFlat） | 实时数据库 watch | 是 | 是（同一平台） | **推荐** |
| Supabase Postgres | pgvector | Realtime（logical replication） | 否 | （若选 Supabase） | 备选 |
| Neon | pgvector | 无内置实时（需轮询） | 否 | 否 | 备选 |

### 1.4 文件存储

| 方案 | 国内 | 与 CloudBase 集成 | 结论 |
|------|------|------------------|------|
| **CloudBase Storage** | 是 | fileID SDK 直传/直链，安全规则可控 | **推荐** |
| Supabase Storage | 否 | （若选 Supabase） | 备选 |
| Cloudflare R2 | 是（全球） | 需单独配置密钥与绑定 | 备选 |

### 1.5 用户认证

| 方案 | 国内方式 | 与 CloudBase | 结论 |
|------|----------|--------------|------|
| **CloudBase Auth** | 微信/QQ/手机号/邮箱/匿名，一行接入 | 原生 | **推荐** |
| Supabase Auth | 微信/手机号需自接 OAuth 2.0 | — | 备选 |
| Clerk | 国内需合规评估、按席位收费 | — | MVP 不推荐 |

### 1.6 免密钥大模型调用（核心需求专项）

| 方案 | 是否免密钥 | 模型 | 计费 | 结论 |
|------|-----------|------|------|------|
| **CloudBase AI 网关** | **是**（平台 Token 资源包，开发者无 Key） | DeepSeek / 混元 / GLM / Kimi 等（如 deepseek-v3.2、hunyuan-2.0-instruct） | 按 Token 资源包 | **推荐（直接满足需求）** |
| 自建代理（DeepSeek / 硅基流动 Key 存服务端） | 否（需自管 Key，仅不暴露给前端） | DeepSeek / 硅基流动 | 按量 | 备选（需特定海外模型时） |
| 直连 OpenAI API Key | 否 | GPT 系列 | 按量 + 国内合规风险 | 不推荐 |

---

## 2. 选型结论与版本锚定

### 2.1 最终选型

| 层 | 选型 | 说明 |
|----|------|------|
| 前端框架 | **Next.js 16.x（App Router）+ React 19** | 全栈一体，Route Handlers 做后端 |
| 样式 | **Tailwind CSS v4**（Oxide 引擎，CSS-first） | 配 `@tailwindcss/postcss` |
| 图标库 | **Lucide（lucide-react）** | 见第 5 节 P0 锁定 |
| 云端后端 | **CloudBase（腾讯云开发）** | 一体化：函数/DB/Auth/Storage/AI |
| 数据库 | **CloudBase PostgreSQL + pgvector** | 关系 + 向量一体，RAG 直接用 |
| 文件存储 | **CloudBase Storage** | 知识库文件上传/下载 |
| 认证 | **CloudBase Auth（邮箱/手机号/匿名）** | 国内原生 |
| 大模型 | **CloudBase AI 网关（DeepSeek / 混元）** | 免密钥 |
| 客户端取数 | **SWR（轮询 5s）** | 响应式展示，规避函数超时 |
| 校验 | **Zod** | 请求体校验 |
| 部署 | **CloudBase 云托管（Next.js 整体部署）** | 一键 |

### 2.2 版本锚定（钉死，安装时确认实际 patch）

| 依赖 | 锚定版本 | 备注 |
|------|----------|------|
| `next` | `^16.x`（安装时 pin 最新 patch，研究时约 16.3.x） | App Router；**禁用 Pages Router** |
| `react` / `react-dom` | `^19.x` | Next 16 强制要求 React 19 |
| `tailwindcss` | `^4.x` | 配 `@tailwindcss/postcss` |
| `lucide-react` | `^0.554.0`（或最新 0.5xx，pin 同次安装锁定的 patch） | 图标库，P0 锁定 |
| `@cloudbase/node-sdk` | `>=3.16.0` | **AI 能力要求 3.16.0+**（数据模型 3.2.0+） |
| `@cloudbase/js-sdk` | `latest` | 浏览器端登录 |
| `pg` | `^8.11.0` | 在 Node 侧直连 PostgreSQL（pgvector 查询） |
| `zod` | `^3.x` | 请求校验 |
| `swr` | `^2.x` | 客户端轮询 |

> 所有版本以 `package-lock.json` 锁文件为准，禁止用 `latest` 浮动标签上线。

---

## 3. 分层架构（依赖只能向下）

```
┌──────────────────────────────────────────────────────────────┐
│  表现层  Next.js 16 App Router (React 19)                       │
│  - 页面只组装，不堆逻辑；lucide-react 图标；Tailwind v4 样式    │
│  - 客户端用 @cloudbase/js-sdk 登录拿 token                    │
│  - 业务数据走 /api/v1/*（SWR 轮询 5s）                        │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTP /api/v1/*  (Authorization: Bearer <tcb_token>)
┌───────────────▼──────────────────────────────────────────────┐
│  API 层  Next.js Route Handlers (runtime='nodejs' 必须)        │
│  routes → controllers → services → repositories（分层，见规范） │
│  - 校验 token（node-sdk verify）                               │
│  - 多租户：所有查询带 user_id 过滤                            │
└───────────────┬──────────────────────────────────────────────┘
                │ @cloudbase/node-sdk / pg 客户端
┌───────────────▼──────────────────────────────────────────────┐
│  CloudBase 一体化后端                                          │
│  ┌────────────┐ ┌────────────────────┐ ┌──────────────────┐  │
│  │ AI 网关     │ │ PostgreSQL+pgvector│ │ Auth / Storage   │  │
│  │ DeepSeek/   │ │ timeline 事件表     │ │ 邮箱/手机号/匿名 │  │
│  │ 混元        │ │ kb_chunks 向量表    │ │ 文件 fileID      │  │
│  │ (免密钥)    │ │ reminders 规则表    │ │                  │  │
│  └────────────┘ └────────────────────┘ └──────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────────────┐
│  模拟数据层（OUT OF SCOPE 真实集成）                            │
│  - 模拟事件生成器（定时/轮询注入 5 类设备源事件）              │
│  - 设备源：lab_computer / phone / tablet / wechat / email     │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. 核心功能技术可行性验证

### 4.1 跨设备时间线（模拟事件流落库 + 响应式展示）
- **落库**：模拟事件（含 `device_source`、`occurred_at`、`summary`、`payload`）写入 PostgreSQL `timeline_events` 表，按 `user_id` 隔离。
- **模拟数据流**：`seed` 脚本注入历史基线（跨设备、跨天数）；后台生成器（CloudBase 定时触发器或轮询端点）周期性插入少量新事件以演示"live"。
- **响应式展示**：前端 `GET /api/v1/timeline` 由 SWR 每 5s 轮询（带 `since` 游标），新事件动画插入置顶。规避长连接 SSE 触达云函数超时。
- **结论：可行。** 纯应用逻辑，无外部依赖风险。

### 4.2 真实 LLM 知识库问答（免密钥 + RAG）
- **入库流水线**：用户上传文件（或 demo 预置）→ CloudBase Storage → Route Handler 解析/分块（语义断点 + 滑动窗口）→ 调 CloudBase AI 网关 **embedding 端点** → 写入 `kb_chunks(embedding vector(1536), user_id, doc_id, content, metadata)`。
- **查询**：用户问题 embedding → `ORDER BY embedding <=> $1 LIMIT K` **且 `WHERE user_id = $2`**（检索前过滤，非检索后）→ 拼 prompt → 调 AI 网关 `streamText` 流式回答。
- **溯源（引用溯源，PRD 验收硬项）**：每个 chunk 记录来源元数据（`doc_id`、`chunk_id`、派生它的 `timeline_event_id`）；回答以引用块返回，前端点击可跳转回对应时间线事件；检索结果一并返回 source 列表。
- **隐私**：用户个人内容仅经 CloudBase 免训练网关传输；知识库文件与事件在存储层加密；LLM 调用明确不用于模型训练（硬约束，见第 6 节）。
- **免密钥**：AI 网关在 CloudBase 部署时**自动注入凭证**，开发者无 Key。
- **结论：可行。** 依赖 CloudBase PostgreSQL + pgvector + AI 网关（chat + embedding 双端点），均已验证存在。

### 4.3 应用内主动提醒卡片（时间/事件规则触发）
- **规则引擎**：`reminders` 表存规则（trigger_type: time_after_event / before_deadline / keyword_in_event）+ 评估状态。
- **触发**：时间型由 CloudBase 定时触发器（每 N 分钟）扫描到期规则生成提醒；事件型在 timeline 写入时同步评估。
- **呈现**：`GET /api/v1/reminders` 返回待办卡片，前端抽屉/面板渲染，支持 dismiss / snooze（写回状态）。
- **结论：可行。** 纯应用逻辑，无外部推送（满足"应用内提醒卡片"要求）。

### 4.4 认证模型（双模式，PM 裁定 2026-10-16）
- **规范身份**：邮箱 / 手机号登录（JWT），用于稳定身份持久化与"跨设备"主张；多租户按 `user_id` 隔离。
- **匿名 Demo 模式**：即时体验、注入模拟多设备流、非持久化；匿名会话生成临时 `user_id`（`users.is_temp = true`）。
- **升级路径**：匿名会话可一键升级为正式账号（`POST /api/v1/auth/upgrade`），**复用同一 `user_id`**，`is_temp` 置否并绑定邮箱/手机号，数据不迁移（同一租户）。
- **约束**：auth 接口同时支持匿名与账号登录；匿名会话仅可访问模拟数据，禁止写入真实个人知识库（升级后方可）。

---

## 5. P0 图标库锁定（强制）

**锁定：Lucide（包名 `lucide-react`），MIT 许可证，纯 SVG 线性图标。**

| 项 | 约束 |
|----|------|
| 唯一图标源 | 全项目图标**只能**来自 `lucide-react` |
| 接入方式 | 以 **React 组件**接入（与 Next.js 16 + React 19 栈一致）：`import { Timeline } from 'lucide-react'`，渲染为内联 SVG；**不**用 Web Component / 原生 inline SVG 复制 |
| 禁止项 | **禁止任何 emoji 作为图标**；禁止混用 Tabler / Heroicons / Radix Icons / 其他图标库 |
| 尺寸 | 仅允许 16 / 20 / 24 px，通过组件 `size` 属性设置（如 `<Timeline size={20} />`） |
| 描边宽度 | 统一 `strokeWidth={1.75}`（与 Designer 规范一致） |
| 颜色继承 | `currentColor` 继承 Token 文本色（Lucide 默认即 currentColor，配合 Tailwind `text-*` 类，不写死 fill / hex） |
| 逃逸口 | 若 Lucide 缺某图标，在单一目录 `components/icons/` 内以**手绘 SVG 组件**补充（仍 SVG、仍无 emoji、仍 stroke 1.75 + currentColor），**不得**为此引入第二套图标库 |
| 依赖 | `lucide-react` 必须写入 `package.json` 并随版本锁定 |

**选型理由**：Lucide 是 Feather 的活跃维护分支，MIT、tree-shakeable（按需引入不撑包）、24×24 统一线性风格、React 绑定一等公民、与 Tailwind 协作天然、覆盖 1500+ 图标足以覆盖设备源/提醒/知识库等场景。满足"全项目统一、不混用、尺寸 16/20/24px"全部要求。

**对 Designer 的约束**：设计系统图标必须从 Lucide 现有图标集中选取（设计稿到代码的 1:1 映射）；不存在的图标走上述 `components/icons/` SVG 逃逸口，不引入新库。已与 Designer 对齐：图标以 React 组件接入、`strokeWidth={1.75}`、`currentColor` 继承 Token 色（见第 5.1 节）。

**实现注意（防版本幻觉）**：仅用 Lucide 当前（非 deprecated）导出名——例如用 `LoaderCircle` 而非已弃用别名 `Loader2`（`Loader2` 在 0.5xx 仍是 `LoaderCircle` 的弃用别名，会告警且未来大版本可能移除）。前端脚手架须保证所有图标名在 `lucide-react` 可解析（构建期 TypeScript 校验，写错即报缺省导出）；图标清单在落地前对照 `lucide.dev` 或已装版本的 `lucide-react` 导出做一次性核验。

---

## 5.1 设计 Token 与主题约束（与 Designer 对齐，P0）

Designer（颜好看）Phase 1 已定设计系统方向，以下作为前端工程硬约束锁定：

| 项 | 约束 |
|----|------|
| 色值来源 | 全部走 Design Token：`:root` CSS 变量 + `design-tokens.json`（由 Designer Phase 2 提供） |
| 零硬编码 | 组件**禁止**写死 hex 色值（仅 `#fff`/`#000` 例外，且 Designer 基本不用纯黑纯白）；颜色一律用 Token 工具类 |
| Tailwind 接入 | Tailwind v4 用 `@theme inline` 将 CSS 变量映射为工具类（`bg-primary` / `text-foreground` 等） |
| 主题 | `[data-theme]` 切换，默认 `light`（优先）、次级 `dark`；Token 在 `:root` 与 `[data-theme="dark"]` 双定义 |
| 品牌色与语义 Token | 命名与色值以 Designer 的 `design-tokens.json` 为准（采用 Tailwind v4 + shadcn 兼容命名：`--background` / `--foreground` / `--muted-foreground` / `--border` / `--primary` / `--ai` 等）；架构侧只锁"零硬编码 + `@theme inline` 映射 + light/dark 双套"三项要求，**不预设**具体变量名或色值 |
| 脚手架职责 | 前端工程初始化时把 `design-tokens.json` 注入为 CSS 变量，并配置 Tailwind `@theme inline` 引用；后续组件不得绕开 Token |

> 与图标约束（第 5 节）协同：Lucide 图标 `currentColor` 即继承 Token 文本色，故图标着色也自动走 Token，无额外硬编码。

## 6. 技术约束清单（实现必须遵守）

1. **图标**：仅 `lucide-react`，禁 emoji，禁混库，尺寸 16/20/24（见第 5 节）。
2. **AI 运行时**：所有调用 CloudBase AI 的 Route Handler **必须** `export const runtime = 'nodejs'`，**禁用 edge**（node-sdk 依赖 Node API，edge 下 AI 调用必崩）。
3. **向量维度**：`kb_chunks.embedding` 维度必须与所选 embedding 模型输出一致（默认 `vector(1536)`；若换模型需同步改列维度，否则写入/查询报错）。
4. **多租户隔离**：所有知识库 / timeline / reminder 查询**必须**在 SQL/查询层带 `user_id` 过滤（检索前过滤），**禁止**检索后应用层过滤——否则越权数据会进入 LLM 上下文。
5. **响应式展示**：用 SWR 轮询（5s + `since` 游标）为主；长连接 SSE 仅作增强且须设短超时+断线重连，避免云函数超时。
6. **分层与文件**：遵循 code-organization 规范——routes/controllers → services → repositories，依赖只向下；**单文件 ≤ 300 行**；入口只装配。
7. **前后端边界**：浏览器**仅**用 `@cloudbase/js-sdk` 做登录拿 token；业务数据一律走自家 `/api/v1/*`；API 路由用 `@cloudbase/node-sdk` 校验 token 后操作。
8. **API 契约**：统一响应 `{ code, data, message }`；所有端点带版本前缀 `/api/v1/`；错误码规范见后续 openapi 文档。
9. **模拟数据**：跨设备数据**全部模拟**，禁止真实微信/邮箱/日历 API 集成（out-of-scope）。
10. **版本锁**：见 2.2，禁止浮动 `latest` 上线。
11. **设计 Token 零硬编码**：所有色值走 Design Token（`:root` CSS 变量 + `design-tokens.json`），组件**禁止**写死 hex（仅 `#fff`/`#000` 例外）；Tailwind v4 经 `@theme inline` 引用变量，组件用 Token 工具类（`bg-primary` / `text-foreground`）。
12. **主题切换**：组件支持 `[data-theme]` 切换（默认 `light`，次级 `dark`）；Token 在 `:root` 与 `[data-theme="dark"]` 双定义；浅色优先，深色次级。
13. **隐私红线（硬约束）**：个人数据加密存储（CloudBase 平台级加密 SM4 / 透明加密 + PII 字段应用层信封加密）；用户内容**绝不**用于模型训练——仅经 CloudBase 免训练托管网关传输，禁用任何启用训练的端点；个人数据可溯源（见 14）。
14. **引用溯源**：知识库问答返回结果须携带来源引用（`doc_id` / `chunk_id` / 派生的 `timeline_event_id`），前端可跳转回对应时间线事件；并记录 LLM 调用审计日志（哪些个人数据被送入模型）。

---

## 7. 不可行警告 / 风险（内嵌坑）

| # | 风险 / 坑 | 等级 | 应对 |
|---|-----------|------|------|
| 1 | AI Route Handler 误用 edge runtime → AI 调用失败 | 高 | 约束 2：强制 `runtime='nodejs'` |
| 2 | embedding 维度与 `vector(N)` 不匹配 → 写入/查询报错 | 高 | 约束 3：实现时确认模型输出维度再建列 |
| 3 | 长连接 SSE 触达云函数超时 → 流式断流 | 中 | 约束 5：轮询为主，SSE 增强且短超时 |
| 4 | 多租户漏 `user_id` 过滤 → 越权数据进 LLM | 高 | 约束 4：检索前过滤，代码评审卡 |
| 5 | CloudBase AI 网关以中文模型为主（DeepSeek/混元）；若后续强依赖 GPT/Claude 特定能力，需走"自建代理"备选（自管 Key） | 中 | MVP 用 DeepSeek/混元足够；预留代理模式 |
| 6 | AI Token 计费隐性成本（参考成本模型 ¥200–2000/月）；demo 期免费/新用户资源包覆盖，规模化需预算 | 中 | 上线前估算用量；设额度告警 |
| 7 | pgvector 在百万级 chunk 需 HNSW 调优；MVP 千级安全，超量需独立向量库 | 低 | MVP 不优化；超量再迁移 |
| 8 | 浏览器直连 node-sdk 会暴露服务端凭证 → 安全失效 | 高 | 约束 7：前端只走 js-sdk 登录 + 自家 API |
| 9 | CloudBase「不训练」书面承诺未核实 → 个人数据落库合规风险 | 高 | 设为 Launch Gate（PM 牵头核验并存证），发布前必过；关联约束 13/14 |

---

## 8. 明确不做（Out-of-Scope）

- 真实微信 / 邮箱 / 日历 API 集成（仅模拟数据）
- 真实多端原生 App（iOS / Android）；MVP 仅 Web
- 真实系统推送通知（仅应用内提醒卡片；浏览器 Notification 可选不做）
- 付费 / 订阅 / 计费系统
- 国际化（i18n）与多语言
- 知识库百万级规模性能优化
- 多 Agent 自主进化 / 复杂编排（MVP 用单 Agent + 工具即可）
- 真实微信 / 邮箱 / 日历 OAuth 连接器（PRD F6，归属 P1，本期以模拟事件流替代）
- 与功能优先级对齐：MVP 范围 = F1 统一时间线、F2 提醒卡片、F3 知识库问答、F4 跨设备续接（演示态）、F5 自动记忆卡片；F6–F10 进 Backlog

---

## 9. API 端点清单（供后续 openapi.yaml 落地，均为 `/api/v1/` 前缀）

| Method | Path | 认证 | 入参 | 出参 |
|--------|------|------|------|------|
| POST | `/auth/login` | 公开 | `{email\|phone, password\|code}` | `{token, user}` |
| POST | `/auth/anon` | 公开 | — | `{token, temp_user_id}` |
| POST | `/auth/upgrade` | 匿名 token | `{email\|phone, credential}` | `{token, user}`（复用 user_id） |
| GET | `/timeline` | Bearer | `?device=&since=&limit=` | `{items[], hasMore}` |
| POST | `/timeline/seed` | 匿名/账号(demo) | `{scenario?}` | `{inserted:int}` |
| GET | `/memory-cards` | Bearer | `?type=` | `{cards[]}`（F5 自动记忆） |
| GET | `/resume` | Bearer | `?device=` | `{context}`（F4 跨设备续接） |
| GET | `/kb/documents` | Bearer | — | `{documents[]}` |
| POST | `/kb/documents` | Bearer | `multipart file` | `{doc_id, status}` |
| POST | `/kb/query` | Bearer | `{question, top_k?}` | SSE：`{answer, sources[{doc_id,chunk_id,event_id,excerpt}]}` |
| GET | `/reminders` | Bearer | `?status=pending` | `{reminders[]}` |
| POST | `/reminders/:id/dismiss` | Bearer | `{action: dismiss\|snooze, snooze_until?}` | `{reminder}` |
| POST | `/events/track` | Bearer/匿名 | `{event: shown\|acted\|dismissed, target_id}` | `{ok}`（埋点，接 PM 方案） |

> 统一响应 `{code, data, message}`；错误码规范见 openapi。所有业务端点（除 `/auth/*` 登录类）均需 Bearer 且服务端按 `user_id` 做多租户过滤。

---

## 10. 待确认 / 移交

- 移交 PM：已对齐 PRD 约束——模拟流替代真实连接器（F6 归 P1）、知识库问答需引用溯源、提醒卡片为产品假设验证点（埋点）、隐私红线（加密/不训练/可溯源）。认证方式最终取舍（匿名 vs 邮箱）仍需 PM 在 PRD 登录流明确。
- 移交 Designer：图标库已锁 Lucide，且已确认 React 组件接入 + `strokeWidth={1.75}` + `currentColor`（见第 5 节）；设计 Token 零硬编码与 `[data-theme]` 主题切换已锁为前端工程约束（见第 5.1 节）。请 Phase 2 `design-tokens.json` 提供具体色值与 Token 命名（主色 Memory Cobalt、AI 绿等以你方为准），前端脚手架据其注入 CSS 变量 + Tailwind `@theme inline`。
- 后续 Phase：落地 `openapi.yaml`（v1）+ ADR 文档（每条选型一条 MADR）+ 数据库 Schema（含隐私加密字段与溯源引用列）。

---

## 11. 数据库表清单（草稿，供 Phase 2 Schema 落地）

| 表 | 关键列 | 说明 |
|----|--------|------|
| `users` | `id`(uuid) `provider`(email/phone/anonymous) `email`/`phone`(可空) `is_temp`(bool) `status` `created_at` `updated_at` | 账户；匿名会话为 `is_temp=true` 行，升级复用同 id |
| `timeline_events` | `id` `user_id` `device_source`(lab_computer/phone/tablet/wechat/email) `event_type` `summary` `payload`(jsonb) `occurred_at` `is_simulated`(bool) | 跨设备时间线；索引 `(user_id, occurred_at)` |
| `memory_cards` | `id` `user_id` `title` `content` `card_type`(auto_memory/resume_context) `source_event_id`(可空) `created_at` | F5 自动记忆卡片 / F4 续接上下文 |
| `reminders` | `id` `user_id` `title` `body` `trigger_type` `trigger_config`(jsonb) `status`(pending/dismissed/snoozed/done) `due_at` `created_at` | 主动提醒规则与状态 |
| `kb_documents` | `id` `user_id` `filename` `storage_file_id` `status`(processing/done/failed) `chunk_count` `created_at` | 知识库文档元数据 |
| `kb_chunks` | `id` `doc_id` `user_id` `content` `embedding` vector(1536) `metadata`(jsonb) `source_event_id`(可空) `created_at` | RAG 向量分块；IVFFlat/HNSW 索引 + `user_id` 过滤 |
| `llm_audit_log` | `id` `user_id` `action`(embed/query) `model` `tokens_in/out` `data_scope`(jsonb) `created_at` | 隐私可溯源：记录哪些个人数据被送入模型 |

> 所有表含 `user_id` 并默认按之隔离；`kb_chunks.embedding` 维度须与 embedding 模型输出一致（默认 1536）。Schema 以 Phase 2 正式 DDL 为准。

---

## 附录：知识库引用（必读依据）

- `references/01-standards/spec-as-contract.md`（自包含/钉版本/内嵌坑/端到端验证）
- `references/01-standards/context-engineering.md`（上下文预算/压实保真）
- `references/01-standards/generated-code-failure-modes.md`（幻觉依赖/沉默逻辑错误/系统上下文缺失）
- `references/01-standards/code-organization.md`（分层/单文件≤300行/入口只装配）
- `references/architecture/mvp-stack.md`（选型矩阵基线）
- `references/architecture/ai-agent-patterns.md`（Agent 模式/权限感知 Function Calling）
- `references/architecture/rag-knowledge-base.md`（pgvector RAG/权限感知检索/分块策略）
- `references/cost-models/development-costs.md`（隐性成本：AI API ¥200–2000/月）
- 外部核验：CloudBase AI 网关（`@cloudbase/node-sdk` `app.ai()`，AI 需 ≥3.16.0，runtime=nodejs）、CloudBase PostgreSQL pgvector 扩展、Lucide React 当前 0.5xx。
