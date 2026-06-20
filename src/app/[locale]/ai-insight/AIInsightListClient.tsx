"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, AlertTriangle, Brain, Calendar, ChevronLeft, ChevronRight, Eye, Flame, Gauge, Goal, Search, ShieldAlert, Sparkles, Target, Users } from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import type { ApiFootballPredictedScore } from "@/lib/api-football";
import { MatchStatus } from "@/types/common";

type FilterKey = "all" | "live" | "highConfidence" | "upsetAlert";

type AIInsightPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type AIInsightQuery = {
  date?: string;
  league?: string;
  page: number;
  limit: number;
};

export type AIInsightListItem = {
  id: string;
  categories: Array<"live" | "highConfidence" | "upsetAlert">;
  matchId: string;
  status: MatchStatus;
  viewCount: number;
  league: {
    id: string;
    name: string;
    logo: string | null;
    countryFlag: string | null;
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
  statusText: string;
  elapsed: number | null;
  confidenceScore: number | null;
  heatMeter: number | null;
  favoriteTeam: "home" | "away" | null;
  homeStrength: number | null;
  awayStrength: number | null;
  strengthGap: number | null;
  upsetRisk: number | null;
  homeWinProbability: number | null;
  drawProbability: number | null;
  awayWinProbability: number | null;
  formComparison: {
    homeLastFive: Array<"W" | "D" | "L">;
    awayLastFive: Array<"W" | "D" | "L">;
  };
  keyFactors: string[];
  apiSummary: {
    probabilities: number;
    communityVotes: number;
    keyFactors: number;
    advice: number;
    winner: number;
  };
  apiAdvice: string | null;
  apiWinner: string | null;
  predictedScore: ApiFootballPredictedScore | null;
  upsetAlert: boolean;
  generatedAt: string;
  standings: {
    home: { rank: number | null; points: number | null; form: string | null } | null;
    away: { rank: number | null; points: number | null; form: string | null } | null;
  } | null;
  h2h: {
    totalMatches: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    avgGoals: number;
  } | null;
};

const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

export function AIInsightListClient({
  locale,
  insights,
  source,
  pagination,
  query,
}: {
  locale: string;
  insights: AIInsightListItem[];
  source: "api" | "empty" | "error";
  pagination: AIInsightPagination | null;
  query: AIInsightQuery;
}) {
  const copy = getAIInsightPageCopy(locale);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const counts = {
    all: insights.length,
    live: insights.filter((insight) => insight.categories.includes("live")).length,
    highConfidence: insights.filter((insight) => insight.categories.includes("highConfidence")).length,
    upsetAlert: insights.filter((insight) => insight.categories.includes("upsetAlert")).length,
  };

  const filteredByCategory = activeFilter === "all"
    ? insights
    : insights.filter((insight) => insight.categories.includes(activeFilter));
  const normalizedSearch = search.trim().toLocaleLowerCase(localeMap[locale] ?? "th-TH");
  const filteredInsights = normalizedSearch
    ? filteredByCategory.filter((insight) => doesInsightMatchSearch(insight, normalizedSearch, locale))
    : filteredByCategory;

  const groupedInsights = groupInsightsByDay(filteredInsights, locale);
  const pageHref = (page: number) => buildAIInsightPageHref(locale, query, page);
  const todayHref = buildAIInsightTodayHref(locale, query);

  const tabs: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: "all", label: copy.filters.all, count: counts.all },
    { key: "live", label: copy.filters.live, count: counts.live },
    {
      key: "highConfidence",
      label: copy.filters.highConfidence,
      count: counts.highConfidence,
    },
    { key: "upsetAlert", label: copy.filters.upset, count: counts.upsetAlert },
  ];
  const featuredInsight =
    insights.find((insight) => insight.categories.includes("highConfidence")) ??
    insights.find((insight) => insight.status === MatchStatus.LIVE) ??
    insights[0];
  const communityVotes = insights.reduce(
    (sum, insight) => sum + insight.apiSummary.communityVotes,
    0
  );
  const totalViews = insights.reduce(
    (sum, insight) => sum + (insight.viewCount ?? 0),
    0
  );
  const confidenceValues = insights
    .map((insight) => insight.confidenceScore)
    .filter((value): value is number => typeof value === "number");
  const averageConfidence =
    confidenceValues.length > 0
      ? Math.round(
          confidenceValues.reduce((sum, value) => sum + value, 0) /
            confidenceValues.length
        )
      : null;
  const heroStats = [
    { label: copy.stats.analyzedMatches, value: String(counts.all), icon: Brain, tone: "text-cyan-400" },
    {
      label: copy.filters.live,
      value: String(counts.live),
      icon: Sparkles,
      tone: "text-green-400",
    },
    {
      label: copy.filters.highConfidence,
      value: String(counts.highConfidence),
      icon: Gauge,
      tone: "text-cyan-400",
    },
    {
      label: copy.stats.averageConfidence,
      value: formatPercentMetric(averageConfidence),
      icon: Target,
      tone: "text-green-400",
    },
    { label: copy.stats.upsetAlerts, value: String(counts.upsetAlert), icon: ShieldAlert, tone: "text-magenta" },
    {
      label: copy.stats.communityVotes,
      value: communityVotes.toLocaleString(localeMap[locale] ?? "th-TH"),
      icon: Users,
      tone: "text-amber-400",
    },
    {
      label: copy.stats.views,
      value: totalViews.toLocaleString(localeMap[locale] ?? "th-TH"),
      icon: Eye,
      tone: "text-cyan-300",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl pb-8">
      <section className="px-3 pt-3">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#07080b] shadow-[0_0_40px_rgba(34,211,238,0.05)]">
          <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-magenta" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_85%_12%,rgba(225,29,72,0.12),transparent_28%)]" />

          <div className="relative grid gap-5 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch">
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  <Sparkles size={14} />
                  {copy.sections.modelSummary}
                </div>
                <h1 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {copy.title}
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
                  {copy.subtitle}
                </p>
                <p className="mt-3 max-w-2xl rounded-xl border border-amber-500/15 bg-amber-500/5 px-3 py-2 text-sm leading-6 text-amber-100/80">
                  {copy.disclaimer}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {heroStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-xl border border-gray-800 bg-black/35 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
                        <Icon size={17} className={stat.tone} />
                      </div>
                      <p className="mt-2 font-mono text-2xl font-black text-white">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {featuredInsight ? (
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/25 bg-black/55 p-4 shadow-[0_0_26px_rgba(34,211,238,0.08)]">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-400 via-amber-400 to-magenta" />
                <div className="mb-4 flex items-center justify-between gap-2">
                  <Badge variant="gold" size="md">{copy.labels.featured}</Badge>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <ViewCountBadge
                      viewCount={featuredInsight.viewCount}
                      locale={locale}
                      copy={copy}
                    />
                    <span className="rounded-full border border-gray-800 bg-[#10121a] px-2.5 py-1 font-mono text-xs font-bold text-slate-400">
                      {formatMatchMoment(featuredInsight, locale)}
                    </span>
                  </div>
                </div>

                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-400">
                  <ApiLeagueLogo name={featuredInsight.league.name} logo={featuredInsight.league.logo} size="xs" />
                  <span className="min-w-0 truncate">{featuredInsight.league.name}</span>
                  <StatusBadge insight={featuredInsight} copy={copy} />
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_112px_minmax(0,1fr)] items-center gap-3">
                  <TeamSide
                    name={featuredInsight.homeTeam.name}
                    logo={featuredInsight.homeTeam.logo}
                    favorite={featuredInsight.favoriteTeam === "home"}
                  />
                  <ScoreBlock insight={featuredInsight} copy={copy} featured />
                  <TeamSide
                    name={featuredInsight.awayTeam.name}
                    logo={featuredInsight.awayTeam.logo}
                    favorite={featuredInsight.favoriteTeam === "away"}
                    align="right"
                  />
                </div>

                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  <HeroSignalTile
                    label={copy.labels.likelyScore}
                    value={formatScorePrediction(featuredInsight.predictedScore) ?? "-"}
                    icon={Goal}
                    tone="text-cyan-200"
                  />
                  <HeroSignalTile
                    label={copy.labels.confidence}
                    value={formatPercentMetric(featuredInsight.confidenceScore)}
                    icon={Gauge}
                    tone="text-cyan-300"
                  />
                  {featuredInsight.predictedScore ? null : (
                    <HeroSignalTile
                      label={copy.labels.heat}
                      value={formatHeatMetric(resolveHeatValue(featuredInsight))}
                      icon={Flame}
                      tone="text-amber-300"
                    />
                  )}
                </div>

                <div className="mt-3 rounded-xl border border-gray-800 bg-[#0b0d13] px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">{copy.labels.keyFactors}</span>
                    <span className="min-w-0 truncate text-right font-semibold text-slate-200">
                      {featuredInsight.keyFactors[0] ?? featuredInsight.apiAdvice ?? featuredInsight.apiWinner ?? "-"}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">{copy.labels.predictedConfidence}</span>
                    <span className="font-mono font-semibold text-cyan-200">
                      {formatPercentMetric(featuredInsight.predictedScore?.confidence ?? null)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">{copy.labels.community}</span>
                    <span className="font-mono font-semibold text-slate-300">
                      {featuredInsight.apiSummary.communityVotes.toLocaleString(
                        localeMap[locale] ?? "th-TH"
                      )}{" "}
                      {copy.labels.votes}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-20 border-b border-gray-800/70 bg-[#07080b]/95 px-3 py-2 backdrop-blur md:top-[72px]">
        <div className="rounded-xl border border-gray-800 bg-[#10121a] p-1.5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
          <div className="mb-1.5 flex items-center justify-between gap-3 px-2 pt-1">
            <p className="truncate text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
              {copy.sections.matchInsights}
            </p>
            <span className="shrink-0 text-xs text-gray-500">
              {source === "api" ? copy.labels.generated : copy.sections.modelSummary}
            </span>
          </div>

          <div className="mb-2 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto]">
            <label className="flex items-center gap-2 rounded-lg border border-gray-800 bg-black/25 px-3 py-2 text-sm text-slate-300 focus-within:border-cyan-400/45 focus-within:bg-cyan-500/[0.04]">
              <Search size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="sr-only">{copy.labels.search}</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={copy.labels.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-600"
              />
            </label>

            <form
              action={`/${locale}/ai-insight`}
              method="get"
              className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-800 bg-black/25 px-2 py-2"
            >
              <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-gray-800 bg-[#10121a] px-2 py-1.5 text-sm text-slate-300 sm:flex-none">
                <Calendar size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
                <span className="sr-only">{copy.labels.date}</span>
                <input
                  type="date"
                  name="date"
                  defaultValue={query.date ?? ""}
                  max={getBangkokTodayDate()}
                  className="min-w-[9.25rem] bg-transparent font-mono text-sm font-bold text-slate-100 outline-none [color-scheme:dark]"
                />
              </label>
              {query.league ? <input type="hidden" name="league" value={query.league} /> : null}
              {query.limit !== 20 ? <input type="hidden" name="limit" value={query.limit} /> : null}
              <button
                type="submit"
                className="rounded-md border border-cyan-400/25 bg-cyan-500/15 px-3 py-2 text-sm font-black text-cyan-100 transition-colors hover:bg-cyan-500/25"
              >
                {copy.labels.chooseDate}
              </button>
              <Link
                href={todayHref}
                className="rounded-md border border-gray-700 px-3 py-2 text-sm font-black text-slate-300 transition-colors hover:border-cyan-400/35 hover:text-cyan-100"
              >
                {copy.labels.today}
              </Link>
            </form>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveFilter(tab.key)}
                className={`min-w-0 rounded-lg px-2 py-3 text-center text-sm font-bold transition-colors ${
                  activeFilter === tab.key
                    ? "border border-cyan-400/30 bg-cyan-500/15 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.1)]"
                    : "border border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <span className="block truncate">{tab.label}</span>
                <span className="mt-0.5 block font-mono text-xs text-gray-500">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-3 py-4">
        {filteredInsights.length === 0 ? (
          <EmptyState
            title={source === "error" ? copy.error.title : copy.empty.title}
            description={source === "error" ? copy.error.description : copy.empty.description}
            icon={<AlertTriangle size={40} />}
            className="rounded-2xl border border-gray-800 bg-[#10121a]"
          />
        ) : (
          groupedInsights.map((group) => (
            <div key={group.key} className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-0.5">
                <Calendar size={16} className="shrink-0 text-cyan-400" />
                <span className="text-base font-bold text-slate-100" suppressHydrationWarning>{group.label}</span>
                <span className="font-mono text-xs text-slate-500">({group.items.length})</span>
                <span className="ml-2 h-px flex-1 bg-gray-800" />
              </div>
              {group.items.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  locale={locale}
                  copy={copy}
                />
              ))}
            </div>
          ))
        )}
      </div>

      {pagination ? (
        <PaginationControls
          pagination={pagination}
          locale={locale}
          prevHref={pageHref(Math.max(pagination.page - 1, 1))}
          nextHref={pageHref(Math.min(pagination.page + 1, pagination.totalPages))}
        />
      ) : null}
    </div>
  );
}

function PaginationControls({
  pagination,
  locale,
  prevHref,
  nextHref,
}: {
  pagination: AIInsightPagination;
  locale: string;
  prevHref: string;
  nextHref: string;
}) {
  const localeCode = localeMap[locale] ?? "th-TH";
  const totalPages = Math.max(pagination.totalPages, 1);
  const currentPage = Math.min(Math.max(pagination.page, 1), totalPages);
  const start = pagination.total > 0 ? (currentPage - 1) * pagination.limit + 1 : 0;
  const end = Math.min(currentPage * pagination.limit, pagination.total);
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="mx-3 flex flex-col gap-3 rounded-2xl border border-gray-800 bg-[#10121a] p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="font-mono text-sm font-bold text-slate-400">
        <span className="text-cyan-200">
          {start.toLocaleString(localeCode)}-{end.toLocaleString(localeCode)}
        </span>
        <span className="mx-2 text-slate-600">/</span>
        <span>{pagination.total.toLocaleString(localeCode)}</span>
      </div>

      <div className="flex items-center gap-2">
        {canPrev ? (
          <Link
            href={prevHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-black/25 text-slate-200 transition-colors hover:border-cyan-400/45 hover:text-cyan-200"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </Link>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-black/15 text-slate-700">
            <ChevronLeft size={18} />
          </span>
        )}
        <span className="min-w-20 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-center font-mono text-sm font-black text-cyan-100">
          {currentPage.toLocaleString(localeCode)} / {totalPages.toLocaleString(localeCode)}
        </span>
        {canNext ? (
          <Link
            href={nextHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-black/25 text-slate-200 transition-colors hover:border-cyan-400/45 hover:text-cyan-200"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </Link>
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-800 bg-black/15 text-slate-700">
            <ChevronRight size={18} />
          </span>
        )}
      </div>
    </div>
  );
}

function InsightCard({
  insight,
  locale,
  copy,
}: {
  insight: AIInsightListItem;
  locale: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const primaryNote = insight.keyFactors[0] ?? insight.apiAdvice ?? insight.apiWinner ?? "-";
  const cardTone = insight.upsetAlert
    ? "border-magenta/30 shadow-[0_0_26px_rgba(225,29,72,0.07)]"
    : insight.status === MatchStatus.LIVE
      ? "border-green-500/25 shadow-[0_0_26px_rgba(34,197,94,0.06)]"
      : "border-cyan-500/20 shadow-[0_0_26px_rgba(34,211,238,0.05)]";

  return (
    <Card
      hover
      neon={insight.upsetAlert ? "magenta" : insight.status === MatchStatus.LIVE ? "green" : "cyan"}
      className={`overflow-hidden p-0 bg-[#0b0d13] ${cardTone}`}
    >
      <Link
        href={`/${locale}/ai-insight/${insight.matchId}`}
        className="block rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
      >
        <div className="border-b border-gray-800/80 bg-black/25 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <ApiLeagueLogo
              name={insight.league.name}
              logo={insight.league.logo}
              size="xs"
            />
            <span className="min-w-0 flex-1 truncate font-semibold">{insight.league.name}</span>
            <StatusBadge insight={insight} copy={copy} />
            <ViewCountBadge viewCount={insight.viewCount} locale={locale} copy={copy} />
            <span className="rounded-full border border-gray-800 bg-[#10121a] px-2.5 py-1 font-mono text-xs font-bold text-slate-500">
              {formatMatchMoment(insight, locale)}
            </span>
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_104px_minmax(0,1fr)] items-center gap-3">
            <TeamSide
              name={insight.homeTeam.name}
              logo={insight.homeTeam.logo}
              favorite={insight.favoriteTeam === "home"}
            />
            <ScoreBlock insight={insight} copy={copy} />
            <TeamSide
              name={insight.awayTeam.name}
              logo={insight.awayTeam.logo}
              favorite={insight.favoriteTeam === "away"}
              align="right"
            />
          </div>

          <div className="mt-4 rounded-xl border border-gray-800/80 bg-black/35 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">
                <Activity size={14} />
                {copy.sections.modelSummary}
              </div>
              <span className="font-mono text-xs text-slate-500">
                {copy.labels.confidence} {formatPercentMetric(insight.confidenceScore)}
              </span>
            </div>
            {hasStrengthData(insight) ? (
              <StrengthRow insight={insight} />
            ) : null}
            {hasProbabilityData(insight) ? (
              <ProbabilityRow insight={insight} copy={copy} />
            ) : null}
            {formatScorePrediction(insight.predictedScore) ? (
              <PredictedScoreRow predictedScore={insight.predictedScore} copy={copy} />
            ) : null}
            {hasHeatData(insight) ? (
              <HeatRow insight={insight} copy={copy} />
            ) : null}
            {!hasStrengthData(insight) && !hasProbabilityData(insight) && !hasHeatData(insight) ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-500">{copy.sections.modelSummary}</span>
                <span className="text-slate-300">-</span>
              </div>
            ) : null}
          </div>

          {hasStandingsOrH2H(insight) ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {hasStandings(insight) ? (
                <StandingsRow insight={insight} copy={copy} />
              ) : null}
              {insight.h2h && insight.h2h.totalMatches > 0 ? (
                <H2HRow h2h={insight.h2h} copy={copy} />
              ) : null}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="cyan" size="md">
              {`${copy.labels.confidence} ${formatPercentMetric(insight.confidenceScore)}`}
            </Badge>

            {insight.categories.includes("upsetAlert") ? (
              <Badge variant="magenta" size="md" className="border-magenta/25 bg-magenta/10 text-magenta">
                {copy.labels.upsetAlert}
                {typeof insight.upsetRisk === "number" ? ` ${Math.round(insight.upsetRisk)}%` : ""}
              </Badge>
            ) : null}

            {insight.categories.includes("highConfidence") ? (
              <Badge variant="green" size="md">{copy.filters.highConfidence}</Badge>
            ) : null}

            {insight.favoriteTeam ? (
              <Badge variant="gold" size="md">
                {insight.favoriteTeam === "home" ? insight.homeTeam.name : insight.awayTeam.name}
              </Badge>
            ) : null}
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-gray-800 bg-[#10121a] px-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                {copy.labels.keyFactors}
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-200">{primaryNote}</p>
            </div>
            <ChevronRight size={18} className="shrink-0 text-cyan-400" />
          </div>
        </div>
      </Link>
    </Card>
  );
}

function ViewCountBadge({
  viewCount,
  locale,
  copy,
}: {
  viewCount: number;
  locale: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 font-mono text-xs font-bold text-cyan-200">
      <Eye size={13} />
      {viewCount.toLocaleString(localeMap[locale] ?? "th-TH")} {copy.labels.views}
    </span>
  );
}

function doesInsightMatchSearch(
  insight: AIInsightListItem,
  normalizedSearch: string,
  locale: string
) {
  const haystack = [
    insight.homeTeam.name,
    insight.homeTeam.shortName,
    insight.awayTeam.name,
    insight.awayTeam.shortName,
    insight.league.name,
    insight.statusText,
    insight.apiAdvice,
    insight.apiWinner,
    ...insight.keyFactors,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase(localeMap[locale] ?? "th-TH");

  return haystack.includes(normalizedSearch);
}

function buildAIInsightPageHref(
  locale: string,
  query: AIInsightQuery,
  page: number
) {
  const params = new URLSearchParams();
  if (query.date) params.set("date", query.date);
  if (query.league) params.set("league", query.league);
  if (query.limit !== 20) params.set("limit", String(query.limit));
  if (page > 1) params.set("page", String(page));

  const queryString = params.toString();
  return `/${locale}/ai-insight${queryString ? `?${queryString}` : ""}`;
}

function buildAIInsightTodayHref(locale: string, query: AIInsightQuery) {
  const params = new URLSearchParams();
  if (query.league) params.set("league", query.league);
  if (query.limit !== 20) params.set("limit", String(query.limit));

  const queryString = params.toString();
  return `/${locale}/ai-insight${queryString ? `?${queryString}` : ""}`;
}

function getBangkokTodayDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function HeroSignalTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Gauge;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#10121a] px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-400">{label}</p>
        <Icon size={15} className={tone} />
      </div>
      <p className={`mt-1 font-mono text-xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function TeamSide({
  name,
  logo,
  favorite,
  align = "left",
}: {
  name: string;
  logo: string | null;
  favorite: boolean;
  align?: "left" | "right";
}) {
  const isRight = align === "right";

  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${isRight ? "flex-row-reverse text-right" : ""}`}
    >
      <ApiTeamLogo name={name} logo={logo} size="md" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-bold text-slate-100">{name}</p>
      </div>
      {favorite ? <span className="shrink-0 text-[12px] text-amber-400">★</span> : null}
    </div>
  );
}

function ScoreBlock({
  insight,
  copy,
  featured = false,
}: {
  insight: AIInsightListItem;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  featured?: boolean;
}) {
  const hasScore = insight.score.home !== null && insight.score.away !== null;
  const predictedScore = formatScorePrediction(insight.predictedScore);

  return (
    <div className="text-center">
      <div
        className={`rounded-xl border border-cyan-500/20 bg-black/55 px-3 py-2 font-mono font-black text-white shadow-[inset_0_0_14px_rgba(34,211,238,0.08)] ${
          featured ? "text-3xl" : "text-xl"
        }`}
      >
        {hasScore ? `${insight.score.home} - ${insight.score.away}` : "vs"}
      </div>
      {insight.status === MatchStatus.LIVE && insight.elapsed !== null ? (
        <div className="mt-1 font-mono text-xs font-bold text-green-400">{`${insight.elapsed}'`}</div>
      ) : null}
      {predictedScore ? (
        <div className="mt-2 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.075] px-2 py-1.5 shadow-[0_0_22px_rgba(34,211,238,0.08)]">
          <p className="whitespace-nowrap text-[9px] font-black uppercase tracking-[0.06em] text-cyan-200">
            {copy.labels.likelyScore}
          </p>
          <p className={`font-mono font-black text-cyan-100 ${featured ? "text-xl" : "text-base"}`}>
            {predictedScore}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function StrengthRow({ insight }: { insight: AIInsightListItem }) {
  const homeStrength = clampPercent(insight.homeStrength ?? 0);
  const awayStrength = clampPercent(insight.awayStrength ?? 0);
  const gap =
    typeof insight.strengthGap === "number"
      ? Math.round(insight.strengthGap)
      : "-";

  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="w-[30px] text-center font-mono text-sm font-bold text-cyan-400">
        {homeStrength}
      </div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
          style={{ width: `${homeStrength}%` }}
        />
      </div>
      <div className="w-[34px] text-center font-mono text-xs text-slate-500">{gap}</div>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
        <div
          className="ml-auto h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.22)]"
          style={{ width: `${awayStrength}%` }}
        />
      </div>
      <div className="w-[30px] text-center font-mono text-sm font-bold text-violet-300">
        {awayStrength}
      </div>
    </div>
  );
}

function ProbabilityRow({
  insight,
  copy,
}: {
  insight: AIInsightListItem;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const home = clampPercent(Math.round(insight.homeWinProbability ?? 0));
  const draw = clampPercent(Math.round(insight.drawProbability ?? 0));
  const away = clampPercent(Math.round(insight.awayWinProbability ?? 0));

  return (
    <div className="mb-2 rounded-xl border border-cyan-300/10 bg-[#050b13]/75 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-semibold text-slate-400">
        <span>{copy.sections.modelSummary}</span>
        <span className="font-mono text-cyan-200">{formatPercentMetric(insight.confidenceScore)}</span>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/[0.04]">
        <div
          className="bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500"
          style={{ width: `${home}%` }}
        />
        <div
          className="bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-500"
          style={{ width: `${draw}%` }}
        />
        <div
          className="bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
          style={{ width: `${away}%` }}
        />
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
        <ProbabilityLegend label={copy.labels.homeWin} value={home} dot="bg-cyan-300" tone="text-cyan-200" />
        <ProbabilityLegend label={copy.labels.draw} value={draw} dot="bg-amber-300" tone="text-amber-300" bordered />
        <ProbabilityLegend label={copy.labels.awayWin} value={away} dot="bg-violet-400" tone="text-violet-300" />
      </div>
    </div>
  );
}

function ProbabilityLegend({
  label,
  value,
  dot,
  tone,
  bordered = false,
}: {
  label: string;
  value: number;
  dot: string;
  tone: string;
  bordered?: boolean;
}) {
  return (
    <div className={`flex min-w-0 flex-col items-center ${bordered ? "border-x border-cyan-300/10" : ""}`}>
      <span className="flex max-w-full items-center gap-1.5 truncate text-[11px] font-semibold text-slate-300">
        <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span className="truncate">{label}</span>
      </span>
      <span className={`mt-0.5 font-mono text-[10px] font-bold ${tone}`}>{value}%</span>
    </div>
  );
}

function HeatRow({
  insight,
  copy,
}: {
  insight: AIInsightListItem;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const heat = resolveHeatValue(insight) ?? 0;
  const heatTone =
    heat >= 90
      ? "bg-gradient-to-r from-rose-500 to-red-500"
      : heat >= 75
        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
        : heat >= 50
        ? "bg-gradient-to-r from-amber-300 to-orange-400"
        : heat >= 25
          ? "bg-gradient-to-r from-cyan-400 to-cyan-300"
        : "bg-gradient-to-r from-cyan-400 to-cyan-300";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-cyan-300/10 bg-[#050b13]/65 px-3 py-2">
      <span className="w-[176px] shrink-0 text-left text-xs font-bold leading-snug text-cyan-100 sm:w-[220px]">
        {getHeatLabel(heat, copy)}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${heatTone}`}
          style={{ width: `${heat}%` }}
        />
      </div>
      <span className="w-[40px] text-right font-mono text-sm font-bold text-slate-300">
        {heat}
      </span>
    </div>
  );
}

function StatusBadge({
  insight,
  copy,
}: {
  insight: AIInsightListItem;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const { variant, label, live } = getStatusBadge(insight, copy);

  return (
    <Badge variant={variant} className="shrink-0 gap-1">
      {live ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
      ) : null}
      {label}
    </Badge>
  );
}

function getStatusBadge(
  insight: AIInsightListItem,
  copy: ReturnType<typeof getAIInsightPageCopy>
): { variant: "green" | "cyan" | "default" | "gold" | "red"; label: string; live: boolean } {
  switch (insight.status) {
    case MatchStatus.LIVE:
      return { variant: "green", label: copy.labels.live, live: true };
    case MatchStatus.FINISHED:
      return { variant: "default", label: copy.labels.finished, live: false };
    case MatchStatus.POSTPONED:
      return { variant: "gold", label: copy.labels.postponed, live: false };
    case MatchStatus.CANCELLED:
      return { variant: "red", label: copy.labels.cancelled, live: false };
    default:
      return { variant: "cyan", label: copy.labels.upcoming, live: false };
  }
}

function StandingsRow({
  insight,
  copy,
}: {
  insight: AIInsightListItem;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const home = insight.standings?.home;
  const away = insight.standings?.away;

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-gray-800 bg-[#12121a] px-2 py-1">
      <span className="text-slate-500">{copy.labels.rank}</span>
      <span className="font-semibold text-cyan-400">{formatStanding(home)}</span>
      <span className="text-slate-600">vs</span>
      <span className="font-semibold text-magenta">{formatStanding(away)}</span>
    </div>
  );
}

function H2HRow({
  h2h,
  copy,
}: {
  h2h: NonNullable<AIInsightListItem["h2h"]>;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-gray-800 bg-[#12121a] px-2 py-1">
      <span className="text-slate-500">{copy.labels.h2h}</span>
      <span className="font-semibold text-cyan-400">{h2h.homeWins}</span>
      <span className="text-slate-600">-</span>
      <span className="font-semibold text-amber-400">{h2h.draws}</span>
      <span className="text-slate-600">-</span>
      <span className="font-semibold text-magenta">{h2h.awayWins}</span>
      {h2h.avgGoals > 0 ? (
        <span className="ml-1 text-slate-500">{`⚽ ${h2h.avgGoals.toFixed(1)}`}</span>
      ) : null}
    </div>
  );
}

function PredictedScoreRow({
  predictedScore,
  copy,
}: {
  predictedScore: ApiFootballPredictedScore | null;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  if (!predictedScore) return null;
  const score = formatScorePrediction(predictedScore);
  if (!score) return null;

  return (
    <div className="mb-2 rounded-xl border border-cyan-300/18 bg-cyan-300/[0.055] px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
      <div className="grid grid-cols-3 gap-1.5 text-[11px]">
        <PredictedScoreMeta label={copy.labels.predictedSource} value={formatSource(predictedScore.source)} />
        <PredictedScoreMeta
          label={copy.labels.predictedConfidence}
          value={formatPercentMetric(predictedScore.confidence ?? null)}
        />
        <PredictedScoreMeta
          label={copy.labels.expectedGoals}
          value={formatExpectedGoals(predictedScore.raw)}
        />
      </div>
    </div>
  );
}

function PredictedScoreMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-cyan-300/10 bg-[#050b13]/75 px-2 py-1.5">
      <p className="truncate text-slate-500">{label}</p>
      <p className="mt-0.5 truncate font-mono font-bold text-slate-200">{value}</p>
    </div>
  );
}

function formatStanding(
  standing: { rank: number | null; points: number | null } | null | undefined
) {
  if (!standing || typeof standing.rank !== "number") return "-";
  const points = typeof standing.points === "number" ? ` (${standing.points})` : "";
  return `#${standing.rank}${points}`;
}

function hasStandings(insight: AIInsightListItem) {
  return (
    typeof insight.standings?.home?.rank === "number" ||
    typeof insight.standings?.away?.rank === "number"
  );
}

function hasStandingsOrH2H(insight: AIInsightListItem) {
  return hasStandings(insight) || (insight.h2h != null && insight.h2h.totalMatches > 0);
}

function formatMatchMoment(insight: AIInsightListItem, locale: string) {
  if (insight.status === MatchStatus.LIVE) {
    return insight.elapsed !== null ? `${insight.elapsed}'` : "LIVE";
  }
  if (insight.status === MatchStatus.FINISHED) {
    return "FT";
  }
  return formatKickoffTime(insight.kickoffTime, locale);
}

function formatKickoffTime(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeMap[locale] ?? "th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatScorePrediction(
  value: ApiFootballPredictedScore | null
) {
  if (!value) return null;
  const home = formatPredictedGoalValue(value.home);
  const away = formatPredictedGoalValue(value.away);
  if (home === null && away === null) return null;
  return `${home ?? "?"} - ${away ?? "?"}`;
}

function formatSource(value: string | null | undefined) {
  if (!value) return "-";
  return value.replaceAll("_", " ");
}

function formatExpectedGoals(value: ApiFootballPredictedScore["raw"]) {
  const home = formatDecimalMetric(value?.homeXg);
  const away = formatDecimalMetric(value?.awayXg);
  if (home === "-" && away === "-") return "-";
  return `${home} / ${away}`;
}

function formatDecimalMetric(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(2) : "-";
}

function formatPredictedGoalValue(value: number | string | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDayLabel(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(localeMap[locale] ?? "th-TH", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function groupInsightsByDay(insights: AIInsightListItem[], locale: string) {
  const groups = new Map<string, { key: string; label: string; sortAt: number; items: AIInsightListItem[] }>();

  for (const insight of insights) {
    const date = new Date(insight.kickoffTime);
    const valid = !Number.isNaN(date.getTime());
    const key = valid ? dayKey(date) : "unknown";
    let group = groups.get(key);
    if (!group) {
      group = {
        key,
        label: valid ? formatDayLabel(insight.kickoffTime, locale) : "-",
        sortAt: valid ? new Date(key).getTime() : Number.POSITIVE_INFINITY,
        items: [],
      };
      groups.set(key, group);
    }
    group.items.push(insight);
  }

  const sorted = [...groups.values()].sort((a, b) => a.sortAt - b.sortAt);
  for (const group of sorted) {
    group.items.sort((a, b) => {
      const aTime = new Date(a.kickoffTime).getTime();
      const bTime = new Date(b.kickoffTime).getTime();
      const aValid = Number.isNaN(aTime) ? Number.POSITIVE_INFINITY : aTime;
      const bValid = Number.isNaN(bTime) ? Number.POSITIVE_INFINITY : bTime;
      return aValid - bValid;
    });
  }

  return sorted;
}

function getHeatLabel(
  heat: number,
  copy: ReturnType<typeof getAIInsightPageCopy>
) {
  if (heat >= 90) return copy.labels.heatVeryHigh;
  if (heat >= 75) return copy.labels.heatHigh;
  if (heat >= 50) return copy.labels.heatMid;
  if (heat >= 25) return copy.labels.heatLow;
  return copy.labels.heatVeryLow;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function hasStrengthData(insight: AIInsightListItem) {
  return (
    typeof insight.homeStrength === "number" &&
    typeof insight.awayStrength === "number"
  );
}

function hasProbabilityData(insight: AIInsightListItem) {
  return (
    typeof insight.homeWinProbability === "number" ||
    typeof insight.drawProbability === "number" ||
    typeof insight.awayWinProbability === "number"
  );
}

function hasHeatData(insight: AIInsightListItem) {
  return resolveHeatValue(insight) !== null;
}

function normalizeHeat(value: number) {
  return clampPercent(value <= 10 ? Math.round(value * 10) : Math.round(value));
}

function resolveHeatValue(insight: AIInsightListItem) {
  if (
    typeof insight.homeStrength === "number" &&
    typeof insight.awayStrength === "number"
  ) {
    return clampPercent(
      Math.round(
        100 -
          Math.abs(
            clampPercent(insight.homeStrength) - clampPercent(insight.awayStrength)
          )
      )
    );
  }

  return typeof insight.heatMeter === "number" ? normalizeHeat(insight.heatMeter) : null;
}

function formatPercentMetric(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)}%` : "-";
}

function formatHeatMetric(value: number | null) {
  if (typeof value !== "number") return "-";
  return `${Math.round(value)}/100`;
}
