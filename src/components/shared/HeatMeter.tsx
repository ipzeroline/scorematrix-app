"use client";

import { cn } from "@/lib/utils";

interface HeatMeterProps {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getHeatLabel(value: number): string {
  if (value >= 90) return "Very heated";
  if (value >= 75) return "Exciting";
  if (value >= 50) return "Decent";
  if (value >= 25) return "Light";
  return "Boring";
}

function getHeatEmoji(value: number): string {
  if (value >= 90) return "🔥";
  if (value >= 75) return "⚡️";
  if (value >= 50) return "🤔";
  if (value >= 25) return "😐";
  return "💤";
}

export function HeatMeter({
  value,
  size = "md",
  className,
}: HeatMeterProps) {
  const normalized = value <= 10 ? value * 10 : value;
  const clamped = Math.min(100, Math.max(0, Math.round(normalized)));
  const percentage = clamped;

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Bar */}
      <div className="flex items-center gap-2">
        <span className="text-sm">{getHeatEmoji(clamped)}</span>
        <div
          className={cn(
            "flex-1 rounded-full overflow-hidden bg-gray-800 relative",
            sizeClasses[size]
          )}
        >
          {/* Segmented gradient background */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #f97316, #ef4444)",
            }}
          />

          {/* Filled indicator */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-[#0a0a0f] rounded-r-full transition-all duration-500"
            style={{ width: `${100 - percentage}%` }}
          />
        </div>
        <span className="w-8 text-right text-sm font-mono font-bold text-white">
          {clamped}/100
        </span>
      </div>

      {/* Label */}
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>0 - Boring</span>
        <span className="text-xs font-medium text-gray-400">
          {getHeatLabel(clamped)}
        </span>
        <span>100 - Very heated</span>
      </div>
    </div>
  );
}
