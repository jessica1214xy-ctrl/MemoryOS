import { NextRequest, NextResponse } from "next/server";
import { getMemoryCards } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? undefined;
  const cards = getMemoryCards(type);
  return NextResponse.json({ code: 0, data: { cards }, message: "ok" });
}
