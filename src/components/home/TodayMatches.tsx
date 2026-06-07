"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import type { ApiFootballFixture } from "@/lib/api-football";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
} from "@/lib/football-status";
import { formatDate, formatMatchTimeWithZone } from "@/lib/utils";
import { MatchStatus } from "@/types/common";

interface TodayMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  kickoffDate?: string;
  kickoffTime: string;
  league: string;
  leagueLogo: string | null;
  leagueEmoji: string;
  status: MatchStatus | string;
  statusShort?: string | null;
  statusLabel?: string;
  score: {
    home: number | null;
    away: number | null;
  };
}

interface LeagueTab {
  name: string;
  logo: string | null;
}

interface TodayMatchesProps {
  fixtures?: ApiFootballFixture[];
}

export function TodayMatches({ fixtures = [] }: TodayMatchesProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("All");
  const statusLabels = buildFootballStatusLabels(t);
  const apiMatches = fixtures.map((fixture) => ({
    ...mapFixtureToTodayMatch(fixture, locale),
    status: getFixtureStatusGroup(fixture),
    statusShort: fixture.statusShort,
    statusLabel: getFixtureStatusLabel(fixture, statusLabels),
  }));
  const matches = apiMatches;
  const leagueTabs = buildLeagueTabs(apiMatches);

  const filtered =
    activeTab === "All"
      ? matches
      : matches.filter((m) => m.league === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Section heading */}
      <div className="today-matches-heading relative overflow-hidden rounded-xl border border-cyan-500/20 bg-[#081017] px-4 py-3">
        <div className="today-matches-heading-scan absolute inset-0" />
        <div className="relative flex items-center gap-3">
          <span className="today-matches-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-green-400/30 bg-green-400/10 text-cyan-200">
            <CalendarDays
              size={20}
              strokeWidth={2.2}
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]"
              aria-hidden="true"
            />
          </span>
          <h2
            className="font-display text-xl font-bold tracking-normal text-white text-glow-cyan"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            {t("dashboard.todayMatches")}
          </h2>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {leagueTabs.map((league) => (
          <button
            key={`league-tab-${league.name}`}
            onClick={() => setActiveTab(league.name)}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === league.name
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-[#12121a] text-gray-400 border border-gray-800 hover:border-gray-600"
            }`}
          >
            {league.name !== "All" && (
              <ApiLeagueLogo name={league.name} logo={league.logo} size="xs" />
            )}
            <span>{league.name === "All" ? t("rewards.all") : league.name}</span>
          </button>
        ))}
      </div>

      {/* Match grid */}
      {filtered.length === 0 ? (
        <Card className="border-gray-800/80 p-5 text-sm text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filtered.map((match) => (
          <Link key={match.id} href={`/${locale}/matches/detail/${match.id}`}>
            <Card hover className="today-match-card flex h-full flex-col gap-3">
              {/* League & status */}
              <div className="flex items-center justify-between gap-2">
                <Badge variant="default" size="sm" className="min-w-0">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <ApiLeagueLogo
                      name={match.league}
                      logo={match.leagueLogo}
                      size="xs"
                    />
                    <span className="truncate">{match.leagueEmoji} {match.league}</span>
                  </span>
                </Badge>
                <StatusBadge
                  status={match.status}
                  label={match.statusLabel}
                  className="shrink-0"
                />
              </div>

              {/* Date & time */}
              <div className="rounded-lg border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-2 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-none">
                  <CalendarDays size={12} className="shrink-0 text-cyan-300" aria-hidden="true" />
                  <span className="min-w-0 truncate text-[10px] font-medium text-gray-300">
                    {match.kickoffDate}
                  </span>
                  <span className="hidden h-3 w-px bg-cyan-500/25 sm:block" />
                  <span className="whitespace-nowrap font-mono text-[11px] font-bold text-cyan-300">
                    {match.kickoffTime}
                  </span>
                </div>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} />
                  <span className="text-xs text-gray-300 text-center leading-tight truncate w-full">
                    {match.homeTeam}
                  </span>
                </div>

                <span className="min-w-12 rounded-md border border-gray-800 bg-black/20 px-2 py-1 text-center font-mono text-sm font-bold text-white">
                  {formatScore(match, t("common.vs"))}
                </span>

                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <ApiTeamLogo name={match.awayTeam} logo={match.awayCrest} />
                  <span className="text-xs text-gray-300 text-center leading-tight truncate w-full">
                    {match.awayTeam}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function mapFixtureToTodayMatch(fixture: ApiFootballFixture, locale: string): TodayMatch {
  return {
    id: String(fixture.apiFixtureId ?? fixture.id),
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    kickoffDate: formatDate(fixture.kickoffTime, locale),
    kickoffTime: formatKickoff(fixture.kickoffTime),
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    leagueEmoji: "",
    status: fixture.status,
    statusShort: fixture.statusShort,
    score: fixture.score,
  };
}

function buildLeagueTabs(matches: TodayMatch[]): LeagueTab[] {
  const tabs = new Map<string, LeagueTab>();

  for (const match of matches) {
    if (!tabs.has(match.league)) {
      tabs.set(match.league, {
        name: match.league,
        logo: match.leagueLogo,
      });
    }
  }

  return [{ name: "All", logo: null }, ...tabs.values()];
}

function formatKickoff(value: string): string {
  return formatMatchTimeWithZone(value);
}

function formatScore(match: TodayMatch, fallback: string) {
  if (match.score.home === null || match.score.away === null) {
    return fallback;
  }

  return `${match.score.home} - ${match.score.away}`;
}
