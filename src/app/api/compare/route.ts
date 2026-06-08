import { NextResponse } from "next/server";
import { getProductsByIds, normalizePer100g } from "@/lib/catalog-store";
import type { ComparisonProduct } from "@/lib/types";

const MAX_COMPARE = 4;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const productIds = body?.product_ids;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "product_ids 배열이 필요합니다." }, { status: 400 });
  }
  if (productIds.length > MAX_COMPARE) {
    return NextResponse.json(
      { error: `최대 ${MAX_COMPARE}개까지 비교할 수 있습니다.` },
      { status: 400 }
    );
  }

  const ids = productIds.map(Number).filter((n) => Number.isFinite(n));
  const products = getProductsByIds(ids);

  const result: ComparisonProduct[] = products.map((p) => ({
    ...p,
    normalized: normalizePer100g(p),
  }));

  return NextResponse.json({ products: result });
}
