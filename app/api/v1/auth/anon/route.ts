import { NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/store";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({
    code: 0,
    data: { token: "demo-token", temp_user_id: DEMO_USER_ID },
    message: "ok",
  });
}
