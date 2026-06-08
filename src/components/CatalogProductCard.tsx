import type { CatalogProduct } from "@/lib/types";
import { formatPrice, healthScoreFromNormalized, normalizePer100g } from "@/lib/format";

export function CatalogProductCard({
  product,
  selected,
  onToggle,
}: {
  product: CatalogProduct;
  selected: boolean;
  onToggle: (p: CatalogProduct) => void;
}) {
  const normalized = normalizePer100g(product);
  const score = normalized ? healthScoreFromNormalized(normalized) : null;

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-white transition-all ${
        selected
          ? "border-emerald-500 ring-2 ring-emerald-200"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.productImage}
          alt={product.productName}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://placehold.co/240x240/f1f5f9/94a3b8?text=No+Image";
          }}
        />
        <div className="absolute left-2 top-2 flex gap-1">
          {product.isRocket && (
            <span className="rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              로켓배송
            </span>
          )}
        </div>
        {!product.nutritionVerified && (
          <div className="absolute right-2 top-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 ring-1 ring-amber-300">
              성분 미확인
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-700">{product.productName}</p>
        <p className="text-lg font-bold text-slate-900">{formatPrice(product.productPrice)}</p>

        {score !== null && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            건강 점수 {score}점 (100g 기준)
          </span>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => onToggle(product)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              selected
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {selected ? "비교 담김 ✓" : "비교 담기"}
          </button>
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            쇼핑하기
          </a>
        </div>
      </div>
    </div>
  );
}
