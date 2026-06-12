"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Crown,
  Coins,
  Gift,
  Home,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";
import {
  getLeaderboard,
  mapApiLeaderboardEntry,
} from "@/lib/leaderboard-api";
import {
  DEFAULT_MISSIONS_RESPONSE,
  getMissions,
  mapApiMission,
} from "@/lib/missions-api";
import {
  DEFAULT_REWARDS_RESPONSE,
  getRewards,
  mapApiReward,
  type RewardViewItem,
} from "@/lib/rewards-api";
import { formatPoints } from "@/lib/currency";
import { useUserStore } from "@/stores/user-store";
import { MissionType } from "@/types/common";
import type { LeaderboardEntry } from "@/types/leaderboard";
import type { Mission } from "@/types/mission";

const emptySubscribe = () => () => {};

const SIDEBAR_LINKS = [
  { href: "", label: "home", icon: Home },
  { href: "/livescore", label: "livescore", icon: Activity },
  { href: "/matches", label: "matches", icon: Calendar },
  { href: "/predict", label: "predict", icon: Target },
  { href: "/ai-insight", label: "aiInsight", icon: Brain },
  { href: "/leaderboard", label: "leaderboard", icon: Trophy, authRequired: true },
  { href: "/missions", label: "missions", icon: Zap, authRequired: true },
  { href: "/events", label: "events", icon: Sparkles, authRequired: true },
  { href: "/rewards", label: "rewards", icon: Gift, authRequired: true },
  { href: "/credits", label: "credits", icon: Coins },
  { href: "/stats", label: "stats", icon: BarChart3, authRequired: true },
  { href: "/affiliate", label: "affiliate", icon: Share2, authRequired: true },
  { href: "/leagues", label: "leagues", icon: Users, authRequired: true },
];

const categoryColors: Record<string, "cyan" | "green" | "gold" | "purple" | "magenta"> = {
  predict: "cyan",
  streak: "gold",
  accuracy: "green",
  social: "purple",
  daily_login: "magenta",
};

function getDefaultSidebarMissions() {
  return [
    ...(DEFAULT_MISSIONS_RESPONSE?.daily ?? []).map((mission) =>
      mapApiMission(mission, MissionType.DAILY)
    ),
    ...(DEFAULT_MISSIONS_RESPONSE?.weekly ?? []).map((mission) =>
      mapApiMission(mission, MissionType.WEEKLY)
    ),
    ...(DEFAULT_MISSIONS_RESPONSE?.special ?? []).map((mission) =>
      mapApiMission(mission, MissionType.SPECIAL)
    ),
  ].slice(0, 4);
}

function getDefaultSidebarRewards() {
  return (DEFAULT_REWARDS_RESPONSE?.data ?? [])
    .map(mapApiReward)
    .filter((reward) => reward.isActive)
    .slice(0, 4);
}

interface SidebarProps {
  initialHasAuthSession?: boolean;
}

