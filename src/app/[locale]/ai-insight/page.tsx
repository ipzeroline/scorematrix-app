import {
  ApiFootballError,
  getApiFootballAIInsights,
  type ApiFootballAIInsight,
  type ApiFootballAIInsightGroup,
  type GetAIInsightsResult,
} from "@/lib/api-football";
import { MatchStatus } from "@/types/common";
import { AIInsightListClient, type AIInsightListItem } from "./AIInsightListClient";

type Props = {
  params: Promise<{ locale: string }>;
};

const GROUPS: ApiFootballAIInsightGroup[] = [
  "live",
  "highConfidence",
  "upsetAlert",
];

export default async function AIInsightPage({ params }: Props) {
  const { locale } = await params;
  const { response, failed } = await loadAIInsights();
  const insights = mapAIInsights(response)
    .sort((a, b) => sortInsights(a, b));

  return (
    <AIInsightListClient
      locale={locale}
      insights={insights}
      source={failed ? "error" : insights.length > 0 ? "api" : "empty"}
    />
  );
}

async function loadAIInsights(): Promise<{
  response: GetAIInsightsResult;
  failed: boolean;
}> {
  try {
    return { response: await getApiFootballAIInsights(), failed: false };
  } catch (error) {
    if (error instanceof ApiFootballError) {
      return {
        response: { live: [], highConfidence: [], upsetAlert: [] },
        failed: true,
      };
    }
    throw error;
  }
}

function mapAIInsights(response: GetAIInsightsResult) {
  const insights = new Map<number, AIInsightListItem>();

  GROUPS.forEach((group) => {
    response[group].forEach((insight) => {
      const existing = insights.get(insight.provider_id);
      if (existing) {
        if (!existing.categories.includes(group)) existing.categories.push(group);
        return;
      }
      insights.set(insight.provider_id, mapAIInsight(insight, group));
    });
  });

  return [...insights.values()];
}

function mapAIInsight(
  insight: ApiFootballAIInsight,
  group: ApiFootballAIInsightGroup
): AIInsightListItem {
  const probabilities = [
    insight.homeWinProbability,
    insight.drawProbability,
    insight.awayWinProbability,
  ].filter((value) => typeof value === "number").length;

  return {
    id: `api-insight-${insight.provider_id}`,
    categories: [group],
    matchId: String(insight.provider_id),
    status: mapStatus(insight),
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
