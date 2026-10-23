# Spec - MemoryOS v0.1 (MVP)

> 生成日期：2026-10-16
> 基于：PRD v0.1 + 架构规格 v1 + UIUX 设计系统 v1
> 状态：已确认（用户 2026-10-16 拍板三文档后自动生成）
> 角色：规格即契约（Spec-as-Contract）。后续设计/开发/测试唯一依据。

---

## 1. 产品定义
- **一句话描述**：研究生的「跨设备个人记忆型 Agent」——把实验室电脑、手机、平板、微信、邮箱里的碎片化信息，汇聚成一条统一时间线 + 个人知识库，并主动提醒遗忘项。
- **目标用户**：实验室研究生（主要）；科研助理/博士后（次要，P1 图谱）；导师/课题组不在 MVP。
- **核心问题**：多设备信息碎片化，记不住"上次聊到哪/做到哪一步"，收藏越积越多却没读。

## 2. MVP 范围（锁定）
| 优先级 | 功能 | 验收摘要 | RICE |
|--------|------|----------|------|
| P0 | F1 统一时间线（多设备/来源归一、断点标记） | 倒序渲染≥20 条，含来源图标+时间戳 | 6.00 |
| P0 | F2 主动提醒卡片（规则引擎+应用内卡片） | 3 天未读收藏→卡片；忽略 7 天不重复 | 4.05 |
| P0 | F3 个人知识库 + 自然语言问答（真实 LLM + 引用） | ≤3s 流式首字≤1.5s，附可跳转引用 | 3.33 |
| P0 | F4 跨设备上下文续接（演示态） | 设备A暂停→设备B续接并定位断点 | 2.40 |
| P0 | F5 自动记忆卡片（上次聊到哪/做到哪） | 结构化卡片（结论/下一步/日期），可检索 | 2.24 |

## 3. 明确不做（Out-of-Scope，锁定）
| 不做 | 原因 | 何时考虑 |
|------|------|----------|
| 真实微信/邮箱/日历 OAuth 连接器 | MVP 用模拟事件流替代，避免集成复杂度拖垮 | P1 (F6) |
| 团队协作/课题组共享知识库 | 防 scope 膨胀 | P2 (F9) |
| 知识图谱可视化 | 时间线+卡片已够 | P1 (F7) |
| 语音/图片多模态捕获 | MVP 以文本事件流为主 | P2 (F8) |
| 离线模式 | MVP 为云端 Web | P2 (F10) |
| 写作/排版/项目管理 | 差异化在"记忆"非"笔记编辑" | — |
| 训练用户数据/上传明文给第三方模型 | 隐私红线，任何形态都遵守 | — |

## 4. 技术架构（锁定 — 含版本锚定）
| 层 | 选型 | 版本 | 锁定原因 |
|----|------|------|----------|
| 前端 | Next.js 16 (App Router) + React 19 | ^16.x / ^19.x | 全栈一体，Route Handlers 做后端 |
| 样式 | Tailwind CSS v4 | ^4.x | CSS-first + @theme inline 接 Token |
| 图标 | lucide-react | ^0.5xx（pin patch） | 唯一 SVG 图标库，P0 锁死 |
| 云端后端 | 腾讯云开发 CloudBase | — | 一体化：函数/DB/Auth/Storage/AI |
| 数据库 | CloudBase PostgreSQL + pgvector | — | 关系+向量一体，RAG 直用 |
| 存储 | CloudBase Storage | — | 知识库文件 |
| 认证 | CloudBase Auth（邮箱/手机号/匿名） | — | 国内原生，双模式 |
| 大模型 | CloudBase AI 网关（DeepSeek/混元） | — | **免密钥**，平台 Token 计费 |
| 取数 | SWR（轮询 5s + since 游标） | ^2.x | 规避云函数超时 |
| 校验 | Zod | ^3.x | 请求体校验 |
| 部署 | CloudBase 云托管（Next.js 整体部署） | — | 一键 |

