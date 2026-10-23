import { NextRequest, NextResponse } from "next/server";
import { getResumeContext } from "@/lib/store";
import type { DeviceSource } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const device = searchParams.get("device") as DeviceSource | null;
  const res = getResumeContext(device ?? undefined);
  return NextResponse.json({ code: 0, data: res, message: "ok" });
}
