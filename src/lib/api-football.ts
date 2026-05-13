import { matches } from "@/data/matches";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import { MatchStatus } from "@/types/common";

const API_FOOTBALL_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL ?? "https://v3.football.api-sports.io";

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

export interface ApiFootballLeagueEntry {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string | null;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
  seasons: {
    year: number;
    start: string;
    end: string;
    current: boolean;
  }[];
}

export interface ApiFootballStandingLeague {
  id: number;
  name: string;
  country: string;
  logo: string | null;
  flag: string | null;
  season: number;
  standings: ApiFootballStanding[][];
}

export interface ApiFootballStanding {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string | null;
  status: string;
  description: string | null;
  all: ApiFootballStandingRecord;
}

export interface ApiFootballStandingRecord {
  played: number;
  win: number;
  draw: number;
  lose: number;
  goals: {
    for: number;
    against: number;
  };
}

export interface ApiFootballTeamProfile {
  team: {
    id: number;
    name: string;
    code: string | null;
    country: string;
    founded: number | null;
    national: boolean;
    logo: string | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    address: string | null;
    city: string | null;
    capacity: number | null;
    surface: string | null;
    image: string | null;
  };
}

export interface ApiFootballTeamSeasonStats {
  fixtures: {
    played: StatSplit;
    wins: StatSplit;
    draws: StatSplit;
    loses: StatSplit;
  };
  goals: {
    for: {
      total: StatSplit;
      average: Record<"home" | "away" | "total", string>;
    };
    against: {
      total: StatSplit;
      average: Record<"home" | "away" | "total", string>;
    };
  };
  clean_sheet: StatSplit;
  failed_to_score: StatSplit;
  form: string | null;
}

interface StatSplit {
  home: number;
  away: number;
  total: number;
}

export interface ApiFootballPlayerProfile {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number | null;
    birth: {
      date: string | null;
      place: string | null;
      country: string | null;
    };
    nationality: string | null;
    height: string | null;
    weight: string | null;
    injured: boolean;
    photo: string | null;
  };
  statistics: {
    team: {
      id: number;
      name: string;
      logo: string | null;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string | null;
      season: number;
    };
    games: {
      appearences: number | null;
      lineups: number | null;
      minutes: number | null;
      position: string | null;
      rating: string | null;
    };
    goals: {
      total: number | null;
      assists: number | null;
    };
    shots: {
      total: number | null;
      on: number | null;
    };
    passes: {
      total: number | null;
      key: number | null;
      accuracy: number | string | null;
    };
    tackles: {
      total: number | null;
      interceptions: number | null;
    };
    cards: {
      yellow: number | null;
      red: number | null;
    };
  }[];
}

export interface GetFixturesOptions {
  id?: string;
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

export interface ApiFootballEvent {
  time: {
    elapsed: number;
    extra: number | null;
  };
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  player: {
    id: number | null;
    name: string | null;
  };
  assist: {
    id: number | null;
    name: string | null;
  };
  type: string;
  detail: string;
  comments: string | null;
}

export interface ApiFootballLineup {
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  coach: {
    id: number | null;
    name: string | null;
    photo: string | null;
  };
  formation: string | null;
  startXI: ApiFootballLineupPlayer[];
  substitutes: ApiFootballLineupPlayer[];
}

export interface ApiFootballLineupPlayer {
  player: {
    id: number | null;
    name: string;
    number: number | null;
    pos: string | null;
    grid: string | null;
  };
}

export interface ApiFootballTeamStatistics {
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  statistics: {
    type: string;
    value: string | number | null;
  }[];
}

export interface ApiFootballPlayerStats {
  team: {
    id: number;
    name: string;
    logo: string | null;
  };
  players: {
    player: {
      id: number;
      name: string;
      photo: string | null;
    };
    statistics: {
      games: {
        minutes: number | null;
        number: number | null;
        position: string | null;
        rating: string | null;
        captain: boolean;
        substitute: boolean;
      };
      goals: {
        total: number | null;
        assists: number | null;
      };
      shots: {
        total: number | null;
        on: number | null;
      };
      passes: {
        total: number | null;
        key: number | null;
        accuracy: string | null;
      };
      tackles: {
        total: number | null;
      };
      cards: {
        yellow: number | null;
        red: number | null;
      };
    }[];
  }[];
}

export interface GetFixtureDetailsResult {
  source: ApiFootballSource;
  fetchedAt: string;
  fixture: ApiFootballFixture;
  events: ApiFootballEvent[];
  lineups: ApiFootballLineup[];
  statistics: ApiFootballTeamStatistics[];
  playerStats: ApiFootballPlayerStats[];
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

