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
    <div className="min-h-full bg-[var(--color-canvas)] pb-32">
      {/* Hero tile */}
      <section className="tile-section tile-light text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-hero-display text-[var(--color-ink)]">
            더 건강한 선택,<br />한눈에 비교하세요.
          </h1>
          <p className="text-lead mx-auto mt-4 max-w-xl text-[var(--color-ink-muted-48)]">
            쿠팡 실시간 상품의 주요 영양 성분을 비교해 더 건강한 음식을 골라보세요.
          </p>

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(query);
            }}
            className="mx-auto mt-8 flex max-w-xl gap-2"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="음식을 검색하세요 (예: 닭가슴살, 그릭요거트)"
              className="input-pill flex-1"
            />
            <button type="submit" disabled={loading} className="btn-pill-primary">
              {loading ? "검색중…" : "검색"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setQuery(s);
                  runSearch(s);
                }}
                className="btn-pearl"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-12">
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
            <h2 className="text-tagline mb-3 text-[var(--color-ink)]">
              &ldquo;{result.keyword}&rdquo; 검색 결과
            </h2>
            {result.products.length === 0 ? (
              <p className="text-[var(--color-ink-muted-48)]">검색 결과가 없습니다.</p>
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
          <div className="card-utility p-12 text-center">
            <p className="text-4xl">🔍</p>
            <p className="text-body-ink mt-3 text-[var(--color-ink-muted-48)]">
              음식을 검색하고 <b className="text-[var(--color-ink)]">비교 담기</b>로 2개 이상 골라 영양 성분을 비교해보세요.
            </p>
          </div>
        )}
      </main>

      {/* 하단 비교 트레이 */}
      {selected.length > 0 && (
        <div className="floating-sticky-bar fixed inset-x-0 bottom-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <div className="flex flex-1 items-center gap-2 overflow-x-auto">
              {selected.map((p) => (
                <div
                  key={p.productId}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white py-1 pl-1 pr-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.productImage}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="max-w-[120px] truncate text-xs text-[var(--color-ink-muted-80)]">
                    {p.productName}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSelected(p.productId)}
                    className="text-[var(--color-ink-muted-48)] hover:text-rose-500"
                    aria-label="제거"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <span className="hidden shrink-0 text-sm text-[var(--color-ink-muted-48)] sm:inline">
              {selected.length}/{MAX_COMPARE}
            </span>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="shrink-0 rounded-lg px-3 py-2 text-sm text-[var(--color-ink-muted-48)] hover:text-[var(--color-ink)]"
            >
              비우기
            </button>
            <button
              type="button"
              disabled={selected.length < 2}
              onClick={() =>
                compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
              className="btn-pill-primary shrink-0 px-4 py-2 text-sm disabled:opacity-50"
            >
              비교하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
