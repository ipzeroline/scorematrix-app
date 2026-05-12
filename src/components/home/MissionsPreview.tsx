"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Button } from "@/components/ui/Button";

interface MissionItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  target: number;
  progress: number;
  rewardPoints: number;
  completed: boolean;
  claimed: boolean;
  color: "cyan" | "green" | "gold" | "purple" | "magenta";
}

const dailyMissions: MissionItem[] = [
  {
    id: "ms-1",
    titleKey: "predict5.title",
    descriptionKey: "predict5.description",
    target: 5,
    progress: 3,
    rewardPoints: 500,
    completed: false,
    claimed: false,
    color: "cyan",
  },
  {
    id: "ms-2",
    titleKey: "perfectAccuracy.title",
    descriptionKey: "perfectAccuracy.description",
    target: 3,
    progress: 3,
    rewardPoints: 1000,
    completed: true,
    claimed: false,
    color: "green",
  },
  {
    id: "ms-3",
    titleKey: "socialShare.title",
    descriptionKey: "socialShare.description",
    target: 1,
    progress: 0,
    rewardPoints: 250,
    completed: false,
    claimed: false,
    color: "purple",
  },
];

export function MissionsPreview() {
  const t = useTranslations();

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold font-display text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("gamification.dailyMissions")}
        </h3>
        <span className="text-[10px] text-gray-500">
          {t("gamification.resetIn")} 6h 23m
        </span>
      </div>

      <div className="flex flex-col gap-4 flex-1">
        {dailyMissions.map((mission) => (
          <div
            key={mission.id}
            className={`rounded-lg p-3 border ${
              mission.completed
                ? "border-green-500/20 bg-green-500/5"
                : "border-gray-800 bg-[#0a0a0f]"
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {t(`dashboard.missions.${mission.titleKey}`)}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t(`dashboard.missions.${mission.descriptionKey}`)}
                </p>
              </div>
              <div className="flex-shrink-0">
                <PointsBadge
                  type="free"
                  amount={mission.rewardPoints}
                  size="sm"
                  showLabel
                />
              </div>
            </div>

            <div className="mb-2">
              <ProgressBar
                value={mission.progress}
                max={mission.target}
                color={mission.color}
                size="sm"
                showLabel
              />
            </div>

            {mission.completed && !mission.claimed ? (
              <Button variant="gold" size="sm" className="w-full">
                {t("gamification.claim")}
              </Button>
            ) : mission.claimed ? (
              <span className="text-xs text-green-400 flex items-center gap-1">
                &#10003; {t("gamification.claimed")}
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                {t("dashboard.completedCount", {
                  progress: mission.progress,
                  target: mission.target,
                })}
              </span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
