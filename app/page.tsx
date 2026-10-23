"use client";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { TimelineItem } from "@/components/TimelineItem";
import { AskPanel } from "@/components/AskPanel";
import { SkeletonList, ErrorState, EmptyState } from "@/components/States";
import { useApi } from "@/lib/api-client";
import { DEVICE_META, type DeviceSource, type TimelineEvent } from "@/lib/types";

function TimelineView() {
  const { data, isLoading, error, mutate } = useApi<{ items: TimelineEvent[] }>(
    "/timeline?limit=40",
  );
  const [device, setDevice] = useState<DeviceSource | "all">("all");
  const params = useSearchParams();
  const hl = params.get("event");

  const items = useMemo(() => {
    const list = data?.items ?? [];
    return device === "all"
      ? list
      : list.filter((e) => e.device_source === device);
  }, [data, device]);

  const devices: (DeviceSource | "all")[] = [
    "all",
    "lab_computer",
    "phone",
    "tablet",
    "wechat",
    "email",
  ];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] lg:gap-6">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">跨设备时间线</h1>
          <p className="text-sm text-muted-foreground mt-1">
            你的研究记忆，按设备归一成一条连续流。
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-4">
          {devices.map((d) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                device === d
                  ? "border-primary text-primary bg-accent-soft"
                  : "border-border text-foreground-2 hover:bg-surface-2"
              }`}
            >
              {d !== "all" && (
                <Icon name={DEVICE_META[d as DeviceSource].icon} size={16} />
              )}
              {d === "all" ? "全部" : DEVICE_META[d as DeviceSource].label}
            </button>
          ))}
        </div>

        {isLoading && <SkeletonList />}
        {error && <ErrorState onRetry={() => mutate()} />}
        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            title="连接你的第一个设备，开始汇聚记忆。"
            hint="试试问：上周和导师定了什么实验下一步？"
          />
        )}

        <div className="space-y-3">
          {items.map((e) => (
            <TimelineItem key={e.id} e={e} highlight={hl === e.id} />
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-6 h-[calc(100vh-7rem)]">
          <AskPanel embedded />
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={<div className="text-sm text-muted-foreground">加载中…</div>}
    >
      <TimelineView />
    </Suspense>
  );
}
