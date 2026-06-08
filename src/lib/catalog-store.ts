import fs from "fs";
import path from "path";
import type { CatalogProduct, Category, NormalizedNutrition } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "catalog.json");

/** 초기 카테고리 데이터 (고정) */
export const CATEGORIES: Category[] = [
  { id: 1, name: "올리브오일", description: "엑스트라버진 올리브오일" },
  { id: 2, name: "그릭요거트", description: "그릭요거트 플레인" },
  { id: 3, name: "귀리우유", description: "오트밀크 귀리우유" },
  { id: 4, name: "아몬드버터", description: "아몬드버터 무가당" },
  { id: 5, name: "프로틴바", description: "단백질 프로틴바" },
];

export function getCategoryById(id: number): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryByName(name: string): Category | undefined {
  return CATEGORIES.find((c) => c.name === name);
}

interface SyncedItem {
  productName: string;
  productPrice: number;
  productImage: string;
  productUrl: string;
  isRocket: boolean;
  isFreeShipping: boolean;
}

export interface NutritionInput {
  weightG: number;
  calories: number;
  protein: number;
  fat: number;
  saturatedFat: number;
  carbs: number;
  sugar: number;
  fiber: number;
  sodium: number;
  ingredients: string;
  keyFeatures: string[];
}

interface DBShape {
  nextId: number;
  products: CatalogProduct[];
  /** 카테고리별 마지막 동기화 시각 (ISO 문자열) */
  syncedAt: Record<number, string>;
}

function readDB(): DBShape {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<DBShape>;
    return {
      nextId: parsed.nextId ?? 1,
      products: parsed.products ?? [],
      syncedAt: parsed.syncedAt ?? {},
    };
  } catch {
    return { nextId: 1, products: [], syncedAt: {} };
  }
}

function writeDB(db: DBShape): void {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

/** 영양성분 미입력 상품을 상단에 정렬해 반환 (관리자 화면용으로도 사용) */
export function listProducts(categoryId?: number): CatalogProduct[] {
  const { products } = readDB();
  const filtered = categoryId ? products.filter((p) => p.categoryId === categoryId) : products;
  return [...filtered].sort((a, b) => Number(a.nutritionVerified) - Number(b.nutritionVerified));
}

export function getProduct(id: number): CatalogProduct | undefined {
  return readDB().products.find((p) => p.id === id);
}

export function getProductsByIds(ids: number[]): CatalogProduct[] {
  const { products } = readDB();
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is CatalogProduct => Boolean(p));
}

export interface CategorySummary extends Category {
  productCount: number;
  /** 마지막 동기화 시각 (ISO 문자열, 동기화한 적 없으면 null) */
  lastSyncedAt: string | null;
}

/** 카테고리별 상품 수 + 마지막 동기화 시각을 함께 반환한다 (메인/관리자 화면용) */
export function listCategorySummaries(): CategorySummary[] {
  const db = readDB();
  return CATEGORIES.map((c) => ({
    ...c,
    productCount: db.products.filter((p) => p.categoryId === c.id).length,
    lastSyncedAt: db.syncedAt[c.id] ?? null,
  }));
}

/** product_name 기준 upsert. 영양성분 필드는 null로 저장한다 (자동 수집 불가) */
export function upsertSyncedProducts(categoryId: number, items: SyncedItem[]): number {
  const db = readDB();
  for (const item of items) {
    const existing = db.products.find(
      (p) => p.categoryId === categoryId && p.productName === item.productName
    );
    if (existing) {
      existing.productPrice = item.productPrice;
      existing.productImage = item.productImage;
      existing.productUrl = item.productUrl;
      existing.isRocket = item.isRocket;
      existing.isFreeShipping = item.isFreeShipping;
    } else {
      db.products.push({
        id: db.nextId++,
        categoryId,
        productName: item.productName,
        productPrice: item.productPrice,
        productImage: item.productImage,
        productUrl: item.productUrl,
        isRocket: item.isRocket,
        isFreeShipping: item.isFreeShipping,
        weightG: null,
        calories: null,
        protein: null,
        fat: null,
        saturatedFat: null,
        carbs: null,
        sugar: null,
        fiber: null,
        sodium: null,
        ingredients: null,
        keyFeatures: null,
        nutritionVerified: false,
      });
    }
  }
  db.syncedAt[categoryId] = new Date().toISOString();
  writeDB(db);
  return items.length;
}

export function updateNutrition(id: number, input: NutritionInput): CatalogProduct | undefined {
  const db = readDB();
  const product = db.products.find((p) => p.id === id);
  if (!product) return undefined;
  Object.assign(product, input, { nutritionVerified: true });
  writeDB(db);
  return product;
}

/** 입력된 기준 중량(weightG)을 기준으로 100g당 값으로 정규화한다 */
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

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
