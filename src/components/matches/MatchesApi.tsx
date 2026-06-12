"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { useUserStore } from "@/stores/user-store";
import { MatchStatus } from "@/types/common";
import {
  cn,
  formatDate,
  formatTime,
  getThailandDateKey,
  THAILAND_TIME_ZONE,
} from "@/lib/utils";
import type {
  ApiFootballFixture,
  ApiFootballFixtureCounts,
} from "@/lib/api-football";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import { buildPredictMatchHref } from "@/lib/predict-route";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
  type FootballStatusLabels,
} from "@/lib/football-status";

interface MatchesApiProps {
  fixtures: ApiFootballFixture[];
  counts: ApiFootballFixtureCounts;
  selectedDate: string;
  initialLoadError?: boolean;
  initialHasAuthSession?: boolean;
}

const STATUS_TAB_DEFINITIONS = [
  { key: "all", tone: "cyan" },
  { key: MatchStatus.LIVE, tone: "green" },
  { key: MatchStatus.UPCOMING, tone: "cyan" },
  { key: MatchStatus.FINISHED, tone: "green" },
  { key: MatchStatus.POSTPONED, tone: "amber" },
  { key: MatchStatus.CANCELLED, tone: "red" },
] as const;

type MatchStatusTab = (typeof STATUS_TAB_DEFINITIONS)[number]["key"];

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
  today: string;
  tomorrow: string;
  viewDetails: string;
  statusLabels: FootballStatusLabels;
};

