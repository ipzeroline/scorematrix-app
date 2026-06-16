"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ChevronRight, ListFilter } from "lucide-react";
import { Card } from "@/components/ui/Card";
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
      <div className="today-matches-heading relative overflow-hidden rounded-2xl border border-cyan-300/25 bg-[#081017] px-4 py-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.3)]">
        <div className="today-matches-heading-scan absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-300 to-lime-300" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
          <span className="today-matches-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <CalendarDays
              size={20}
              strokeWidth={2.2}
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]"
              aria-hidden="true"
            />
          </span>
            <div className="min-w-0">
              <h2 className="truncate bg-gradient-to-r from-cyan-200 via-sky-100 to-white bg-clip-text text-xl font-black leading-tight text-transparent drop-shadow-[0_0_14px_rgba(34,211,238,0.28)]">
                {t("dashboard.todayMatches")}
              </h2>
              <p className="truncate text-xs font-semibold text-cyan-100/70">
                {t("dashboard.matchCount", { count: matches.length })}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100 sm:inline-flex">
            <ListFilter size={14} aria-hidden="true" />
            {leagueTabs.length}
          </span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide rounded-2xl border border-white/10 bg-[#0b111d] p-2">
        {leagueTabs.map((league) => (
          <button
            key={`league-tab-${league.name}`}
            onClick={() => setActiveTab(league.name)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === league.name
                ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                : "border-white/10 bg-black/20 text-gray-400 hover:border-cyan-300/25 hover:text-gray-200"
            }`}
          >
            {league.name !== "All" && (
              <ApiLeagueLogo name={league.name} logo={league.logo} size="xs" />
            )}
            <span>{league.name === "All" ? t("rewards.all") : league.name}</span>
          </button>
        ))}
      </div>

      {/* Match List (Table Rows) */}
      {filtered.length === 0 ? (
        <Card className="rounded-2xl border-cyan-300/15 bg-[#0b111d] p-5 text-sm font-semibold text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#080d16] shadow-[0_18px_55px_rgba(0,0,0,0.28)]">
          {filtered.map((match) => (
            <Link
              key={match.id}
              href={`/${locale}/matches/detail/${match.id}`}
              className="group block border-b border-white/10 px-3.5 py-3 transition-all duration-150 last:border-b-0 hover:bg-cyan-300/[0.06] sm:px-4"
            >
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left: Time and League */}
                <div className="flex items-center gap-2 sm:gap-3 w-[55px] sm:w-1/4 shrink-0 min-w-0">
                  <div className="flex flex-col gap-0.5 min-w-[50px] sm:min-w-[70px]">
                    <span className="text-sm font-black text-cyan-200">
                      {match.kickoffTime}
                    </span>
                    <span className="hidden truncate text-[10px] font-semibold text-gray-500 sm:block">
                      {match.kickoffDate}
                    </span>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 min-w-0">
                    <ApiLeagueLogo name={match.league} logo={match.leagueLogo} size="xs" />
                    <span className="max-w-[120px] truncate text-xs font-semibold text-gray-400">
                      {match.league}
                    </span>
                  </div>
                </div>

                {/* Center: Teams and Score/VS */}
                <div className="flex items-center justify-center gap-2 sm:gap-3 flex-1 min-w-0 px-1">
                  {/* Home team */}
                  <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-right">
                    <span className="truncate text-xs font-bold text-gray-200 transition-colors group-hover:text-white sm:text-sm">
                      {match.homeTeam}
                    </span>
                    <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} size="xs" />
                  </div>

                  {/* Score or VS Box */}
                  <div className="shrink-0 min-w-[54px] sm:min-w-[64px] text-center">
                    <span className="inline-block rounded-lg border border-cyan-300/20 bg-black/40 px-2 py-1 text-[10px] font-black text-white transition-colors group-hover:border-cyan-300/40 sm:px-2.5 sm:text-xs">
                      {formatScore(match, t("common.vs"))}
                    </span>
                  </div>

                  {/* Away team */}
                  <div className="flex items-center justify-start gap-1.5 sm:gap-2.5 flex-1 min-w-0 text-left">
                    <ApiTeamLogo name={match.awayTeam} logo={match.awayCrest} size="xs" />
                    <span className="truncate text-xs font-bold text-gray-200 transition-colors group-hover:text-white sm:text-sm">
                      {match.awayTeam}
                    </span>
                  </div>
                </div>

                {/* Right: Status and Chevron Link */}
                <div className="flex items-center justify-end gap-2 sm:gap-3 w-[75px] sm:w-1/4 shrink-0 min-w-0">
                  <StatusBadge
                    status={match.status}
                    label={match.statusLabel}
                    className="text-[9px] sm:text-[10px] shrink-0"
                  />
                  <div className="hidden sm:flex h-6 w-6 items-center justify-center rounded border border-border bg-black/20 group-hover:border-cyan-500/40 group-hover:text-cyan-300 transition-colors">
                    <ChevronRight size={12} className="text-gray-500 group-hover:text-cyan-300 transition-colors" />
                  </div>
                </div>
              </div>
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
