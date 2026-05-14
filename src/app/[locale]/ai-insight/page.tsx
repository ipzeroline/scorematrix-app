"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarClock,
  Flame,
  Gauge,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { aiInsights } from "@/data/ai-insights";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { leagues } from "@/data/leagues";
import { matches } from "@/data/matches";
import { teams } from "@/data/teams";
import { MatchStatus } from "@/types/common";

type FilterKey = "all" | "live" | "upcoming" | "highConfidence" | "upset";

const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

const statusBadge: Record<
  MatchStatus,
  "cyan" | "green" | "gold" | "red" | "default"
> = {
  [MatchStatus.LIVE]: "green",
  [MatchStatus.UPCOMING]: "cyan",
  [MatchStatus.FINISHED]: "default",
  [MatchStatus.POSTPONED]: "gold",
  [MatchStatus.CANCELLED]: "red",
};

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(localeMap[locale] ?? "th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function formTone(result: "W" | "D" | "L") {
  if (result === "W") return "bg-green-500/15 text-green-300";
  if (result === "D") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
}

export default function AIInsightPage() {
  const { locale } = useParams<{ locale: string }>();
  const copy = getAIInsightPageCopy(locale);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const matchById = useMemo(
    () => new Map(matches.map((match) => [match.id, match])),
    []
  );
  const teamById = useMemo(() => new Map(teams.map((team) => [team.id, team])), []);
  const leagueById = useMemo(
    () => new Map(leagues.map((league) => [league.id, league])),
    []
  );

  const enrichedInsights = useMemo(
    () =>
      aiInsights
        .map((insight) => {
          const match = matchById.get(insight.matchId);
          const homeTeam = match ? teamById.get(match.homeTeamId) : undefined;
          const awayTeam = match ? teamById.get(match.awayTeamId) : undefined;
          const league = match ? leagueById.get(match.leagueId) : undefined;

          return {
            ...insight,
            match,
            homeTeam,
            awayTeam,
            league,
          };
        })
        .filter((insight) => insight.match && insight.homeTeam && insight.awayTeam),
    [leagueById, matchById, teamById]
  );

  const filteredInsights = enrichedInsights.filter((insight) => {
    if (activeFilter === "live") return insight.match?.status === MatchStatus.LIVE;
    if (activeFilter === "upcoming") {
      return insight.match?.status === MatchStatus.UPCOMING;
    }
    if (activeFilter === "highConfidence") return insight.confidenceScore >= 75;
    if (activeFilter === "upset") return insight.upsetAlert;
    return true;
  });

  const averageConfidence = Math.round(
    enrichedInsights.reduce((sum, insight) => sum + insight.confidenceScore, 0) /
      Math.max(enrichedInsights.length, 1)
  );
  const upsetCount = enrichedInsights.filter((insight) => insight.upsetAlert).length;
  const communityVotes = enrichedInsights.reduce(
    (sum, insight) => sum + insight.communitySentiment.totalVotes,
    0
  );
  const featuredInsight =
    enrichedInsights.find((insight) => insight.match?.isMatchOfTheDay) ??
    enrichedInsights[0];

  const filters: Array<{ key: FilterKey; label: string }> = [
    { key: "all", label: copy.filters.all },
    { key: "live", label: copy.filters.live },
    { key: "upcoming", label: copy.filters.upcoming },
    { key: "highConfidence", label: copy.filters.highConfidence },
    { key: "upset", label: copy.filters.upset },
  ];

  const stats = [
    {
      label: copy.stats.analyzedMatches,
      value: enrichedInsights.length.toLocaleString(),
      icon: Brain,
      tone: "text-cyan-300",
    },
    {
      label: copy.stats.averageConfidence,
      value: `${averageConfidence}%`,
      icon: Gauge,
      tone: "text-green-300",
    },
    {
      label: copy.stats.upsetAlerts,
      value: upsetCount.toLocaleString(),
      icon: ShieldAlert,
      tone: "text-red-300",
    },
    {
      label: copy.stats.communityVotes,
      value: communityVotes.toLocaleString(),
      icon: Users,
      tone: "text-purple-300",
    },
  ];

  const statusLabel: Record<MatchStatus, string> = {
    [MatchStatus.LIVE]: copy.labels.live,
    [MatchStatus.UPCOMING]: copy.labels.upcoming,
    [MatchStatus.FINISHED]: copy.labels.finished,
    [MatchStatus.POSTPONED]: copy.labels.postponed,
    [MatchStatus.CANCELLED]: copy.labels.cancelled,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-xl border border-gray-800 bg-[#12121a] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
              <Sparkles size={14} />
              {copy.sections.modelSummary}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
                {copy.title}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {copy.subtitle}
              </p>
            </div>
            <p className="text-xs leading-5 text-gray-500">{copy.disclaimer}</p>
          </div>

          {featuredInsight && featuredInsight.match && (
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4 lg:w-80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge variant="gold">{copy.labels.featured}</Badge>
                <Badge variant={statusBadge[featuredInsight.match.status]}>
                  {statusLabel[featuredInsight.match.status]}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-white">
                {featuredInsight.homeTeam?.name} vs {featuredInsight.awayTeam?.name}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">{copy.labels.confidence}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                    {featuredInsight.confidenceScore}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{copy.labels.heat}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
                    {featuredInsight.heatMeter}/10
                  </p>
                </div>
              </div>
              <Link
                href={`/${locale}/ai-insight/${featuredInsight.matchId}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-cyan-500 px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
              >
                {copy.actions.viewInsight}
              </Link>
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-semibold text-white">
            {copy.sections.matchInsights}
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeFilter === filter.key
                    ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                    : "border-gray-800 bg-[#12121a] text-gray-400 hover:border-gray-700 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {filteredInsights.length === 0 ? (
          <EmptyState
            title={copy.empty.title}
            description={copy.empty.description}
            icon={<Brain size={44} />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredInsights.map((insight) => {
              const match = insight.match!;
              const homeTeam = insight.homeTeam!;
              const awayTeam = insight.awayTeam!;
              const league = insight.league;
              const totalInjuries =
                insight.injuryImpact.homeInjuries.length +
                insight.injuryImpact.awayInjuries.length;

              return (
                <Card
                  key={insight.id}
                  hover
                  neon={insight.upsetAlert ? "magenta" : "cyan"}
                  className="space-y-4 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant="cyan">{league?.name ?? match.leagueId}</Badge>
                        <Badge variant={statusBadge[match.status]}>
                          {statusLabel[match.status]}
                        </Badge>
                        {insight.upsetAlert && (
                          <Badge variant="red">
                            <AlertTriangle size={11} className="mr-1" />
                            {copy.labels.upsetAlert}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white">
                        {homeTeam.name} vs {awayTeam.name}
                      </h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock size={13} />
                          {copy.labels.kickoff}:{" "}
                          {formatDateTime(match.kickoffTime, locale)}
                        </span>
                        <span>{match.round}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-bold text-cyan-300">
                        {insight.confidenceScore}%
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.confidence}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.homeWin}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-cyan-300">
                        {insight.homeWinProbability}%
                      </p>
                      <ProgressBar
                        value={insight.homeWinProbability}
                        color="cyan"
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.draw}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-purple-300">
                        {insight.drawProbability}%
                      </p>
                      <ProgressBar
                        value={insight.drawProbability}
                        color="purple"
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.awayWin}
                      </p>
                      <p className="mt-1 font-mono text-lg font-semibold text-magenta-300">
                        {insight.awayWinProbability}%
                      </p>
                      <ProgressBar
                        value={insight.awayWinProbability}
                        color="magenta"
                        size="sm"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                          <Activity size={13} className="text-green-300" />
                          {copy.labels.form}
                        </p>
                        <p className="text-xs text-amber-300">
                          <Flame size={13} className="mr-1 inline" />
                          {insight.heatMeter}/10
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs text-cyan-300">
                            {homeTeam.shortName}
                          </span>
                          <div className="flex gap-1">
                            {insight.formComparison.homeLastFive.map(
                              (result, index) => (
                                <span
                                  key={`${homeTeam.id}-${index}`}
                                  className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${formTone(result)}`}
                                >
                                  {result}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-xs text-magenta-300">
                            {awayTeam.shortName}
                          </span>
                          <div className="flex gap-1">
                            {insight.formComparison.awayLastFive.map(
                              (result, index) => (
                                <span
                                  key={`${awayTeam.id}-${index}`}
                                  className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${formTone(result)}`}
                                >
                                  {result}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                          <BarChart3 size={13} className="text-purple-300" />
                          {copy.labels.community}
                        </p>
                        <p className="text-xs text-gray-500">
                          {insight.communitySentiment.totalVotes.toLocaleString()}{" "}
                          {copy.labels.votes}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <ProbabilityRow
                          label={copy.labels.home}
                          value={insight.communitySentiment.homePercentage}
                          color="cyan"
                        />
                        <ProbabilityRow
                          label={copy.labels.draw}
                          value={insight.communitySentiment.drawPercentage}
                          color="purple"
                        />
                        <ProbabilityRow
                          label={copy.labels.away}
                          value={insight.communitySentiment.awayPercentage}
                          color="magenta"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
                    <div>
                      <p className="mb-2 text-xs font-medium text-gray-300">
                        {copy.labels.keyFactors}
                      </p>
                      <ul className="space-y-1.5">
                        {insight.keyFactors.slice(0, 3).map((factor) => (
                          <li
                            key={factor}
                            className="flex items-start gap-2 text-xs leading-5 text-gray-500"
                          >
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-300" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <p className="text-xs font-medium text-gray-300">
                        {copy.labels.injuryImpact}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {totalInjuries > 0
                          ? `${totalInjuries} ${copy.labels.injuryImpact}`
                          : copy.labels.noInjuries}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <span className="text-cyan-300">
                          {copy.labels.home}: {insight.injuryImpact.homeImpact}%
                        </span>
                        <span className="text-magenta-300">
                          {copy.labels.away}: {insight.injuryImpact.awayImpact}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                      {copy.labels.generated}:{" "}
                      {formatDateTime(insight.generatedAt, locale)}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/${locale}/predict/${match.id}`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
                      >
                        {copy.actions.predictNow}
                      </Link>
                      <Link
                        href={`/${locale}/ai-insight/${match.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-black transition-colors hover:bg-cyan-400"
                      >
                        {copy.actions.viewInsight}
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          {copy.sections.methodology}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {copy.methodology.map((item, index) => (
            <div
              key={item.title}
              className="rounded-xl border border-gray-800 bg-[#12121a] p-4"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-semibold text-cyan-300">
                {index + 1}
              </div>
              <h3 className="mt-3 text-sm font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProbabilityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "magenta";
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-3 text-xs">
        <span className="text-gray-500">{label}</span>
        <span className="font-mono text-gray-300">{value}%</span>
      </div>
      <ProgressBar value={value} color={color} size="sm" />
    </div>
  );
}
