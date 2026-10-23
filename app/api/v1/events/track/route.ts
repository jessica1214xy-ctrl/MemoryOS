import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 埋点：记录核心流程事件（Spec §10 埋点）。演示环境仅回显 ok。
  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    // 忽略
  }
  return NextResponse.json({ code: 0, data: { ok: true, received: payload }, message: "ok" });
}
