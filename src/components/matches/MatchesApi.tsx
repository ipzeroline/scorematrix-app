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
  Clock3,
  Filter,
  LoaderCircle,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
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
  lastUpdatedAt: string;
  initialLoadError?: boolean;
  initialHasAuthSession?: boolean;
}

const STATUS_TAB_DEFINITIONS = [
  { key: "all", tone: "cyan" },
  { key: MatchStatus.UPCOMING, tone: "cyan" },
  { key: MatchStatus.LIVE, tone: "green" },
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
  dateTime: string;
  home: string;
  score: string;
  away: string;
  status: string;
  predict: string;
  predictScore: string;
  vs: string;
  today: string;
  tomorrow: string;
  yesterday: string;
  matchCenter: string;
  signInToPredict: string;
  lastUpdated: string;
  viewDetails: string;
  statusLabels: FootballStatusLabels;
};

export function MatchesApi({
  fixtures: initialFixtures,
  counts: initialCounts,
  selectedDate,
  lastUpdatedAt,
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
      dateTime: `${t("matches.dateFilter")} / ${t("football.table.time")}`,
      home: t("football.table.home"),
      score: t("football.table.score"),
      away: t("football.table.away"),
      status: t("football.table.status"),
      predict: t("matchDetail.predict"),
      predictScore: t("prediction.predictScore"),
      vs: t("common.vs"),
      today: t("common.today"),
      tomorrow: t("common.tomorrow"),
      yesterday: t("matches.yesterday"),
      matchCenter: t("matches.matchCenter"),
      signInToPredict: t("matches.signInToPredict"),
      lastUpdated: t("matches.lastUpdated"),
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
    () => sortMatchesByKickoffTime(statusFilteredFixtures),
    [statusFilteredFixtures]
  );
  const groupedFixtures = useMemo(
    () => groupFixturesByLeague(sortedFixtures),
    [sortedFixtures]
  );
  const activeMatchCount = sortedFixtures.length;
  const isToday = selectedDate === getThailandDateKey();
  const isTruncated = counts.total > fixtures.length;
  const hasActiveFilters =
    !isToday ||
    activeLeague !== "all" ||
    activeStatusTab !== "all" ||
    Boolean(searchQuery.trim());
  const lastUpdatedLabel = useMemo(
    () => formatTime(lastUpdatedAt, locale),
    [lastUpdatedAt, locale]
  );
  const matchdayItems = useMemo(
    () => buildMatchdayItems(selectedDate, locale, tableLabels),
    [locale, selectedDate, tableLabels]
  );

  function updateUrl(key: string, value?: string) {
    const query = new URLSearchParams(searchParams.toString());
    if (key === "status_group") {
      if (value === "all") query.delete(key);
      else if (value) query.set(key, value);
    } else if (value && value !== "all") query.set(key, value);
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
    <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-8 px-4 sm:px-0">
      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_390px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/15 bg-[#0b111d] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] md:p-5"
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-cyan-300/70 via-fuchsia-300/40 to-transparent" />

          <div className="relative flex min-h-0 flex-col justify-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-cyan-200">
                  <Sparkles size={11} />
                  {t("matches.boardTitle")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-gray-400">
                  <Clock3 size={12} className="text-cyan-300" />
                  {tableLabels.lastUpdated} {lastUpdatedLabel}
                </span>
              </div>
              <h1 className="mt-3 font-display text-3xl font-black tracking-normal text-white md:text-4xl">
                {t("matches.title")}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-gray-400 md:text-[15px]">
                {t("matches.subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {matchdayItems.map((item) => (
                <button
                  key={item.dateKey}
                  type="button"
                  onClick={() => updateUrl("date", item.dateKey)}
                  className={cn(
                    "min-h-16 rounded-xl border px-2 py-2 text-center transition-colors",
                    item.active
                      ? "border-cyan-300/50 bg-cyan-300/12 text-white"
                      : "border-white/10 bg-black/18 text-gray-400 hover:border-cyan-300/25 hover:text-white"
                  )}
                >
                  <span className="block truncate text-[10px] font-black uppercase tracking-wide">
                    {item.label}
                  </span>
                  <span className="mt-1 block font-mono text-sm font-black">
                    {item.displayDate}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/livescore`}>
                <Button size="sm" neon className="min-h-10 cursor-pointer font-bold tracking-wide">
                  <Activity size={14} />
                  {t("matches.liveCenter")}
                </Button>
              </Link>
              <Link href={`/${locale}/predict`}>
                <Button size="sm" variant="outline" className="min-h-10 cursor-pointer border-gray-800 font-bold tracking-wide hover:border-cyan-500/30">
                  {t("dashboard.startPredicting")}
                </Button>
              </Link>
              <Link href={`/${locale}/football/leagues`}>
                <Button size="sm" variant="outline" className="min-h-10 cursor-pointer border-gray-800 font-bold tracking-wide hover:border-cyan-500/30">
                  {t("nav.leagues")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-2 gap-2 border-cyan-300/10 bg-[#090b10] p-2.5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:grid-cols-3 lg:grid-cols-2">
          {[
            {
              label: t("livescore.live"),
              value: matchStats.live,
              color: "text-green-400",
              indicatorBg: "bg-green-500",
              icon: Activity,
            },
            {
              label: t("livescore.upcoming"),
              value: matchStats.upcoming,
              color: "text-cyan-400",
              indicatorBg: "bg-cyan-500",
              icon: CalendarDays,
            },
            {
              label: t("livescore.finished"),
              value: matchStats.finished,
              color: "text-gray-400",
              indicatorBg: "bg-gray-500",
              icon: ShieldCheck,
            },
            {
              label: t("status.postponed"),
              value: matchStats.postponed,
              color: "text-amber-400",
              indicatorBg: "bg-amber-500",
              icon: AlertTriangle,
            },
            {
              label: t("status.cancelled"),
              value: matchStats.cancelled,
              color: "text-red-400",
              indicatorBg: "bg-red-500",
              icon: X,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "group relative flex min-h-[64px] items-center justify-between gap-2 overflow-hidden rounded-xl border border-white/10 bg-[#0c111a] p-3 transition-colors hover:border-cyan-300/25",
                  index === 4 && "sm:col-span-1 lg:col-span-2"
                )}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03]", item.color)}>
                    <Icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black leading-5 text-white">
                      {item.label}
                    </p>
                    <span className={cn("mt-1 block h-1 w-8 rounded-full", item.indicatorBg)} />
                  </div>
                </div>
                {isPending ? (
                  <Skeleton className="h-7 w-10 shrink-0 rounded" />
                ) : (
                  <p className={cn("shrink-0 font-mono text-2xl font-black leading-none md:text-3xl", item.color)}>
                    {item.value}
                  </p>
                )}
              </div>
            );
          })}
        </Card>
      </section>

      <Card className="overflow-hidden p-0 bg-[#08090d] border-gray-800/80">
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
            <span className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-800 bg-black/20 px-3 text-xs text-gray-500 font-semibold uppercase tracking-wider font-mono">
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
              className="h-9 font-bold tracking-wide cursor-pointer"
            >
              <RotateCcw size={14} />
              {t("matches.clearFilters")}
            </Button>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 bg-[#090b10]">
          <div className="grid gap-3 lg:grid-cols-12">
            <div className="grid gap-2 lg:col-span-5">
              <FilterLabel icon={CalendarDays} label={t("matches.dateFilter")} />
              <div className="grid gap-2 sm:grid-cols-[40px_minmax(0,1fr)_40px_auto]">
                <label className="relative block sm:col-start-2 sm:row-start-1">
                  <CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(event) => updateUrl("date", event.target.value)}
                    className="h-11 w-full min-w-0 rounded-lg border border-gray-800 bg-[#0c0d12] pl-9 pr-3 text-sm text-white outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 font-semibold [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </label>
                <div className="grid grid-cols-[40px_40px_minmax(0,1fr)] gap-2 sm:contents">
                  <Button variant="outline" size="sm" onClick={() => changeDate(-1)} aria-label={t("matches.previousDay")} className="h-11 sm:col-start-1 sm:row-start-1 cursor-pointer">
                    <ChevronLeft size={16} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => changeDate(1)} aria-label={t("matches.nextDay")} className="h-11 sm:col-start-3 sm:row-start-1 cursor-pointer">
                    <ChevronRight size={16} />
                  </Button>
                  {!isToday ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateUrl("date", getThailandDateKey())}
                      className="h-11 min-w-0 whitespace-nowrap px-3 text-cyan-400 hover:text-cyan-300 font-bold sm:col-start-4 sm:row-start-1 cursor-pointer"
                    >
                      {t("matches.backToToday")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>

            <label className="grid gap-2 lg:col-span-3">
              <FilterLabel icon={ShieldCheck} label={t("matches.leagueFilter")} />
              <select
                value={activeLeague}
                onChange={(event) => updateUrl("league", event.target.value)}
                className="h-11 min-w-0 rounded-lg border border-gray-800 bg-[#0c0d12] px-3 text-sm text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all font-semibold cursor-pointer"
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
              <FilterLabel icon={Search} label={t("matches.searchFilter")} />
              <span className="relative block">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={t("livescore.searchTeams")}
                  className="h-11 w-full rounded-lg border border-gray-800 bg-[#0c0d12] pl-9 pr-10 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 font-semibold"
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
              <FilterLabel icon={Activity} label={t("matches.statusFilter")} />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {statusTabs.map((tab) => {
                const isActive = activeStatusTab === tab.key;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => updateUrl("status_group", tab.key)}
                    className={cn(
                      "flex min-h-11 items-center justify-between gap-2.5 rounded-lg border px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer",
                      isActive
                        ? getActiveStatusTabClass(tab.tone)
                        : "border-gray-800 bg-[#0c0d12] text-gray-400 hover:border-cyan-500/30 hover:bg-[#11131a] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        tab.tone === "green" ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]" :
                        tab.tone === "amber" ? "bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.5)]" :
                        tab.tone === "red" ? "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.5)]" :
                        "bg-cyan-400 shadow-[0_0_4px_rgba(34,211,238,0.5)]"
                      )} />
                      <span>{tab.label}</span>
                    </div>
                    {isPending ? (
                      <Skeleton className="h-5 w-7 rounded" />
                    ) : (
                      <span className={cn(
                        "rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                        isActive
                          ? "border-white/10 bg-black/30 text-white"
                          : "border-white/5 bg-black/15 text-gray-500"
                      )}>
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

      <Card className="overflow-hidden p-0 border-gray-800/80 bg-[#07080b] relative">
        {/* Esports accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500" />
        <div className="flex flex-col gap-3 border-b border-gray-800/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-[#0d0e14] via-[#07080b] to-[#0d0e14] mt-[2px]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider font-display">
              {t("matches.boardTitle")}
            </h2>
          </div>
          <div className="flex items-center">
            {isPending ? (
              <Skeleton className="h-6 w-24 rounded-full" />
            ) : (
              <Badge variant="cyan" size="sm" className="w-fit font-bold tracking-wide">
                {t("dashboard.matchCount", { count: activeMatchCount })}
              </Badge>
            )}
          </div>
        </div>

        {isPending ? (
          <MatchesBoardSkeleton />
        ) : fixtures.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            {t("livescore.noMatches")}
          </div>
        ) : (
          <div className="bg-[#050508] p-3 sm:p-4">
            {activeMatchCount === 0 ? (
              <div className="rounded-lg border border-gray-800 bg-[#0d0f14] p-12 text-center">
                <p className="text-sm font-bold text-white">
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
            <Card key={item.title} className="p-5 border-gray-800/80 bg-[#090b10] hover:border-cyan-500/20 transition-all duration-300">
              <Icon size={18} className="mb-3 text-cyan-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-gray-500">{item.text}</p>
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
      className="space-y-3 bg-[#050508] p-3 sm:p-4 animate-pulse"
      aria-hidden="true"
    >
      <div className="rounded-xl border border-gray-800 bg-[#0c0d12]">
        <div className="divide-y divide-gray-800/50">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid min-h-12 grid-cols-[118px_minmax(190px,1fr)_92px_minmax(190px,1fr)_210px] items-center gap-3 px-5 py-3"
            >
              <Skeleton className="h-4 w-12 rounded" />
              <div className="flex items-center gap-2 justify-end">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
              <Skeleton className="h-7 w-12 mx-auto rounded" />
              <div className="flex items-center gap-2 justify-start">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3.5 w-20 rounded" />
              </div>
              <Skeleton className="h-7 w-16 justify-self-end rounded" />
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

function buildMatchdayItems(
  selectedDate: string,
  locale: string,
  labels: Pick<MatchTableLabels, "today" | "tomorrow" | "yesterday">
) {
  const todayKey = getThailandDateKey();
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    timeZone: THAILAND_TIME_ZONE,
  });

  return [-2, -1, 0, 1, 2].map((offset) => {
    const date = new Date(`${selectedDate}T12:00:00+07:00`);
    date.setUTCDate(date.getUTCDate() + offset);
    const dateKey = getThailandDateKey(date);
    const relativeToToday = dayOffset(dateKey, todayKey);

    return {
      dateKey,
      active: dateKey === selectedDate,
      label:
        relativeToToday === -1
          ? labels.yesterday
          : relativeToToday === 0
            ? labels.today
            : relativeToToday === 1
              ? labels.tomorrow
              : formatter.format(date),
      displayDate: formatter.format(date),
    };
  });
}

function dayOffset(dateKey: string, baseDateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+07:00`);
  const baseDate = new Date(`${baseDateKey}T12:00:00+07:00`);
  return Math.round((date.getTime() - baseDate.getTime()) / 86400000);
}

function FilterLabel({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-3 py-1.5 text-xs font-black leading-none text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
      <Icon size={14} className="text-cyan-300" />
      {label}
    </span>
  );
}


function getActiveStatusTabClass(
  tone: (typeof STATUS_TAB_DEFINITIONS)[number]["tone"]
) {
  if (tone === "green") {
    return "border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
  }
  if (tone === "amber") {
    return "border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.15)]";
  }
  if (tone === "red") {
    return "border-red-500/50 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]";
  }
  return "border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.15)]";
}

function sortMatchesByKickoffTime(fixtures: ApiFootballFixture[]) {
  return [...fixtures].sort(
    (left, right) =>
      new Date(left.kickoffTime).getTime() - new Date(right.kickoffTime).getTime()
  );
}

type LeagueFixtureGroup = {
  key: string;
  label: string;
  country: string | null;
  logo: string | null;
  matches: ApiFootballFixture[];
};

function groupFixturesByLeague(fixtures: ApiFootballFixture[]) {
  const groups = new Map<string, LeagueFixtureGroup>();
  for (const fixture of fixtures) {
    const key = String(fixture.league.apiLeagueId ?? fixture.league.id ?? fixture.league.name);
    const existing = groups.get(key);

    if (existing) {
      existing.matches.push(fixture);
    } else {
      groups.set(key, {
        key,
        label: fixture.league.name,
        country: fixture.league.country,
        logo: fixture.league.logo,
        matches: [fixture],
      });
    }
  }

  return Array.from(groups.values()).sort((left, right) =>
    new Date(left.matches[0]?.kickoffTime ?? 0).getTime() -
      new Date(right.matches[0]?.kickoffTime ?? 0).getTime()
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


const FlatMatchesSection = memo(function FlatMatchesSection({
  groups,
  locale,
  labels,
  isLoggedIn,
  activeStatusTab,
  searchQuery,
}: {
  groups: LeagueFixtureGroup[];
  locale: string;
  labels: MatchTableLabels;
  isLoggedIn: boolean;
  activeStatusTab: MatchStatusTab;
  searchQuery: string;
}) {
  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-[#0d0f14] p-10 text-center">
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
    <section className="overflow-hidden rounded-xl border border-gray-800/80 bg-[#07080b]">
      <div className="hidden md:grid grid-cols-[104px_minmax(180px,1fr)_92px_minmax(180px,1fr)_154px] items-center gap-3 border-b border-cyan-300/10 bg-[#0d111a] px-5 py-2.5 text-[11px] font-black uppercase tracking-wide text-gray-400">
        <div className="pl-1">{labels.dateTime}</div>
        <div className="text-right pr-3">{labels.home}</div>
        <div className="text-center">{labels.vs}</div>
        <div className="text-left pl-3">{labels.away}</div>
        <div className="text-right pr-4">{labels.predict}</div>
      </div>

      {groups.map((group) => (
        <div key={group.key}>
          <div className="relative overflow-hidden border-b border-cyan-300/10 bg-[#0c121d] px-4 py-2.5 sm:px-5">
            <div className="absolute inset-y-0 left-0 w-0.5 bg-cyan-300/70" />
            <div className="relative flex min-w-0 items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ApiLeagueLogo name={group.label} logo={group.logo} size="sm" />
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <p className="min-w-0 truncate text-sm font-black tracking-normal text-white">
                      {group.label}
                    </p>
                    {group.country ? (
                      <span className="shrink-0 rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                        {group.country}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              <span className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-white/10 bg-black/25 px-2.5 font-mono text-xs font-black text-cyan-100">
                <span>{group.matches.length}</span>
                <span className="font-sans text-[10px] uppercase tracking-wide text-cyan-200/75">
                  {labels.matches}
                </span>
              </span>
            </div>
          </div>
          <div className="divide-y divide-gray-800/30">
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
  const matchTime = useMemo(() => formatMatchTime(match, locale), [match, locale]);
  const matchDate = useMemo(() => formatMatchDate(match, locale), [match, locale]);
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
  const isUpcoming = statusGroup === MatchStatus.UPCOMING;
  const primaryActionHref = isUpcoming
    ? isLoggedIn
      ? predictMatchHref
      : `/${locale}/auth/login?next=${encodeURIComponent(predictMatchHref)}`
    : matchDetailHref;
  const primaryActionLabel = isUpcoming
    ? isLoggedIn
      ? labels.predict
      : labels.signInToPredict
    : statusGroup === MatchStatus.LIVE
      ? labels.matchCenter
      : labels.viewDetails;

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
      className="group relative cursor-pointer transition-all duration-200 outline-none"
    >
      {/* Desktop Grid Row */}
      <div
        className={cn(
          "hidden md:grid grid-cols-[104px_minmax(180px,1fr)_92px_minmax(180px,1fr)_154px] items-center gap-3 px-5 py-2.5 transition-all duration-200 border-l-2",
          statusGroup === MatchStatus.LIVE
            ? "border-l-green-500 bg-gradient-to-r from-green-500/[0.04] via-transparent to-transparent"
            : statusGroup === MatchStatus.UPCOMING
            ? "border-l-cyan-500/20 group-hover:border-l-cyan-400"
            : "border-l-transparent",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]",
          "hover:bg-[#121622] group-focus-visible:bg-[#121622]"
        )}
      >
        {/* Column 1: Time / Status */}
        <div className="flex items-center gap-3 pl-1">
          <div className="min-w-0">
          <span className="block whitespace-nowrap text-[10px] font-bold leading-none text-gray-500">
            {matchDate}
          </span>
          <span className="mt-1 block font-mono text-sm font-black tracking-normal text-cyan-200">
            {matchTime}
          </span>
          </div>
          <div className="mt-0.5">
            {statusGroup === MatchStatus.LIVE ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-green-300">
                <span className="h-1 w-1 rounded-full bg-green-400 live-status-dot" />
                {labels.live}
              </span>
            ) : (
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border border-white/5 bg-white/[0.03] text-gray-400",
                statusGroup === MatchStatus.POSTPONED && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                statusGroup === MatchStatus.CANCELLED && "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {statusLabel}
              </span>
            )}
          </div>
        </div>

        {/* Column 2: Home Team */}
        <div className="flex items-center justify-end gap-2 text-right min-w-0 pr-1">
          <span className="truncate text-sm font-bold text-gray-200 group-hover:text-cyan-200 transition-colors tracking-normal">
            {match.home.name}
          </span>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.home.name}
              logo={match.home.logo}
              size="xs"
              accent="cyan"
            />
          </div>
        </div>

        {/* Column 3: Score / VS Pill */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className={cn(
            "flex min-w-[62px] items-center justify-center px-2.5 py-1.5 rounded-lg border font-mono text-sm font-black tracking-normal transition-all duration-200",
            statusGroup === MatchStatus.LIVE
              ? "bg-green-500/15 border-green-500/35 text-green-400"
              : statusGroup === MatchStatus.FINISHED
              ? "bg-gray-800/20 border-gray-700/50 text-gray-300"
              : "bg-cyan-500/5 border-cyan-500/15 text-cyan-300"
          )}>
            {match.score.home !== null ? (
              <span className="font-extrabold tabular-nums">
                {match.score.home} - {match.score.away}
              </span>
            ) : (
              <span className="text-[11px] uppercase text-cyan-200 font-black px-1">
                {labels.vs}
              </span>
            )}
          </div>
          {statusDetail && (
            <span className="text-[9px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wide truncate max-w-[92px]">
              {statusDetail}
            </span>
          )}
        </div>

        {/* Column 4: Away Team */}
        <div className="flex items-center justify-start gap-2 text-left min-w-0 pl-1">
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.away.name}
              logo={match.away.logo}
              size="xs"
              accent="magenta"
            />
          </div>
          <span className="truncate text-sm font-bold text-gray-200 group-hover:text-magenta-200 transition-colors tracking-normal">
            {match.away.name}
          </span>
        </div>

        {/* Column 5: Actions / Navigation */}
        <div className="flex items-center justify-end gap-2 pr-1">
          <Link
            href={primaryActionHref}
            onClick={(event) => event.stopPropagation()}
            className={cn(
              "inline-flex h-8 min-w-[104px] items-center justify-center whitespace-nowrap rounded-lg border px-3 text-[11px] font-black tracking-normal transition-colors",
              isUpcoming
                ? "border-amber-300/30 bg-amber-300/12 text-amber-100 hover:border-amber-200/50"
                : statusGroup === MatchStatus.LIVE
                  ? "border-green-300/30 bg-green-300/10 text-green-100 hover:border-green-200/50"
                  : "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100 hover:border-cyan-200/40"
            )}
          >
            {primaryActionLabel}
          </Link>
        </div>
      </div>

      {/* Mobile Row Layout */}
      <div
        className={cn(
          "border-b border-gray-900/60 border-l-4 px-3.5 py-4 transition-all duration-200 md:hidden",
          statusGroup === MatchStatus.LIVE
            ? "border-l-green-500 bg-gradient-to-r from-green-500/[0.03] to-transparent"
          : statusGroup === MatchStatus.UPCOMING
            ? "border-l-cyan-500/20"
            : "border-l-transparent",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]"
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 truncate text-xs font-bold leading-none text-gray-500">
              {matchDate}
            </div>
            <div className="whitespace-nowrap text-base font-black leading-none text-cyan-200">
              {matchTime}
            </div>
            {statusDetail ? (
              <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {statusDetail}
              </div>
            ) : null}
          </div>
          {statusGroup === MatchStatus.LIVE ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-green-500/30 bg-green-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-green-300">
              <span className="h-1 w-1 rounded-full bg-green-400 live-status-dot" />
              {labels.live}
            </span>
          ) : (
            <span className={cn(
              "shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gray-300",
              statusGroup === MatchStatus.POSTPONED && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              statusGroup === MatchStatus.CANCELLED && "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {statusLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2.5">
          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
              <ApiTeamLogo
                name={match.home.name}
                logo={match.home.logo}
                size="sm"
                accent="cyan"
              />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-100">
              {match.home.name}
            </span>
          </div>

          <div className="flex justify-center">
            <div className={cn(
              "grid min-h-10 min-w-12 place-items-center rounded-xl border px-2 font-mono text-xs font-black",
              statusGroup === MatchStatus.LIVE
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : statusGroup === MatchStatus.FINISHED
                ? "bg-gray-800/20 border-gray-700/50 text-gray-300"
                : "bg-cyan-500/5 border-cyan-500/15 text-cyan-300"
            )}>
              {match.score.home !== null ? (
                <span className="tabular-nums">{match.score.home}-{match.score.away}</span>
              ) : (
                <span className="uppercase text-cyan-300">{labels.vs}</span>
              )}
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
              <ApiTeamLogo
                name={match.away.name}
                logo={match.away.logo}
                size="sm"
                accent="magenta"
              />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-100">
              {match.away.name}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="truncate text-xs font-semibold text-gray-500">
            {match.league.round ?? labels.viewDetails}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            <Link
              href={primaryActionHref}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                "inline-flex h-8 items-center justify-center rounded-lg border px-3 text-xs font-black tracking-wide transition-colors",
                isUpcoming
                  ? "border-amber-300/30 bg-amber-300/12 text-amber-100"
                  : statusGroup === MatchStatus.LIVE
                    ? "border-green-300/30 bg-green-300/10 text-green-100"
                    : "border-cyan-300/15 bg-cyan-300/[0.06] text-cyan-200"
              )}
            >
              {primaryActionLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
});

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

  return statusShort || statusLong || fallbackLabel;
}


function formatMatchTime(match: ApiFootballFixture, locale: string) {
  return formatTime(match.kickoffTime, locale);
}

function formatMatchDate(match: ApiFootballFixture, locale: string) {
  return formatDate(match.kickoffTime, locale);
}
