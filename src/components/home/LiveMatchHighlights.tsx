"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, ChevronRight, RefreshCw, Trophy } from "lucide-react";
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
        <div className="overflow-hidden rounded-xl border border-lime-300/20 bg-[#070b12] shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
          <div className="hidden grid-cols-[82px_minmax(190px,1fr)_92px_minmax(190px,1fr)_210px] items-center gap-3 border-b border-lime-300/10 bg-[#0a101a] px-5 py-3 text-xs font-black uppercase tracking-wide text-white md:grid">
            <span className="pl-1">{labels.time}</span>
            <span className="pr-3 text-right">{labels.home}</span>
            <span className="text-center">{labels.vs}</span>
            <span className="pl-3 text-left">{labels.away}</span>
            <span className="pr-4 text-right">{labels.detail}</span>
          </div>

          {leagueGroups.map((group) => (
            <div key={group.name} className="border-b border-lime-300/10 last:border-b-0">
              <div className="relative overflow-hidden border-b border-lime-300/10 bg-[linear-gradient(90deg,rgba(18,44,31,0.78),rgba(10,17,28,0.94)_62%,rgba(70,51,13,0.36))] px-5 py-3">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-lime-300 via-cyan-300 to-amber-300" />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-lime-300/20 bg-lime-300/[0.04] shadow-[0_0_20px_rgba(190,242,100,0.08)]">
                      <ApiLeagueLogo name={group.name} logo={group.logo} size="sm" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Trophy size={15} className="shrink-0 text-amber-300" />
                        <h3 className="truncate text-sm font-black uppercase tracking-[0.08em] text-white md:text-[15px]">
                          {group.name}
                        </h3>
                      </div>
                      <div className="mt-1.5 h-px w-28 max-w-full rounded-full bg-gradient-to-r from-lime-300 via-cyan-300 to-transparent" />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-lime-300/20 bg-[#0b1624]/80 px-2.5 py-1.5 text-xs font-black text-lime-100">
                    {group.matches.length} {labels.matches}
                  </span>
                </div>
              </div>

              {group.matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/${locale}/livescore/match/${match.id}`}
                  className="group block border-b border-white/[0.06] bg-[#07090d] transition-colors duration-150 last:border-b-0 hover:bg-[#101a18]"
                >
                  <div className="hidden min-w-0 grid-cols-[82px_minmax(190px,1fr)_92px_minmax(190px,1fr)_210px] items-center gap-3 px-5 py-3 md:grid">
                    <div className="flex min-w-0 flex-col items-start justify-center gap-1 md:pl-1">
                      <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black tracking-wider text-lime-300">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                        </span>
                        {match.minute}&apos;
                      </span>
                      <StatusBadge
                        status={match.status}
                        className="w-fit shrink-0 border border-green-500/20 bg-green-500/15 text-[8px] text-green-300"
                      />
                    </div>

                    <LiveTeamCell name={match.homeTeam} logo={match.homeCrest} align="right" />

                    <div className="text-center">
                      <span className="inline-flex min-w-[58px] items-center justify-center rounded-lg border border-lime-300/30 bg-lime-300/10 px-2.5 py-1.5 font-mono text-xs font-black tracking-wider text-lime-100 shadow-[0_0_18px_rgba(190,242,100,0.08)]">
                        {match.homeScore} - {match.awayScore}
                      </span>
                      <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 md:block">
                        LIVE
                      </span>
                    </div>

                    <LiveTeamCell name={match.awayTeam} logo={match.awayCrest} align="left" className="hidden md:flex" />

                    <div className="flex justify-end">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/10 text-lime-100 transition-colors group-hover:border-lime-200/50 group-hover:bg-lime-300/15">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-l-lime-500/30 px-3.5 py-4 md:hidden">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-base font-black leading-none text-lime-300">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-400" />
                          </span>
                          {match.minute}&apos;
                        </div>
                        <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          LIVE
                        </div>
                      </div>
                      <StatusBadge
                        status={match.status}
                        className="shrink-0 border border-green-500/20 bg-green-500/15 text-[10px] text-green-300"
                      />
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2.5">
                      <LiveMobileTeamCell name={match.homeTeam} logo={match.homeCrest} />
                      <div className="flex justify-center">
                        <span className="grid min-h-10 min-w-12 place-items-center rounded-xl border border-lime-300/30 bg-lime-300/10 px-2 font-mono text-xs font-black text-lime-100">
                          {match.homeScore}-{match.awayScore}
                        </span>
                      </div>
                      <LiveMobileTeamCell name={match.awayTeam} logo={match.awayCrest} />
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-white/[0.06] pt-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-lime-300/25 bg-lime-300/10 text-lime-100">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
      <div className="mb-1.5 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} size="sm" />
      </div>
      <span className="block truncate text-center text-sm font-black leading-tight text-slate-100">
        {name}
      </span>
    </div>
  );
}

function getBoardLabels(locale: string) {
  if (locale === "th") {
    return {
      time: "เวลา",
      home: "เจ้าบ้าน",
      vs: "VS",
      away: "ทีมเยือน",
      detail: "รายละเอียด",
      matches: "คู่",
    };
  }

  return {
    time: "Time",
    home: "Home",
    vs: "VS",
    away: "Away",
    detail: "Details",
    matches: "matches",
  };
}
