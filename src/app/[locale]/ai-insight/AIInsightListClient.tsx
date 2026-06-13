"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Brain, Calendar, ChevronRight, Flame, Gauge, ShieldAlert, Sparkles, Users } from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { MatchStatus } from "@/types/common";

type FilterKey = "all" | "live" | "highConfidence" | "upsetAlert";

export type AIInsightListItem = {
  id: string;
  categories: Array<"live" | "highConfidence" | "upsetAlert">;
  matchId: string;
  status: MatchStatus;
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
}: {
  locale: string;
  insights: AIInsightListItem[];
  source: "api" | "empty" | "error";
}) {
  const copy = getAIInsightPageCopy(locale);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const counts = {
    all: insights.length,
    live: insights.filter((insight) => insight.categories.includes("live")).length,
    highConfidence: insights.filter((insight) => insight.categories.includes("highConfidence")).length,
    upsetAlert: insights.filter((insight) => insight.categories.includes("upsetAlert")).length,
  };

  const filteredInsights = activeFilter === "all"
    ? insights
    : insights.filter((insight) => insight.categories.includes(activeFilter));

  const groupedInsights = groupInsightsByDay(filteredInsights, locale);

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
    { label: copy.stats.upsetAlerts, value: String(counts.upsetAlert), icon: ShieldAlert, tone: "text-magenta" },
    {
      label: copy.stats.communityVotes,
      value: communityVotes.toLocaleString(localeMap[locale] ?? "th-TH"),
      icon: Users,
      tone: "text-amber-400",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl pb-6">
      <section className="px-3 pt-3">
        <div className="overflow-hidden rounded-2xl border border-gray-800 bg-[#12121a]">
          <div className="relative border-b border-gray-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_36%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.12),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  <Sparkles size={14} />
                  {copy.sections.modelSummary}
                </div>
                <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                  {copy.title}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  {copy.subtitle}
                </p>
                <p className="mt-2 text-sm text-slate-500">{copy.disclaimer}</p>
              </div>

              {featuredInsight ? (
                <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#0a0a0f]/90 p-4 shadow-[0_0_24px_rgba(34,211,238,0.06)]">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Badge variant="gold">{copy.labels.featured}</Badge>
                    <span className="text-sm text-slate-500">
                      {formatMatchMoment(featuredInsight, locale)}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-slate-500">{featuredInsight.league.name}</p>
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <TeamSide
                      name={featuredInsight.homeTeam.name}
                      logo={featuredInsight.homeTeam.logo}
                      favorite={featuredInsight.favoriteTeam === "home"}
                    />
                    <ScoreBlock insight={featuredInsight} />
                    <TeamSide
                      name={featuredInsight.awayTeam.name}
                      logo={featuredInsight.awayTeam.logo}
                      favorite={featuredInsight.favoriteTeam === "away"}
                      align="right"
                    />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <HeroSignalTile
                      label={copy.labels.confidence}
                      value={formatPercentMetric(featuredInsight.confidenceScore)}
                      icon={Gauge}
                      tone="text-cyan-400"
                    />
                    <HeroSignalTile
                      label={copy.labels.heat}
                      value={formatHeatMetric(featuredInsight.heatMeter)}
                      icon={Flame}
                      tone="text-amber-400"
                    />
                  </div>
                  <div className="mt-3 rounded-lg border border-gray-800 bg-[#12121a] px-3 py-2">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">API advice</span>
                      <span className="truncate text-right text-slate-300">
                        {featuredInsight.apiAdvice ?? featuredInsight.apiWinner ?? "-"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">Votes</span>
                      <span className="text-slate-300">
                        {featuredInsight.apiSummary.communityVotes.toLocaleString(
                          localeMap[locale] ?? "th-TH"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
            {heroStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-gray-800 bg-[#0a0a0f] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <Icon size={16} className={stat.tone} />
                  </div>
                  <p className="mt-2 text-xl font-semibold text-white">{stat.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="sticky top-[64px] z-20 border-b border-gray-800/70 bg-[#0a0a0f]/95 px-3 py-2 backdrop-blur md:top-[72px]">
        <div className="rounded-xl border border-gray-800 bg-[#12121a] p-1 shadow-[0_0_24px_rgba(34,211,238,0.04)]">
          <div className="mb-1 flex items-center justify-between px-2 pt-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400/80">
              {copy.title}
            </p>
            <span className="text-xs text-gray-500">
              {source === "api" ? "Live feed" : copy.sections.matchInsights}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveFilter(tab.key)}
              className={`min-w-0 rounded-[8px] px-2 py-2.5 text-center text-sm font-semibold transition-colors ${
                activeFilter === tab.key
                  ? "bg-cyan-500/10 text-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                  : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1 text-xs text-gray-500">({tab.count})</span>
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 px-3 py-3">
        {filteredInsights.length === 0 ? (
          <EmptyState
            title={source === "error" ? copy.error.title : copy.empty.title}
            description={source === "error" ? copy.error.description : copy.empty.description}
            icon={<AlertTriangle size={40} />}
          />
        ) : (
          groupedInsights.map((group) => (
            <div key={group.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-0.5">
                <Calendar size={14} className="shrink-0 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">{group.label}</span>
                <span className="text-xs text-slate-500">({group.items.length})</span>
                <span className="ml-2 h-px flex-1 bg-gray-800" />
              </div>
              {group.items.map((insight) => (
            <Card
              key={insight.id}
              hover
              neon={insight.upsetAlert ? "magenta" : insight.status === MatchStatus.LIVE ? "green" : "cyan"}
              className="p-0"
            >
              <Link
                href={`/${locale}/ai-insight/${insight.matchId}`}
                className="block rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <div className="mb-2 flex items-center gap-1.5 text-sm text-slate-400">
                  <ApiLeagueLogo
                    name={insight.league.name}
                    logo={insight.league.logo}
                    size="xs"
                  />
                  <span className="truncate">{insight.league.name}</span>
                  <StatusBadge insight={insight} copy={copy} />
                  <span className="ml-auto shrink-0 text-sm text-slate-500">
                    {formatMatchMoment(insight, locale)}
                  </span>
                </div>

                <div className="mb-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                  <TeamSide
                    name={insight.homeTeam.name}
                    logo={insight.homeTeam.logo}
                    favorite={insight.favoriteTeam === "home"}
                  />
                  <ScoreBlock insight={insight} />
                  <TeamSide
                    name={insight.awayTeam.name}
                    logo={insight.awayTeam.logo}
                    favorite={insight.favoriteTeam === "away"}
                    align="right"
                  />
                </div>

                <div className="rounded-lg border border-gray-800/80 bg-[#0a0a0f] px-2.5 py-2">
                  {hasStrengthData(insight) ? (
                    <StrengthRow insight={insight} />
                  ) : null}
                  {hasProbabilityData(insight) ? (
                    <ProbabilityRow insight={insight} copy={copy} />
                  ) : null}
                  {hasHeatData(insight) ? (
                    <HeatRow insight={insight} copy={copy} />
                  ) : null}
                  {!hasStrengthData(insight) && !hasProbabilityData(insight) && !hasHeatData(insight) ? (
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-500">Model data</span>
                      <span className="text-slate-300">Pending</span>
                    </div>
                  ) : null}
                </div>

                {hasStandingsOrH2H(insight) ? (
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                    {hasStandings(insight) ? (
                      <StandingsRow insight={insight} copy={copy} />
                    ) : null}
                    {insight.h2h && insight.h2h.totalMatches > 0 ? (
                      <H2HRow h2h={insight.h2h} copy={copy} />
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-2 flex items-center gap-2 text-xs font-semibold">
                  {insight.categories.includes("upsetAlert") ? (
                    <Badge variant="magenta" className="border-magenta/25 bg-magenta/10 text-magenta">
                      {copy.labels.upsetAlert}
                      {typeof insight.upsetRisk === "number" ? ` ${Math.round(insight.upsetRisk)}%` : ""}
                    </Badge>
                  ) : null}

                  {insight.categories.includes("highConfidence") ? (
                    <Badge variant="green">{copy.filters.highConfidence}</Badge>
                  ) : null}

                  {insight.favoriteTeam ? (
                    <Badge variant="cyan">
                      {`★ ${insight.favoriteTeam === "home" ? insight.homeTeam.name : insight.awayTeam.name}`}
                    </Badge>
                  ) : null}

                  <span className="min-w-0 flex-1 truncate text-sm font-normal text-slate-400">
                    {insight.keyFactors[0] ?? insight.apiAdvice ?? insight.apiWinner ?? "-"}
                  </span>

                  <ChevronRight size={14} className="shrink-0 text-slate-500" />
                </div>
              </Link>
            </Card>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
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
    <div className="rounded-lg border border-gray-800 bg-[#12121a] px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        <Icon size={14} className={tone} />
      </div>
      <p className={`mt-1 text-lg font-semibold ${tone}`}>{value}</p>
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
      <ApiTeamLogo name={name} logo={logo} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-slate-100">{name}</p>
      </div>
      {favorite ? <span className="shrink-0 text-[12px] text-amber-400">★</span> : null}
    </div>
  );
}

function ScoreBlock({ insight }: { insight: AIInsightListItem }) {
  const hasScore = insight.score.home !== null && insight.score.away !== null;

  return (
    <div className="min-w-[40px] text-center">
      <div className="text-[18px] font-extrabold text-slate-100">
        {hasScore ? `${insight.score.home} - ${insight.score.away}` : "vs"}
      </div>
      {insight.status === MatchStatus.LIVE && insight.elapsed !== null ? (
        <div className="text-xs text-green-400">{`${insight.elapsed}'`}</div>
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
    <div className="mb-1 flex items-center gap-2">
      <div className="w-[26px] text-center text-[12px] font-bold text-cyan-400">
        {homeStrength}
      </div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
          style={{ width: `${homeStrength}%` }}
        />
      </div>
      <div className="w-[30px] text-center text-xs text-slate-500">{gap}</div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
        <div
          className="ml-auto h-full rounded-full bg-magenta transition-all duration-500 shadow-[0_0_10px_rgba(217,70,239,0.25)]"
          style={{ width: `${awayStrength}%` }}
        />
      </div>
      <div className="w-[26px] text-center text-[12px] font-bold text-magenta">
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
  return (
    <div className="mb-1 grid grid-cols-3 gap-2">
      <ProbabilityCell label={copy.labels.homeWin} value={insight.homeWinProbability} tone="text-cyan-400" />
      <ProbabilityCell label={copy.labels.draw} value={insight.drawProbability} tone="text-amber-400" />
      <ProbabilityCell label={copy.labels.awayWin} value={insight.awayWinProbability} tone="text-magenta" />
    </div>
  );
}

function ProbabilityCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: string;
}) {
  return (
    <div className="rounded-md border border-gray-800 bg-[#12121a] px-2 py-1.5">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-0.5 text-[12px] font-semibold ${tone}`}>{formatPercentMetric(value)}</p>
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
  const heat = normalizeHeat(insight.heatMeter ?? 0);
  const heatTone =
    heat >= 70 ? "bg-magenta" : heat >= 40 ? "bg-amber-400" : "bg-green-400";

  return (
    <div className="flex items-center gap-2">
      <span className="w-[86px] shrink-0 whitespace-nowrap text-right text-xs text-slate-500">
        {getHeatLabel(heat, copy)}
      </span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1a1a2e]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${heatTone}`}
          style={{ width: `${heat}%` }}
        />
      </div>
      <span className="w-[36px] text-right text-sm font-bold text-slate-300">
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
  if (heat <= 30) return copy.labels.heatLow;
  if (heat <= 69) return copy.labels.heatMid;
  return copy.labels.heatHigh;
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
  return typeof insight.heatMeter === "number";
}

function normalizeHeat(value: number) {
  return clampPercent(value <= 10 ? Math.round(value * 10) : Math.round(value));
}

function formatPercentMetric(value: number | null) {
  return typeof value === "number" ? `${Math.round(value)}%` : "-";
}

function formatHeatMetric(value: number | null) {
  if (typeof value !== "number") return "-";
  if (value <= 10) return `${Math.round(value * 10)}/100`;
  return `${Math.round(value)}/100`;
}
