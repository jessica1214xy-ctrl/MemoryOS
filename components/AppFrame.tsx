"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const NAV = [
  { href: "/", label: "时间线", icon: "Clock" },
  { href: "/knowledge", label: "知识库", icon: "Brain" },
  { href: "/reminders", label: "提醒", icon: "Bell" },
  { href: "/ask", label: "问问", icon: "MessageSquare" },
];

export default function AppFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isActive = (h: string) =>
    h === "/" ? path === "/" : path.startsWith(h);

  return (
    <div className="min-h-screen">
      {/* 桌面左侧导航 */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[240px] flex-col border-r border-border bg-surface z-20">
        <div className="px-5 py-5 flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
            M
          </span>
          <span className="font-semibold text-foreground">MemoryOS</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive(n.href)
                  ? "bg-accent-soft text-primary"
                  : "text-foreground-2 hover:bg-surface-2"
              }`}
            >
              <Icon name={n.icon} size={20} />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 text-xs text-muted-foreground">
          研究生的跨设备记忆
        </div>
      </aside>

      {/* 主内容 */}
      <main className="lg:pl-[240px] min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 lg:px-8 py-6 pb-24 lg:pb-6">
          {children}
        </div>
      </main>

      {/* 移动端底部 TabBar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-surface border-t border-border grid grid-cols-4 z-20">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`flex flex-col items-center gap-1 py-2 text-[10px] ${
              isActive(n.href) ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon name={n.icon} size={24} />
            <span>{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
