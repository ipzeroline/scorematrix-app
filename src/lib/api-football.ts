import { matches } from "@/data/matches";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import { MatchStatus } from "@/types/common";

const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";

export type ApiFootballSource = "api-football" | "mock";

export interface ApiFootballFixture {
  id: string;
  apiFixtureId: number | null;
  league: {
    id: string;
    apiLeagueId: number | null;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number | null;
    round: string;
  };
  home: {
    id: string;
    apiTeamId: number | null;
    name: string;
    logo: string | null;
    winner: boolean | null;
  };
  away: {
    id: string;
    apiTeamId: number | null;
    name: string;
    logo: string | null;
    winner: boolean | null;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  status: MatchStatus;
  statusShort: string;
  elapsed: number | null;
  kickoffTime: string;
  venue: string;
}

interface ApiFootballResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: string[] | Record<string, string>;
  results: number;
  paging: {
    current: number;
    total: number;
  };
  response: T[];
}

interface ApiFootballFixtureResponse {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string;
      elapsed: number | null;
    };
    venue: {
      name: string | null;
      city: string | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag: string | null;
    season: number;
    round: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string | null;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string | null;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}

export interface GetFixturesOptions {
  date?: string;
  live?: boolean;
  league?: string;
  season?: string;
  limit?: number;
}

export interface GetFixturesResult {
  source: ApiFootballSource;
  fetchedAt: string;
  query: Record<string, string>;
  count: number;
  fixtures: ApiFootballFixture[];
  rateLimit: {
    requestsRemaining: string | null;
    requestsLimit: string | null;
  };
}

export class ApiFootballError extends Error {
  constructor(
    message: string,
    public status = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiFootballError";
  }
}

export async function getApiFootballFixtures(
  options: GetFixturesOptions = {}
): Promise<GetFixturesResult> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new ApiFootballError("Missing API_FOOTBALL_KEY", 500);
  }

  const query = buildFixtureQuery(options);
  const url = new URL("/fixtures", API_FOOTBALL_BASE_URL);
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      "x-apisports-key": apiKey,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  const payload = (await response.json()) as ApiFootballResponse<ApiFootballFixtureResponse>;

  if (!response.ok) {
    throw new ApiFootballError(
      "API-Football request failed",
      response.status,
      payload.errors
    );
  }

  if (hasApiErrors(payload.errors)) {
    throw new ApiFootballError("API-Football returned errors", 502, payload.errors);
  }

  const fixtures = payload.response
    .map(mapFixture)
    .slice(0, options.limit ?? 30);

  return {
    source: "api-football",
    fetchedAt: new Date().toISOString(),
    query,
    count: fixtures.length,
    fixtures,
    rateLimit: {
      requestsRemaining: response.headers.get("x-ratelimit-requests-remaining"),
      requestsLimit: response.headers.get("x-ratelimit-requests-limit"),
    },
  };
}

export function getMockApiFootballFixtures(limit = 30): ApiFootballFixture[] {
  return matches.slice(0, limit).map((match) => {
    const league = leagues.find((item) => item.id === match.leagueId);
    const home = teams.find((item) => item.id === match.homeTeamId);
    const away = teams.find((item) => item.id === match.awayTeamId);

    return {
      id: match.id,
      apiFixtureId: null,
      league: {
        id: league?.id ?? match.leagueId,
        apiLeagueId: null,
        name: league?.name ?? "Demo League",
        country: league?.country ?? "Demo",
        logo: league?.logo ?? null,
        flag: null,
        season: null,
        round: match.round,
      },
      home: {
        id: home?.id ?? match.homeTeamId,
        apiTeamId: null,
        name: home?.name ?? "Home Team",
        logo: home?.crest ?? null,
        winner: winnerFor(match.homeScore, match.awayScore),
      },
      away: {
        id: away?.id ?? match.awayTeamId,
        apiTeamId: null,
        name: away?.name ?? "Away Team",
        logo: away?.crest ?? null,
        winner: winnerFor(match.awayScore, match.homeScore),
      },
      score: {
        home: match.homeScore,
        away: match.awayScore,
      },
      status: match.status,
      statusShort: statusShortFor(match.status),
      elapsed: match.minute,
      kickoffTime: match.kickoffTime,
      venue: match.venue,
    };
  });
}

function buildFixtureQuery(options: GetFixturesOptions): Record<string, string> {
  if (options.live) {
    return { live: "all" };
  }

  const query: Record<string, string> = {
    date: options.date ?? new Date().toISOString().slice(0, 10),
  };

  if (options.league) query.league = options.league;
  if (options.season) query.season = options.season;

  return query;
}

function mapFixture(item: ApiFootballFixtureResponse): ApiFootballFixture {
  return {
    id: `api-football-${item.fixture.id}`,
    apiFixtureId: item.fixture.id,
    league: {
      id: `api-league-${item.league.id}`,
      apiLeagueId: item.league.id,
      name: item.league.name,
      country: item.league.country,
      logo: item.league.logo,
      flag: item.league.flag,
      season: item.league.season,
      round: item.league.round,
    },
    home: {
      id: `api-team-${item.teams.home.id}`,
      apiTeamId: item.teams.home.id,
      name: item.teams.home.name,
      logo: item.teams.home.logo,
      winner: item.teams.home.winner,
    },
    away: {
      id: `api-team-${item.teams.away.id}`,
      apiTeamId: item.teams.away.id,
      name: item.teams.away.name,
      logo: item.teams.away.logo,
      winner: item.teams.away.winner,
    },
    score: {
      home: item.goals.home,
      away: item.goals.away,
    },
    status: mapStatus(item.fixture.status.short),
    statusShort: item.fixture.status.short,
    elapsed: item.fixture.status.elapsed,
    kickoffTime: item.fixture.date,
    venue: [item.fixture.venue.name, item.fixture.venue.city]
      .filter(Boolean)
      .join(", "),
  };
}

function mapStatus(statusShort: string): MatchStatus {
  if (["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"].includes(statusShort)) {
    return MatchStatus.LIVE;
  }

  if (["FT", "AET", "PEN"].includes(statusShort)) {
    return MatchStatus.FINISHED;
  }

  if (["PST"].includes(statusShort)) {
    return MatchStatus.POSTPONED;
  }

  if (["CANC", "ABD", "AWD", "WO"].includes(statusShort)) {
    return MatchStatus.CANCELLED;
  }

  return MatchStatus.UPCOMING;
}

function hasApiErrors(errors: ApiFootballResponse<unknown>["errors"]): boolean {
  if (Array.isArray(errors)) return errors.length > 0;
  return Object.keys(errors).length > 0;
}

function winnerFor(score: number | null, otherScore: number | null): boolean | null {
  if (score === null || otherScore === null || score === otherScore) return null;
  return score > otherScore;
}

function statusShortFor(status: MatchStatus): string {
  const statusMap = {
    [MatchStatus.LIVE]: "LIVE",
    [MatchStatus.UPCOMING]: "NS",
    [MatchStatus.FINISHED]: "FT",
    [MatchStatus.POSTPONED]: "PST",
    [MatchStatus.CANCELLED]: "CANC",
  };

  return statusMap[status];
}