export function MatchesApi({
  fixtures: initialFixtures,
  counts: initialCounts,
  selectedDate,
  initialLoadError = false,
  initialHasAuthSession = false,
}: MatchesApiProps) {
  const locale = useLocale();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const effectiveIsLoggedIn = mounted ? isLoggedIn : initialHasAuthSession;
  const activeStatusTab = toStatusTab(searchParams.get("status_group"));
  const activeLeague = searchParams.get("league") ?? "all";
  const [searchQuery, setSearchQuery] = useState("");
  const [fixtures, setFixtures] = useState<ApiFootballFixture[]>(initialFixtures);
  const [counts, setCounts] = useState(initialCounts);
  const [isPending, startTransition] = useTransition();
  const [loadError, setLoadError] = useState(initialLoadError);
  const deferredSearchQuery = useDeferredValue(searchQuery);

  const refreshFixtures = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const query = new URLSearchParams({
          date: selectedDate,
          timezone: THAILAND_TIME_ZONE,
          limit: "500",
        });
        const res = await fetch(`/api/football/fixtures?${query}`, {
          cache: "no-store",
          signal,
        });
        if (res.ok) {
          const data = await res.json();
          setFixtures(Array.isArray(data?.fixtures) ? data.fixtures : []);
          setCounts(data?.counts ?? emptyCounts());
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setLoadError(true);
        }
      }
    },
    [selectedDate]
  );

  useEffect(() => {
    if (selectedDate !== getThailandDateKey() || counts.live === 0) return;

    let timer: number | undefined;
    const schedule = () => {
      if (timer !== undefined) window.clearInterval(timer);
      if (document.visibilityState === "hidden") return;
      timer = window.setInterval(() => void refreshFixtures(), 45000);
    };

    schedule();
    document.addEventListener("visibilitychange", schedule);

    return () => {
      if (timer !== undefined) window.clearInterval(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [counts.live, refreshFixtures, selectedDate]);

  const leagues = useMemo(() => getLeagueOptions(fixtures), [fixtures]);
  const leagueFilteredFixtures = useMemo(
    () => filterFixturesByLeague(fixtures, activeLeague),
    [activeLeague, fixtures]
  );
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
      today: t("common.today"),
      tomorrow: t("common.tomorrow"),
      viewDetails: t("matches.viewDetails"),
      statusLabels: buildFootballStatusLabels(t),
    }),
    [t]
  );
  const searchedFixtures = useMemo(
    () => filterFixtures(leagueFilteredFixtures, deferredSearchQuery),
    [leagueFilteredFixtures, deferredSearchQuery]
  );
  const matchStats = useMemo(
    () =>
      activeLeague === "all" && !deferredSearchQuery.trim()
        ? counts
        : { total: searchedFixtures.length, ...getMatchStats(searchedFixtures) },
    [activeLeague, counts, deferredSearchQuery, searchedFixtures]
  );
  const hasLocalFilters = activeLeague !== "all" || Boolean(deferredSearchQuery.trim());
  const statusTabs = useMemo(
    () =>
      STATUS_TAB_DEFINITIONS.map((tab) => ({
        ...tab,
        label: getStatusTabLabel(tab.key, tableLabels),
        count: hasLocalFilters
          ? getStatusTabCount(searchedFixtures, tab.key)
          : getBackendStatusCount(counts, tab.key),
      })),
    [counts, hasLocalFilters, searchedFixtures, tableLabels]
  );
  const statusFilteredFixtures = useMemo(
    () => filterFixturesByStatus(searchedFixtures, activeStatusTab),
    [searchedFixtures, activeStatusTab]
  );
  const sortedFixtures = useMemo(
    () => sortMatchesForBoard(statusFilteredFixtures),
    [statusFilteredFixtures]
  );
  const groupedFixtures = useMemo(
    () => groupFixturesByDay(sortedFixtures, locale, tableLabels),
    [sortedFixtures, locale, tableLabels]
  );
  const activeMatchCount = sortedFixtures.length;
  const isToday = selectedDate === getThailandDateKey();
  const isTruncated = counts.total > fixtures.length;
  const hasActiveFilters =
    !isToday ||
    activeLeague !== "all" ||
    activeStatusTab !== "all" ||
    Boolean(searchQuery.trim());

  function updateUrl(key: string, value?: string) {
    const query = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") query.set(key, value);
    else query.delete(key);
    startTransition(() => {
      router.replace(`${pathname}${query.size ? `?${query}` : ""}`, {
        scroll: false,
      });
    });
  }

  function changeDate(offset: number) {
    const date = new Date(`${selectedDate}T12:00:00+07:00`);
    date.setUTCDate(date.getUTCDate() + offset);
    updateUrl("date", getThailandDateKey(date));
  }

  function clearFilters() {
    setSearchQuery("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[#12121a] to-purple-500/10 p-5 md:p-6"
        >
          <div className="relative flex max-w-2xl flex-col gap-4">
           
            <div>
              <h1 className="font-display text-2xl font-bold text-white md:text-4xl">
                {t("matches.title")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 md:text-base">
                {t("matches.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
          
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
            {
              label: t("livescore.live"),
              value: matchStats.live,
              color: "text-green-400",
            },
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
              {isPending ? (
                <Skeleton className="h-7 w-12 rounded-md" />
              ) : (
                <p className={cn("font-mono text-2xl font-bold", item.color)}>
                  {item.value}
                </p>
              )}
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </Card>
      </section>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-cyan-500/15 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-fuchsia-500/[0.05] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
              <Filter size={17} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white">
                {t("matches.filtersTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-gray-500">
                {t("matches.filtersDescription")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-800 bg-black/20 px-3 text-xs text-gray-500">
              {isPending ? (
                <LoaderCircle size={14} className="animate-spin text-cyan-400" />
              ) : null}
              {THAILAND_TIME_ZONE} (UTC+7)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="h-9"
            >
              <RotateCcw size={14} />
              {t("matches.clearFilters")}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="grid gap-2 lg:col-span-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {t("matches.dateFilter")}
              </span>
              <div className="grid gap-2 sm:grid-cols-[40px_minmax(0,1fr)_40px_auto]">
                <label className="relative block sm:col-start-2 sm:row-start-1">
                  <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => updateUrl("date", event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-gray-800 bg-[#0a0a0f] pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-500/50"
                  />
                </label>
                <div className="grid grid-cols-[40px_40px_minmax(0,1fr)] gap-2 sm:contents">
                  <Button variant="outline" size="sm" onClick={() => changeDate(-1)} aria-label={t("matches.previousDay")} className="h-11 sm:col-start-1 sm:row-start-1">
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => changeDate(1)} aria-label={t("matches.nextDay")} className="h-11 sm:col-start-3 sm:row-start-1">
                    <ChevronRight size={16} />
                  </Button>
                  {!isToday ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUrl("date", getThailandDateKey())}
                      className="h-11 min-w-0 whitespace-nowrap px-3 text-cyan-300 sm:col-start-4 sm:row-start-1"
                    >
                      {t("matches.backToToday")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <label className="grid gap-2 lg:col-span-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {t("matches.leagueFilter")}
              </span>
              <select
                value={activeLeague}
                onChange={(event) => updateUrl("league", event.target.value)}
                className="h-11 min-w-0 rounded-lg border border-gray-800 bg-[#0a0a0f] px-3 text-sm text-white outline-none focus:border-cyan-500/50"
              >
                <option value="all">{t("livescore.allLeagues")}</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 lg:col-span-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {t("matches.searchFilter")}
              </span>
              <span className="relative block">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("livescore.searchTeams")}
                  className="h-11 w-full rounded-lg border border-gray-800 bg-[#0a0a0f] pl-9 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-cyan-500/50"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label={t("matches.clearSearch")}
                    className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </span>
            </label>
          </div>

          {fixtures.length > 0 ? (
            <div className="grid gap-2 border-t border-gray-800/80 pt-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
                {t("matches.statusFilter")}
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {statusTabs.map((tab) => {
                const isActive = activeStatusTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateUrl("status_group", tab.key)}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-200",
                      isActive
                        ? getActiveStatusTabClass(tab.tone)
                        : "border-gray-800 bg-[#12121a] text-gray-400 hover:border-gray-600"
                    )}
                  >
                    <span>{tab.label}</span>
                    {isPending ? (
                      <Skeleton className="h-5 w-7 rounded" />
                    ) : (
                      <span className="rounded border border-white/10 bg-black/20 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      {!isPending && loadError ? (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <AlertTriangle size={16} />
          {t("matches.loadError")}
        </div>
      ) : null}

      {!isPending && isTruncated ? (
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-200">
          <AlertTriangle size={16} />
          {t("matches.truncatedWarning", {
            shown: fixtures.length,
            total: counts.total,
          })}
        </div>
      ) : null}

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              {t("matches.boardTitle")}
            </h2>
          </div>
          <div className="flex items-center">
            {isPending ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : (
              <Badge variant="cyan" size="sm" className="w-fit">
                {t("dashboard.matchCount", { count: activeMatchCount })}
              </Badge>
            )}
          </div>
        </div>

        {isPending ? (
          <MatchesBoardSkeleton />
        ) : fixtures.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {t("livescore.noMatches")}
          </div>
        ) : (
          <div className="bg-[#08080d] p-3 sm:p-4">
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
              <FlatMatchesSection
                groups={groupedFixtures}
                locale={locale}
                labels={tableLabels}
                isLoggedIn={effectiveIsLoggedIn}
                activeStatusTab={activeStatusTab}
                searchQuery={searchQuery}
              />
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

function MatchesBoardSkeleton() {
  return (
    <div
      className="space-y-3 bg-[#08080d] p-3 sm:p-4"
      aria-hidden="true"
    >
      <div className="rounded-xl border border-gray-800 bg-[#101018]">
        <div className="flex items-center justify-between gap-4 border-b border-gray-800 px-4 py-3">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
        <div className="divide-y divide-gray-800/80">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid min-h-20 grid-cols-[48px_minmax(0,1fr)_54px] items-center gap-3 px-3 py-3 sm:grid-cols-[64px_minmax(0,1fr)_80px_minmax(0,1fr)_96px] sm:px-4"
            >
              <Skeleton className="h-4 w-10 rounded" />
              <div className="flex items-center gap-2 sm:justify-end">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:order-2" />
                <Skeleton className="h-4 w-20 rounded sm:w-28" />
              </div>
              <Skeleton className="h-8 w-12 justify-self-center rounded-lg sm:w-16" />
              <div className="hidden items-center gap-2 sm:flex">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <Skeleton className="h-4 w-28 rounded" />
              </div>
              <Skeleton className="hidden h-6 w-20 justify-self-end rounded-full sm:block" />
            </div>
          ))}
        </div>
      </div>
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

function getBackendStatusCount(
  counts: ApiFootballFixtureCounts,
  activeStatusTab: MatchStatusTab
) {
  return activeStatusTab === "all" ? counts.total : counts[activeStatusTab];
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

function sortMatchesForBoard(fixtures: ApiFootballFixture[]) {
  return [...fixtures].sort((left, right) => {
    const priorityDiff =
      getMatchBoardPriority(right) - getMatchBoardPriority(left);

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return (
      new Date(left.kickoffTime).getTime() - new Date(right.kickoffTime).getTime()
    );
  });
}

function getMatchBoardPriority(match: ApiFootballFixture) {
  const statusGroup = getFixtureStatusGroup(match);

  if (statusGroup === MatchStatus.UPCOMING) {
    return 500;
  }
  if (statusGroup === MatchStatus.LIVE) {
    return 400;
  }
  if (statusGroup === MatchStatus.POSTPONED) {
    return 300;
  }
  if (statusGroup === MatchStatus.CANCELLED) {
    return 200;
  }
  if (statusGroup === MatchStatus.FINISHED) {
    return 100;
  }

  return 0;
}

type DayFixtureGroup = {
  key: string;
  label: string;
  matches: ApiFootballFixture[];
};

function groupFixturesByDay(
  fixtures: ApiFootballFixture[],
  locale: string,
  labels: Pick<MatchTableLabels, "today" | "tomorrow">
) {
  const groups = new Map<string, DayFixtureGroup>();
  const todayKey = getThailandDateKey();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = getThailandDateKey(tomorrow);

  for (const fixture of fixtures) {
    const date = new Date(fixture.kickoffTime);
    const key = getThailandDateKey(date);
    const label =
      key === todayKey
        ? labels.today
        : key === tomorrowKey
          ? labels.tomorrow
          : new Intl.DateTimeFormat(locale, {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: THAILAND_TIME_ZONE,
            }).format(date);
    const existing = groups.get(key);

    if (existing) {
      existing.matches.push(fixture);
    } else {
      groups.set(key, {
        key,
        label,
        matches: [fixture],
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.key.localeCompare(right.key)
  );
}

function getEmptyStateTitle(
  activeStatusTab: MatchStatusTab,
  labels: Pick<
    MatchTableLabels,
    "matches" | "live" | "upcoming" | "fullTime" | "postponed" | "cancelled"
  >
) {
  if (activeStatusTab === MatchStatus.LIVE) return labels.live;
  if (activeStatusTab === MatchStatus.UPCOMING) return labels.upcoming;
  if (activeStatusTab === MatchStatus.FINISHED) return labels.fullTime;
  if (activeStatusTab === MatchStatus.POSTPONED) return labels.postponed;
  if (activeStatusTab === MatchStatus.CANCELLED) return labels.cancelled;
  return labels.matches;
}

function getFixtureRowTone(statusGroup: MatchStatus | string, index: number) {
  if (statusGroup === MatchStatus.LIVE) {
    return "bg-gradient-to-r from-rose-500/[0.08] via-[#101018] to-[#101018]";
  }

  return index % 2 === 0 ? "bg-[#101018]" : "bg-[#0d1118]";
}

function getScoreTone(statusGroup: MatchStatus | string) {
  if (statusGroup === MatchStatus.LIVE) {
    return "border-rose-400/25 bg-rose-500/10";
  }
  if (statusGroup === MatchStatus.UPCOMING) {
    return "border-cyan-400/15 bg-cyan-500/[0.05]";
  }
  if (statusGroup === MatchStatus.POSTPONED) {
    return "border-amber-400/20 bg-amber-500/[0.06]";
  }
  if (statusGroup === MatchStatus.CANCELLED) {
    return "border-red-400/20 bg-red-500/[0.06]";
  }
  if (statusGroup === MatchStatus.FINISHED) {
    return "border-white/8 bg-black/20";
  }

  return "border-white/10 bg-black/25";
}

const FlatMatchesSection = memo(function FlatMatchesSection({
  groups,
  locale,
  labels,
  isLoggedIn,
  activeStatusTab,
  searchQuery,
}: {
  groups: DayFixtureGroup[];
  locale: string;
  labels: MatchTableLabels;
  isLoggedIn: boolean;
  activeStatusTab: MatchStatusTab;
  searchQuery: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-[#101018] p-10 text-center">
        <p className="text-sm font-semibold text-white">
          {getEmptyStateTitle(activeStatusTab, labels)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {searchQuery.trim()
            ? `${labels.matches}: "${searchQuery.trim()}"`
            : labels.matches}
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-gray-800 bg-[#101018]">
      {groups.map((group) => (
        <div key={group.key}>
          <div className="border-y border-gray-800/80 bg-[#0b0f15] px-3 py-2 sm:px-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
              <p suppressHydrationWarning className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                {group.label}
              </p>
              <span className="text-[11px] text-gray-500">{group.matches.length}</span>
            </div>
          </div>
          <div className="divide-y divide-gray-800/70">
            {group.matches.map((match, index) => (
              <MatchFixtureRow
                key={match.id}
                match={match}
                index={index}
                locale={locale}
                labels={labels}
                isLoggedIn={isLoggedIn}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
});

const MatchFixtureRow = memo(function MatchFixtureRow({
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
  const router = useRouter();
  const matchDetailHref = useMemo(
    () => buildMatchDetailHref(match, locale),
    [match, locale]
  );
  const matchDate = useMemo(() => formatMatchDate(match, locale), [match, locale]);
  const matchTime = useMemo(() => formatMatchTime(match, locale), [match, locale]);
  const statusGroup = useMemo(() => getFixtureStatusGroup(match), [match]);
  const statusLabel = useMemo(
    () => getFixtureStatusLabel(match, labels.statusLabels),
    [match, labels.statusLabels]
  );
  const statusDetail = useMemo(
    () => getMatchStatusDetail(match, statusLabel),
    [match, statusLabel]
  );
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
  const showPredictAction = isLoggedIn && statusGroup === MatchStatus.UPCOMING;
  const rowTone = getFixtureRowTone(statusGroup, index);
  const scoreTone = getScoreTone(statusGroup);

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(matchDetailHref)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(matchDetailHref);
        }
      }}
      className={cn(
        "group relative cursor-pointer transition-colors duration-200 hover:bg-white/2.5",
        rowTone
      )}
    >
      <div className="flex flex-col gap-4 p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/70 pb-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] sm:text-[11px]">
            <span className="truncate rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 font-semibold tracking-wide text-cyan-200 uppercase">
              {match.league.name}
            </span>
            <span className="truncate text-gray-500">{match.league.country}</span>
            {/* {match.league.round && (
              <span className="truncate text-gray-600">{match.league.round}</span>
            )} */}
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-1.5">
              <CalendarDays size={13} className="shrink-0 text-cyan-300" />
              <span suppressHydrationWarning className="text-[11px] text-gray-300">{matchDate}</span>
              <span suppressHydrationWarning className="font-mono text-xs font-bold text-cyan-300 sm:text-sm">
                {matchTime}
              </span>
            </div>
            {statusGroup === MatchStatus.LIVE ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-400/35 bg-rose-500/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-200">
                <span className="live-status-dot h-1.5 w-1.5 rounded-full bg-rose-300" />
                {labels.live}
              </span>
            ) : null}
            <StatusBadge status={match.status} label={statusLabel} />
          </div>
        </div>

        <div
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] gap-2 items-center sm:gap-3",
            showPredictAction
              ? "sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)_120px]"
              : "sm:grid-cols-[minmax(0,1fr)_140px_minmax(0,1fr)]"
          )}
        >
          <Link href={matchDetailHref} className="min-w-0">
            <TeamMatchBlock
              name={match.home.name}
              logo={match.home.logo}
              align="right"
              side="home"
            />
          </Link>

          <Link
            href={matchDetailHref}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-xl border px-3 py-3 text-center",
              scoreTone
            )}
          >
            <span className="font-mono text-lg font-bold tracking-wide text-white sm:text-xl">
              {match.score.home !== null
                ? `${match.score.home} - ${match.score.away}`
                : labels.vs}
            </span>
            <span className="text-[10px] text-gray-500 sm:text-[11px]">{statusDetail}</span>
          </Link>

          <Link href={matchDetailHref} className="min-w-0">
            <TeamMatchBlock
              name={match.away.name}
              logo={match.away.logo}
              align="left"
              side="away"
            />
          </Link>

          {showPredictAction ? (
            <div className="col-span-3 hidden sm:flex sm:col-span-1 sm:justify-end">
              <Link
                href={predictMatchHref}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-500 px-4 text-xs font-semibold text-black transition-all duration-200 hover:bg-amber-400 sm:text-sm"
              >
                {labels.predictScore}
              </Link>
            </div>
          ) : null}
        </div>

        <div className="sm:hidden">
          {showPredictAction ? (
            <Link
              href={predictMatchHref}
              onClick={(event) => event.stopPropagation()}
              className="inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-xs font-semibold text-black transition-all duration-200 hover:bg-amber-400"
            >
              {labels.predictScore}
            </Link>
          ) : null}
        </div>

        <div className="flex items-center justify-end border-t border-gray-800/60 pt-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-medium text-gray-500 transition-colors duration-200 group-hover:text-cyan-200 sm:text-xs">
            <span>{labels.viewDetails}</span>
            <span className="text-base leading-none sm:text-lg">&gt;</span>
          </span>
        </div>
      </div>
    </article>
  );
});

function TeamMatchBlock({
  name,
  logo,
  align,
  side,
}: {
  name: string;
  logo: string | null;
  align: "left" | "right";
  side: "home" | "away";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-colors sm:flex-row sm:gap-3 sm:px-3 sm:py-3",
        side === "home"
          ? "border-cyan-500/15 bg-cyan-500/[0.04]"
          : "border-fuchsia-500/15 bg-fuchsia-500/[0.04]",
        align === "right" && "sm:justify-end sm:text-right"
      )}
    >
      <div
        className={cn(
          align === "right" && "sm:order-2"
        )}
      >
        <ApiTeamLogo
          name={name}
          logo={logo}
          size="md"
          accent={side === "home" ? "cyan" : "magenta"}
        />
      </div>
      <div className={cn("min-w-0", align === "right" && "sm:order-1")}>
        <p className="truncate text-[13px] font-semibold leading-tight text-white sm:text-base">
          {name}
        </p>
      </div>
    </div>
  );
}

function buildMatchDetailHref(match: ApiFootballFixture, locale: string) {
  return `/${locale}/matches/detail/${match.apiFixtureId ?? buildFixtureSeoSlug(match)}`;
}

function filterFixturesByLeague(fixtures: ApiFootballFixture[], leagueId: string) {
  if (leagueId === "all") return fixtures;
  return fixtures.filter((fixture) => String(fixture.league.apiLeagueId) === leagueId);
}

function getLeagueOptions(fixtures: ApiFootballFixture[]) {
  const leagues = new Map<string, string>();
  for (const fixture of fixtures) {
    if (fixture.league.apiLeagueId !== null) {
      leagues.set(String(fixture.league.apiLeagueId), fixture.league.name);
    }
  }
  return Array.from(leagues, ([id, name]) => ({ id, name })).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

function toStatusTab(value: string | null): MatchStatusTab {
  return STATUS_TAB_DEFINITIONS.some((tab) => tab.key === value)
    ? (value as MatchStatusTab)
    : "all";
}

function emptyCounts(): ApiFootballFixtureCounts {
  return {
    total: 0,
    live: 0,
    upcoming: 0,
    finished: 0,
    postponed: 0,
    cancelled: 0,
  };
}

function getMatchStatusDetail(
  match: Pick<ApiFootballFixture, "statusShort" | "statusLong">,
  fallbackLabel: string
) {
  const statusShort = match.statusShort?.trim();
  const statusLong = match.statusLong?.trim();

  if (statusShort && statusLong) {
    return `${statusShort} • ${statusLong}`;
  }

  return statusLong || statusShort || fallbackLabel;
}

function formatMatchDate(match: ApiFootballFixture, locale: string) {
  return formatDate(match.kickoffTime, locale);
}

function formatMatchTime(match: ApiFootballFixture, locale: string) {
  return formatTime(match.kickoffTime, locale);
}
