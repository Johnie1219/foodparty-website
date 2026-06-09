import crypto from "crypto";
import type { Product } from "./types";
import { matchNutrition, healthScore } from "./nutrition";

const DOMAIN = "https://api-gateway.coupang.com";
const SEARCH_PATH = "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";

export function hasCoupangKeys(): boolean {
  return Boolean(process.env.COUPANG_ACCESS_KEY && process.env.COUPANG_SECRET_KEY);
}

/** yyMMdd'T'HHmmss'Z' (UTC) */
function getSignedDate(): string {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const MM = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const HH = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yy}${MM}${dd}T${HH}${mm}${ss}Z`;
}

function buildAuthHeader(method: string, path: string, query: string): string {
  const accessKey = process.env.COUPANG_ACCESS_KEY!;
  const secretKey = process.env.COUPANG_SECRET_KEY!;
  const signedDate = getSignedDate();
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

async function fetchCoupangSearch(keyword: string, limit: number): Promise<CoupangApiItem[]> {
  const subId = process.env.COUPANG_SUB_ID;

  // 파라미터를 알파벳순으로 정렬 (HMAC 서명 안정성)
  const paramObj: Record<string, string> = { keyword, limit: String(limit) };
  if (subId) paramObj.subId = subId;
  const sortedKeys = Object.keys(paramObj).sort();
  const query = sortedKeys.map((k) => `${k}=${encodeURIComponent(paramObj[k])}`).join("&");

  const auth = buildAuthHeader("GET", SEARCH_PATH, query);
  const url = `${DOMAIN}${SEARCH_PATH}?${query}`;

  console.log("[coupang] request url:", url);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json;charset=UTF-8",
    },
    cache: "no-store",
  });

  const text = await res.text();
  console.log("[coupang] status:", res.status, "body:", text.slice(0, 500));

  if (!res.ok) {
    throw new Error(`Coupang API ${res.status}: ${text}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Coupang API non-JSON response: ${text.slice(0, 200)}`);
  }

  // 응답 구조 유연하게 처리
  const data = (json as Record<string, unknown>);
  const productData =
    (data?.data as Record<string, unknown>)?.productData ??
    (data?.productData) ??
    [];

  console.log("[coupang] productData count:", Array.isArray(productData) ? productData.length : "not array");

  return Array.isArray(productData) ? (productData as CoupangApiItem[]) : [];
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

async function liveSearch(keyword: string, limit: number): Promise<Product[]> {
  const items = await fetchCoupangSearch(keyword, limit);
  return items.flatMap((item) => {
    try {
      return [toProduct(item)];
    } catch (e) {
      console.error("[coupang] toProduct failed:", e, item);
      return [];
    }
  });
}

export interface SyncedCoupangItem {
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
}

export async function syncSearch(keyword: string, limit: number): Promise<SyncedCoupangItem[]> {
  if (!hasCoupangKeys()) {
    throw new Error("쿠팡 파트너스 API 키가 설정되지 않았습니다.");
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

export async function searchProducts(
  keyword: string,
  limit = 12
): Promise<{ live: boolean; products: Product[] }> {
  if (hasCoupangKeys()) {
    try {
      const products = await liveSearch(keyword, limit);
      return { live: true, products };
    } catch (err) {
      console.error("[coupang] live search failed:", err);
      return { live: true, products: [], error: String(err) };
    }
  }
  return { live: false, products: demoSearch(keyword, limit) };
}

// ---------------------------------------------------------------------------
// 데모 데이터
// ---------------------------------------------------------------------------
import { NUTRITION_DB } from "./nutrition";

function demoSearch(keyword: string, limit: number): Product[] {
  const kw = keyword.replace(/\s+/g, "");
  const tracking = process.env.COUPANG_SUB_ID ?? "demo";

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
    if (i > limit * 3) break;
  }

  return products;
}
