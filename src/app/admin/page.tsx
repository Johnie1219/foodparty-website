"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CatalogProduct, CategorySummary } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { NutritionEditForm } from "@/components/NutritionEditForm";

function formatSyncedAt(iso: string | null): string {
  if (!iso) return "동기화 기록 없음";
  return new Date(iso).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<number | "all" | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "데이터를 불러오지 못했습니다.");
      setCategories(json.categories ?? []);
      setProducts(json.products ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 최초 진입 시 서버에서 카테고리/상품 목록을 불러와야 함
    loadAll();
  }, [loadAll]);

  const syncCategory = useCallback(
    async (category: CategorySummary) => {
      setSyncingId(category.id);
      setError(null);
      setMessage(null);
      try {
        const res = await fetch(`/api/sync/${category.id}`, { method: "POST" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "동기화에 실패했습니다.");
        setMessage(`"${category.name}" 카테고리에서 ${json.syncedCount}개 상품을 동기화했습니다.`);
        await loadAll();
      } catch (e) {
        setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
      } finally {
        setSyncingId(null);
      }
    },
    [loadAll]
  );

  const syncAll = useCallback(async () => {
    setSyncingId("all");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/sync/all", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        if (json.warning) {
          setError(json.warning);
          return;
        }
        throw new Error(json.error ?? "전체 동기화에 실패했습니다.");
      }
      const lines = (json.results ?? []).map(
        (r: { category: string; syncedCount?: number; error?: string }) =>
          r.error ? `${r.category}: 실패 (${r.error})` : `${r.category}: ${r.syncedCount}개`
      );
      setMessage(`전체 동기화 완료 — ${lines.join(" · ")}`);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSyncingId(null);
    }
  }, [loadAll]);

  const handleSaved = (updated: CatalogProduct) => {
    setProducts((prev) => [...prev.map((p) => (p.id === updated.id ? updated : p))].sort(
      (a, b) => Number(a.nutritionVerified) - Number(b.nutritionVerified)
    ));
    setEditingId(null);
    setMessage(`"${updated.productName}" 영양성분이 저장되었습니다.`);
  };

  const categoryName = (id: number) => categories.find((c) => c.id === id)?.name ?? "-";

  return (
    <div className="min-h-full bg-slate-50 pb-16">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              관리자<span className="text-emerald-600">.</span>
            </h1>
            <nav className="flex gap-2 text-sm">
              <Link href="/catalog" className="rounded-lg px-3 py-1.5 text-slate-500 hover:text-emerald-700">
                카탈로그
              </Link>
              <Link href="/" className="rounded-lg px-3 py-1.5 text-slate-500 hover:text-emerald-700">
                검색
              </Link>
            </nav>
          </div>
          <p className="mt-2 text-slate-600">
            카테고리별 쿠팡 동기화 및 영양 성분 직접 입력을 관리합니다.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 space-y-8">
        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* 동기화 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">쿠팡 동기화</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={syncingId !== null}
                onClick={() => syncCategory(c)}
                className="flex flex-col items-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-left transition-colors hover:border-emerald-400 disabled:opacity-50"
              >
                <span className="text-sm font-semibold text-slate-700">
                  {syncingId === c.id ? "동기화 중…" : `${c.name} 동기화`}
                </span>
                <span className="text-xs text-slate-400">
                  상품 {c.productCount}개 · {formatSyncedAt(c.lastSyncedAt)}
                </span>
              </button>
            ))}
            <button
              type="button"
              disabled={syncingId !== null}
              onClick={syncAll}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              {syncingId === "all" ? "전체 동기화 중…" : "전체 동기화"}
            </button>
          </div>
        </section>

        {/* 상품 목록 */}
        <section>
          <h2 className="mb-3 text-lg font-bold text-slate-900">
            상품 목록 {!loading && <span className="font-normal text-slate-400">({products.length}개 · 영양성분 미입력 상품 우선 정렬)</span>}
          </h2>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
              동기화된 상품이 없습니다. 위 버튼으로 카테고리를 동기화해보세요.
            </div>
          ) : (
            <div className="space-y-2">
              {products.map((p) => (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-wrap items-center gap-3 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.productImage} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    <div className="min-w-[160px] flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-slate-800">{p.productName}</p>
                      <p className="text-xs text-slate-400">
                        {categoryName(p.categoryId)} · {formatPrice(p.productPrice)}
                      </p>
                    </div>
                    {p.nutritionVerified ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        입력 완료
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        성분 미확인
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingId(editingId === p.id ? null : p.id)}
                      className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                    >
                      {editingId === p.id ? "닫기" : "성분 입력"}
                    </button>
                  </div>
                  {editingId === p.id && (
                    <div className="border-t border-slate-100 p-3">
                      <NutritionEditForm
                        product={p}
                        onSaved={handleSaved}
                        onCancel={() => setEditingId(null)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
