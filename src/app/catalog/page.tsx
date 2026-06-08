"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { CatalogProduct, Category, ComparisonProduct } from "@/lib/types";
import { CatalogProductCard } from "@/components/CatalogProductCard";
import { CatalogComparisonTable } from "@/components/CatalogComparisonTable";

const MAX_COMPARE = 4;

export default function CatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [comparison, setComparison] = useState<ComparisonProduct[] | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const compareRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async (categoryName: string) => {
    setLoading(true);
    setError(null);
    setComparison(null);
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
        const cats: Category[] = json.categories ?? [];
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
    <div className="min-h-full bg-slate-50 pb-32">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🛒</span>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                헬스픽 카탈로그<span className="text-emerald-600">.</span>
              </h1>
            </div>
            <nav className="flex gap-2 text-sm">
              <Link href="/" className="rounded-lg px-3 py-1.5 text-slate-500 hover:text-emerald-700">
                검색
              </Link>
              <Link href="/admin" className="rounded-lg px-3 py-1.5 text-slate-500 hover:text-emerald-700">
                관리자
              </Link>
            </nav>
          </div>
          <p className="mt-2 max-w-xl text-slate-600">
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
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {comparison && comparison.length >= 2 && (
          <section ref={compareRef} className="mb-10">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              영양 성분 비교 ({comparison.length})
            </h2>
            <CatalogComparisonTable products={comparison} onRemove={removeSelected} />
          </section>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-4xl">📦</p>
            <p className="mt-3 text-slate-600">
              아직 동기화된 상품이 없습니다. <Link href="/admin" className="font-semibold text-emerald-600 hover:underline">관리자 화면</Link>에서 쿠팡 동기화를 실행해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
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
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <span className="shrink-0 text-sm text-slate-500">
              {selectedIds.length}/{MAX_COMPARE} 선택됨
            </span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              비우기
            </button>
            <button
              type="button"
              disabled={selectedIds.length < 2 || compareLoading}
              onClick={runCompare}
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {compareLoading ? "비교 중…" : `${selectedIds.length}개 비교하기`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
