import { NextResponse } from "next/server";
import { getCategoryById, upsertSyncedProducts } from "@/lib/catalog-store";
import { syncSearch } from "@/lib/coupang";

const SYNC_LIMIT = 20;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  const { categoryId } = await params;
  const id = Number(categoryId);
  const category = getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: "존재하지 않는 카테고리입니다." }, { status: 404 });
  }

  try {
    const items = await syncSearch(category.name, SYNC_LIMIT);
    const syncedCount = upsertSyncedProducts(category.id, items);
    return NextResponse.json({ category: category.name, syncedCount });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "동기화 중 오류가 발생했습니다." },
      { status: 502 }
    );
  }
}
