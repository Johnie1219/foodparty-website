import { NextResponse } from "next/server";
import { getCategoryByName, listCategorySummaries, listProducts } from "@/lib/catalog-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryName = searchParams.get("category");

  let categoryId: number | undefined;
  if (categoryName) {
    const category = getCategoryByName(categoryName);
    if (!category) {
      return NextResponse.json({ error: "존재하지 않는 카테고리입니다." }, { status: 404 });
    }
    categoryId = category.id;
  }

  return NextResponse.json({
    categories: listCategorySummaries(),
    products: listProducts(categoryId),
  });
}
