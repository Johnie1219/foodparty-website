"use client";

import { useState } from "react";
import type { CatalogProduct } from "@/lib/types";

const FIELDS: { key: keyof FormState; label: string; unit: string }[] = [
  { key: "weightG", label: "기준 중량", unit: "g" },
  { key: "calories", label: "열량", unit: "kcal" },
  { key: "protein", label: "단백질", unit: "g" },
  { key: "fat", label: "지방", unit: "g" },
  { key: "saturatedFat", label: "포화지방", unit: "g" },
  { key: "carbs", label: "탄수화물", unit: "g" },
  { key: "sugar", label: "당류", unit: "g" },
  { key: "fiber", label: "식이섬유", unit: "g" },
  { key: "sodium", label: "나트륨", unit: "mg" },
];

interface FormState {
  weightG: string;
  calories: string;
  protein: string;
  fat: string;
  saturatedFat: string;
  carbs: string;
  sugar: string;
  fiber: string;
  sodium: string;
  ingredients: string;
  keyFeatures: string;
}

function toFormState(p: CatalogProduct): FormState {
  return {
    weightG: p.weightG?.toString() ?? "",
    calories: p.calories?.toString() ?? "",
    protein: p.protein?.toString() ?? "",
    fat: p.fat?.toString() ?? "",
    saturatedFat: p.saturatedFat?.toString() ?? "",
    carbs: p.carbs?.toString() ?? "",
    sugar: p.sugar?.toString() ?? "",
    fiber: p.fiber?.toString() ?? "",
    sodium: p.sodium?.toString() ?? "",
    ingredients: p.ingredients ?? "",
    keyFeatures: p.keyFeatures?.join(", ") ?? "",
  };
}

export function NutritionEditForm({
  product,
  onSaved,
  onCancel,
}: {
  product: CatalogProduct;
  onSaved: (p: CatalogProduct) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(toFormState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const numericFields: (keyof FormState)[] = [
        "weightG",
        "calories",
        "protein",
        "fat",
        "saturatedFat",
        "carbs",
        "sugar",
        "fiber",
        "sodium",
      ];
      const numbers: Record<string, number> = {};
      for (const key of numericFields) {
        const n = Number(form[key]);
        if (form[key].trim() === "" || !Number.isFinite(n)) {
          throw new Error("모든 영양성분 값은 숫자로 입력해야 합니다.");
        }
        if (n < 0) {
          throw new Error("영양성분 값은 0 이상이어야 합니다.");
        }
        if (key === "weightG" && n === 0) {
          throw new Error("기준 중량은 0보다 커야 합니다.");
        }
        numbers[key] = n;
      }

      const body = {
        weight_g: numbers.weightG,
        calories: numbers.calories,
        protein: numbers.protein,
        fat: numbers.fat,
        saturated_fat: numbers.saturatedFat,
        carbs: numbers.carbs,
        sugar: numbers.sugar,
        fiber: numbers.fiber,
        sodium: numbers.sodium,
        ingredients: form.ingredients.trim(),
        key_features: form.keyFeatures
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/products/${product.id}/nutrition`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "저장에 실패했습니다.");
      onSaved(json.product as CatalogProduct);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-xs text-slate-600">
            {f.label} ({f.unit})
            <input
              type="number"
              step="any"
              min={0}
              value={form[f.key]}
              onChange={(e) => setForm((s) => ({ ...s, [f.key]: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          원재료명
          <textarea
            value={form.ingredients}
            onChange={(e) => setForm((s) => ({ ...s, ingredients: e.target.value }))}
            rows={2}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-slate-600">
          특징 태그 (쉼표로 구분)
          <input
            type="text"
            value={form.keyFeatures}
            onChange={(e) => setForm((s) => ({ ...s, keyFeatures: e.target.value }))}
            placeholder="예: 무첨가, 저당, 고단백"
            className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
