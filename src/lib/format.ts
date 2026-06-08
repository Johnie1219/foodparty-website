export function formatPrice(won: number): string {
  return won.toLocaleString("ko-KR") + "원";
}

/** 건강 점수에 따른 등급/색상 */
export function scoreGrade(score: number): {
  label: string;
  text: string;
  bg: string;
  ring: string;
} {
  if (score >= 75)
    return { label: "아주 좋음", text: "text-emerald-700", bg: "bg-emerald-100", ring: "ring-emerald-300" };
  if (score >= 55)
    return { label: "좋음", text: "text-lime-700", bg: "bg-lime-100", ring: "ring-lime-300" };
  if (score >= 40)
    return { label: "보통", text: "text-amber-700", bg: "bg-amber-100", ring: "ring-amber-300" };
  return { label: "주의", text: "text-rose-700", bg: "bg-rose-100", ring: "ring-rose-300" };
}