**本地运行适配（ADR-001）**：本开发环境无 CloudBase 凭证，MVP 以**模拟数据层**（内存存储 + seed）作为实际数据源（本就是 MVP 约定的数据源），LLM 问答接**云就绪适配器**——配置 `CLOUDBASE_*` 环境变量时走 CloudBase AI 网关，否则回退**演示检索回答**（基于模拟知识块关键词检索 + 引用溯源，界面标注"演示模式"）。生产部署按上表接 CloudBase 即可，代码路径一致。

## 5. API 端点清单（锁定，前缀 /api/v1/）
| Method | Path | 认证 | 入参 | 出参 |
|--------|------|------|------|------|
| POST | /auth/anon | 公开 | — | {token, temp_user_id} |
| GET | /timeline | Bearer | ?device=&since=&limit= | {items[], hasMore} |
| POST | /timeline/seed | 匿名/账号 | {scenario?} | {inserted} |
| GET | /memory-cards | Bearer | ?type= | {cards[]} |
| GET | /resume | Bearer | ?device= | {context} |
| GET | /kb/documents | Bearer | — | {documents[]} |
| POST | /kb/documents | Bearer | multipart | {doc_id, status} |
| POST | /kb/query | Bearer | {question, top_k?} | {answer, sources[{doc_id,chunk_id,event_id,excerpt}]} |
| GET | /reminders | Bearer | ?status=pending | {reminders[]} |
| POST | /reminders/:id/dismiss | Bearer | {action: dismiss\|snooze, snooze_until?} | {reminder} |
| POST | /events/track | Bearer/匿名 | {event, target_id} | {ok} |
> 统一响应 `{code, data, message}`；业务端点服务端按 user_id 多租户过滤（检索前过滤）。

## 6. 数据库表清单（锁定，CloudBase PostgreSQL）
| 表 | 关键列 | 索引/关联 |
|----|--------|-----------|
| users | id(uuid) provider email/phone is_temp status | — |
| timeline_events | id user_id device_source event_type summary payload(jsonb) occurred_at is_simulated | (user_id, occurred_at) |
| memory_cards | id user_id title content card_type source_event_id | — |
| reminders | id user_id title body trigger_type trigger_config(jsonb) status due_at | — |
| kb_documents | id user_id filename storage_file_id status chunk_count | — |
| kb_chunks | id doc_id user_id content embedding vector(1536) metadata(jsonb) source_event_id | HNSW + user_id 过滤 |
| llm_audit_log | id user_id action model tokens_in/out data_scope | 隐私可溯源 |

## 7. 页面清单（锁定）
| 页面 | 路由 | 核心组件 | 对应 API | 设计 Token 主题 |
|------|------|----------|----------|-----------------|
| 跨设备时间线（首页） | / | Sidebar/TimelineItem/FilterChips | /timeline /resume | light 优先 |
| 个人知识库 | /knowledge | KnowledgeCard/SearchBar | /kb/documents /kb/query | light 优先 |
| 主动提醒 | /reminders | ReminderCard | /reminders | light 优先 |
| 自然语言问答 | /ask（或右面板） | AskPanel | /kb/query | light 优先 |

## 8. 设计 Token（锁定）
- **主色**：品牌蓝 `#1a56db` / 交互蓝 `#3b82f6`；AI 绿 `#10b981`；中性 `#f8fafc`/`#f1f5f9`/`#ffffff`/`#0f172a`/`#e2e8f0`。
- **字体**：Manrope + Noto Sans SC（UI）；JetBrains Mono（等宽元数据）。
- **图标库**：lucide-react，尺寸仅 16/20/24px，stroke 1.75，currentColor；禁 emoji、禁混库；微信=MessageCircle。
- **主题**：light 优先，dark 次级（Token 已备 `[data-theme="dark"]`）。
- **对标**：Mem.ai（时间线即首页）/ Linear（单强调色+发丝边框）/ Raycast（命令面板+等宽元数据）。
- 全部色值经 `design-system/design-tokens.json` + `design-tokens.css` 管理，组件**零硬编码**。

