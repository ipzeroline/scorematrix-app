"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";
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
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="cyber-live-header relative overflow-hidden rounded-xl border border-cyan-500/20 bg-[#070a10] px-4 py-3">
        <div className="absolute inset-0 cyber-live-header-scan" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-green-300/70 to-transparent" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-70 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.95)]" />
            </span>
            <h2
              className="font-display truncate whitespace-nowrap text-xl font-bold tracking-normal text-white text-glow-cyan"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("dashboard.liveNow")}
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap rounded-lg border border-green-400/30 bg-green-500/10 px-3 py-1 font-mono text-sm font-bold text-green-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
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
        <Card className="border-gray-800/80 p-5 text-sm text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : displayMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {displayMatches.map((match) => (
            <Link
              key={match.id}
              href={`/${locale}/livescore/match/${match.id}`}
            >
              <Card neon="green" hover className="cyber-live-card relative overflow-hidden border-green-400/45 bg-[#07140f]">
                  <div className="cyber-live-card-scan absolute inset-0" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-300 via-cyan-300 to-green-300" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-green-400/15 blur-2xl" />

                  <div className="relative">
                    {/* League badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex min-w-0 items-center gap-1.5 text-[10px] uppercase tracking-wider text-green-200/80">
                        <ApiLeagueLogo
                          name={match.league}
                          logo={match.leagueLogo}
                          size="xs"
                        />
                        <span className="truncate">{match.league}</span>
                      </span>
                      <StatusBadge status={match.status} />
                    </div>

                    {/* Teams and score */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} size="sm" />
                        <span className="text-sm text-white text-center truncate w-full">
                          {match.homeTeam}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-2xl font-bold font-mono text-white text-glow-cyan">
                          {match.homeScore} - {match.awayScore}
                        </span>
                        <span className="rounded-full border border-green-300/40 bg-green-400/15 px-2 py-0.5 text-xs font-bold text-green-200 font-mono">
                          {match.minute}&apos;
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                        <ApiTeamLogo name={match.awayTeam} logo={match.awayCrest} size="sm" />
                        <span className="text-sm text-white text-center truncate w-full">
                          {match.awayTeam}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
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
