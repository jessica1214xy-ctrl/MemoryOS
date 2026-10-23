import { NextRequest, NextResponse } from "next/server";
import { dismissReminder } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let action: "dismiss" | "snooze" = "dismiss";
  let snooze_until: string | undefined;
  try {
    const body = await req.json();
    action = body?.action === "snooze" ? "snooze" : "dismiss";
    snooze_until = body?.snooze_until;
  } catch {
    // 默认 dismiss
  }
  const reminder = dismissReminder(id, action, snooze_until);
  if (!reminder) {
    return NextResponse.json(
      { code: 1, data: null, message: "提醒不存在" },
      { status: 404 },
    );
  }
  return NextResponse.json({ code: 0, data: { reminder }, message: "ok" });
}
