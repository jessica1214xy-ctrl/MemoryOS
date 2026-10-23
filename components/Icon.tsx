"use client";
import {
  Monitor,
  Smartphone,
  Tablet,
  MessageCircle,
  Mail,
  Clock,
  Bell,
  Brain,
  BookOpen,
  Search,
  MessageSquare,
  RefreshCw,
  Tag,
  AlarmClock,
  BellOff,
  Archive,
  Copy,
  Quote,
  Plug,
  LoaderCircle,
  Check,
  AlertTriangle,
  ArrowUp,
  Settings,
  X,
  Plus,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  Monitor,
  Smartphone,
  Tablet,
  MessageCircle,
  Mail,
  Clock,
  Bell,
  Brain,
  BookOpen,
  Search,
  MessageSquare,
  RefreshCw,
  Tag,
  AlarmClock,
  BellOff,
  Archive,
  Copy,
  Quote,
  Plug,
  LoaderCircle,
  Check,
  AlertTriangle,
  ArrowUp,
  Settings,
  X,
  Plus,
  ChevronRight,
};

export function Icon({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const C = ICONS[name] ?? Clock;
  return <C size={size} strokeWidth={1.75} className={className} />;
}