  const mappedFixtures = payload.response.map(mapFixture);
  const fixtures =
    typeof options.limit === "number"
      ? mappedFixtures.slice(0, options.limit)
      : mappedFixtures;

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

export async function getApiFootballFixtureDetails(
  fixtureId: number
): Promise<GetFixtureDetailsResult> {
  const [fixtureResult, events, lineups, statistics, playerStats] =
    await Promise.all([
      getApiFootballFixtures({ id: String(fixtureId), limit: 1 }),
      fetchApiFootballList<ApiFootballEvent>("/fixtures/events", {
        fixture: String(fixtureId),
      }),
      fetchApiFootballList<ApiFootballLineup>("/fixtures/lineups", {
        fixture: String(fixtureId),
      }),
      fetchApiFootballList<ApiFootballTeamStatistics>("/fixtures/statistics", {
        fixture: String(fixtureId),
      }),
      fetchApiFootballList<ApiFootballPlayerStats>("/fixtures/players", {
        fixture: String(fixtureId),
      }),
    ]);

  const fixture = fixtureResult.fixtures[0];

  if (!fixture) {
    throw new ApiFootballError("Fixture not found", 404);
  }

  return {
    source: "api-football",
    fetchedAt: new Date().toISOString(),
    fixture,
    events,
    lineups,
    statistics,
    playerStats,
  };
}

export async function getApiFootballLeagues(options: {
  id?: number;
  current?: boolean;
  search?: string;
} = {}) {
  const query: Record<string, string> = {};
  if (options.id) query.id = String(options.id);
  if (options.current) query.current = "true";
  if (options.search) query.search = options.search;

  return fetchApiFootballList<ApiFootballLeagueEntry>("/leagues", query);
}

export async function getApiFootballStandings(league: number, season: number) {
  const result = await fetchApiFootballList<{ league: ApiFootballStandingLeague }>(
    "/standings",
    {
      league: String(league),
      season: String(season),
    }
  );

  return result[0]?.league ?? null;
}

export async function getApiFootballLeagueSchedule(
  league: number,
  season: number,
  limit = 80
) {
  const result = await getApiFootballFixtures({
    league: String(league),
    season: String(season),
  });

  return result.fixtures.slice(0, limit);
}

export async function getApiFootballTeamProfile(
  team: number,
  league?: number,
  season?: number
) {
  const [profiles, stats] = await Promise.all([
    fetchApiFootballList<ApiFootballTeamProfile>("/teams", { id: String(team) }),
    league && season
      ? fetchApiFootballData<ApiFootballTeamSeasonStats>("/teams/statistics", {
          team: String(team),
          league: String(league),
          season: String(season),
        })
      : Promise.resolve(null),
  ]);

  return {
    profile: profiles[0] ?? null,
    stats,
  };
}

export async function getApiFootballPlayerProfile(player: number, season: number) {
  const profiles = await fetchApiFootballList<ApiFootballPlayerProfile>("/players", {
    id: String(player),
    season: String(season),
  });

  return profiles[0] ?? null;
}

export async function getApiFootballH2H(
  homeTeam: number,
  awayTeam: number,
  limit = 10
) {
  const result = await fetchApiFootballList<ApiFootballFixtureResponse>(
    "/fixtures/headtohead",
    {
      h2h: `${homeTeam}-${awayTeam}`,
    }
  );

  return result.map(mapFixture).slice(0, limit);
}

export function getMockApiFootballFixtures(limit?: number): ApiFootballFixture[] {
  const mockMatches =
    typeof limit === "number" ? matches.slice(0, limit) : matches;

  return mockMatches.map((match) => {
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

  const query: Record<string, string> = {};

  if (options.id) {
    query.id = options.id;
  } else if (!options.league || !options.season) {
    query.date = options.date ?? new Date().toISOString().slice(0, 10);
  }

  if (options.league) query.league = options.league;
  if (options.season) query.season = options.season;

  return query;
}

async function fetchApiFootballList<T>(
  pathname: string,
  query: Record<string, string>
): Promise<T[]> {
  return fetchApiFootballData<T[]>(pathname, query);
}

async function fetchApiFootballData<T>(
  pathname: string,
  query: Record<string, string>
): Promise<T> {
  const apiKey = process.env.API_FOOTBALL_KEY;

  if (!apiKey) {
    throw new ApiFootballError("Missing API_FOOTBALL_KEY", 500);
  }

  const url = new URL(pathname, API_FOOTBALL_BASE_URL);
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

  const payload = (await response.json()) as Omit<ApiFootballResponse<unknown>, "response"> & {
    response: T;
  };

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

  return payload.response;
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
