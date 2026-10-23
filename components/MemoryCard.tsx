"use client";
import { Icon } from "./Icon";
import type { MemoryCard } from "@/lib/types";

export function MemoryCard({ c }: { c: MemoryCard }) {
  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 w-8 h-8 rounded-md bg-accent-soft flex items-center justify-center text-primary shrink-0">
          <Icon name="Brain" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground text-[15px]">{c.title}</h3>
          <p className="mt-1 text-sm text-foreground-2 whitespace-pre-line">
            {c.content}
          </p>
        </div>
      </div>
    </div>
  );
}
