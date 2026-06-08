import type { Nutrition, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { HealthScoreBadge } from "./HealthScoreBadge";

type NumericNutritionKey = Exclude<keyof Nutrition, "name">;

type Metric = {
  key: NumericNutritionKey;
  label: string;
  unit: string;
  /** 높을수록 좋으면 "high", 낮을수록 좋으면 "low" */
  better: "high" | "low";
};

const METRICS: Metric[] = [
  { key: "calories", label: "열량", unit: "kcal", better: "low" },
  { key: "protein", label: "단백질", unit: "g", better: "high" },
  { key: "fiber", label: "식이섬유", unit: "g", better: "high" },
  { key: "fat", label: "지방", unit: "g", better: "low" },
  { key: "saturatedFat", label: "포화지방", unit: "g", better: "low" },
  { key: "carbs", label: "탄수화물", unit: "g", better: "low" },
  { key: "sugar", label: "당류", unit: "g", better: "low" },
  { key: "sodium", label: "나트륨", unit: "mg", better: "low" },
];

export function ComparisonTable({
  products,
  onRemove,
}: {
  products: Product[];
  onRemove: (id: string) => void;
}) {
  const withNutrition = products.filter((p) => p.nutrition);

  // 각 영양 항목별 '가장 좋은' 값 계산
  const bestValues = new Map<string, number>();
  for (const m of METRICS) {
    const vals = withNutrition.map((p) => p.nutrition![m.key] as number);
    if (vals.length === 0) continue;
    bestValues.set(m.key, m.better === "high" ? Math.max(...vals) : Math.min(...vals));
  }

  // 추천: 건강 점수 최고
  const scored = products.filter((p) => p.healthScore !== null);
  const winner =
    scored.length > 0
      ? scored.reduce((a, b) => (b.healthScore! > a.healthScore! ? b : a))
      : null;

  return (
    <div className="space-y-4">
      {winner && (
        <div className="card-utility border-[var(--color-primary)] bg-blue-50/40 p-4">
          <p className="text-sm text-[var(--color-primary)]">
            🏆 건강 점수가 가장 높은 선택
          </p>
          <p className="text-tagline mt-1 text-[var(--color-ink)]">
            {winner.productName}
          </p>
          <p className="mt-0.5 text-sm text-[var(--color-primary)]">
            건강 점수 {winner.healthScore}점 · {formatPrice(winner.productPrice)}
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-hairline)] bg-white">
        <table className="w-full min-w-[520px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--color-hairline)]">
              <th className="sticky left-0 z-10 bg-[var(--color-surface-pearl)] p-3 text-left font-medium text-[var(--color-ink-muted-48)]">
                항목 (100g 기준)
              </th>
              {products.map((p) => (
                <th key={p.productId} className="min-w-[160px] p-3 align-top">
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
                    <HealthScoreBadge score={p.healthScore} size="sm" />
                    <button
                      type="button"
                      onClick={() => onRemove(p.productId)}
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
              <td className="sticky left-0 z-10 bg-white p-3 font-medium text-[var(--color-ink-muted-48)]">
                가격
              </td>
              {products.map((p) => (
                <td key={p.productId} className="p-3 text-center font-semibold text-[var(--color-ink)]">
                  {formatPrice(p.productPrice)}
                </td>
              ))}
            </tr>

            {METRICS.map((m) => (
              <tr key={m.key} className="border-b border-[var(--color-hairline)] last:border-0">
                <td className="sticky left-0 z-10 bg-white p-3 font-medium text-[var(--color-ink-muted-48)]">
                  {m.label}
                </td>
                {products.map((p) => {
                  const v = p.nutrition?.[m.key] as number | undefined;
                  const isBest =
                    v !== undefined &&
                    withNutrition.length > 1 &&
                    v === bestValues.get(m.key);
                  return (
                    <td
                      key={p.productId}
                      className={`p-3 text-center ${
                        isBest
                          ? "font-bold text-emerald-700"
                          : "text-[var(--color-ink-muted-80)]"
                      }`}
                    >
                      {v === undefined ? (
                        <span className="text-[var(--color-hairline)]">—</span>
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

            <tr>
              <td className="sticky left-0 z-10 bg-white p-3" />
              {products.map((p) => (
                <td key={p.productId} className="p-3 text-center">
                  <a
                    href={p.productUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow sponsored"
                    className="inline-block rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-rose-600 active:scale-95"
                  >
                    쇼핑하기
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-fine-print text-[var(--color-ink-muted-48)]">
        ※ 영양 성분은 100g 기준 대표값이며 실제 제품과 다를 수 있습니다. 초록색 강조는 비교 항목 중 가장 우수한 값입니다.
      </p>
    </div>
  );
}
