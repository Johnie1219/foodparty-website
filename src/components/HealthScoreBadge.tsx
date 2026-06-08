import { scoreGrade } from "@/lib/format";

export function HealthScoreBadge({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
        영양정보 없음
      </span>
    );
  }
  const g = scoreGrade(score);
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ${g.bg} ${g.text} ${g.ring} ${sizes}`}
    >
      <span className="font-bold">{score}</span>
      <span className="opacity-80">{g.label}</span>
    </span>
  );
}
