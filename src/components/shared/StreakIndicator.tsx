import { cn } from "@/lib/utils";

interface StreakIndicatorProps {
  current: number;
  best: number;
  size?: "sm" | "md";
  className?: string;
}

export function StreakIndicator({
  current,
  best,
  size = "md",
  className,
}: StreakIndicatorProps) {
  const isGold = current >= 5;
  const isFire = current >= 3;

  const sizeClasses = {
    sm: "text-xs gap-1 px-2 py-0.5",
    md: "text-sm gap-1.5 px-2.5 py-1",
  };

  const emojiSize = {
    sm: "text-sm",
    md: "text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-bold font-mono",
        isGold
          ? "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
          : isFire
            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
            : "bg-gray-500/10 text-gray-400 border-gray-500/20",
        sizeClasses[size],
        className
      )}
      title={`${current} streak | Best: ${best}`}
    >
      <span className={emojiSize[size]}>
        {current >= 10 ? "💥" : current >= 5 ? "🔥" : current >= 3 ? "⚡" : "📊"}
      </span>

      <span>
        {current} streak
      </span>

      {best > current && size === "md" && (
        <span className="text-gray-600 font-normal text-xs">
          (best: {best})
        </span>
      )}
    </span>
  );
}
