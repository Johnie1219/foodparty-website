"use client";

import { useCallback, useRef, useState } from "react";
import type { Product, SearchResponse } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import { ComparisonTable } from "@/components/ComparisonTable";

const SUGGESTIONS = ["닭가슴살", "그릭요거트", "오트밀", "단백질바", "고구마", "견과류"];
const MAX_COMPARE = 4;

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [selected, setSelected] = useState<Product[]>([]);
  const compareRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(async (q: string) => {
    const keyword = q.trim();
    if (!keyword) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "검색 실패");
      }
      setResult((await res.json()) as SearchResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleSelect = useCallback((p: Product) => {
    setSelected((prev) => {
      const exists = prev.find((x) => x.productId === p.productId);
      if (exists) return prev.filter((x) => x.productId !== p.productId);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, p];
    });
  }, []);

  const removeSelected = useCallback((id: string) => {
    setSelected((prev) => prev.filter((x) => x.productId !== id));
  }, []);

  const isSelected = (id: string) => selected.some((x) => x.productId === id);

  return (
    <div className="min-h-full bg-slate-50 pb-32">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🥗</span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              헬스픽<span className="text-emerald-600">.</span>
            </h1>
          </div>
          <p className="mt-2 max-w-xl text-slate-600">
            쿠팡 실시간 상품의 <b>주요 영양 성분</b>을 비교해서 더 건강한 음식을 골라보세요.
            비교 후 바로 쇼핑까지!
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
            className="mt-6 flex max-w-xl gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="음식을 검색하세요 (예: 닭가슴살, 그릭요거트)"
              className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "검색중…" : "검색"}
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  runSearch(s);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {result && !result.live && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            ⚠️ 데모 데이터로 표시 중입니다. 실시간 쿠팡 검색을 사용하려면 쿠팡 파트너스 API 키를 설정하세요. (자세한 내용은 README 참고)
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* 비교 결과 */}
        {selected.length >= 2 && (
          <section ref={compareRef} className="mb-10">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              영양 성분 비교 ({selected.length})
            </h2>
            <ComparisonTable products={selected} onRemove={removeSelected} />
          </section>
        )}

        {/* 검색 결과 */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200" />
            ))}
          </div>
        )}

        {!loading && result && (
          <>
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              &ldquo;{result.keyword}&rdquo; 검색 결과
            </h2>
            {result.products.length === 0 ? (
              <p className="text-slate-500">검색 결과가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {result.products.map((p) => (
                  <ProductCard
                    key={p.productId}
                    product={p}
                    selected={isSelected(p.productId)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !result && !error && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-slate-600">
              음식을 검색하고 <b>비교 담기</b>로 2개 이상 골라 영양 성분을 비교해보세요.
            </p>
          </div>
        )}
      </main>

      {/* 하단 비교 트레이 */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto">
              {selected.map((p) => (
                <div
                  key={p.productId}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.productImage}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="max-w-[120px] truncate text-xs text-slate-600">
                    {p.productName}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSelected(p.productId)}
                    className="text-slate-400 hover:text-rose-500"
                    aria-label="제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <span className="hidden shrink-0 text-sm text-slate-500 sm:inline">
              {selected.length}/{MAX_COMPARE}
            </span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
            >
              비우기
            </button>
            <button
              type="button"
              disabled={selected.length < 2}
              onClick={() =>
                compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              비교하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
