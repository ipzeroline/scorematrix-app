"use client";

import Image from "next/image";
import Link from "next/link";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  CalendarDays,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { useUserStore } from "@/stores/user-store";
import { MatchStatus } from "@/types/common";
import { THAILAND_TIME_ZONE_LABEL, cn, formatDate, formatTime } from "@/lib/utils";
import type { ApiFootballFixture } from "@/lib/api-football";
import { buildFixtureSeoSlug, buildLeagueSeoSlug } from "@/lib/football-slugs";
import { buildPredictMatchHref } from "@/lib/predict-route";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
  type FootballStatusLabels,
} from "@/lib/football-status";

interface MatchesApiProps {
  fixtures: ApiFootballFixture[];
  initialHasAuthSession?: boolean;
}

const INITIAL_MATCH_RENDER_LIMIT = 80;
const MATCH_RENDER_STEP = 80;
const STATUS_TAB_DEFINITIONS = [
  { key: "all", tone: "cyan" },
  { key: MatchStatus.LIVE, tone: "green" },
  { key: MatchStatus.UPCOMING, tone: "cyan" },
  { key: MatchStatus.FINISHED, tone: "green" },
  { key: MatchStatus.POSTPONED, tone: "amber" },
  { key: MatchStatus.CANCELLED, tone: "red" },
] as const;

type MatchStatusTab = (typeof STATUS_TAB_DEFINITIONS)[number]["key"];

type LeagueGroup = {
  key: string;
  league: ApiFootballFixture["league"];
  matches: ApiFootballFixture[];
  liveCount: number;
  upcomingCount: number;
  finishedCount: number;
  postponedCount: number;
  cancelledCount: number;
};

type MatchTableLabels = {
  matches: string;
  live: string;
  upcoming: string;
  fullTime: string;
  postponed: string;
  cancelled: string;
  time: string;
  home: string;
  score: string;
  away: string;
  status: string;
  predict: string;
  predictScore: string;
  vs: string;
  statusLabels: FootballStatusLabels;
};

