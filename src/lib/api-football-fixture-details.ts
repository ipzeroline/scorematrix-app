type MatchStatusValue = "upcoming" | "live" | "finished" | "postponed" | "cancelled";

type ApiFootballSourceValue = "api-football" | "mock";

type FixtureDetailsPayload = {
  source?: ApiFootballSourceValue;
  fetchedAt?: string;
  fixture?: unknown;
  events?: unknown[];
  lineups?: unknown[];
  statistics?: unknown[];
  playerStats?: unknown[];
  players?: unknown[];
  data?: unknown;
};

type RawFixtureDetail = {
  provider_id?: number | null;
  fixture?: {
    id?: number | null;
    date?: string | null;
    venue?: {
      name?: string | null;
      city?: string | null;
    } | null;
    status?: {
      short?: string | null;
      long?: string | null;
      elapsed?: number | null;
    } | null;
  } | null;
  league?: {
    id?: number | null;
    name?: string | null;
    country?: string | null;
    logo?: string | null;
    flag?: string | null;
    season?: number | null;
    round?: string | null;
  } | null;
  teams?: {
    home?: RawTeam | null;
    away?: RawTeam | null;
  } | null;
  goals?: {
    home?: number | null;
    away?: number | null;
  } | null;
  score?: {
    halftime?: RawScorePair | null;
    fulltime?: RawScorePair | null;
    extratime?: RawScorePair | null;
    penalty?: RawScorePair | null;
  } | null;
  events?: unknown[];
  lineups?: unknown[];
  statistics?: unknown[];
  players?: unknown[];
  hydrated_at?: string | null;
};

type RawScorePair = {
  home?: number | null;
  away?: number | null;
};

type RawTeam = {
  id?: number | null;
  name?: string | null;
  logo?: string | null;
  winner?: boolean | null;
};

export function normalizeFixtureDetailsPayload(payload: FixtureDetailsPayload) {
  if (payload.fixture) {
    return {
      source: payload.source ?? "api-football",
      fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
      fixture: payload.fixture,
      events: payload.events ?? [],
      lineups: payload.lineups ?? [],
      statistics: payload.statistics ?? [],
      playerStats: payload.playerStats ?? payload.players ?? [],
    };
  }

  const detail = isRawFixtureDetail(payload.data) ? payload.data : null;
  const rawFixture = detail?.fixture;

  if (!detail || !rawFixture) {
    return {
      source: payload.source ?? "api-football",
      fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
      fixture: undefined,
      events: [],
      lineups: [],
      statistics: [],
      playerStats: [],
    };
  }

  const fixtureId = detail.provider_id ?? rawFixture.id ?? null;
  const home = detail.teams?.home;
  const away = detail.teams?.away;

  return {
    source: payload.source ?? "api-football",
    fetchedAt: payload.fetchedAt ?? detail.hydrated_at ?? new Date().toISOString(),
    fixture: {
      id: fixtureId ? `api-football-${fixtureId}` : "api-football-unknown",
      apiFixtureId: fixtureId,
      league: {
        id: detail.league?.id ? `api-league-${detail.league.id}` : "api-league-unknown",
        apiLeagueId: detail.league?.id ?? null,
        name: detail.league?.name ?? "Unknown League",
        country: detail.league?.country ?? "",
        logo: detail.league?.logo ?? null,
        flag: detail.league?.flag ?? null,
        season: detail.league?.season ?? null,
        round: detail.league?.round ?? rawFixture.status?.long ?? "",
      },
      home: normalizeTeam(home),
      away: normalizeTeam(away),
      score: {
        home: detail.goals?.home ?? detail.score?.fulltime?.home ?? null,
        away: detail.goals?.away ?? detail.score?.fulltime?.away ?? null,
      },
      status: normalizeFixtureStatus(rawFixture.status?.short),
      statusShort: rawFixture.status?.short ?? "",
      elapsed: rawFixture.status?.elapsed ?? null,
      kickoffTime: rawFixture.date ?? "",
      venue: formatVenue(rawFixture.venue),
    },
    events: normalizeEvents(detail.events),
    lineups: detail.lineups ?? [],
    statistics: detail.statistics ?? [],
    playerStats: detail.players ?? [],
  };
}

export function isIgnorableFixtureSupplementError(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      (error as { status?: unknown }).status === 404
  );
}

function isRawFixtureDetail(value: unknown): value is RawFixtureDetail {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeTeam(team: RawTeam | null | undefined) {
  const teamId = team?.id ?? null;

  return {
    id: teamId ? `api-team-${teamId}` : "api-team-unknown",
    apiTeamId: teamId,
    name: team?.name ?? "Unknown Team",
    logo: team?.logo ?? null,
    winner: team?.winner ?? null,
  };
}

function normalizeFixtureStatus(statusShort: string | null | undefined): MatchStatusValue {
  switch ((statusShort ?? "").toUpperCase()) {
    case "1H":
    case "2H":
    case "HT":
    case "ET":
    case "BT":
    case "P":
    case "SUSP":
    case "INT":
    case "LIVE":
      return "live";
    case "FT":
    case "AET":
    case "PEN":
      return "finished";
    case "PST":
      return "postponed";
    case "CANC":
    case "ABD":
    case "AWD":
    case "WO":
      return "cancelled";
    default:
      return "upcoming";
  }
}

function normalizeEvents(events: unknown[] | undefined) {
  if (!events) return [];

  return events.map((event) => {
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      return event;
    }

    const eventRecord = event as { type?: unknown };
    if (typeof eventRecord.type !== "string") {
      return event;
    }

    return {
      ...eventRecord,
      type: normalizeEventType(eventRecord.type),
    };
  });
}

function normalizeEventType(type: string) {
  switch (type.toLowerCase()) {
    case "subst":
    case "substitution":
      return "Substitution";
    case "goal":
      return "Goal";
    case "card":
      return "Card";
    case "var":
      return "VAR";
    default:
      return type;
  }
}

function formatVenue(venue: NonNullable<NonNullable<RawFixtureDetail["fixture"]>["venue"]> | null | undefined) {
  if (!venue) return "";

  return [venue.name, venue.city].filter(Boolean).join(", ");
}
