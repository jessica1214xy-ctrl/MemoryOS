// MemoryOS 内存数据层（模拟数据层，Spec §4.1）。生产环境替换为 CloudBase PostgreSQL + pgvector。
import { buildSeed } from "./seed";
import type {
  TimelineEvent,
  MemoryCard,
  Reminder,
  KbChunk,
  SourceRef,
  DeviceSource,
} from "./types";

const DEMO_USER = "demo_user";

interface DB {
  userId: string;
  events: TimelineEvent[];
  memoryCards: MemoryCard[];
  reminders: Reminder[];
  chunks: KbChunk[];
}

// 跨 HMR/请求复用同一份内存数据
const g = globalThis as unknown as { __memoryos_db?: DB };
function db(): DB {
  if (!g.__memoryos_db) {
    const seed = buildSeed(DEMO_USER, Date.now());
    g.__memoryos_db = {
      userId: DEMO_USER,
      events: seed.events,
      memoryCards: seed.memoryCards,
      reminders: seed.reminders,
      chunks: seed.chunks,
    };
  }
  return g.__memoryos_db;
}

export const DEMO_USER_ID = DEMO_USER;

export function getTimeline(opts: {
  device?: string;
  since?: string;
  limit?: number;
}): TimelineEvent[] {
  let items = [...db().events].sort(
    (a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at),
  );
  if (opts.device) items = items.filter((e) => e.device_source === opts.device);
  if (opts.since)
    items = items.filter((e) => +new Date(e.occurred_at) > +new Date(opts.since!));
  if (opts.limit) items = items.slice(0, opts.limit);
  return items;
}

export function getEventById(id: string): TimelineEvent | undefined {
  return db().events.find((e) => e.id === id);
}

export function getMemoryCards(type?: string): MemoryCard[] {
  let cards = [...db().memoryCards];
  if (type) cards = cards.filter((c) => c.card_type === type);
  return cards;
}

export function getReminders(status?: string): Reminder[] {
  let list = [...db().reminders];
  if (status) list = list.filter((r) => r.status === status);
  return list.sort((a, b) => +new Date(b.due_at) - +new Date(a.due_at));
}

export function dismissReminder(
  id: string,
  action: "dismiss" | "snooze",
  snoozeUntil?: string,
): Reminder | undefined {
  const r = db().reminders.find((x) => x.id === id);
  if (!r) return undefined;
  if (action === "dismiss") {
    r.status = "dismissed";
    r.snooze_until = undefined;
  } else {
    r.status = "snoozed";
    r.snooze_until =
      snoozeUntil ?? new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  }
  return r;
}

// F4 跨设备续接：返回带断点的事件上下文
export function getResumeContext(device?: DeviceSource): {
  event?: TimelineEvent;
  context: string;
} {
  const bp = [...db().events]
    .filter((e) => e.has_breakpoint)
    .sort((a, b) => +new Date(b.occurred_at) - +new Date(a.occurred_at));
  const target = device ? bp.find((e) => e.device_source === device) : bp[0];
  if (!target) return { context: "暂无跨设备断点可续接。" };
  return {
    event: target,
    context: `在「${target.device_source}」上：${target.summary} 断点：${target.breakpoint_detail ?? "未指明"}。可在当前设备从此处继续。`,
  };
}

export function addDocument(filename: string): { id: string; chunk_count: number } {
  const id = `doc_${Date.now()}`;
  // 演示：把文件内容拆成一条 chunk
  db().chunks.push({
    id: `chk_${id}`,
    doc_id: id,
    user_id: DEMO_USER,
    content: `（演示文档）${filename} 的内容已索引。`,
    metadata: { source: "uploaded", filename },
  });
  return { id, chunk_count: 1 };
}

export function getDocuments() {
  const map = new Map<string, { id: string; chunk_count: number }>();
  for (const c of db().chunks) {
    if (c.doc_id === "doc_timeline") continue;
    const e = map.get(c.doc_id) ?? { id: c.doc_id, chunk_count: 0 };
    e.chunk_count += 1;
    map.set(c.doc_id, e);
  }
  return [...map.values()];
}

// 检索（关键词 + CJK 二元组打分），供 LLM 适配层使用
export function searchChunks(query: string, k = 4): KbChunk[] {
  const terms = tokenize(query);
  const chunks = db().chunks;
  const scored = chunks.map((c) => {
    const text = (c.content + " " + (c.metadata.event_type ?? "")).toLowerCase();
    let score = 0;
    for (const t of terms) if (text.includes(t)) score += t.length >= 2 ? 2 : 1;
    return { c, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.c);
}

function tokenize(q: string): string[] {
  const lower = q.toLowerCase().trim();
  const out = new Set<string>();
  // 英文/数字词
  for (const m of lower.match(/[a-z0-9]+/g) ?? []) out.add(m);
  // CJK 二元组
  const cjk = lower.match(/[\u4e00-\u9fff]+/g) ?? [];
  for (const seg of cjk) {
    for (let i = 0; i < seg.length - 1; i++) out.add(seg.slice(i, i + 2));
  }
  return [...out];
}

export function toSourceRefs(chunks: KbChunk[]): SourceRef[] {
  return chunks.map((c) => ({
    doc_id: c.doc_id,
    chunk_id: c.id,
    event_id: c.source_event_id,
    excerpt:
      c.content.length > 80 ? c.content.slice(0, 80) + "…" : c.content,
  }));
}
