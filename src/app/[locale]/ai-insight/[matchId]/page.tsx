import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  Flame,
  Gauge,
  Home,
  Shield,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { ProgressBarColor } from "@/components/ui/ProgressBar";
import AIInsightDetailTabs from "./AIInsightDetailTabs";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import {
  ApiFootballError,
  type ApiFootballAIInsightDetail,
  type ApiFootballFixture,
  getApiFootballAIInsightDetail,
} from "@/lib/api-football";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { cn } from "@/lib/utils";
import {
  type LocalizedDetailCopy,
  type InsightHeadToHeadRecord,
  detailCopy,
  comparisonLabels,
  formatDateTime,
  formatPercent,
  formatHeatMeter,
  formatMultiplier,
  formatScorePrediction,
  formatProbabilitySource,
  formatScore,
  clampPercent,
  getConfidenceTone,
  getHeatTone,
  getHeatDescription,
  getConfidenceDescription,
  getAIVerdict,
  getStatusLabel,
  isLiveStatus,
  isFinishedStatus,
  isHoldStatus,
  hasStandings,
  hasTeamStatsData,
} from "./_detail-shared";
import {
  SectionHeading,
  PredictionInfo,
  StrengthTeamRow,
  EmptyState,
} from "./_detail-ui";
import { ApiPredictionCard } from "./ModelTab";
import SummaryTab from "./SummaryTab";
import ModelTab from "./ModelTab";
import FormTab from "./FormTab";
import CommunityTab from "./CommunityTab";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

type DetailContext = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
};

