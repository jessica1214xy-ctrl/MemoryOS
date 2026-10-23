import { NextResponse } from "next/server";
import { getTimeline } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  const items = getTimeline({});
  return NextResponse.json({
    code: 0,
    data: { inserted: items.length },
    message: "ok",
  });
}
