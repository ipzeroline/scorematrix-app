"use client";

import { useEffect, useMemo, useState } from "react";
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
  getLeaderboard,
  mapApiLeaderboardEntry,
  type LeaderboardPeriodQuery,
  type LeaderboardResponse,
} from "@/lib/leaderboard-api";
import { getLeaderboardPageCopy } from "@/data/leaderboard-page-content";
import { useUserStore } from "@/stores/user-store";
import type { LeaderboardEntry, LeaderboardReward } from "@/types/leaderboard";

type LeaderboardViewData = {
  period: LeaderboardResponse["period"];
  entries: LeaderboardEntry[];
  userEntry: LeaderboardEntry | null;
  rewards: LeaderboardReward[];
};

type LeaderboardPeriodCounts = Record<LeaderboardPeriodQuery, number | null>;

const EMPTY_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [];
const LEADERBOARD_PERIODS: LeaderboardPeriodQuery[] = [
  "daily",
  "weekly",
  "seasonal",
];
const EMPTY_PERIOD_COUNTS: LeaderboardPeriodCounts = {
  daily: null,
  weekly: null,
  seasonal: null,
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

function CurrentUserCardSkeleton() {
  return (
    <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 lg:w-80">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="h-6 w-24 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-6 w-16 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-32 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-14 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-3 w-10 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
      <div className="mt-4 h-16 animate-pulse rounded-lg border border-gray-800 bg-[#0a0a0f]" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.05]" />
        <div className="h-4 w-4 animate-pulse rounded bg-white/[0.06]" />
      </div>
      <div className="mt-3 h-6 w-20 animate-pulse rounded bg-white/[0.07]" />
    </div>
  );
}

function TopThreeSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-36 animate-pulse rounded bg-white/[0.07]" />
          <div className="h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
        </div>
        <div className="space-y-2">
          <div className="h-5 w-16 animate-pulse rounded bg-white/[0.07]" />
          <div className="h-3 w-10 animate-pulse rounded bg-white/[0.04]" />
        </div>
      </div>
    </Card>
  );
}

function LeaderboardTableSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <div className="w-full min-w-[720px]">
          <div className="grid grid-cols-[90px_1fr_110px_130px_130px_100px] border-b border-gray-800 bg-[#0a0a0f] px-4 py-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-3 w-16 animate-pulse rounded bg-white/[0.05]"
              />
            ))}
          </div>
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[90px_1fr_110px_130px_130px_100px] items-center border-b border-gray-800/50 px-4 py-3 last:border-0"
            >
              <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-full bg-white/[0.06]" />
                <div className="h-3 w-36 animate-pulse rounded bg-white/[0.07]" />
              </div>
              <div className="ml-auto h-3 w-8 animate-pulse rounded bg-white/[0.05]" />
              <div className="ml-auto h-3 w-16 animate-pulse rounded bg-white/[0.05]" />
              <div className="ml-auto h-3 w-20 animate-pulse rounded bg-white/[0.05]" />
              <div className="ml-auto h-3 w-8 animate-pulse rounded bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function leaderboardRowKey(entry: LeaderboardEntry) {
  return `${entry.rank}-${entry.userId}`;
}

function toLeaderboardViewData(response: LeaderboardResponse): LeaderboardViewData {
  return {
    period: response.period,
    entries: response.entries.map(mapApiLeaderboardEntry),
    userEntry: response.userEntry
      ? mapApiLeaderboardEntry(response.userEntry)
      : null,
    rewards: response.rewards,
  };
}

function formatRankRange(rankRange: [number, number]) {
  const [start, end] = rankRange;
  return start === end ? `#${start}` : `#${start}-${end}`;
}

function getCurrentEntryAvatar(
  entry: LeaderboardEntry,
  currentUserId: string | undefined,
  profileAvatarUrl: string
) {
  if (entry.userId !== currentUserId) return entry.avatar;
  return entry.avatar || profileAvatarUrl || null;
}