export function MatchesApi({ fixtures: initialFixtures, initialHasAuthSession = false }: MatchesApiProps) {
  const locale = useLocale();
  const t = useTranslations();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const effectiveIsLoggedIn = isLoggedIn || initialHasAuthSession;
  const [activeLeague, setActiveLeague] = useState("All");
  const [activeStatusTab, setActiveStatusTab] = useState<MatchStatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [leagueQuery, setLeagueQuery] = useState("");
  const [visibleMatchLimit, setVisibleMatchLimit] = useState(
    INITIAL_MATCH_RENDER_LIMIT
  );
  const [fixtures, setFixtures] = useState(initialFixtures);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const deferredLeagueQuery = useDeferredValue(leagueQuery);

  useEffect(() => {
    setFixtures(initialFixtures);
  }, [initialFixtures]);

  // Auto-refresh fixtures every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/football/fixtures/upcoming");
        if (res.ok) {
          const data = await res.json();
          if (data?.fixtures) {
            setFixtures(data.fixtures);
          }
        }
      } catch {
        // silent fail
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [locale]);
  const matchStats = useMemo(() => getMatchStats(fixtures), [fixtures]);
  const tableLabels = useMemo(
    () => ({
      matches: t("matches.metricMatches"),
      live: t("livescore.live"),
      upcoming: t("livescore.upcoming"),
      fullTime: t("livescore.fullTime"),
      postponed: t("status.postponed"),
      cancelled: t("status.cancelled"),
      time: t("football.table.time"),
      home: t("football.table.home"),
      score: t("football.table.score"),
      away: t("football.table.away"),
      status: t("football.table.status"),
      predict: t("matchDetail.predict"),
      predictScore: t("prediction.predictScore"),
      vs: t("common.vs"),
      statusLabels: buildFootballStatusLabels(t),
    }),
    [t]
  );
  const searchedFixtures = useMemo(
    () => filterFixtures(fixtures, deferredSearchQuery),
    [fixtures, deferredSearchQuery]
  );
  const statusTabs = useMemo(
    () =>
      STATUS_TAB_DEFINITIONS.map((tab) => ({
        ...tab,
        label: getStatusTabLabel(tab.key, tableLabels),
        count: getStatusTabCount(searchedFixtures, tab.key),
      })),
    [searchedFixtures, tableLabels]
  );
  const statusFilteredFixtures = useMemo(
    () => filterFixturesByStatus(searchedFixtures, activeStatusTab),
    [searchedFixtures, activeStatusTab]
  );
  const leagueGroups = useMemo(
    () =>
      filterLeagueGroups(
        groupFixturesByLeague(statusFilteredFixtures),
        deferredLeagueQuery
      ),
    [statusFilteredFixtures, deferredLeagueQuery]
  );
  const leagueCounts = useMemo(
    () => new Map(leagueGroups.map((group) => [group.key, group.matches.length])),
    [leagueGroups]
  );
  const effectiveActiveLeague =
    activeLeague === "All" ||
    leagueGroups.some((group) => group.key === activeLeague)
      ? activeLeague
      : "All";
  const activeLeagueGroups = useMemo(
    () =>
      effectiveActiveLeague === "All"
        ? leagueGroups
        : leagueGroups.filter(({ key }) => key === effectiveActiveLeague),
    [effectiveActiveLeague, leagueGroups]
  );
  const activeMatchCount = useMemo(
    () =>
      activeLeagueGroups.reduce(
        (total, group) => total + group.matches.length,
        0
      ),
    [activeLeagueGroups]
  );
  const displayedLeagueGroups = useMemo(
    () => sliceLeagueGroups(activeLeagueGroups, visibleMatchLimit),
    [activeLeagueGroups, visibleMatchLimit]
  );
  const displayedMatchCount = useMemo(
    () =>
      displayedLeagueGroups.reduce(
        (total, group) => total + group.matches.length,
        0
      ),
    [displayedLeagueGroups]
  );
  const hasMoreMatches = displayedMatchCount < activeMatchCount;
  const boardTitle = displayedLeagueGroups[0]?.league.name ?? t("matches.boardTitle");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[#12121a] to-purple-500/10 p-5 md:p-6"
        >
          <div className="relative flex max-w-2xl flex-col gap-4">
            <Badge variant="cyan" size="md" className="w-fit">
              Live API
            </Badge>
            <div>
              <h1 className="font-display text-2xl font-bold text-white md:text-4xl">
                {t("matches.title")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 md:text-base">
                {t("matches.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="cyan" size="sm" className="w-fit">
                {THAILAND_TIME_ZONE_LABEL}
              </Badge>
              <Link href={`/${locale}/livescore`}>
                <Button size="sm" neon>
                  <Activity size={14} />
                  {t("matches.liveCenter")}
                </Button>
              </Link>
              <Link href={`/${locale}/predict`}>
                <Button size="sm" variant="outline">
                  {t("dashboard.startPredicting")}
                </Button>
              </Link>
              <Link href={`/${locale}/football/leagues`}>
                <Button size="sm" variant="outline">
                  {t("nav.leagues")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-5 lg:grid-cols-1">
          {[
            { label: t("livescore.live"), value: matchStats.live, color: "text-green-400" },
            {
              label: t("livescore.upcoming"),
              value: matchStats.upcoming,
              color: "text-cyan-400",
            },
            {
              label: t("livescore.finished"),
              value: matchStats.finished,
              color: "text-green-400",
            },
            {
              label: t("status.postponed"),
              value: matchStats.postponed,
              color: "text-amber-400",
            },
            {
              label: t("status.cancelled"),
              value: matchStats.cancelled,
              color: "text-red-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3"
            >
              <p className={cn("font-mono text-2xl font-bold", item.color)}>
                {item.value}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </Card>
      </section>

      {fixtures.length > 0 && (
        <Card className="overflow-hidden p-2 sm:p-3">
          <div className="-mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1  sm:mx-0 sm:px-0  ">
            {statusTabs.map((tab) => {
              const isActive = activeStatusTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setActiveStatusTab(tab.key);
                    setVisibleMatchLimit(INITIAL_MATCH_RENDER_LIMIT);
                  }}
                  className={cn(
                    "flex min-h-10 snap-start shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200 sm:min-h-8 sm:py-1.5",
                    isActive
                      ? getActiveStatusTabClass(tab.tone)
                      : "border-gray-800 bg-[#12121a] text-gray-400 hover:border-gray-600"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              {boardTitle}
            </h2>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <label className="relative block">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setVisibleMatchLimit(INITIAL_MATCH_RENDER_LIMIT);
                }}
                placeholder={t("livescore.searchTeams")}
                className="h-9 w-full rounded-lg border border-gray-800 bg-[#0a0a0f] pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-cyan-500/50 sm:w-64"
              />
            </label>
            <label className="relative block">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                value={leagueQuery}
                onChange={(event) => {
                  setLeagueQuery(event.target.value);
                  setVisibleMatchLimit(INITIAL_MATCH_RENDER_LIMIT);
                }}
                placeholder="ค้นหาลีก"
                className="h-9 w-full rounded-lg border border-gray-800 bg-[#0a0a0f] pl-9 pr-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-cyan-500/50 sm:w-52"
              />
            </label>
            <Badge variant="cyan" size="sm" className="w-fit">
              {t("dashboard.matchCount", { count: activeMatchCount })}
            </Badge>
          </div>
        </div>

        {fixtures.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {t("livescore.noMatches")}
          </div>
        ) : (
          <div className="space-y-4 bg-[#08080d] p-3 sm:p-4">
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => {
                  setActiveLeague("All");
                  setVisibleMatchLimit(INITIAL_MATCH_RENDER_LIMIT);
                }}
                className={cn(
                  "flex shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200",
                  effectiveActiveLeague === "All"
                    ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                    : "border-gray-800 bg-[#12121a] text-gray-400 hover:border-gray-600"
                )}
              >
                {t("rewards.all")}
              </button>
              {leagueGroups.map(({ key, league }) => {
                const filteredCount = leagueCounts.get(key) ?? 0;

                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveLeague(key);
                      setVisibleMatchLimit(INITIAL_MATCH_RENDER_LIMIT);
                    }}
                    className={cn(
                      "flex shrink-0 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200",
                      effectiveActiveLeague === key
                        ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                        : "border-gray-800 bg-[#12121a] text-gray-400 hover:border-gray-600"
                    )}
                  >
                    <ApiLeagueLogo
                      name={league.name}
                      logo={league.logo}
                      size="xs"
                    />
                    <span>{league.name}</span>
                    <span className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                      {filteredCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeMatchCount === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-[#101018] p-10 text-center">
                <p className="text-sm font-semibold text-white">
                  {t("livescore.noMatches")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t("livescore.tryAdjustingFilters")}
                </p>
              </div>
            ) : (
              <>
                {displayedLeagueGroups.map((group) => (
                  <LeagueSection
                    key={group.key}
                    group={group}
                    locale={locale}
                    labels={tableLabels}
                    isLoggedIn={effectiveIsLoggedIn}
                  />
                ))}
                {hasMoreMatches && (
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleMatchLimit((limit) => limit + MATCH_RENDER_STEP)
                      }
                      className="rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:border-cyan-300/50 hover:bg-cyan-500/15"
                    >
                      แสดงเพิ่ม {Math.min(MATCH_RENDER_STEP, activeMatchCount - displayedMatchCount)} รายการ
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CalendarDays,
            title: t("matches.featureCards.scheduleTitle"),
            text: t("matches.featureCards.scheduleText"),
          },
          {
            icon: ShieldCheck,
            title: t("matches.featureCards.noGamblingTitle"),
            text: t("matches.featureCards.noGamblingText"),
          },
          {
            icon: Activity,
            title: t("matches.featureCards.liveTitle"),
            text: t("matches.featureCards.liveText"),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-4">
              <Icon size={18} className="mb-3 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">{item.text}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function getMatchStats(fixtures: ApiFootballFixture[]) {
  let live = 0;
  let upcoming = 0;
  let finished = 0;
  let postponed = 0;
  let cancelled = 0;

  for (const fixture of fixtures) {
    const statusGroup = getFixtureStatusGroup(fixture);

    if (statusGroup === MatchStatus.LIVE) {
      live += 1;
    } else if (statusGroup === MatchStatus.UPCOMING) {
      upcoming += 1;
    } else if (statusGroup === MatchStatus.FINISHED) {
      finished += 1;
    } else if (statusGroup === MatchStatus.POSTPONED) {
      postponed += 1;
    } else if (statusGroup === MatchStatus.CANCELLED) {
      cancelled += 1;
    }
  }

  return { live, upcoming, finished, postponed, cancelled };
}

function filterFixtures(fixtures: ApiFootballFixture[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return fixtures;
  }

  return fixtures.filter((fixture) =>
    [
      fixture.home.name,
      fixture.away.name,
      fixture.league.name,
      fixture.league.country,
      fixture.league.round,
      fixture.statusShort,
      fixture.venue,
    ]
      .filter((value): value is string => typeof value === "string")
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  );
}

function filterFixturesByStatus(
  fixtures: ApiFootballFixture[],
  activeStatusTab: MatchStatusTab
) {
  if (activeStatusTab === "all") {
    return fixtures;
  }

  return fixtures.filter(
    (fixture) => getFixtureStatusGroup(fixture) === activeStatusTab
  );
}

function getStatusTabCount(
  fixtures: ApiFootballFixture[],
  activeStatusTab: MatchStatusTab
) {
  return filterFixturesByStatus(fixtures, activeStatusTab).length;
}

function getStatusTabLabel(
  activeStatusTab: MatchStatusTab,
  labels: MatchTableLabels
) {
  if (activeStatusTab === "all") return labels.matches;
  if (activeStatusTab === MatchStatus.LIVE) return labels.live;
  if (activeStatusTab === MatchStatus.UPCOMING) return labels.upcoming;
  if (activeStatusTab === MatchStatus.FINISHED) return labels.fullTime;
  if (activeStatusTab === MatchStatus.POSTPONED) return labels.postponed;
  return labels.cancelled;
}

function getActiveStatusTabClass(
  tone: (typeof STATUS_TAB_DEFINITIONS)[number]["tone"]
) {
  if (tone === "green") {
    return "border-green-500/30 bg-green-500/15 text-green-300";
  }
  if (tone === "amber") {
    return "border-amber-500/30 bg-amber-500/15 text-amber-300";
  }
  if (tone === "red") {
    return "border-red-500/30 bg-red-500/15 text-red-300";
  }
  return "border-cyan-500/30 bg-cyan-500/20 text-cyan-400";
}

function groupFixturesByLeague(fixtures: ApiFootballFixture[]) {
  const groups = new Map<string, LeagueGroup>();

  for (const fixture of fixtures) {
    const key = `${fixture.league.apiLeagueId ?? fixture.league.id}-${fixture.league.season ?? "season"}`;
    const existing = groups.get(key);
    const statusGroup = getFixtureStatusGroup(fixture);

    if (existing) {
      existing.matches.push(fixture);
      if (statusGroup === MatchStatus.LIVE) {
        existing.liveCount += 1;
      } else if (statusGroup === MatchStatus.UPCOMING) {
        existing.upcomingCount += 1;
      } else if (statusGroup === MatchStatus.FINISHED) {
        existing.finishedCount += 1;
      } else if (statusGroup === MatchStatus.POSTPONED) {
        existing.postponedCount += 1;
      } else if (statusGroup === MatchStatus.CANCELLED) {
        existing.cancelledCount += 1;
      }
    } else {
      groups.set(key, {
        key,
        league: fixture.league,
        matches: [fixture],
        liveCount: statusGroup === MatchStatus.LIVE ? 1 : 0,
        upcomingCount: statusGroup === MatchStatus.UPCOMING ? 1 : 0,
        finishedCount: statusGroup === MatchStatus.FINISHED ? 1 : 0,
        postponedCount: statusGroup === MatchStatus.POSTPONED ? 1 : 0,
        cancelledCount: statusGroup === MatchStatus.CANCELLED ? 1 : 0,
      });
    }
  }

  return Array.from(groups.values());
}

function sliceLeagueGroups(groups: LeagueGroup[], limit: number) {
  let remaining = limit;
  const slicedGroups: LeagueGroup[] = [];

  for (const group of groups) {
    if (remaining <= 0) break;

    const matches = group.matches.slice(0, remaining);
    remaining -= matches.length;
    const stats = getMatchStats(matches);
    slicedGroups.push({
      ...group,
      matches,
      liveCount: stats.live,
      upcomingCount: stats.upcoming,
      finishedCount: stats.finished,
      postponedCount: stats.postponed,
      cancelledCount: stats.cancelled,
    });
  }

  return slicedGroups;
}

function filterLeagueGroups(
  groups: LeagueGroup[],
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return groups;
  }

  return groups.filter(({ league }) =>
    [
      league.name,
      league.country,
      league.round,
      String(league.season ?? ""),
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalizedQuery))
  );
}

const LeagueSection = memo(function LeagueSection({
  group,
  locale,
  labels,
  isLoggedIn,
}: {
  group: LeagueGroup;
  locale: string;
  labels: MatchTableLabels;
  isLoggedIn: boolean;
}) {
  const { league, matches } = group;

  return (
    <section className="overflow-hidden rounded-lg border border-gray-800 bg-[#101018]">
      <div className="border-b border-gray-800 bg-[#141421] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={`/${locale}/football/leagues/${buildLeagueSeoSlug(league)}?season=${league.season ?? 2026}`}
            className="flex min-w-0 items-center gap-3 hover:opacity-85"
          >
            <LeagueLogo name={league.name} logo={league.logo} />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-bold text-white">
                  {league.name}
                </h3>
                {group.liveCount > 0 && (
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-rose-300" />
                )}
              </div>
              <p className="truncate text-[11px] text-gray-500">
                {league.country}
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <LeagueMetric label={labels.matches} value={matches.length} tone="gray" />
            <LeagueMetric label={labels.live} value={group.liveCount} tone="green" />
            <LeagueMetric label={labels.upcoming} value={group.upcomingCount} tone="cyan" />
            <LeagueMetric label={labels.fullTime} value={group.finishedCount} tone="green" />
            <LeagueMetric label={labels.postponed} value={group.postponedCount} tone="amber" />
            <LeagueMetric label={labels.cancelled} value={group.cancelledCount} tone="red" />
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3 sm:hidden">
        {matches.map((match, index) => (
          <MatchMobileCard
            key={match.id}
            match={match}
            index={index}
            locale={locale}
            labels={labels}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[860px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[220px]" />
            <col className="w-[220px]" />
            <col className="w-[96px]" />
            <col className="w-[220px]" />
            <col className="w-[140px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-800 bg-[#0a0a0f] text-left text-[10px] uppercase tracking-wider text-gray-500">
              <th className="px-4 py-3 text-center text-[11px] font-semibold">{labels.time}</th>
              <th className="px-4 py-3 text-right font-semibold">{labels.home}</th>
              <th className="px-4 py-3 text-center font-semibold">{labels.score}</th>
              <th className="px-4 py-3 text-left font-semibold">{labels.away}</th>
              <th className="px-4 py-3 text-right font-semibold">{labels.status}</th>
              <th className="px-4 py-3 text-right font-semibold">{labels.predict}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/70">
            {matches.map((match, index) => (
              <MatchRow
                key={match.id}
                match={match}
                index={index}
                locale={locale}
                labels={labels}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
});

const MatchMobileCard = memo(function MatchMobileCard({
  match,
  index,
  locale,
  labels,
  isLoggedIn,
}: {
  match: ApiFootballFixture;
  index: number;
  locale: string;
  labels: MatchTableLabels;
  isLoggedIn: boolean;
}) {
  const matchDetailHref = useMemo(() => buildMatchDetailHref(match, locale), [match, locale]);
  const matchDate = useMemo(() => formatMatchDate(match, locale), [match, locale]);
  const matchTime = useMemo(() => formatMatchTime(match, locale), [match, locale]);
  const statusGroup = useMemo(() => getFixtureStatusGroup(match), [match]);
  const statusLabel = useMemo(
    () => getFixtureStatusLabel(match, labels.statusLabels),
    [match, labels.statusLabels]
  );
  const rowTone = index % 2 === 0 ? "bg-[#101018]" : "bg-cyan-500/[0.025]";

  return (
    <Link
      href={matchDetailHref}
      className="block"
    >
      <Card
        hover
        className={cn("overflow-hidden p-0", rowTone)}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-800/70 bg-black/15 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-1.5">
            <CalendarDays size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />
            <span className="min-w-0 truncate text-xs font-medium text-gray-300">
              {matchDate}
            </span>
            <span className="whitespace-nowrap font-mono text-sm font-bold text-cyan-300">
              {matchTime}
            </span>
          </div>
          <StatusBadge
            status={match.status}
            label={statusLabel}
            className="justify-self-center text-center"
          />
        </div>

        <div className="min-w-0 px-3 py-3">
          <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-start gap-4">
            <MobileTeamInline
              name={match.home.name}
              logo={match.home.logo}
              accent="cyan"
            />
            <span className="mx-auto flex min-h-9 w-[68px] shrink-0 items-center justify-center rounded-lg border border-white/10 bg-black/35 px-2 text-center font-mono text-base font-bold text-white shadow-[0_0_18px_rgba(34,211,238,0.08)]">
              {match.score.home !== null
                ? `${match.score.home} - ${match.score.away}`
                : labels.vs}
            </span>
            <MobileTeamInline
              name={match.away.name}
              logo={match.away.logo}
              accent="magenta"
            />
          </div>
          {isLoggedIn && statusGroup === MatchStatus.UPCOMING && (
            <div className="mt-3 flex justify-center">
              <span className="inline-flex min-h-9 items-center justify-center rounded-lg bg-amber-500 px-4 text-xs font-semibold text-black transition-all duration-200 group-hover:bg-amber-400">
                {labels.predictScore}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
});

const MatchRow = memo(function MatchRow({
  match,
  index,
  locale,
  labels,
  isLoggedIn,
}: {
  match: ApiFootballFixture;
  index: number;
  locale: string;
  labels: MatchTableLabels;
  isLoggedIn: boolean;
}) {
  const predictMatchHref = useMemo(
    () =>
      buildPredictMatchHref(
        locale,
        buildFixtureSeoSlug(match),
        match.home.apiTeamId ?? match.home.id,
        match.away.apiTeamId ?? match.away.id
      ),
    [locale, match]
  );
  const matchDetailHref = useMemo(() => buildMatchDetailHref(match, locale), [match, locale]);
  const matchDate = useMemo(() => formatMatchDate(match, locale), [match, locale]);
  const matchTime = useMemo(() => formatMatchTime(match, locale), [match, locale]);
  const statusGroup = useMemo(() => getFixtureStatusGroup(match), [match]);
  const statusLabel = useMemo(
    () => getFixtureStatusLabel(match, labels.statusLabels),
    [match, labels.statusLabels]
  );
  const rowTone = index % 2 === 0 ? "bg-[#101018]" : "bg-cyan-500/[0.025]";

  return (
    <tr className={cn(rowTone, "hover:bg-white/[0.045]")}>
      <td className="px-1.5 py-2.5 text-center sm:px-4 sm:py-3">
        <Link
          href={matchDetailHref}
          className="mx-auto flex w-[54px] flex-col items-center rounded-lg border border-cyan-500/15 bg-cyan-500/[0.07] px-1 py-1.5 text-center hover:border-cyan-400/40 sm:w-[204px] sm:flex-row sm:justify-center sm:gap-1.5 sm:px-3 sm:py-2.5"
        >
          <span className="hidden max-w-full truncate text-xs font-medium leading-none text-gray-300 sm:block">
            {matchDate}
          </span>
          <span className="whitespace-nowrap font-mono text-[10px] font-bold leading-none text-cyan-300 sm:text-sm">
            {matchTime}
          </span>
        </Link>
      </td>
      <td className="py-2.5 pl-1 pr-2 sm:py-3 sm:pl-3 sm:pr-5">
        <Link href={matchDetailHref} className="block min-w-0">
          <TeamInline
            name={match.home.name}
            logo={match.home.logo}
            align="right"
          />
        </Link>
      </td>
      <td className="px-2 py-2.5 text-center sm:px-4 sm:py-3">
        <Link
          href={matchDetailHref}
          className="inline-flex min-w-14 justify-center rounded-md border border-gray-800 bg-black/20 px-2 py-1 font-mono text-xs font-bold text-white sm:min-w-16 sm:px-2.5 sm:text-sm"
        >
          {match.score.home !== null
            ? `${match.score.home} - ${match.score.away}`
            : labels.vs}
        </Link>
      </td>
      <td className="py-2.5 pl-2 pr-1 sm:py-3 sm:pl-5 sm:pr-3">
        <Link href={matchDetailHref} className="block min-w-0">
          <TeamInline name={match.away.name} logo={match.away.logo} />
        </Link>
      </td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        <Link href={matchDetailHref}>
          <StatusBadge status={match.status} label={statusLabel} />
        </Link>
      </td>
      <td className="hidden px-4 py-3 text-right sm:table-cell">
        {isLoggedIn && statusGroup === MatchStatus.UPCOMING ? (
          <Link
            href={predictMatchHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-amber-400"
          >
            {labels.predictScore}
          </Link>
        ) : (
          <span className="inline-flex min-w-20 justify-center rounded-lg border border-gray-800 bg-black/20 px-3 py-1.5 text-xs text-gray-600">
            -
          </span>
        )}
      </td>
    </tr>
  );
});

function buildMatchDetailHref(match: ApiFootballFixture, locale: string) {
  return `/${locale}/matches/detail/${match.apiFixtureId ?? buildFixtureSeoSlug(match)}`;
}

function LeagueLogo({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white p-1">
      {logo ? (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={34}
          height={34}
          className="object-contain"
        />
      ) : (
        <span className="text-xs font-bold text-gray-700">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function LeagueMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gray" | "red" | "cyan" | "green" | "amber";
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-black/20 px-2.5 py-1 text-[10px]",
        tone === "gray" && "border-gray-700 text-gray-400",
        tone === "red" && "border-red-500/30 text-red-300",
        tone === "cyan" && "border-cyan-500/30 text-cyan-300",
        tone === "green" && "border-green-500/30 text-green-300",
        tone === "amber" && "border-amber-500/30 text-amber-300"
      )}
    >
      <span className="font-mono font-bold">{value}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  );
}

function TeamInline({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 sm:gap-2",
        align === "right" && "justify-end text-right"
      )}
    >
      {align !== "right" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
      <p className="min-w-0 truncate text-[14px] font-semibold text-white sm:text-sm lg:text-[15px]">{name}</p>
      {align === "right" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
    </div>
  );
}

function MobileTeamInline({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
      <div className="flex h-10 w-full items-center justify-center">
        <ApiTeamLogo name={name} logo={logo} size="sm" accent={accent} />
      </div>
      <span className="line-clamp-2 min-h-[28px] max-w-[140px] break-words text-center text-[13px] font-semibold leading-tight text-white sm:max-w-[144px] sm:text-[13px]">
        {name}
      </span>
    </div>
  );
}

function formatMatchDate(match: ApiFootballFixture, locale: string) {
  return formatDate(match.kickoffTime, locale);
}

function formatMatchTime(match: ApiFootballFixture, locale: string) {
  return formatTime(match.kickoffTime, locale);
}
