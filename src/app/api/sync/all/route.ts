import { NextResponse } from "next/server";
import { CATEGORIES, upsertSyncedProducts } from "@/lib/catalog-store";
import { syncSearch } from "@/lib/coupang";

const SYNC_LIMIT = 20;
/** 쿠팡파트너스 Search API: 시간당 10회 제한 */
const HOURLY_RATE_LIMIT = 10;
/** 카테고리 간 호출 딜레이 (rate limit 고려) */
const DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST() {
  if (CATEGORIES.length > HOURLY_RATE_LIMIT) {
    return NextResponse.json(
      {
        warning: `카테고리 수(${CATEGORIES.length}개)가 쿠팡파트너스 Search API의 시간당 호출 제한(${HOURLY_RATE_LIMIT}회)을 초과하여 전체 동기화를 진행할 수 없습니다.`,
      },
      { status: 429 }
    );
  }

  const results: { category: string; syncedCount?: number; error?: string }[] = [];

  for (let i = 0; i < CATEGORIES.length; i++) {
    const category = CATEGORIES[i];
    try {
      const items = await syncSearch(category.name, SYNC_LIMIT);
      const syncedCount = upsertSyncedProducts(category.id, items);
      results.push({ category: category.name, syncedCount });
    } catch (err) {
      results.push({
        category: category.name,
        error: err instanceof Error ? err.message : "동기화 중 오류가 발생했습니다.",
      });
    }
    if (i < CATEGORIES.length - 1) await delay(DELAY_MS);
  }

  return NextResponse.json({ results });
}
