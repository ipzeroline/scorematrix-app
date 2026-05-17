import { matches } from "@/data/matches";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import { proxyFootballMediaValue } from "@/lib/football-media";
import { MatchStatus } from "@/types/common";

const API_FOOTBALL_BASE_URL =
  process.env.API_FOOTBALL_BASE_URL ?? "https://api.scorematrix.live/api/v1/soccer";

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

interface SoccerBackendResponse<T> {
  source?: ApiFootballSource;
  fetchedAt?: string;
  count?: number;
  query?: Record<string, string>;
  status?: string;
  rateLimit?: GetFixturesResult["rateLimit"];
  fixtures?: ApiFootballFixture[];
  fixture?: ApiFootballFixture;
  events?: ApiFootballEvent[];
  lineups?: ApiFootballLineup[];
  statistics?: ApiFootballTeamStatistics[];
  playerStats?: ApiFootballPlayerStats[];
  leagues?: SoccerBackendLeagueEntry[];
  league?: ApiFootballStandingLeague;
  profile?: T;
  stats?: ApiFootballTeamSeasonStats | null;
  h2h?: {
    fixtures?: ApiFootballFixture[];
  };
}

interface SoccerBackendLeagueEntry {
  id: string;
  apiLeagueId: number;
  name: string;
  type: string;
  logo: string | null;
  country: string;
  countryCode: string | null;
  countryFlag: string | null;
  seasons: ApiFootballLeagueEntry["seasons"];
  current?: boolean;
}

interface SoccerBackendTeamProfile {
  id: string;
  apiTeamId: number;
  name: string;
  code: string | null;
  country: string;
  founded: number | null;
  national: boolean;
  logo: string | null;
  venue: ApiFootballTeamProfile["venue"];
}

interface SoccerBackendPlayerProfile {
  id: string;
  apiPlayerId: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number | null;
  birth: ApiFootballPlayerProfile["player"]["birth"];
  nationality: string | null;
  height: string | null;
  weight: string | null;
  injured: boolean;
  photo: string | null;
  statistics: ApiFootballPlayerProfile["statistics"];
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
  revalidate?: number;
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
  const query = buildFixtureQuery(options);
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/fixtures",
    query,
    { revalidate: options.revalidate ?? (options.live ? 20 : 300) }
  );
  const mappedFixtures = payload.fixtures ?? [];
  const fixtures =
    typeof options.limit === "number"
      ? mappedFixtures.slice(0, options.limit)
      : mappedFixtures;

  return {
    source: payload.source ?? "api-football",
    fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
    query,
    count: fixtures.length,
    fixtures,
    rateLimit: payload.rateLimit ?? {
      requestsRemaining: null,
      requestsLimit: null,
    },
  };
}

export async function getApiFootballFixtureDetails(
  fixtureId: number
): Promise<GetFixtureDetailsResult> {
  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    `/fixtures/${fixtureId}`,
    {}
  );
  const fixture = payload.fixture;

  if (!fixture) {
    throw new ApiFootballError("Fixture not found", 404);
  }

  return {
    source: payload.source ?? "api-football",
    fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
    fixture,
    events: payload.events ?? [],
    lineups: payload.lineups ?? [],
    statistics: payload.statistics ?? [],
    playerStats: payload.playerStats ?? [],
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

  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/leagues",
    query
  );

  return (payload.leagues ?? []).map(mapBackendLeague);
}

export async function getApiFootballStandings(league: number, season: number) {
  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/standings",
    {
      league: String(league),
      season: String(season),
    }
  );

  return payload.league ?? null;
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
  const query: Record<string, string> = {};
  if (league) query.league = String(league);
  if (season) query.season = String(season);
  const payload = await fetchSoccerBackend<
    SoccerBackendResponse<SoccerBackendTeamProfile | ApiFootballTeamProfile>
  >(`/teams/${team}`, query);

  return {
    profile: payload.profile ? mapBackendTeamProfile(payload.profile) : null,
    stats: payload.stats ?? null,
  };
}

export async function getApiFootballPlayerProfile(player: number, season: number) {
  const payload = await fetchSoccerBackend<
    SoccerBackendResponse<SoccerBackendPlayerProfile | ApiFootballPlayerProfile>
  >(`/players/${player}`, {
    season: String(season),
  });

  return payload.profile ? mapBackendPlayerProfile(payload.profile) : null;
}

export async function getApiFootballH2H(
  homeTeam: number,
  awayTeam: number,
  limit = 10
) {
  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/h2h",
    {
      home: String(homeTeam),
      away: String(awayTeam),
      limit: String(limit),
    }
  );

  return (payload.h2h?.fixtures ?? []).slice(0, limit);
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

