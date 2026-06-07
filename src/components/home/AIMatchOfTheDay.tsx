"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Brain, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import type { ApiFootballAIInsight } from "@/lib/api-football";
import { formatDate, formatMatchTimeWithZone } from "@/lib/utils";

interface AIMatchOfTheDayProps {
  insight: ApiFootballAIInsight;
}

export function AIMatchOfTheDay({ insight }: AIMatchOfTheDayProps) {
  const locale = useLocale();
  const t = useTranslations();
  const homeTeam = insight.teams.home.name;
  const awayTeam = insight.teams.away.name;
  const confidenceScore = insight.confidenceScore ?? 0;
  const homeWinProbability = insight.homeWinProbability ?? 0;
  const drawProbability = insight.drawProbability ?? 0;
  const awayWinProbability = insight.awayWinProbability ?? 0;

  return (
    <Card
      neon="magenta"
      className="ai-match-card relative overflow-hidden border-magenta-500/30 !bg-gradient-to-br from-[#15111f] via-[#101421] to-cyan-500/5 p-0"
    >
      <div className="ai-match-orb absolute -right-16 -top-20 h-44 w-44 rounded-full bg-magenta-500/20 blur-3xl" />
      <div className="ai-match-grid absolute inset-0" />
      <div className="relative p-5 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="cyan" size="sm" className="min-w-0">
              <span className="flex min-w-0 items-center gap-1.5">
                <ApiLeagueLogo name={insight.league.name} logo={insight.league.logo} size="xs" />
                <span className="truncate">{insight.league.name}</span>
              </span>
            </Badge>
            <Badge variant="magenta" size="sm">
              <span className="flex items-center gap-1.5">
                <Brain size={12} strokeWidth={2.4} aria-hidden="true" />
                <span>{t("dashboard.aiMatchOfTheDay")}</span>
              </span>
            </Badge>
          </div>
          <div className="shrink-0 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-2">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-none">
              <CalendarDays size={12} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="min-w-0 truncate text-[10px] font-medium text-gray-300">
                {formatDate(insight.starts_at, locale)}
              </span>
              <span className="hidden h-3 w-px bg-cyan-500/25 sm:block" />
              <span className="whitespace-nowrap font-mono text-[11px] font-bold text-cyan-300">
                {formatMatchTimeWithZone(insight.starts_at, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Teams & confidence */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2">
            <ApiTeamLogo name={homeTeam} logo={insight.teams.home.logo} size="lg" accent="cyan" />
            <span className="text-sm font-semibold text-white text-center leading-tight">
              {homeTeam}
            </span>
          </div>

          {/* Confidence score */}
          <div className="ai-confidence-ring flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border border-cyan-400/30 bg-[#080b12]/80">
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
            <ApiTeamLogo name={awayTeam} logo={insight.teams.away.logo} size="lg" accent="gray" />
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
        {(insight.keyFactors.length > 0 || insight.apiAdvice) && <div className="mb-5">
          <h4 className="text-sm font-semibold text-white mb-2">
            {t("aiInsight.keyFactors")}
          </h4>
          {insight.keyFactors.length > 0 && <ul className="space-y-1.5">
            {insight.keyFactors.slice(0, 4).map((factor, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="text-cyan-400 mt-0.5">&#8226;</span>
                {factor}
              </li>
            ))}
          </ul>}
          {insight.apiAdvice && (
            <p className="mt-3 rounded-lg border border-magenta-500/20 bg-magenta-500/5 p-3 text-xs leading-5 text-gray-300">
              {insight.apiAdvice}
            </p>
          )}
        </div>}

        <Link href={`/${locale}/ai-insight/${insight.provider_id}`}>
          <Button variant="outline" size="md" className="w-full">
            {t("dashboard.viewAiInsight")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
