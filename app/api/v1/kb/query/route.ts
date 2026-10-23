import { NextRequest, NextResponse } from "next/server";
import { queryKnowledge } from "@/lib/llm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let question = "";
  let top_k: number | undefined;
  try {
    const body = await req.json();
    question = body?.question ?? "";
    top_k = body?.top_k;
  } catch {
    return NextResponse.json(
      { code: 1, data: null, message: "请求体解析失败" },
      { status: 400 },
    );
  }
  if (!question.trim()) {
    return NextResponse.json(
      { code: 1, data: null, message: "问题不能为空" },
      { status: 400 },
    );
  }
  try {
    const result = await queryKnowledge({ question, top_k });
    return NextResponse.json({ code: 0, data: result, message: "ok" });
  } catch {
    return NextResponse.json({
      code: 0,
      data: {
        answer:
          "（降级）当前模型暂不可用，仅展示检索片段。请稍后重试。",
        sources: [],
        demo: true,
      },
      message: "degraded",
    });
  }
}
