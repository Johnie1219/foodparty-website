import { NextResponse } from "next/server";
import { getProduct, updateNutrition, type NutritionInput } from "@/lib/catalog-store";

const NUMBER_FIELDS = [
  "weight_g",
  "calories",
  "protein",
  "fat",
  "saturated_fat",
  "carbs",
  "sugar",
  "fiber",
  "sodium",
] as const;

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  if (!getProduct(productId)) {
    return NextResponse.json({ error: "존재하지 않는 상품입니다." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  for (const field of NUMBER_FIELDS) {
    const value = body[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return NextResponse.json({ error: `${field} 값은 0 이상의 숫자여야 합니다.` }, { status: 400 });
    }
  }
  if (body.weight_g === 0) {
    return NextResponse.json({ error: "weight_g 값은 0보다 커야 합니다." }, { status: 400 });
  }

  const input: NutritionInput = {
    weightG: body.weight_g,
    calories: body.calories,
    protein: body.protein,
    fat: body.fat,
    saturatedFat: body.saturated_fat,
    carbs: body.carbs,
    sugar: body.sugar,
    fiber: body.fiber,
    sodium: body.sodium,
    ingredients: typeof body.ingredients === "string" ? body.ingredients : "",
    keyFeatures: Array.isArray(body.key_features) ? body.key_features.map(String) : [],
  };

  const updated = updateNutrition(productId, input);
  return NextResponse.json({ product: updated });
}
