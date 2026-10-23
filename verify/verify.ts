// MemoryOS 逻辑层运行时验证（不依赖 HTTP / 浏览器）
import {
  getTimeline,
  getMemoryCards,
  getReminders,
  dismissReminder,
  getResumeContext,
  getDocuments,
  searchChunks,
  toSourceRefs,
  addDocument,
} from "../lib/store";
import { queryKnowledge } from "../lib/llm";

let failures = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    failures++;
    console.error("  ✗ FAIL:", msg);
  } else {
    console.log("  ✓", msg);
  }
}

async function main() {
console.log("\n[1] 时间线种子数据");
const all = getTimeline({});
assert(all.length >= 20, `时间线事件数=${all.length} (要求 >=20)`);
const sortedDesc = all.every(
  (e, i) => i === 0 || +new Date(all[i - 1].occurred_at) >= +new Date(e.occurred_at),
);
assert(sortedDesc, "时间线按发生时间倒序排列");
const phoneOnly = getTimeline({ device: "phone" });
assert(
  phoneOnly.length > 0 && phoneOnly.every((e) => e.device_source === "phone"),
  `设备筛选(phone)命中=${phoneOnly.length} 条且全部来自手机`,
);
const limited = getTimeline({ limit: 5 });
assert(limited.length === 5, `limit=5 返回 ${limited.length} 条`);
// 校验每条事件都带 device_source（之前漏传的回归点）
assert(
  all.every((e) => typeof e.device_source === "string" && e.device_source.length > 0),
  "每条事件均含非空 device_source 字段",
);

console.log("\n[2] 记忆卡片 (F5 自动记忆)");
const cards = getMemoryCards();
assert(cards.length === 2, `记忆卡片数=${cards.length} (要求 2)`);
assert(
  cards.some((c) => c.title.includes("导师")),
  "存在『上次和导师聊到』的记忆卡",
);

console.log("\n[3] 主动提醒 (F2) + dismiss 写回");
const pending = getReminders("pending");
assert(pending.length === 3, `待处理提醒=${pending.length} (要求 3)`);
const dismissed = dismissReminder("rem_1", "dismiss");
assert(dismissed?.status === "dismissed", "dismiss 后状态变为 dismissed");
const snoozed = dismissReminder("rem_2", "snooze");
assert(snoozed?.status === "snoozed" && !!snoozed.snooze_until, "snooze 后状态 + snooze_until 写入");
// 重新读取（globalThis 复用应反映变更）
const afterPending = getReminders("pending");
assert(afterPending.length === 1, `dismiss/snooze 后待处理剩 ${afterPending.length} 条`);

console.log("\n[4] 跨设备续接 (F4 断点)");
const resume = getResumeContext();
assert(!!resume.event && !!resume.context, "续接接口返回断点事件 + 上下文文本");
assert(resume.event!.has_breakpoint === true, "续接命中的事件确实带 has_breakpoint");
const resumePhone = getResumeContext("phone");
assert(
  resumePhone.event === undefined || resumePhone.event.device_source === "phone",
  "按设备续接时命中的断点来自指定设备",
);

console.log("\n[5] 知识库检索 (F3) — CJK 二元组打分");
const ragHits = searchChunks("RAG 评测基准", 4);
assert(ragHits.length > 0, `关键词『RAG 评测基准』检索命中 ${ragHits.length} 条`);
const sparseHits = searchChunks("稀疏注意力 显存", 4);
assert(
  sparseHits.some((c) => c.content.includes("稀疏注意力")),
  "『稀疏注意力 显存』检索命中相关分块",
);

console.log("\n[6] 知识库问答适配层 (F3 — 演示兜底 / 真模型就绪)");
const q1 = await queryKnowledge({ question: "实验 B 的 F1 是多少？" });
assert(q1.answer.length > 0, "问答返回非空回答");
assert(q1.sources.length > 0, `问答带引用来源 ${q1.sources.length} 条`);
assert(q1.demo === true, "未配 CLOUDBASE_AI_GATEWAY → demo=true（演示兜底）");
const qEmpty = await queryKnowledge({ question: "qwertyuiop zxcvbnm asdfghjkl" });
assert(qEmpty.answer.length > 0 && qEmpty.sources.length === 0, "无相关分块时返回优雅兜底文案");

console.log("\n[7] 文档上传 + 文档列表");
const beforeDocs = getDocuments().length;
addDocument("我的实验笔记.pdf");
const afterDocs = getDocuments().length;
assert(afterDocs === beforeDocs + 1, `上传文档后文档数 ${beforeDocs} -> ${afterDocs}`);

console.log("\n[8] 引用溯源结构");
const refs = toSourceRefs(sparseHits);
assert(
  refs.every((r) => typeof r.excerpt === "string" && typeof r.chunk_id === "string"),
  "SourceRef 含 chunk_id 与 excerpt 字段",
);

console.log(`\n=== 结果：${failures === 0 ? "全部通过 ✓" : failures + " 项失败 ✗"} ===`);
process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
