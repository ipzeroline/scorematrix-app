import {
  type ApiFootballFixture,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  getApiFootballAIInsightDetail,
  getApiFootballFixtureDetails,
  getApiFootballH2H,
} from "@/lib/api-football";
import { leagues } from "@/data/leagues";
import { matches } from "@/data/matches";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { formatMatchDateTimeWithZone } from "@/lib/utils";
import type { PredictMatch, PredictPlayer } from "@/components/predict/PredictMatchForm";

export type PredictMatchRouteContext = {
  match: PredictMatch;
  matchSegment: string;
  homeTeamId: string | number;
  awayTeamId: string | number;
};

export async function loadPredictMatchRouteContext(
  matchId: string
): Promise<PredictMatchRouteContext | null> {
  const apiFixtureId = extractApiFixtureId(matchId);

  if (apiFixtureId) {
    const details = await getApiFootballFixtureDetails(apiFixtureId);
    const context = buildApiPredictMatchContext(details);
    const [h2h, hasAiInsight] = await Promise.all([
      loadApiH2HFixtures(context.homeTeamId, context.awayTeamId),
      loadApiAIInsightAvailability(apiFixtureId),
    ]);
    context.match.h2h = h2h;
    context.match.hasAiInsight = hasAiInsight;
    return context;
  }

  return buildLocalPredictMatchContext(matchId);
}

async function loadApiH2HFixtures(
  homeTeamId: string | number,
  awayTeamId: string | number
) {
  const home = numericId(homeTeamId);
  const away = numericId(awayTeamId);

  if (!home || !away) return [];

  try {
    return await getApiFootballH2H(home, away, 5);
  } catch {
    return [];
  }
}

async function loadApiAIInsightAvailability(fixtureId: number) {
  try {
    await getApiFootballAIInsightDetail(fixtureId);
    return true;
  } catch {
    return false;
  }
}

function numericId(value: string | number) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function buildApiPredictMatchContext(
  details: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>
): PredictMatchRouteContext {
  const { fixture, lineups, playerStats } = details;
  const homeTeamId = fixture.home.apiTeamId ?? fixture.home.id;
  const awayTeamId = fixture.away.apiTeamId ?? fixture.away.id;

  return {
    match: buildPredictMatchFromApiFixture(fixture, lineups, playerStats),
    matchSegment: String(fixture.apiFixtureId ?? fixture.id),
    homeTeamId,
    awayTeamId,
  };
}

function buildPredictMatchFromApiFixture(
  fixture: ApiFootballFixture,
  lineups: ApiFootballLineup[],
  playerStats: ApiFootballPlayerStats[]
): PredictMatch {
  const homeLineup = findTeamLineup(lineups, fixture.home.apiTeamId, 0);
  const awayLineup = findTeamLineup(lineups, fixture.away.apiTeamId, 1);
  const homeStats = findTeamPlayerStats(playerStats, fixture.home.apiTeamId, 0);
  const awayStats = findTeamPlayerStats(playerStats, fixture.away.apiTeamId, 1);

  return {
    home: {
      id: fixture.home.apiTeamId ?? fixture.home.id ?? null,
      name: fixture.home.name,
      logo: fixture.home.logo,
      players: buildPredictPlayers(homeLineup, homeStats),
      colors: homeLineup?.team.colors?.player ?? null,
    },
    away: {
      id: fixture.away.apiTeamId ?? fixture.away.id ?? null,
      name: fixture.away.name,
      logo: fixture.away.logo,
      players: buildPredictPlayers(awayLineup, awayStats),
      colors: awayLineup?.team.colors?.player ?? null,
    },
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    round: fixture.league.round,
    time: formatMatchDateTimeWithZone(fixture.kickoffTime),
    kickoffTime: fixture.kickoffTime,
    venue: fixture.venue,
    matchId: String(fixture.apiFixtureId ?? fixture.id),
  };
}

function buildLocalPredictMatchContext(matchId: string): PredictMatchRouteContext | null {
  const fixture = matches.find((match) => match.id === matchId);

  if (!fixture) {
    return null;
  }

  const league = leagues.find((item) => item.id === fixture.leagueId);
  const home = teams.find((team) => team.id === fixture.homeTeamId);
  const away = teams.find((team) => team.id === fixture.awayTeamId);

  if (!home || !away) {
    return null;
  }

  return {
    match: {
      matchId: fixture.id,
      home: {
        id: home.id,
        name: home.name,
        logo: home.crest,
        players: buildLocalPredictPlayers(home.id),
      },
      away: {
        id: away.id,
        name: away.name,
        logo: away.crest,
        players: buildLocalPredictPlayers(away.id),
      },
      league: league?.name ?? "Demo League",
      leagueLogo: league?.logo ?? null,
      round: fixture.round,
      time: formatMatchDateTimeWithZone(fixture.kickoffTime),
      kickoffTime: fixture.kickoffTime,
      venue: fixture.venue,
    },
    matchSegment: fixture.id,
    homeTeamId: fixture.homeTeamId,
    awayTeamId: fixture.awayTeamId,
  };
}

function findTeamLineup(
  lineups: ApiFootballLineup[],
  teamId: number | null,
  fallbackIndex: number
) {
  return lineups.find((lineup) => lineup.team.id === teamId) ?? lineups[fallbackIndex];
}

function findTeamPlayerStats(
  playerStats: ApiFootballPlayerStats[],
  teamId: number | null,
  fallbackIndex: number
) {
  return playerStats.find((stats) => stats.team.id === teamId) ?? playerStats[fallbackIndex];
}

function buildPredictPlayers(
  lineup?: ApiFootballLineup,
  playerStats?: ApiFootballPlayerStats
): PredictPlayer[] {
  const lineupPlayers =
    lineup?.startXI.concat(lineup.substitutes).map(({ player }) => ({
      id: player.id,
      name: player.name,
      number: player.number,
    })) ?? [];

  const statPlayers =
    playerStats?.players.map(({ player, statistics }) => ({
      id: player.id,
      name: player.name,
      number: statistics[0]?.games.number ?? null,
    })) ?? [];

  const merged = [...lineupPlayers, ...statPlayers];
  const seen = new Set<string>();

  return merged
    .filter((player) => {
      const key = String(player.id ?? player.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 22);
}

function buildLocalPredictPlayers(teamId: string): PredictPlayer[] {
  return players
    .filter((player) => player.teamId === teamId)
    .map((player) => ({
      id: parseLocalPlayerId(player.playerId),
      name: player.name,
      number: player.number,
    }));
}

function parseLocalPlayerId(playerId: string) {
  const value = Number.parseInt(playerId.replace(/\D/g, ""), 10);
  return Number.isNaN(value) ? null : value;
}
