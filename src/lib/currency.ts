export type CurrencyType = "free" | "premium";

export function formatPoints(amount: number): string {
  return amount.toLocaleString();
}

export function formatCredits(amount: number): string {
  return amount.toLocaleString();
}

export function getCurrencyColor(type: CurrencyType): string {
  return type === "free" ? "#10b981" : "#f59e0b";
}

export function getCurrencyBgClass(type: CurrencyType): string {
  return type === "free"
    ? "bg-green-500/10 text-green-400 border-green-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";
}

export function getCurrencyIcon(type: CurrencyType): string {
  return type === "free" ? "🟢" : "🟡";
}
