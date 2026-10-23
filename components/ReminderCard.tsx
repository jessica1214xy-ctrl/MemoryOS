"use client";
import { Bell, BellOff, AlarmClock, Check } from "lucide-react";
import { Icon } from "./Icon";
import type { Reminder } from "@/lib/types";
import { api } from "@/lib/api-client";

export function ReminderCard({ r, onChanged }: { r: Reminder; onChanged: () => void }) {
  const dismiss = async (action: "dismiss" | "snooze") => {
    await api(`/reminders/${r.id}/dismiss`, {
      method: "POST",
      body: JSON.stringify({ action }),
    });
    onChanged();
  };

  return (
    <div className="card p-4 border-l-2 border-l-ai">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-8 h-8 rounded-md bg-ai-soft flex items-center justify-center text-ai shrink-0">
          <Icon name="Bell" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-[15px]">{r.title}</h3>
          <p className="mt-1 text-sm text-foreground-2">{r.body}</p>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => dismiss("dismiss")}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border text-foreground-2 hover:bg-surface-2"
            >
              <BellOff size={14} strokeWidth={1.75} /> 忽略
            </button>
            <button
              onClick={() => dismiss("snooze")}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border text-foreground-2 hover:bg-surface-2"
            >
              <AlarmClock size={14} strokeWidth={1.75} /> 稍后
            </button>
            <button
              onClick={() => dismiss("dismiss")}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md btn-primary"
            >
              <Check size={14} strokeWidth={1.75} /> 已处理
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
