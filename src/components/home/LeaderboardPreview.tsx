"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Crown, Medal as MedalIcon, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string | null;
  points: number;
  accuracy: number;
}

const topUsers: LeaderboardUser[] = [
  {
    rank: 1,
    username: "CipherAce",
    avatar: null,
    points: 12450,
    accuracy: 78.3,
  },
  {
    rank: 2,
    username: "PhantomStriker",
    avatar: null,
    points: 11920,
    accuracy: 75.1,
  },
  {
    rank: 3,
    username: "NeonPred",
    avatar: null,
    points: 10870,
    accuracy: 74.8,
  },
  {
    rank: 4,
    username: "GridironWiz",
    avatar: null,
    points: 10300,
    accuracy: 72.4,
  },
  {
    rank: 5,
    username: "ScoreHunter",
    avatar: null,
    points: 9810,
    accuracy: 71.9,
  },
];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-400">
        1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="w-6 h-6 rounded-full bg-gray-300/10 border border-gray-400/30 flex items-center justify-center text-xs font-bold text-gray-300">
        2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="w-6 h-6 rounded-full bg-amber-700/20 border border-amber-600/30 flex items-center justify-center text-xs font-bold text-amber-600">
        3
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
      {rank}
    </span>
  );
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1)
    return <MedalIcon size={14} className="text-amber-300" aria-hidden="true" />;
  if (rank === 2)
    return <MedalIcon size={14} className="text-slate-200" aria-hidden="true" />;
  if (rank === 3)
    return <MedalIcon size={14} className="text-orange-400" aria-hidden="true" />;
  return null;
}

export function LeaderboardPreview() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Card className="leaderboard-preview-card relative flex h-full flex-col overflow-hidden border-amber-500/20 !bg-[#151107]">
      <div className="leaderboard-preview-sheen absolute inset-0" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="leaderboard-preview-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-200">
            <Trophy size={21} strokeWidth={2.35} aria-hidden="true" />
          </span>
          <h3
            className="truncate text-lg font-bold font-display text-white"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("leaderboard.title")}
          </h3>
        </div>
        <Badge variant="gold" size="sm" className="shrink-0">
          <span className="flex items-center gap-1.5">
            <Crown size={12} strokeWidth={2.4} aria-hidden="true" />
            <span>{t("leaderboard.weekly")}</span>
          </span>
        </Badge>
      </div>

      {/* Table header */}
      <div className="relative grid grid-cols-[32px_1fr_72px_56px] gap-2 px-1 mb-2 text-[10px] text-amber-200/50 uppercase tracking-wider">
        <span>#</span>
        <span>{t("leaderboard.user")}</span>
        <span className="text-right">{t("leaderboard.points")}</span>
        <span className="text-right">Win%</span>
      </div>

      {/* Table rows */}
      <div className="flex flex-col gap-1 flex-1">
        {topUsers.map((user) => (
          <div
            key={user.rank}
            className="leaderboard-preview-row grid grid-cols-[32px_1fr_72px_56px] gap-2 items-center px-1 py-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1">
              <Medal rank={user.rank} />
              <RankBadge rank={user.rank} />
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-300 flex-shrink-0">
                {user.username.charAt(0)}
              </div>
              <span className="text-sm text-gray-300 truncate">
                {user.username}
              </span>
            </div>
            <span className="text-sm font-mono font-bold text-green-400 text-right">
              {user.points.toLocaleString()}
            </span>
            <span className="flex items-center justify-end gap-1 text-sm font-mono text-amber-100/75">
              <TrendingUp size={12} className="text-green-300" aria-hidden="true" />
              {user.accuracy}%
            </span>
          </div>
        ))}
      </div>

      <Link
        href={`/${locale}/leaderboard`}
        className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors text-center block"
      >
        {t("dashboard.viewFullLeaderboard")} &rarr;
      </Link>
    </Card>
  );
}
