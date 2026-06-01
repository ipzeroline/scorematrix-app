"use client";

import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";

// Approximate XP per level (exponential growth)
const XP_PER_LEVEL = 1000;

function getLinearXpProgress(xp: number, level: number) {
  const xpForCurrentLevel = (level - 1) * XP_PER_LEVEL;
  const progressInLevel = xp - xpForCurrentLevel;
  const xpNeeded = XP_PER_LEVEL - progressInLevel;

  return {
    progressInLevel: Math.max(0, Math.min(progressInLevel, XP_PER_LEVEL)),
    currentLevelXP: XP_PER_LEVEL,
    xpNeeded: Math.max(0, xpNeeded),
  };
}

interface XPProgressBarProps {
  currentXP: number;
  level: number;
  className?: string;
}

export function XPProgressBar({
  currentXP,
  level,
  className,
}: XPProgressBarProps) {
  const { progressInLevel, currentLevelXP, xpNeeded } = getLinearXpProgress(currentXP, level);

  // Level badge colors by range
  const levelBadgeColor = (lvl: number): string => {
    if (lvl >= 50) return "bg-magenta-500/20 text-magenta-400 border-magenta-500/30";
    if (lvl >= 30) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    if (lvl >= 15) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    if (lvl >= 5) return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    return "bg-green-500/20 text-green-400 border-green-500/30";
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Level indicators and bar */}
      <div className="flex items-center gap-3">
        {/* Current level */}
        <span
          className={cn(
            "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
            levelBadgeColor(level)
          )}
        >
          Lv.{level}
        </span>

        {/* Progress bar */}
        <div className="flex-1">
          <ProgressBar
            value={progressInLevel}
            max={currentLevelXP}
            color={level >= 30 ? "magenta" : level >= 15 ? "cyan" : "green"}
            size="md"
          />
        </div>

        {/* Next level */}
        <span
          className={cn(
            "shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border",
            levelBadgeColor(level + 1)
          )}
        >
          Lv.{level + 1}
        </span>
      </div>

      {/* XP text */}
      <div className="flex justify-between text-[10px]">
        <span className="text-gray-500">
          {progressInLevel.toLocaleString()} / {currentLevelXP.toLocaleString()} XP
        </span>
        <span className="text-gray-600">
          {xpNeeded.toLocaleString()} XP to Level {level + 1}
        </span>
      </div>
    </div>
  );
}
