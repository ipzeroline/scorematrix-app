"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import type { ApiFootballFixture } from "@/lib/api-football";
import { Zap } from "lucide-react";

interface PredictApiDemoProps {
  fixtures: ApiFootballFixture[];
}

export function PredictApiDemo({ fixtures }: PredictApiDemoProps) {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState("upcoming");
  const matches = useMemo(
    () => fixtures.filter((match) => match.status === MatchStatus.UPCOMING),
    [fixtures]
  );

  const history = fixtures
    .filter((match) => match.status === MatchStatus.FINISHED)
    .slice(0, 3)
    .map((match, index) => ({
      id: match.id,
      home: match.home.name,
      away: match.away.name,
      predicted: index % 2 === 0 ? "2-1" : "1-1",
      actual: `${match.score.home ?? 0}-${match.score.away ?? 0}`,
      points: index % 2 === 0 ? 10 : 0,
      result: index % 2 === 0 ? "correct" : "incorrect",
    }));

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
            matches.map((match) => (
              <Card key={match.id} neon="cyan" hover>
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-500 mb-1">
                      {match.league.name}
                    </p>
                    <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-3">
                      <TeamPick
                        name={match.home.name}
                        logo={match.home.logo}
                        accent="cyan"
                      />
                      <div className="text-center shrink-0">
                        <p className="text-lg font-bold font-mono text-white">
                          {t("common.vs")}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatKickoff(match.kickoffTime)}
                        </p>
                      </div>
                      <TeamPick
                        name={match.away.name}
                        logo={match.away.logo}
                        accent="magenta"
                      />
                    </div>
                  </div>
                  <Link href={`/${locale}/predict/${match.id}`}>
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
                      {t("prediction.predicted")}: {h.predicted} {"->"}{" "}
                      {t("prediction.actualResult")}: {h.actual}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <Badge variant={h.result === "correct" ? "green" : "red"}>
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

function TeamPick({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="text-center min-w-0">
      <div className="mb-1 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} accent={accent} />
      </div>
      <p className="text-xs text-white truncate">{name}</p>
    </div>
  );
}

function formatKickoff(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
