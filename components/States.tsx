"use client";
import { Icon } from "./Icon";

export function SkeletonList() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="h-4 w-1/3 bg-surface-2 rounded" />
          <div className="h-3 w-2/3 bg-surface-2 rounded mt-2" />
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="card p-6 text-center">
      <Icon name="AlertTriangle" size={24} className="mx-auto text-destructive" />
      <p className="mt-2 text-sm text-foreground-2">加载失败</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-sm text-primary">
          重试
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  title = "暂无内容",
  hint,
}: {
  title?: string;
  hint?: string;
}) {
  return (
    <div className="card p-8 text-center">
      <Icon name="Clock" size={24} className="mx-auto text-muted-foreground" />
      <p className="mt-2 text-sm text-foreground-2">{title}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
