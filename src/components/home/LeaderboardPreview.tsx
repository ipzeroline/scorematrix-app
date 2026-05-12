"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
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
    return <span className="text-xs" role="img" aria-label="gold">&#129351;</span>;
  if (rank === 2)
    return <span className="text-xs" role="img" aria-label="silver">&#129352;</span>;
  if (rank === 3)
    return <span className="text-xs" role="img" aria-label="bronze">&#129353;</span>;
  return null;
}

export function LeaderboardPreview() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold font-display text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("leaderboard.title")}
        </h3>
        <Badge variant="gold" size="sm">
          {t("leaderboard.weekly")}
        </Badge>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[32px_1fr_72px_56px] gap-2 px-1 mb-2 text-[10px] text-gray-500 uppercase tracking-wider">
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
            className="grid grid-cols-[32px_1fr_72px_56px] gap-2 items-center px-1 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
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
            <span className="text-sm font-mono text-gray-400 text-right">
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
