import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/coupang";
import type { SearchResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = (searchParams.get("q") ?? "").trim();
  const limit = Math.min(Number(searchParams.get("limit") ?? 12) || 12, 30);

  if (!keyword) {
    return NextResponse.json({ error: "검색어(q)를 입력하세요." }, { status: 400 });
  }

  try {
    const result = await searchProducts(keyword, limit);
    const body: SearchResponse & { _debug?: unknown } = {
      keyword,
      live: result.live,
      products: result.products,
    };
    // 개발/디버깅용: 에러 정보 포함
    if ("error" in result) body._debug = (result as Record<string, unknown>).error;
    return NextResponse.json(body);
  } catch (err) {
    console.error("[api/search]", err);
    return NextResponse.json({ error: "검색 중 오류가 발생했습니다.", _debug: String(err) }, { status: 500 });
  }
}
