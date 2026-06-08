import crypto from "crypto";
import type { Product } from "./types";
import { matchNutrition, healthScore } from "./nutrition";

/**
 * 쿠팡 파트너스 Open API 클라이언트.
 * 환경변수에 키가 있으면 실시간 검색, 없으면 데모 데이터를 반환한다.
 *
 * 필요한 환경변수:
 *   COUPANG_ACCESS_KEY   파트너스 액세스 키
 *   COUPANG_SECRET_KEY   파트너스 시크릿 키
 *   COUPANG_SUB_ID       (선택) 채널/서브 아이디 트래킹 코드
 */

const DOMAIN = "https://api-gateway.coupang.com";
const SEARCH_PATH =
  "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";

export function hasCoupangKeys(): boolean {
  return Boolean(process.env.COUPANG_ACCESS_KEY && process.env.COUPANG_SECRET_KEY);
}

/** 쿠팡 파트너스 HMAC 서명 Authorization 헤더 생성 */
function buildAuthHeader(method: string, path: string, query: string): string {
  const accessKey = process.env.COUPANG_ACCESS_KEY!;
  const secretKey = process.env.COUPANG_SECRET_KEY!;

  // 형식: yyMMdd'T'HHmmss'Z' (GMT)
  // toISOString: 2026-06-08T01:02:03.000Z -> 260608T010203Z
  const iso = new Date().toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  const signedDate =
    iso.slice(2, 4) + // yy
    iso.slice(5, 7) + // MM
    iso.slice(8, 10) + // dd
    "T" +
    iso.slice(11, 13) + // HH
    iso.slice(14, 16) + // mm
    iso.slice(17, 19) + // ss
    "Z";

  const message = signedDate + method + path + query;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

interface CoupangApiItem {
  productId: number;
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
}

/** 쿠팡 파트너스 Search API 호출 (서명/요청 공통 로직) */
async function fetchCoupangSearch(keyword: string, limit: number): Promise<CoupangApiItem[]> {
  const subId = process.env.COUPANG_SUB_ID;
  const params = new URLSearchParams({ keyword, limit: String(limit) });
  if (subId) params.set("subId", subId);
  const query = params.toString();

  const auth = buildAuthHeader("GET", SEARCH_PATH, query);
  const res = await fetch(`${DOMAIN}${SEARCH_PATH}?${query}`, {
    method: "GET",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Coupang API error ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as { data?: { productData?: CoupangApiItem[] } };
  return json.data?.productData ?? [];
}

/** 실시간 쿠팡 검색 (영양정보 매칭 포함, 자유 검색용) */
async function liveSearch(keyword: string, limit: number): Promise<Product[]> {
  const items = await fetchCoupangSearch(keyword, limit);
  return items.map(toProduct);
}

export interface SyncedCoupangItem {
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
}

/**
 * 카테고리 동기화용 검색. 영양성분은 쿠팡 API 응답에 없으므로 매칭하지 않고
 * 그대로 DB upsert 가능한 형태로 반환한다 (영양성분은 null로 저장됨).
 */
export async function syncSearch(keyword: string, limit: number): Promise<SyncedCoupangItem[]> {
  if (!hasCoupangKeys()) {
    throw new Error("쿠팡 파트너스 API 키(COUPANG_ACCESS_KEY/COUPANG_SECRET_KEY)가 설정되지 않았습니다.");
  }
  const items = await fetchCoupangSearch(keyword, limit);
  return items.map((item) => ({
    productName: item.productName,
    productPrice: item.productPrice,
    productImage: item.productImage,
    productUrl: item.productUrl,
    isRocket: item.isRocket,
    isFreeShipping: item.isFreeShipping,
  }));
}

function toProduct(item: CoupangApiItem): Product {
  const nutrition = matchNutrition(item.productName);
  return {
    productId: String(item.productId),
    productName: item.productName,
    productPrice: item.productPrice,
    productImage: item.productImage,
    productUrl: item.productUrl,
    isRocket: item.isRocket,
    isFreeShipping: item.isFreeShipping,
    nutrition,
    healthScore: nutrition ? healthScore(nutrition) : null,
  };
}

export async function searchProducts(
  keyword: string,
  limit = 12
): Promise<{ live: boolean; products: Product[] }> {
  if (hasCoupangKeys()) {
    try {
      const products = await liveSearch(keyword, limit);
      return { live: true, products };
    } catch (err) {
      console.error("[coupang] live search failed, falling back to demo:", err);
    }
  }
  return { live: false, products: demoSearch(keyword, limit) };
}

// ---------------------------------------------------------------------------
// 데모 데이터 (키가 없을 때). 영양 DB 키워드 기반으로 그럴듯한 상품을 생성한다.
// ---------------------------------------------------------------------------

import { NUTRITION_DB } from "./nutrition";

function demoSearch(keyword: string, limit: number): Product[] {
  const kw = keyword.replace(/\s+/g, "");
  const tracking = process.env.COUPANG_SUB_ID ?? "demo";

  // 검색어와 관련된 영양 DB 키워드 추출
  const keys = Object.keys(NUTRITION_DB).filter(
    (k) =>
      k.includes(kw) ||
      kw.includes(k) ||
      (NUTRITION_DB[k].aliases ?? []).some((a) => a.includes(kw) || kw.includes(a))
  );
  const baseKeys = keys.length > 0 ? keys : [kw];

  const brands = ["곰곰", "코멧", "본사직송", "건강한끼", "데일리", "프리미엄"];
  const products: Product[] = [];

  let i = 0;
  while (products.length < limit) {
    const key = baseKeys[i % baseKeys.length];
    const brand = brands[i % brands.length];
    const grams = [200, 300, 500, 1000][i % 4];
    const name = `${brand} ${key} ${grams}g${i >= baseKeys.length ? ` (${Math.floor(i / baseKeys.length) + 1}팩)` : ""}`;
    const nutrition = matchNutrition(name);
    const price = 4900 + (i % 6) * 2500;
    products.push({
      productId: `demo-${i}-${key}`,
      productName: name,
      productPrice: price,
      productImage: `https://placehold.co/240x240/f1f5f9/475569?text=${encodeURIComponent(key)}`,
      productUrl: `https://www.coupang.com/np/search?q=${encodeURIComponent(name)}&channel=affiliate&subId=${encodeURIComponent(tracking)}`,
      isRocket: i % 2 === 0,
      isFreeShipping: i % 3 !== 0,
      nutrition,
      healthScore: nutrition ? healthScore(nutrition) : null,
    });
    i++;
    if (i > limit * 3) break; // 안전장치
  }

  return products;
}
