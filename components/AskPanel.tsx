"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "./Icon";
import { api } from "@/lib/api-client";
import type { KbQueryResult } from "@/lib/types";

const SUGGESTIONS = [
  "上周和导师定了什么实验下一步？",
  "实验 B 做到哪一步了？",
  "我收藏了哪些论文还没读？",
  "实验 C 计划用什么数据集？",
];

export function AskPanel({ embedded }: { embedded?: boolean }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KbQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const ask = async (question: string) => {
    if (!question.trim()) return;
    setQ(question);
    setLoading(true);
    setError(null);
    try {
      const r = await api<KbQueryResult>("/kb/query", {
        method: "POST",
        body: JSON.stringify({ question }),
      });
      setResult(r);
    } catch {
      setError("网络异常，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`card flex flex-col overflow-hidden ${embedded ? "h-full" : ""}`}>
      <div className="ai-marker" />
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <Icon name="MessageSquare" size={20} className="text-ai" />
        <span className="font-semibold text-foreground">问问你的记忆</span>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-3">
        {!result && !loading && !error && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p>用自然语言问你的跨设备记忆，例如：</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="block w-full text-left text-sm px-3 py-2 rounded-md bg-surface-2 hover:bg-border text-foreground-2 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="LoaderCircle" size={16} className="animate-spin" /> 思考中…
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive flex items-center gap-1">
            <Icon name="AlertTriangle" size={16} /> {error}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <p className="text-sm text-foreground whitespace-pre-line">
              {result.answer}
            </p>
            {result.demo && (
              <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-surface-2 text-muted-foreground">
                演示模式（未接云端大模型，基于个人知识库检索）
              </span>
            )}
            {result.sources.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">引用来源</p>
                <div className="flex flex-wrap gap-2">
                  {result.sources.map((s, i) => (
                    <button
                      key={s.chunk_id}
                      onClick={() =>
                        s.event_id && router.push(`/?event=${s.event_id}`)
                      }
                      className="text-xs px-2 py-1 rounded-full border border-border text-foreground-2 hover:border-primary hover:text-primary transition-colors"
                    >
                      来源{i + 1}
                      {s.event_id ? " · 跳转事件" : ""}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(q)}
          placeholder="问问你的记忆…"
          className="flex-1 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground focus:border-primary outline-none"
        />
        <button
          onClick={() => ask(q)}
          className="btn-primary px-3 py-2 rounded-md flex items-center justify-center"
          aria-label="发送"
        >
          <Icon name="ArrowUp" size={20} />
        </button>
      </div>
    </div>
  );
}
