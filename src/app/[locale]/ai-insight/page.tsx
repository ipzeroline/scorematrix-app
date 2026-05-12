import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

const MOCK_INSIGHTS = [
  {
    id: "ai-1",
    home: "AC Milano Nord",
    away: "AS Roma Sud",
    league: "Serie A",
    confidence: 72,
    heatMeter: 7.5,
    homeProb: 55,
    drawProb: 25,
    awayProb: 20,
    upset: false,
  },
  {
    id: "ai-2",
    home: "Paris Saint-Germain B",
    away: "Olympique Lyon B",
    league: "Ligue 1",
    confidence: 85,
    heatMeter: 8.2,
    homeProb: 65,
    drawProb: 20,
    awayProb: 15,
    upset: false,
  },
  {
    id: "ai-3",
    home: "Real Catalonia",
    away: "Atletico Madrid B",
    league: "La Liga",
    confidence: 45,
    heatMeter: 9.1,
    homeProb: 40,
    drawProb: 30,
    awayProb: 30,
    upset: true,
  },
  {
    id: "ai-4",
    home: "FC Bayern Stadt",
    away: "Bayer Nordrhein",
    league: "Bundesliga",
    confidence: 78,
    heatMeter: 6.8,
    homeProb: 60,
    drawProb: 25,
    awayProb: 15,
    upset: false,
  },
];

export default function AIInsightPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">AI Insight</h1>
      <p className="text-sm text-gray-500">
        AI-powered match analysis and predictions
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_INSIGHTS.map((insight) => (
          <Link key={insight.id} href={`/en/ai-insight/${insight.id}`}>
            <Card neon={insight.upset ? "magenta" : "cyan"} hover className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="cyan" size="sm">
                  {insight.league}
                </Badge>
                {insight.upset && (
                  <Badge variant="red" size="sm">
                    Upset Alert
                  </Badge>
                )}
              </div>

              <div className="text-center mb-3">
                <p className="text-sm text-white">
                  {insight.home} vs {insight.away}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center mb-3">
                <div>
                  <p className="text-2xl font-bold font-mono text-cyan-400">
                    {insight.confidence}%
                  </p>
                  <p className="text-[10px] text-gray-500">Confidence</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-amber-400">
                    {insight.heatMeter}
                  </p>
                  <p className="text-[10px] text-gray-500">Heat</p>
                </div>
                <div>
                  <p className="text-2xl font-bold font-mono text-magenta-400">
                    {insight.homeProb}%
                  </p>
                  <p className="text-[10px] text-gray-500">Home Win</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Home {insight.homeProb}%</span>
                  <span>Draw {insight.drawProb}%</span>
                  <span>Away {insight.awayProb}%</span>
                </div>
                <ProgressBar value={insight.homeProb} max={100} color="cyan" size="sm" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
