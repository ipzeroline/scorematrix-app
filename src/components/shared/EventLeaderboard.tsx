"use client";

import { Medal, Trophy, Users } from "lucide-react";
import { useTranslations } from "next-intl";

type LeaderboardEntry = {
  rank: number;
  username: string;
  points: number;
  accuracy: number;
  predictions: number;
  isCurrentUser?: boolean;
};

type Props = {
  entries: LeaderboardEntry[];
  currentUserRank?: number;
  currentUserPoints?: number;
  totalParticipants?: number;
};

export function EventLeaderboard({
  entries,
  currentUserRank,
  currentUserPoints,
  totalParticipants,
}: Props) {
  const t = useTranslations("events");

  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0a0f18] p-10 text-center">
        <Users size={32} className="mx-auto mb-3 text-gray-600" />
        <p className="text-sm font-semibold text-gray-400">
          {t("leaderboard.empty")}
        </p>
      </div>
    );
  }

  const rankIcon = (rank: number) => {
    if (rank === 1)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10">
          <Trophy size={14} className="text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300/20 bg-gray-300/5">
          <Medal size={14} className="text-gray-300" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-700/20 bg-amber-700/5">
          <Medal size={14} className="text-amber-600" />
        </div>
      );
    return (
      <span className="flex h-8 w-8 items-center justify-center text-xs font-bold text-gray-500">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-purple-400/15 bg-[#0a0f18] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10">
            <Trophy size={18} className="text-purple-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t("leaderboard.title")}</h2>
            {totalParticipants && (
              <p className="mt-0.5 text-sm text-gray-400">
                {t("leaderboard.participants", { count: totalParticipants.toLocaleString() })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {/* 2nd place */}
          <div className="rounded-2xl border border-gray-300/10 bg-[#0d1118] p-4 text-center pt-8">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-gray-300/20 bg-gray-300/5">
              <Medal size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-bold text-white truncate">{entries[1]?.username ?? "—"}</p>
            <p className="mt-1 text-xs text-gray-500">2nd</p>
            <p className="mt-1 font-mono text-sm font-bold text-amber-200">
              {entries[1]?.points?.toLocaleString() ?? 0}
            </p>
          </div>

          {/* 1st place */}
          <div className="rounded-2xl border border-amber-400/20 bg-[#0d1118] p-4 text-center ring-1 ring-amber-400/10 -mt-2">
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
              <Trophy size={24} className="text-amber-300" />
            </div>
            <p className="text-sm font-bold text-white truncate">{entries[0]?.username ?? "—"}</p>
            <p className="mt-1 text-xs font-bold text-amber-300">🥇 1st</p>
            <p className="mt-1 font-mono text-lg font-bold text-amber-200">
              {entries[0]?.points?.toLocaleString() ?? 0}
            </p>
          </div>

          {/* 3rd place */}
          <div className="rounded-2xl border border-amber-700/10 bg-[#0d1118] p-4 text-center pt-10">
            <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full border border-amber-700/20 bg-amber-700/5">
              <Medal size={20} className="text-amber-600" />
            </div>
            <p className="text-sm font-bold text-white truncate">{entries[2]?.username ?? "—"}</p>
            <p className="mt-1 text-xs text-gray-500">3rd</p>
            <p className="mt-1 font-mono text-sm font-bold text-amber-200">
              {entries[2]?.points?.toLocaleString() ?? 0}
            </p>
          </div>
        </div>
      )}

      {/* Full ranking table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs uppercase tracking-[0.1em] text-gray-500">
                <th className="px-4 py-3 text-left font-semibold w-12">#</th>
                <th className="px-4 py-3 text-left font-semibold">{t("leaderboard.player")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.points")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.accuracy")}</th>
                <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.predictions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {entries.map((entry) => (
                <tr
                  key={entry.rank}
                  className={
                    entry.isCurrentUser
                      ? "bg-cyan-400/5 transition-colors hover:bg-cyan-400/[0.07]"
                      : "transition-colors hover:bg-white/[0.02]"
                  }
                >
                  <td className="px-4 py-3">{rankIcon(entry.rank)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        entry.isCurrentUser ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {entry.username}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-[10px] text-cyan-400">(คุณ)</span>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono font-semibold text-amber-200">
                      {entry.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-300">{entry.accuracy}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-gray-400">{entry.predictions}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Current user position (if not in top visible) */}
      {currentUserRank && currentUserPoints && (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{t("leaderboard.yourRank")}</span>
              <span className="font-mono text-lg font-bold text-white">
                #{currentUserRank}
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-amber-200">
              {t("leaderboard.yourPoints", { points: currentUserPoints.toLocaleString() })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
