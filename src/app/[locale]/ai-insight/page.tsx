import {
  ApiFootballError,
  getApiFootballFixtureDetails,
  getApiFootballFixtures,
  getApiFootballH2H,
  type ApiFootballFixture,
  type ApiFootballTeamStatistics,
  type GetFixtureDetailsResult,
} from "@/lib/api-football";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import { MatchStatus } from "@/types/common";
import { AIInsightListClient, type AIInsightListItem } from "./AIInsightListClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AIInsightPage({ params }: Props) {
  const { locale } = await params;
  const fixtures = await loadApiFixtures();
  const fetchedAt = new Date().toISOString();
  const insights = await Promise.all(
    fixtures.map((fixture) => buildInsightItem(fixture, fetchedAt))
  );

  return (
    <AIInsightListClient
      locale={locale}
      insights={insights}
      source={fixtures.length > 0 ? "api" : "empty"}
    />
  );
}

async function loadApiFixtures() {
  try {
    const live = await getApiFootballFixtures({ live: true, limit: 24 });
    const fixtures = live.fixtures.filter(isAnalyzableFixture);

    for (let offset = 0; fixtures.length < 24 && offset < 7; offset += 1) {
      const date = dateFromToday(offset);
      const byDate = await getApiFootballFixtures({ date, limit: 24 });
      fixtures.push(...byDate.fixtures.filter(isAnalyzableFixture));
    }

    return dedupeFixtures(fixtures).slice(0, 24);
  } catch (error) {
    if (error instanceof ApiFootballError) return [];
    throw error;
  }
}

function isAnalyzableFixture(fixture: ApiFootballFixture) {
  return fixture.status === MatchStatus.LIVE || fixture.status === MatchStatus.UPCOMING;
}

