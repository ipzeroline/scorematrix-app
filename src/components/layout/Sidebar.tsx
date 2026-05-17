"use client";

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
  Coins,
  Crown,
  Gift,
  Home,
  Newspaper,
  Share2,
  Sparkles,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_LINKS = [
  { href: "", label: "home", icon: Home },
  { href: "/livescore", label: "livescore", icon: Activity },
  { href: "/matches", label: "matches", icon: Calendar },
  { href: "/predict", label: "predict", icon: Target },
  { href: "/ai-insight", label: "aiInsight", icon: Brain },
  { href: "/leaderboard", label: "leaderboard", icon: Trophy },
  { href: "/missions", label: "missions", icon: Zap },
  { href: "/events", label: "events", icon: Sparkles },
  { href: "/rewards", label: "rewards", icon: Gift },
  { href: "/credits", label: "credits", icon: Coins },
  { href: "/stats", label: "stats", icon: BarChart3 },
  { href: "/affiliate", label: "affiliate", icon: Share2 },
  { href: "/leagues", label: "leagues", icon: Users },
  { href: "/news", label: "news", icon: Newspaper },
];

const sidebarHighlights = {
  leaders: [
    { rank: 1, name: "CipherAce", level: 28, points: "12.4K" },
    { rank: 2, name: "Phantom", level: 26, points: "11.9K" },
    { rank: 3, name: "NeonPred", level: 25, points: "10.9K" },
    { rank: 4, name: "GridWiz", level: 23, points: "10.3K" },
    { rank: 5, name: "ScoreHunter", level: 22, points: "9.8K" },
    { rank: 6, name: "GoalOracle", level: 21, points: "9.4K" },
    { rank: 7, name: "PitchKing", level: 20, points: "9.1K" },
    { rank: 8, name: "WinMatrix", level: 19, points: "8.7K" },
    { rank: 9, name: "DataStriker", level: 18, points: "8.3K" },
    { rank: 10, name: "FormReader", level: 17, points: "8.0K" },
  ],
  missions: [
    { titleKey: "predict5.title", progress: 3, total: 5, reward: "+500 XP", color: "from-cyan-300 to-blue-300" },
    { titleKey: "perfectAccuracy.title", progress: 3, total: 3, reward: "+1K XP", color: "from-green-300 to-emerald-300" },
    { titleKey: "socialShare.title", progress: 0, total: 1, reward: "+250 XP", color: "from-purple-300 to-fuchsia-300" },
    { title: "Daily check-in", progress: 1, total: 1, reward: "+100 XP", color: "from-amber-300 to-orange-300" },
  ],
  rewards: [
    { nameKey: "jersey.name", category: "Merch", cost: "500 CR", stock: 42 },
    { nameKey: "steam.name", category: "Voucher", cost: "2.5K XP", stock: 150 },
    { nameKey: "badge.name", category: "Badge", cost: "5K XP", stock: 88 },
    { nameKey: "scarf.name", category: "Merch", cost: "1.5K XP", stock: 25 },
  ],
};

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();

  const isActive = (href: string) => {
    if (href === "") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <aside className="hidden lg:flex min-h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col border-r border-gray-800/50 bg-[#0a0a0f] p-3 sticky top-14">
      <nav className="flex flex-col gap-0.5">
        {SIDEBAR_LINKS.map((link) => {
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
            {sidebarHighlights.leaders.map((user) => (
              <div
                key={user.rank}
                className="grid grid-cols-[18px_minmax(0,1fr)_34px_36px] items-center gap-1.5"
              >
                <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-300/15 text-[8px] font-bold text-amber-200">
                  {user.rank}
                </span>
                <span className="min-w-0 truncate text-[10px] text-gray-300">
                  {user.name}
                </span>
                <span className="rounded bg-cyan-300/10 px-1 py-0.5 text-center text-[8px] font-semibold text-cyan-200">
                  Lv.{user.level}
                </span>
                <span className="text-right text-[9px] font-mono font-semibold text-green-300">
                  {user.points}
                </span>
              </div>
            ))}
          </div>
        </Link>

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
              2/4
            </span>
          </div>

          <div className="space-y-1.5">
            {sidebarHighlights.missions.map((mission) => {
              const pct = Math.min(100, Math.round((mission.progress / mission.total) * 100));
              const done = mission.progress >= mission.total;
              const title = "titleKey" in mission ? t(`dashboard.missions.${mission.titleKey}`) : mission.title;

              return (
                <div key={title} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-medium text-gray-200">
                      <CheckCircle2
                        size={11}
                        className={done ? "text-green-300" : "text-purple-300"}
                        aria-hidden="true"
                      />
                      <span className="truncate">{title}</span>
                    </span>
                    <span className="shrink-0 text-[9px] font-semibold text-cyan-200">
                      {mission.reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${mission.color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-[9px] font-mono text-gray-400">
                      {mission.progress}/{mission.total}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Link>

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
              {sidebarHighlights.rewards.length}
            </span>
          </div>

          <div className="space-y-1.5">
            {sidebarHighlights.rewards.map((reward) => (
              <div key={reward.nameKey} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[10px] font-medium text-white">
                    {t(`dashboard.rewardItems.${reward.nameKey}`)}
                  </span>
                  <span className="shrink-0 text-[9px] font-mono font-semibold text-pink-200">
                    {reward.cost}
                  </span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="rounded bg-pink-300/10 px-1.5 py-0.5 text-[8px] font-semibold text-pink-100">
                    {reward.category}
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
      </div>

      <div className="mt-auto overflow-hidden rounded-xl border border-amber-300/30 bg-[radial-gradient(circle_at_top_left,rgba(74,222,128,0.18),transparent_34%),linear-gradient(135deg,rgba(245,158,11,0.2),rgba(34,197,94,0.12)_48%,rgba(10,10,15,0.96))] p-3 shadow-[0_0_22px_rgba(245,158,11,0.14)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white">
            <span className="grid h-5 w-5 place-items-center rounded-md border border-green-300/40 bg-green-300/15 text-[10px] font-bold text-green-100 shadow-[0_0_10px_rgba(74,222,128,0.22)]">
              12
            </span>
            {t("gamification.level")}
          </span>
          <span className="rounded-md border border-amber-300/30 bg-amber-300/15 px-2 py-0.5 text-xs font-bold text-amber-100">
            2,840 XP
          </span>
        </div>

        <div className="rounded-full border border-white/10 bg-black/30 p-0.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-300 via-lime-300 to-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.55)] transition-all duration-500"
              style={{ width: "84%" }}
            />
          </div>
        </div>

        <p className="mt-1 text-[10px] font-medium text-amber-100/75">
          {t("dashboard.xpToNextLevel", { xp: 160, level: 13 })}
        </p>
      </div>
    </aside>
  );
}
