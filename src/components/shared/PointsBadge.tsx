"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatPoints, formatCredits } from "@/lib/currency";
import type { CurrencyType } from "@/lib/currency";

interface PointsBadgeProps {
  type: CurrencyType;
  amount: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function PointsBadge({
  type,
  amount,
  size = "md",
  showIcon = true,
  showLabel = false,
  className,
}: PointsBadgeProps) {
  const t = useTranslations("common");
  const isFree = type === "free";
  const formatted = isFree ? formatPoints(amount) : formatCredits(amount);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold font-mono",
        isFree
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-amber-500/10 text-amber-400 border-amber-500/20",
        sizeClasses[size],
        className
      )}
      title={isFree ? t("freePoints") : t("premiumCredits")}
    >
      {showIcon && <span>{isFree ? "🟢" : "🟡"}</span>}
      <span>{formatted}</span>
      {showLabel && (
        <span className="font-normal">
          {isFree ? t("points") : t("credits")}
        </span>
      )}
    </span>
  );
}
