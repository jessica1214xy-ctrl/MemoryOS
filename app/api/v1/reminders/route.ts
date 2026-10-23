import { NextRequest, NextResponse } from "next/server";
import { getReminders } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const list = getReminders(status);
  return NextResponse.json({ code: 0, data: { reminders: list }, message: "ok" });
}
