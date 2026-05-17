"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Mission, MissionType } from "@/types";

function getTimeUntilReset(resetAt: string): string {
  return resetAt ? "Resets soon" : "";
}

const categoryColors: Record<string, "cyan" | "green" | "gold" | "purple" | "magenta"> = {
  predict: "cyan",
  streak: "gold",
  accuracy: "green",
  social: "purple",
  daily_login: "magenta",
};

interface MissionCardProps {
  mission: Mission;
  onClaim?: (missionId: string) => void;
  className?: string;
}

export function MissionCard({ mission, onClaim, className }: MissionCardProps) {
  const isCompleted = mission.completed;
  const isClaimed = mission.claimed;
  const progress = Math.min(mission.progress, mission.target);
  const percentage = mission.target > 0 ? (progress / mission.target) * 100 : 0;
  const progressColor = categoryColors[mission.category] ?? "cyan";

  return (
    <Card
      className={cn(
        "animate-slide-up",
        isClaimed && "opacity-50",
        isCompleted && !isClaimed && "border-green-500/30",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant={
                mission.type === MissionType.DAILY ? "cyan" : "purple"
              }
              size="sm"
            >
              {mission.type === MissionType.DAILY ? "Daily" : "Weekly"}
            </Badge>
            <Badge
              variant={categoryColors[mission.category] ?? "cyan"}
              size="sm"
            >
              {mission.category.replace("_", " ")}
            </Badge>
          </div>
          <h3 className="text-sm font-display font-bold text-white truncate">
            {mission.title}
          </h3>
        </div>

        {/* Status */}
        <div className="shrink-0 ml-2">
          {isClaimed ? (
            <Badge variant="green">Claimed</Badge>
          ) : isCompleted ? (
            <Badge variant="gold">Complete!</Badge>
          ) : (
            <Badge variant="default">In Progress</Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3">{mission.description}</p>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-gray-500">Progress</span>
          <span className="text-gray-400 font-mono">
            {progress}/{mission.target}
          </span>
        </div>
        <ProgressBar
          value={progress}
          max={mission.target}
          color={isCompleted ? "green" : progressColor}
          size="sm"
        />
      </div>

      {/* Rewards */}
      <div className="flex items-center gap-2 mb-3">
        <PointsBadge type="free" amount={mission.rewardPoints} size="sm" />
        <span className="text-xs text-purple-400 font-mono font-bold">
          +{mission.rewardXP} XP
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
        {!isClaimed && (
          <span className="text-[10px] text-gray-500">
            {getTimeUntilReset(mission.resetAt)}
          </span>
        )}
        {isCompleted && !isClaimed && (
          <Button
            variant="gold"
            size="sm"
            className="ml-auto"
            onClick={() => onClaim?.(mission.id)}
          >
            Claim Reward
          </Button>
        )}
        {isClaimed && (
          <span className="text-[10px] text-green-400 ml-auto">
            Claimed
          </span>
        )}
        {!isCompleted && !isClaimed && (
          <span className="text-[10px] text-gray-500 ml-auto">
            Keep going!
          </span>
        )}
      </div>
    </Card>
  );
}
