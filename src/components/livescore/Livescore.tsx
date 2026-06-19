"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity, ChevronRight, RefreshCw, Search } from "lucide-react";
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

  const filtered = liveMatches.filter((m) => {
    if (league && m.league.name !== league) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.league.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const leagues = [...new Set(liveMatches.map((m) => m.league.name))];

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold font-display text-white">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-green-400/30 bg-green-400/10 text-green-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
              <Activity
                size={20}
                strokeWidth={2.35}
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.75)]"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 truncate">{t("livescore.title")}</span>
          </h1>
        </div>
        <div className="flex items-center justify-end gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/[0.06] px-2.5 py-1 text-[11px] font-semibold text-green-200">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            {t("dashboard.matchCount", { count: liveMatches.length })}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void loadFixtures()}
            disabled={isLoading}
            className="w-fit"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            {t("livescore.sync")}
          </Button>
        </div>
      </div>

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

      <div className="flex gap-3 flex-wrap">
        <Select
          options={[
            { value: "", label: t("livescore.allLeagues") },
            ...leagues.map((l) => ({ value: l, label: l })),
          ]}
          value={league}
          onChange={setLeague}
          placeholder={t("livescore.filterLeague")}
          className="min-w-[180px]"
        />
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            placeholder={t("livescore.searchTeams")}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="h-[158px] animate-pulse bg-white/[0.03] sm:h-[74px]" />
          ))}
        </div>
      ) : hasError && liveMatches.length === 0 ? null : filtered.length === 0 ? (
        <EmptyState
          title={t("livescore.noMatches")}
          description={t("livescore.tryAdjustingFilters")}
        />
      ) : (
        <div className="space-y-4">
          {[...new Set(filtered.map((m) => m.league.name))].map((leagueName) => {
            const leagueMatches = filtered.filter((m) => m.league.name === leagueName);
            const leagueInfo = leagueMatches[0]?.league;
            return (
              <div key={leagueName}>
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_42%),linear-gradient(90deg,rgba(34,211,238,0.08),rgba(18,18,26,0.96)_52%,rgba(217,70,239,0.08))] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <ApiLeagueLogo
                      name={leagueName}
                      logo={leagueInfo?.logo}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-white">
                        {leagueName}
                      </h3>
                      <span className="block truncate text-[10px] text-gray-500">
                        {leagueInfo?.country}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-cyan-500/20 bg-black/25 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                    {leagueMatches.length} matches
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-border bg-surface divide-y divide-border/60">
                  {leagueMatches.map((match) => {
                    const detailHref = buildMatchDetailHref(match, locale);

                    return (
                      <Link
                        key={match.id}
                        href={detailHref}
                        className="group block bg-surface hover:bg-[#12121a]/40 transition-all duration-150 px-4 py-2 sm:py-2.5"
                      >
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          {/* Left: Time and League */}
                          <div className="flex items-center gap-2 sm:gap-3 w-[55px] sm:w-1/4 shrink-0 min-w-0">
                            <div className="flex flex-col gap-0.5 min-w-[50px] sm:min-w-[70px]">
                              <span className="font-mono text-sm font-bold text-cyan-300">
                                {formatTime(match.kickoffTime, locale)}
                              </span>
                              <span className="text-[10px] text-gray-500 font-medium truncate">
                                {formatDate(match.kickoffTime, locale)}
                              </span>
                            </div>
                            <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                              <ApiLeagueLogo name={match.league.name} logo={match.league.logo} size="xs" />
                              <span className="text-xs text-gray-400 truncate max-w-[120px]">
                                {match.league.name}
                              </span>
                            </div>
                          </div>

                          {/* Center: Teams and Score/VS */}
                          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0 px-1">
                            {/* Home team */}
                            <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-right">
                              <span className="text-xs sm:text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                                {match.home.name}
                              </span>
                              <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="xs" />
                            </div>

                            {/* Score or VS Box with elapsed time */}
                            <div className="shrink-0 min-w-[54px] sm:min-w-[64px] text-center flex flex-col items-center">
                              <span className="inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded bg-black/40 border border-border/80 font-mono text-[10px] sm:text-xs font-bold text-white group-hover:border-cyan-500/30 transition-colors">
                                {match.score.home !== null && match.score.away !== null
                                  ? `${match.score.home} - ${match.score.away}`
                                  : t("common.vs")}
                              </span>
                              <span className="mt-1 font-mono text-[9px] font-bold text-green-400">
                                {formatElapsed(match)}
                              </span>
                            </div>

                            {/* Away team */}
                            <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-left">
                              <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="xs" />
                              <span className="text-xs sm:text-sm font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                                {match.away.name}
                              </span>
                            </div>
                          </div>

                          {/* Right: Status and Chevron Link */}
                          <div className="flex items-center justify-end gap-2 sm:gap-3 w-[75px] sm:w-1/4 shrink-0 min-w-0">
                            <StatusBadge
                              status={getFixtureStatusGroup(match)}
                              label={getFixtureStatusLabel(match, statusLabels)}
                              className="text-[9px] sm:text-[10px] shrink-0"
                            />
                            <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded border border-border bg-black/20 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                              <ChevronRight size={12} className="text-gray-500 group-hover:text-cyan-300 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
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
