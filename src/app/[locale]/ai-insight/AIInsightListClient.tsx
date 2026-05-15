"use client";

import { useState } from "react";
import Link from "next/link";
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
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { MatchStatus } from "@/types/common";

type FilterKey = "all" | "live" | "upcoming" | "highConfidence" | "upset";
type MatchResult = "W" | "D" | "L";

export type AIInsightListItem = {
  id: string;
  matchId: string;
  status: MatchStatus;
  league: {
    id: string;
    name: string;
    logo: string | null;
    round: string;
  };
  homeTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    shortName: string;
    logo: string | null;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  kickoffTime: string;
  confidenceScore: number | null;
  heatMeter: number | null;
  homeWinProbability: number | null;
  drawProbability: number | null;
  awayWinProbability: number | null;
  formComparison: {
    homeLastFive: MatchResult[];
    awayLastFive: MatchResult[];
  };
  keyFactors: string[];
  apiSummary: {
    events: number;
    statistics: number;
    lineups: number;
    playerStats: number;
    h2h: number;
  };
  upsetAlert: boolean;
  generatedAt: string;
};

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

export function AIInsightListClient({
  locale,
  insights,
  source,
}: {
  locale: string;
  insights: AIInsightListItem[];
  source: "api" | "empty";
}) {
  const copy = getAIInsightPageCopy(locale);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredInsights = insights.filter((insight) => {
    if (activeFilter === "live") return insight.status === MatchStatus.LIVE;
    if (activeFilter === "upcoming") return insight.status === MatchStatus.UPCOMING;
    if (activeFilter === "highConfidence") return (insight.confidenceScore ?? 0) >= 75;
    if (activeFilter === "upset") return insight.upsetAlert;
    return true;
  });

  const insightsWithConfidence = insights.filter(
    (insight) => typeof insight.confidenceScore === "number"
  );
  const averageConfidence =
    insightsWithConfidence.length > 0
      ? Math.round(
          insightsWithConfidence.reduce(
            (sum, insight) => sum + (insight.confidenceScore ?? 0),
            0
          ) / insightsWithConfidence.length
        )
      : null;
  const upsetCount = insights.filter((insight) => insight.upsetAlert).length;
  const apiDataPoints = insights.reduce(
    (sum, insight) =>
      sum +
      insight.apiSummary.events +
      insight.apiSummary.statistics +
      insight.apiSummary.lineups +
      insight.apiSummary.playerStats +
      insight.apiSummary.h2h,
    0
  );
  const featuredInsight = insights[0];

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
      value: insights.length.toLocaleString(localeMap[locale] ?? "th-TH"),
      icon: Brain,
      tone: "text-cyan-300",
    },
    {
      label: copy.stats.averageConfidence,
      value: averageConfidence === null ? "-" : `${averageConfidence}%`,
      icon: Gauge,
      tone: "text-green-300",
    },
    {
      label: copy.stats.upsetAlerts,
      value: upsetCount.toLocaleString(localeMap[locale] ?? "th-TH"),
      icon: ShieldAlert,
      tone: "text-red-300",
    },
    {
      label: "API data",
      value: apiDataPoints.toLocaleString(localeMap[locale] ?? "th-TH"),
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
            <p className="text-xs leading-5 text-gray-500">
              {copy.disclaimer}
              {source === "api" ? " Live API data." : ""}
            </p>
          </div>

          {featuredInsight && (
            <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-4 lg:w-80">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Badge variant="gold">{copy.labels.featured}</Badge>
                <Badge variant={statusBadge[featuredInsight.status]}>
                  {statusLabel[featuredInsight.status]}
                </Badge>
              </div>
              <TeamLine insight={featuredInsight} />
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">{copy.labels.confidence}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-cyan-300">
                    {formatMetric(featuredInsight.confidenceScore, "%")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">{copy.labels.heat}</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-amber-300">
                    {formatMetric(featuredInsight.heatMeter, "/10")}
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
                <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
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
                        <span className="inline-flex items-center gap-2">
                          <ApiLeagueLogo
                            name={insight.league.name}
                            logo={insight.league.logo}
                            size="xs"
                          />
                          <Badge variant="cyan">{insight.league.name}</Badge>
                        </span>
                        <Badge variant={statusBadge[insight.status]}>
                          {statusLabel[insight.status]}
                        </Badge>
                        {insight.upsetAlert && (
                          <Badge variant="red">
                            <AlertTriangle size={11} className="mr-1" />
                            {copy.labels.upsetAlert}
                          </Badge>
                        )}
                      </div>
                      <TeamLine insight={insight} />
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock size={13} />
                          {copy.labels.kickoff}:{" "}
                          {formatDateTime(insight.kickoffTime, locale)}
                        </span>
                        <span>{insight.league.round}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-2xl font-bold text-cyan-300">
                        {formatMetric(insight.confidenceScore, "%")}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {copy.labels.confidence}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <ProbabilityCard
                      label={copy.labels.homeWin}
                      value={insight.homeWinProbability}
                      color="cyan"
                    />
                    <ProbabilityCard
                      label={copy.labels.draw}
                      value={insight.drawProbability}
                      color="purple"
                    />
                    <ProbabilityCard
                      label={copy.labels.awayWin}
                      value={insight.awayWinProbability}
                      color="magenta"
                    />
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
                          {formatMetric(insight.heatMeter, "/10")}
                        </p>
                      </div>
                      <FormRow
                        teamId={insight.homeTeam.id}
                        label={insight.homeTeam.shortName}
                        results={insight.formComparison.homeLastFive}
                        tone="cyan"
                      />
                      <FormRow
                        teamId={insight.awayTeam.id}
                        label={insight.awayTeam.shortName}
                        results={insight.formComparison.awayLastFive}
                        tone="magenta"
                      />
                    </div>

                    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300">
                          <BarChart3 size={13} className="text-purple-300" />
                          API data
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <ApiDataCell label="Events" value={insight.apiSummary.events} />
                        <ApiDataCell label="Stats" value={insight.apiSummary.statistics} />
                        <ApiDataCell label="Lineups" value={insight.apiSummary.lineups} />
                        <ApiDataCell label="Players" value={insight.apiSummary.playerStats} />
                        <ApiDataCell label="H2H" value={insight.apiSummary.h2h} />
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
                        Real API coverage
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {insight.homeWinProbability === null
                          ? "No fixture statistics yet. Waiting for API data."
                          : "Probabilities are calculated only from API fixture statistics."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-gray-500">
                      {copy.labels.generated}:{" "}
                      {formatDateTime(insight.generatedAt, locale)}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/${locale}/predict/${insight.matchId}`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-cyan-500/50 hover:text-cyan-300"
                      >
                        {copy.actions.predictNow}
                      </Link>
                      <Link
                        href={`/${locale}/ai-insight/${insight.matchId}`}
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
              <h3 className="mt-3 text-sm font-semibold text-white">{item.title}</h3>
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

function TeamLine({ insight }: { insight: AIInsightListItem }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <TeamName name={insight.homeTeam.name} logo={insight.homeTeam.logo} align="left" />
      <span className="font-mono text-sm font-bold text-white">
        {insight.score.home === null
          ? "VS"
          : `${insight.score.home} - ${insight.score.away}`}
      </span>
      <TeamName name={insight.awayTeam.name} logo={insight.awayTeam.logo} align="right" />
    </div>
  );
}

function TeamName({
  name,
  logo,
  align,
}: {
  name: string;
  logo: string | null;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "right" ? "justify-end text-right" : ""
      }`}
    >
      {align === "left" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
      <span className="truncate text-sm font-semibold text-white">{name}</span>
      {align === "right" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
    </div>
  );
}

function ProbabilityCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: "cyan" | "purple" | "magenta";
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <p className="text-[11px] text-gray-500">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold text-white">
        {formatMetric(value, "%")}
      </p>
      <ProgressBar value={value ?? 0} color={color} size="sm" className="mt-2" />
    </div>
  );
}

function FormRow({
  teamId,
  label,
  results,
  tone,
}: {
  teamId: string;
  label: string;
  results: MatchResult[];
  tone: "cyan" | "magenta";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`truncate text-xs ${tone === "cyan" ? "text-cyan-300" : "text-magenta-300"}`}>
        {label}
      </span>
      <div className="flex gap-1">
        {results.map((result, index) => (
          <span
            key={`${teamId}-${index}`}
            className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold ${formTone(result)}`}
          >
            {result}
          </span>
        ))}
      </div>
    </div>
  );
}

function ApiDataCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded border border-gray-800 bg-black/20 px-2 py-1">
      <p className="font-mono text-sm font-semibold text-white">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function formatMetric(value: number | null, suffix: string) {
  return typeof value === "number" ? `${value}${suffix}` : "-";
}

function formatDateTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(localeMap[locale] ?? "th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Bangkok",
  }).format(new Date(value));
}

function formTone(result: MatchResult) {
  if (result === "W") return "bg-green-500/15 text-green-300";
  if (result === "D") return "bg-amber-500/15 text-amber-300";
  return "bg-red-500/15 text-red-300";
}
