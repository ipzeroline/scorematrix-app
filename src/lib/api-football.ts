import { matches } from "@/data/matches";
import { leagues } from "@/data/leagues";
import { teams } from "@/data/teams";
import { normalizeFixtureDetailsPayload } from "@/lib/api-football-fixture-details";
import { getFootballApiUrl } from "@/lib/backend-api-urls";
import { proxyFootballMediaValue } from "@/lib/football-media";
import { MatchStatus } from "@/types/common";

const API_SPORTS_LEAGUE_LOGO_BASE_URL = "https://media.api-sports.io/football/leagues";

export type ApiFootballSource = "api-football" | "mock";

export interface ApiFootballFixture {
  id: string;
  apiFixtureId: number | null;
  referee: string | null;
  timezone: string | null;
  timestamp: number | null;
  periods: {
    first: number | null;
    second: number | null;
  };
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
  statusLong: string;
  statusExtra: number | null;
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
  data?: SoccerLiveFixture[];
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

interface SoccerLiveResponse {
  data?: SoccerLiveFixture[];
}

interface SoccerStandingsResponse {
  data?: {
    league_id?: number;
    season?: number;
    standings?: ApiFootballStanding[];
  };
  league?: ApiFootballStandingLeague;
}

interface SoccerH2HResponse {
  data?: {
    pair_key?: string;
    team_a_id?: number;
    team_b_id?: number;
    fixtures?: unknown[];
    hydrated_at?: string | null;
  };
  fixtures?: ApiFootballFixture[];
  h2h?: {
    fixtures?: ApiFootballFixture[];
  };
}

interface SoccerLiveFixture {
  provider_id: number;
  league_id: number;
  league_name?: string | null;
  league?: {
    id?: number | null;
    provider_id?: number | null;
    name?: string | null;
    country?: string | null;
    logo?: string | null;
    flag?: string | null;
    country_flag?: string | null;
    season?: number | null;
    round?: string | null;
  } | null;
  season: number | null;
  status: {
    short: string;
    long: string;
    elapsed: number | null;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  teams: {
    home: SoccerLiveTeam;
    away: SoccerLiveTeam;
  };
  starts_at: string;
  is_live: boolean;
  is_terminal?: boolean;
  last_synced_at?: string | null;
}

interface SoccerLiveTeam {
  id: number;
  name: string;
  logo: string | null;
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

interface SoccerLeaguesResponse {
  data?: SoccerApiLeagueEntry[];
  leagues?: SoccerBackendLeagueEntry[];
}

interface SoccerLeagueDetailResponse {
  data?: SoccerApiLeagueProfile;
  profile?: SoccerApiLeagueProfile;
  result?: SoccerApiLeagueProfile;
}

interface SoccerApiLeagueEntry {
  provider_id: number;
  name: string;
  country: string;
  country_code: string | null;
  country_flag: string | null;
  type: string;
  logo: string | null;
  current_season: number | null;
  sort_order: number | null;
}

interface SoccerApiLeagueProfile {
  id?: number;
  provider_id?: number;
  name?: string | null;
  country?: string | null;
  country_code?: string | null;
  country_flag?: string | null;
  type?: string | null;
  logo?: string | null;
  current_season?: number | null;
  season?: number | null;
  teams?: {
    count?: number | null;
    data?: Array<{
      id?: number | null;
      provider_id?: number | null;
      name?: string | null;
      code?: string | null;
      country?: string | null;
      logo?: string | null;
    }>;
  } | null;
  standings?: unknown[];
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

interface SoccerApiTeamProfile {
  provider_id: number;
  name: string;
  code?: string | null;
  country?: string | null;
  founded?: number | null;
  national?: boolean | null;
  logo?: string | null;
  venue?: {
    id?: number | null;
    name?: string | null;
    address?: string | null;
    city?: string | null;
    capacity?: number | null;
    surface?: string | null;
    image?: string | null;
  } | null;
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

export interface ApiFootballLeagueProfile {
  league: {
    id: number;
    name: string;
    type: string;
    logo: string | null;
    currentSeason: number | null;
    season: number | null;
  };
  country: {
    name: string;
    code: string | null;
    flag: string | null;
  };
  teams: {
    count: number;
    data: {
      id: number;
      name: string;
      code: string | null;
      country: string;
      logo: string | null;
    }[];
  };
  standings: ApiFootballStanding[];
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
  leagues: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    season: number | null;
    statistics: ApiFootballTeamSeasonStats | null;
  }[];
  squad: {
    teamId: number | null;
    hydratedAt: string | null;
    team: {
      id: number;
      name: string;
      logo: string | null;
    } | null;
    players: {
      id: number;
      name: string;
      age: number | null;
      number: number | null;
      position: string | null;
      photo: string | null;
    }[];
  } | null;
}

export interface ApiFootballTeamSeasonStats {
  league?: {
    id: number;
    name: string;
    country: string;
    logo: string | null;
    flag?: string | null;
    season: number | null;
  };
  team?: {
    id: number;
    name: string;
    logo: string | null;
  };
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
  biggest?: {
    streak?: {
      wins: number | null;
      draws: number | null;
      loses: number | null;
    };
  };
  lineups?: {
    formation: string | null;
    played: number | null;
  }[];
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
    number: number | null;
    position: string | null;
    injured: boolean;
    photo: string | null;
  };
  teams: {
    team: {
      id: number;
      name: string;
      logo: string | null;
    };
    seasons: number[];
  }[];
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
      number: number | null;
      position: string | null;
      rating: string | null;
      captain: boolean;
    };
    substitutes: {
      in: number | null;
      out: number | null;
      bench: number | null;
    };
    goals: {
      total: number | null;
      conceded: number | null;
      assists: number | null;
      saves: number | null;
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
      blocks: number | null;
      interceptions: number | null;
    };
    duels: {
      total: number | null;
      won: number | null;
    };
    dribbles: {
      attempts: number | null;
      success: number | null;
      past: number | null;
    };
    fouls: {
      drawn: number | null;
      committed: number | null;
    };
    cards: {
      yellow: number | null;
      yellowred: number | null;
      red: number | null;
    };
    penalty: {
      won: number | null;
      commited: number | null;
      scored: number | null;
      missed: number | null;
      saved: number | null;
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
    colors?: {
      player?: ApiFootballKitColor | null;
      goalkeeper?: ApiFootballKitColor | null;
    } | null;
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

export interface ApiFootballKitColor {
  primary: string | null;
  number: string | null;
  border: string | null;
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

export type ApiFootballAIInsightGroup = "live" | "highConfidence" | "upsetAlert";

export interface ApiFootballAIInsight {
  provider_id: number;
  status: {
    short: string;
    long: string;
    elapsed: number | null;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  teams: {
    home: SoccerLiveTeam;
    away: SoccerLiveTeam;
  };
  starts_at: string;
  is_live: boolean;
  confidenceScore: number | null;
  homeWinProbability: number | null;
  drawProbability: number | null;
  awayWinProbability: number | null;
  heatMeter: number | null;
  favoriteTeam?: "home" | "away" | null;
  homeStrength?: number | null;
  awayStrength?: number | null;
  strengthGap?: number | null;
  upsetRisk?: number | null;
  upsetAlert: boolean;
  communitySentiment: {
    homePercentage: number;
    drawPercentage: number;
    awayPercentage: number;
    totalVotes: number;
  } | null;
  keyFactors: string[];
  apiAdvice: string | null;
  apiWinner: {
    id: number;
    name: string;
    comment: string | null;
  } | null;
  generatedAt: string | null;
  league: {
    id: number;
    name: string;
    country_flag: string | null;
    logo: string | null;
  };
}

export interface GetAIInsightsResult {
  live: ApiFootballAIInsight[];
  highConfidence: ApiFootballAIInsight[];
  upsetAlert: ApiFootballAIInsight[];
}

interface SoccerAIInsightsResponse {
  data?: Partial<GetAIInsightsResult>;
}

export type ApiFootballInsightComparison = Record<
  string,
  { home: number | null; away: number | null }
>;

export type ApiFootballTeamFormProfile = {
  played?: number | null;
  form?: string | null;
  att?: number | null;
  def?: number | null;
  goals?: {
    for?: {
      total?: number | null;
      average?: number | null;
      minute?: Record<string, { total?: number | null; percentage?: string | null }>;
      under_over?: Record<string, { over?: number | null; under?: number | null }>;
    };
    against?: {
      total?: number | null;
      average?: number | null;
      minute?: Record<string, { total?: number | null; percentage?: string | null }>;
      under_over?: Record<string, { over?: number | null; under?: number | null }>;
    };
  };
  cards?: {
    yellow?: Record<string, { total?: number | null; percentage?: string | null }>;
    red?: Record<string, { total?: number | null; percentage?: string | null }>;
  };
  biggest?: {
    streak?: { wins?: number | null; draws?: number | null; loses?: number | null };
    wins?: { home?: string | null; away?: string | null };
    loses?: { home?: string | null; away?: string | null };
    goals?: {
      for?: { home?: number | null; away?: number | null };
      against?: { home?: number | null; away?: number | null };
    };
  };
  clean_sheet?: { home?: number | null; away?: number | null; total?: number | null };
  failed_to_score?: { home?: number | null; away?: number | null; total?: number | null };
  penalty?: {
    scored?: { total?: number | null; percentage?: string | null };
    missed?: { total?: number | null; percentage?: string | null };
    total?: number | null;
  };
  lineups?: {
    formation?: string | null;
    played?: number | null;
  }[];
  league?: {
    form?: string | null;
    fixtures?: {
      played?: { home?: number | null; away?: number | null; total?: number | null };
      wins?: { home?: number | null; away?: number | null; total?: number | null };
      draws?: { home?: number | null; away?: number | null; total?: number | null };
      loses?: { home?: number | null; away?: number | null; total?: number | null };
    };
    goals?: {
      for?: {
        total?: { home?: number | null; away?: number | null; total?: number | null };
        average?: { home?: number | null; away?: number | null; total?: number | null };
        minute?: Record<string, { total?: number | null; percentage?: string | null }>;
        under_over?: Record<string, { over?: number | null; under?: number | null }>;
      };
      against?: {
        total?: { home?: number | null; away?: number | null; total?: number | null };
        average?: { home?: number | null; away?: number | null; total?: number | null };
        minute?: Record<string, { total?: number | null; percentage?: string | null }>;
        under_over?: Record<string, { over?: number | null; under?: number | null }>;
      };
    };
    biggest?: {
      streak?: { wins?: number | null; draws?: number | null; loses?: number | null };
      goals?: {
        for?: { home?: number | null; away?: number | null };
        against?: { home?: number | null; away?: number | null };
      };
    };
    clean_sheet?: { home?: number | null; away?: number | null; total?: number | null };
    failed_to_score?: { home?: number | null; away?: number | null; total?: number | null };
    penalty?: {
      scored?: { total?: number | null; percentage?: string | null };
      missed?: { total?: number | null; percentage?: string | null };
      total?: number | null;
    };
  };
};

export interface ApiFootballAIInsightDetail {
  id: string;
  matchId: string;
  confidenceScore: number | null;
  homeWinProbability: number | null;
  drawProbability: number | null;
  awayWinProbability: number | null;
  heatMeter: number | null;
  favoriteTeam?: "home" | "away" | null;
  homeStrength?: number | null;
  awayStrength?: number | null;
  strengthGap?: number | null;
  upsetRisk?: number | null;
  homeAdvantageFactor: number | null;
  comparison: ApiFootballInsightComparison;
  formComparison: {
    homeFormIndex: number | null;
    awayFormIndex: number | null;
    homeLastFive: ApiFootballTeamFormProfile | null;
    awayLastFive: ApiFootballTeamFormProfile | null;
  };
  injuryImpact: {
    homeImpact: number | null;
    awayImpact: number | null;
    homeInjuries: string[];
    awayInjuries: string[];
  } | null;
  upsetAlert: boolean;
  upsetDescription: string | null;
  communitySentiment: ApiFootballAIInsight["communitySentiment"];
  keyFactors: string[];
  generatedAt: string;
  apiAdvice: string | null;
  apiUnderOver: string | null;
  apiWinOrDraw: boolean | null;
  apiWinner: { id: number | null; name: string | null; comment: string | null } | null;
  apiPredictedGoals: { home: number | string | null; away: number | string | null } | null;
  headToHead?: {
    fixtureId: number;
    date: string;
    league?: {
      name?: string | null;
      season?: number | null;
    } | null;
    teams: {
      home: { name: string; winner?: boolean | null };
      away: { name: string; winner?: boolean | null };
    };
    goals: {
      home: number | null;
      away: number | null;
    };
    score?: {
      halftime?: string | { home?: number | null; away?: number | null } | null;
      fulltime?: string | { home?: number | null; away?: number | null } | null;
    } | null;
  }[];
  fixture: ApiFootballFixture;
}

interface SoccerAIInsightDetailResponse {
  data?: Omit<ApiFootballAIInsightDetail, "fixture"> & {
    fixture?: SoccerLiveFixture | ApiFootballFixture | null;
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
  const query = buildFixtureQuery(options);
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/fixtures",
    query
  );
  const mappedFixtures = withLeagueLogoFallbacks(
    payload.fixtures ?? (payload.data ?? []).map(mapLiveFixture)
  );
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

export async function getApiFootballAIInsights(): Promise<GetAIInsightsResult> {
  const payload = await fetchSoccerBackend<SoccerAIInsightsResponse>(
    "/ai-insights",
    {}
  );

  return {
    live: Array.isArray(payload.data?.live) ? payload.data.live : [],
    highConfidence: Array.isArray(payload.data?.highConfidence)
      ? payload.data.highConfidence
      : [],
    upsetAlert: Array.isArray(payload.data?.upsetAlert)
      ? payload.data.upsetAlert
      : [],
  };
}

export async function getApiFootballAIInsightDetail(
  fixtureId: number
): Promise<ApiFootballAIInsightDetail> {
  const payload = await fetchSoccerBackend<SoccerAIInsightDetailResponse>(
    `/ai-insights/${fixtureId}`,
    {}
  );

  if (!payload.data?.fixture) {
    throw new ApiFootballError("AI insight detail not found", 404);
  }

  return {
    ...payload.data,
    fixture: mapInsightFixture(payload.data.fixture),
  };
}

export async function getApiFootballTodayFixtures(
  options: Pick<GetFixturesOptions, "limit"> = {}
): Promise<GetFixturesResult> {
  const query: Record<string, string> = {};
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/fixtures/today",
    query
  );
  const mappedFixtures = withLeagueLogoFallbacks(
    payload.fixtures ?? (payload.data ?? []).map(mapLiveFixture)
  );
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

export async function getApiFootballUpcomingFixtures(
  options: Pick<GetFixturesOptions, "limit"> = {}
): Promise<GetFixturesResult> {
  const query: Record<string, string> = {};
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const payload = await fetchSoccerBackend<SoccerBackendResponse<never>>(
    "/fixtures/upcoming",
    query
  );
  const mappedFixtures = withLeagueLogoFallbacks(
    payload.fixtures ?? (payload.data ?? []).map(mapLiveFixture)
  );
  const fixtures =
    typeof options.limit === "number"
      ? mappedFixtures.slice(0, options.limit)
      : mappedFixtures;

  return {
    source: payload.source ?? "api-football",
    fetchedAt:
      payload.fetchedAt ?? payload.data?.[0]?.last_synced_at ?? new Date().toISOString(),
    query,
    count: fixtures.length,
    fixtures,
    rateLimit: payload.rateLimit ?? {
      requestsRemaining: null,
      requestsLimit: null,
    },
  };
}

export async function getApiFootballLiveFixtures(
  options: Pick<GetFixturesOptions, "limit"> = {}
): Promise<GetFixturesResult> {
  const payload = await fetchSoccerBackend<SoccerLiveResponse>(
    "/live",
    {}
  );
  const mappedFixtures = withLeagueLogoFallbacks((payload.data ?? []).map(mapLiveFixture));
  const fixtures =
    typeof options.limit === "number"
      ? mappedFixtures.slice(0, options.limit)
      : mappedFixtures;

  return {
    source: "api-football",
    fetchedAt: payload.data?.[0]?.last_synced_at ?? new Date().toISOString(),
    query: {},
    count: fixtures.length,
    fixtures,
    rateLimit: {
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
  const details = normalizeFixtureDetailsPayload(payload);

  if (details.source === "mock") {
    throw new ApiFootballError("Fixture details must come from the live football API", 502);
  }

  const fixture = details.fixture as ApiFootballFixture | undefined;

  if (!fixture) {
    throw new ApiFootballError("Fixture not found", 404);
  }

  return {
    source: details.source,
    fetchedAt: details.fetchedAt,
    fixture,
    events: details.events as ApiFootballEvent[],
    lineups: details.lineups as ApiFootballLineup[],
    statistics: details.statistics as ApiFootballTeamStatistics[],
    playerStats: details.playerStats as ApiFootballPlayerStats[],
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

  const payload = await fetchSoccerBackend<SoccerLeaguesResponse>(
    "/leagues",
    query
  );

  const leagues = payload.data
    ? payload.data
        .filter((item) => !options.id || item.provider_id === options.id)
        .filter((item) =>
          options.search
            ? item.name.toLowerCase().includes(options.search.toLowerCase())
            : true
        )
        .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER))
        .map(mapSoccerApiLeague)
    : (payload.leagues ?? []).map(mapBackendLeague);

  return leagues;
}

export async function getApiFootballLeagueProfile(leagueId: number) {
  const payload = await fetchSoccerBackend<SoccerLeagueDetailResponse>(
    `/leagues/${leagueId}`,
    {}
  );

  return normalizeLeagueProfilePayload(payload);
}

export async function getApiFootballStandings(league: number, season: number) {
  const payload = await fetchSoccerBackend<SoccerStandingsResponse>(
    "/standings",
    {
      league: String(league),
      season: String(season),
    }
  );

  if (payload.league) return payload.league;
  if (!payload.data?.standings) return null;

  return {
    id: payload.data.league_id ?? league,
    name: "",
    country: "",
    logo: null,
    flag: null,
    season: payload.data.season ?? season,
    standings: [payload.data.standings],
  };
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
  const payload = await fetchTeamProfilePayload(team, query);

  return normalizeBackendTeamProfilePayload(payload, league, season);
}

export async function getApiFootballPlayerProfile(player: number) {
  const payload = await fetchSoccerBackend<unknown>(
    `/players/${player}`,
    {}
  );

  return normalizeBackendPlayerProfilePayload(payload);
}

export async function getApiFootballH2H(
  homeTeam: number,
  awayTeam: number,
  limit = 10
) {
  const payload = await fetchSoccerBackend<SoccerH2HResponse>(
    `/h2h/${homeTeam}/${awayTeam}`,
    {}
  );

  if (payload.data?.fixtures) {
    return withLeagueLogoFallbacks(
      payload.data.fixtures
        .map((fixture) => {
          const details = normalizeFixtureDetailsPayload({
            source: "api-football",
            fetchedAt: payload.data?.hydrated_at ?? undefined,
            data: fixture,
          });

          return details.fixture;
        })
        .filter(isApiFootballFixture)
    ).slice(0, limit);
  }

  return (payload.fixtures ?? payload.h2h?.fixtures ?? []).slice(0, limit);
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
      referee: null,
      timezone: null,
      timestamp: null,
      periods: {
        first: null,
        second: null,
      },
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
      statusLong: match.status,
      statusExtra: null,
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

function mapLiveFixture(fixture: SoccerLiveFixture): ApiFootballFixture {
  const normalizedStatus = normalizeMatchStatus(fixture.status.short);
  const status = isMatchStatus(normalizedStatus)
    ? normalizedStatus
    : fixture.is_live
      ? MatchStatus.LIVE
      : fixture.is_terminal
        ? MatchStatus.FINISHED
        : MatchStatus.UPCOMING;
  const leagueId = fixture.league?.id ?? fixture.league?.provider_id ?? fixture.league_id;
  const leagueName = fixture.league?.name ?? fixture.league_name ?? `League ${leagueId}`;

  return {
    id: `api-football-${fixture.provider_id}`,
    apiFixtureId: fixture.provider_id,
    referee: null,
    timezone: null,
    timestamp: null,
    periods: {
      first: null,
      second: null,
    },
    league: {
      id: `api-league-${leagueId}`,
      apiLeagueId: leagueId,
      name: leagueName,
      country: fixture.league?.country ?? "",
      logo: fixture.league?.logo ?? getApiSportsLeagueLogoUrl(leagueId),
      flag: fixture.league?.flag ?? fixture.league?.country_flag ?? null,
      season: fixture.season,
      round: fixture.league?.round ?? fixture.status.long,
    },
    home: {
      id: `api-team-${fixture.teams.home.id}`,
      apiTeamId: fixture.teams.home.id,
      name: fixture.teams.home.name,
      logo: fixture.teams.home.logo,
      winner: winnerFor(fixture.goals.home, fixture.goals.away),
    },
    away: {
      id: `api-team-${fixture.teams.away.id}`,
      apiTeamId: fixture.teams.away.id,
      name: fixture.teams.away.name,
      logo: fixture.teams.away.logo,
      winner: winnerFor(fixture.goals.away, fixture.goals.home),
    },
    score: {
      home: fixture.goals.home,
      away: fixture.goals.away,
    },
    status,
    statusShort: fixture.status.short,
    statusLong: fixture.status.long,
    statusExtra: null,
    elapsed: fixture.status.elapsed,
    kickoffTime: fixture.starts_at,
    venue: "",
  };
}

function mapInsightFixture(
  fixture: SoccerLiveFixture | ApiFootballFixture
): ApiFootballFixture {
  if (isApiFootballFixture(fixture)) {
    return fixture;
  }

  return mapLiveFixture(fixture);
}

function withLeagueLogoFallbacks(fixtures: ApiFootballFixture[]): ApiFootballFixture[] {
  return fixtures.map((fixture) => {
    const logo = fixture.league.logo ?? getApiSportsLeagueLogoUrl(fixture.league.apiLeagueId);

    if (logo === fixture.league.logo) {
      return fixture;
    }

    return {
      ...fixture,
      league: {
        ...fixture.league,
        logo,
      },
    };
  });
}

function isApiFootballFixture(value: unknown): value is ApiFootballFixture {
  return Boolean(
    value &&
      typeof value === "object" &&
      "id" in value &&
      "home" in value &&
      "away" in value &&
      "league" in value
  );
}

function getApiSportsLeagueLogoUrl(leagueId?: number | null): string | null {
  return typeof leagueId === "number"
    ? `${API_SPORTS_LEAGUE_LOGO_BASE_URL}/${leagueId}.png`
    : null;
}

function isMatchStatus(status: string): status is MatchStatus {
  return Object.values(MatchStatus).includes(status as MatchStatus);
}

async function fetchSoccerBackend<T>(
  pathname: string,
  query: Record<string, string>
): Promise<T> {
  const url = getFootballApiUrl(pathname);
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
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

async function fetchTeamProfilePayload(
  team: number,
  query: Record<string, string>
): Promise<unknown> {
  return fetchSoccerBackend<unknown>(`/teams/${team}`, query);
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
      logo: item.logo ?? getApiSportsLeagueLogoUrl(item.apiLeagueId),
    },
    country: {
      name: item.country,
      code: item.countryCode,
      flag: item.countryFlag,
    },
    seasons: item.seasons,
  };
}

function mapSoccerApiLeague(item: SoccerApiLeagueEntry): ApiFootballLeagueEntry {
  return {
    league: {
      id: item.provider_id,
      name: item.name,
      type: item.type,
      logo: item.logo ?? getApiSportsLeagueLogoUrl(item.provider_id),
    },
    country: {
      name: item.country,
      code: item.country_code,
      flag: item.country_flag,
    },
    seasons:
      typeof item.current_season === "number"
        ? [
            {
              year: item.current_season,
              start: "",
              end: "",
              current: true,
            },
          ]
        : [],
  };
}

function normalizeLeagueProfilePayload(payload: unknown): ApiFootballLeagueProfile | null {
  if (!isRecord(payload)) return null;

  const candidate = isRecord(payload.data)
    ? payload.data
    : isRecord(payload.profile)
      ? payload.profile
      : isRecord(payload.result)
        ? payload.result
        : payload;

  if (!isRecord(candidate)) return null;

  const teams = isRecord(candidate.teams) ? candidate.teams : {};
  const teamItems = Array.isArray(teams.data) ? teams.data : [];
  const standings = Array.isArray(candidate.standings)
    ? candidate.standings
        .map((entry) => normalizeStandingRow(entry))
        .filter((entry): entry is ApiFootballStanding => entry !== null)
    : [];

  return {
    league: {
      id: toNumber(candidate.id ?? candidate.provider_id, 0),
      name: toStringValue(candidate.name),
      type: toStringValue(candidate.type),
      logo: toNullableString(candidate.logo),
      currentSeason: toNullableNumber(candidate.current_season),
      season: toNullableNumber(candidate.season),
    },
    country: {
      name: toStringValue(candidate.country),
      code: toNullableString(candidate.country_code),
      flag: toNullableString(candidate.country_flag),
    },
    teams: {
      count: toNumber(teams.count, teamItems.length),
      data: teamItems
        .map((entry) => {
          const team = isRecord(entry) ? entry : {};
          return {
            id: toNumber(team.id ?? team.provider_id, 0),
            name: toStringValue(team.name),
            code: toNullableString(team.code),
            country: toStringValue(team.country),
            logo: toNullableString(team.logo),
          };
        })
        .filter((team) => team.id > 0 || team.name.length > 0),
    },
    standings,
  };
}

function normalizeStandingRow(value: unknown): ApiFootballStanding | null {
  if (!isRecord(value)) return null;
  const team = isRecord(value.team) ? value.team : {};
  const all = isRecord(value.all) ? value.all : {};
  const goals = isRecord(all.goals) ? all.goals : {};

  return {
    rank: toNumber(value.rank, 0),
    team: {
      id: toNumber(team.id ?? team.provider_id, 0),
      name: toStringValue(team.name),
      logo: toNullableString(team.logo),
    },
    points: toNumber(value.points, 0),
    goalsDiff: toNumber(value.goalsDiff ?? value.goals_diff, 0),
    group: toStringValue(value.group),
    form: toNullableString(value.form),
    status: toStringValue(value.status),
    description: toNullableString(value.description),
    all: {
      played: toNumber(all.played, 0),
      win: toNumber(all.win, 0),
      draw: toNumber(all.draw, 0),
      lose: toNumber(all.lose, 0),
      goals: {
        for: toNumber(goals.for, 0),
        against: toNumber(goals.against, 0),
      },
    },
  };
}

function mapBackendTeamProfile(
  profile: SoccerBackendTeamProfile | SoccerApiTeamProfile | ApiFootballTeamProfile
): ApiFootballTeamProfile {
  if ("team" in profile) return profile;

  if ("provider_id" in profile) {
    const venue = profile.venue ?? {};
    const extendedProfile = profile as SoccerApiTeamProfile & {
      leagues?: unknown;
      squad?: unknown;
    };

    return {
      team: {
        id: profile.provider_id,
        name: profile.name,
        code: profile.code ?? null,
        country: profile.country ?? "",
        founded: profile.founded ?? null,
        national: profile.national ?? false,
        logo: profile.logo ?? null,
      },
      venue: {
        id: venue.id ?? null,
        name: venue.name ?? null,
        address: venue.address ?? null,
        city: venue.city ?? null,
        capacity: venue.capacity ?? null,
        surface: venue.surface ?? null,
        image: venue.image ?? null,
      },
      leagues: normalizeTeamLeagues(extendedProfile.leagues),
      squad: normalizeTeamSquad(extendedProfile.squad),
    };
  }

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
    leagues: normalizeTeamLeagues((profile as { leagues?: unknown }).leagues),
    squad: normalizeTeamSquad((profile as { squad?: unknown }).squad),
  };
}

function normalizeTeamLeagues(leagues: unknown) {
  if (!Array.isArray(leagues)) return [];

  return leagues
    .map((leagueEntry) => {
      const league = isRecord(leagueEntry) ? leagueEntry : {};

      return {
        id: toNumber(league.id ?? league.provider_id, 0),
        name: toStringValue(league.name),
        country: toStringValue(league.country),
        logo: toNullableString(league.logo),
        season: toNullableNumber(league.season),
        statistics: isApiFootballTeamSeasonStats(league.statistics)
          ? normalizeTeamSeasonStats(league.statistics)
          : null,
      };
    })
    .filter((league) => league.id > 0 || league.name.length > 0);
}

function normalizeTeamSquad(squad: unknown) {
  if (!isRecord(squad)) return null;

  const team = isRecord(squad.team) ? squad.team : null;
  const players = Array.isArray(squad.players)
    ? squad.players
        .map((entry) => {
          const player = isRecord(entry) ? entry : {};

          return {
            id: toNumber(player.id ?? player.provider_id, 0),
            name: toStringValue(player.name),
            age: toNullableNumber(player.age),
            number: toNullableNumber(player.number),
            position: toNullableString(player.position),
            photo: toNullableString(player.photo),
          };
        })
        .filter((player) => player.id > 0 || player.name.length > 0)
    : [];

  return {
    teamId: toNullableNumber(squad.team_id ?? squad.teamId),
    hydratedAt: toNullableString(squad.hydrated_at ?? squad.hydratedAt),
    team: team
      ? {
          id: toNumber(team.id ?? team.provider_id, 0),
          name: toStringValue(team.name),
          logo: toNullableString(team.logo),
        }
      : null,
    players,
  };
}

function normalizeBackendTeamProfilePayload(
  payload: unknown,
  league?: number,
  season?: number
): {
  profile: ApiFootballTeamProfile | null;
  stats: ApiFootballTeamSeasonStats | null;
} {
  if (!isRecord(payload)) {
    return { profile: null, stats: null };
  }

  const profileCandidate = payload.profile ?? payload.data ?? payload.result;
  const profile = isTeamProfilePayload(profileCandidate)
    ? mapBackendTeamProfile(profileCandidate)
    : null;
  const directStats = isApiFootballTeamSeasonStats(payload.stats)
    ? normalizeTeamSeasonStats(payload.stats)
    : null;
  const matchedLeagueStats =
    profile?.leagues.find((entry) => {
      const sameLeague = typeof league === "number" ? entry.id === league : true;
      const sameSeason = typeof season === "number" ? entry.season === season : true;
      return sameLeague && sameSeason && entry.statistics;
    })?.statistics ??
    profile?.leagues.find((entry) => (typeof season === "number" ? entry.season === season : false))
      ?.statistics ??
    profile?.leagues.find((entry) => (typeof league === "number" ? entry.id === league : false))
      ?.statistics ??
    profile?.leagues[0]?.statistics ??
    null;

  return {
    profile,
    stats: directStats ?? matchedLeagueStats,
  };
}

function isTeamProfilePayload(
  value: unknown
): value is SoccerBackendTeamProfile | SoccerApiTeamProfile | ApiFootballTeamProfile {
  if (!isRecord(value)) return false;

  if ("team" in value) {
    return isRecord(value.team);
  }

  return (
    (typeof value.provider_id === "number" || typeof value.apiTeamId === "number") &&
    typeof value.name === "string"
  );
}

function isApiFootballTeamSeasonStats(value: unknown): value is ApiFootballTeamSeasonStats {
  return (
    isRecord(value) &&
    isRecord(value.fixtures) &&
    isRecord(value.goals) &&
    isRecord(value.clean_sheet)
  );
}

function normalizeTeamSeasonStats(value: unknown): ApiFootballTeamSeasonStats | null {
  if (!isApiFootballTeamSeasonStats(value)) return null;

  const rawValue = value as unknown as Record<string, unknown>;
  const league = isRecord(rawValue.league) ? rawValue.league : null;
  const team = isRecord(rawValue.team) ? rawValue.team : null;
  const biggest = isRecord(rawValue.biggest) ? rawValue.biggest : null;
  const streak = biggest && isRecord(biggest.streak) ? biggest.streak : null;
  const lineups = Array.isArray(rawValue.lineups) ? rawValue.lineups : [];

  return {
    ...value,
    league: league
      ? {
          id: toNumber(league.id ?? league.provider_id, 0),
          name: toStringValue(league.name),
          country: toStringValue(league.country),
          logo: toNullableString(league.logo),
          flag: toNullableString(league.flag),
          season: toNullableNumber(league.season),
        }
      : undefined,
    team: team
      ? {
          id: toNumber(team.id ?? team.provider_id, 0),
          name: toStringValue(team.name),
          logo: toNullableString(team.logo),
        }
      : undefined,
    biggest: biggest
      ? {
          streak: streak
            ? {
                wins: toNullableNumber(streak.wins),
                draws: toNullableNumber(streak.draws),
                loses: toNullableNumber(streak.loses),
              }
            : undefined,
        }
      : undefined,
    lineups: lineups.map((entry) => {
      const lineup = isRecord(entry) ? entry : {};
      return {
        formation: toNullableString(lineup.formation),
        played: toNullableNumber(lineup.played),
      };
    }),
  };
}

function normalizeBackendPlayerProfilePayload(
  payload: unknown
): ApiFootballPlayerProfile | null {
  if (!isRecord(payload)) return null;

  if ("player" in payload) {
    return normalizeApiPlayerProfile(payload);
  }

  return (
    normalizeBackendPlayerProfilePayload(payload.profile) ??
    normalizeBackendPlayerProfilePayload(payload.data) ??
    normalizeBackendPlayerProfilePayload(payload.result) ??
    normalizePlainSoccerPlayerProfile(payload)
  );
}

function normalizeApiPlayerProfile(profile: Record<string, unknown>) {
  const player = isRecord(profile.player) ? profile.player : {};

  return {
    player: normalizePlayerIdentity(player),
    teams: normalizePlayerTeams(profile.teams),
    statistics: normalizePlayerStatistics(profile.statistics),
  };
}

function normalizePlainSoccerPlayerProfile(
  profile: Record<string, unknown>
): ApiFootballPlayerProfile | null {
  const id = profile.apiPlayerId ?? profile.api_player_id ?? profile.provider_id ?? profile.id;
  const name = profile.name;
  if (!id && !name) return null;

  return {
    player: normalizePlayerIdentity(profile),
    teams: normalizePlayerTeams(profile.teams),
    statistics: normalizePlayerStatistics(profile.statistics),
  };
}

function normalizePlayerIdentity(player: Record<string, unknown>) {
  return {
    id: toNumber(
      player.id ?? player.apiPlayerId ?? player.api_player_id ?? player.provider_id,
      0
    ),
    name: toStringValue(player.name),
    firstname: toStringValue(player.firstname ?? player.first_name),
    lastname: toStringValue(player.lastname ?? player.last_name),
    age: toNullableNumber(player.age),
    birth: normalizePlayerBirth(player.birth),
    nationality: toNullableString(player.nationality),
    height: toNullableString(player.height),
    weight: toNullableString(player.weight),
    number: toNullableNumber(player.number),
    position: toNullableString(player.position),
    injured: Boolean(player.injured),
    photo: toNullableString(player.photo ?? player.image ?? player.avatar),
  };
}

function normalizePlayerBirth(birth: unknown) {
  const value = isRecord(birth) ? birth : {};

  return {
    date: toNullableString(value.date),
    place: toNullableString(value.place),
    country: toNullableString(value.country),
  };
}

function normalizePlayerTeams(teams: unknown) {
  if (!Array.isArray(teams)) return [];

  return teams
    .map((entry) => {
      const value = isRecord(entry) ? entry : {};
      const team = isRecord(value.team) ? value.team : {};
      const seasons = Array.isArray(value.seasons)
        ? value.seasons
            .map((season) => toNullableNumber(season))
            .filter((season): season is number => season !== null)
        : [];

      return {
        team: {
          id: toNumber(team.id ?? team.provider_id, 0),
          name: toStringValue(team.name),
          logo: toNullableString(team.logo),
        },
        seasons,
      };
    })
    .filter((entry) => entry.team.id > 0 || entry.team.name.length > 0);
}

function normalizePlayerStatistics(statistics: unknown) {
  const statisticEntries = Array.isArray(statistics)
    ? statistics
    : isRecord(statistics)
      ? Object.entries(statistics).flatMap(([seasonKey, items]) =>
          Array.isArray(items)
            ? items.map((item) =>
                isRecord(item) && !("league" in item)
                  ? item
                  : isRecord(item)
                    ? {
                        ...item,
                        league: {
                          ...(isRecord(item.league) ? item.league : {}),
                          season:
                            isRecord(item.league) &&
                            item.league.season !== undefined &&
                            item.league.season !== null
                              ? item.league.season
                              : seasonKey,
                        },
                      }
                    : item
              )
            : []
        )
      : [];

  if (statisticEntries.length === 0) return [];

  return statisticEntries.map((statistic) => {
    const stat = isRecord(statistic) ? statistic : {};
    const team = isRecord(stat.team) ? stat.team : {};
    const league = isRecord(stat.league) ? stat.league : {};
    const games = isRecord(stat.games) ? stat.games : {};
    const substitutes = isRecord(stat.substitutes) ? stat.substitutes : {};
    const goals = isRecord(stat.goals) ? stat.goals : {};
    const shots = isRecord(stat.shots) ? stat.shots : {};
    const passes = isRecord(stat.passes) ? stat.passes : {};
    const tackles = isRecord(stat.tackles) ? stat.tackles : {};
    const duels = isRecord(stat.duels) ? stat.duels : {};
    const dribbles = isRecord(stat.dribbles) ? stat.dribbles : {};
    const fouls = isRecord(stat.fouls) ? stat.fouls : {};
    const cards = isRecord(stat.cards) ? stat.cards : {};
    const penalty = isRecord(stat.penalty) ? stat.penalty : {};

    return {
      team: {
        id: toNumber(team.id ?? team.provider_id, 0),
        name: toStringValue(team.name),
        logo: toNullableString(team.logo),
      },
      league: {
        id: toNumber(league.id ?? league.provider_id, 0),
        name: toStringValue(league.name),
        country: toStringValue(league.country),
        logo: toNullableString(league.logo),
        season: toNumber(league.season, new Date().getFullYear()),
      },
      games: {
        appearences: toNullableNumber(games.appearences ?? games.appearances),
        lineups: toNullableNumber(games.lineups),
        minutes: toNullableNumber(games.minutes),
        number: toNullableNumber(games.number),
        position: toNullableString(games.position),
        rating: toNullableString(games.rating),
        captain: Boolean(games.captain),
      },
      substitutes: {
        in: toNullableNumber(substitutes.in),
        out: toNullableNumber(substitutes.out),
        bench: toNullableNumber(substitutes.bench),
      },
      goals: {
        total: toNullableNumber(goals.total),
        conceded: toNullableNumber(goals.conceded),
        assists: toNullableNumber(goals.assists),
        saves: toNullableNumber(goals.saves),
      },
      shots: {
        total: toNullableNumber(shots.total),
        on: toNullableNumber(shots.on),
      },
      passes: {
        total: toNullableNumber(passes.total),
        key: toNullableNumber(passes.key),
        accuracy:
          passes.accuracy === null || passes.accuracy === undefined
            ? null
            : typeof passes.accuracy === "number"
              ? passes.accuracy
              : String(passes.accuracy),
      },
      tackles: {
        total: toNullableNumber(tackles.total),
        blocks: toNullableNumber(tackles.blocks),
        interceptions: toNullableNumber(tackles.interceptions),
      },
      duels: {
        total: toNullableNumber(duels.total),
        won: toNullableNumber(duels.won),
      },
      dribbles: {
        attempts: toNullableNumber(dribbles.attempts),
        success: toNullableNumber(dribbles.success),
        past: toNullableNumber(dribbles.past),
      },
      fouls: {
        drawn: toNullableNumber(fouls.drawn),
        committed: toNullableNumber(fouls.committed),
      },
      cards: {
        yellow: toNullableNumber(cards.yellow),
        yellowred: toNullableNumber(cards.yellowred),
        red: toNullableNumber(cards.red),
      },
      penalty: {
        won: toNullableNumber(penalty.won),
        commited: toNullableNumber(penalty.commited),
        scored: toNullableNumber(penalty.scored),
        missed: toNullableNumber(penalty.missed),
        saved: toNullableNumber(penalty.saved),
      },
    };
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function toStringValue(value: unknown) {
  return toNullableString(value) ?? "";
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function toNumber(value: unknown, fallback: number) {
  return toNullableNumber(value) ?? fallback;
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
