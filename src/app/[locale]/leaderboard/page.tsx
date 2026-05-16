"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  Crown,
  Flame,
  Medal,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Tabs } from "@/components/ui/Tabs";
import {
  dailyLeaderboard,
  seasonalLeaderboard,
  weeklyLeaderboard,
} from "@/data/leaderboard";
import { getLeaderboardPageCopy } from "@/data/leaderboard-page-content";
import type { LeaderboardEntry } from "@/types/leaderboard";

type PeriodKey = "daily" | "weekly" | "seasonal";

const CURRENT_USER_ID = "user-022";

const periodEntries: Record<PeriodKey, LeaderboardEntry[]> = {
  daily: dailyLeaderboard,
  weekly: weeklyLeaderboard,
  seasonal: seasonalLeaderboard,
};

function rankTone(rank: number) {
  if (rank === 1) return "border-amber-500/30 bg-amber-500/15 text-amber-300";
  if (rank === 2) return "border-gray-400/30 bg-gray-400/10 text-gray-200";
  if (rank === 3) return "border-orange-500/30 bg-orange-500/15 text-orange-300";
  return "border-gray-700 bg-gray-800 text-gray-400";
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${rankTone(rank)}`}
    >
      {rank}
    </span>
  );
}

function leaderboardRowKey(entry: LeaderboardEntry) {
  return `${entry.rank}-${entry.userId}`;
}

export default function LeaderboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getLeaderboardPageCopy(locale);
  const [period, setPeriod] = useState<PeriodKey>("weekly");

  const entries = periodEntries[period];
  const topThree = entries.slice(0, 3);
  const currentUser =
    entries.find((entry) => entry.userId === CURRENT_USER_ID) ?? entries[1];
  const nextRankEntry =
    currentUser && currentUser.rank > 1
      ? entries.find((entry) => entry.rank === currentUser.rank - 1)
      : undefined;
  const pointsBehind =
    currentUser && nextRankEntry
      ? Math.max(nextRankEntry.points - currentUser.points, 0)
      : 0;

  const summary = useMemo(() => {
    const topScore = entries[0]?.points ?? 0;
    const averageAccuracy = Math.round(
      entries.reduce((sum, entry) => sum + entry.accuracy, 0) /
        Math.max(entries.length, 1)
    );
    const activeStreaks = entries.filter((entry) => entry.streak >= 5).length;

    return {
      topScore,
      averageAccuracy,
      activeStreaks,
    };
  }, [entries]);

  const tabs = [
    { key: "daily", label: copy.periods.daily, count: dailyLeaderboard.length },
    { key: "weekly", label: copy.periods.weekly, count: weeklyLeaderboard.length },
    {
      key: "seasonal",
      label: copy.periods.seasonal,
      count: seasonalLeaderboard.length,
    },
  ];

  const stats = [
    {
      label: copy.stats.rankedPlayers,
      value: entries.length.toLocaleString(),
      icon: Users,
      tone: "text-cyan-300",
    },
    {
      label: copy.stats.topScore,
      value: summary.topScore.toLocaleString(),
      icon: Trophy,
      tone: "text-amber-300",
    },
    {
      label: copy.stats.averageAccuracy,
      value: `${summary.averageAccuracy}%`,
      icon: BarChart3,
      tone: "text-green-300",
    },
    {
      label: copy.stats.activeStreaks,
      value: summary.activeStreaks.toLocaleString(),
      icon: Flame,
      tone: "text-orange-300",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-gray-800 bg-[#12121a] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
              <Crown size={14} />
              {copy.title}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {copy.subtitle}
              </p>
            </div>
            <p className="text-xs leading-5 text-gray-500">{copy.notice}</p>
          </div>

          {currentUser && (
            <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-4 lg:w-80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge variant="cyan">{copy.labels.currentPosition}</Badge>
                <Badge variant="green">{copy.periods[period]}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <RankBadge rank={currentUser.rank} />
                <Avatar
                  src={currentUser.avatar}
                  fallback={currentUser.username}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {currentUser.username}{" "}
                    <span className="text-cyan-300">({copy.labels.you})</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {copy.labels.level} {currentUser.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-green-300">
                    {currentUser.points.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {currentUser.accuracy}% {copy.labels.accuracy}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-gray-500">{copy.labels.climbTarget}</span>
                  <span className="font-medium text-cyan-300">
                    {nextRankEntry
                      ? `#${nextRankEntry.rank} ${nextRankEntry.username}`
                      : copy.labels.nextRank}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {pointsBehind.toLocaleString()} {copy.labels.pointsBehind}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <Icon size={16} className={stat.tone} />
                </div>
                <p className="mt-2 text-xl font-semibold text-white">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <Tabs
          tabs={tabs}
          activeTab={period}
          onChange={(value) => setPeriod(value as PeriodKey)}
        />

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.4fr]">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">
                {copy.labels.topThree}
              </h2>
              <Badge variant="gold">{copy.periods[period]}</Badge>
            </div>

            <div className="space-y-3">
              {topThree.map((entry) => (
                <Card
                  key={leaderboardRowKey(entry)}
                  neon={entry.rank === 1 ? "gold" : "cyan"}
                  className="p-4"
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={entry.rank} />
                    <Avatar
                      src={entry.avatar}
                      fallback={entry.username}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 ? (
                          <Trophy size={15} className="text-amber-300" />
                        ) : (
                          <Medal size={15} className="text-gray-400" />
                        )}
                        <p className="truncate text-sm font-semibold text-white">
                          {entry.username}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {copy.labels.level} {entry.level} · {entry.accuracy}%{" "}
                        {copy.labels.accuracy}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-lg font-semibold text-green-300">
                        {entry.points.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.points}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#12121a] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-cyan-300" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {copy.labels.rewardsHint}
                  </p>
                  <Link
                    href={`/${locale}/missions`}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    {copy.labels.climbTarget}
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-white">
                {copy.labels.leaderboard}
              </h2>
              <span className="text-xs text-gray-500">
                {entries.length} {copy.labels.entries}
              </span>
            </div>

            {entries.length === 0 ? (
              <EmptyState
                title={copy.empty.title}
                description={copy.empty.description}
                icon={<Trophy size={44} />}
              />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px]">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0a0a0f]">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                          {copy.labels.rank}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                          {copy.labels.player}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          {copy.labels.level}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          {copy.labels.points}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          {copy.labels.accuracy}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                          {copy.labels.streak}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => {
                        const isCurrentUser = entry.userId === currentUser?.userId;

                        return (
                          <tr
                            key={leaderboardRowKey(entry)}
                            className={`border-b border-gray-800/50 transition-colors last:border-0 ${
                              isCurrentUser
                                ? "bg-cyan-500/5"
                                : "hover:bg-white/[0.02]"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <RankBadge rank={entry.rank} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar
                                  src={entry.avatar}
                                  fallback={entry.username}
                                  size="sm"
                                />
                                <div className="min-w-0">
                                  <p
                                    className={`truncate text-sm font-medium ${
                                      isCurrentUser
                                        ? "text-cyan-300"
                                        : "text-white"
                                    }`}
                                  >
                                    {entry.username}
                                  </p>
                                  {isCurrentUser && (
                                    <p className="text-[11px] text-cyan-400">
                                      {copy.labels.you}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-mono text-xs font-semibold text-purple-300">
                                {entry.level}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-mono text-sm font-semibold text-green-300">
                                {entry.points.toLocaleString()}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="ml-auto flex w-28 items-center justify-end gap-2">
                                <ProgressBar
                                  value={entry.accuracy}
                                  color="cyan"
                                  size="sm"
                                  className="w-14"
                                />
                                <span className="w-9 text-right font-mono text-xs text-gray-400">
                                  {entry.accuracy}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`inline-flex items-center justify-end gap-1 font-mono text-sm font-semibold ${
                                  entry.streak >= 5
                                    ? "text-amber-300"
                                    : "text-gray-400"
                                }`}
                              >
                                {entry.streak >= 5 && <Flame size={13} />}
                                {entry.streak}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {copy.guide.map((item, index) => (
          <div
            key={item.title}
            className="rounded-xl border border-gray-800 bg-[#12121a] p-4"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
              {index === 0 ? (
                <Sparkles size={15} />
              ) : index === 1 ? (
                <Target size={15} />
              ) : (
                <BarChart3 size={15} />
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
