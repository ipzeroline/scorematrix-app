"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  Award,
  Calendar,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Crown,
  Dice5,
  Flame,
  Gift,
  Gauge,
  Star,
  Sparkles,
  ShieldCheck,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
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
} from "@/lib/auth-api";
import {
  DEFAULT_MISSIONS_RESPONSE,
  getMissions,
  mapApiMission,
  claimMission,
  type MissionPeriodKey,
  type MissionPeriodWindow,
  type MissionPeriodWindows,
  type MissionsResponse,
} from "@/lib/missions-api";
import type { Mission } from "@/types/mission";
import { MissionType } from "@/types/common";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";

type TabKey = "daily" | "weekly" | "special" | "achievements";
const MAX_LEVEL = 10;

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

function parseApiDateTime(value?: string | null): number {
  if (!value) return 0;
  const trimmed = value.trim();
  if (!trimmed) return 0;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test(trimmed)
    ? trimmed.replace(" ", "T")
    : trimmed;
  const timestamp = new Date(normalized).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function getNextLocalMidnight(timestamp: number) {
  const next = new Date(timestamp);
  next.setHours(24, 0, 0, 0);
  return next.getTime();
}

function getNextLocalWeekStart(timestamp: number) {
  const next = new Date(timestamp);
  const day = next.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  next.setDate(next.getDate() + daysUntilMonday);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function clampResetToApiWindow(
  target: number,
  periodStart: number,
  periodEnd: number,
  now: number
) {
  if (periodStart > 0 && now < periodStart) return periodStart;
  if (periodEnd > 0 && now > periodEnd) return periodEnd;
  if (periodEnd > 0 && target > periodEnd) return periodEnd;
  return target;
}

function getResetTimestamp(
  periodKey: MissionPeriodKey,
  periods: MissionPeriodWindows,
  missions: Mission[],
  now = Date.now()
) {
  const period = periods[periodKey];
  const periodResetAt = period?.resetAt || period?.end;
  const periodStartTimestamp = parseApiDateTime(period?.start);
  const periodResetTimestamp = parseApiDateTime(periodResetAt);
  const periodSpan =
    periodStartTimestamp > 0 && periodResetTimestamp > 0
      ? periodResetTimestamp - periodStartTimestamp
      : 0;

  if (periodKey === "daily") {
    const nextDailyReset =
      periodResetTimestamp > 0 && periodSpan > 0 && periodSpan <= DAY_MS * 1.5
        ? periodResetTimestamp
        : getNextLocalMidnight(now);
    return clampResetToApiWindow(
      nextDailyReset,
      periodStartTimestamp,
      periodResetTimestamp,
      now
    );
  }

  if (periodKey === "weekly") {
    const nextWeeklyReset =
      periodResetTimestamp > 0 && periodSpan > 0 && periodSpan <= WEEK_MS * 1.25
        ? periodResetTimestamp
        : getNextLocalWeekStart(now);
    return clampResetToApiWindow(
      nextWeeklyReset,
      periodStartTimestamp,
      periodResetTimestamp,
      now
    );
  }

  if (periodKey === "special") {
    return missions.reduce((earliest, mission) => {
      const missionResetTimestamp = parseApiDateTime(
        mission.resetAt || mission.expiresAt
      );
      if (missionResetTimestamp <= 0) return earliest;
      return earliest === 0
        ? missionResetTimestamp
        : Math.min(earliest, missionResetTimestamp);
    }, 0);
  }

  if (periodResetTimestamp > 0) return periodResetTimestamp;

  return missions.reduce((earliest, mission) => {
    const missionResetTimestamp = parseApiDateTime(
      mission.resetAt || mission.expiresAt
    );
    if (missionResetTimestamp <= 0) return earliest;
    return earliest === 0
      ? missionResetTimestamp
      : Math.min(earliest, missionResetTimestamp);
  }, 0);
}

function isInsideApiWindow(
  now: number | null,
  startsAt?: string,
  resetAt?: string
) {
  if (!now) return true;
  const startTimestamp = parseApiDateTime(startsAt);
  const resetTimestamp = parseApiDateTime(resetAt);

  if (startTimestamp > 0 && now < startTimestamp) return false;
  if (resetTimestamp > 0 && now > resetTimestamp) return false;
  return true;
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
  const [periods, setPeriods] = useState<MissionPeriodWindows>(
    DEFAULT_MISSIONS_RESPONSE.periods
  );
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [heroStats, setHeroStats] = useState<HeroStats>(INITIAL_HERO_STATS);
  const [achievements, setAchievements] =
    useState<AchievementsResponse>(INITIAL_ACHIEVEMENTS);
  const [achievementsLoading, setAchievementsLoading] = useState(true);
  const [achievementsLoadFailed, setAchievementsLoadFailed] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const resetRefreshRef = useRef<Record<string, boolean>>({});
  const displayLevel = Math.min(heroStats.level, MAX_LEVEL);
  const isMaxLevel = heroStats.level >= MAX_LEVEL;

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

  const applyMissionsResponse = useCallback((response: MissionsResponse) => {
    setDaily(response.daily.map((mission) => mapApiMission(mission, MissionType.DAILY)));
    setWeekly(response.weekly.map((mission) => mapApiMission(mission, MissionType.WEEKLY)));
    setSpecial(response.special.map((mission) => mapApiMission(mission, MissionType.SPECIAL)));
    setPeriods(response.periods);
    setHeroStats((prev) => ({
      ...prev,
      streak: response.currentStats.missionStreak,
      missionsCompleted: response.currentStats.todayCompleted,
      xp: response.currentStats.xp,
      level: response.currentStats.level,
    }));
  }, []);

  const refreshMissions = useCallback(async () => {
    const response = await getMissions({ locale });
    applyMissionsResponse(response);
    setLoadFailed(false);
  }, [applyMissionsResponse, locale]);

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
    const nextLevel = Math.min(Math.floor(nextXP / 1000) + 1, MAX_LEVEL);
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
        applyMissionsResponse(response);
        setLoadFailed(false);
      })
      .catch(() => {
        if (!active) return;
        applyMissionsResponse(DEFAULT_MISSIONS_RESPONSE);
        setLoadFailed(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [applyMissionsResponse, locale]);

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
        // Mission `currentStats`; the hero only takes freePoints here.
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

  const activeMissions =
    tab === "daily"
      ? daily
      : tab === "weekly"
      ? weekly
      : tab === "special"
      ? special
      : [];
  const dailyResetTimestamp = useMemo(
    () => getResetTimestamp("daily", periods, daily, now),
    [daily, now, periods]
  );
  const weeklyResetTimestamp = useMemo(
    () => getResetTimestamp("weekly", periods, weekly, now),
    [now, periods, weekly]
  );
  const readyToClaim = activeMissions.filter(
    (mission) => mission.completed && !mission.claimed && !claimed[mission.id]
  ).length;

  useEffect(() => {
    const timers: number[] = [];
    const resetTargets = [
      { key: "daily", timestamp: dailyResetTimestamp },
      { key: "weekly", timestamp: weeklyResetTimestamp },
    ];

    for (const target of resetTargets) {
      if (target.timestamp <= 0) continue;

      const refreshKey = `${target.key}:${target.timestamp}`;
      const delay = target.timestamp - Date.now();

      if (delay <= 0) {
        if (!resetRefreshRef.current[refreshKey]) {
          resetRefreshRef.current[refreshKey] = true;
          void refreshMissions().catch(() => {
            setLoadFailed(true);
          });
        }
        continue;
      }

      const timeoutId = window.setTimeout(() => {
        if (resetRefreshRef.current[refreshKey]) return;
        resetRefreshRef.current[refreshKey] = true;
        void refreshMissions().catch(() => {
          setLoadFailed(true);
        });
      }, Math.min(delay + 1000, 2147483647));

      timers.push(timeoutId);
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dailyResetTimestamp, refreshMissions, weeklyResetTimestamp]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_34%),linear-gradient(315deg,rgba(236,72,153,0.12),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,32px_32px,32px_32px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.35fr_0.65fr] xl:items-stretch">
          <div className="flex min-h-[280px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {copy.commandCenter}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {copy.skillBased}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl xl:whitespace-nowrap">
                {copy.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-gray-300 sm:text-lg">
                {copy.subtitle}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-cyan-200/80">
                    {isMaxLevel
                      ? copy.maxLevelReached
                      : copy.levelLine
                        .replace("{level}", displayLevel.toLocaleString())
                        .replace("{xp}", heroStats.xp.toLocaleString())}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    {isMaxLevel ? copy.maxLevelMessage : copy.xpProgress}
                  </p>
                </div>
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
                  <Gauge size={23} />
                </span>
              </div>
              <XPProgressBar
                currentXP={heroStats.xp}
                level={heroStats.level}
                maxLevel={MAX_LEVEL}
                maxLabel={copy.maxLevelMessage}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroStat
              icon={CheckCircle2}
              label={copy.completedToday}
              value={`${heroStats.missionsCompleted.toLocaleString()}/${daily.length || 0}`}
              helper={copy.daily}
              tone="text-emerald-300"
              className="sm:col-span-2"
            />
            <HeroStat
              icon={Trophy}
              label={copy.totalRewards}
              value={heroStats.freePoints.toLocaleString()}
              helper={copy.points}
              tone="text-amber-300"
            />
            <HeroStat
              icon={Flame}
              label={copy.activeStreak}
              value={heroStats.streak.toLocaleString()}
              helper={copy.days}
              tone="text-rose-300"
            />
            <HeroStat
              icon={Gift}
              label={copy.ready}
              value={readyToClaim.toLocaleString()}
              helper={copy.claimReward}
              tone="text-fuchsia-300"
            />
            <HeroStat
              icon={Crown}
              label={copy.achievements}
              value={`${achievements.totalUnlocked.toLocaleString()}/${achievements.totalAvailable.toLocaleString()}`}
              helper={copy.unlocked}
              tone="text-cyan-300"
            />
          </div>
        </div>
      </section>

      <MissionTabs
        tabs={[
          { key: "daily", label: copy.daily, count: daily.length, icon: CalendarCheck, activeLabel: copy.active },
          { key: "weekly", label: copy.weekly, count: weekly.length, icon: Calendar, activeLabel: copy.active },
          { key: "special", label: copy.special, count: special.length, icon: Sparkles, activeLabel: copy.active },
          { key: "achievements", label: copy.achievements, count: achievements.totalAvailable, icon: Trophy, activeLabel: copy.active },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "daily" && (
        <MissionList
          title={copy.daily}
          intro={copy.dailyIntro}
          missions={daily}
          periodKey="daily"
          period={periods.daily}
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
          title={copy.weekly}
          intro={copy.weeklyIntro}
          missions={weekly}
          periodKey="weekly"
          period={periods.weekly}
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
          title={copy.special}
          intro={copy.specialIntro}
          missions={special}
          periodKey="special"
          period={periods.special}
          copy={copy}
          claimed={claimed}
          now={now}
          loading={loading}
          loadFailed={loadFailed}
          onClaim={handleClaimMission}
        />
      )}

      {tab === "achievements" && (
        <section className="space-y-4">
          <SectionHeader
            eyebrow={`${achievements.totalUnlocked.toLocaleString()}/${achievements.totalAvailable.toLocaleString()} ${copy.unlocked}`}
            title={copy.achievements}
            intro={copy.achievementsIntro}
          />
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
                  <span className="text-white font-bold">Lvl {displayLevel}</span>
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
        <Badge variant="green" size="md">
          {copy.unlocked} {achievements.totalUnlocked.toLocaleString()}
        </Badge>
        <Badge variant="default" size="md">
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
        "flex min-h-56 flex-col overflow-hidden border-white/10 bg-[#0b111d] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.24)] sm:p-5",
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
          <h3 className="text-lg font-black leading-tight text-white">
            {achievement.name}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            {achievement.description}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div>
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-500">{copy.progress}</span>
            <span className="font-mono font-bold text-gray-300">
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
          <span className="ml-auto rounded-full border border-gray-700 px-3 py-1 text-xs font-bold uppercase tracking-normal text-gray-400">
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
        className="h-14 w-14 shrink-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${achievement.badgeIconUrl})` }}
      />
    );
  }

  return (
    <span
        aria-hidden="true"
        className={cn(
        "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border font-mono text-sm font-black",
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
  helper,
  tone,
  className,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  helper: string;
  tone: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-[138px] overflow-hidden rounded-2xl border border-white/10 bg-black/28 p-4 pr-12 sm:pr-16",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
      <div className="min-w-0">
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 max-w-full whitespace-nowrap font-mono text-[clamp(1.45rem,5vw,3rem)] font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            {helper}
          </p>
      </div>
      <span className="absolute right-3 top-4 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] sm:right-4 sm:h-11 sm:w-11">
          <Icon size={20} className={tone} />
      </span>
    </div>
  );
}

function MissionTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{
    key: TabKey;
    label: string;
    count: number;
    icon: typeof Star;
    activeLabel: string;
  }>;
  activeTab: TabKey;
  onChange: (key: TabKey) => void;
}) {
  return (
    <div className="sticky top-[76px] z-20 rounded-2xl border border-white/10 bg-[#070b13]/92 p-1.5 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeTab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "group flex min-h-[60px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition",
                active
                  ? "border-cyan-300/50 bg-gradient-to-br from-cyan-300/20 via-indigo-500/18 to-fuchsia-500/16 text-white shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                  : "border-transparent bg-white/[0.03] text-gray-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
                    active
                      ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200"
                      : "border-white/10 bg-black/20 text-gray-500 group-hover:text-cyan-200"
                  )}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate whitespace-nowrap text-base font-black [word-break:keep-all] sm:text-lg">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block truncate whitespace-nowrap text-xs font-bold uppercase tracking-wider text-gray-500 [word-break:keep-all]">
                    {item.count.toLocaleString()} {item.activeLabel}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  intro,
  meta,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  meta?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a101a] p-4 sm:p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
          {eyebrow}
        </div>
        {meta && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-mono font-black uppercase tracking-wider text-cyan-100">
            <CalendarClock size={13} />
            {meta}
          </span>
        )}
      </div>
      <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-base leading-7 text-gray-400">
        {intro}
      </p>
    </div>
  );
}

function MissionList({
  title,
  intro,
  missions,
  periodKey,
  period,
  copy,
  claimed,
  now,
  loading,
  loadFailed,
  onClaim,
}: {
  title: string;
  intro: string;
  missions: Mission[];
  periodKey: MissionPeriodKey;
  period: MissionPeriodWindow | null;
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: Record<string, boolean>;
  now: number | null;
  loading: boolean;
  loadFailed: boolean;
  onClaim: (id: string) => void;
}) {
  const resetTimestamp = getResetTimestamp(periodKey, {
    daily: periodKey === "daily" ? period : null,
    weekly: periodKey === "weekly" ? period : null,
    special: periodKey === "special" ? period : null,
  }, missions, now ?? 0);
  const periodEnd = period?.resetAt || period?.end || "";
  const periodTimeLeft = now && resetTimestamp > 0 ? resetTimestamp - now : 0;
  const showPeriodCountdown =
    periodKey !== "special" &&
    periodTimeLeft > 0 &&
    isInsideApiWindow(now, period?.start, periodEnd);

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow={`${missions.length.toLocaleString()} ${copy.missionsLabel}`}
        title={title}
        intro={intro}
        meta={
          showPeriodCountdown
            ? copy.resetsIn.replace("{time}", formatTimeLeft(periodTimeLeft))
            : undefined
        }
      />
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
            period={period}
            periodKey={periodKey}
            resetTimestamp={resetTimestamp}
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
  period,
  periodKey,
  resetTimestamp,
  now,
  onClaim,
}: {
  mission: Mission;
  copy: ReturnType<typeof getMissionPageCopy>;
  claimed: boolean;
  period: MissionPeriodWindow | null;
  periodKey: MissionPeriodKey;
  resetTimestamp: number;
  now: number | null;
  onClaim: (id: string) => void;
}) {
  const isCompleted = mission.completed;
  const isClaimed = mission.claimed || claimed;
  const canClaim = isCompleted && !isClaimed;

  const color = categoryColors[mission.category] ?? "cyan";
  const Icon = missionIconMap[mission.icon as keyof typeof missionIconMap] ?? Target;

  const resetAt = period?.resetAt || period?.end || mission.resetAt || mission.expiresAt;
  const startsAt = period?.start || mission.startsAt;
  const expiryDate =
    periodKey === "daily" || periodKey === "weekly"
      ? resetTimestamp
      : 0;
  const timeLeft =
    now && expiryDate > 0 && isInsideApiWindow(now, startsAt, resetAt)
      ? expiryDate - now
      : 0;

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
        "group relative flex min-h-[260px] flex-col overflow-hidden border-white/10 bg-[#0b111d] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition sm:p-5",
        canClaim && "border-amber-300/35 shadow-[0_0_34px_rgba(245,158,11,0.12)]",
        isClaimed && "opacity-65"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          canClaim
            ? "bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-300"
            : "bg-gradient-to-r from-cyan-400/40 via-purple-400/30 to-transparent"
        )}
      />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid h-14 w-14 shrink-0 place-items-center rounded-2xl border",
            getIconContainerClass(mission.category)
          )}
        >
          <Icon size={27} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={color} size="md">
              {copy.categories[mission.category] ?? mission.category}
            </Badge>
            {canClaim && (
              <Badge variant="gold" size="md">
                {copy.ready}
              </Badge>
            )}
            {isClaimed && (
              <Badge variant="green" size="md">
                {copy.claimed}
              </Badge>
            )}
            {timeLeft > 0 && (
              <div className="flex items-center gap-1.5 rounded-full border border-gray-800 bg-black/20 px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-gray-400">
                <CalendarClock size={13} />
                <span>
                  {copy.resetsIn.replace("{time}", formatTimeLeft(timeLeft))}
                </span>
              </div>
            )}
          </div>
          <h3 className="text-xl font-black leading-tight text-white sm:text-2xl">
            {mission.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-gray-400 sm:text-base">
            {mission.description}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-4 pt-5">
        <div>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-gray-500">
              {copy.progress}
            </span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm font-black text-gray-200">
                {mission.progress.toLocaleString()}/{mission.target.toLocaleString()}
              </span>
              <span className="text-sm font-black text-cyan-300">({progressPercent}%)</span>
            </div>
          </div>
          <ProgressBar
            value={mission.progress}
            max={mission.target || 1}
            color={color}
            size="sm"
          />
        </div>

        <div className="grid gap-3 border-t border-gray-800/70 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="flex flex-wrap items-center gap-2">
            {mission.rewardPoints > 0 && (
              <PointsBadge type="free" amount={mission.rewardPoints} size="sm" showLabel />
            )}
            {mission.rewardXP > 0 && (
              <Badge variant="purple" size="md">
                +{mission.rewardXP.toLocaleString()} {copy.xp}
              </Badge>
            )}
            {mission.rewardCredits !== undefined && mission.rewardCredits > 0 && (
              <Badge variant="magenta" size="md">
                +{mission.rewardCredits.toLocaleString()} CR
              </Badge>
            )}
          </div>
          <div className="sm:ml-auto">
            {canClaim ? (
              <Button
                variant="gold"
                size="md"
                className="min-h-11 w-full px-5 text-base font-black sm:w-auto"
                onClick={() => onClaim(mission.id)}
              >
                <Gift size={18} className="mr-2" />
                {copy.claim}
              </Button>
            ) : isClaimed ? (
              <Button
                variant="outline"
                size="md"
                disabled
                className="min-h-11 w-full cursor-default text-base sm:w-auto"
              >
                <CheckCircle2 size={17} className="mr-2" />
                {copy.claimed}
              </Button>
            ) : (
              <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black/20 px-4 text-sm font-bold text-gray-400 sm:w-auto">
                <Clock3 size={16} />
                {copy.inProgress}
              </span>
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
