"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchStatus } from "@/types/common";
import { Zap } from "lucide-react";

export default function PredictPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState("upcoming");

  const matches = [
    { id: "p1", home: "AC Milano Nord", away: "AS Roma Sud", league: "Serie A", time: "22:00", status: MatchStatus.UPCOMING },
    { id: "p2", home: "Paris Saint-Germain B", away: "Olympique Lyon B", league: "Ligue 1", time: "23:00", status: MatchStatus.UPCOMING },
    { id: "p3", home: "Real Catalonia", away: "Atletico Madrid B", league: "La Liga", time: "Tomorrow 21:00", status: MatchStatus.UPCOMING },
    { id: "p4", home: "FC Bayern Stadt", away: "Bayer Nordrhein", league: "Bundesliga", time: "Tomorrow 19:30", status: MatchStatus.UPCOMING },
  ];

  const history = [
    { id: "h1", home: "London United", away: "Mersey City", predicted: "2-1", actual: "2-1", points: 10, result: "correct" },
    { id: "h2", home: "Real Catalonia", away: "Atletico Madrid B", predicted: "1-1", actual: "1-0", points: 0, result: "incorrect" },
    { id: "h3", home: "FC Bayern Stadt", away: "Dortmund 09", predicted: "3-1", actual: "3-2", points: 5, result: "partial" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          {t("prediction.title")}
        </h1>
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-amber-400" />
          <span className="text-sm text-amber-400 font-mono">
            {t("prediction.streakCount", { count: 3 })}
          </span>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "upcoming", label: t("livescore.upcoming"), count: matches.length },
          { key: "history", label: t("prediction.predictionHistory"), count: history.length },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "upcoming" && (
        <div className="space-y-3">
          {matches.length === 0 ? (
            <EmptyState
              title={t("prediction.noUpcomingMatches")}
              description={t("prediction.checkBackLater")}
            />
          ) : (
            matches.map((m) => (
              <Card key={m.id} neon="cyan" hover>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-1">{m.league}</p>
                    <div className="flex items-center gap-3">
                      <div className="text-center flex-1">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 mx-auto mb-1 flex items-center justify-center text-cyan-400 font-bold text-xs">
                          {m.home.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-xs text-white truncate">{m.home}</p>
                      </div>
                      <div className="text-center shrink-0">
                        <p className="text-lg font-bold font-mono text-white">
                          {t("common.vs")}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {m.time.startsWith("Tomorrow")
                            ? m.time.replace("Tomorrow", t("common.tomorrow"))
                            : m.time}
                        </p>
                      </div>
                      <div className="text-center flex-1">
                        <div className="w-10 h-10 rounded-full bg-magenta-500/20 mx-auto mb-1 flex items-center justify-center text-magenta-400 font-bold text-xs">
                          {m.away.slice(0, 2).toUpperCase()}
                        </div>
                        <p className="text-xs text-white truncate">{m.away}</p>
                      </div>
                    </div>
                  </div>
                  <Link href={`/${locale}/predict/${m.id}`}>
                    <Button size="sm" neon>
                      {t("prediction.predictScore")}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "history" && (
        <div className="space-y-2">
          {history.length === 0 ? (
            <EmptyState
              title={t("prediction.noPredictions")}
              description={t("prediction.startPredictingHistory")}
            />
          ) : (
            history.map((h) => (
              <Card key={h.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-white truncate">
                      {h.home} {t("common.vs")} {h.away}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {t("prediction.predicted")}: {h.predicted} →{" "}
                      {t("prediction.actualResult")}: {h.actual}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge
                      variant={
                        h.result === "correct"
                          ? "green"
                          : h.result === "partial"
                            ? "gold"
                            : "red"
                      }
                    >
                      {h.result.toUpperCase()}
                    </Badge>
                    <p className="text-xs font-mono text-green-400 mt-1">
                      +{h.points} {t("common.points")}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