export function Sidebar({ initialHasAuthSession = false }: SidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [missions, setMissions] = useState<Mission[]>(getDefaultSidebarMissions);
  const [rewards, setRewards] = useState<RewardViewItem[]>(getDefaultSidebarRewards);
  const visibleLinks = SIDEBAR_LINKS.filter((link) => !link.authRequired || effectiveIsLoggedIn);

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

    getLeaderboard({ locale })
      .then((response) => {
        if (!active) return;
        const nextLeaders = (response?.entries ?? [])
          .map(mapApiLeaderboardEntry)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 10);
        setLeaders(nextLeaders);
      })
      .catch(() => {
        if (active) setLeaders([]);
      });

    return () => {
      active = false;
    };
  }, [effectiveIsLoggedIn, locale]);

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

    getRewards({ locale })
      .then((response) => {
        if (!active) return;
        const nextRewards = (response?.data ?? [])
          .map(mapApiReward)
          .filter((reward) => reward.isActive)
          .slice(0, 4);
        setRewards(nextRewards.length > 0 ? nextRewards : getDefaultSidebarRewards());
      })
      .catch(() => {
        if (active) setRewards(getDefaultSidebarRewards());
      });

    return () => {
      active = false;
    };
  }, [effectiveIsLoggedIn, locale]);

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

    getMissions({ locale })
      .then((response) => {
        if (!active) return;
        const nextMissions = [
          ...(response?.daily ?? []).map((mission) => mapApiMission(mission, MissionType.DAILY)),
          ...(response?.weekly ?? []).map((mission) => mapApiMission(mission, MissionType.WEEKLY)),
          ...(response?.special ?? []).map((mission) => mapApiMission(mission, MissionType.SPECIAL)),
        ].slice(0, 4);
        setMissions(nextMissions.length > 0 ? nextMissions : getDefaultSidebarMissions());
      })
      .catch(() => {
        if (active) setMissions(getDefaultSidebarMissions());
      });

    return () => {
      active = false;
    };
  }, [effectiveIsLoggedIn, locale]);

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <aside className="hidden lg:flex min-h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col border-r border-gray-800/50 bg-[#0a0a0f] p-3 sticky top-14">
      <nav className="flex flex-col gap-0.5">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={`/${locale}${link.href}`}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                active
                  ? "text-cyan-400 bg-cyan-500/10 neon-cyan"
                  : "text-gray-400 hover:text-white hover:bg-white/5",
              )}
            >
              <Icon size={18} />
              {t(`nav.${link.label}`)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-3 space-y-2">
        {effectiveIsLoggedIn && (
          <Link
            href={`/${locale}/leaderboard`}
            className="group block rounded-xl border border-amber-300/20 bg-amber-300/8 p-2 transition-colors hover:border-amber-300/35 hover:bg-amber-300/12"
          >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-amber-100">
              <Trophy size={14} className="text-amber-300" aria-hidden="true" />
              {t("nav.leaderboard")}
            </span>
            <ChevronRight
              size={14}
              className="text-amber-200/45 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200"
              aria-hidden="true"
            />
          </div>
          <div className="space-y-0.5">
            {leaders.map((user) => (
              <div
                key={user.userId}
                className="grid grid-cols-[18px_minmax(0,1fr)_34px_36px] items-center gap-1.5"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-300/15 text-[8px] font-bold text-amber-200">
                  {user.rank}
                </span>
                <span className="min-w-0 truncate text-[10px] text-gray-300">
                  {user.username}
                </span>
                <span className="rounded bg-cyan-300/10 px-1 py-0.5 text-center text-[8px] font-semibold text-cyan-200">
                  Lv.{user.level}
                </span>
                <span className="text-right text-[9px] font-mono font-semibold text-green-300">
                  {formatPoints(user.points)}
                </span>
              </div>
            ))}
          </div>
          </Link>
        )}

        {effectiveIsLoggedIn && (
          <Link
            href={`/${locale}/missions`}
            className="group block rounded-xl border border-purple-300/20 bg-purple-300/8 p-2 transition-colors hover:border-purple-300/35 hover:bg-purple-300/12"
          >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-purple-100">
              <Zap size={14} className="text-purple-300" aria-hidden="true" />
              {t("nav.missions")}
            </span>
            <span className="rounded-md border border-green-300/25 bg-green-300/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-200">
              {missions.filter((mission) => mission.completed || mission.claimed).length}/{missions.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {missions.map((mission) => {
              const done = mission.completed || mission.claimed || mission.progress >= mission.target;
              const reward = mission.rewardCredits && mission.rewardCredits > 0
                ? `+${mission.rewardCredits} CR`
                : `+${mission.rewardXP} XP`;
              const color = categoryColors[mission.category] ?? "cyan";

              return (
                <div key={mission.id} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-gray-200">
                      <CheckCircle2
                        size={11}
                        className={done ? "text-green-300" : "text-purple-300"}
                        aria-hidden="true"
                      />
                      <span className="truncate">{mission.title}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-semibold text-cyan-200">
                      {reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={mission.progress}
                      max={mission.target || 1}
                      color={done ? "green" : color}
                      size="sm"
                      className="flex-1 min-w-0"
                    />
                    <span className="w-7 text-right text-[9px] font-mono text-gray-400">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          </Link>
        )}

        {isLoggedIn && (
          <Link
            href={`/${locale}/rewards`}
            className="group block rounded-xl border border-pink-300/20 bg-pink-300/8 p-2 transition-colors hover:border-pink-300/35 hover:bg-pink-300/12"
          >
          <div className="mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-semibold text-pink-100">
              <Gift size={14} className="text-pink-300" aria-hidden="true" />
              {t("nav.rewards")}
            </span>
            <span className="flex items-center gap-1 rounded-md border border-pink-300/20 bg-pink-300/10 px-1.5 py-0.5 text-[10px] font-semibold text-pink-100">
              <Crown size={10} aria-hidden="true" />
              {rewards.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {rewards.map((reward) => (
              <div key={reward.id} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[10px] font-medium text-white">
                    {reward.name}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono font-semibold text-pink-200">
                    {formatPoints(reward.pointsCost)}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="rounded bg-pink-300/10 px-1.5 py-0.5 text-[8px] font-semibold text-pink-100">
                    {t(`rewards.${reward.category}`)}
                  </span>
                  <span className={cn(
                    "text-[8px] font-mono",
                    reward.stock <= 30 ? "text-red-300" : "text-gray-400",
                  )}>
                    stock {reward.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
          </Link>
        )}
      </div>

      <div className="h-3 shrink-0" />

    </aside>
  );
}
