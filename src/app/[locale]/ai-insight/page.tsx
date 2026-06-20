import type { Metadata } from "next";
import {
  ApiFootballError,
  getApiFootballAIInsights,
  type ApiFootballAIInsight,
  type ApiFootballAIInsightGroup,
  type ApiFootballPredictedScore,
  type GetAIInsightsResult,
} from "@/lib/api-football";
import { getAIInsightSeoContent } from "@/data/ai-insight-seo-content";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { MatchStatus } from "@/types/common";
import { AIInsightListClient, type AIInsightListItem } from "./AIInsightListClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    date?: string | string[];
    league?: string | string[];
    page?: string | string[];
    limit?: string | string[];
  }>;
};

type AIInsightQuery = {
  date?: string;
  league?: string;
  page: number;
  limit: number;
};

const GROUPS: ApiFootballAIInsightGroup[] = [
  "live",
  "highConfidence",
  "upsetAlert",
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getAIInsightSeoContent(locale);
  const pathname = `/${locale}/ai-insight`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/ai-insight`])
  );

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/ai-insight`,
      },
    },
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
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [
        {
          url: "/brand/scorematrix-logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} AI Insight`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: ["/brand/scorematrix-logo.png"],
    },
  };
}

export default async function AIInsightPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = normalizeAIInsightQuery(await searchParams);
  const seo = getAIInsightSeoContent(locale);
  const { response, failed } = await loadAIInsights(query);
  const insights = mapAIInsights(response)
    .sort((a, b) => sortInsights(a, b));
  const structuredData = buildAIInsightStructuredData(locale, seo, insights);

  return (
    <div className="space-y-8 pb-8">
      <AIInsightListClient
        locale={locale}
        insights={insights}
        source={failed ? "error" : insights.length > 0 ? "api" : "empty"}
        pagination={response.pagination ?? null}
        query={query}
      />

      <section className="mx-auto max-w-6xl rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix AI Insight
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
            {seo.pageTitle}
          </h2>
          <p className="mt-3 text-base font-semibold leading-7 text-gray-400">
            {seo.pageDescription}
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {seo.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <h3 className="text-base font-black leading-6 text-white">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-400">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </div>
  );
}

async function loadAIInsights(query: AIInsightQuery): Promise<{
  response: GetAIInsightsResult;
  failed: boolean;
}> {
  try {
    return { response: await getApiFootballAIInsights(query), failed: false };
  } catch (error) {
    if (error instanceof ApiFootballError) {
      return {
        response: {
          all: [],
          live: [],
          highConfidence: [],
          upsetAlert: [],
          pagination: {
            page: query.page,
            limit: query.limit,
            total: 0,
            totalPages: 1,
          },
        },
        failed: true,
      };
    }
    throw error;
  }
}

function mapAIInsights(response: GetAIInsightsResult) {
  const insights = new Map<number, AIInsightListItem>();

  if (Array.isArray(response.all) && response.all.length > 0) {
    response.all.forEach((insight) => {
      insights.set(insight.provider_id, mapAIInsight(insight));
    });
    return [...insights.values()];
  }

  GROUPS.forEach((group) => {
    response[group].forEach((insight) => {
      const existing = insights.get(insight.provider_id);
      if (existing) {
        if (!existing.categories.includes(group)) existing.categories.push(group);
        existing.predictedScore =
          existing.predictedScore ??
          insight.predictedScore ??
          normalizeLegacyPredictedScore(insight.apiPredictedGoals);
        existing.viewCount = Math.max(existing.viewCount, normalizeViewCount(insight));
        return;
      }
      insights.set(insight.provider_id, mapAIInsight(insight, group));
    });
  });

  return [...insights.values()];
}