## 9. 验收标准（EARS）
| 编号 | 功能 | 验收标准 | 优先级 |
|------|------|----------|--------|
| AC-01 | 时间线 | When 打开首页，系统**必须**倒序渲染≥20 条事件，每条含来源图标+时间戳，首屏<500ms(1000条) | P0 |
| AC-02 | 时间线 | If 事件带断点标记，系统**必须**显示"可续接"入口并展示来源设备 | P0 |
| AC-03 | 提醒 | Given 存在3天前收藏未读事件，When 进入应用，系统**必须**顶部出现提醒卡片且文案指向该事件 | P0 |
| AC-04 | 提醒 | If 用户点忽略，When 完成，系统**必须**移除卡片且7天不重复同类 | P0 |
| AC-05 | 问答 | When 输入自然语言问题，系统**必须**≤3s(p95,流式首字≤1.5s)返回基于个人资料的回答并附可跳转引用 | P0 |
| AC-06 | 问答 | If 模型失败，When 错误发生，系统**必须**展示降级态(原因+重试+本地片段)，不白屏 | P0 |
| AC-07 | 续接 | Given 模拟流"电脑-读论文A-第3页暂停"，When 手机视图点续接，系统**必须**打开上下文并定位第3页断点 | P0 |
| AC-08 | 记忆卡 | Given 模拟流含"与导师同步:决定X下一步Y日期D"，When 打开记忆区，系统**必须**生成结构化卡片且可被问答检索 | P0 |

## 10. 边界与约束
- 不支持 IE；响应式断点 sm640/md768/lg1024/xl1280。
- 性能：首屏<3s；1000 条渲染<500ms；问答 p95<3s。
- 隐私红线：个人数据加密存储、**绝不用作模型训练**、可溯源（llm_audit_log）。
- AI Route Handler **必须** `runtime='nodejs'`（禁用 edge）。
- 多租户：所有查询检索前带 user_id 过滤。
- embedding 维度 1536 与 vector(N) 一致。

## 11. 内嵌已知坑（开发必读）
| 坑 | 指纹 | 根因 | 修法 |
|----|------|------|------|
| AI runtime 误用 edge | next.js route | edge 下 node-sdk 失效 | 强制 runtime='nodejs' |
| embedding 维度不匹配 | pgvector | vector(N) 与模型输出不符 | 建列前确认维度=1536 |
| 多租户漏过滤 | sql | 越权数据进 LLM | 检索前 user_id 过滤 |
| SSE 触达云函数超时 | vercel/cloudbase | 长连接超时 | SWR 轮询为主 |
| 浏览器直连 node-sdk | security | 暴露服务端凭证 | 前端只走 js-sdk 登录+自家 API |
| Lucide 弃用别名 | lucide-react | Loader2 弃用 | 用 LoaderCircle |

## 12. 端到端验证步骤
```bash
# 1. 安装与启动
npm install
npm run dev   # 等待 Ready on http://localhost:3000

# 2. 核心成功流
curl -X POST http://localhost:3000/api/v1/auth/anon      # 拿 temp_user_id
curl http://localhost:3000/api/v1/timeline?limit=20      # 断言 ≥20 条事件含来源图标
curl -X POST http://localhost:3000/api/v1/kb/query -H "Content-Type: application/json" -d '{"question":"上周和导师定了什么"}'  # 断言带 sources 引用
curl http://localhost:3000/api/v1/reminders?status=pending  # 断言含3天未读提醒卡

# 3. 关键错误流
curl -X POST http://localhost:3000/api/v1/kb/query -d '{"question":"__force_error__"}'  # 断言降级态不白屏
```

## 13. 变更记录
| 日期 | 变更 | 原因 | 影响 |
|------|------|------|------|
| 2026-10-16 | 初版 Spec 生成 | 三文档确认后自动生成 | 全项目契约 |
| 2026-10-16 | ADR-001 本地运行适配 | 开发环境无 CloudBase 凭证 | API/LLM 层加演示兜底，生产接 CloudBase 路径一致 |
