"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Activity,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import type { ApiFootballFixture } from "@/lib/api-football";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
} from "@/lib/football-status";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import {
  cn,
  formatDate,
  formatTime,
} from "@/lib/utils";

export interface FixturesPayload {
  fetchedAt: string;
  count: number;
  fixtures: ApiFootballFixture[];
  rateLimit: {
    requestsRemaining: string | null;
    requestsLimit: string | null;
  };
  error?: string;
}

interface LivescoreProps {
  initialPayload: FixturesPayload;
  locale: string;
}

export function Livescore({ initialPayload, locale }: LivescoreProps) {
  const t = useTranslations();
  const statusLabels = useMemo(() => buildFootballStatusLabels(t), [t]);
  const actionCopy = getLivescoreActionCopy(locale);
  const [league, setLeague] = useState("");
  const [search, setSearch] = useState("");
  const [payload, setPayload] = useState(initialPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(Boolean(initialPayload.error));

  const loadFixtures = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/football/fixtures/live", {
        cache: "no-store",
      });
      const data = (await response.json()) as FixturesPayload;

      if (!response.ok) {
        throw new Error(data.error);
      }

      setPayload(data);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadFixtures(false);
    };
    const interval = window.setInterval(refreshWhenVisible, 45_000);

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadFixtures, locale]);

  const apiMatches = payload.fixtures;
  const liveMatches = useMemo(
    () => apiMatches.filter((match) => getFixtureStatusGroup(match) === MatchStatus.LIVE),
    [apiMatches]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return liveMatches.filter((m) => {
      if (league && m.league.name !== league) return false;
      if (q) {
        return (
          m.home.name.toLowerCase().includes(q) ||
          m.away.name.toLowerCase().includes(q) ||
          m.league.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [league, liveMatches, search]);

  const leagues = useMemo(
    () => [...new Set(liveMatches.map((m) => m.league.name))].sort((a, b) => a.localeCompare(b)),
    [liveMatches]
  );
  const hasFilters = Boolean(league || search.trim());
  const lastUpdatedLabel = useMemo(
    () => formatTime(payload.fetchedAt, locale),
    [locale, payload.fetchedAt]
  );

  return (
    <div className="w-full space-y-4">
      <Card className="relative overflow-hidden border-green-400/15 bg-[#0b111d] p-4 sm:p-5">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-green-300/80 via-cyan-300/45 to-transparent" />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-green-400/25 bg-green-400/10 text-green-300 shadow-[0_0_18px_rgba(16,185,129,0.12)]">
              <Activity size={20} strokeWidth={2.35} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-2xl font-black text-white sm:text-3xl">
                {t("livescore.title")}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/[0.06] px-2.5 py-1 text-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  {t("dashboard.matchCount", { count: liveMatches.length })}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-2.5 py-1 text-cyan-100">
                  <Clock3 size={13} aria-hidden="true" />
                  {t("matches.lastUpdated")} {lastUpdatedLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-gray-700/70 bg-black/20 px-3 py-1.5 text-xs font-semibold text-gray-300">
              {filtered.length} / {liveMatches.length} {t("matches.metricMatches")}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void loadFixtures()}
              disabled={isLoading}
              className="border-cyan-400/25 bg-cyan-400/[0.04] text-cyan-100 hover:border-cyan-300/50 hover:text-cyan-200"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              {t("livescore.sync")}
            </Button>
          </div>
        </div>
      </Card>

      {hasError && (
        <Card className="flex items-center justify-between gap-3 border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
          <span>{t("livescore.loadError")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadFixtures()}
            disabled={isLoading}
          >
            {t("common.retry")}
          </Button>
        </Card>
      )}

      <Card className="border-gray-800/90 bg-[#080b12] p-3 sm:p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">{t("matches.filtersTitle")}</h2>
            <p className="text-xs text-gray-500">{t("matches.filtersDescription")}</p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setLeague("");
                setSearch("");
              }}
              className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-gray-700/80 px-2.5 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-200"
            >
              <X size={13} aria-hidden="true" />
              {t("matches.clearFilters")}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            options={[
              { value: "", label: t("livescore.allLeagues") },
              ...leagues.map((l) => ({ value: l, label: l })),
            ]}
            value={league}
            onChange={setLeague}
            placeholder={t("livescore.filterLeague")}
            className="min-w-[210px]"
          />
          <div className="relative min-w-[220px] flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              aria-hidden="true"
            />
            <input
              className="min-h-10 w-full rounded-lg border border-gray-700 bg-[#05070c] py-2 pl-9 pr-10 text-sm text-white placeholder-gray-500 transition-colors focus:border-cyan-500/50 focus:outline-none"
              placeholder={t("livescore.searchTeams")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={t("matches.clearSearch")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-gray-500 transition-colors hover:bg-white/5 hover:text-cyan-200"
              >
                <X size={13} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="h-[158px] animate-pulse bg-white/[0.03] sm:h-[74px]" />
          ))}
        </div>
      ) : hasError && liveMatches.length === 0 ? null : filtered.length === 0 ? (
        <EmptyState
          icon={<Activity size={28} />}
          title={t("livescore.noMatches")}
          description={t("livescore.tryAdjustingFilters")}
          action={
            <Link
              href={`/${locale}/matches`}
              className="inline-flex min-h-9 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-400/[0.08] px-3 py-2 text-xs font-semibold text-cyan-100 transition-colors hover:border-cyan-300/60 hover:text-cyan-50"
            >
              {t("matches.title")}
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {[...new Set(filtered.map((m) => m.league.name))].map((leagueName) => {
            const leagueMatches = filtered.filter((m) => m.league.name === leagueName);
            const leagueInfo = leagueMatches[0]?.league;
            return (
              <div key={leagueName} className="space-y-2">
                <div className="flex items-center justify-between gap-3 px-1 py-1">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ApiLeagueLogo
                      name={leagueName}
                      logo={leagueInfo?.logo}
                      size="xl"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black tracking-wide text-white">
                        {leagueName}
                      </h3>
                      <span className="block truncate text-xs font-semibold text-cyan-100/60">
                        {leagueInfo?.country}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-cyan-500/20 bg-black/30 px-2.5 py-1.5 text-xs font-bold text-cyan-200">
                    {leagueMatches.length} {t("matches.metricMatches")}
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-800/90 bg-[#070a10]">
                  <div className="hidden lg:grid grid-cols-[180px_minmax(0,1fr)_190px] items-center gap-3 border-b border-cyan-300/10 bg-[#0d111a] px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-300">
                    <div>
                      {t("matches.dateFilter")} / {t("football.table.time")}
                    </div>
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-3">
                      <div className="text-right">{t("football.table.home")}</div>
                      <div className="text-center">VS</div>
                      <div className="text-left">{t("football.table.away")}</div>
                    </div>
                    <div className="text-right">{actionCopy.header}</div>
                  </div>
                  <div className="divide-y divide-gray-800/70">
                    {leagueMatches.map((match) => {
                      const detailHref = buildMatchDetailHref(match, locale);

                      return (
                        <Link
                          key={match.id}
                          href={detailHref}
                          className="group block bg-[#070a10] px-3 py-3 transition-colors duration-150 hover:bg-[#101722] sm:px-4"
                        >
                        <div className="grid items-center gap-3 lg:grid-cols-[180px_minmax(0,1fr)_190px]">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex min-w-[64px] flex-col gap-0.5">
                              <span className="font-mono text-sm font-black text-cyan-200">
                                {formatTime(match.kickoffTime, locale)}
                              </span>
                              <span className="truncate text-[11px] font-semibold text-gray-500">
                                {formatDate(match.kickoffTime, locale)}
                              </span>
                            </div>
                          </div>

                          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                            <div className="flex min-w-0 items-center justify-end gap-1.5 text-right sm:gap-2.5">
                              <span className="truncate text-sm font-bold text-gray-200 transition-colors group-hover:text-white">
                                {match.home.name}
                              </span>
                              <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="xs" />
                            </div>

                            <div className="flex min-w-[76px] flex-col items-center text-center">
                              <span className="inline-flex min-h-9 min-w-[64px] items-center justify-center rounded-lg border border-gray-700/90 bg-black/45 px-2 font-mono text-sm font-black text-white transition-colors group-hover:border-cyan-500/40">
                                {match.score.home !== null && match.score.away !== null
                                  ? `${match.score.home} - ${match.score.away}`
                                  : t("common.vs")}
                              </span>
                              <span className="mt-1 font-mono text-[10px] font-black text-green-300">
                                {formatElapsed(match)}
                              </span>
                            </div>

                            <div className="flex min-w-0 items-center justify-start gap-1.5 text-left sm:gap-2.5">
                              <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="xs" />
                              <span className="truncate text-sm font-bold text-gray-200 transition-colors group-hover:text-white">
                                {match.away.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex min-w-0 items-center justify-between gap-2 lg:justify-end">
                            <StatusBadge
                              status={getFixtureStatusGroup(match)}
                              label={getFixtureStatusLabel(match, statusLabels)}
                              className="shrink-0 text-[9px] sm:text-[10px]"
                            />
                            <span className={cn(
                              "inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.05] px-2.5 text-xs font-bold text-cyan-100 transition-colors",
                              "group-hover:border-cyan-300/50 group-hover:text-cyan-50"
                            )}>
                              <span className="hidden sm:inline">{actionCopy.button}</span>
                              <ChevronRight size={14} aria-hidden="true" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildMatchDetailHref(match: ApiFootballFixture, locale: string): string {
  return match.apiFixtureId
    ? `/${locale}/livescore/match/${match.apiFixtureId}`
    : `/${locale}/livescore/${buildFixtureSeoSlug(match)}`;
}

function formatElapsed(match: ApiFootballFixture): string {
  if (match.elapsed === null) return match.statusShort;
  return `${match.elapsed}${match.statusExtra ? `+${match.statusExtra}` : ""}'`;
}

function getLivescoreActionCopy(locale: string) {
  switch (locale) {
    case "th":
      return { header: "สถานะ / ดู", button: "ดูแมตช์" };
    case "lo":
      return { header: "ສະຖານະ / ເບິ່ງ", button: "ເບິ່ງແມັດ" };
    case "my":
      return { header: "အခြေအနေ / ကြည့်ရန်", button: "ပွဲကြည့်ရန်" };
    case "km":
      return { header: "ស្ថានភាព / មើល", button: "មើលប្រកួត" };
    case "zh":
      return { header: "状态 / 查看", button: "查看比赛" };
    default:
      return { header: "Status / View", button: "View match" };
  }
}