function mapAIInsight(
  insight: ApiFootballAIInsight,
  group?: ApiFootballAIInsightGroup
): AIInsightListItem {
  const probabilities = [
    insight.homeWinProbability,
    insight.drawProbability,
    insight.awayWinProbability,
  ].filter((value) => typeof value === "number").length;

  return {
    id: `api-insight-${insight.provider_id}`,
    categories: group ? [group] : inferInsightCategories(insight),
    matchId: String(insight.provider_id),
    status: mapStatus(insight),
    statusShort: insight.status.short,
    viewCount: normalizeViewCount(insight),
    league: {
      id: String(insight.league.id),
      name: insight.league.name,
      logo: insight.league.logo,
      countryFlag: insight.league.country_flag,
    },
    homeTeam: {
      id: String(insight.teams.home.id),
      name: insight.teams.home.name,
      shortName: shortName(insight.teams.home.name),
      logo: insight.teams.home.logo,
    },
    awayTeam: {
      id: String(insight.teams.away.id),
      name: insight.teams.away.name,
      shortName: shortName(insight.teams.away.name),
      logo: insight.teams.away.logo,
    },
    score: {
      home: insight.goals.home,
      away: insight.goals.away,
    },
    kickoffTime: insight.starts_at,
    statusText: insight.status.long,
    elapsed: insight.status.elapsed,
    confidenceScore: insight.confidenceScore,
    heatMeter: insight.heatMeter,
    favoriteTeam: insight.favoriteTeam ?? null,
    homeStrength: insight.homeStrength ?? null,
    awayStrength: insight.awayStrength ?? null,
    strengthGap: insight.strengthGap ?? null,
    upsetRisk: insight.upsetRisk ?? null,
    homeWinProbability: insight.homeWinProbability,
    drawProbability: insight.drawProbability,
    awayWinProbability: insight.awayWinProbability,
    formComparison: {
      homeLastFive: [],
      awayLastFive: [],
    },
    keyFactors: insight.keyFactors,
    apiSummary: {
      probabilities,
      communityVotes: insight.communitySentiment?.totalVotes ?? 0,
      keyFactors: insight.keyFactors.length,
      advice: insight.apiAdvice ? 1 : 0,
      winner: insight.apiWinner ? 1 : 0,
    },
    apiAdvice: insight.apiAdvice,
    apiWinner: insight.apiWinner?.name ?? null,
    predictedScore:
      insight.predictedScore ?? normalizeLegacyPredictedScore(insight.apiPredictedGoals),
    upsetAlert: insight.upsetAlert,
    generatedAt: insight.generatedAt ?? insight.starts_at,
    standings: insight.standings
      ? {
          home: insight.standings.home
            ? {
                rank: insight.standings.home.rank,
                points: insight.standings.home.points,
                form: insight.standings.home.form,
              }
            : null,
          away: insight.standings.away
            ? {
                rank: insight.standings.away.rank,
                points: insight.standings.away.points,
                form: insight.standings.away.form,
              }
            : null,
        }
      : null,
    h2h: insight.h2hSummary
      ? {
          totalMatches: insight.h2hSummary.totalMatches,
          homeWins: insight.h2hSummary.homeWins,
          draws: insight.h2hSummary.draws,
          awayWins: insight.h2hSummary.awayWins,
          avgGoals: insight.h2hSummary.avgGoals,
        }
      : null,
  };
}

function inferInsightCategories(insight: ApiFootballAIInsight) {
  const categories: AIInsightListItem["categories"] = [];
  if (mapStatus(insight) === MatchStatus.LIVE) categories.push("live");
  if ((insight.confidenceScore ?? 0) >= 70) categories.push("highConfidence");
  if (insight.upsetAlert) categories.push("upsetAlert");
  return categories;
}

