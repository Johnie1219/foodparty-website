import type { Nutrition } from "./types";

/**
 * 식약처 식품영양성분 데이터 기반 간이 영양 DB (100g 기준).
 * key 는 상품명에서 탐색할 한글 키워드.
 * 실제 서비스에서는 식약처 OpenAPI(식품영양성분 DB) 로 대체할 수 있다.
 */
type NutritionRow = Omit<Nutrition, "name"> & { aliases?: string[] };

export const NUTRITION_DB: Record<string, NutritionRow> = {
  닭가슴살: { calories: 165, protein: 31, fat: 3.6, saturatedFat: 1, carbs: 0, sugar: 0, fiber: 0, sodium: 74 },
  닭안심: { calories: 109, protein: 23, fat: 1.2, saturatedFat: 0.3, carbs: 0, sugar: 0, fiber: 0, sodium: 60 },
  소고기: { calories: 250, protein: 26, fat: 15, saturatedFat: 6, carbs: 0, sugar: 0, fiber: 0, sodium: 72, aliases: ["한우", "안심", "등심", "채끝"] },
  삼겹살: { calories: 331, protein: 17, fat: 28, saturatedFat: 10, carbs: 0, sugar: 0, fiber: 0, sodium: 60, aliases: ["돼지고기", "목살"] },
  연어: { calories: 208, protein: 20, fat: 13, saturatedFat: 3, carbs: 0, sugar: 0, fiber: 0, sodium: 59 },
  고등어: { calories: 205, protein: 19, fat: 14, saturatedFat: 3.5, carbs: 0, sugar: 0, fiber: 0, sodium: 90 },
  참치캔: { calories: 116, protein: 26, fat: 1, saturatedFat: 0.3, carbs: 0, sugar: 0, fiber: 0, sodium: 247, aliases: ["참치"] },
  새우: { calories: 99, protein: 24, fat: 0.3, saturatedFat: 0.1, carbs: 0.2, sugar: 0, fiber: 0, sodium: 111 },
  계란: { calories: 143, protein: 13, fat: 9.5, saturatedFat: 3.1, carbs: 0.7, sugar: 0.4, fiber: 0, sodium: 142, aliases: ["달걀", "에그", "구운란", "훈제란"] },
  두부: { calories: 76, protein: 8, fat: 4.8, saturatedFat: 0.7, carbs: 1.9, sugar: 0.5, fiber: 0.3, sodium: 7 },
  우유: { calories: 60, protein: 3.2, fat: 3.3, saturatedFat: 1.9, carbs: 4.8, sugar: 4.8, fiber: 0, sodium: 40, aliases: ["멸균우유", "저지방우유"] },
  그릭요거트: { calories: 59, protein: 10, fat: 0.4, saturatedFat: 0.1, carbs: 3.6, sugar: 3.2, fiber: 0, sodium: 36, aliases: ["요거트", "요구르트"] },
  치즈: { calories: 402, protein: 25, fat: 33, saturatedFat: 21, carbs: 1.3, sugar: 0.5, fiber: 0, sodium: 621, aliases: ["체다", "모짜렐라"] },
  오트밀: { calories: 389, protein: 17, fat: 7, saturatedFat: 1.2, carbs: 66, sugar: 1, fiber: 11, sodium: 2, aliases: ["귀리"] },
  현미: { calories: 370, protein: 7.9, fat: 2.9, saturatedFat: 0.6, carbs: 77, sugar: 0.7, fiber: 3.5, sodium: 4, aliases: ["현미밥"] },
  백미: { calories: 365, protein: 6.7, fat: 0.7, saturatedFat: 0.2, carbs: 80, sugar: 0.1, fiber: 1.3, sodium: 1, aliases: ["쌀", "흰쌀밥"] },
  고구마: { calories: 86, protein: 1.6, fat: 0.1, saturatedFat: 0, carbs: 20, sugar: 4.2, fiber: 3, sodium: 55 },
  감자: { calories: 77, protein: 2, fat: 0.1, saturatedFat: 0, carbs: 17, sugar: 0.8, fiber: 2.2, sodium: 6 },
  바나나: { calories: 89, protein: 1.1, fat: 0.3, saturatedFat: 0.1, carbs: 23, sugar: 12, fiber: 2.6, sodium: 1 },
  사과: { calories: 52, protein: 0.3, fat: 0.2, saturatedFat: 0, carbs: 14, sugar: 10, fiber: 2.4, sodium: 1 },
  블루베리: { calories: 57, protein: 0.7, fat: 0.3, saturatedFat: 0, carbs: 14, sugar: 10, fiber: 2.4, sodium: 1 },
  아보카도: { calories: 160, protein: 2, fat: 15, saturatedFat: 2.1, carbs: 9, sugar: 0.7, fiber: 7, sodium: 7 },
  토마토: { calories: 18, protein: 0.9, fat: 0.2, saturatedFat: 0, carbs: 3.9, sugar: 2.6, fiber: 1.2, sodium: 5, aliases: ["방울토마토"] },
  브로콜리: { calories: 34, protein: 2.8, fat: 0.4, saturatedFat: 0, carbs: 7, sugar: 1.7, fiber: 2.6, sodium: 33 },
  아몬드: { calories: 579, protein: 21, fat: 50, saturatedFat: 3.8, carbs: 22, sugar: 4.4, fiber: 12, sodium: 1, aliases: ["견과", "견과류", "호두", "캐슈넛"] },
  땅콩버터: { calories: 588, protein: 25, fat: 50, saturatedFat: 10, carbs: 20, sugar: 9, fiber: 6, sodium: 17 },
  김: { calories: 35, protein: 5.8, fat: 0.3, saturatedFat: 0, carbs: 5.1, sugar: 0, fiber: 0, sodium: 48, aliases: ["조미김"] },
  미역: { calories: 45, protein: 3, fat: 0.6, saturatedFat: 0.1, carbs: 9, sugar: 0.6, fiber: 0.3, sodium: 872 },
  김치: { calories: 32, protein: 1.7, fat: 0.5, saturatedFat: 0.1, carbs: 6, sugar: 2.4, fiber: 1.6, sodium: 498 },
  단백질바: { calories: 350, protein: 30, fat: 12, saturatedFat: 6, carbs: 35, sugar: 6, fiber: 5, sodium: 200, aliases: ["프로틴바"] },
  시리얼: { calories: 379, protein: 7, fat: 4, saturatedFat: 1, carbs: 84, sugar: 30, fiber: 4, sodium: 480, aliases: ["콘푸로스트", "그래놀라"] },
  식빵: { calories: 265, protein: 9, fat: 3.2, saturatedFat: 0.7, carbs: 49, sugar: 5, fiber: 2.7, sodium: 491, aliases: ["빵"] },
  파스타: { calories: 371, protein: 13, fat: 1.5, saturatedFat: 0.3, carbs: 75, sugar: 2.7, fiber: 3.2, sodium: 6, aliases: ["스파게티", "면"] },
  라면: { calories: 448, protein: 9, fat: 16, saturatedFat: 8, carbs: 65, sugar: 4, fiber: 2, sodium: 1790 },
  과자: { calories: 480, protein: 6, fat: 24, saturatedFat: 11, carbs: 60, sugar: 25, fiber: 1.5, sodium: 420, aliases: ["스낵", "감자칩", "쿠키", "비스킷"] },
  초콜릿: { calories: 546, protein: 4.9, fat: 31, saturatedFat: 19, carbs: 61, sugar: 48, fiber: 7, sodium: 24 },
  콜라: { calories: 42, protein: 0, fat: 0, saturatedFat: 0, carbs: 11, sugar: 11, fiber: 0, sodium: 4, aliases: ["탄산음료", "사이다"] },
  소시지: { calories: 301, protein: 12, fat: 27, saturatedFat: 10, carbs: 3, sugar: 1, fiber: 0, sodium: 848, aliases: ["비엔나"] },
  햄: { calories: 145, protein: 19, fat: 6.5, saturatedFat: 2.2, carbs: 1.5, sugar: 1, fiber: 0, sodium: 1203 },
  만두: { calories: 220, protein: 8, fat: 9, saturatedFat: 3.5, carbs: 27, sugar: 1.5, fiber: 1.5, sodium: 450 },
  치킨: { calories: 246, protein: 19, fat: 15, saturatedFat: 4.3, carbs: 8, sugar: 0.5, fiber: 0.3, sodium: 540, aliases: ["프라이드", "양념치킨"] },
  피자: { calories: 266, protein: 11, fat: 10, saturatedFat: 4.5, carbs: 33, sugar: 3.6, fiber: 2.3, sodium: 598 },
};

