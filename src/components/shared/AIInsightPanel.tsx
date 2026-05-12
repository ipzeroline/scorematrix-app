"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar, type ProgressBarColor } from "@/components/ui/ProgressBar";
import { ConfidenceGauge } from "@/components/shared/ConfidenceGauge";
import { HeatMeter } from "@/components/shared/HeatMeter";
import { FormComparison } from "@/components/shared/FormComparison";
import { UpsetAlert } from "@/components/shared/UpsetAlert";
import { AIInsight, Team, MatchResult } from "@/types";

interface AIInsightPanelProps {
  insight: AIInsight;
  homeTeam: Team;
  awayTeam: Team;
  compact?: boolean;
  className?: string;
}

function ProbabilityBar({
  label,
  teamName,
  probability,
  result,
}: {
  label: string;
  teamName: string;
  probability: number;
  result: MatchResult;
}) {
  const colors: Record<MatchResult, ProgressBarColor> = {
    [MatchResult.HOME]: "cyan",
    [MatchResult.DRAW]: "gold",
    [MatchResult.AWAY]: "magenta",
  };

  const color = colors[result];

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">{teamName}</span>
        <span className="text-xs font-mono font-bold text-white">
          {probability}%
        </span>
      </div>
      <ProgressBar value={probability} max={100} color={color} size="sm" />
    </div>
  );
}

export function AIInsightPanel({
  insight,
  homeTeam,
  awayTeam,
  compact,
  className,
}: AIInsightPanelProps) {
  if (compact) {
    return (
      <Card className={cn("animate-slide-up", className)}>
        <div className="flex items-center gap-4">
          <ConfidenceGauge value={insight.confidenceScore} size={72} />

          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-cyan-400 font-medium">
                {homeTeam.shortName}
              </span>
              <span className="text-gray-500">vs</span>
              <span className="text-magenta-400 font-medium">
                {awayTeam.shortName}
              </span>
            </div>
            <ProbabilityBar
              label="W"
              teamName={homeTeam.shortName}
              probability={insight.homeWinProbability}
              result={MatchResult.HOME}
            />
            <ProbabilityBar
              label="D"
              teamName="Draw"
              probability={insight.drawProbability}
              result={MatchResult.DRAW}
            />
            <ProbabilityBar
              label="W"
              teamName={awayTeam.shortName}
              probability={insight.awayWinProbability}
              result={MatchResult.AWAY}
            />

            {insight.upsetAlert && insight.upsetDescription && (
              <UpsetAlert
                description={insight.upsetDescription}
                probability={40}
              />
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("animate-slide-up space-y-5", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-display font-bold text-white">
          AI Match Insight
        </span>
        <Badge variant="cyan" size="sm">
          Powered by DeepSeek
        </Badge>
      </div>

      {/* Confidence + Heat */}
      <div className="flex items-center gap-6 justify-center">
        <ConfidenceGauge value={insight.confidenceScore} />
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            Match Excitement
          </span>
          <HeatMeter value={insight.heatMeter} />
        </div>
      </div>

      {/* Probability Bars */}
      <div className="space-y-3">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
          Win Probabilities
        </span>
        <ProbabilityBar
          label="Home"
          teamName={homeTeam.shortName}
          probability={insight.homeWinProbability}
          result={MatchResult.HOME}
        />
        <ProbabilityBar
          label="Draw"
          teamName="Draw"
          probability={insight.drawProbability}
          result={MatchResult.DRAW}
        />
        <ProbabilityBar
          label="Away"
          teamName={awayTeam.shortName}
          probability={insight.awayWinProbability}
          result={MatchResult.AWAY}
        />
      </div>

      {/* Form Comparison */}
      <div>
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
          Recent Form (Last 5)
        </span>
        <FormComparison
          homeForm={insight.formComparison.homeLastFive}
          awayForm={insight.formComparison.awayLastFive}
          homeTeamName={homeTeam.shortName}
          awayTeamName={awayTeam.shortName}
        />
      </div>

      {/* Home Advantage */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Home Advantage Factor</span>
        <span className="font-mono text-white">
          {(insight.homeAdvantageFactor * 100).toFixed(0)}%
        </span>
      </div>

      {/* Injury Impact */}
      {(insight.injuryImpact.homeInjuries.length > 0 ||
        insight.injuryImpact.awayInjuries.length > 0) && (
        <div className="pt-3 border-t border-gray-800/50">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
            Injury Impact
          </span>
          <div className="space-y-1">
            {insight.injuryImpact.homeInjuries.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan-400 w-12">{homeTeam.shortName}</span>
                <span className="text-gray-400">
                  {insight.injuryImpact.homeInjuries.join(", ")}
                </span>
              </div>
            )}
            {insight.injuryImpact.awayInjuries.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-magenta-400 w-12">{awayTeam.shortName}</span>
                <span className="text-gray-400">
                  {insight.injuryImpact.awayInjuries.join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upset Alert */}
      {insight.upsetAlert && insight.upsetDescription && (
        <UpsetAlert
          description={insight.upsetDescription}
          probability={30}
        />
      )}

      {/* Key Factors */}
      {insight.keyFactors.length > 0 && (
        <div className="pt-3 border-t border-gray-800/50">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
            Key Factors
          </span>
          <ul className="space-y-1">
            {insight.keyFactors.map((factor, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-xs text-gray-400"
              >
                <span className="text-cyan-400 mt-0.5 shrink-0">
                  &#9656;
                </span>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Community Sentiment */}
      <div className="pt-3 border-t border-gray-800/50">
        <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 block">
          Community Sentiment
        </span>
        <div className="flex items-center gap-2 h-6 rounded-full overflow-hidden bg-gray-800">
          <div
            className="h-full bg-cyan-500 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-black"
            style={{ width: `${insight.communitySentiment.homePercentage}%` }}
          >
            {insight.communitySentiment.homePercentage > 10 &&
              `${insight.communitySentiment.homePercentage}%`}
          </div>
          <div
            className="h-full bg-amber-500 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-black"
            style={{ width: `${insight.communitySentiment.drawPercentage}%` }}
          >
            {insight.communitySentiment.drawPercentage > 10 &&
              `${insight.communitySentiment.drawPercentage}%`}
          </div>
          <div
            className="h-full bg-magenta-500 transition-all duration-500 flex items-center justify-center text-[9px] font-bold text-black"
            style={{ width: `${insight.communitySentiment.awayPercentage}%` }}
          >
            {insight.communitySentiment.awayPercentage > 10 &&
              `${insight.communitySentiment.awayPercentage}%`}
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>{homeTeam.shortName}</span>
          <span>Draw</span>
          <span>{awayTeam.shortName}</span>
        </div>
      </div>

      {/* Generated At */}
      <div className="text-[10px] text-gray-600 text-right">
        Generated {new Date(insight.generatedAt).toLocaleString()}
      </div>
    </Card>
  );
}
