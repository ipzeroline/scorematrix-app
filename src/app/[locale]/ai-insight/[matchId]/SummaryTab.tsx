import { AlertTriangle, BarChart3, Clock3, HeartPulse, Target, TrendingUp, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import type {
  ApiFootballAIInsightDetail,
  ApiFootballAIInsightStanding,
  ApiFootballAIInsightTeamStats,
  ApiFootballFixture,
  ApiFootballTeamFormProfile,
} from "@/lib/api-football";
import { cn } from "@/lib/utils";
import {
  type LocalizedDetailCopy,
  formatDateTime,
  formatPercent,
  formatNullableNumber,
  formatDecimal,
  formatPossession,
  formatSignedNumber,
  formatBoolean,
  formatTopLevelGoals,
  formatScorePrediction,
  isLiveStatus,
  getImpactDescription,
  getAIVerdict,
  getConfidenceDescription,
  getStatusLabel,
} from "./_detail-shared";
import {
  SectionHeading,
  PredictionInfo,
  StatChip,
  TagPill,
  EmptyState,
  InfoRow,
} from "./_detail-ui";

type SummaryTabProps = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  locale: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  hasStandingsData: boolean;
  hasTeamStatsDataResult: boolean;
};

export default function SummaryTab({
  fixture,
  insight,
  details,
  locale,
  copy,
  hasStandingsData,
  hasTeamStatsDataResult,
}: SummaryTabProps) {
  return (
    <div className="space-y-5">
      {hasStandingsData ? (
        <StandingsCard
          standings={insight.standings ?? null}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
          details={details}
        />
      ) : null}
      {hasTeamStatsDataResult ? (
        <TeamStatsCard
          teamStats={insight.teamStats ?? null}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
          details={details}
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <FixtureMetaCard fixture={fixture} details={details} locale={locale} copy={copy} />
        <FormIndexOverview
          insight={insight}
          fixture={fixture}
          details={details}
        />
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <MemberDecisionPanel
          fixture={fixture}
          insight={insight}
          details={details}
          copy={copy}
        />
        <InjuryImpactCard
          injuryImpact={insight.injuryImpact}
          homeName={fixture.home.name}
          awayName={fixture.away.name}
          copy={copy}
          details={details}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StandingsCard({
  standings,
  homeName,
  awayName,
  details,
}: {
  standings: ApiFootballAIInsightDetail["standings"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={Trophy}
        title={details.standings}
        description={details.leaguePosition}
        accent="gold"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StandingColumn name={homeName} standing={standings?.home ?? null} details={details} tone="cyan" />
        <StandingColumn name={awayName} standing={standings?.away ?? null} details={details} tone="magenta" />
      </div>
    </Card>
  );
}

function StandingColumn({
  name,
  standing,
  details,
  tone,
}: {
  name: string;
  standing: ApiFootballAIInsightStanding | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  if (!standing) {
    return (
      <div className="rounded-xl border border-border bg-elevated/40 p-4">
        <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
        <div className="mt-3">
          <EmptyState label={details.noPrediction} />
        </div>
      </div>
    );
  }

  const form = String(standing.form ?? "")
    .split("")
    .filter((value): value is "W" | "D" | "L" => value === "W" || value === "D" || value === "L");

  return (
    <div className="rounded-xl border border-border bg-elevated/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={cn("truncate text-sm font-bold", accent)}>{name}</h3>
          {standing.description ? (
            <p className="mt-1 text-xs text-gray-500">{standing.description}</p>
          ) : null}
        </div>
        {typeof standing.rank === "number" ? (
          <span className="shrink-0 rounded-full border border-border bg-bg/50 px-3 py-1 font-mono text-sm font-black text-white">
            #{standing.rank}
          </span>
        ) : null}
      </div>

      {form.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {form.map((result, index) => (
            <span
              key={`${name}-${result}-${index}`}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
                result === "W" && "bg-success/10 text-success border border-success/20",
                result === "D" && "bg-warning/10 text-warning border border-warning/20",
                result === "L" && "bg-danger/10 text-danger border border-danger/20"
              )}
            >
              {result}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatChip label={details.pointsLabel} value={formatNullableNumber(standing.points)} />
        <StatChip label={details.played} value={formatNullableNumber(standing.played)} />
        <StatChip label={details.goalDiff} value={formatSignedNumber(standing.goalDiff)} />
        <StatChip
          label={`${details.wins}/${details.draws}/${details.losses}`}
          value={`${formatNullableNumber(standing.win)}/${formatNullableNumber(
            standing.draw
          )}/${formatNullableNumber(standing.lose)}`}
        />
        <StatChip label={details.goalsFor} value={formatNullableNumber(standing.goalsFor)} />
        <StatChip label={details.goalsAgainst} value={formatNullableNumber(standing.goalsAgainst)} />
      </div>
    </div>
  );
}

function TeamStatsCard({
  teamStats,
  homeName,
  awayName,
  details,
}: {
  teamStats: ApiFootballAIInsightDetail["teamStats"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={BarChart3}
        title={details.teamStatsSeason}
        description={details.seasonAverages}
        accent="cyan"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TeamStatsColumn name={homeName} stats={teamStats?.home ?? null} details={details} tone="cyan" />
        <TeamStatsColumn name={awayName} stats={teamStats?.away ?? null} details={details} tone="magenta" />
      </div>
    </Card>
  );
}

function TeamStatsColumn({
  name,
  stats,
  details,
  tone,
}: {
  name: string;
  stats: ApiFootballAIInsightTeamStats | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  if (!stats) {
    return (
      <div className="rounded-xl border border-border bg-elevated/40 p-4">
        <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
        <div className="mt-3">
          <EmptyState label={details.noPrediction} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-elevated/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className={cn("truncate text-sm font-bold", accent)}>{name}</h3>
        {stats.formations ? (
          <span className="shrink-0 rounded-full border border-border bg-bg/50 px-2.5 py-0.5 font-mono text-xs text-text-secondary">
            {stats.formations}
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatChip label={details.avgScored} value={formatDecimal(stats.avgGoalsFor)} />
        <StatChip label={details.avgConceded} value={formatDecimal(stats.avgGoalsAgainst)} />
        <StatChip label={details.possession} value={formatPossession(stats.avgBallPossession)} />
        <StatChip label={details.cleanSheets} value={formatNullableNumber(stats.cleanSheets)} />
        <StatChip label={details.failedToScore} value={formatNullableNumber(stats.failedToScore)} />
        <StatChip label={details.penalties} value={formatNullableNumber(stats.penaltyScored)} />
        <StatChip label={details.avgCards} value={formatDecimal(stats.cardsAvg)} />
      </div>
    </div>
  );
}

function FixtureMetaCard({
  fixture,
  details,
  locale,
  copy,
}: {
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
  locale: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={Clock3}
        title={details.fixtureMeta}
        description={details.matchOverview}
        accent="cyan"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PredictionInfo label={details.apiFixtureId} value={String(fixture.apiFixtureId ?? "-")} />
        <PredictionInfo label={details.apiLeagueId} value={String(fixture.league.apiLeagueId ?? "-")} />
        <PredictionInfo label={details.season} value={String(fixture.league.season ?? "-")} />
        <PredictionInfo label={details.kickoff} value={formatDateTime(fixture.kickoffTime, locale)} />
        <PredictionInfo
          label={details.liveFlag}
          value={formatBoolean(isLiveStatus(fixture.statusShort.toUpperCase(), fixture.elapsed), locale)}
        />
        <PredictionInfo label={details.status} value={getStatusLabel(fixture, copy, details)} />
        <PredictionInfo label={details.round} value={fixture.league.round || "-"} />
        <PredictionInfo label={details.venue} value={fixture.venue || "-"} />
        <PredictionInfo label={details.referee} value={fixture.referee || "-"} />
      </div>
    </Card>
  );
}

function FormIndexOverview({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={TrendingUp}
        title={details.formIndex}
        description={details.recentProfile}
        accent="green"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecentProfileOverview
          name={fixture.home.name}
          formIndex={insight.formComparison.homeFormIndex}
          profile={insight.formComparison.homeLastFive}
          details={details}
          tone="cyan"
        />
        <RecentProfileOverview
          name={fixture.away.name}
          formIndex={insight.formComparison.awayFormIndex}
          profile={insight.formComparison.awayLastFive}
          details={details}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function RecentProfileOverview({
  name,
  formIndex,
  profile,
  details,
  tone,
}: {
  name: string;
  formIndex: number | null;
  profile: ApiFootballTeamFormProfile | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-xl border border-border bg-elevated/40 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.formIndex} value={formatNullableNumber(formIndex)} />
        <InfoRow label={details.played} value={formatNullableNumber(profile?.played)} />
        <InfoRow label={details.formSnapshot} value={profile?.form ?? "-"} />
        <InfoRow label={details.attack} value={formatPercent(profile?.att)} />
        <InfoRow label={details.defense} value={formatPercent(profile?.def)} />
        <InfoRow
          label={details.goalsFor}
          value={formatTopLevelGoals(profile?.goals?.for, details)}
        />
        <InfoRow
          label={details.goalsAgainst}
          value={formatTopLevelGoals(profile?.goals?.against, details)}
        />
      </div>
    </div>
  );
}

function MemberDecisionPanel({
  fixture,
  insight,
  details,
  copy,
}: {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  const predictedScore = formatScorePrediction(insight.apiPredictedGoals);
  const verdict = getAIVerdict(fixture, insight, details);
  const confidenceDescription = getConfidenceDescription(insight.confidenceScore, details);
  const favoriteLabel =
    insight.favoriteTeam === "home"
      ? fixture.home.name
      : insight.favoriteTeam === "away"
        ? fixture.away.name
        : details.drawOption;
  const riskTone =
    typeof insight.upsetRisk === "number" && insight.upsetRisk >= 70
      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
      : "border-cyan-300/20 bg-cyan-300/10 text-cyan-100";

  return (
    <Card className="border-cyan-300/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.08),rgba(5,8,15,0.9)_46%,rgba(217,70,239,0.06))] p-5 shadow-xl">
      <SectionHeading
        icon={Target}
        title={details.quickTake}
        description={details.mainPrediction}
        accent="cyan"
      />
      <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
          {details.aiVerdict}
        </p>
        <p className="mt-2 text-lg font-black leading-relaxed text-white">
          {verdict.title}
        </p>
        <p className="mt-2 text-sm font-semibold leading-relaxed text-text-secondary">
          {verdict.detail}
        </p>
        {verdict.liveNote ? (
          <p className="mt-2 text-xs font-bold text-cyan-200">{verdict.liveNote}</p>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PredictionInfo label={details.winnerLean} value={favoriteLabel} />
        <PredictionInfo label={details.likelyScore} value={predictedScore ?? details.predictedGoalsUnavailable} />
        <PredictionInfo
          label={details.confidenceSummary}
          value={`${formatPercent(insight.confidenceScore)} • ${confidenceDescription}`}
        />
        <PredictionInfo
          label={details.upsetRisk}
          value={typeof insight.upsetRisk === "number" ? formatPercent(insight.upsetRisk) : "-"}
        />
      </div>
      <div className="mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/25 text-center">
        <MemberProbability label={fixture.home.name} value={insight.homeWinProbability} tone="cyan" />
        <MemberProbability label={details.drawOption} value={insight.drawProbability} tone="gold" />
        <MemberProbability label={fixture.away.name} value={insight.awayWinProbability} tone="magenta" />
      </div>
      <div className={cn("mt-4 flex items-start gap-3 rounded-xl border px-3 py-2.5 text-xs font-semibold", riskTone)}>
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <span>
          {insight.upsetAlert ? copy.labels.upsetAlert : details.confidenceMid}
        </span>
      </div>
    </Card>
  );
}

function MemberProbability({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone: "cyan" | "gold" | "magenta";
}) {
  const toneClass = {
    cyan: "text-cyan-200",
    gold: "text-amber-200 border-x border-white/10",
    magenta: "text-fuchsia-200",
  }[tone];

  return (
    <div className={cn("min-w-0 px-3 py-3", toneClass)}>
      <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className="mt-1 font-mono text-lg font-black text-white">{formatPercent(value)}</p>
    </div>
  );
}

function InjuryImpactCard({
  injuryImpact,
  homeName,
  awayName,
  copy,
  details,
}: {
  injuryImpact: ApiFootballAIInsightDetail["injuryImpact"];
  homeName: string;
  awayName: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  details: LocalizedDetailCopy;
}) {
  if (!injuryImpact) {
    return (
      <Card className="border-border bg-surface p-5 shadow-xl">
        <SectionHeading
          icon={HeartPulse}
          title={details.injuryDesk}
          description={copy.labels.injuryImpact}
          accent="gold"
        />
        <div className="mt-4">
          <EmptyState label={details.noImpact} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-surface p-5 shadow-xl">
      <SectionHeading
        icon={HeartPulse}
        title={details.injuryDesk}
        description={copy.labels.injuryImpact}
        accent="gold"
      />
      <div className="mt-4 grid gap-4">
        <InjuryTeamCard
          name={homeName}
          impact={injuryImpact.homeImpact}
          injuries={injuryImpact.homeInjuries}
          details={details}
          tone="cyan"
        />
        <InjuryTeamCard
          name={awayName}
          impact={injuryImpact.awayImpact}
          injuries={injuryImpact.awayInjuries}
          details={details}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function InjuryTeamCard({
  name,
  impact,
  injuries,
  details,
  tone,
}: {
  name: string;
  impact: number | null;
  injuries: string[];
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const toneClasses =
    tone === "cyan"
      ? "border-primary/20 bg-primary/10 text-primary"
      : "border-magenta/20 bg-magenta/10 text-magenta";

  // formatSlashMetric inline to avoid import overhead
  const slashMetric = typeof impact === "number" ? `${Math.round(impact * 10) / 10}/10` : "-/10";

  return (
    <div className="rounded-xl border border-border bg-elevated/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">
            {details.teamImpact}
          </p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", toneClasses)}>
          {slashMetric}
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-300">{getImpactDescription(impact, details)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {injuries.length > 0 ? (
          injuries.map((injury) => (
            <TagPill key={`${name}-${injury}`} tone={tone}>
              {injury}
            </TagPill>
          ))
        ) : (
          <TagPill tone="neutral">{details.noImpact}</TagPill>
        )}
      </div>
    </div>
  );
}
