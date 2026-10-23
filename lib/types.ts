// MemoryOS 核心类型定义（Spec §6/§7 锁定）

export type DeviceSource =
  | "lab_computer"
  | "phone"
  | "tablet"
  | "wechat"
  | "email";

export const DEVICE_META: Record<
  DeviceSource,
  { label: string; icon: string }
> = {
  lab_computer: { label: "实验室电脑", icon: "Monitor" },
  phone: { label: "手机", icon: "Smartphone" },
  tablet: { label: "平板", icon: "Tablet" },
  wechat: { label: "微信", icon: "MessageCircle" },
  email: { label: "邮箱", icon: "Mail" },
};

export type EventType =
  | "paper_read"
  | "note"
  | "chat_with_advisor"
  | "experiment_step"
  | "bookmark"
  | "email"
  | "sync";

export interface TimelineEvent {
  id: string;
  user_id: string;
  device_source: DeviceSource;
  event_type: EventType;
  title: string;
  summary: string;
  payload: Record<string, unknown>;
  occurred_at: string; // ISO
  is_simulated: boolean;
  has_breakpoint?: boolean; // 可续接
  breakpoint_detail?: string; // 例如 "论文A 第3页"
}

export type MemoryCardType = "auto_memory" | "resume_context";

export interface MemoryCard {
  id: string;
  user_id: string;
  title: string;
  content: string;
  card_type: MemoryCardType;
  source_event_id?: string;
  created_at: string;
}

export type ReminderTrigger =
  | "time_after_event"
  | "before_deadline"
  | "keyword_in_event";

export type ReminderStatus =
  | "pending"
  | "dismissed"
  | "snoozed"
  | "done";

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  body: string;
  trigger_type: ReminderTrigger;
  status: ReminderStatus;
  due_at: string;
  created_at: string;
  related_event_id?: string;
  snooze_until?: string;
}

export interface KbDocument {
  id: string;
  user_id: string;
  filename: string;
  status: "processing" | "done" | "failed";
  chunk_count: number;
  created_at: string;
}

export interface KbChunk {
  id: string;
  doc_id: string;
  user_id: string;
  content: string;
  metadata: Record<string, unknown>;
  source_event_id?: string;
}

export interface SourceRef {
  doc_id: string;
  chunk_id: string;
  event_id?: string;
  excerpt: string;
}

export interface KbQueryResult {
  answer: string;
  sources: SourceRef[];
  demo: boolean; // 是否演示兜底（未接真实大模型）
}

export interface ApiEnvelope<T> {
  code: number;
  data: T;
  message: string;
}
