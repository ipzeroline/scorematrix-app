"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import type { ApiFootballFixture } from "@/lib/api-football";

const matchOfTheDay = {
  matchId: "motd-1",
  homeTeam: "London United",
  homeCrest: "",
  awayTeam: "Mersey City",
  awayCrest: "",
  kickoffTime: "20:00",
  league: "Premier",
  leagueEmoji: "🇬🇧",
  confidenceScore: 87,
  homeWinProbability: 62,
  drawProbability: 22,
  awayWinProbability: 16,
};

interface AIMatchOfTheDayProps {
  fixture?: ApiFootballFixture;
}

export function AIMatchOfTheDay({ fixture }: AIMatchOfTheDayProps) {
  const t = useTranslations();
  const {
    homeTeam,
    homeCrest,
    awayTeam,
    awayCrest,
    kickoffTime,
    league,
    leagueEmoji,
    confidenceScore,
    homeWinProbability,
    drawProbability,
    awayWinProbability,
  } = fixture ? mapFixtureToAiMatch(fixture) : matchOfTheDay;
  const keyFactors = [
    t("dashboard.aiFactors.homeForm"),
    t("dashboard.aiFactors.awayInjury"),
    t("dashboard.aiFactors.headToHead"),
    t("dashboard.aiFactors.possession"),
  ];

  return (
    <Card
      neon="cyan"
      className="border-cyan-500/30 !bg-gradient-to-br from-[#12121a] to-cyan-500/5 p-0 overflow-hidden"
    >
      <div className="p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="sm">
              {leagueEmoji} {league}
            </Badge>
            <Badge variant="magenta" size="sm">
              {t("dashboard.aiMatchOfTheDay")}
            </Badge>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
            {kickoffTime}
          </span>
        </div>

        {/* Teams & confidence */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2">
            <ApiTeamLogo name={homeTeam} logo={homeCrest} size="lg" accent="cyan" />
            <span className="text-sm font-semibold text-white text-center leading-tight">
              {homeTeam}
            </span>
          </div>

          {/* Confidence score */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-bold font-mono text-cyan-400">
              {confidenceScore}
              <span className="text-lg text-cyan-400/60">%</span>
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">
              {t("aiInsight.confidenceScore")}
            </span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2">
            <ApiTeamLogo name={awayTeam} logo={awayCrest} size="lg" accent="gray" />
            <span className="text-sm font-semibold text-white text-center leading-tight">
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Win probability bars */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-300 font-medium">
                {homeTeam}
              </span>
              <span className="text-cyan-400 font-mono font-bold">
                {homeWinProbability}%
              </span>
            </div>
            <ProgressBar
              value={homeWinProbability}
              max={100}
              color="cyan"
              size="sm"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-300 font-medium">
                {t("prediction.draw")}
              </span>
              <span className="text-gray-400 font-mono font-bold">
                {drawProbability}%
              </span>
            </div>
            <ProgressBar
              value={drawProbability}
              max={100}
              color="purple"
              size="sm"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-300 font-medium">
                {awayTeam}
              </span>
              <span className="text-magenta-400 font-mono font-bold">
                {awayWinProbability}%
              </span>
            </div>
            <ProgressBar
              value={awayWinProbability}
              max={100}
              color="magenta"
              size="sm"
            />
          </div>
        </div>

        {/* Key factors */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            {t("aiInsight.keyFactors")}
          </h4>
          <ul className="space-y-1.5">
            {keyFactors.map((factor, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="text-cyan-400 mt-0.5">&#8226;</span>
                {factor}
              </li>
            ))}
          </ul>
        </div>

        <Button variant="outline" size="md" className="w-full">
          {t("dashboard.viewAiInsight")}
        </Button>
      </div>
    </Card>
  );
}

function mapFixtureToAiMatch(fixture: ApiFootballFixture) {
  const seed = fixture.id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);
  const homeWinProbability = 42 + (seed % 22);
  const drawProbability = 18 + (seed % 12);
  const awayWinProbability = Math.max(
    8,
    100 - homeWinProbability - drawProbability
  );

  return {
    matchId: fixture.id,
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    kickoffTime: formatKickoff(fixture.kickoffTime),
    league: fixture.league.name,
    leagueEmoji: "",
    confidenceScore: Math.min(92, homeWinProbability + 22),
    homeWinProbability,
    drawProbability,
    awayWinProbability,
  };
}

function formatKickoff(value: string): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
