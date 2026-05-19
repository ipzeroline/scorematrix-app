"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { LeaderboardEntry } from "@/types";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightUserId?: string;
  showPeriod?: boolean;
  className?: string;
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30">
        <span className="text-amber-400 text-sm font-bold">1</span>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-400/15 border border-gray-400/25">
        <span className="text-gray-300 text-sm font-bold">2</span>
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700/30">
        <span className="text-amber-600 text-sm font-bold">3</span>
      </div>
    );
  }

  return (
    <span className="text-sm text-gray-500 font-mono w-8 text-center">
      {rank}
    </span>
  );
}

export function LeaderboardTable({
  entries,
  highlightUserId,
  className,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <Card className={cn("py-12", className)}>
        <div className="text-center text-gray-500 text-sm">
          No leaderboard data yet
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("p-0 overflow-hidden", className)}>
      {/* Table Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 text-[10px] uppercase tracking-wider text-gray-500 font-semibold border-b border-gray-800/50">
        <div className="w-10 text-center">#</div>
        <div className="flex-1">User</div>
        <div className="w-16 text-right hidden sm:block">Level</div>
        <div className="w-20 text-right">Points</div>
        <div className="w-24 hidden sm:block">Accuracy</div>
        <div className="w-14 text-center">Streak</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-800/30">
        {entries.map((entry) => {
          const isHighlighted = entry.userId === highlightUserId;

          return (
            <div
              key={`${entry.userId}-${entry.rank}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a2e] transition-colors",
                isHighlighted &&
                  "border-l-2 border-cyan-500 bg-cyan-500/5"
              )}
            >
              {/* Rank */}
              <div className="w-10 flex justify-center">
                <RankCell rank={entry.rank} />
              </div>

              {/* User */}
              <div className="flex-1 flex items-center gap-3 min-w-0">
                <Avatar
                  src={entry.avatar}
                  fallback={entry.username}
                  size="sm"
                />
                <span
                  className={cn(
                    "text-sm font-medium truncate",
                    isHighlighted ? "text-cyan-400" : "text-white"
                  )}
                >
                  {entry.username}
                </span>
              </div>

              {/* Level */}
              <div className="w-16 text-right hidden sm:block">
                <span className="text-xs text-purple-400 font-mono font-bold">
                  Lv.{entry.level}
                </span>
              </div>

              {/* Points */}
              <div className="w-20 text-right">
                <span className="text-sm font-bold font-mono text-green-400">
                  {entry.points.toLocaleString()}
                </span>
              </div>

              {/* Accuracy */}
              <div className="w-24 hidden sm:block">
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={entry.accuracy}
                    max={100}
                    color="cyan"
                    size="sm"
                    className="flex-1"
                  />
                  <span className="text-[10px] text-gray-400 font-mono w-8 text-right">
                    {entry.accuracy}%
                  </span>
                </div>
              </div>

              {/* Streak */}
              <div className="w-14 text-center">
                <span
                  className={cn(
                    "text-sm font-bold font-mono",
                    entry.streak >= 5
                      ? "text-amber-400"
                      : entry.streak >= 3
                        ? "text-orange-400"
                        : "text-gray-400"
                  )}
                >
                  {entry.streak >= 5 && (
                    <span className="text-xs mr-0.5">&#128293;</span>
                  )}
                  {entry.streak}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
