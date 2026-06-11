"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Coins,
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
import { XPProgressBar } from "@/components/shared/XPProgressBar";
import { getMissionPageCopy } from "@/data/mission-page-content";
import {
  getAchievements,
  type AchievementsResponse,
  type ApiAchievement,
} from "@/lib/achievements-api";
import {
  getCurrentUser,
  extractCurrentUser,
  type CurrentUserData,
  type CurrentUserResponse,
} from "@/lib/auth-api";
import {
  DEFAULT_MISSIONS_RESPONSE,
  getMissions,
  mapApiMission,
  claimMission,
  type MissionCurrentStats,
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

function formatTimeLeft(ms: number): string {
  if (ms <= 0) {
    return "0s";
  }

  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

type HeroStats = {
  freePoints: number;
  xp: number;
  level: number;
  streak: number;
  missionsCompleted: number;
};

const INITIAL_HERO_STATS: HeroStats = {
  freePoints: 0,
  xp: 0,
  level: 1,
  streak: 0,
  missionsCompleted: 0,
};

const INITIAL_ACHIEVEMENTS: AchievementsResponse = {
  unlocked: [],
  locked: [],
  hidden: [],
  totalUnlocked: 0,
  totalAvailable: 0,
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
  const [heroStats, setHeroStats] = useState<HeroStats>(INITIAL_HERO_STATS);
  const [achievements, setAchievements] =
    useState<AchievementsResponse>(INITIAL_ACHIEVEMENTS);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsLoadFailed, setAchievementsLoadFailed] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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

  function getPositiveRewardCredits(mission: Mission): number {
    return Math.max(0, mission.rewardCredits ?? 0);
  }

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
      credits: getPositiveRewardCredits(mission),
    });

    const store = useUserStore.getState();
    const nextPoints = store.freePoints + mission.rewardPoints;
    const nextCredits = store.premiumCredits + getPositiveRewardCredits(mission);
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

    const applyCurrentStats = (stats: MissionCurrentStats) => {
      setHeroStats((prev) => ({
        ...prev,
        streak: stats.missionStreak,
        missionsCompleted: stats.todayCompleted,
        xp: stats.xp,
        level: stats.level,
      }));
    };

    getMissions({ locale })
      .then((response) => {
        if (!active) return;
        setDaily(response.daily.map((mission) => mapApiMission(mission, MissionType.DAILY)));
        setWeekly(response.weekly.map((mission) => mapApiMission(mission, MissionType.WEEKLY)));
        setSpecial(response.special.map((mission) => mapApiMission(mission, MissionType.SPECIAL)));
        applyCurrentStats(response.currentStats);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) return;
        setDaily(DEFAULT_MISSIONS_RESPONSE.daily.map((mission) => mapApiMission(mission, MissionType.DAILY)));
        setWeekly(DEFAULT_MISSIONS_RESPONSE.weekly.map((mission) => mapApiMission(mission, MissionType.WEEKLY)));
        setSpecial(DEFAULT_MISSIONS_RESPONSE.special.map((mission) => mapApiMission(mission, MissionType.SPECIAL)));
        applyCurrentStats(DEFAULT_MISSIONS_RESPONSE.currentStats);
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

        // Mission-specific stats (streak, completed, xp, level) come from the
        // missions API `currentStats`; the hero only takes freePoints here.
        setHeroStats((prev) => ({ ...prev, freePoints: nextHeroStats.freePoints }));
        useUserStore.setState(nextHeroStats);
      })
      .catch(() => {
        if (!active) return;
        const user = useUserStore.getState();
        setHeroStats((prev) => ({ ...prev, freePoints: user.freePoints }));
      });

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    let active = true;
    const timeoutId = window.setTimeout(() => {
      getAchievements({ locale })
        .then((response) => {
          if (!active) return;
          setAchievements(response);
          setAchievementsLoadFailed(false);
        })
        .catch(() => {
          if (!active) return;
          setAchievements(INITIAL_ACHIEVEMENTS);
          setAchievementsLoadFailed(true);
        })
        .finally(() => {
          if (active) setAchievementsLoading(false);
        });
    }, 0);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [locale]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b1018] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(168,85,247,0.12),transparent_28%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">
            <h1 className="font-display text-3xl font-black text-white md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
              {copy.subtitle}
            </p>
            <XPProgressBar
              currentXP={heroStats.xp}
              level={heroStats.level}
              className="mt-4 max-w-md"
            />
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
          { key: "achievements", label: copy.achievements, count: achievements.totalAvailable },
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
          {achievementsLoading && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card
                  key={index}
                  className="h-48 animate-pulse border-gray-800 bg-white/[0.03]"
                />
              ))}
            </div>
          )}
          {!achievementsLoading && achievementsLoadFailed && (
            <Card className="border-red-500/30 bg-red-500/5 p-5">
              <p className="text-sm text-red-200">{copy.loadFailed}</p>
            </Card>
          )}
          {!achievementsLoading && !achievementsLoadFailed && (
            <AchievementGrid achievements={achievements} copy={copy} />
          )}
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

