import { NextRequest, NextResponse } from "next/server";
import { getTimeline } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const device = searchParams.get("device") ?? undefined;
  const since = searchParams.get("since") ?? undefined;
  const limit = searchParams.get("limit")
    ? Number(searchParams.get("limit"))
    : 50;
  const items = getTimeline({ device, since, limit });
  return NextResponse.json({
    code: 0,
    data: { items, hasMore: false },
    message: "ok",
  });
}
