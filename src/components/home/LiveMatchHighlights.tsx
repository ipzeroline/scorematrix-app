"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types";
import type { ApiFootballFixture } from "@/lib/api-football";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";

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
  const apiMatches = fixtures
    .filter((fixture) => fixture.status === MatchStatus.LIVE)
    .map(mapFixtureToLiveMatch);
  const displayMatches = apiMode
    ? apiMatches
    : apiMatches.length > 0
      ? apiMatches
      : liveMatches;

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
          <div
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {displayMatches.map((match) => (
              <Link
                key={match.id}
                href={`/${locale}/livescore/${match.id}`}
                className="flex-shrink-0"
              >
                <Card neon="green" hover className="cyber-live-card relative w-64 overflow-hidden border-green-400/45 bg-[#07140f]">
                  <div className="cyber-live-card-scan absolute inset-0" />
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-300 via-cyan-300 to-green-300" />
                  <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-green-400/15 blur-2xl" />

                  <div className="relative">
                    {/* League badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-green-200/80 uppercase tracking-wider">
                        {match.league}
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
        </div>
      )}
    </div>
  );
}

function mapFixtureToLiveMatch(fixture: ApiFootballFixture): LiveMatch {
  return {
    id: buildFixtureSeoSlug(fixture),
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
