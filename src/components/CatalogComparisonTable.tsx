import type { ComparisonProduct, NormalizedNutrition } from "@/lib/types";
import { formatPrice } from "@/lib/format";

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

  const bestValues = new Map<NumericKey, number>();
  for (const m of METRICS) {
    if (!m.highlight) continue;
    const vals = normalized.map((p) => p.normalized![m.key]);
    if (vals.length < 2) continue;
    bestValues.set(m.key, m.highlight === "high" ? Math.max(...vals) : Math.min(...vals));
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="sticky left-0 z-10 bg-slate-50 p-3 text-left font-medium text-slate-500">
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
                    <span className="line-clamp-2 text-center text-xs font-normal text-slate-600">
                      {p.productName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(p.id)}
                      className="text-xs text-slate-400 hover:text-rose-500"
                    >
                      제거
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="sticky left-0 z-10 bg-white p-3 font-medium text-slate-500">가격</td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center font-semibold text-slate-900">
                  {formatPrice(p.productPrice)}
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-100">
              <td className="sticky left-0 z-10 bg-white p-3" />
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center">
                  <a
                    href={p.productUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="inline-block rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600"
                  >
                    쿠팡에서 구매
                  </a>
                </td>
              ))}
            </tr>

            <tr className="border-b border-slate-100 bg-slate-50/60">
              <td colSpan={products.length + 1} className="p-2 px-3 text-xs font-semibold text-slate-500">
                영양 성분 (100g당 정규화)
              </td>
            </tr>

            {METRICS.map((m) => (
              <tr key={m.key} className="border-b border-slate-100 last:border-0">
                <td className="sticky left-0 z-10 bg-white p-3 font-medium text-slate-500">
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
                        isBest ? "font-bold text-emerald-700" : "text-slate-700"
                      }`}
                    >
                      {v === undefined ? (
                        <span className="text-slate-300">-</span>
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

            <tr className="border-b border-slate-100">
              <td className="sticky left-0 z-10 bg-white p-3 align-top font-medium text-slate-500">
                원재료명
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-3 text-center align-top text-xs text-slate-600">
                  {p.ingredients ? p.ingredients : <span className="text-slate-300">-</span>}
                </td>
              ))}
            </tr>

            <tr>
              <td className="sticky left-0 z-10 bg-white p-3 align-top font-medium text-slate-500">
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
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400">
        ※ 영양 성분이 입력되지 않은 상품은 &ldquo;-&rdquo;로 표시됩니다. 초록색 강조는 단백질·식이섬유는 최댓값,
        나트륨·당류·포화지방은 최솟값을 의미합니다.
      </p>
    </div>
  );
}
