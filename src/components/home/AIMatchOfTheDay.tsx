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
      className="relative overflow-hidden border border-cyan-300/20 bg-gradient-to-br from-[#07111b] via-[#090d15] to-blue-950/25 p-0 shadow-[0_18px_70px_rgba(0,0,0,0.34)]"
    >
      <div className="absolute left-0 top-0 h-px w-40 max-w-[45%] bg-gradient-to-r from-cyan-300 via-sky-400 to-transparent" />
      <div className="absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-cyan-300/80 to-transparent" />
      <div className="relative p-3.5 md:p-4">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="default" size="sm" className="min-w-0 border-cyan-300/10 bg-white/[0.045] text-slate-300">
              <span className="flex min-w-0 items-center gap-1.5">
                <ApiLeagueLogo name={insight.league.name} logo={insight.league.logo} size="xs" />
                <span className="truncate">{insight.league.name}</span>
              </span>
            </Badge>
            <Badge variant="cyan" size="sm" className="border border-cyan-300/25 bg-cyan-300/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
              <span className="flex items-center gap-1.5 font-bold">
                <Brain size={12} strokeWidth={2.4} aria-hidden="true" />
                <span>{t("dashboard.aiMatchOfTheDay")}</span>
              </span>
            </Badge>
          </div>
          <div className="shrink-0 rounded-lg border border-cyan-300/15 bg-cyan-300/[0.065] px-2.5 py-1">
            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 leading-none">
              <CalendarDays size={12} className="shrink-0 text-cyan-300" aria-hidden="true" />
              <span className="min-w-0 truncate text-[10px] font-semibold text-slate-300">
                {formatDate(insight.starts_at, locale)}
              </span>
              <span className="hidden h-3 w-px bg-cyan-500/25 sm:block" />
              <span className="whitespace-nowrap font-mono text-[11px] font-bold text-cyan-200">
                {formatMatchTimeWithZone(insight.starts_at, locale)}
              </span>
            </div>
          </div>
        </div>

        {/* Teams & confidence matchup */}
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-cyan-300/10 bg-[#050b13]/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          {/* Home team */}
          <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
            <div className="rounded-xl border border-cyan-300/10 bg-white/[0.035] p-1.5 shadow-[0_0_22px_rgba(34,211,238,0.06)]">
              <ApiTeamLogo name={homeTeam} logo={insight.teams.home.logo} size="lg" />
            </div>
            <span className="w-full truncate text-center text-xs font-black leading-tight text-slate-100 md:text-[13px]">
              {homeTeam}
            </span>
          </div>

          {/* VS & Confidence score */}
          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full border border-dashed border-cyan-300/35 bg-[#030914]/85 shadow-[0_0_26px_rgba(34,211,238,0.10)] md:h-[88px] md:w-[88px]">
              {/* Pulsing analyzer indicator */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
              
              <span className="font-mono text-2xl font-extrabold leading-none tracking-tighter text-cyan-200">
                {confidenceScore}%
              </span>
              <span className="mt-0.5 text-[7px] font-bold uppercase tracking-wide text-cyan-200/70">
                {t("aiInsight.confidenceScore")}
              </span>
            </div>
            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">VS</span>
          </div>

          {/* Away team */}
          <div className="flex flex-1 min-w-0 flex-col items-center gap-2">
            <div className="rounded-xl border border-violet-300/18 bg-violet-300/[0.045] p-1.5 shadow-[0_0_22px_rgba(139,92,246,0.08)]">
              <ApiTeamLogo name={awayTeam} logo={insight.teams.away.logo} size="lg" />
            </div>
            <span className="w-full truncate text-center text-xs font-black leading-tight text-slate-100 md:text-[13px]">
              {awayTeam}
            </span>
          </div>
        </div>

        {/* Win probability stacked horizontal bar */}
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>{t("aiInsight.probability")}</span>
            <span className="font-mono text-cyan-200">{confidenceScore}% {t("aiInsight.confidenceScore")}</span>
          </div>
          
          {/* Stacked bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-800/80 ring-1 ring-white/[0.04]">
            <div 
              style={{ width: `${homeWinProbability}%` }} 
              className="bg-gradient-to-r from-cyan-400 to-cyan-300 transition-all duration-500" 
              title={`${homeTeam}: ${homeWinProbability}%`}
            />
            <div 
              style={{ width: `${drawProbability}%` }} 
              className="bg-gradient-to-r from-amber-300 to-orange-400 transition-all duration-500" 
              title={`Draw: ${drawProbability}%`}
            />
            <div 
              style={{ width: `${awayWinProbability}%` }} 
              className="bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500" 
              title={`${awayTeam}: ${awayWinProbability}%`}
            />
          </div>

          {/* Legends */}
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center">
              <span className="flex max-w-full items-center gap-1.5 truncate text-[11px] font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                <span className="truncate">{homeTeam}</span>
              </span>
              <span className="mt-0.5 font-mono text-[10px] font-bold text-cyan-200">{homeWinProbability}%</span>
            </div>
            <div className="flex flex-col items-center border-x border-cyan-300/10">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-amber-300 shrink-0" />
                <span>{t("prediction.draw")}</span>
              </span>
              <span className="mt-0.5 font-mono text-[10px] font-bold text-amber-300">{drawProbability}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex max-w-full items-center gap-1.5 truncate text-[11px] font-semibold text-slate-300">
                <span className="h-2 w-2 rounded-full bg-violet-400 shrink-0" />
                <span className="truncate">{awayTeam}</span>
              </span>
              <span className="mt-0.5 font-mono text-[10px] font-bold text-violet-300">{awayWinProbability}%</span>
            </div>
          </div>
        </div>

        {/* Key factors */}
        {(insight.keyFactors.length > 0 || insight.apiAdvice) && (
          <div className="mb-4">
            <h4 className="mb-2 text-[13px] font-semibold text-white">
              {t("aiInsight.keyFactors")}
            </h4>
            {insight.keyFactors.length > 0 && (
              <ul className="space-y-1.5">
                {insight.keyFactors.slice(0, 4).map((factor, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] font-medium leading-5 text-slate-300"
                  >
                    <span className="mt-0.5 text-cyan-300">&#8226;</span>
                    {factor}
                  </li>
                ))}
              </ul>
            )}
            {insight.apiAdvice && (
              <div className="mt-3 rounded-xl border border-cyan-300/18 bg-cyan-300/[0.055] p-3 text-xs leading-relaxed text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]">
                <div className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                  <Brain size={12} className="animate-pulse text-cyan-300" />
                  <span>AI Recommendation</span>
                </div>
                <p className="font-semibold text-slate-100">{insight.apiAdvice}</p>
              </div>
            )}
          </div>
        )}

        <Link href={`/${locale}/ai-insight/${insight.provider_id}`}>
          <Button
            variant="primary"
            size="md"
            neon={false}
            className="w-full justify-center gap-2 border border-cyan-200/25 bg-gradient-to-r from-cyan-300 to-sky-400 font-black text-[#031018] shadow-[0_10px_28px_rgba(34,211,238,0.16)] hover:from-cyan-200 hover:to-sky-300"
          >
            <Brain size={16} />
            {t("dashboard.viewAiInsight")}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
