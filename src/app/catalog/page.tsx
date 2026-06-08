"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CatalogProduct, CategorySummary, ComparisonProduct } from "@/lib/types";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { CatalogComparisonTable } from "@/components/CatalogComparisonTable";

const MAX_COMPARE = 4;

type SortOption = "default" | "priceAsc" | "priceDesc";

const SORT_LABELS: Record<SortOption, string> = {
  default: "기본순",
  priceAsc: "낮은 가격순",
  priceDesc: "높은 가격순",
};

function formatSyncedAt(iso: string | null): string {
  if (!iso) return "동기화 기록 없음";
  return `마지막 동기화 ${new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function CatalogPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("default");
  const [rocketOnly, setRocketOnly] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<ComparisonProduct[] | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async (categoryName: string) => {
    setLoading(true);
    setError(null);
    setComparison(null);
    setSort("default");
    setRocketOnly(false);
    setKeyword("");
    try {
      const res = await fetch(`/api/products?category=${encodeURIComponent(categoryName)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "상품을 불러오지 못했습니다.");
      setCategories(json.categories ?? []);
      setProducts(json.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 최초 카테고리 목록 로드
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((json) => {
        const cats: CategorySummary[] = json.categories ?? [];
        setCategories(cats);
        if (cats.length > 0) setActiveCategory(cats[0].name);
      })
      .catch(() => setError("카테고리를 불러오지 못했습니다."));
  }, []);

  useEffect(() => {
    if (activeCategory) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 카테고리 변경 시 서버에서 상품을 다시 불러와야 함
      loadProducts(activeCategory);
    }
  }, [activeCategory, loadProducts]);

  const visibleProducts = (() => {
    let list = rocketOnly ? products.filter((p) => p.isRocket) : products;
    const trimmed = keyword.trim();
    if (trimmed) {
      const needle = trimmed.replace(/\s+/g, "").toLowerCase();
      list = list.filter((p) => p.productName.replace(/\s+/g, "").toLowerCase().includes(needle));
    }
    if (sort === "priceAsc") list = [...list].sort((a, b) => a.productPrice - b.productPrice);
    else if (sort === "priceDesc") list = [...list].sort((a, b) => b.productPrice - a.productPrice);
    return list;
  })();

  const activeCategorySummary = categories.find((c) => c.name === activeCategory) ?? null;

  const toggleSelect = useCallback((p: CatalogProduct) => {
    setSelectedIds((prev) => {
      if (prev.includes(p.id)) return prev.filter((id) => id !== p.id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, p.id];
    });
  }, []);

  const removeSelected = useCallback((id: number) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const runCompare = useCallback(async () => {
    if (selectedIds.length < 2) return;
    setCompareLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_ids: selectedIds }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "비교 중 오류가 발생했습니다.");
      setComparison(json.products ?? []);
      requestAnimationFrame(() => compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setCompareLoading(false);
    }
  }, [selectedIds]);

  return (
    <div className="min-h-full bg-[var(--color-canvas)] pb-32">
      <section className="tile-section tile-parchment">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-display-lg text-[var(--color-ink)]">
            헬스픽 카탈로그<span className="text-[var(--color-primary)]">.</span>
          </h1>
          <p className="text-body-ink mt-2 max-w-xl text-[var(--color-ink-muted-48)]">
            카테고리별 쿠팡 상품의 영양 성분을 한눈에 비교하고 더 건강한 선택을 해보세요.
          </p>

          {/* 카테고리 탭 */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.name)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  activeCategory === c.name
                    ? "border-[var(--color-primary)] bg-white text-[var(--color-primary)]"
                    : "border-[var(--color-hairline)] bg-white text-[var(--color-ink-muted-48)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                {c.name}
                <span className="ml-1.5 text-xs font-normal opacity-60">{c.productCount}</span>
              </button>
            ))}
          </div>
          {activeCategorySummary && (
            <p className="text-fine-print mt-2 text-[var(--color-ink-muted-48)]">{formatSyncedAt(activeCategorySummary.lastSyncedAt)}</p>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {comparison && comparison.length >= 2 && (
          <section ref={compareRef} className="mb-10">
            <h2 className="text-tagline mb-3 text-[var(--color-ink)]">
              영양 성분 비교 ({comparison.length})
            </h2>
            <CatalogComparisonTable products={comparison} onRemove={removeSelected} />
          </section>
        )}

        {!loading && products.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="상품명 검색"
              className="input-pill h-9 w-44 px-4 py-1.5 text-sm"
            />
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--color-hairline)] bg-white p-1">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSort(opt)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    sort === opt ? "bg-[var(--color-primary)] text-white" : "text-[var(--color-ink-muted-48)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {SORT_LABELS[opt]}
                </button>
              ))}
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-sm text-[var(--color-ink-muted-80)]">
              <input
                type="checkbox"
                checked={rocketOnly}
                onChange={(e) => setRocketOnly(e.target.checked)}
                className="rounded border-[var(--color-hairline)] text-[var(--color-primary)] focus:ring-[var(--color-primary-focus)]"
              />
              로켓배송만 보기
            </label>
            <span className="text-fine-print text-[var(--color-ink-muted-48)]">{visibleProducts.length}개 상품</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card-utility p-12 text-center">
            <p className="text-4xl">📦</p>
            <p className="text-body-ink mt-3 text-[var(--color-ink-muted-48)]">
              아직 동기화된 상품이 없습니다. <Link href="/admin" className="link-on-light font-semibold hover:underline">관리자 화면</Link>에서 쿠팡 동기화를 실행해보세요.
            </p>
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="card-utility p-12 text-center text-[var(--color-ink-muted-48)]">
            조건에 맞는 상품이 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {visibleProducts.map((p) => (
              <CatalogProductCard
                key={p.id}
                product={p}
                selected={selectedIds.includes(p.id)}
                onToggle={toggleSelect}
              />
            ))}
          </div>
        )}
      </main>

      {/* 하단 비교 트레이 */}
      {selectedIds.length > 0 && (
        <div className="floating-sticky-bar fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-sm text-[var(--color-ink-muted-48)]">
              {selectedIds.length}/{MAX_COMPARE} 선택됨
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-[var(--color-ink-muted-48)] hover:text-[var(--color-ink)]"
            >
              비우기
            </button>
            <button
              type="button"
              disabled={selectedIds.length < 2 || compareLoading}
              onClick={runCompare}
              className="btn-pill-primary shrink-0 px-4 py-2 text-sm disabled:opacity-50"
            >
              {compareLoading ? "비교 중…" : `${selectedIds.length}개 비교하기`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
