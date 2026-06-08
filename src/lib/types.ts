// 공통 타입 정의

/** 100g 기준 영양 성분 */
export interface Nutrition {
  /** 매칭에 사용된 음식 이름 */
  name: string;
  /** 열량 (kcal) */
  calories: number;
  /** 단백질 (g) */
  protein: number;
  /** 지방 (g) */
  fat: number;
  /** 포화지방 (g) */
  saturatedFat: number;
  /** 탄수화물 (g) */
  carbs: number;
  /** 당류 (g) */
  sugar: number;
  /** 식이섬유 (g) */
  fiber: number;
  /** 나트륨 (mg) */
  sodium: number;
}

/** 쿠팡 검색 결과 상품 */
export interface Product {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  /** 쿠팡 파트너스 제휴 링크 (수익 발생) */
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
  /** 매칭된 영양 성분 (100g 기준) */
  nutrition: Nutrition | null;
  /** 0~100 건강 점수 (높을수록 건강) */
  healthScore: number | null;
}

export interface SearchResponse {
  keyword: string;
  /** 실제 쿠팡 API 사용 여부 (false면 데모 데이터) */
  live: boolean;
  products: Product[];
}