async function fetchSoccerBackend<T>(
  pathname: string,
  query: Record<string, string>,
  options: { revalidate?: number } = {}
): Promise<T> {
  const baseUrl = API_FOOTBALL_BASE_URL.endsWith("/")
    ? API_FOOTBALL_BASE_URL
    : `${API_FOOTBALL_BASE_URL}/`;
  const url = new URL(pathname.replace(/^\/+/, ""), baseUrl);
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    ...(typeof options.revalidate === "number"
      ? { next: { revalidate: options.revalidate } }
      : { cache: "no-store" as const }),
  });

  const payload = (await response.json()) as T & {
    error?: unknown;
    errors?: unknown;
    message?: string;
  };

  if (!response.ok) {
    throw new ApiFootballError(
      "ScoreMatrix Soccer API request failed",
      response.status,
      payload.errors ?? payload.error ?? payload.message
    );
  }

  if (hasBackendErrors(payload.errors)) {
    throw new ApiFootballError("ScoreMatrix Soccer API returned errors", 502, payload.errors);
  }

  return normalizeSoccerBackendValue(proxyFootballMediaValue(payload));
}

function normalizeSoccerBackendValue<T>(value: T): T {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeSoccerBackendValue) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        key === "status" && typeof nestedValue === "string"
          ? normalizeMatchStatus(nestedValue)
          : normalizeSoccerBackendValue(nestedValue),
      ])
    ) as T;
  }

  return value;
}

function normalizeMatchStatus(status: string): string {
  const normalized = status.trim().toUpperCase();

  const statusMap: Record<string, MatchStatus> = {
    LIVE: MatchStatus.LIVE,
    "1H": MatchStatus.LIVE,
    HT: MatchStatus.LIVE,
    "2H": MatchStatus.LIVE,
    ET: MatchStatus.LIVE,
    BT: MatchStatus.LIVE,
    P: MatchStatus.LIVE,
    SUSP: MatchStatus.LIVE,
    INT: MatchStatus.LIVE,
    NS: MatchStatus.UPCOMING,
    TBD: MatchStatus.UPCOMING,
    UPCOMING: MatchStatus.UPCOMING,
    FT: MatchStatus.FINISHED,
    AET: MatchStatus.FINISHED,
    PEN: MatchStatus.FINISHED,
    FINISHED: MatchStatus.FINISHED,
    PST: MatchStatus.POSTPONED,
    POSTPONED: MatchStatus.POSTPONED,
    CANC: MatchStatus.CANCELLED,
    CANCELLED: MatchStatus.CANCELLED,
    ABD: MatchStatus.CANCELLED,
    AWD: MatchStatus.FINISHED,
    WO: MatchStatus.FINISHED,
  };

  return statusMap[normalized] ?? status;
}

function mapBackendLeague(item: SoccerBackendLeagueEntry): ApiFootballLeagueEntry {
  return {
    league: {
      id: item.apiLeagueId,
      name: item.name,
      type: item.type,
      logo: item.logo,
    },
    country: {
      name: item.country,
      code: item.countryCode,
      flag: item.countryFlag,
    },
    seasons: item.seasons,
  };
}

function mapBackendTeamProfile(
  profile: SoccerBackendTeamProfile | ApiFootballTeamProfile
): ApiFootballTeamProfile {
  if ("team" in profile) return profile;

  return {
    team: {
      id: profile.apiTeamId,
      name: profile.name,
      code: profile.code,
      country: profile.country,
      founded: profile.founded,
      national: profile.national,
      logo: profile.logo,
    },
    venue: profile.venue,
  };
}

function mapBackendPlayerProfile(
  profile: SoccerBackendPlayerProfile | ApiFootballPlayerProfile
): ApiFootballPlayerProfile {
  if ("player" in profile) return profile;

  return {
    player: {
      id: profile.apiPlayerId,
      name: profile.name,
      firstname: profile.firstname,
      lastname: profile.lastname,
      age: profile.age,
      birth: profile.birth,
      nationality: profile.nationality,
      height: profile.height,
      weight: profile.weight,
      injured: profile.injured,
      photo: profile.photo,
    },
    statistics: profile.statistics,
  };
}

function hasBackendErrors(errors: unknown): boolean {
  if (!errors) return false;
  if (Array.isArray(errors)) return errors.length > 0;
  if (typeof errors === "object") return Object.keys(errors).length > 0;
  return true;
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