export default async function AIInsightDetailPage({ params }: Props) {
  const { locale, matchId } = await params;
  const copy = getAIInsightPageCopy(locale);
  const details = detailCopy[locale] ?? detailCopy.th;
  const comparisonCopy =
    comparisonLabels[locale as keyof typeof comparisonLabels] ?? comparisonLabels.en;
  const context = await getDetailContext(matchId);

  if (!context) notFound();

  const { fixture, insight } = context;
  const confidenceTone = getConfidenceTone(insight.confidenceScore);
  const heatTone = getHeatTone(insight.heatMeter);
  const generatedAtLabel = insight.generatedAt
    ? formatDateTime(insight.generatedAt, locale)
    : details.noGeneratedTime;
  const headToHead =
    (insight as ApiFootballAIInsightDetail & { headToHead?: InsightHeadToHeadRecord[] })
      .headToHead ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 sm:px-4 md:px-6">
      <Link
        href={`/${locale}/ai-insight`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-cyan-300"
      >
        <ArrowLeft size={16} />
        {details.back}
      </Link>

      <section className="overflow-hidden rounded-[28px] border border-cyan-500/15 bg-[#080b14] shadow-[0_0_0_1px_rgba(8,145,178,0.06),0_24px_90px_rgba(2,8,23,0.85)]">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,#0d1322_0%,#0a101d_48%,#090d18_100%)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan" size="md" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={13} />
                {copy.title}
              </span>
            </Badge>
            {insight.upsetAlert ? (
              <Badge variant="gold" size="md">
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  {copy.labels.upsetAlert}
                </span>
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {fixture.league.logo ? (
              <Image
                src={fixture.league.logo}
                alt={fixture.league.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full border border-white/10 object-contain bg-white/5 p-0.5"
              />
            ) : null}
            <span className="font-medium text-gray-200">{fixture.league.name}</span>
            <span>{fixture.league.country}</span>
            {fixture.league.round ? <span>{fixture.league.round}</span> : null}
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 p-3 sm:gap-4 sm:p-4">
            <TeamHero
              name={fixture.home.name}
              logo={fixture.home.logo}
              alignment="left"
              favorite={insight.favoriteTeam === "home"}
              favoriteLabel={details.favoriteTeam}
            />
            <div className="flex min-w-[96px] flex-col items-center justify-center gap-1.5 px-1 text-center sm:min-w-[128px] sm:gap-2">
              <div className="font-mono text-[28px] font-black tracking-[0.1em] text-white sm:text-4xl sm:tracking-[0.18em]">
                {formatScore(fixture.score.home)}:{formatScore(fixture.score.away)}
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 sm:flex-row sm:flex-wrap sm:gap-2 sm:text-[11px]">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Clock3 size={12} className="text-cyan-300" />
                  {formatDateTime(fixture.kickoffTime, locale)}
                </span>
                <HeroStatusBadge fixture={fixture} copy={copy} details={details} />
              </div>
            </div>
            <TeamHero
              name={fixture.away.name}
              logo={fixture.away.logo}
              alignment="right"
              favorite={insight.favoriteTeam === "away"}
              favoriteLabel={details.favoriteTeam}
            />
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-4">
          <SimpleStatCard
            icon={Gauge}
            label={copy.labels.confidence}
            value={formatPercent(insight.confidenceScore)}
            note={getConfidenceDescription(insight.confidenceScore, details)}
            tone={confidenceTone}
          />
          <SimpleStatCard
            icon={Flame}
            label={details.heatMeter}
            value={formatHeatMeter(insight.heatMeter)}
            note={getHeatDescription(insight.heatMeter, copy)}
            tone={heatTone}
          />
          <SimpleStatCard
            icon={AlertTriangle}
            label={details.upsetRisk}
            value={formatPercent(insight.upsetRisk)}
            note={insight.upsetAlert ? copy.labels.upsetAlert : details.confidenceHigh}
            tone={insight.upsetAlert ? "magenta" : "green"}
          />
          <SimpleStatCard
            icon={Home}
            label={details.homeAdvantage}
            value={formatMultiplier(insight.homeAdvantageFactor)}
            note={fixture.home.name}
            tone="blue"
          />
        </div>

        <div className="border-t border-white/10 px-4 pb-4 sm:px-5 sm:pb-5">
          <StrengthSummary insight={insight} fixture={fixture} details={details} />
        </div>
      </section>

      {insight.upsetAlert && insight.upsetDescription ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4 text-sm text-amber-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold text-amber-200">{copy.labels.upsetAlert}</p>
            <p className="mt-1 text-amber-50/80">
              {typeof insight.upsetRisk === "number" ? `${Math.round(insight.upsetRisk)}% • ` : ""}
              {insight.upsetDescription}
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,10,18,0.96))] p-5">
          <SectionHeading
            icon={Target}
            title={details.quickTake}
            description={details.mainPrediction}
            accent="cyan"
          />
          <AIVerdictCard
            fixture={fixture}
            insight={insight}
            details={details}
          />
          <div className="mt-5 space-y-4">
            <ProbabilityRow label={fixture.home.name} value={insight.homeWinProbability} color="cyan" />
            <ProbabilityRow label={copy.labels.draw} value={insight.drawProbability} color="purple" />
            <ProbabilityRow label={fixture.away.name} value={insight.awayWinProbability} color="magenta" />
          </div>
          {Math.abs((insight.homeWinProbability ?? 0) - (insight.drawProbability ?? 0)) < 5 ? (
            <p className="mt-2 text-xs text-amber-300/80">
              {locale === "th"
                ? "ความน่าจะเป็นเจ้าบ้านและเสมอใกล้เคียงกัน — ดูตัวเลขประกอบการตัดสินใจ"
                : "Home win and draw probabilities are very close — consider both outcomes"}
            </p>
          ) : null}
          {insight.probabilitySource ? (
            <p className="mt-3 text-xs text-gray-500">
              {details.probabilitySource}:{" "}
              <span className="text-gray-300">
                {formatProbabilitySource(insight.probabilitySource, details)}
              </span>
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PredictionInfo label={details.winnerLean} value={insight.apiWinner?.name} />
            <PredictionInfo label={details.likelyScore} value={formatScorePrediction(insight.apiPredictedGoals)} />
          </div>
        </Card>

        <div className="space-y-5">
          <KeyFactorsPanel factors={insight.keyFactors} copy={copy} />
          <ApiPredictionCard insight={insight} details={details} locale={locale} />
        </div>
      </section>

      <AIInsightDetailTabs
        labels={{
          summary: details.tabSummary,
          model: details.tabModel,
          form: details.tabForm,
          community: details.tabCommunity,
        }}
        summary={
          <SummaryTab
            fixture={fixture}
            insight={insight}
            details={details}
            locale={locale}
            copy={copy}
            hasStandingsData={hasStandings(insight.standings)}
            hasTeamStatsDataResult={hasTeamStatsData(insight.teamStats)}
          />
        }
        model={
          <ModelTab
            fixture={fixture}
            insight={insight}
            details={details}
            locale={locale}
            headToHead={headToHead}
            comparisonLabels={comparisonCopy}
          />
        }
        form={
          <FormTab
            fixture={fixture}
            insight={insight}
            details={details}
          />
        }
        community={
          <CommunityTab
            fixture={fixture}
            insight={insight}
            details={details}
            locale={locale}
            copy={copy}
          />
        }
      />

      <div className="rounded-2xl border border-white/8 bg-[#09101b] px-4 py-3 text-center text-xs text-gray-500">
        {details.generatedAt}: {generatedAtLabel}
      </div>
    </div>
  );
}

async function getDetailContext(matchId: string): Promise<DetailContext | null> {
  const fixtureId = extractApiFixtureId(matchId);
  if (!fixtureId) return null;

  try {
    const insight = await getApiFootballAIInsightDetail(fixtureId);

    return {
      fixture: insight.fixture,
      insight,
    };
  } catch (error) {
    if (error instanceof ApiFootballError && error.status === 404) return null;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Page-local components (hero, stat card, strength summary, verdict, etc.)
// ---------------------------------------------------------------------------

function TeamHero({
  name,
  logo,
  alignment,
  favorite = false,
  favoriteLabel,
}: {
  name: string;
  logo: string | null;
  alignment: "left" | "right";
  favorite?: boolean;
  favoriteLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3",
        alignment === "right" && "sm:flex-row-reverse sm:text-right"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 p-2 sm:h-14 sm:w-14">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        ) : (
          <Shield size={24} className="text-gray-500" />
        )}
      </div>
      <div className={cn("min-w-0", alignment === "right" && "sm:text-right")}>
        <p className="line-clamp-2 text-sm font-bold leading-tight text-white sm:text-lg">
          {name}
        </p>
        {favorite ? (
          <span className="mt-1 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            {`★ ${favoriteLabel}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SimpleStatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: "green" | "gold" | "red" | "blue" | "magenta";
}) {
  const accent = {
    green: "text-green-300 border-green-400/15 bg-green-400/6",
    gold: "text-amber-300 border-amber-400/15 bg-amber-400/6",
    red: "text-red-300 border-red-400/15 bg-red-400/6",
    blue: "text-cyan-300 border-cyan-400/15 bg-cyan-400/6",
    magenta: "text-magenta border-magenta/15 bg-magenta/6",
  } as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
        </div>
        <div className={cn("rounded-xl border p-2", accent[tone])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-400">{note}</p>
    </div>
  );
}

function StrengthSummary({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  const hasProbabilities =
    typeof insight.homeWinProbability === "number" &&
    typeof insight.drawProbability === "number" &&
    typeof insight.awayWinProbability === "number";

  if (!hasProbabilities) return null;

  const homeProbability = clampPercent(insight.homeWinProbability ?? 0);
  const drawProbability = clampPercent(insight.drawProbability ?? 0);
  const awayProbability = clampPercent(insight.awayWinProbability ?? 0);
  const favorite = insight.apiWinner?.name;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{details.matchupBoard}</p>
          <p className="mt-1 text-sm text-gray-300">{details.probabilityBreakdown}</p>
        </div>
        {favorite ? (
          <Badge variant="cyan">{`${details.favoriteTeam}: ${favorite}`}</Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        <StrengthTeamRow label={fixture.home.name} value={homeProbability} color="cyan" />
        <StrengthTeamRow label={details.drawOption} value={drawProbability} color="purple" />
        <StrengthTeamRow label={fixture.away.name} value={awayProbability} color="magenta" />
      </div>
    </div>
  );
}

function AIVerdictCard({
  fixture,
  insight,
  details,
}: {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
}) {
  const verdict = getAIVerdict(fixture, insight, details);

  return (
    <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{details.aiVerdict}</p>
      <p className="mt-2 text-lg font-bold text-white">{verdict.title}</p>
      <p className="mt-1 text-sm text-gray-300">{verdict.detail}</p>
      {verdict.liveNote ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-100">
          <span className="mr-2 text-cyan-300">{details.liveContext}</span>
          {verdict.liveNote}
        </div>
      ) : null}
    </div>
  );
}

function ProbabilityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: ProgressBarColor;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-gray-200">{label}</span>
        <span className="font-mono text-sm text-white">{formatPercent(value)}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="lg" className="w-full" />
    </div>
  );
}

function KeyFactorsPanel({
  factors,
  copy,
}: {
  factors: string[];
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,19,32,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Sparkles}
        title={copy.labels.keyFactors}
        description={copy.sections.matchInsights}
        accent="cyan"
      />
      <div className="mt-5 space-y-3">
        {factors.length === 0 ? (
          <EmptyState label={copy.empty.description} />
        ) : (
          factors.map((factor) => (
            <div
              key={factor}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
              <span className="leading-6">{factor}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function HeroStatusBadge({
  fixture,
  copy,
  details,
}: {
  fixture: ApiFootballFixture;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  details: LocalizedDetailCopy;
}) {
  const short = fixture.statusShort.toUpperCase();
  const live = isLiveStatus(short, fixture.elapsed);
  const finished = isFinishedStatus(short);
  const hold = isHoldStatus(short);
  const className = live
    ? "border-red-400/20 bg-red-400/10 text-red-300"
    : finished
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : hold
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-[11px]", className)}>
      {getStatusLabel(fixture, copy, details)}
    </span>
  );
}
