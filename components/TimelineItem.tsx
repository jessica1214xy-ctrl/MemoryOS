"use client";
import { RefreshCw } from "lucide-react";
import { Icon } from "./Icon";
import { DEVICE_META, type TimelineEvent } from "@/lib/types";

function fmt(iso: string): string {
  const d = new Date(iso);
  const diffH = Math.round((Date.now() - d.getTime()) / 3600000);
  if (diffH < 1) return "刚刚";
  if (diffH < 24) return `${diffH} 小时前`;
  const diffD = Math.round(diffH / 24);
  return `${diffD} 天前`;
}

export function TimelineItem({
  e,
  highlight,
}: {
  e: TimelineEvent;
  highlight?: boolean;
}) {
  const meta = DEVICE_META[e.device_source];
  return (
    <div
      id={`event-${e.id}`}
      className={`card p-4 animate-fade-in transition-colors ${
        highlight ? "ring-2 ring-primary" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-8 h-8 rounded-md bg-surface-2 flex items-center justify-center text-muted-foreground shrink-0">
          <Icon name={meta.icon} size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">
              {fmt(e.occurred_at)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-2 text-foreground-2">
              {meta.label}
            </span>
            {e.has_breakpoint && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent-soft text-primary inline-flex items-center gap-1">
                <RefreshCw size={12} strokeWidth={1.75} /> 可续接
              </span>
            )}
          </div>
          <h3 className="mt-1 font-semibold text-foreground text-[15px]">
            {e.title}
          </h3>
          <p className="mt-1 text-sm text-foreground-2">{e.summary}</p>
          {e.has_breakpoint && (
            <button className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover">
              <RefreshCw size={16} strokeWidth={1.75} /> 续接：
              {e.breakpoint_detail}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
