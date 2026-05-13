"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
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
  status: MatchStatus;
}

const liveMatches: LiveMatch[] = [
  {
    id: "live-1",
    homeTeam: "London United",
    homeCrest: "",
    awayTeam: "Mersey City",
    awayCrest: "",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    league: "Premier",
    status: MatchStatus.LIVE,
  },
  {
    id: "live-2",
    homeTeam: "Real Catalonia",
    homeCrest: "",
    awayTeam: "Atletico Madrid B",
    awayCrest: "",
    homeScore: 1,
    awayScore: 1,
    minute: 34,
    league: "La Liga",
    status: MatchStatus.LIVE,
  },
  {
    id: "live-3",
    homeTeam: "FC Bayern Stadt",
    homeCrest: "",
    awayTeam: "Dortmund 09",
    awayCrest: "",
    homeScore: 3,
    awayScore: 0,
    minute: 52,
    league: "Bundesliga",
    status: MatchStatus.LIVE,
  },
  {
    id: "live-4",
    homeTeam: "AC Milano Rosso",
    homeCrest: "",
    awayTeam: "Juventus Torino",
    awayCrest: "",
    homeScore: 0,
    awayScore: 0,
    minute: 15,
    league: "Serie A",
    status: MatchStatus.LIVE,
  },
  {
    id: "live-5",
    homeTeam: "Paris Saint-Germain B",
    homeCrest: "",
    awayTeam: "Olympique Lyon",
    awayCrest: "",
    homeScore: 2,
    awayScore: 2,
    minute: 78,
    league: "Ligue 1",
    status: MatchStatus.LIVE,
  },
];

interface LiveMatchHighlightsProps {
  fixtures?: ApiFootballFixture[];
  apiMode?: boolean;
}

export function LiveMatchHighlights({
  fixtures = [],
  apiMode = false,
}: LiveMatchHighlightsProps) {
  const locale = useLocale();
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const apiMatches = fixtures
    .filter((fixture) => fixture.status === MatchStatus.LIVE)
    .map(mapFixtureToLiveMatch);
  const displayMatches = apiMode
    ? apiMatches
    : apiMatches.length > 0
      ? apiMatches
      : liveMatches;

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 300);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || displayMatches.length <= 1) return;

    const interval = window.setInterval(() => {
      const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;

      el.scrollTo({
        left: isAtEnd ? 0 : el.scrollLeft + 292,
        behavior: "smooth",
      });
      setTimeout(updateScrollButtons, 420);
    }, 3600);

    return () => window.clearInterval(interval);
  }, [displayMatches.length, updateScrollButtons]);

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
          </div>
        </div>
      </div>

      {displayMatches.length === 0 ? (
        <Card className="border-gray-800/80 p-5 text-sm text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : (
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a2e]/90 border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center justify-center"
            aria-label={t("common.scrollLeft")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a2e]/90 border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center justify-center"
            aria-label={t("common.scrollRight")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {displayMatches.map((match) => (
            <Link
              key={match.id}
              href={`/${locale}/livescore/${match.id}`}
              className="flex-shrink-0"
            >
              <Card
                neon="cyan"
                hover
                className="cyber-live-card w-64"
              >
                {/* League badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {match.league}
                  </span>
                  <StatusBadge status={match.status} />
                </div>

                {/* Teams and score */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} size="sm" />
                    <span className="text-sm text-gray-300 text-center truncate w-full">
                      {match.homeTeam}
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-2xl font-bold font-mono text-white">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <span className="text-xs text-green-400 font-mono">
                      {match.minute}&apos;
                    </span>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    <ApiTeamLogo name={match.awayTeam} logo={match.awayCrest} size="sm" />
                    <span className="text-sm text-gray-300 text-center truncate w-full">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
      )}
    </div>
  );
}

function mapFixtureToLiveMatch(fixture: ApiFootballFixture): LiveMatch {
  return {
    id: fixture.id,
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    homeScore: fixture.score.home ?? 0,
    awayScore: fixture.score.away ?? 0,
    minute: fixture.elapsed ?? 0,
    league: fixture.league.name,
    status: fixture.status,
  };
}
