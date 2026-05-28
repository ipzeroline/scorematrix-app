"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Dice5,
  Flame,
  Star,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import { PointsBadge } from "@/components/shared/PointsBadge";
import {
  achievementItems,
  getMissionPageCopy,
} from "@/data/mission-page-content";
import {
  getCurrentUser,
  type CurrentUserData,
  type CurrentUserResponse,
} from "@/lib/auth-api";
import {
  DEFAULT_MISSIONS_RESPONSE,
  getMissions,
  mapApiMission,
  claimMission,
} from "@/lib/missions-api";
import type { Mission } from "@/types/mission";
import { MissionType } from "@/types/common";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

type TabKey = "daily" | "weekly" | "special" | "achievements";

const categoryColors: Record<string, "cyan" | "green" | "gold" | "purple" | "magenta"> = {
  predict: "cyan",
  streak: "gold",
  accuracy: "green",
  social: "purple",
  daily_login: "magenta",
};

const missionIconMap = {
  award: Award,
  calendar: Calendar,
  "calendar-check": CalendarCheck,
  "dice-5": Dice5,
  flame: Flame,
  target: Target,
  trophy: Trophy,
  users: Users,
  zap: Zap,
};

type HeroStats = {
  freePoints: number;
  xp: number;
  level: number;
  streak: number;
  missionsCompleted: number;
};

