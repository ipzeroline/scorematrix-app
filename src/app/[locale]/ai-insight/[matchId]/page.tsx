import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AlertTriangle, TrendingUp, Users } from "lucide-react";

export default function AIInsightDetailPage() {
  const insight = {
    home: "Real Catalonia",
    away: "Atletico Madrid B",
    league: "La Liga",
    round: "Round 34",
    confidenceScore: 45,
    heatMeter: 9.1,
    homeWinProbability: 40,
    drawProbability: 30,
    awayWinProbability: 30,
    homeFormIndex: 65,
    awayFormIndex: 72,
    homeLastFive: ["W", "W", "D", "L", "W"] as const,
    awayLastFive: ["W", "W", "W", "D", "W"] as const,
    headToHead: [
      { date: "2026-01-15", competition: "La Liga", score: "Real Catalonia 2-1 Atletico Madrid B" },
      { date: "2025-09-20", competition: "La Liga", score: "Atletico Madrid B 1-1 Real Catalonia" },
      { date: "2025-03-08", competition: "La Liga", score: "Atletico Madrid B 3-2 Real Catalonia" },
    ] as const,
    injuryImpactHome: 35,
    injuryImpactAway: 15,
    homeInjuries: ["David Silva (MID)", "Marc Torres (DEF)"],
    awayInjuries: ["Pedro Gomez (FWD - doubtful)"],
    upsetAlert: true,
    upsetDescription:
      "Away team in strong form despite underdog status. High upset potential due to home team injuries.",
    communitySentiment: {
      homePercentage: 48,
      drawPercentage: 28,
      awayPercentage: 24,
      totalVotes: 1243,
    },
    keyFactors: [
      "Atletico Madrid B has won 4 of last 5 matches",
      "Real Catalonia missing key midfielder David Silva",
      "Head-to-head record favors away team (2W-1D-1L)",
      "Match expected to be high-scoring based on recent form",
      "Home advantage partially offset by injury concerns",
    ],
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        AI Insight: {insight.home} vs {insight.away}
      </h1>

      {/* Upset Alert */}
      {insight.upsetAlert && (
        <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-400 mb-1">
              Upset Alert
            </h3>
            <p className="text-xs text-gray-400">{insight.upsetDescription}</p>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold font-mono text-cyan-400">
            {insight.confidenceScore}%
          </p>
          <p className="text-xs text-gray-500 mt-1">AI Confidence</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold font-mono text-amber-400">
            {insight.heatMeter}/10
          </p>
          <p className="text-xs text-gray-500 mt-1">Match Heat</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold font-mono text-green-400">
            {insight.homeFormIndex}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Home Form Index</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold font-mono text-magenta-400">
            {insight.awayFormIndex}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Away Form Index</p>
        </Card>
      </div>

      {/* Win Probabilities */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">
          Win Probabilities
        </h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-400">Home Win</span>
              <span className="text-cyan-400 font-mono">
                {insight.homeWinProbability}%
              </span>
            </div>
            <ProgressBar
              value={insight.homeWinProbability}
              max={100}
              color="cyan"
              size="lg"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Draw</span>
              <span className="text-gray-400 font-mono">
                {insight.drawProbability}%
              </span>
            </div>
            <ProgressBar
              value={insight.drawProbability}
              max={100}
              color="purple"
              size="lg"
            />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-magenta-400">Away Win</span>
              <span className="text-magenta-400 font-mono">
                {insight.awayWinProbability}%
              </span>
            </div>
            <ProgressBar
              value={insight.awayWinProbability}
              max={100}
              color="magenta"
              size="lg"
            />
          </div>
        </div>
      </Card>

      {/* Form Comparison & Head-to-Head */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-400" />
            Form Comparison (Last 5)
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-cyan-400 mb-1">{insight.home}</p>
              <div className="flex gap-1">
                {insight.homeLastFive.map((r, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                      r === "W"
                        ? "bg-green-500/20 text-green-400"
                        : r === "D"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-magenta-400 mb-1">{insight.away}</p>
              <div className="flex gap-1">
                {insight.awayLastFive.map((r, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${
                      r === "W"
                        ? "bg-green-500/20 text-green-400"
                        : r === "D"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            Head-to-Head
          </h3>
          <div className="space-y-2">
            {insight.headToHead.map((h2h, i) => (
              <div
                key={i}
                className="text-xs text-gray-400 py-1 border-b border-gray-800/50 last:border-0"
              >
                <span className="text-gray-600">{h2h.date}</span>
                <span className="mx-2">•</span>
                <span className="text-white">{h2h.score}</span>
                <span className="text-gray-600 ml-2">({h2h.competition})</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Injury Impact */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Injury Impact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cyan-400">{insight.home}</span>
              <span className="text-gray-500 font-mono">
                Impact: {insight.injuryImpactHome}%
              </span>
            </div>
            <ProgressBar
              value={insight.injuryImpactHome}
              max={100}
              color="red"
              size="md"
            />
            <div className="mt-2 space-y-1">
              {insight.homeInjuries.map((p, i) => (
                <p key={i} className="text-[10px] text-red-400">
                  ❌ {p}
                </p>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-magenta-400">{insight.away}</span>
              <span className="text-gray-500 font-mono">
                Impact: {insight.injuryImpactAway}%
              </span>
            </div>
            <ProgressBar
              value={insight.injuryImpactAway}
              max={100}
              color="red"
              size="md"
            />
            <div className="mt-2 space-y-1">
              {insight.awayInjuries.map((p, i) => (
                <p key={i} className="text-[10px] text-amber-400">
                  ⚠️ {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Community Sentiment */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Users size={14} className="text-purple-400" />
          Community Sentiment ({insight.communitySentiment.totalVotes.toLocaleString()}{" "}
          votes)
        </h3>
        <div className="space-y-2">
          <ProgressBar
            value={insight.communitySentiment.homePercentage}
            max={100}
            color="cyan"
            size="md"
            showLabel
          />
          <ProgressBar
            value={insight.communitySentiment.drawPercentage}
            max={100}
            color="purple"
            size="md"
            showLabel
          />
          <ProgressBar
            value={insight.communitySentiment.awayPercentage}
            max={100}
            color="magenta"
            size="md"
            showLabel
          />
        </div>
      </Card>

      {/* Key Factors */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Key Factors</h3>
        <ul className="space-y-2">
          {insight.keyFactors.map((factor, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-cyan-400 mt-1 shrink-0">◆</span>
              {factor}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
