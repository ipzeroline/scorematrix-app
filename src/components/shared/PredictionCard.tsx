"use client";

import { useState, useCallback } from "react";
import { cn, formatTime, countdown } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { StreakIndicator } from "@/components/shared/StreakIndicator";
import { Match, Team, Prediction, MatchStatus, MatchResult } from "@/types";

interface PredictionCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  userPrediction?: Prediction | null;
  onPredict?: (homeScore: number, awayScore: number) => void;
  className?: string;
}

export function PredictionCard({
  match,
  homeTeam,
  awayTeam,
  userPrediction,
  onPredict,
  className,
}: PredictionCardProps) {
  const [homeScore, setHomeScore] = useState<number>(
    userPrediction?.predictedHomeScore ?? 0
  );
  const [awayScore, setAwayScore] = useState<number>(
    userPrediction?.predictedAwayScore ?? 0
  );
  const [selectedResult, setSelectedResult] = useState<MatchResult | null>(
    userPrediction?.predictedResult ?? null
  );
  const [submitting, setSubmitting] = useState(false);

  const isLocked = userPrediction?.isLocked ?? false;
  const isFinished = match.status === MatchStatus.FINISHED;
  const isLive = match.status === MatchStatus.LIVE;
  const disabled = isLocked || isFinished || isLive;

  const updateScoreAndResult = useCallback(
    (h: number, a: number) => {
      setHomeScore(h);
      setAwayScore(a);
      if (h > a) setSelectedResult(MatchResult.HOME);
      else if (a > h) setSelectedResult(MatchResult.AWAY);
      else setSelectedResult(MatchResult.DRAW);
    },
    []
  );

  const handleHomeChange = (val: string) => {
    const n = Math.min(9, Math.max(0, parseInt(val, 10) || 0));
    updateScoreAndResult(n, awayScore);
  };

  const handleAwayChange = (val: string) => {
    const n = Math.min(9, Math.max(0, parseInt(val, 10) || 0));
    updateScoreAndResult(homeScore, n);
  };

  const handleSubmit = async () => {
    if (!onPredict) return;
    setSubmitting(true);
    try {
      await onPredict(homeScore, awayScore);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      neon="cyan"
      className={cn(
        "animate-slide-up",
        disabled && "opacity-60",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
            Your Prediction
          </span>
          {userPrediction && (
            <Badge
              variant={
                userPrediction.status === "correct"
                  ? "green"
                  : userPrediction.status === "partial"
                    ? "gold"
                    : userPrediction.status === "incorrect"
                      ? "red"
                      : "cyan"
              }
            >
              {userPrediction.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {userPrediction?.streakNumber && userPrediction.streakNumber > 0 && (
          <StreakIndicator current={userPrediction.streakNumber} best={0} size="sm" />
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400 font-display mb-1">
            {homeTeam.shortName
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 3)
              .toUpperCase()}
          </div>
          <span className="text-sm text-white font-medium">
            {homeTeam.shortName}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-gray-500 font-mono">
            {formatTime(match.kickoffTime)}
          </span>
          <span className="text-lg font-bold text-gray-600">vs</span>
          {!isLocked && !isFinished && !isLive && (
            <span className="text-[10px] text-amber-400 font-mono">
              Locks in {countdown(match.kickoffTime)}
            </span>
          )}
        </div>

        <div className="flex-1 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center text-xs font-bold text-magenta-400 font-display mb-1">
            {awayTeam.shortName
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 3)
              .toUpperCase()}
          </div>
          <span className="text-sm text-white font-medium">
            {awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Score Inputs */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <input
          type="number"
          min={0}
          max={9}
          value={homeScore}
          onChange={(e) => handleHomeChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-14 h-14 text-center text-2xl font-bold font-mono rounded-xl border bg-[#0a0a0f] text-white focus:outline-none focus:ring-2",
            disabled
              ? "border-gray-800 text-gray-600 cursor-not-allowed"
              : "border-gray-700 focus:ring-cyan-500/50 focus:border-cyan-500/50",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        <span className="text-gray-600 text-xl font-mono font-bold">-</span>
        <input
          type="number"
          min={0}
          max={9}
          value={awayScore}
          onChange={(e) => handleAwayChange(e.target.value)}
          disabled={disabled}
          className={cn(
            "w-14 h-14 text-center text-2xl font-bold font-mono rounded-xl border bg-[#0a0a0f] text-white focus:outline-none focus:ring-2",
            disabled
              ? "border-gray-800 text-gray-600 cursor-not-allowed"
              : "border-gray-700 focus:ring-cyan-500/50 focus:border-cyan-500/50",
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
      </div>

      {/* Result Buttons (1/X/2) */}
      <div className="flex gap-2 mb-4">
        {[
          { label: "1", result: MatchResult.HOME, desc: "Home Win" },
          { label: "X", result: MatchResult.DRAW, desc: "Draw" },
          { label: "2", result: MatchResult.AWAY, desc: "Away Win" },
        ].map(({ label, result, desc }) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => {
              setSelectedResult(result);
              if (result === MatchResult.HOME) updateScoreAndResult(1, 0);
              else if (result === MatchResult.AWAY) updateScoreAndResult(0, 1);
              else updateScoreAndResult(1, 1);
            }}
            className={cn(
              "flex-1 py-2 rounded-lg text-sm font-bold font-display transition-all duration-200 border",
              disabled
                ? "border-gray-800 text-gray-600 cursor-not-allowed"
                : selectedResult === result
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
            )}
            title={desc}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Submit */}
      {!disabled && (
        <Button
          variant="primary"
          size="lg"
          neon
          className="w-full"
          loading={submitting}
          onClick={handleSubmit}
        >
          {userPrediction ? "Update Prediction" : "Submit Prediction"}
        </Button>
      )}

      {disabled && (
        <div className="text-center text-xs text-gray-500">
          {isLocked
            ? "Prediction locked"
            : isLive
              ? "Match in progress"
              : "Match finished"}
        </div>
      )}
    </Card>
  );
}