function normalizeAIInsightQuery(
  searchParams:
    | Awaited<Props["searchParams"]>
    | undefined
): AIInsightQuery {
  const date = firstSearchParam(searchParams?.date);
  const league = firstSearchParam(searchParams?.league);
  const page = clampInteger(firstSearchParam(searchParams?.page), 1, 9999, 1);
  const limit = clampInteger(firstSearchParam(searchParams?.limit), 1, 50, 20);

  return {
    ...(date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
    ...(league ? { league } : {}),
    page,
    limit,
  };
}

function firstSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function clampInteger(
  value: string | undefined,
  min: number,
  max: number,
  fallback: number
) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

function normalizeViewCount(insight: ApiFootballAIInsight) {
  return normalizeNumber(
    insight.viewCount ?? insight.view_count ?? insight.views ?? insight.visits
  );
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeLegacyPredictedScore(
  value: ApiFootballAIInsight["apiPredictedGoals"]
): ApiFootballPredictedScore | null {
  if (!value) return null;
  return {
    home: value.home,
    away: value.away,
    source: null,
    confidence: null,
    raw: null,
  };
}

function mapStatus(insight: ApiFootballAIInsight): MatchStatus {
  if (insight.is_live) return MatchStatus.LIVE;

  const status = insight.status.short.trim().toUpperCase();
  if (["LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"].includes(status)) {
    return MatchStatus.LIVE;
  }
  if (["FT", "AET", "PEN", "AWD", "WO"].includes(status)) {
    return MatchStatus.FINISHED;
  }
  if (status === "PST") return MatchStatus.POSTPONED;
  if (["CANC", "ABD"].includes(status)) return MatchStatus.CANCELLED;
  return MatchStatus.UPCOMING;
}

function shortName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function sortInsights(a: AIInsightListItem, b: AIInsightListItem) {
  const scoreA = getInsightPriorityScore(a);
  const scoreB = getInsightPriorityScore(b);

  if (scoreA !== scoreB) return scoreB - scoreA;
  return new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime();
}

function getInsightPriorityScore(insight: AIInsightListItem) {
  let score = 0;
  if (insight.categories.includes("live")) score += 300;
  if (insight.categories.includes("highConfidence")) score += 200;
  if (insight.categories.includes("upsetAlert")) score += 100;
  if (typeof insight.confidenceScore === "number") score += insight.confidenceScore;
  return score;
}

function buildAIInsightStructuredData(
  locale: string,
  seo: ReturnType<typeof getAIInsightSeoContent>,
  insights: AIInsightListItem[]
) {
  const url = `${SITE_URL}/${locale}/ai-insight`;
  const insightItems = insights.slice(0, 20).map((insight, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "AnalysisNewsArticle",
      headline: `${insight.homeTeam.name} vs ${insight.awayTeam.name} AI Insight`,
      description: buildInsightDescription(insight),
      datePublished: insight.generatedAt,
      dateModified: insight.generatedAt,
      mainEntityOfPage: `${url}/${insight.matchId}`,
      about: {
        "@type": "SportsEvent",
        name: `${insight.homeTeam.name} vs ${insight.awayTeam.name}`,
        startDate: insight.kickoffTime,
        eventStatus: getSchemaEventStatus(insight.status),
        sport: "Football",
        organizer: {
          "@type": "SportsOrganization",
          name: insight.league.name,
        },
        homeTeam: {
          "@type": "SportsTeam",
          name: insight.homeTeam.name,
        },
        awayTeam: {
          "@type": "SportsTeam",
          name: insight.awayTeam.name,
        },
      },
      author: {
        "@type": "Organization",
        name: SITE_NAME,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        "AI football predictions",
        "football match analysis",
        "football probability analysis",
        "soccer prediction insights",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
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
          item: url,
        },
      ],
    },
    ...(insightItems.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${url}#insights`,
            name: seo.pageTitle,
            itemListElement: insightItems,
          },
        ]
      : []),
  ];
}

function buildInsightDescription(insight: AIInsightListItem) {
  const parts = [
    typeof insight.confidenceScore === "number"
      ? `confidence ${insight.confidenceScore}%`
      : null,
    typeof insight.homeWinProbability === "number"
      ? `home ${insight.homeWinProbability}%`
      : null,
    typeof insight.drawProbability === "number"
      ? `draw ${insight.drawProbability}%`
      : null,
    typeof insight.awayWinProbability === "number"
      ? `away ${insight.awayWinProbability}%`
      : null,
    insight.upsetAlert ? "upset alert" : null,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(", ")
    : `AI football insight for ${insight.homeTeam.name} vs ${insight.awayTeam.name}`;
}

function getSchemaEventStatus(status: MatchStatus): string {
  if (status === MatchStatus.LIVE) return "https://schema.org/EventInProgress";
  if (status === MatchStatus.FINISHED) return "https://schema.org/EventCompleted";
  if (status === MatchStatus.POSTPONED) return "https://schema.org/EventPostponed";
  if (status === MatchStatus.CANCELLED) return "https://schema.org/EventCancelled";
  return "https://schema.org/EventScheduled";
}
