import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { HealthScoreBadge } from "./HealthScoreBadge";

export function ProductCard({
  product,
  selected,
  onToggle,
}: {
  product: Product;
  selected: boolean;
  onToggle: (p: Product) => void;
}) {
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
        />
        <div className="absolute left-2 top-2 flex gap-1">
          {product.isRocket && (
            <span className="rounded-md bg-sky-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              로켓배송
            </span>
          )}
        </div>
        <div className="absolute right-2 top-2">
          <HealthScoreBadge score={product.healthScore} size="sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-700">
          {product.productName}
        </p>
        <p className="text-lg font-bold text-slate-900">
          {formatPrice(product.productPrice)}
        </p>

        {product.nutrition && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-slate-500">
            <span>열량 {product.nutrition.calories}kcal</span>
            <span>단백질 {product.nutrition.protein}g</span>
            <span>당류 {product.nutrition.sugar}g</span>
            <span>나트륨 {product.nutrition.sodium}mg</span>
          </div>
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
            rel="noopener noreferrer nofollow sponsored"
            className="flex-1 rounded-lg bg-rose-500 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-rose-600"
          >
            쇼핑하기
          </a>
        </div>
      </div>
    </div>
  );
}
