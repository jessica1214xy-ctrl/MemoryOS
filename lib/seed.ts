// MemoryOS 模拟多设备事件流（Spec §4.1：全量模拟，禁止真实连接器）
// 真实来源：研究生「阿哲」一周内的跨设备研究碎片。
import type {
  TimelineEvent,
  MemoryCard,
  Reminder,
  KbChunk,
  DeviceSource,
} from "./types";

const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

interface SeedResult {
  events: TimelineEvent[];
  memoryCards: MemoryCard[];
  reminders: Reminder[];
  chunks: KbChunk[];
}

export function buildSeed(userId: string, now: number): SeedResult {
  const events: TimelineEvent[] = [];
  const push = (
    device: DeviceSource,
    hoursAgo: number,
    e: Omit<
      TimelineEvent,
      "id" | "user_id" | "occurred_at" | "is_simulated" | "device_source"
    >,
  ) => {
    events.push({
      id: `evt_${events.length + 1}`,
      user_id: userId,
      device_source: device,
      occurred_at: new Date(now - hoursAgo * HOUR).toISOString(),
      is_simulated: true,
      ...e,
    });
  };

  push("lab_computer", 2, {
    event_type: "paper_read",
    title: "阅读《Attention 机制综述》",
    summary: "在实验室电脑标注了论文第 3 节关键结论：稀疏注意力可把长文本推理显存降 40%。",
    payload: { paper: "Attention 机制综述", page: 3, section: "3. 稀疏注意力" },
    has_breakpoint: true,
    breakpoint_detail: "《Attention 机制综述》第 3 页（PDF 第 11 页）",
  });

  push("lab_computer", 5, {
    event_type: "experiment_step",
    title: "实验 B 训练到第 8 轮",
    summary: "实验 B（稀疏注意力消融）训练到第 8 轮，验证集 F1 0.82，比基线高 3 个点。",
    payload: { experiment: "B", step: 8, metric: "F1=0.82" },
  });

  push("wechat", 26, {
    event_type: "chat_with_advisor",
    title: "和导师聊实验方向",
    summary:
      "导师建议：先把实验 B 的稀疏注意力结论写成 2 页 memo，下周二组会汇报；下一步做长文本检索的对比实验（实验 C）。",
    payload: {
      advisor: "导师",
      decision: "写 2 页 memo 汇报实验 B",
      next_step: "启动实验 C：长文本检索对比",
      due: "下周二组会",
    },
  });

  push("phone", 28, {
    event_type: "bookmark",
    title: "微信收藏《多模态综述》",
    summary: "在手机微信收藏了一篇《多模态大模型综述》，还没读。",
    payload: { source: "微信收藏", read: false },
  });

  push("email", 50, {
    event_type: "email",
    title: "收到导师邮件：组会材料提醒",
    summary: "导师邮件提醒：下周二组会每人 10 分钟进展汇报，需提前一天发 slides。",
    payload: { from: "导师", topic: "组会 slides" },
  });

  push("tablet", 30, {
    event_type: "note",
    title: "平板上记的灵感笔记",
    summary: "平板上记：是否可以把稀疏注意力用到我们检索器里，减少长文档索引开销？",
    payload: { device: "tablet" },
  });

  push("phone", 70, {
    event_type: "bookmark",
    title: "手机浏览器收藏《RAG 评测基准》",
    summary: "手机收藏了《RAG 评测基准综述》，标记为待读，已 3 天未打开。",
    payload: { source: "手机浏览器", read: false },
  });

  push("lab_computer", 73, {
    event_type: "paper_read",
    title: "阅读《Retrieval-Augmented Generation》",
    summary: "实验室电脑精读了 RAG 原论文，重点划了「检索前过滤」段落——按租户隔离再检索。",
    payload: { paper: "RAG 原论文", section: "检索前过滤" },
  });

  push("wechat", 80, {
    event_type: "chat_with_advisor",
    title: "微信和导师确认实验 C 数据集",
    summary: "导师微信回复：实验 C 用我们自己的长文本语料（内部 12 万条），不要用公开集。",
    payload: { advisor: "导师", dataset: "内部 12 万条长文本语料" },
  });

  push("email", 96, {
    event_type: "email",
    title: "收到 NeurIPS 投稿截止提醒邮件",
    summary: "会议邮件：NeurIPS 投稿摘要截止还有 3 周，建议把实验 B/C 整理成短文。",
    payload: { conference: "NeurIPS", deadline: "3 周后" },
  });

  // 再补一些日常碎片，凑足 ≥20 条
  push("lab_computer", 1, {
    event_type: "note",
    title: "实验 B 今早 loss 曲线变平",
    summary: "实验 B 早上的 loss 曲线在 0.21 附近变平，可能要调学习率。",
    payload: {},
  });
  push("phone", 3, {
    event_type: "note",
    title: "手机待办：回导师邮件",
    summary: "手机记了待办：回复导师关于组会 slides 的邮件。",
    payload: {},
  });
  push("tablet", 8, {
    event_type: "paper_read",
    title: "平板读《LoRA 微调实践》",
    summary: "平板上读了 LoRA 微调实践，划了显存占用对比表。",
    payload: {},
  });
  push("wechat", 12, {
    event_type: "note",
    title: "微信文件传输助手：实验 B 截图",
    summary: "往文件传输助手发了实验 B 验证集截图，方便手机随时看。",
    payload: {},
  });
  push("email", 15, {
    event_type: "email",
    title: "订阅邮件：arXiv 每日推送",
    summary: "arXiv 推送了 5 篇注意力/检索相关新论文。",
    payload: {},
  });
  push("lab_computer", 18, {
    event_type: "experiment_step",
    title: "实验 A 复现完成",
    summary: "实验 A（基线）复现完成，F1 0.79，作为实验 B/C 对照。",
    payload: { experiment: "A", metric: "F1=0.79" },
  });
  push("phone", 22, {
    event_type: "bookmark",
    title: "手机收藏《Agent 记忆综述》",
    summary: "手机收藏《Agent 长期记忆综述》，待读。",
    payload: { read: false },
  });
  push("tablet", 33, {
    event_type: "note",
    title: "平板：组会大纲草稿",
    summary: "平板上列了组会大纲：1) 实验 B 结论 2) 实验 C 计划 3) 风险。",
    payload: {},
  });
  push("wechat", 40, {
    event_type: "note",
    title: "微信群：组会改到下周二",
    summary: "课题组群通知：本周组会顺延到下周二。",
    payload: {},
  });
  push("lab_computer", 44, {
    event_type: "paper_read",
    title: "精读《长上下文评测》",
    summary: "实验室电脑读了长上下文评测论文，记下 Needle-in-Haystack 方法。",
    payload: {},
  });
  push("email", 60, {
    event_type: "email",
    title: "合作者邮件：要实验 B 数据",
    summary: "合作者邮件询问能否共享实验 B 的中间结果。",
    payload: {},
  });
  push("phone", 66, {
    event_type: "note",
    title: "手机灵感：做检索器 ablation",
    summary: "手机记：实验 C 可以做检索器 ablation（稠密 vs 稀疏）。",
    payload: {},
  });
  push("tablet", 90, {
    event_type: "paper_read",
    title: "平板读《向量数据库选型》",
    summary: "平板上对比了 pgvector 与独立向量库的取舍。",
    payload: {},
  });

  // 自动记忆卡片（F5）：来自与导师的同步
  const memoryCards: MemoryCard[] = [
    {
      id: "mem_1",
      user_id: userId,
      title: "上次和导师聊到：实验方向",
      content:
        "结论：先写 2 页 memo 汇报实验 B（稀疏注意力，F1 0.82）；下一步启动实验 C（长文本检索对比，用内部 12 万条语料，不用公开集）。",
      card_type: "auto_memory",
      source_event_id: "evt_3",
      created_at: new Date(now - 26 * HOUR).toISOString(),
    },
    {
      id: "mem_2",
      user_id: userId,
      title: "实验做到哪一步：实验 B",
      content:
        "实验 B（稀疏注意力消融）训练到第 8 轮，验证集 F1 0.82，比基线高 3 个点；今早 loss 在 0.21 附近变平，疑似需调学习率。实验 A 复现完成（F1 0.79）作对照。",
      card_type: "auto_memory",
      source_event_id: "evt_2",
      created_at: new Date(now - 5 * HOUR).toISOString(),
    },
  ];

  // 主动提醒（F2）：3 天前收藏未读 + 回导师邮件 + 组会
  const reminders: Reminder[] = [
    {
      id: "rem_1",
      user_id: userId,
      title: "你 3 天前收藏的论文还没读",
      body: "《RAG 评测基准综述》已在手机收藏 3 天未打开，今天组会可能用得上。",
      trigger_type: "time_after_event",
      status: "pending",
      due_at: new Date(now - 70 * HOUR).toISOString(),
      created_at: new Date(now - 70 * HOUR).toISOString(),
      related_event_id: "evt_7",
    },
    {
      id: "rem_2",
      user_id: userId,
      title: "该回复导师的组会 slides 邮件了",
      body: "导师邮件提醒下周二组会每人 10 分钟汇报，需提前一天发 slides。",
      trigger_type: "before_deadline",
      status: "pending",
      due_at: new Date(now - 50 * HOUR).toISOString(),
      created_at: new Date(now - 50 * HOUR).toISOString(),
      related_event_id: "evt_5",
    },
    {
      id: "rem_3",
      user_id: userId,
      title: "组会改到下周二，准备 memo",
      body: "导师建议先把实验 B 写成 2 页 memo。距组会还有几天。",
      trigger_type: "keyword_in_event",
      status: "pending",
      due_at: new Date(now - 40 * HOUR).toISOString(),
      created_at: new Date(now - 40 * HOUR).toISOString(),
      related_event_id: "evt_10",
    },
  ];

  // 知识库分块（F3 检索语料）：事件摘要 + 几篇"已上传文档"分块
  const chunks: KbChunk[] = events.map((e, i) => ({
    id: `chk_evt_${i + 1}`,
    doc_id: "doc_timeline",
    user_id: userId,
    content: `${e.title}。${e.summary}`,
    metadata: { event_type: e.event_type, device: e.device_source },
    source_event_id: e.id,
  }));
  // 模拟"已上传个人文档"分块
  const uploaded = [
    "实验 B 方法：在基线检索器上替换为稀疏注意力（Top-k=32），显存下降 40%，长文本检索延迟降低 22%。",
    "实验 C 计划：使用内部 12 万条长文本语料，对比稠密检索器与稀疏检索器的召回@10。",
    "组会 memo 大纲：1) 实验 B 结论（F1 0.82，+3pt）2) 实验 C 计划 3) 风险：长文本语料标注成本。",
  ];
  uploaded.forEach((c, i) => {
    chunks.push({
      id: `chk_doc_${i + 1}`,
      doc_id: "doc_uploaded",
      user_id: userId,
      content: c,
      metadata: { source: "uploaded" },
    });
  });

  return { events, memoryCards, reminders, chunks };
}
