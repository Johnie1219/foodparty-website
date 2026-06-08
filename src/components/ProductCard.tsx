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
          ? "border-[var(--color-primary)] ring-2 ring-blue-100"
          : "border-[var(--color-hairline)] hover:border-[var(--color-ink-muted-48)]"
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-surface-pearl)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.productImage}
          alt={product.productName}
          className="shadow-product h-full w-full object-cover transition-transform group-hover:scale-105"
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
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-[var(--color-ink-muted-80)]">
          {product.productName}
        </p>
        <p className="text-tagline text-[var(--color-ink)]">
          {formatPrice(product.productPrice)}
        </p>

        {product.nutrition && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-[var(--color-ink-muted-48)]">
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
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition-all active:scale-95 ${
              selected
                ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-focus)]"
                : "bg-[var(--color-canvas-parchment)] text-[var(--color-ink-muted-80)] hover:bg-slate-200"
            }`}
          >
            {selected ? "비교 담김 ✓" : "비교 담기"}
          </button>
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="flex-1 rounded-full bg-rose-500 px-3 py-2 text-center text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95"
          >
            쇼핑하기
          </a>
        </div>
      </div>
    </div>
  );
}
