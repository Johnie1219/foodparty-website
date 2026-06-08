import type { ComparisonProduct, NormalizedNutrition } from "@/lib/types";
import { formatPrice, healthScoreFromNormalized } from "@/lib/format";

type NumericKey = keyof NormalizedNutrition;

type Metric = {
  key: NumericKey;
  label: string;
  unit: string;
  /** "high" = 최댓값 강조, "low" = 최솟값 강조, undefined = 강조 없음 */
  highlight?: "high" | "low";
};

const METRICS: Metric[] = [
  { key: "calories", label: "열량", unit: "kcal" },
  { key: "protein", label: "단백질", unit: "g", highlight: "high" },
  { key: "fiber", label: "식이섬유", unit: "g", highlight: "high" },
  { key: "fat", label: "지방", unit: "g" },
  { key: "saturatedFat", label: "포화지방", unit: "g", highlight: "low" },
  { key: "carbs", label: "탄수화물", unit: "g" },
  { key: "sugar", label: "당류", unit: "g", highlight: "low" },
  { key: "sodium", label: "나트륨", unit: "mg", highlight: "low" },
];

export function CatalogComparisonTable({
  products,
  onRemove,
}: {
  products: ComparisonProduct[];
  onRemove: (id: number) => void;
}) {
  const normalized = products.filter((p) => p.normalized);

  const scored = normalized
    .map((p) => ({ product: p, score: healthScoreFromNormalized(p.normalized!) }))
    .sort((a, b) => b.score - a.score);
  const winner = scored.length > 1 ? scored[0] : null;

  const bestValues = new Map<NumericKey, number>();
  for (const m of METRICS) {
    if (!m.highlight) continue;
    const vals = normalized.map((p) => p.normalized![m.key]);
    if (vals.length < 2) continue;
    bestValues.set(m.key, m.highlight === "high" ? Math.max(...vals) : Math.min(...vals));
  }

  return (
    <div className="space-y-4">
      {winner && (
        <div className="card-utility border-[var(--color-primary)] bg-blue-50/40 p-4">
          <p className="text-sm text-[var(--color-primary)]">🏆 영양 균형이 가장 좋은 선택 (100g 기준 추정)</p>
          <p className="mt-1 text-tagline text-[var(--color-ink)]">{winner.product.productName}</p>
          <p className="mt-0.5 text-sm text-[var(--color-primary)]">
            건강 점수 {winner.score}점 · {formatPrice(winner.product.productPrice)}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-hairline)] bg-white">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-hairline)]">
              <th className="sticky left-0 z-10 bg-[var(--color-surface-pearl)] p-3 text-left font-medium text-[var(--color-ink-muted-48)]">
                항목
              </th>
              {products.map((p) => (
                <th key={p.id} className="min-w-[170px] p-3 align-top">
                  <div className="flex flex-col items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.productImage}
                      alt={p.productName}
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                    <span className="line-clamp-2 text-center text-xs font-normal text-[var(--color-ink-muted-48)]">
                      {p.productName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      className="text-xs text-[var(--color-ink-muted-48)] hover:text-rose-500"
                    >
                      제거
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--color-hairline)]">
              <td className="sticky left-0 z-10 bg-white p-3 font-medium text-[var(--color-ink-muted-48)]">가격</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center font-semibold text-[var(--color-ink)]">
                  {formatPrice(p.productPrice)}
                </td>
              ))}
            </tr>

            <tr className="border-b border-[var(--color-hairline)]">
              <td className="sticky left-0 z-10 bg-white p-3" />
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <a
                    href={p.productUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95"
                  >
                    쿠팡에서 구매
                  </a>
                </td>
              ))}
            </tr>

            <tr className="border-b border-[var(--color-hairline)] bg-[var(--color-surface-pearl)]">
              <td colSpan={products.length + 1} className="p-2 px-3 text-xs font-semibold text-[var(--color-ink-muted-48)]">
                영양 성분 (100g당 정규화)
              </td>
            </tr>

            {METRICS.map((m) => (
              <tr key={m.key} className="border-b border-[var(--color-hairline)] last:border-0">
                <td className="sticky left-0 z-10 bg-white p-3 font-medium text-[var(--color-ink-muted-48)]">
                  {m.label}
                </td>
                {products.map((p) => {
                  const v = p.normalized?.[m.key];
                  const isBest =
                    v !== undefined &&
                    m.highlight !== undefined &&
                    bestValues.get(m.key) === v;
                  return (
                    <td
                      key={p.id}
                      className={`p-3 text-center ${
                        isBest ? "font-bold text-emerald-700" : "text-[var(--color-ink-muted-80)]"
                      }`}
                    >
                      {v === undefined ? (
                        <span className="text-[var(--color-hairline)]">-</span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {v}
                          {m.unit}
                          {isBest && <span aria-hidden>👍</span>}
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            <tr className="border-b border-[var(--color-hairline)]">
              <td className="sticky left-0 z-10 bg-white p-3 align-top font-medium text-[var(--color-ink-muted-48)]">
                원재료명
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center align-top text-xs text-[var(--color-ink-muted-80)]">
                  {p.ingredients ? p.ingredients : <span className="text-[var(--color-hairline)]">-</span>}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white p-3 align-top font-medium text-[var(--color-ink-muted-48)]">
                특징
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center align-top">
                  {p.keyFeatures && p.keyFeatures.length > 0 ? (
                    <div className="flex flex-wrap justify-center gap-1">
                      {p.keyFeatures.map((f) => (
                        <span
                          key={f}
                          className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[var(--color-hairline)]">-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-fine-print text-[var(--color-ink-muted-48)]">
        ※ 영양 성분이 입력되지 않은 상품은 &ldquo;-&rdquo;로 표시됩니다. 초록색 강조는 단백질·식이섬유는 최댓값,
        나트륨·당류·포화지방은 최솟값을 의미합니다.
      </p>
    </div>
  );
}