/** 상품명에서 가장 잘 맞는 영양 정보를 찾는다 (가장 긴 키워드 우선). */
export function matchNutrition(productName: string): Nutrition | null {
  const name = productName.replace(/\s+/g, "");
  let best: { key: string; len: number } | null = null;

  for (const [key, row] of Object.entries(NUTRITION_DB)) {
    const candidates = [key, ...(row.aliases ?? [])];
    for (const c of candidates) {
      if (name.includes(c)) {
        if (!best || c.length > best.len) best = { key, len: c.length };
      }
    }
  }

  if (!best) return null;
  const row = NUTRITION_DB[best.key];
  return { name: best.key, ...stripAliases(row) };
}

function stripAliases(row: NutritionRow): Omit<Nutrition, "name"> {
  const { aliases: _aliases, ...rest } = row;
  void _aliases;
  return rest;
}

/**
 * 건강 점수 (0~100). 100g 기준 영양을 바탕으로 계산.
 * 긍정 요소: 단백질, 식이섬유 / 부정 요소: 당류, 포화지방, 나트륨, 열량.
 */
export function healthScore(n: Nutrition): number {
  // 항목별 0~1 정규화 후 가중 합산
  const good =
    clamp01(n.protein / 30) * 0.5 + // 단백질 (30g=만점)
    clamp01(n.fiber / 12) * 0.5; // 식이섬유 (12g=만점)

  const bad =
    clamp01(n.sugar / 40) * 0.3 + // 당류
    clamp01(n.saturatedFat / 20) * 0.3 + // 포화지방
    clamp01(n.sodium / 1500) * 0.25 + // 나트륨
    clamp01(n.calories / 500) * 0.15; // 열량

  // 기준점 50 + 좋은 요소(최대 +40) - 나쁜 요소(최대 -45)
  const score = 50 + good * 40 - bad * 45;
  return Math.round(clamp(score, 0, 100));
}

function clamp01(x: number): number {
  return clamp(x, 0, 1);
}
function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}
