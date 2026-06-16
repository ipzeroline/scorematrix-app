"use client";

import { useTranslations } from "next-intl";
import {
  CheckCircle2,
  Clock3,
  Share2,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";
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
  icon: LucideIcon;
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
    icon: Target,
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
    icon: CheckCircle2,
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
    icon: Share2,
  },
];

export function MissionsPreview() {
  const t = useTranslations();

  return (
    <Card className="missions-preview-card relative flex h-full flex-col overflow-hidden border-purple-500/20 !bg-[#10101b]">
      <div className="missions-preview-grid absolute inset-0" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="missions-preview-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-purple-400/35 bg-purple-500/10 text-purple-200">
            <Zap size={21} strokeWidth={2.35} aria-hidden="true" />
          </span>
          <h3 className="truncate text-lg font-bold text-white">
            {t("gamification.dailyMissions")}
          </h3>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-green-400/20 bg-green-400/10 px-2 py-1 text-[10px] text-green-200">
          <Clock3 size={12} strokeWidth={2.4} aria-hidden="true" />
          {t("gamification.resetIn")} 6h 23m
        </span>
      </div>

      <div className="relative flex flex-col gap-4 flex-1">
        {dailyMissions.map((mission) => {
          const MissionIcon = mission.icon;
          return (
          <div
            key={mission.id}
            className={`mission-preview-item rounded-lg p-3 border ${
              mission.completed
                ? "border-green-500/20 bg-green-500/5"
                : "border-purple-500/15 bg-[#0a0a0f]/80"
            }`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex min-w-0 items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                  <MissionIcon size={16} strokeWidth={2.35} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white">
                    {t(`dashboard.missions.${mission.titleKey}`)}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t(`dashboard.missions.${mission.descriptionKey}`)}
                  </p>
                </div>
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
                <CheckCircle2 size={13} aria-hidden="true" /> {t("gamification.claimed")}
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
          );
        })}
      </div>
    </Card>
  );
}