export default function MissionsPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getMissionPageCopy(locale);
  const [tab, setTab] = useState<TabKey>("daily");
  const [claimed, setClaimed] = useState<Record<string, boolean>>({});
  const [daily, setDaily] = useState<Mission[]>(
    DEFAULT_MISSIONS_RESPONSE.daily.map((mission) =>
      mapApiMission(mission, MissionType.DAILY)
    )
  );
  const [weekly, setWeekly] = useState<Mission[]>(
    DEFAULT_MISSIONS_RESPONSE.weekly.map((mission) =>
      mapApiMission(mission, MissionType.WEEKLY)
    )
  );
  const [special, setSpecial] = useState<Mission[]>(
    DEFAULT_MISSIONS_RESPONSE.special.map((mission) =>
      mapApiMission(mission, MissionType.SPECIAL)
    )
  );
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [heroStats, setHeroStats] = useState<HeroStats>(() => {
    const user = useUserStore.getState();
    return {
      freePoints: user.freePoints,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      missionsCompleted: user.missionsCompleted,
    };
  });
  const now = null;

  const [claimModal, setClaimModal] = useState<{
    isOpen: boolean;
    missionTitle: string;
    points: number;
    xp: number;
    credits: number;
  }>({
    isOpen: false,
    missionTitle: "",
    points: 0,
    xp: 0,
    credits: 0,
  });

  const handleClaimMission = async (missionId: string) => {
    const mission = [...daily, ...weekly, ...special].find((m) => m.id === missionId);
    if (!mission) return;

    try {
      await claimMission(missionId, { locale });
    } catch (err) {
      console.warn("Failed to claim mission on backend, fallback to client-side only", err);
    }

    setClaimed((prev) => ({ ...prev, [missionId]: true }));

    setClaimModal({
      isOpen: true,
      missionTitle: mission.title,
      points: mission.rewardPoints,
      xp: mission.rewardXP,
      credits: mission.rewardCredits ?? 0,
    });

    const store = useUserStore.getState();
    const nextPoints = store.freePoints + mission.rewardPoints;
    const nextCredits = store.premiumCredits + (mission.rewardCredits ?? 0);
    const nextXP = store.xp + mission.rewardXP;
    const nextLevel = Math.floor(nextXP / 1000) + 1;
    const nextCompleted = store.missionsCompleted + 1;

    const nextStats = {
      freePoints: nextPoints,
      premiumCredits: nextCredits,
      xp: nextXP,
      level: nextLevel,
      missionsCompleted: nextCompleted,
    };

    useUserStore.setState(nextStats);
    setHeroStats((prev) => ({
      ...prev,
      freePoints: nextPoints,
      xp: nextXP,
      level: nextLevel,
      missionsCompleted: nextCompleted,
    }));
  };

  useEffect(() => {
    let active = true;

    getMissions({ locale })
      .then((response) => {
        if (!active) return;
        setDaily(response.daily.map((mission) => mapApiMission(mission, MissionType.DAILY)));
        setWeekly(response.weekly.map((mission) => mapApiMission(mission, MissionType.WEEKLY)));
        setSpecial(response.special.map((mission) => mapApiMission(mission, MissionType.SPECIAL)));
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setDaily(DEFAULT_MISSIONS_RESPONSE.daily.map((mission) => mapApiMission(mission, MissionType.DAILY)));
        setWeekly(DEFAULT_MISSIONS_RESPONSE.weekly.map((mission) => mapApiMission(mission, MissionType.WEEKLY)));
        setSpecial(DEFAULT_MISSIONS_RESPONSE.special.map((mission) => mapApiMission(mission, MissionType.SPECIAL)));
        setLoadFailed(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    let active = true;

    getCurrentUser({ locale })
      .then((response) => {
        if (!active) return;
        const profile = extractCurrentUser(response);
        const stats = profile?.stats;
        const currentUser = useUserStore.getState();
        const nextHeroStats = {
          freePoints:
            pickNumber(stats?.freePoints, profile?.freePoints) ??
            currentUser.freePoints,
          xp: pickNumber(stats?.xp, profile?.xp) ?? currentUser.xp,
          level: pickNumber(stats?.level, profile?.level) ?? currentUser.level,
          streak: pickNumber(stats?.streak) ?? currentUser.streak,
          missionsCompleted:
            pickNumber(stats?.missionsCompleted) ??
            currentUser.missionsCompleted,
        };

        setHeroStats(nextHeroStats);
        useUserStore.setState(nextHeroStats);
      })
      .catch(() => {
        if (!active) return;
        const user = useUserStore.getState();
        setHeroStats({
          freePoints: user.freePoints,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          missionsCompleted: user.missionsCompleted,
        });
      });

    return () => {
      active = false;
    };
  }, [locale]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b1018] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(168,85,247,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="purple" size="md">
              {copy.levelLine
                .replace("{level}", heroStats.level.toLocaleString())
                .replace("{xp}", heroStats.xp.toLocaleString())}
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
              value={`${heroStats.missionsCompleted.toLocaleString()}/${daily.length}`}
              tone="text-green-300"
            />
            <HeroStat
              icon={Trophy}
              label={copy.totalRewards}
              value={heroStats.freePoints.toLocaleString()}
              tone="text-amber-300"
            />
            <HeroStat
              icon={Flame}
              label={copy.activeStreak}
              value={`${heroStats.streak.toLocaleString()} ${copy.days}`}
              tone="text-red-300"
            />
          </div>
        </div>
      </section>

      <Tabs
        tabs={[
          { key: "daily", label: copy.daily, count: daily.length },
          { key: "weekly", label: copy.weekly, count: weekly.length },
          { key: "special", label: copy.special, count: special.length },
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
          now={now}
          loading={loading}
          loadFailed={loadFailed}
          onClaim={handleClaimMission}
        />
      )}

      {tab === "weekly" && (
        <MissionList
          intro={copy.weeklyIntro}
          missions={weekly}
          copy={copy}
          claimed={claimed}
          now={now}
          loading={loading}
          loadFailed={loadFailed}
          onClaim={handleClaimMission}
        />
      )}

      {tab === "special" && (
        <MissionList
          intro={copy.specialIntro}
          missions={special}
          copy={copy}
          claimed={claimed}
          now={now}
          loading={loading}
          loadFailed={loadFailed}
          onClaim={handleClaimMission}
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
      {/* Premium Cyberpunk Claim Reward Popup Modal */}
      {claimModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes cyber-pulse {
              0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(217, 70, 239, 0.2); }
              50% { box-shadow: 0 0 35px rgba(6, 182, 212, 0.6), 0 0 60px rgba(217, 70, 239, 0.4); }
            }
            @keyframes scanline {
              0% { top: 0%; }
              100% { top: 100%; }
            }
            @keyframes number-pop {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            .cyber-modal {
              animation: cyber-pulse 3s infinite alternate;
            }
            .scan-line {
              animation: scanline 2.5s linear infinite;
            }
            .reward-pop {
              animation: number-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}} />
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
            onClick={() => setClaimModal((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Modal Container */}
          <div className="cyber-modal relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-[#060913] p-6 text-center shadow-2xl transition-all duration-300">
            {/* Holographic grid and scanning line */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />
            <div className="scan-line absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />
            
            {/* Cyber Corner Decos */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-magenta" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-magenta" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            <div className="relative z-10 space-y-6">
              {/* Spinning/pulsing neon crest */}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-magenta/20 p-2 border border-cyan-400/30">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#090e1a] border border-magenta/40 animate-pulse">
                  <Award size={48} className="text-cyan-300 animate-bounce" />
                  <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div>
                <Badge variant="gold" size="md" className="tracking-widest uppercase">
                  {copy.claimReward} SUCCESS
                </Badge>
                <h2 className="mt-3 font-display text-2xl font-black text-white">
                  {claimModal.missionTitle}
                </h2>
                <p className="mt-1.5 text-xs text-cyan-400/70 uppercase tracking-widest font-mono">
                  TRANSACTION SECURED // INCOMING ASSETS
                </p>
              </div>

              {/* Reward Grid */}
              <div className="grid grid-cols-3 gap-3 py-2">
                {/* Points */}
                {claimModal.points > 0 && (
                  <div className="reward-pop opacity-0 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center transition-all hover:scale-105" style={{ animationDelay: '0.1s' }}>
                    <div className="font-mono text-2xl font-black text-cyan-300">
                      +{claimModal.points}
                    </div>
                    <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-cyan-500">
                      Points
                    </div>
                  </div>
                )}
                {/* XP */}
                {claimModal.xp > 0 && (
                  <div className="reward-pop opacity-0 rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-center transition-all hover:scale-105" style={{ animationDelay: '0.2s' }}>
                    <div className="font-mono text-2xl font-black text-purple-300">
                      +{claimModal.xp}
                    </div>
                    <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-purple-500">
                      XP
                    </div>
                  </div>
                )}
                {/* Credits */}
                {claimModal.credits > 0 && (
                  <div className="reward-pop opacity-0 rounded-xl border border-magenta/30 bg-magenta/10 p-3 text-center transition-all hover:scale-105" style={{ animationDelay: '0.3s' }}>
                    <div className="font-mono text-2xl font-black text-magenta">
                      +{claimModal.credits}
                    </div>
                    <div className="mt-1 text-[10px] uppercase font-bold tracking-wider text-magenta/80">
                      Credits
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Details */}
              <div className="rounded-lg bg-black/40 border border-gray-800/80 p-3 text-xs text-gray-400 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>LEVEL STATE:</span>
                  <span className="text-white font-bold">Lvl {heroStats.level}</span>
                </div>
                <div className="flex justify-between">
                  <span>CURRENT BALANCE:</span>
                  <span className="text-cyan-300 font-bold">{heroStats.freePoints.toLocaleString()} PTS</span>
                </div>
              </div>

              {/* CTA Button */}
              <Button
                variant="gold"
                className="w-full text-sm font-bold tracking-widest py-3 uppercase border border-yellow-400/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                onClick={() => setClaimModal((prev) => ({ ...prev, isOpen: false }))}
              >
                DISMISS INTERFACE
              </Button>
            </div>
          </div>
        </div>
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
  now,
  loading,
  loadFailed,
  onClaim,
}: {
  intro: string;
  missions: Mission[];
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: Record<string, boolean>;
  now: number | null;
  loading: boolean;
  loadFailed: boolean;
  onClaim: (id: string) => void;
}) {
  return (
    <section>
      <p className="mb-4 text-sm leading-6 text-gray-500">{intro}</p>
      {loading && (
        <div className="grid gap-3 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="h-44 animate-pulse border-gray-800 bg-white/[0.03]"
            />
          ))}
        </div>
      )}
      {!loading && loadFailed && (
        <Card className="border-red-500/30 bg-red-500/5 p-5">
          <p className="text-sm text-red-200">{copy.loadFailed}</p>
        </Card>
      )}
      {!loading && !loadFailed && missions.length === 0 && (
        <Card className="p-5">
          <p className="text-sm text-gray-400">{copy.noMissions}</p>
        </Card>
      )}
      {!loading && !loadFailed && missions.length > 0 && (
      <div className="grid gap-3 lg:grid-cols-2">
        {missions.map((mission) => (
          <MissionPanel
            key={mission.id}
            mission={mission}
            copy={copy}
            claimed={Boolean(claimed[mission.id])}
            now={now}
            onClaim={onClaim}
          />
        ))}
      </div>
      )}
    </section>
  );
}

function MissionPanel({
  mission,
  copy,
  claimed,
  now,
  onClaim,
}: {
  mission: Mission;
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: boolean;
  now: number | null;
  onClaim: (id: string) => void;
}) {
  const progress = Math.min(mission.progress, mission.target);
  const complete = mission.completed || progress >= mission.target;
  const progressColor = complete ? "green" : categoryColors[mission.category] ?? "cyan";
  const missionIcon = getMissionIcon(mission.icon);
  const claimedOrApiClaimed = claimed || mission.claimed;

  return (
    <Card className={cn("p-4 transition-all duration-300 hover:scale-[1.015] hover:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-500/40", complete && !claimedOrApiClaimed && "border-green-500/30 hover:border-green-400/50 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]")}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
            {missionIcon}
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant={getMissionTypeBadge(mission.type)}>
                {getMissionTypeLabel(mission.type, copy)}
              </Badge>
              <Badge variant={categoryColors[mission.category] ?? "cyan"}>
                {copy.categories[mission.category]}
              </Badge>
            </div>
            <h3 className="truncate text-sm font-bold text-white">{mission.title}</h3>
          </div>
        </div>
        <StatusBadge complete={complete} claimed={claimedOrApiClaimed} copy={copy} />
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
        {mission.rewardCredits && mission.rewardCredits > 0 && (
          <PointsBadge
            type="premium"
            amount={mission.rewardCredits}
            size="sm"
            showLabel
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-gray-800/70 pt-3">
        <span className="flex items-center gap-1 text-[10px] text-gray-500">
          <CalendarClock size={12} />
          {copy.resetsIn.replace("{time}", getTimeUntilReset(mission.resetAt, copy, now))}
        </span>
        {complete && !claimedOrApiClaimed ? (
          <Button variant="gold" size="sm" onClick={() => onClaim(mission.id)}>
            <Award size={14} />
            {copy.claimReward}
          </Button>
        ) : claimedOrApiClaimed ? (
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

function getMissionTypeLabel(
  type: MissionType,
  copy: ReturnType<typeof getMissionPageCopy>
) {
  if (type === MissionType.WEEKLY) return copy.weekly;
  if (type === MissionType.SPECIAL) return copy.special;
  return copy.daily;
}

function getMissionTypeBadge(
  type: MissionType
): "cyan" | "purple" | "gold" {
  if (type === MissionType.WEEKLY) return "purple";
  if (type === MissionType.SPECIAL) return "gold";
  return "cyan";
}

function getMissionIcon(icon?: string) {
  const Icon = icon ? missionIconMap[icon as keyof typeof missionIconMap] : undefined;
  const MissionIcon = Icon ?? Zap;
  return <MissionIcon size={18} />;
}

function extractCurrentUser(response: CurrentUserResponse): CurrentUserData | null {
  if (!isRecord(response)) return null;
  if (isCurrentUserData(response)) return response;
  if (isRecord(response.user)) return extractCurrentUser(response.user);
  if (isRecord(response.member)) return extractCurrentUser(response.member);
  if (isRecord(response.profile)) return extractCurrentUser(response.profile);
  if (isRecord(response.data)) return extractCurrentUser(response.data);
  return null;
}

function isCurrentUserData(value: Record<string, unknown>): value is CurrentUserData {
  return (
    "stats" in value ||
    "username" in value ||
    "user_name" in value ||
    "displayName" in value ||
    "display_name" in value
  );
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(number)) return number;
  }
  return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getTimeUntilReset(
  resetAt: string,
  copy: ReturnType<typeof getMissionPageCopy>,
  now: number | null
) {
  if (now === null) return "--";
  const diff = new Date(resetAt).getTime() - now;
  if (diff <= 0) return copy.resetting;
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return copy.resetSoon;
}
