import { NextRequest, NextResponse } from "next/server";
import { getDocuments, addDocument } from "@/lib/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    code: 0,
    data: { documents: getDocuments() },
    message: "ok",
  });
}

export async function POST(req: NextRequest) {
  let filename = "未命名文档";
  try {
    const body = await req.json();
    filename = body?.filename ?? filename;
  } catch {
    // 忽略解析错误，用默认名
  }
  const doc = addDocument(filename);
  return NextResponse.json({ code: 0, data: doc, message: "ok" });
}