function dedupeFixtures(fixtures: ApiFootballFixture[]) {
  const seen = new Set<string>();
  return fixtures.filter((fixture) => {
    const key = fixture.apiFixtureId ? String(fixture.apiFixtureId) : fixture.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dateFromToday(offset: number) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

async function buildInsightItem(fixture: ApiFootballFixture, fetchedAt: string): Promise<AIInsightListItem> {
  const details = await loadFixtureDetails(fixture);
  const detailFixture = details?.fixture ?? fixture;
  const h2h = await loadH2H(detailFixture);
  const probabilities = probabilityFromApiStatistics(detailFixture, details?.statistics ?? []);
  const heatMeter = heatFromApiData(detailFixture, details);
  const confidenceScore =
    probabilities && details?.statistics.length
      ? Math.min(95, Math.max(50, Math.abs(probabilities.home - probabilities.away) + 55))
      : null;
  const homeLastFive = resultSequenceFromH2H(h2h, detailFixture.home.name);
  const awayLastFive = resultSequenceFromH2H(h2h, detailFixture.away.name);

  return {
    id: `api-insight-${detailFixture.apiFixtureId ?? detailFixture.id}`,
    matchId: buildFixtureSeoSlug(detailFixture),
    status: detailFixture.status,
    league: {
      id: detailFixture.league.id,
      name: detailFixture.league.name,
      logo: detailFixture.league.logo,
      round: detailFixture.league.round,
    },
    homeTeam: {
      id: detailFixture.home.id,
      name: detailFixture.home.name,
      shortName: shortName(detailFixture.home.name),
      logo: detailFixture.home.logo,
    },
    awayTeam: {
      id: detailFixture.away.id,
      name: detailFixture.away.name,
      shortName: shortName(detailFixture.away.name),
      logo: detailFixture.away.logo,
    },
    score: detailFixture.score,
    kickoffTime: detailFixture.kickoffTime,
    confidenceScore,
    heatMeter,
    homeWinProbability: probabilities?.home ?? null,
    drawProbability: probabilities?.draw ?? null,
    awayWinProbability: probabilities?.away ?? null,
    formComparison: {
      homeLastFive,
      awayLastFive,
    },
    keyFactors: [
      `${detailFixture.league.name} - ${detailFixture.league.round}`,
      details
        ? `${details.events.length} events, ${details.statistics.length} team statistic groups, ${details.lineups.length} lineups`
        : "Fixture detail endpoint has no extra data yet",
      `${h2h.length} real H2H fixtures from API`,
    ].filter(Boolean),
    apiSummary: {
      events: details?.events.length ?? 0,
      statistics: details?.statistics.reduce((total, team) => total + team.statistics.length, 0) ?? 0,
      lineups: details?.lineups.length ?? 0,
      playerStats: details?.playerStats.reduce((total, team) => total + team.players.length, 0) ?? 0,
      h2h: h2h.length,
    },
    upsetAlert: probabilities ? Math.abs(probabilities.home - probabilities.away) <= 8 : false,
    generatedAt: fetchedAt,
  };
}

async function loadFixtureDetails(fixture: ApiFootballFixture) {
  if (!fixture.apiFixtureId) return null;
  try {
    return await getApiFootballFixtureDetails(fixture.apiFixtureId);
  } catch (error) {
    if (error instanceof ApiFootballError) return null;
    throw error;
  }
}

async function loadH2H(fixture: ApiFootballFixture) {
  if (!fixture.home.apiTeamId || !fixture.away.apiTeamId) return [];
  try {
    return await getApiFootballH2H(fixture.home.apiTeamId, fixture.away.apiTeamId, 5);
  } catch (error) {
    if (error instanceof ApiFootballError) return [];
    throw error;
  }
}

function probabilityFromApiStatistics(
  fixture: ApiFootballFixture,
  statistics: ApiFootballTeamStatistics[]
) {
  const home = statistics.find((item) => item.team.id === fixture.home.apiTeamId) ?? statistics[0];
  const away = statistics.find((item) => item.team.id === fixture.away.apiTeamId) ?? statistics[1];
  if (!home || !away) return null;

  const homeSignal = teamSignal(home);
  const awaySignal = teamSignal(away);
  if (homeSignal + awaySignal === 0) return null;

  const rawHome = Math.round((homeSignal / (homeSignal + awaySignal)) * 80);
  const rawAway = Math.round((awaySignal / (homeSignal + awaySignal)) * 80);
  return normalizeProbabilities(rawHome, 20, rawAway);
}

function teamSignal(stats: ApiFootballTeamStatistics) {
  return (
    statNumber(stats, "Shots on Goal") * 3 +
    statNumber(stats, "Total Shots") * 1.5 +
    statNumber(stats, "Ball Possession") * 0.35 +
    statNumber(stats, "Corner Kicks") * 1.2
  );
}

function normalizeProbabilities(home: number, draw: number, away: number) {
  const total = home + draw + away;
  const normalizedHome = Math.round((home / total) * 100);
  const normalizedAway = Math.round((away / total) * 100);
  return {
    home: normalizedHome,
    draw: Math.max(0, 100 - normalizedHome - normalizedAway),
    away: normalizedAway,
  };
}

function heatFromApiData(fixture: ApiFootballFixture, details: GetFixtureDetailsResult | null) {
  if (!details) return null;
  const totalShots = details.statistics.reduce(
    (total, team) => total + statNumber(team, "Total Shots"),
    0
  );
  const goals = (fixture.score.home ?? 0) + (fixture.score.away ?? 0);
  const heat = details.events.length * 0.35 + totalShots * 0.12 + goals * 1.4;
  return Math.min(10, Math.max(1, Math.round(heat * 10) / 10));
}

function statNumber(stats: ApiFootballTeamStatistics | undefined, type: string) {
  const value = stats?.statistics.find((item) => item.type === type)?.value;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number.parseFloat(value.replace("%", "")) || 0;
  return 0;
}

function resultSequenceFromH2H(fixtures: ApiFootballFixture[], teamName: string): Array<"W" | "D" | "L"> {
  const sequence = fixtures.slice(0, 5).map((fixture): "W" | "D" | "L" => {
    if (fixture.score.home === null || fixture.score.away === null) return "D";
    const isHome = fixture.home.name === teamName;
    const own = isHome ? fixture.score.home : fixture.score.away;
    const other = isHome ? fixture.score.away : fixture.score.home;
    if (own > other) return "W";
    if (own < other) return "L";
    return "D";
  });

  if (sequence.length === 0) {
    return ["D", "D", "D", "D", "D"];
  }

  return [...sequence, "D", "D", "D", "D", "D"].slice(0, 5) as Array<"W" | "D" | "L">;
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
