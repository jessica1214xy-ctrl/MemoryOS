"use client";
import { useApi } from "@/lib/api-client";
import { MemoryCard } from "@/components/MemoryCard";
import { AskPanel } from "@/components/AskPanel";
import { SkeletonList } from "@/components/States";
import type { MemoryCard as MC } from "@/lib/types";

export default function KnowledgePage() {
  const { data, isLoading } = useApi<{ cards: MC[] }>("/memory-cards");
  const cards = data?.cards ?? [];

  return (
    <div className="grid lg:grid-cols-[1fr_360px] lg:gap-6">
      <div>
        <header className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">个人知识库</h1>
          <p className="text-sm text-muted-foreground mt-1">
            自动沉淀「上次聊到哪 / 做到哪一步」的结构化记忆。
          </p>
        </header>
        {isLoading && <SkeletonList />}
        <div className="space-y-3">
          {cards.map((c) => (
            <MemoryCard key={c.id} c={c} />
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
