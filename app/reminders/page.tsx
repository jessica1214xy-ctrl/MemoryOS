"use client";
import { Icon } from "@/components/Icon";
import { ReminderCard } from "@/components/ReminderCard";
import { useApi } from "@/lib/api-client";
import { EmptyState } from "@/components/States";
import type { Reminder } from "@/lib/types";

export default function RemindersPage() {
  const { data, isLoading, error, mutate } = useApi<{ reminders: Reminder[] }>(
    "/reminders?status=pending",
  );
  const list = data?.reminders ?? [];

  return (
    <div className="max-w-[760px]">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">主动提醒</h1>
        <p className="text-sm text-muted-foreground mt-1">
          系统基于你的时间线，主动提醒遗忘的研究碎片。
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">加载中…</p>}
      {error && <p className="text-sm text-destructive">加载失败</p>}
      {!isLoading && !error && list.length === 0 && (
        <EmptyState
          title="暂无主动提醒"
          hint="MemoryOS 会在合适时机提醒你遗忘的研究碎片。"
        />
      )}

      <div className="space-y-3">
        {list.map((r) => (
          <ReminderCard key={r.id} r={r} onChanged={() => mutate()} />
        ))}
      </div>
    </div>
  );
}
