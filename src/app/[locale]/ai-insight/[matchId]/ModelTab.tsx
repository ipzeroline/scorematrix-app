import { BarChart3, BrainCircuit, Goal, Swords } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { ApiFootballAIInsightDetail, ApiFootballFixture } from "@/lib/api-football";
import { cn } from "@/lib/utils";
import {
  type LocalizedDetailCopy,
  type InsightHeadToHeadRecord,
  formatDateTime,
  formatPercent,
  formatBoolean,
  formatNullableNumber,
  formatDecimal,
  formatMultiplier,
  formatScorePrediction,
  formatHeadToHeadFulltime,
  formatVenue,
  clampPercent,
  getLocalizedModelAdvice,
  getLocalizedWinnerComment,
} from "./_detail-shared";
import {
  SectionHeading,
  PredictionInfo,
  TeamShare,
  EmptyState,
  InfoRow,
  StatusPill,
  StrengthTeamRow,
} from "./_detail-ui";

type ModelTabProps = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  locale: string;
  headToHead: InsightHeadToHeadRecord[];
  comparisonLabels: Record<string, string>;
};

export default function ModelTab({
  fixture,
  insight,
  details,
  locale,
  headToHead,
  comparisonLabels,
}: ModelTabProps) {
  return (
    <div className="space-y-5">
      <ModelStrengthCard insight={insight} fixture={fixture} details={details} />
      <HeadToHeadCard
        history={headToHead}
        summary={insight.h2hSummary ?? null}
        homeName={fixture.home.name}
        awayName={fixture.away.name}
        details={details}
        locale={locale}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <ApiPredictionCard fixture={fixture} insight={insight} details={details} locale={locale} />
        <ComparisonPanel
          comparison={insight.comparison}
          labels={comparisonLabels}
          details={details}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ModelStrengthCard({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  const favorite =
    insight.favoriteTeam === "home"
      ? fixture.home.name
      : insight.favoriteTeam === "away"
        ? fixture.away.name
        : insight.favoriteTeam;

  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={BrainCircuit}
        title={details.modelDiagnostics}
        description={details.diagnosticDescription}
        accent="cyan"
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PredictionInfo label={details.favoriteTeam} value={favorite} />
        <PredictionInfo label={details.strengthGap} value={formatNullableNumber(insight.strengthGap)} />
        <PredictionInfo label={details.homeAdvantage} value={formatMultiplier(insight.homeAdvantageFactor)} />
      </div>
      <div className="mt-5 space-y-4 rounded-xl border border-border bg-bg/50 p-4">
        <StrengthTeamRow
          label={`${fixture.home.name} · ${details.homeStrength}`}
          value={clampPercent(insight.homeStrength ?? 0)}
          color="cyan"
        />
        <StrengthTeamRow
          label={`${fixture.away.name} · ${details.awayStrength}`}
          value={clampPercent(insight.awayStrength ?? 0)}
          color="magenta"
        />
      </div>
    </Card>
  );
}

export function ApiPredictionCard({
  fixture,
  insight,
  details,
  locale,
}: {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  locale: string;
}) {
  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={BrainCircuit}
        title={details.apiAdvice}
        description={details.matchOverview}
        accent="gold"
      />
      <div className="mt-4 space-y-4">
        <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
          <p className="text-sm leading-6 text-text-secondary">
            {getLocalizedModelAdvice(fixture, insight, details)}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PredictionInfo label={details.winnerLean} value={insight.apiWinner?.name} />
          <PredictionInfo label={details.winnerNote} value={getLocalizedWinnerComment(fixture, insight, details)} />
          <PredictionInfo
            label={details.winOrDraw}
            value={formatBoolean(insight.apiWinOrDraw, locale)}
          />
          {insight.apiUnderOver ? (
            <PredictionInfo label={details.overUnder} value={insight.apiUnderOver} />
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-elevated/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500">{details.likelyScore}</p>
            <Goal size={14} className="text-cyan-300" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatScorePrediction(insight.apiPredictedGoals) ?? "-"}
          </p>
          {!formatScorePrediction(insight.apiPredictedGoals) ? (
            <p className="mt-2 text-sm text-gray-500">{details.predictedGoalsUnavailable}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function HeadToHeadCard({
  history,
  summary,
  homeName,
  awayName,
  details,
  locale,
}: {
  history: InsightHeadToHeadRecord[];
  summary: ApiFootballAIInsightDetail["h2hSummary"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
  locale: string;
}) {
  const hasSummary = !!summary && summary.totalMatches > 0;

  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={Swords}
        title={details.headToHead}
        description={details.matchOverview}
        accent="purple"
      />
      {hasSummary ? (
        <H2HSummaryBoard
          summary={summary}
          homeName={homeName}
          awayName={awayName}
          details={details}
        />
      ) : null}
      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          hasSummary ? null : <EmptyState label={details.noHistory} />
        ) : (
          history.map((match) => (
            <div
              key={match.fixtureId}
              className="rounded-xl border border-border bg-elevated/40 p-4"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                <span>{formatDateTime(match.date, locale)}</span>
                <span>
                  {match.league?.name}
                  {match.league?.season ? ` · ${match.league.season}` : ""}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm text-gray-300">
                  <p className="truncate font-medium text-white">{match.teams.home.name}</p>
                  <p className="truncate">{match.teams.away.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-black text-white">
                    {typeof match.goals.home === "number" ? match.goals.home : "-"}:{typeof match.goals.away === "number" ? match.goals.away : "-"}
                  </p>
                  {formatHeadToHeadFulltime(match.score?.fulltime) ? (
                    <p className="text-xs text-gray-500">
                      {details.fulltime}: {formatHeadToHeadFulltime(match.score?.fulltime)}
                    </p>
                  ) : null}
                  {formatHeadToHeadFulltime(match.score?.halftime) ? (
                    <p className="text-xs text-gray-500">
                      {details.halftime}: {formatHeadToHeadFulltime(match.score?.halftime)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                <InfoRow label={details.round} value={match.league?.round || "-"} />
                <InfoRow label={details.country} value={match.league?.country || "-"} />
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">{details.status}</span>
                  <StatusPill status={match.status?.short || "-"} />
                </div>
                <InfoRow
                  label={details.venue}
                  value={formatVenue(match.venue)}
                />
                <InfoRow label={details.referee} value={match.referee || "-"} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function H2HSummaryBoard({
  summary,
  homeName,
  awayName,
  details,
}: {
  summary: NonNullable<ApiFootballAIInsightDetail["h2hSummary"]>;
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  const total = summary.totalMatches || 1;
  const segments = [
    { label: homeName, value: summary.homeWins, className: "bg-cyan-400" },
    { label: details.drawOption, value: summary.draws, className: "bg-amber-400" },
    { label: awayName, value: summary.awayWins, className: "bg-magenta" },
  ];

  return (
    <div className="mt-4 rounded-xl border border-border bg-bg/50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="uppercase tracking-[0.24em] text-gray-500">{details.h2hSummaryTitle}</span>
        <div className="flex items-center gap-3 text-gray-400">
          <span>
            {details.totalMeetings}: <span className="font-mono text-white">{summary.totalMatches}</span>
          </span>
          <span>
            {details.avgGoals}: <span className="font-mono text-white">{formatDecimal(summary.avgGoals)}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-border">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{ width: `${Math.round((segment.value / total) * 100)}%` }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-mono text-lg font-black text-cyan-300">{summary.homeWins}</p>
          <p className="truncate text-gray-500">{homeName}</p>
        </div>
        <div>
          <p className="font-mono text-lg font-black text-amber-300">{summary.draws}</p>
          <p className="text-gray-500">{details.drawOption}</p>
        </div>
        <div>
          <p className="font-mono text-lg font-black text-magenta">{summary.awayWins}</p>
          <p className="truncate text-gray-500">{awayName}</p>
        </div>
      </div>

      {summary.recentForm.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {summary.recentForm.map((result, index) => {
            const upper = String(result).toUpperCase();
            return (
              <span
                key={`h2h-form-${index}`}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black",
                  upper === "H" && "bg-primary/10 text-primary border border-primary/20",
                  upper === "D" && "bg-warning/10 text-warning border border-warning/20",
                  upper === "A" && "bg-magenta/10 text-magenta border border-magenta/20"
                )}
              >
                {upper}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ComparisonPanel({
  comparison,
  labels,
  details,
  homeName,
  awayName,
}: {
  comparison: ApiFootballAIInsightDetail["comparison"];
  labels: Record<string, string>;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
}) {
  const rows = Object.entries(comparison);

  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={BarChart3}
        title={details.sourceComparison}
        description={details.matchOverview}
        accent="purple"
      />
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <EmptyState label={details.noComparison} />
        ) : (
          rows.map(([key, value]) => (
            <div key={key} className="rounded-xl border border-border bg-elevated/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-white">{labels[key] ?? key}</span>
                <span className="font-mono text-gray-400">
                  {formatPercent(value.home)} / {formatPercent(value.away)}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TeamShare label={homeName} value={value.home} color="cyan" />
                <TeamShare label={awayName} value={value.away} color="magenta" />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

// Re-export for use in page.tsx quick-take section
export { ApiPredictionCard as ModelApiPredictionCard };
