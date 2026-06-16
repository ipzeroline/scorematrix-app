import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Activity,
  BarChart3,
  Clock3,
  Crosshair,
  Flame,
  Gauge,
  Home,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Trophy,
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
import { serializeJsonLd } from "@/lib/json-ld";
import { LOCALE_CODES } from "@/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
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

const SEO_COPY = {
  th: {
    fallbackTitle: "วิเคราะห์บอล AI | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `วิเคราะห์บอล AI ${home} vs ${away} - ${league} | ความน่าจะเป็นและทรรศนะ`,
    insightLabel: "วิเคราะห์บอล AI",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `วิเคราะห์บอล AI ${home} พบ ${away} ในรายการ ${league}`,
    confidence: "ความมั่นใจ",
    homeWin: "เจ้าบ้านชนะ",
    draw: "เสมอ",
    awayWin: "ทีมเยือนชนะ",
    upset: "มีสัญญาณพลิกล็อก",
    keywords: ["วิเคราะห์บอล AI", "ทรรศนะบอล", "วิเคราะห์บอลวันนี้", "ทีเด็ดบอล", "สถิติฟุตบอล"],
  },
  en: {
    fallbackTitle: "AI Football Insight | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `${home} vs ${away} AI Football Insight - ${league} | Probabilities & Prediction`,
    insightLabel: "AI football insight",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `AI football insight for ${home} vs ${away} in ${league}`,
    confidence: "confidence",
    homeWin: "home win",
    draw: "draw",
    awayWin: "away win",
    upset: "upset alert",
    keywords: ["AI football prediction", "football insight", "match probabilities", "football analysis", "soccer prediction"],
  },
  lo: {
    fallbackTitle: "AI Football Insight | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `AI Insight ${home} vs ${away} - ${league} | ຄວາມນ່າຈະເປັນແລະບົດວິເຄາະ`,
    insightLabel: "AI football insight",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `AI football insight ສໍາລັບ ${home} vs ${away} ໃນ ${league}`,
    confidence: "confidence",
    homeWin: "home win",
    draw: "draw",
    awayWin: "away win",
    upset: "upset alert",
    keywords: ["AI football prediction", "football insight", "match probabilities", "football analysis", "soccer prediction"],
  },
  my: {
    fallbackTitle: "AI Football Insight | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `AI Insight ${home} vs ${away} - ${league} | ဖြစ်နိုင်ခြေနှင့် ခန့်မှန်းချက်`,
    insightLabel: "AI football insight",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `${league} တွင် ${home} vs ${away} အတွက် AI football insight`,
    confidence: "confidence",
    homeWin: "home win",
    draw: "draw",
    awayWin: "away win",
    upset: "upset alert",
    keywords: ["AI football prediction", "football insight", "match probabilities", "football analysis", "soccer prediction"],
  },
  km: {
    fallbackTitle: "AI Football Insight | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `AI Insight ${home} vs ${away} - ${league} | ប្រូបាប និងការវិភាគ`,
    insightLabel: "AI football insight",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `AI football insight សម្រាប់ ${home} vs ${away} ក្នុង ${league}`,
    confidence: "confidence",
    homeWin: "home win",
    draw: "draw",
    awayWin: "away win",
    upset: "upset alert",
    keywords: ["AI football prediction", "football insight", "match probabilities", "football analysis", "soccer prediction"],
  },
  zh: {
    fallbackTitle: "AI Football Insight | ScoreMatrix",
    title: (home: string, away: string, league: string) =>
      `${home} vs ${away} AI 足球分析 - ${league} | 概率与预测`,
    insightLabel: "AI football insight",
    descriptionPrefix: (home: string, away: string, league: string) =>
      `${league} ${home} vs ${away} 的 AI football insight`,
    confidence: "confidence",
    homeWin: "home win",
    draw: "draw",
    awayWin: "away win",
    upset: "upset alert",
    keywords: ["AI football prediction", "football insight", "match probabilities", "football analysis", "soccer prediction"],
  },
} as const;

