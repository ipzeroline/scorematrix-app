"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, ChevronRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types";
import type { ApiFootballFixture } from "@/lib/api-football";
import { formatDate } from "@/lib/utils";

interface LiveMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  kickoffDate: string;
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
        .map((fixture) => mapFixtureToLiveMatch(fixture, locale)),
    [currentFixtures, locale]
  );
  const leagueGroups = useMemo(() => groupLiveMatchesByLeague(displayMatches), [displayMatches]);
  const labels = getBoardLabels(locale);

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
      <div className="cyber-live-header relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0d14]/95 px-3 py-2 shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-0 cyber-live-header-scan" />
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-lime-300 via-cyan-300 to-amber-300" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/[0.08] text-lime-200">
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-lime-300 shadow-[0_0_12px_rgba(190,242,100,0.9)] animate-ping" />
              <Activity size={15} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black leading-tight text-lime-100 md:text-base">
                {t("dashboard.liveNow")}
              </h2>
              <p className="truncate text-[11px] font-semibold text-lime-100/70">
                {t("matchDetail.liveAutoRefresh")}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="whitespace-nowrap rounded-md border border-lime-300/25 bg-lime-300/[0.08] px-2 py-1 text-[11px] font-black text-lime-100">
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
        <div className="space-y-2">
          {leagueGroups.map((group) => (
            <div key={group.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3 px-1 py-1">
                <div className="flex min-w-0 items-center gap-2.5">
                  <ApiLeagueLogo name={group.name} logo={group.logo} size="xl" />
                  <span className="truncate text-[13px] font-black uppercase tracking-[0.11em] text-lime-100/85 sm:text-sm">
                    {group.name}
                  </span>
                </div>
                <span className="shrink-0 rounded-md border border-lime-300/20 bg-lime-300/[0.06] px-2 py-1 text-[10px] font-black text-lime-100/80">
                  {group.matches.length} {labels.matches}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-lime-300/20 bg-[#070b12] shadow-[0_16px_38px_rgba(0,0,0,0.3)]">
                <div className="hidden min-w-0 grid-cols-[104px_minmax(220px,1fr)_104px_minmax(220px,1fr)_44px] items-center gap-3 border-b border-lime-300/10 bg-[#0d111a] px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-300 md:grid">
                  <div>
                    {t("matches.dateFilter")} / {t("football.table.time")}
                  </div>
                  <div className="text-right">{t("football.table.home")}</div>
                  <div className="text-center">VS</div>
                  <div className="text-left">{t("football.table.away")}</div>
                  <div className="text-center">{labels.action}</div>
                </div>
                {group.matches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/${locale}/livescore/match/${match.id}`}
                    className="group block border-b border-white/[0.06] bg-[linear-gradient(90deg,rgba(18,44,31,0.72),rgba(7,11,18,0.98)_48%,rgba(9,12,18,0.98))] transition-colors duration-150 last:border-b-0 hover:bg-[#101a18]"
                  >
                    <div className="hidden min-w-0 grid-cols-[104px_minmax(220px,1fr)_104px_minmax(220px,1fr)_44px] items-center gap-3 px-4 py-3 md:grid">
                      <div className="flex min-w-0 flex-col items-start justify-center gap-1">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-sm font-black leading-none tracking-wider text-lime-300">
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
                          </span>
                          {match.minute}&apos;
                        </span>
                        <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-200">
                          Live
                        </span>
                        <span className="whitespace-nowrap text-[10px] font-bold leading-none text-slate-500">
                          {match.kickoffDate}
                        </span>
                      </div>

                      <LiveTeamCell name={match.homeTeam} logo={match.homeCrest} align="right" />

                      <div className="text-center">
                        <span className="inline-flex min-w-[72px] items-center justify-center rounded-xl border border-lime-300/35 bg-lime-300/10 px-3 py-2 font-mono text-base font-black tracking-wider text-lime-50 shadow-[0_0_18px_rgba(190,242,100,0.08)]">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      </div>

                      <LiveTeamCell name={match.awayTeam} logo={match.awayCrest} align="left" />

                      <div className="flex justify-end">
                        <span className="grid h-9 w-9 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/10 text-lime-100 transition-colors group-hover:border-lime-200/50 group-hover:bg-lime-300/15">
                          <ChevronRight size={15} />
                        </span>
                      </div>
                    </div>

                    <div className="border-l-2 border-l-lime-400/55 px-3 py-3 md:hidden">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2">
                          <span className="relative flex h-2.5 w-2.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-lime-400" />
                          </span>
                          <span className="font-mono text-sm font-black leading-none text-lime-300">
                            {match.minute}&apos;
                          </span>
                          <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-200">
                            Live
                          </span>
                        </div>
                        <span className="truncate text-[10px] font-bold leading-none text-slate-500">
                          {match.kickoffDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_62px_minmax(0,1fr)_30px] items-center gap-2">
                        <LiveMobileTeamCell name={match.homeTeam} logo={match.homeCrest} />
                        <div className="flex justify-center">
                          <span className="grid min-h-9 min-w-[56px] place-items-center rounded-xl border border-lime-300/30 bg-lime-300/10 px-2 font-mono text-sm font-black text-lime-50">
                            {match.homeScore}-{match.awayScore}
                          </span>
                        </div>
                        <LiveMobileTeamCell name={match.awayTeam} logo={match.awayCrest} />
                        <span className="grid h-8 w-8 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/10 text-lime-100">
                          <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function mapFixtureToLiveMatch(fixture: ApiFootballFixture, locale = "en-US"): LiveMatch {
  return {
    id: String(fixture.apiFixtureId ?? fixture.id),
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    homeScore: fixture.score.home ?? 0,
    awayScore: fixture.score.away ?? 0,
    minute: fixture.elapsed ?? 0,
    kickoffDate: formatDate(fixture.kickoffTime, locale),
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    status: fixture.status,
  };
}

function groupLiveMatchesByLeague(matches: LiveMatch[]) {
  const groups = new Map<string, { name: string; logo: string | null; matches: LiveMatch[] }>();

  for (const match of matches) {
    if (!groups.has(match.league)) {
      groups.set(match.league, {
        name: match.league,
        logo: match.leagueLogo,
        matches: [],
      });
    }
    groups.get(match.league)?.matches.push(match);
  }

  return [...groups.values()];
}

function LiveTeamCell({
  name,
  logo,
  align,
  className = "",
}: {
  name: string;
  logo: string;
  align: "left" | "right";
  className?: string;
}) {
  const isRight = align === "right";

  return (
    <div className={`min-w-0 items-center gap-2 ${isRight ? "justify-end text-right" : "justify-start text-left"} flex ${className}`}>
      {isRight ? (
        <>
          <span className="truncate text-sm font-black tracking-wide text-slate-200 transition-colors group-hover:text-white">
            {name}
          </span>
          <ApiTeamLogo name={name} logo={logo} size="xs" />
        </>
      ) : (
        <>
          <ApiTeamLogo name={name} logo={logo} size="xs" />
          <span className="truncate text-sm font-black tracking-wide text-slate-200 transition-colors group-hover:text-white">
            {name}
          </span>
        </>
      )}
    </div>
  );
}

function LiveMobileTeamCell({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} size="xs" />
      </div>
      <span className="block truncate text-center text-xs font-black leading-tight text-slate-100">
        {name}
      </span>
    </div>
  );
}

function getBoardLabels(locale: string) {
  if (locale === "th") {
    return {
      matches: "คู่",
      action: "ดู",
    };
  }

  return {
    matches: "matches",
    action: "View",
  };
}
