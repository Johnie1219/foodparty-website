import type { CatalogProduct, NormalizedNutrition } from "./types";

export function formatPrice(won: number): string {
  return won.toLocaleString("ko-KR") + "원";
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/** 입력된 기준 중량(weightG)을 기준으로 100g당 값으로 정규화한다 (영양성분 미입력 시 null) */
export function normalizePer100g(p: CatalogProduct): NormalizedNutrition | null {
  if (!p.nutritionVerified || !p.weightG) return null;
  const factor = 100 / p.weightG;
  return {
    calories: round(p.calories! * factor),
    protein: round(p.protein! * factor),
    fat: round(p.fat! * factor),
    saturatedFat: round(p.saturatedFat! * factor),
    carbs: round(p.carbs! * factor),
    sugar: round(p.sugar! * factor),
    fiber: round(p.fiber! * factor),
    sodium: round(p.sodium! * factor),
  };
}

/** 100g당 정규화 영양성분으로 0~100 건강 점수를 산출한다 (단백질·식이섬유 가점, 당류·포화지방·나트륨·열량 감점) */
export function healthScoreFromNormalized(n: NormalizedNutrition): number {
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const good = clamp01(n.protein / 30) * 0.5 + clamp01(n.fiber / 12) * 0.5;
  const bad =
    clamp01(n.sugar / 40) * 0.3 +
    clamp01(n.saturatedFat / 20) * 0.3 +
    clamp01(n.sodium / 1500) * 0.25 +
    clamp01(n.calories / 500) * 0.15;
  const score = 50 + good * 40 - bad * 45;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/** 건강 점수에 따른 등급/색상 */
export function scoreGrade(score: number): {
  label: string;
  text: string;
  bg: string;
  ring: string;
} {
  if (score >= 75)
    return { label: "아주 좋음", text: "text-emerald-700", bg: "bg-emerald-100", ring: "ring-emerald-300" };
  if (score >= 55)
    return { label: "좋음", text: "text-lime-700", bg: "bg-lime-100", ring: "ring-lime-300" };
  if (score >= 40)
    return { label: "보통", text: "text-amber-700", bg: "bg-amber-100", ring: "ring-amber-300" };
  return { label: "주의", text: "text-rose-700", bg: "bg-rose-100", ring: "ring-rose-300" };
}