const UI_COPY = {
  th: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "แผนที่โอกาสชนะ",
    modelRead: "อ่านเกมจากโมเดล",
    strongestSignal: "สัญญาณหลัก",
    teamEdge: "ทีมที่ได้เปรียบ",
    balancedGame: "เกมสูสี",
    versus: "ปะทะ",
    kickoff: "เวลาแข่ง",
    homeSide: "เจ้าบ้าน",
    awaySide: "ทีมเยือน",
    contender: "คู่แข่ง",
  },
  en: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "Win Probability Map",
    modelRead: "Model Read",
    strongestSignal: "Primary Signal",
    teamEdge: "Team Edge",
    balancedGame: "Balanced Game",
    versus: "versus",
    kickoff: "Kickoff",
    homeSide: "Home",
    awaySide: "Away",
    contender: "Contender",
  },
  lo: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "Win Probability Map",
    modelRead: "Model Read",
    strongestSignal: "Primary Signal",
    teamEdge: "Team Edge",
    balancedGame: "Balanced Game",
    versus: "versus",
    kickoff: "Kickoff",
    homeSide: "Home",
    awaySide: "Away",
    contender: "Contender",
  },
  my: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "Win Probability Map",
    modelRead: "Model Read",
    strongestSignal: "Primary Signal",
    teamEdge: "Team Edge",
    balancedGame: "Balanced Game",
    versus: "versus",
    kickoff: "Kickoff",
    homeSide: "Home",
    awaySide: "Away",
    contender: "Contender",
  },
  km: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "Win Probability Map",
    modelRead: "Model Read",
    strongestSignal: "Primary Signal",
    teamEdge: "Team Edge",
    balancedGame: "Balanced Game",
    versus: "versus",
    kickoff: "Kickoff",
    homeSide: "Home",
    awaySide: "Away",
    contender: "Contender",
  },
  zh: {
    matchCenter: "AI Match Center",
    liveDesk: "Esport Analysis Desk",
    winMap: "Win Probability Map",
    modelRead: "Model Read",
    strongestSignal: "Primary Signal",
    teamEdge: "Team Edge",
    balancedGame: "Balanced Game",
    versus: "versus",
    kickoff: "Kickoff",
    homeSide: "Home",
    awaySide: "Away",
    contender: "Contender",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, matchId } = await params;
  const copy = getSeoCopy(locale);
  const canonical = getCanonicalUrl(locale, matchId);

  const fallback = {
    title: copy.fallbackTitle,
    alternates: buildAlternates(locale, matchId),
  };

  const context = await getDetailContext(matchId);
  if (!context) return fallback;

  const { fixture, insight } = context;
  const title = copy.title(fixture.home.name, fixture.away.name, fixture.league.name);
  const description = buildSeoDescription(locale, fixture, insight);
  const images = [
    fixture.home.logo
      ? {
          url: fixture.home.logo,
          width: 512,
          height: 512,
          alt: `${fixture.home.name} logo`,
        }
      : null,
    fixture.away.logo
      ? {
          url: fixture.away.logo,
          width: 512,
          height: 512,
          alt: `${fixture.away.name} logo`,
        }
      : null,
    {
      url: "/brand/scorematrix-logo.png",
      width: 512,
      height: 512,
      alt: `${SITE_NAME} AI Insight`,
    },
  ].filter(Boolean) as NonNullable<Metadata["openGraph"]>["images"];

  return {
    title,
    description,
    keywords: [
      ...copy.keywords,
      fixture.home.name,
      fixture.away.name,
      fixture.league.name,
      `${fixture.home.name} vs ${fixture.away.name}`,
    ],
    alternates: buildAlternates(locale, matchId),
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "article",
      publishedTime: insight.generatedAt,
      modifiedTime: insight.generatedAt,
      section: "AI Football Insight",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/scorematrix-logo.png"],
    },
  };
}