function getCurrentEntryName(
  entry: LeaderboardEntry,
  currentUserId: string | undefined,
  profileName: string
) {
  if (entry.userId !== currentUserId) return entry.username;
  return entry.username || profileName;
}

export default function LeaderboardPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getLeaderboardPageCopy(locale);
  const [period, setPeriod] = useState<LeaderboardPeriodQuery>("daily");
  const userId = useUserStore((state) => state.userId);
  const profileAvatarUrl = useUserStore((state) => state.avatarUrl);
  const profileUsername = useUserStore((state) => state.username);
  const profileDisplayName = useUserStore((state) => state.displayName);
  const [leaderboard, setLeaderboard] = useState<LeaderboardViewData | null>(null);
  const [periodCounts, setPeriodCounts] =
    useState<LeaderboardPeriodCounts>(EMPTY_PERIOD_COUNTS);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let isActive = true;

    getLeaderboard(period, { locale })
      .then((response) => {
        if (!isActive) return;
        setLeaderboard(toLeaderboardViewData(response));
        setPeriodCounts((current) => ({
          ...current,
          [period]: response.entries.length,
        }));
        setLoadFailed(false);
      })
      .catch(() => {
        if (!isActive) return;
        setLeaderboard(null);
        setLoadFailed(true);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [locale, period]);

  useEffect(() => {
    let isActive = true;

    Promise.all(
      LEADERBOARD_PERIODS.map(async (periodKey) => {
        try {
          const response = await getLeaderboard(periodKey, { locale });
          return [periodKey, response.entries.length] as const;
        } catch {
          return [periodKey, null] as const;
        }
      })
    ).then((counts) => {
      if (!isActive) return;
      setPeriodCounts({
        daily: counts.find(([key]) => key === "daily")?.[1] ?? null,
        weekly: counts.find(([key]) => key === "weekly")?.[1] ?? null,
        seasonal: counts.find(([key]) => key === "seasonal")?.[1] ?? null,
      });
    });

    return () => {
      isActive = false;
    };
  }, [locale]);

  const entries = useMemo(
    () => leaderboard?.entries ?? EMPTY_LEADERBOARD_ENTRIES,
    [leaderboard]
  );
  const topThree = entries.slice(0, 3);
  const currentUser =
    leaderboard?.userEntry ??
    (userId ? entries.find((entry) => entry.userId === userId) : undefined);
  const profileName = profileDisplayName || profileUsername;
  const activeCurrentUserId = currentUser?.userId || userId || undefined;
  const currentUserAvatar = currentUser?.avatar || profileAvatarUrl || null;
  const currentUserName = currentUser?.username || profileName;
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

  const tabs = LEADERBOARD_PERIODS.map((periodKey) => ({
    key: periodKey,
    label: copy.periods[periodKey],
    count:
      periodCounts[periodKey] ??
      (periodKey === period && leaderboard ? entries.length : undefined),
  }));
  const showLoadingState = loading && leaderboard === null;
  const handlePeriodChange = (value: string) => {
    const nextPeriod = value as LeaderboardPeriodQuery;
    if (nextPeriod === period) return;

    setLeaderboard(null);
    setLoading(true);
    setLoadFailed(false);
    setPeriod(nextPeriod);
  };

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
    <div className="mx-auto max-w-6xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-[#07080b] shadow-[0_0_42px_rgba(245,158,11,0.06)]">
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-amber-400 via-cyan-400 to-magenta" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.13),transparent_30%),radial-gradient(circle_at_86%_12%,rgba(34,211,238,0.12),transparent_28%)]" />
        <div className="relative p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                  <Crown size={14} />
                  {copy.title}
                </div>
                <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
                  {copy.subtitle}
                </p>
                <p className="mt-3 max-w-2xl rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-2 text-sm leading-6 text-cyan-100/80">
                  {copy.notice}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {showLoadingState
                  ? Array.from({ length: 4 }).map((_, index) => (
                      <StatCardSkeleton key={index} />
                    ))
                  : stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="rounded-xl border border-gray-800 bg-black/35 px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-gray-400">{stat.label}</p>
                            <Icon size={17} className={stat.tone} />
                          </div>
                          <p className="mt-2 font-mono text-2xl font-black text-white">
                            {stat.value}
                          </p>
                        </div>
                      );
                    })}
              </div>
            </div>

            {showLoadingState ? (
              <CurrentUserCardSkeleton />
            ) : currentUser && (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-black/55 p-4 shadow-[0_0_26px_rgba(34,211,238,0.08)]">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-amber-400 to-magenta" />
                <div className="mb-4 flex items-center justify-between gap-3">
                  <Badge variant="cyan" size="md">{copy.labels.currentPosition}</Badge>
                  <Badge variant="green" size="md">{copy.periods[period]}</Badge>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <RankBadge rank={currentUser.rank} />
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      src={currentUserAvatar}
                      fallback={currentUserName}
                      size="xl"
                      className="border-cyan-500/35 ring-1 ring-cyan-400/25"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-white">
                        {currentUserName}{" "}
                        <span className="text-cyan-300">({copy.labels.you})</span>
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-400">
                        {copy.labels.level} {currentUser.level}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-black text-green-300">
                      {currentUser.points.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-gray-500">
                      {currentUser.accuracy}% {copy.labels.accuracy}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-gray-800 bg-[#0b0d13] p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-gray-500">{copy.labels.climbTarget}</span>
                    <span className="min-w-0 truncate text-right font-bold text-cyan-300">
                      {nextRankEntry
                        ? `#${nextRankEntry.rank} ${nextRankEntry.username}`
                        : copy.labels.nextRank}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-sm font-semibold text-gray-400">
                    {pointsBehind.toLocaleString()} {copy.labels.pointsBehind}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <MiniMetric label={copy.labels.accuracy} value={`${currentUser.accuracy}%`} tone="text-cyan-300" />
                    <MiniMetric label={copy.labels.streak} value={String(currentUser.streak)} tone="text-amber-300" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="sticky top-[64px] z-20 rounded-xl border border-gray-800 bg-[#10121a]/95 p-1.5 shadow-[0_0_24px_rgba(34,211,238,0.05)] backdrop-blur md:top-[72px]">
          <Tabs
            tabs={tabs}
            activeTab={period}
            onChange={handlePeriodChange}
            className="border-b-0"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.45fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">
                  {copy.periods[period]}
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {copy.labels.topThree}
                </h2>
              </div>
              <Badge variant="gold" size="md">{copy.periods[period]}</Badge>
            </div>

            <div className="space-y-3">
              {showLoadingState ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TopThreeSkeleton key={index} />
                ))
              ) : (
                topThree.map((entry) => (
                  <PodiumCard
                    key={leaderboardRowKey(entry)}
                    entry={entry}
                    copy={copy}
                    currentUserId={activeCurrentUserId}
                    profileAvatarUrl={profileAvatarUrl}
                    profileName={profileName}
                  />
                ))
              )}
            </div>

            <div className="rounded-2xl border border-gray-800 bg-[#10121a] p-4 shadow-[0_0_24px_rgba(34,211,238,0.04)]">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                  <ShieldCheck size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-black text-white">
                    {copy.labels.rewardsHint}
                  </p>
                  {!showLoadingState &&
                    leaderboard &&
                    leaderboard.rewards.length > 0 && (
                      <div className="mt-3 grid gap-2">
                        {leaderboard.rewards.slice(0, 4).map((reward) => (
                          <div
                            key={formatRankRange(reward.rankRange)}
                            className="rounded-xl border border-gray-800 bg-[#0a0a0f] px-3 py-2.5"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-mono text-sm font-black text-amber-300">
                                {formatRankRange(reward.rankRange)}
                              </span>
                              <span className="text-right text-sm font-semibold text-gray-300">
                                +{reward.reward.freePoints.toLocaleString()}{" "}
                                {copy.labels.points}
                                {reward.reward.premiumCredits
                                  ? ` / +${reward.reward.premiumCredits.toLocaleString()} ${copy.labels.credits}`
                                  : ""}
                              </span>
                            </div>
                            {reward.reward.badge && (
                              <p className="mt-1 truncate text-xs text-gray-500">
                                {reward.reward.badge}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  <Link
                    href={`/${locale}/missions`}
                    className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-cyan-300 hover:text-cyan-200"
                  >
                    {copy.labels.climbTarget}
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  {copy.labels.leaderboard}
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {copy.labels.leaderboard}
                </h2>
              </div>
              <span className="rounded-full border border-gray-800 bg-[#10121a] px-3 py-1 font-mono text-xs font-bold text-gray-400">
                {entries.length} {copy.labels.entries}
              </span>
            </div>

            {showLoadingState ? (
              <LeaderboardTableSkeleton />
            ) : loadFailed ? (
              <EmptyState
                title={copy.empty.title}
                description={copy.empty.description}
                icon={<Trophy size={44} />}
                className="rounded-2xl border border-gray-800 bg-[#10121a]"
              />
            ) : entries.length === 0 ? (
              <EmptyState
                title={copy.empty.title}
                description={copy.empty.description}
                icon={<Trophy size={44} />}
                className="rounded-2xl border border-gray-800 bg-[#10121a]"
              />
            ) : (
              <>
                <div className="space-y-2 md:hidden">
                  {entries.map((entry) => (
                    <MobileRankCard
                      key={leaderboardRowKey(entry)}
                      entry={entry}
                      copy={copy}
                      currentUserId={activeCurrentUserId}
                      profileAvatarUrl={profileAvatarUrl}
                      profileName={profileName}
                    />
                  ))}
                </div>

                <Card className="hidden overflow-hidden border-cyan-500/15 bg-[#0b0d13] p-0 md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="border-b border-gray-800 bg-black/35">
                          <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.rank}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.player}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.level}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.points}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.accuracy}
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                            {copy.labels.streak}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => {
                          const isCurrentUser = entry.userId === activeCurrentUserId;
                          const entryAvatar = getCurrentEntryAvatar(
                            entry,
                            activeCurrentUserId,
                            profileAvatarUrl
                          );
                          const entryName = getCurrentEntryName(
                            entry,
                            activeCurrentUserId,
                            profileName
                          );

                          return (
                            <tr
                              key={leaderboardRowKey(entry)}
                              className={`border-b border-gray-800/50 transition-colors last:border-0 ${
                                isCurrentUser
                                  ? "bg-cyan-500/10"
                                  : "hover:bg-white/[0.03]"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <RankBadge rank={entry.rank} />
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    src={entryAvatar}
                                    fallback={entryName}
                                    size="md"
                                    className="border-cyan-500/20"
                                  />
                                  <div className="min-w-0">
                                    <p
                                      className={`truncate text-sm font-bold ${
                                        isCurrentUser
                                          ? "text-cyan-300"
                                          : "text-white"
                                      }`}
                                    >
                                      {entryName}
                                    </p>
                                    {isCurrentUser && (
                                      <p className="text-xs font-semibold text-cyan-400">
                                        {copy.labels.you}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-mono text-sm font-bold text-purple-300">
                                  {entry.level}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span className="font-mono text-base font-black text-green-300">
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
                                  className={`inline-flex items-center justify-end gap-1 font-mono text-sm font-bold ${
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
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {copy.guide.map((item, index) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-800 bg-[#10121a] p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
              {index === 0 ? (
                <Sparkles size={17} />
              ) : index === 1 ? (
                <Target size={17} />
              ) : (
                <BarChart3 size={17} />
              )}
            </div>
            <h3 className="mt-3 text-base font-black text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-black/35 px-3 py-2">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className={`mt-1 font-mono text-base font-black ${tone}`}>{value}</p>
    </div>
  );
}

function PodiumCard({
  entry,
  copy,
  currentUserId,
  profileAvatarUrl,
  profileName,
}: {
  entry: LeaderboardEntry;
  copy: ReturnType<typeof getLeaderboardPageCopy>;
  currentUserId?: string;
  profileAvatarUrl: string;
  profileName: string;
}) {
  const isChampion = entry.rank === 1;
  const avatar = getCurrentEntryAvatar(entry, currentUserId, profileAvatarUrl);
  const username = getCurrentEntryName(entry, currentUserId, profileName);

  return (
    <Card
      neon={isChampion ? "gold" : "cyan"}
      className={`relative overflow-hidden p-4 ${
        isChampion
          ? "border-amber-500/30 bg-gradient-to-br from-[#181006] to-[#0b0d13]"
          : "border-cyan-500/15 bg-[#0b0d13]"
      }`}
    >
      {isChampion ? (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-amber-300 via-cyan-300 to-magenta" />
      ) : null}
      <div className="flex items-center gap-3">
        <RankBadge rank={entry.rank} />
        <Avatar
          src={avatar}
          fallback={username}
          size={isChampion ? "xl" : "lg"}
          className={isChampion ? "border-amber-400/50 ring-1 ring-amber-300/35" : "border-cyan-500/25 ring-1 ring-cyan-400/20"}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isChampion ? (
              <Trophy size={16} className="text-amber-300" />
            ) : (
              <Medal size={16} className="text-gray-400" />
            )}
            <p className="truncate text-base font-black text-white">
              {username}
            </p>
          </div>
          <p className="mt-1 text-sm font-semibold text-gray-400">
            {copy.labels.level} {entry.level} · {entry.accuracy}%{" "}
            {copy.labels.accuracy}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-black text-green-300">
            {entry.points.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-gray-500">
            {copy.labels.points}
          </p>
        </div>
      </div>
    </Card>
  );
}

function MobileRankCard({
  entry,
  copy,
  currentUserId,
  profileAvatarUrl,
  profileName,
}: {
  entry: LeaderboardEntry;
  copy: ReturnType<typeof getLeaderboardPageCopy>;
  currentUserId?: string;
  profileAvatarUrl: string;
  profileName: string;
}) {
  const isCurrentUser = entry.userId === currentUserId;
  const avatar = getCurrentEntryAvatar(entry, currentUserId, profileAvatarUrl);
  const username = getCurrentEntryName(entry, currentUserId, profileName);

  return (
    <Card
      className={`p-4 ${
        isCurrentUser
          ? "border-cyan-500/35 bg-cyan-500/10"
          : "border-gray-800 bg-[#0b0d13]"
      }`}
    >
      <div className="flex items-center gap-3">
        <RankBadge rank={entry.rank} />
        <Avatar
          src={avatar}
          fallback={username}
          size="lg"
          className={isCurrentUser ? "border-cyan-400/35 ring-1 ring-cyan-300/25" : "border-gray-700"}
        />
        <div className="min-w-0 flex-1">
          <p className={`truncate text-base font-black ${isCurrentUser ? "text-cyan-200" : "text-white"}`}>
            {username}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-400">
            {copy.labels.level} {entry.level}
            {isCurrentUser ? ` · ${copy.labels.you}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xl font-black text-green-300">
            {entry.points.toLocaleString()}
          </p>
          <p className="text-xs font-semibold text-gray-500">{copy.labels.points}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <MiniMetric label={copy.labels.accuracy} value={`${entry.accuracy}%`} tone="text-cyan-300" />
        <MiniMetric label={copy.labels.streak} value={String(entry.streak)} tone={entry.streak >= 5 ? "text-amber-300" : "text-gray-300"} />
      </div>
    </Card>
  );
}
