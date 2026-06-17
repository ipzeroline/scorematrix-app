"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, ChevronRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types";
import type { ApiFootballFixture } from "@/lib/api-football";

interface LiveMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  league: string;
  leagueLogo: string | null;
  status: MatchStatus;
}

interface LiveMatchHighlightsProps {
  fixtures: ApiFootballFixture[];
  initialError?: boolean;
}

type LiveFixturesResponse = {
  fixtures: ApiFootballFixture[];
  error?: string;
};

const LIVE_REFRESH_INTERVAL_MS = 45_000;

export function LiveMatchHighlights({
  fixtures,
  initialError = false,
}: LiveMatchHighlightsProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [currentFixtures, setCurrentFixtures] = useState(fixtures);
  const [hasError, setHasError] = useState(initialError);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const displayMatches = useMemo(
    () =>
      currentFixtures
        .filter((fixture) => fixture.status === MatchStatus.LIVE)
        .map(mapFixtureToLiveMatch),
    [currentFixtures]
  );

  const refreshFixtures = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);

    try {
      const response = await fetch("/api/football/fixtures/live", {
        cache: "no-store",
      });
      const data = (await response.json()) as LiveFixturesResponse;

      if (!response.ok) throw new Error(data.error);

      setCurrentFixtures(data.fixtures);
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshFixtures();
    };
    const interval = window.setInterval(refreshWhenVisible, LIVE_REFRESH_INTERVAL_MS);

    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [refreshFixtures]);

  return (
    <div className="flex flex-col gap-3">
      {/* Title row */}
      <div className="cyber-live-header relative overflow-hidden rounded-lg border border-lime-300/20 bg-[#07100e] px-3 py-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.26)]">
        <div className="absolute inset-0 cyber-live-header-scan" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lime-300 via-cyan-300 to-amber-300" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-300/70 to-transparent" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-lime-300/30 bg-lime-300/10 text-lime-200">
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-lime-300 shadow-[0_0_16px_rgba(190,242,100,0.95)] animate-ping" />
              <Activity size={17} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate bg-gradient-to-r from-lime-200 via-cyan-100 to-white bg-clip-text text-base font-black leading-tight text-transparent drop-shadow-[0_0_12px_rgba(190,242,100,0.22)] md:text-lg">
                {t("dashboard.liveNow")}
              </h2>
              <p className="truncate text-[11px] font-semibold text-lime-100/70">
                {t("matchDetail.liveAutoRefresh")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap rounded-md border border-lime-300/30 bg-lime-300/10 px-2 py-1 text-[11px] font-black text-lime-200 shadow-[0_0_14px_rgba(16,185,129,0.12)]">
              {t("dashboard.matchCount", { count: displayMatches.length })}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => void refreshFixtures(true)}
              disabled={isRefreshing}
              aria-label={t("livescore.sync")}
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {hasError && (
        <Card className="flex items-center justify-between gap-3 border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
          <span>{t("livescore.loadError")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refreshFixtures(true)}
            disabled={isRefreshing}
          >
            {t("common.retry")}
          </Button>
        </Card>
      )}

      {displayMatches.length === 0 && !hasError ? (
        <Card className="rounded-lg border-lime-300/15 bg-[#0b111d] p-4 text-xs font-semibold text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : displayMatches.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-lime-300/20 bg-[#080d16] shadow-[0_12px_36px_rgba(0,0,0,0.28)]">
          {displayMatches.map((match) => (
            <Link
              key={match.id}
              href={`/${locale}/livescore/match/${match.id}`}
              className="group block border-b border-white/10 px-2.5 py-2 transition-colors duration-150 last:border-b-0 hover:bg-lime-300/[0.06] sm:px-3"
            >
              <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_44px] items-center gap-1.5 sm:flex sm:justify-between sm:gap-3">
                {/* Left: Live Indicator & League */}
                <div className="flex min-w-0 shrink-0 items-center gap-2 sm:w-1/4 sm:gap-3">
                  {/* Live Indicator (green blinking dot + minute) */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="relative flex h-1.5 w-1.5 shrink-0">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-[11px] font-black text-lime-300 animate-pulse">
                      {match.minute}&apos;
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                    <ApiLeagueLogo name={match.league} logo={match.leagueLogo} size="xs" />
                    <span className="max-w-[120px] truncate text-xs font-semibold text-gray-400">
                      {match.league}
                    </span>
                  </div>
                </div>

                {/* Center: Teams and Live Score */}
                  <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 sm:gap-2.5">
                  {/* Home team */}
                  <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-right">
                    <span className="truncate text-[10px] font-bold text-gray-200 transition-colors group-hover:text-white sm:text-[13px]">
                      {match.homeTeam}
                    </span>
                    <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} size="xs" />
                  </div>

                  {/* Live Score Box */}
                  <div className="shrink-0 min-w-[52px] text-center sm:min-w-[64px]">
                    <span className="inline-block rounded-md border border-lime-300/30 bg-lime-300/10 px-1.5 py-0.5 text-[11px] font-black text-lime-200 shadow-[0_0_10px_rgba(16,185,129,0.08)] transition-colors group-hover:border-lime-300/50 sm:px-2.5 sm:text-xs">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  </div>

                  {/* Away team */}
                  <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-left">
                    <ApiTeamLogo name={match.awayTeam} logo={match.awayCrest} size="xs" />
                    <span className="truncate text-[10px] font-bold text-gray-200 transition-colors group-hover:text-white sm:text-[13px]">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Right: Live Status and Chevron Link */}
                <div className="hidden min-w-0 shrink-0 items-center justify-end gap-2 sm:flex sm:w-1/4 sm:gap-3">
                  <StatusBadge
                    status={match.status}
                    className="text-[9px] shrink-0 bg-green-500/15 text-green-300 border border-green-500/20"
                  />
                  <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded border border-border bg-black/20 group-hover:border-green-500/30 group-hover:text-green-300 transition-colors">
                    <ChevronRight size={12} className="text-gray-500 group-hover:text-green-300 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function mapFixtureToLiveMatch(fixture: ApiFootballFixture): LiveMatch {
  return {
    id: String(fixture.apiFixtureId ?? fixture.id),
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    homeScore: fixture.score.home ?? 0,
    awayScore: fixture.score.away ?? 0,
    minute: fixture.elapsed ?? 0,
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    status: fixture.status,
  };
}