export default async function AIInsightDetailPage({ params }: Props) {
  const { locale, matchId } = await params;
  const copy = getAIInsightPageCopy(locale);
  const details = detailCopy[locale] ?? detailCopy.th;
  const ui = getUiCopy(locale);
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
  const structuredData = buildStructuredData(locale, matchId, fixture, insight);
  const matchEdge = getMatchEdge(fixture, insight, details, ui);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 pb-8 sm:px-4 md:px-6">
      <Link
        href={`/${locale}/ai-insight`}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-bold text-text-secondary transition-colors hover:border-primary/40 hover:text-primary"
      >
        <ArrowLeft size={16} />
        {details.back}
      </Link>

      <section className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#070b13] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-magenta to-warning" />
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,rgba(8,13,26,0.98),rgba(9,16,31,0.94)_45%,rgba(18,9,31,0.9))] p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" size="md" className="border-primary/30 bg-primary/10 text-primary">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  <Radio size={12} />
                  {ui.liveDesk}
                </span>
              </Badge>
              <Badge variant="gold" size="md" className="border-warning/25 bg-warning/10 text-warning">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={12} />
                  {copy.title}
                </span>
              </Badge>
            </div>
            {insight.upsetAlert ? (
              <Badge variant="gold" size="md" className="border-warning/20 bg-warning/10 text-warning">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                  <AlertTriangle size={12} />
                  {copy.labels.upsetAlert}
                </span>
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-gray-300">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {fixture.league.logo ? (
                <Image
                  src={fixture.league.logo}
                  alt={fixture.league.name}
                  width={24}
                  height={24}
                  className="h-6 w-6 rounded-lg border border-white/10 object-contain bg-white/5 p-0.5"
                />
              ) : null}
              <span className="font-black text-white">{fixture.league.name}</span>
              <span className="text-text-muted">{fixture.league.country}</span>
              {fixture.league.round ? <span className="text-text-muted">{fixture.league.round}</span> : null}
            </div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-200/80">
              {details.generatedAt}: {generatedAtLabel}
            </span>
          </div>

          <div className="mt-5 grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)_minmax(0,1fr)]">
            <TeamHero
              name={fixture.home.name}
              logo={fixture.home.logo}
              alignment="left"
              favorite={insight.favoriteTeam === "home"}
              favoriteLabel={details.favoriteTeam}
              sideLabel={ui.homeSide}
              contenderLabel={ui.contender}
            />
            <div className="flex flex-col items-center justify-center rounded-2xl border border-cyan-300/20 bg-black/35 px-4 py-5 text-center shadow-inner shadow-cyan-950/30">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200/80">{ui.matchCenter}</p>
              <div className="mt-2 font-mono text-4xl font-black tracking-[0.14em] text-white sm:text-5xl">
                {formatScore(fixture.score.home)}:{formatScore(fixture.score.away)}
              </div>
              <div className="mt-3 flex flex-col items-center justify-center gap-2 text-[10px] text-gray-400 sm:flex-row sm:flex-wrap sm:text-[11px]">
                <HeroStatusBadge fixture={fixture} copy={copy} details={details} />
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Clock3 size={12} className="text-cyan-300" />
                  {formatDateTime(fixture.kickoffTime, locale)}
                </span>
              </div>
              <div className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{ui.teamEdge}</p>
                <p className="mt-1 truncate text-sm font-black text-white">{matchEdge.label}</p>
              </div>
            </div>
            <TeamHero
              name={fixture.away.name}
              logo={fixture.away.logo}
              alignment="right"
              favorite={insight.favoriteTeam === "away"}
              favoriteLabel={details.favoriteTeam}
              sideLabel={ui.awaySide}
              contenderLabel={ui.contender}
            />
          </div>
        </div>

        <div className="grid gap-3 bg-[#090f1d] p-4 sm:p-5 lg:grid-cols-4">
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
      </section>

      {insight.upsetAlert && insight.upsetDescription ? (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold text-warning">{copy.labels.upsetAlert}</p>
            <p className="mt-1 text-text-secondary">
              {typeof insight.upsetRisk === "number" ? `${Math.round(insight.upsetRisk)}% • ` : ""}
              {insight.upsetDescription}
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <Card className="overflow-hidden border border-cyan-300/15 bg-[#08101d] p-0 shadow-xl shadow-cyan-950/20">
          <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.12),rgba(217,70,239,0.1),rgba(250,204,21,0.08))] px-5 py-4 sm:px-6">
            <SectionHeading
              icon={Crosshair}
              title={details.quickTake}
              description={ui.modelRead}
              accent="cyan"
            />
          </div>
          <div className="p-5 sm:p-6">
            <AIVerdictCard
              fixture={fixture}
              insight={insight}
              details={details}
              label={ui.strongestSignal}
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-200/80">{ui.winMap}</p>
                  <p className="mt-1 text-sm font-bold text-white">{details.probabilityBreakdown}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg border border-warning/20 bg-warning/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-warning">
                  <Trophy size={12} />
                  {matchEdge.label}
                </span>
              </div>
              <div className="space-y-4">
                <ProbabilityRow label={fixture.home.name} value={insight.homeWinProbability} color="cyan" />
                <ProbabilityRow label={copy.labels.draw} value={insight.drawProbability} color="purple" />
                <ProbabilityRow label={fixture.away.name} value={insight.awayWinProbability} color="magenta" />
              </div>
            </div>
          </div>
          {Math.abs((insight.homeWinProbability ?? 0) - (insight.drawProbability ?? 0)) < 5 ? (
            <p className="mx-5 mb-5 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200 sm:mx-6">
              {locale === "th"
                ? "โอกาสเจ้าบ้านชนะและเสมอใกล้กันมาก ควรอ่านสัญญาณอื่นประกอบ"
                : "Home win and draw probabilities are very close — consider both outcomes"}
            </p>
          ) : null}
          {insight.probabilitySource ? (
            <p className="mx-5 mb-5 text-xs text-gray-500 sm:mx-6">
              {details.probabilitySource}:{" "}
              <span className="text-gray-300">
                {formatProbabilitySource(insight.probabilitySource, details)}
              </span>
            </p>
          ) : null}
          <div className="grid gap-3 border-t border-white/10 bg-black/20 p-5 sm:grid-cols-2 sm:p-6">
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

      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-xs text-text-muted">
        {details.generatedAt}: {generatedAtLabel}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(structuredData),
        }}
      />
    </div>
  );
}

