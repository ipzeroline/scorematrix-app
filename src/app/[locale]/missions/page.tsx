"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Award, CalendarClock, CheckCircle2, Flame, Star, Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { dailyMissions, weeklyMissions } from "@/data/missions";
import {
  achievementItems,
  getMissionPageCopy,
} from "@/data/mission-page-content";
import type { Mission } from "@/types/mission";
import { MissionType } from "@/types/common";
import { cn } from "@/lib/utils";

type TabKey = "daily" | "weekly" | "achievements";

const categoryColors: Record<string, "cyan" | "green" | "gold" | "purple" | "magenta"> = {
  predict: "cyan",
  streak: "gold",
  accuracy: "green",
  social: "purple",
  daily_login: "magenta",
};

export default function MissionsPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getMissionPageCopy(locale);
  const [tab, setTab] = useState<TabKey>("daily");
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});

  const daily = useMemo(
    () => dailyMissions.map((mission) => withCopy(mission, copy)),
    [copy]
  );
  const weekly = useMemo(
    () => weeklyMissions.map((mission) => withCopy(mission, copy)),
    [copy]
  );
  const availableRewards = [...daily, ...weekly]
    .filter((mission) => mission.completed)
    .reduce((sum, mission) => sum + mission.rewardPoints, 0);
  const completedToday = daily.filter((mission) => mission.completed).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b1018] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(168,85,247,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="purple" size="md">
              {copy.levelLine}
            </Badge>
            <h1 className="mt-3 font-display text-3xl font-black text-white md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 lg:w-[430px]">
            <HeroStat
              icon={CheckCircle2}
              label={copy.completedToday}
              value={`${completedToday}/${daily.length}`}
              tone="text-green-300"
            />
            <HeroStat
              icon={Trophy}
              label={copy.totalRewards}
              value={availableRewards.toLocaleString()}
              tone="text-amber-300"
            />
            <HeroStat
              icon={Flame}
              label={copy.activeStreak}
              value={`7 ${copy.days}`}
              tone="text-red-300"
            />
          </div>
        </div>
      </section>

      <Tabs
        tabs={[
          { key: "daily", label: copy.daily, count: daily.length },
          { key: "weekly", label: copy.weekly, count: weekly.length },
          { key: "achievements", label: copy.achievements, count: achievementItems.length },
        ]}
        activeTab={tab}
        onChange={(key) => setTab(key as TabKey)}
      />

      {tab === "daily" && (
        <MissionList
          intro={copy.dailyIntro}
          missions={daily}
          copy={copy}
          claimed={claimed}
          onClaim={(id) => setClaimed((prev) => ({ ...prev, [id]: true }))}
        />
      )}

      {tab === "weekly" && (
        <MissionList
          intro={copy.weeklyIntro}
          missions={weekly}
          copy={copy}
          claimed={claimed}
          onClaim={(id) => setClaimed((prev) => ({ ...prev, [id]: true }))}
        />
      )}

      {tab === "achievements" && (
        <section>
          <p className="mb-4 text-sm leading-6 text-gray-500">
            {copy.achievementsIntro}
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {achievementItems.map((achievement) => {
              const item = copy.achievementsList[achievement.id as keyof typeof copy.achievementsList];
              return (
                <Card
                  key={achievement.id}
                  className={cn(
                    "p-4 text-center",
                    !achievement.unlocked && "opacity-55"
                  )}
                >
                  <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 font-mono text-sm font-black text-cyan-200">
                    {achievement.icon}
                  </div>
                  <h3 className="text-sm font-bold text-white">{item.name}</h3>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {item.desc}
                  </p>
                  <Badge
                    variant={achievement.unlocked ? "green" : "default"}
                    className="mt-3"
                  >
                    {achievement.unlocked ? copy.unlocked : copy.locked}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-black/25 p-3">
      <Icon size={16} className={tone} />
      <p className="mt-2 font-mono text-lg font-black text-white">{value}</p>
      <p className="mt-1 text-[10px] leading-tight text-gray-500">{label}</p>
    </div>
  );
}

function MissionList({
  intro,
  missions,
  copy,
  claimed,
  onClaim,
}: {
  intro: string;
  missions: Mission[];
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: Record<string, boolean>;
  onClaim: (id: string) => void;
}) {
  return (
    <section>
      <p className="mb-4 text-sm leading-6 text-gray-500">{intro}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {missions.map((mission) => (
          <MissionPanel
            key={mission.id}
            mission={mission}
            copy={copy}
            claimed={Boolean(claimed[mission.id])}
            onClaim={onClaim}
          />
        ))}
      </div>
    </section>
  );
}

function MissionPanel({
  mission,
  copy,
  claimed,
  onClaim,
}: {
  mission: Mission;
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: boolean;
  onClaim: (id: string) => void;
}) {
  const progress = Math.min(mission.progress, mission.target);
  const complete = mission.completed || progress >= mission.target;
  const progressColor = complete ? "green" : categoryColors[mission.category] ?? "cyan";

  return (
    <Card className={cn("p-4", complete && !claimed && "border-green-500/30")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={mission.type === MissionType.DAILY ? "cyan" : "purple"}>
              {mission.type === MissionType.DAILY ? copy.daily : copy.weekly}
            </Badge>
            <Badge variant={categoryColors[mission.category] ?? "cyan"}>
              {copy.categories[mission.category]}
            </Badge>
          </div>
          <h3 className="truncate text-sm font-bold text-white">{mission.title}</h3>
        </div>
        <StatusBadge complete={complete} claimed={claimed} copy={copy} />
      </div>

      <p className="mb-3 text-xs leading-5 text-gray-400">{mission.description}</p>

      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px]">
          <span className="text-gray-500">{copy.progress}</span>
          <span className="font-mono text-gray-400">
            {progress}/{mission.target}
          </span>
        </div>
        <ProgressBar value={progress} max={mission.target} color={progressColor} size="sm" />
      </div>

      <div className="flex items-center gap-2">
        <PointsBadge type="free" amount={mission.rewardPoints} size="sm" showLabel />
        <span className="font-mono text-xs font-bold text-purple-300">
          +{mission.rewardXP} {copy.xp}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-800/70 pt-3">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <CalendarClock size={12} />
          {copy.resetsIn.replace("{time}", getTimeUntilReset(mission.resetAt, copy))}
        </span>
        {complete && !claimed ? (
          <Button variant="gold" size="sm" onClick={() => onClaim(mission.id)}>
            <Award size={14} />
            {copy.claimReward}
          </Button>
        ) : claimed ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-300">
            <CheckCircle2 size={14} />
            {copy.claimed}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-gray-500">
            <Zap size={12} />
            {copy.keepGoing}
          </span>
        )}
      </div>
    </Card>
  );
}

function StatusBadge({
  complete,
  claimed,
  copy,
}: {
  complete: boolean;
  claimed: boolean;
  copy: ReturnType<typeof getMissionPageCopy>;
}) {
  if (claimed) return <Badge variant="green">{copy.claimed}</Badge>;
  if (complete) return <Badge variant="gold">{copy.ready}</Badge>;
  return <Badge variant="default">{copy.inProgress}</Badge>;
}

function withCopy(mission: Mission, copy: ReturnType<typeof getMissionPageCopy>): Mission {
  const translated = copy.missions[mission.id as keyof typeof copy.missions];
  return translated
    ? { ...mission, title: translated.title, description: translated.desc }
    : mission;
}

function getTimeUntilReset(resetAt: string, copy: ReturnType<typeof getMissionPageCopy>) {
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return copy.resetting;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return copy.resetSoon;
}
