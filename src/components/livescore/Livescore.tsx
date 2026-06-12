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
    <div className="max-w-4xl mx-auto space-y-4">
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
                <div className="space-y-2 sm:space-y-1">
                  {leagueMatches.map((match, index) => {
                    const detailHref = buildMatchDetailHref(match, locale);

                    return (
                      <Link key={match.id} href={detailHref} className="block">
                        <Card
                          hover
                          className={cn(
                            "group overflow-hidden p-0 transition-transform active:scale-[0.99] sm:active:scale-100",
                            index % 2 === 0 ? "bg-[#12121a]" : "bg-cyan-500/[0.035]"
                          )}
                        >
                          <div className="sm:hidden">
                            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-black/20 px-3 py-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="relative flex h-2 w-2 shrink-0">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-50" />
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                                </span>
                                <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-green-300">
                                  {getFixtureStatusLabel(match, statusLabels)}
                                </span>
                              </div>
                              <span className="shrink-0 font-mono text-[10px] text-gray-500">
                                {formatTime(match.kickoffTime, locale)}
                              </span>
                            </div>

                            <div className="relative grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-start gap-2 px-3 py-4">
                              <MobileScoreboardTeam
                                name={match.home.name}
                                logo={match.home.logo}
                                accent="cyan"
                              />
                              <div className="relative flex flex-col items-center pt-1">
                                <span className="font-mono text-[28px] font-black leading-none tracking-tight text-white tabular-nums drop-shadow-[0_0_14px_rgba(34,211,238,0.22)]">
                                  {match.score.home !== null && match.score.away !== null
                                    ? `${match.score.home}:${match.score.away}`
                                    : t("common.vs")}
                                </span>
                                <span className="mt-2 font-mono text-[11px] font-black text-green-300">
                                  {formatElapsed(match)}
                                </span>
                              </div>
                              <MobileScoreboardTeam
                                name={match.away.name}
                                logo={match.away.logo}
                                accent="magenta"
                              />
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] bg-white/[0.015] px-3 py-2">
                              <span className="min-w-0 truncate text-[10px] text-gray-500">
                                {match.league.round || match.venue || match.league.country}
                              </span>
                              <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-cyan-300">
                                {formatDate(match.kickoffTime, locale)}
                                <ChevronRight size={13} aria-hidden="true" />
                              </span>
                            </div>
                          </div>

                          <div className="relative hidden min-h-[82px] grid-cols-[112px_minmax(0,1fr)_100px_minmax(0,1fr)_44px] items-center gap-3 px-4 py-3 sm:grid lg:grid-cols-[128px_minmax(0,1fr)_112px_minmax(0,1fr)_148px] lg:gap-4">
                            <div className="relative flex min-w-0 flex-col items-start gap-1.5">
                              <span className="truncate text-[11px] font-semibold text-gray-300">
                                {formatDate(match.kickoffTime, locale)}
                              </span>
                              <span className="whitespace-nowrap font-mono text-[11px] font-semibold text-gray-400">
                                {formatTime(match.kickoffTime, locale)}
                              </span>
                            </div>

                            <DesktopScoreboardTeam
                              name={match.home.name}
                              logo={match.home.logo}
                              accent="cyan"
                              side="home"
                            />

                            <div className="relative flex min-h-14 flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-black/35 px-2 transition-colors group-hover:border-white/15">
                              <span className="font-mono text-xl font-black leading-none tracking-tight text-white tabular-nums drop-shadow-[0_0_14px_rgba(34,211,238,0.18)] lg:text-2xl">
                                {match.score.home !== null && match.score.away !== null
                                  ? `${match.score.home}:${match.score.away}`
                                  : t("common.vs")}
                              </span>
                              <span className="mt-1.5 font-mono text-[11px] font-black text-green-300">
                                {formatElapsed(match)}
                              </span>
                            </div>

                            <DesktopScoreboardTeam
                              name={match.away.name}
                              logo={match.away.logo}
                              accent="magenta"
                              side="away"
                            />

                            <div className="relative flex min-w-0 items-center justify-end gap-2 lg:justify-between">
                              <div className="hidden min-w-0 lg:block">
                                <StatusBadge
                                  status={match.status}
                                  label={getFixtureStatusLabel(match, statusLabels)}
                                  className="max-w-full text-center text-[10px]"
                                />
                                <p className="mt-1.5 truncate text-right text-[10px] text-gray-600">
                                  {match.league.round || match.venue || match.league.country}
                                </p>
                              </div>
                              <div className="lg:hidden">
                                <StatusBadge
                                  status={match.status}
                                  label={getFixtureStatusLabel(match, statusLabels)}
                                  className="max-w-full px-2 text-center text-[9px]"
                                />
                              </div>
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/[0.08] bg-white/[0.025] text-gray-500 transition-colors group-hover:border-cyan-400/20 group-hover:text-cyan-300">
                                <ChevronRight size={15} aria-hidden="true" />
                              </span>
                            </div>
                          </div>
                        </Card>
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


function DesktopScoreboardTeam({
  name,
  logo,
  accent,
  side,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
  side: "home" | "away";
}) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 items-center gap-3",
        side === "home" ? "justify-end text-right" : "justify-start text-left"
      )}
    >
      {side === "away" && <ApiTeamLogo name={name} logo={logo} size="md" accent={accent} />}
      <span className="line-clamp-2 min-w-0 max-w-[180px] break-words text-[13px] font-semibold leading-tight text-white lg:max-w-[230px] lg:text-sm">
        {name}
      </span>
      {side === "home" && <ApiTeamLogo name={name} logo={logo} size="md" accent={accent} />}
    </div>
  );
}

function MobileScoreboardTeam({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="relative flex min-w-0 flex-col items-center gap-2 text-center">
      <div
        className={cn(
          "grid h-12 w-12 place-items-center rounded-2xl border bg-black/30 shadow-lg",
          accent === "cyan"
            ? "border-cyan-400/20 shadow-cyan-500/10"
            : "border-magenta-400/20 shadow-magenta-500/10"
        )}
      >
        <ApiTeamLogo name={name} logo={logo} size="md" accent={accent} />
      </div>
      <span className="line-clamp-2 min-h-8 max-w-full break-words text-[11px] font-semibold leading-4 text-gray-100">
        {name}
      </span>
    </div>
  );
}
