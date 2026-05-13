"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import type { ApiFootballFixture } from "@/lib/api-football";

interface TodayMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  kickoffTime: string;
  league: string;
  leagueEmoji: string;
}

const allMatches: TodayMatch[] = [
  {
    id: "tm-1",
    homeTeam: "London United",
    homeCrest: "",
    awayTeam: "Mersey City",
    awayCrest: "",
    kickoffTime: "20:00",
    league: "Premier",
    leagueEmoji: "🇬🇧",
  },
  {
    id: "tm-2",
    homeTeam: "Real Catalonia",
    homeCrest: "",
    awayTeam: "Atletico Madrid B",
    awayCrest: "",
    kickoffTime: "21:00",
    league: "La Liga",
    leagueEmoji: "🇪🇸",
  },
  {
    id: "tm-3",
    homeTeam: "FC Bayern Stadt",
    homeCrest: "",
    awayTeam: "Dortmund 09",
    awayCrest: "",
    kickoffTime: "18:30",
    league: "Bundesliga",
    leagueEmoji: "🇩🇪",
  },
  {
    id: "tm-4",
    homeTeam: "AC Milano Rosso",
    homeCrest: "",
    awayTeam: "Juventus Torino",
    awayCrest: "",
    kickoffTime: "20:45",
    league: "Serie A",
    leagueEmoji: "🇮🇹",
  },
  {
    id: "tm-5",
    homeTeam: "Paris Saint-Germain B",
    homeCrest: "",
    awayTeam: "Olympique Lyon",
    awayCrest: "",
    kickoffTime: "21:00",
    league: "Ligue 1",
    leagueEmoji: "🇫🇷",
  },
  {
    id: "tm-6",
    homeTeam: "Manchester Reds",
    homeCrest: "",
    awayTeam: "Chelsea Blues",
    awayCrest: "",
    kickoffTime: "17:30",
    league: "Premier",
    leagueEmoji: "🇬🇧",
  },
  {
    id: "tm-7",
    homeTeam: "Sevilla FC",
    homeCrest: "",
    awayTeam: "Valencia CF",
    awayCrest: "",
    kickoffTime: "19:00",
    league: "La Liga",
    leagueEmoji: "🇪🇸",
  },
  {
    id: "tm-8",
    homeTeam: "RB Leipzig B",
    homeCrest: "",
    awayTeam: "Bayer Leverkusen",
    awayCrest: "",
    kickoffTime: "15:30",
    league: "Bundesliga",
    leagueEmoji: "🇩🇪",
  },
];

const leagues = ["All", "Premier", "La Liga", "Bundesliga", "Serie A", "Ligue 1"];

interface TodayMatchesProps {
  fixtures?: ApiFootballFixture[];
}

export function TodayMatches({ fixtures = [] }: TodayMatchesProps) {
  const locale = useLocale();
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("All");
  const apiMatches = fixtures.map(mapFixtureToTodayMatch);
  const matches = apiMatches.length > 0 ? apiMatches : allMatches;
  const leagueTabs =
    apiMatches.length > 0
      ? ["All", ...Array.from(new Set(apiMatches.map((match) => match.league)))]
      : leagues;

  const filtered =
    activeTab === "All"
      ? matches
      : matches.filter((m) => m.league === activeTab);

  return (
    <div className="flex flex-col gap-4">
      {/* Section heading */}
      <h2
        className="text-xl font-bold font-display text-white"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {t("dashboard.todayMatches")}
      </h2>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {leagueTabs.map((league) => (
          <button
            key={league}
            onClick={() => setActiveTab(league)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === league
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-[#12121a] text-gray-400 border border-gray-800 hover:border-gray-600"
            }`}
          >
            {league === "All" ? t("rewards.all") : league}
          </button>
        ))}
      </div>

      {/* Match grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((match) => (
          <Link key={match.id} href={`/${locale}/livescore/${match.id}`}>
            <Card hover className="flex h-full flex-col gap-3">
              {/* League & time */}
              <div className="flex items-center justify-between">
                <Badge variant="default" size="sm">
                  {match.leagueEmoji} {match.league}
                </Badge>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                  {match.kickoffTime}
                </span>
              </div>

              {/* Match status */}
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {t("status.upcoming")}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <ApiTeamLogo name={match.homeTeam} logo={match.homeCrest} />
                  <span className="text-xs text-gray-300 text-center leading-tight truncate w-full">
                    {match.homeTeam}
                  </span>
                </div>

                <span className="text-sm font-bold text-gray-600 font-mono">
                  {t("common.vs")}
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
    </div>
  );
}

function mapFixtureToTodayMatch(fixture: ApiFootballFixture): TodayMatch {
  return {
    id: fixture.id,
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    kickoffTime: formatKickoff(fixture.kickoffTime),
    league: fixture.league.name,
    leagueEmoji: "",
  };
}

function formatKickoff(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
