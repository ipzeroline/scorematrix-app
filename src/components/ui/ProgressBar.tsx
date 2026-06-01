import { cn } from "@/lib/utils";

export type ProgressBarColor =
  | "cyan"
  | "green"
  | "gold"
  | "purple"
  | "magenta"
  | "red";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: ProgressBarColor;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const colorClasses = {
  cyan: "bg-cyan-500",
  green: "bg-green-500",
  gold: "bg-amber-500",
  purple: "bg-purple-500",
  magenta: "bg-magenta-500",
  red: "bg-red-500",
};

const sizeClasses = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function ProgressBar({
  value,
  max = 100,
  color = "cyan",
  size = "md",
  showLabel,
  className,
}: ProgressBarProps) {
  const safeValue = Number.isFinite(value) ? Math.max(value, 0) : 0;
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const pct = Math.min(Math.round((safeValue / safeMax) * 100), 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{pct}%</span>
          <span className="text-gray-500">
            {safeValue}/{safeMax}
          </span>
        </div>
      )}
      <div className={cn("rounded-full bg-gray-800 overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            colorClasses[color]
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