function AchievementGrid({
  achievements,
  copy,
}: {
  achievements: AchievementsResponse;
  copy: ReturnType<typeof getMissionPageCopy>;
}) {
  const items = [
    ...achievements.unlocked.map((achievement) => ({
      ...achievement,
      unlocked: true,
    })),
    ...achievements.locked.map((achievement) => ({
      ...achievement,
      unlocked: false,
    })),
  ];

  if (items.length === 0) {
    return (
      <Card className="p-5">
        <p className="text-sm text-gray-400">{copy.noMissions}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="green">
          {copy.unlocked} {achievements.totalUnlocked.toLocaleString()}
        </Badge>
        <Badge variant="default">
          {copy.locked}{" "}
          {Math.max(
            achievements.totalAvailable - achievements.totalUnlocked,
            0
          ).toLocaleString()}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            copy={copy}
          />
        ))}
      </div>
    </div>
  );
}

function AchievementCard({
  achievement,
  copy,
}: {
  achievement: ApiAchievement & { unlocked: boolean };
  copy: ReturnType<typeof getMissionPageCopy>;
}) {
  const current = Math.max(Number(achievement.progress.current ?? 0), 0);
  const required = Math.max(Number(achievement.progress.required ?? 0), 0);
  const progress = required > 0 ? Math.min(current, required) : 0;
  const statusVariant = achievement.unlocked ? "green" : "default";
  const tierVariant = getAchievementTierVariant(achievement.tier);

  return (
    <Card
      className={cn(
        "flex min-h-52 flex-col p-4",
        !achievement.unlocked && "opacity-80"
      )}
    >
      <div className="mb-3 flex items-start gap-3">
        <AchievementIcon achievement={achievement} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <Badge variant={statusVariant}>
              {achievement.unlocked ? copy.unlocked : copy.locked}
            </Badge>
            <Badge variant={tierVariant}>{achievement.tier}</Badge>
          </div>
          <h3 className="truncate text-sm font-bold text-white">
            {achievement.name}
          </h3>
          <p className="mt-1 text-xs leading-5 text-gray-500">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-[10px]">
            <span className="text-gray-500">{copy.progress}</span>
            <span className="font-mono text-gray-400">
              {current.toLocaleString()}/{required.toLocaleString()}
            </span>
          </div>
          <ProgressBar
            value={progress}
            max={required || 1}
            color={achievement.unlocked ? "green" : getAchievementProgressColor(tierVariant)}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-800/70 pt-3">
          {achievement.rewardPoints > 0 && (
            <PointsBadge
              type="free"
              amount={achievement.rewardPoints}
              size="sm"
              showLabel
            />
          )}
          {achievement.rewardXp > 0 && (
            <span className="font-mono text-xs font-bold text-purple-300">
              +{achievement.rewardXp.toLocaleString()} {copy.xp}
            </span>
          )}
          <span className="ml-auto rounded-full border border-gray-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-normal text-gray-400">
            {achievement.category}
          </span>
        </div>
      </div>
    </Card>
  );
}

function AchievementIcon({
  achievement,
}: {
  achievement: ApiAchievement & { unlocked: boolean };
}) {
  if (achievement.badgeIconUrl) {
    return (
      <span
        aria-hidden="true"
        className="h-12 w-12 shrink-0 rounded-xl border border-cyan-400/20 bg-cyan-400/10 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${achievement.badgeIconUrl})` }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-12 w-12 shrink-0 place-items-center rounded-xl border font-mono text-xs font-black",
        achievement.unlocked
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      )}
    >
      {getAchievementInitials(achievement.name)}
    </span>
  );
}

function getAchievementInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "SM";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getAchievementTierVariant(
  tier: string
): "cyan" | "green" | "gold" | "purple" | "magenta" | "default" {
  switch (tier.toLowerCase()) {
    case "bronze":
      return "magenta";
    case "silver":
      return "cyan";
    case "gold":
      return "gold";
    case "platinum":
      return "purple";
    default:
      return "default";
  }
}

function getAchievementProgressColor(
  tierVariant: ReturnType<typeof getAchievementTierVariant>
): "cyan" | "green" | "gold" | "purple" | "magenta" {
  return tierVariant === "default" ? "cyan" : tierVariant;
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
  const isCompleted = mission.completed;
  const isClaimed = mission.claimed || claimed;
  const canClaim = isCompleted && !isClaimed;

  const color = categoryColors[mission.category] ?? "cyan";
  const Icon = missionIconMap[mission.icon as keyof typeof missionIconMap] ?? Target;

  const expiryDate = mission.expiresAt ? new Date(mission.expiresAt).getTime() : 0;
  const timeLeft = now && expiryDate > 0 ? expiryDate - now : 0;

  const progressPercent =
    mission.target > 0
      ? Math.min(100, Math.floor((mission.progress / mission.target) * 100))
      : mission.completed
      ? 100
      : 0;

  const getIconContainerClass = (category: string): string => {
    switch (category) {
      case "predict":
        return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";
      case "streak":
        return "border-amber-400/20 bg-amber-400/10 text-amber-300";
      case "accuracy":
        return "border-green-400/20 bg-green-400/10 text-green-300";
      case "social":
        return "border-purple-400/20 bg-purple-400/10 text-purple-300";
      case "daily_login":
        return "border-pink-400/20 bg-pink-400/10 text-pink-300";
      default:
        return "border-gray-700 bg-gray-800 text-gray-300";
    }
  };

  return (
    <Card
      className={cn(
        "flex min-h-44 flex-col p-4 transition-opacity",
        isClaimed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-xl border",
            getIconContainerClass(mission.category)
          )}
        >
          <Icon size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={color}>{copy.categories[mission.category] ?? mission.category}</Badge>
            {timeLeft > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-gray-500">
                <CalendarClock size={12} />
                <span>
                  {copy.resetsIn.replace("{time}", formatTimeLeft(timeLeft))}
                </span>
              </div>
            )}
          </div>
          <h3 className="truncate text-sm font-bold text-white">{mission.title}</h3>
          <p className="mt-1 text-xs leading-5 text-gray-400">{mission.description}</p>
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-3">
        <div>
          <div className="mb-1 flex justify-between text-[10px]">
            <span className="font-semibold uppercase tracking-wider text-gray-500">{copy.progress}</span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="font-semibold text-gray-300">
                {mission.progress.toLocaleString()}/{mission.target.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-cyan-300">({progressPercent}%)</span>
            </div>
          </div>
          <ProgressBar
            value={mission.progress}
            max={mission.target || 1}
            color={color}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-gray-800/70 pt-3">
          {mission.rewardPoints > 0 && (
            <PointsBadge type="free" amount={mission.rewardPoints} size="sm" showLabel />
          )}
          {mission.rewardXP > 0 && (
            <Badge variant="purple">+{mission.rewardXP.toLocaleString()} {copy.xp}</Badge>
          )}
          {mission.rewardCredits !== undefined && mission.rewardCredits > 0 && (
            <Badge variant="magenta">+{mission.rewardCredits.toLocaleString()} CR</Badge>
          )}
          <div className="ml-auto">
            {canClaim ? (
              <Button variant="gold" size="sm" onClick={() => onClaim(mission.id)}>{copy.claim}</Button>
            ) : isClaimed ? (
              <Button variant="outline" size="sm" disabled className="cursor-default">
                <CheckCircle2 size={14} className="mr-1.5" />{copy.claimed}
              </Button>
            ) : (
              <span className="text-xs font-medium text-gray-500">{copy.inProgress}</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return undefined;
}