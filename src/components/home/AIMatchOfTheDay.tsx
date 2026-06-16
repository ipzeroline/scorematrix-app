"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Brain, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
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
      neon="cyan"
      className="relative overflow-hidden border border-cyan-500/30 bg-gradient-to-br from-[#0c0d12] via-[#0e1017] to-cyan-950/20 p-0 shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
    >
      {/* Dynamic top edge accent line */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-magenta-500 to-cyan-500" />
      <div className="relative p-5 md:p-6">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="default" size="sm" className="min-w-0 bg-[#151620] border-border text-gray-300">
              <span className="flex min-w-0 items-center gap-1.5">
                <ApiLeagueLogo name={insight.league.name} logo={insight.league.logo} size="xs" />
                <span className="truncate">{insight.league.name}</span>
              </span>
            </Badge>
            <Badge variant="cyan" size="sm" className="bg-cyan-500/15 border border-cyan-500/20 text-cyan-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Brain size={12} strokeWidth={2.4} aria-hidden="true" />
                <span>{t("dashboard.aiMatchOfTheDay")}</span>
              </span>
            </Badge>
          </div>
          <div className="shrink-0 rounded-lg border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-1.5">
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

        {/* Teams & confidence matchup */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-black/20 rounded-xl border border-border/40 p-4">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="p-2 bg-surface rounded-lg border border-border">
              <ApiTeamLogo name={homeTeam} logo={insight.teams.home.logo} size="lg" />
            </div>
            <span className="text-sm font-bold text-gray-100 text-center leading-tight truncate w-full">
              {homeTeam}
            </span>
          </div>

          {/* VS & Confidence score */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full border-2 border-dashed border-cyan-500/40 bg-black/60 shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
              {/* Pulsing analyzer indicator */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              
              <span className="text-3xl font-extrabold font-mono text-cyan-400 tracking-tighter leading-none">
                {confidenceScore}%
              </span>
              <span className="text-[8px] text-cyan-400/60 uppercase tracking-widest mt-1 font-bold">
                {t("aiInsight.confidenceScore")}
              </span>
            </div>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-2">VS</span>
          </div>

          {/* Away team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="p-2 bg-surface rounded-lg border border-border">
              <ApiTeamLogo name={awayTeam} logo={insight.teams.away.logo} size="lg" />
            </div>
            <span className="text-sm font-bold text-gray-100 text-center leading-tight truncate w-full">
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Win probability stacked horizontal bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400 mb-2.5">
            <span>{t("aiInsight.probability")}</span>
            <span className="font-mono text-cyan-400">{confidenceScore}% {t("aiInsight.confidenceScore")}</span>
          </div>
          
          {/* Stacked bar */}
          <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-800">
            <div 
              style={{ width: `${homeWinProbability}%` }} 
              className="bg-cyan-500 transition-all duration-500" 
              title={`${homeTeam}: ${homeWinProbability}%`}
            />
            <div 
              style={{ width: `${drawProbability}%` }} 
              className="bg-gray-600 transition-all duration-500" 
              title={`Draw: ${drawProbability}%`}
            />
            <div 
              style={{ width: `${awayWinProbability}%` }} 
              className="bg-magenta-500 transition-all duration-500" 
              title={`${awayTeam}: ${awayWinProbability}%`}
            />
          </div>

          {/* Legends */}
          <div className="grid grid-cols-3 gap-2 mt-3 text-center">
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-300 font-medium truncate max-w-full">
                <span className="h-2 w-2 rounded-full bg-cyan-500 shrink-0" />
                <span className="truncate">{homeTeam}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-cyan-400 mt-0.5">{homeWinProbability}%</span>
            </div>
            <div className="flex flex-col items-center border-x border-border/40">
              <span className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <span className="h-2 w-2 rounded-full bg-gray-600 shrink-0" />
                <span>{t("prediction.draw")}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-gray-400 mt-0.5">{drawProbability}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-300 font-medium truncate max-w-full">
                <span className="h-2 w-2 rounded-full bg-magenta-500 shrink-0" />
                <span className="truncate">{awayTeam}</span>
              </span>
              <span className="font-mono text-[11px] font-bold text-magenta-400 mt-0.5">{awayWinProbability}%</span>
            </div>
          </div>
        </div>

        {/* Key factors */}
        {(insight.keyFactors.length > 0 || insight.apiAdvice) && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-white mb-2.5">
              {t("aiInsight.keyFactors")}
            </h4>
            {insight.keyFactors.length > 0 && (
              <ul className="space-y-1.5">
                {insight.keyFactors.slice(0, 4).map((factor, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-400"
                  >
                    <span className="text-cyan-400 mt-0.5">&#8226;</span>
                    {factor}
                  </li>
                ))}
              </ul>
            )}
            {insight.apiAdvice && (
              <div className="mt-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 text-xs leading-relaxed text-gray-300">
                <div className="flex items-center gap-2 mb-1.5 font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                  <Brain size={12} className="text-cyan-400 animate-pulse" />
                  <span>AI Recommendation</span>
                </div>
                <p className="font-medium text-gray-200">{insight.apiAdvice}</p>
              </div>
            )}
          </div>
        )}

        <Link href={`/${locale}/ai-insight/${insight.provider_id}`}>
          <Button variant="primary" size="md" neon={true} className="w-full justify-center gap-2">
            <Brain size={16} />
            {t("dashboard.viewAiInsight")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
