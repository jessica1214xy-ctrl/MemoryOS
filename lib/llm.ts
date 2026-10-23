// MemoryOS 知识库问答适配层（Spec §4.2 / ADR-001）
// 生产：配置 CLOUDBASE_AI_GATEWAY 走 CloudBase AI 网关（免密钥）。
// 开发：未配置时回退演示检索回答（基于个人知识库关键词检索 + 引用溯源）。
import { searchChunks, toSourceRefs } from "./store";
import type { SourceRef } from "./types";

export interface QueryInput {
  question: string;
  top_k?: number;
}

export interface QueryOutput {
  answer: string;
  sources: SourceRef[];
  demo: boolean;
}

export async function queryKnowledge(q: QueryInput): Promise<QueryOutput> {
  const k = q.top_k ?? 4;
  const chunks = searchChunks(q.question, k);

  if (chunks.length === 0) {
    return {
      answer:
        "我在你的记忆里没找到直接相关的内容。可以换个说法，或先多记录一些研究碎片。",
      sources: [],
      demo: true,
    };
  }

  // —— 真实大模型路径（CloudBase AI 网关，免密钥）——
  const gateway = process.env.CLOUDBASE_AI_GATEWAY;
  if (gateway) {
    try {
      const ctx = chunks
        .map((c, i) => `[${i + 1}] ${c.content}`)
        .join("\n");
      const sys =
        "你是研究生的个人记忆助手，仅基于提供的记忆片段用简体中文回答，并在相关句末标注引用编号，如（来源1）。不要编造片段外的内容。";
      const res = await fetch(gateway, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env.CLOUDBASE_AI_MODEL ?? "deepseek-v3",
          messages: [
            { role: "system", content: sys },
            {
              role: "user",
              content: `记忆片段：\n${ctx}\n\n问题：${q.question}`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const answer: string | undefined =
          data?.choices?.[0]?.message?.content;
        if (answer) {
          return { answer, sources: toSourceRefs(chunks), demo: false };
        }
      }
    } catch {
      // 落到演示兜底
    }
  }

  // —— 演示兜底（未接入真实模型）——
  const answer = buildDemoAnswer(chunks);
  return { answer, sources: toSourceRefs(chunks), demo: true };
}

function buildDemoAnswer(chunks: ReturnType<typeof searchChunks>): string {
  const top = chunks.slice(0, 3);
  const lines = top
    .map((c, i) => `（来源${i + 1}）${c.content}`)
    .join("\n");
  return (
    `根据我的记忆：\n${lines}\n\n` +
    "（演示模式：未接入云端大模型，以上为基于你个人知识库的检索结果；点击引用可跳转原始事件。）"
  );
}