const getDetailContext = cache(async (matchId: string): Promise<DetailContext | null> => {
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
});

function getSeoCopy(locale: string) {
  return SEO_COPY[locale as keyof typeof SEO_COPY] ?? SEO_COPY.en;
}

function getUiCopy(locale: string) {
  return UI_COPY[locale as keyof typeof UI_COPY] ?? UI_COPY.en;
}

function getMatchEdge(
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail,
  details: LocalizedDetailCopy,
  ui: ReturnType<typeof getUiCopy>
) {
  const outcomes = [
    {
      label: fixture.home.name,
      value: insight.homeWinProbability,
    },
    {
      label: details.drawOption,
      value: insight.drawProbability,
    },
    {
      label: fixture.away.name,
      value: insight.awayWinProbability,
    },
  ].filter((item): item is { label: string; value: number } => typeof item.value === "number");

  if (outcomes.length === 0) {
    return { label: insight.apiWinner?.name || ui.balancedGame, value: null };
  }

  const [leader, challenger] = [...outcomes].sort((a, b) => b.value - a.value);
  if (!leader || (challenger && leader.value - challenger.value < 5)) {
    return { label: ui.balancedGame, value: leader?.value ?? null };
  }

  return { label: leader.label, value: leader.value };
}

function getCanonicalUrl(locale: string, matchId: string) {
  return `${SITE_URL}/${locale}/ai-insight/${matchId}`;
}

function buildAlternates(locale: string, matchId: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/ai-insight/${matchId}`])
  );

  return {
    canonical: getCanonicalUrl(locale, matchId),
    languages: {
      ...languages,
      "x-default": `${SITE_URL}/th/ai-insight/${matchId}`,
    },
  };
}

function buildSeoDescription(
  locale: string,
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail
) {
  const copy = getSeoCopy(locale);
  const metrics = [
    typeof insight.confidenceScore === "number"
      ? `${copy.confidence} ${Math.round(insight.confidenceScore)}%`
      : null,
    typeof insight.homeWinProbability === "number"
      ? `${copy.homeWin} ${Math.round(insight.homeWinProbability)}%`
      : null,
    typeof insight.drawProbability === "number"
      ? `${copy.draw} ${Math.round(insight.drawProbability)}%`
      : null,
    typeof insight.awayWinProbability === "number"
      ? `${copy.awayWin} ${Math.round(insight.awayWinProbability)}%`
      : null,
    insight.upsetAlert ? copy.upset : null,
  ].filter(Boolean);

  const kickoff = fixture.kickoffTime
    ? `Kickoff: ${formatDateTime(fixture.kickoffTime, locale)}.`
    : "";
  const advice = insight.apiAdvice ? ` ${insight.apiAdvice}` : "";
  const metricText = metrics.length > 0 ? ` พร้อมข้อมูล ${metrics.join(", ")}.` : ".";

  return `${copy.descriptionPrefix(
    fixture.home.name,
    fixture.away.name,
    fixture.league.name
  )}${metricText} ${kickoff}${advice}`.trim();
}

function buildStructuredData(
  locale: string,
  matchId: string,
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail
) {
  const url = getCanonicalUrl(locale, matchId);
  const title = getSeoCopy(locale).title(
    fixture.home.name,
    fixture.away.name,
    fixture.league.name
  );
  const description = buildSeoDescription(locale, fixture, insight);
  const eventId = `${url}#event`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: title,
        description,
        inLanguage: locale,
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: SITE_URL,
        },
        about: { "@id": eventId },
      },
      {
        "@type": "AnalysisNewsArticle",
        "@id": `${url}#analysis`,
        headline: title,
        description,
        datePublished: insight.generatedAt,
        dateModified: insight.generatedAt,
        mainEntityOfPage: { "@id": `${url}#webpage` },
        image: [
          fixture.home.logo,
          fixture.away.logo,
          `${SITE_URL}/brand/scorematrix-logo.png`,
        ].filter(Boolean),
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/brand/scorematrix-logo.png`,
          },
        },
        about: { "@id": eventId },
        keywords: [
          "AI football prediction",
          "football match analysis",
          fixture.home.name,
          fixture.away.name,
          fixture.league.name,
        ],
      },
      {
        "@type": "SportsEvent",
        "@id": eventId,
        name: `${fixture.home.name} vs ${fixture.away.name}`,
        description: `${fixture.home.name} vs ${fixture.away.name} in ${fixture.league.name}. ${buildInsightSummary(insight)}`,
        startDate: fixture.kickoffTime,
        eventStatus: getSchemaEventStatus(fixture.status),
        sport: "https://en.wikipedia.org/wiki/Association_football",
        location: {
          "@type": "Place",
          name: fixture.venue || "TBD",
        },
        organizer: {
          "@type": "SportsOrganization",
          name: fixture.league.name,
          logo: fixture.league.logo ?? undefined,
        },
        homeTeam: {
          "@type": "SportsTeam",
          name: fixture.home.name,
          logo: fixture.home.logo ?? undefined,
        },
        awayTeam: {
          "@type": "SportsTeam",
          name: fixture.away.name,
          logo: fixture.away.logo ?? undefined,
        },
        ...(hasCompleteScore(fixture)
          ? {
              result: {
                "@type": "Score",
                value: `${fixture.score.home}-${fixture.score.away}`,
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE_NAME,
            item: `${SITE_URL}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "AI Insight",
            item: `${SITE_URL}/${locale}/ai-insight`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${fixture.home.name} vs ${fixture.away.name}`,
            item: url,
          },
        ],
      },
    ],
  };
}

function buildInsightSummary(insight: ApiFootballAIInsightDetail) {
  return [
    typeof insight.confidenceScore === "number"
      ? `Confidence ${Math.round(insight.confidenceScore)}%.`
      : null,
    typeof insight.homeWinProbability === "number"
      ? `Home win ${Math.round(insight.homeWinProbability)}%.`
      : null,
    typeof insight.drawProbability === "number"
      ? `Draw ${Math.round(insight.drawProbability)}%.`
      : null,
    typeof insight.awayWinProbability === "number"
      ? `Away win ${Math.round(insight.awayWinProbability)}%.`
      : null,
    insight.upsetAlert ? "Upset alert available." : null,
  ]
    .filter(Boolean)
    .join(" ");
}

function getSchemaEventStatus(status: ApiFootballFixture["status"]) {
  if (status === "live") return "https://schema.org/EventInProgress";
  if (status === "finished") return "https://schema.org/EventCompleted";
  if (status === "postponed") return "https://schema.org/EventPostponed";
  if (status === "cancelled") return "https://schema.org/EventCancelled";
  return "https://schema.org/EventScheduled";
}

function hasCompleteScore(fixture: ApiFootballFixture) {
  return typeof fixture.score.home === "number" && typeof fixture.score.away === "number";
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
  sideLabel,
  contenderLabel,
}: {
  name: string;
  logo: string | null;
  alignment: "left" | "right";
  favorite?: boolean;
  favoriteLabel: string;
  sideLabel: string;
  contenderLabel: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[180px] flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4",
        alignment === "right" && "sm:flex-row-reverse sm:text-right"
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1",
          alignment === "left"
            ? "bg-gradient-to-r from-cyan-300 to-transparent"
            : "bg-gradient-to-l from-magenta to-transparent"
        )}
      />
      <div className={cn("flex items-center gap-3", alignment === "right" && "sm:flex-row-reverse")}>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-inner sm:h-20 sm:w-20">
          {logo ? (
            <Image
              src={logo}
              alt={name}
              width={80}
              height={80}
              className="h-full w-full object-contain"
            />
          ) : (
            <Shield size={30} className="text-gray-500" />
          )}
        </div>
        <div className={cn("min-w-0", alignment === "right" && "sm:text-right")}>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">
            {sideLabel}
          </p>
          <h1 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-white sm:text-2xl">
            {name}
          </h1>
        </div>
      </div>
      {favorite ? (
        <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg border border-warning/25 bg-warning/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-warning">
          <Trophy size={12} />
          {favoriteLabel}
        </span>
      ) : (
        <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-text-muted">
          <Swords size={12} />
          {contenderLabel}
        </span>
      )}
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
    green: "text-success border-success/20 bg-success/10 shadow-success/10",
    gold: "text-warning border-warning/20 bg-warning/10 shadow-warning/10",
    red: "text-danger border-danger/20 bg-danger/10 shadow-danger/10",
    blue: "text-primary border-primary/20 bg-primary/10 shadow-primary/10",
    magenta: "text-magenta border-magenta/20 bg-magenta/10 shadow-magenta/10",
  } as const;

  return (
    <div className="group rounded-xl border border-white/10 bg-black/25 p-4 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
        </div>
        <div className={cn("rounded-xl border p-2 shadow-lg", accent[tone])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-xs font-semibold leading-relaxed text-text-secondary">{note}</p>
    </div>
  );
}



function AIVerdictCard({
  fixture,
  insight,
  details,
  label,
}: {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  label: string;
}) {
  const verdict = getAIVerdict(fixture, insight, details);

  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),rgba(5,8,15,0.78))] p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-200">
          <Activity size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-200/80">{label}</p>
          <p className="mt-2 text-lg font-black leading-tight text-white">{verdict.title}</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-text-secondary">{verdict.detail}</p>
        </div>
      </div>
      {verdict.liveNote ? (
        <div className="mt-4 rounded-xl border border-border bg-bg/50 px-3 py-2 text-xs leading-relaxed text-text-secondary">
          <span className="mr-2 font-bold text-primary">{details.liveContext}</span>
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
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-black text-gray-100">{label}</span>
        <span className="font-mono text-sm font-black text-white">{formatPercent(value)}</span>
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
    <Card className="overflow-hidden border border-magenta/15 bg-[#0b0f1b] p-0 shadow-xl shadow-magenta/950/20">
      <div className="border-b border-white/10 bg-magenta/10 px-5 py-4 sm:px-6">
        <SectionHeading
          icon={BarChart3}
          title={copy.labels.keyFactors}
          description={copy.sections.matchInsights}
          accent="purple"
        />
      </div>
      <div className="space-y-3 p-5 sm:p-6">
        {factors.length === 0 ? (
          <EmptyState label={copy.empty.description} />
        ) : (
          factors.map((factor, index) => (
            <div
              key={factor}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-4 text-sm font-semibold leading-relaxed text-text-secondary"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 font-mono text-[10px] font-black text-primary">
                {index + 1}
              </span>
              <span>{factor}</span>
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
    ? "border-danger/20 bg-danger/10 text-danger"
    : finished
      ? "border-success/20 bg-success/10 text-success"
      : hold
        ? "border-warning/20 bg-warning/10 text-warning"
        : "border-primary/20 bg-primary/10 text-primary";

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider", className)}>
      {getStatusLabel(fixture, copy, details)}
    </span>
  );
}
