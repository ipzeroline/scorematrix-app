type MatchStatusValue = "upcoming" | "live" | "finished" | "postponed" | "cancelled";

type FixtureDetailsPayload = {
  fetchedAt?: string;
  fixture?: unknown;
  events?: unknown[];
  lineups?: unknown[];
  statistics?: unknown[];
  playerStats?: unknown[];
  players?: unknown[];
  data?: unknown;
};

type RawH2HEntry = {
  fixture?: {
    id?: number | null;
    date?: string | null;
    status?: {
      short?: string | null;
      elapsed?: number | null;
    } | null;
  } | null;
  league?: {
    name?: string | null;
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
    halftime?: { home?: number | null; away?: number | null } | null;
    fulltime?: { home?: number | null; away?: number | null } | null;
  } | null;
};

type RawStandingRecord = {
  played?: number | null;
  win?: number | null;
  draw?: number | null;
  lose?: number | null;
  goals?: {
    for?: number | null;
    against?: number | null;
  } | null;
};

type RawTeamStanding = {
  rank?: number | null;
  team?: {
    id?: number | null;
    name?: string | null;
    logo?: string | null;
  } | null;
  points?: number | null;
  goalsDiff?: number | null;
  group?: string | null;
  form?: string | null;
  status?: string | null;
  description?: string | null;
  all?: RawStandingRecord | null;
  home?: RawStandingRecord | null;
  away?: RawStandingRecord | null;
};

type RawFixtureDetail = {
  provider_id?: number | null;
  fixture?: {
    id?: number | null;
    referee?: string | null;
    timezone?: string | null;
    date?: string | null;
    timestamp?: number | null;
    periods?: {
      first?: number | null;
      second?: number | null;
    } | null;
    venue?: {
      name?: string | null;
      city?: string | null;
    } | null;
    status?: {
      short?: string | null;
      long?: string | null;
      elapsed?: number | null;
      extra?: number | null;
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
  headToHead?: {
    fixtures?: RawH2HEntry[] | null;
  } | null;
  standings?: {
    home?: RawTeamStanding | null;
    away?: RawTeamStanding | null;
  } | null;
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
  const emptyScore = { home: null as number | null, away: null as number | null };
  const emptyScoreBreakdown = { halftime: emptyScore, extratime: emptyScore, penalty: emptyScore };

  if (payload.fixture) {
    return {
      fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
      fixture: payload.fixture,
      events: payload.events ?? [],
      lineups: normalizeLineups(payload.lineups),
      statistics: payload.statistics ?? [],
      playerStats: payload.playerStats ?? payload.players ?? [],
      headToHead: [],
      standings: null,
      scoreBreakdown: emptyScoreBreakdown,
    };
  }

  const detail = isRawFixtureDetail(payload.data) ? payload.data : null;
  const rawFixture = detail?.fixture;

  if (!detail || !rawFixture) {
    return {
      fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
      fixture: undefined,
      events: [],
      lineups: [],
      statistics: [],
      playerStats: [],
      headToHead: [],
      standings: null,
      scoreBreakdown: emptyScoreBreakdown,
    };
  }

  const fixtureId = detail.provider_id ?? rawFixture.id ?? null;
  const home = detail.teams?.home;
  const away = detail.teams?.away;

  return {
    fetchedAt: payload.fetchedAt ?? detail.hydrated_at ?? new Date().toISOString(),
    fixture: {
      id: fixtureId ? `api-football-${fixtureId}` : "api-football-unknown",
      apiFixtureId: fixtureId,
      referee: rawFixture.referee ?? null,
      timezone: rawFixture.timezone ?? null,
      timestamp: rawFixture.timestamp ?? null,
      periods: {
        first: rawFixture.periods?.first ?? null,
        second: rawFixture.periods?.second ?? null,
      },
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
      statusLong: rawFixture.status?.long ?? "",
      statusExtra: rawFixture.status?.extra ?? null,
      elapsed: rawFixture.status?.elapsed ?? null,
      kickoffTime: rawFixture.date ?? "",
      venue: formatVenue(rawFixture.venue),
    },
    events: normalizeEvents(detail.events),
    lineups: normalizeLineups(detail.lineups),
    statistics: detail.statistics ?? [],
    playerStats: detail.players ?? [],
    headToHead: normalizeH2HFixtures(detail.headToHead?.fixtures),
    standings: normalizeFixtureStandings(detail.standings),
    scoreBreakdown: {
      halftime: {
        home: detail.score?.halftime?.home ?? null,
        away: detail.score?.halftime?.away ?? null,
      },
      extratime: {
        home: detail.score?.extratime?.home ?? null,
        away: detail.score?.extratime?.away ?? null,
      },
      penalty: {
        home: detail.score?.penalty?.home ?? null,
        away: detail.score?.penalty?.away ?? null,
      },
    },
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

function normalizeLineups(lineups: unknown[] | undefined) {
  if (!lineups) return [];

  return lineups
    .filter(isRecord)
    .map((lineup) => {
      const team = isRecord(lineup.team) ? lineup.team : {};
      const coach = isRecord(lineup.coach) ? lineup.coach : {};

      return {
        ...lineup,
        team: {
          ...team,
          id: toNumber(team.id) ?? 0,
          name: toString(team.name) ?? "Unknown Team",
          logo: toString(team.logo),
        },
        coach: {
          ...coach,
          id: toNumber(coach.id),
          name: toString(coach.name),
          photo: toString(coach.photo),
        },
        formation: toString(lineup.formation),
        startXI: normalizeLineupPlayers(lineup.startXI ?? lineup.start_xi),
        substitutes: normalizeLineupPlayers(lineup.substitutes),
      };
    });
}

function normalizeLineupPlayers(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.filter(isRecord).map((entry) => {
    const player = isRecord(entry.player) ? entry.player : entry;

    return {
      ...entry,
      player: {
        ...player,
        id: toNumber(player.id),
        name: toString(player.name) ?? "Unknown Player",
        number: toNumber(player.number),
        pos: toString(player.pos),
        grid: toString(player.grid),
      },
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function formatVenue(venue: NonNullable<NonNullable<RawFixtureDetail["fixture"]>["venue"]> | null | undefined) {
  if (!venue) return "";

  return [venue.name, venue.city].filter(Boolean).join(", ");
}

function normalizeH2HFixtures(fixtures: RawH2HEntry[] | null | undefined) {
  if (!Array.isArray(fixtures)) return [];

  return fixtures
    .filter(
      (entry): entry is RawH2HEntry =>
        Boolean(entry && typeof entry === "object" && entry.fixture?.id)
    )
    .map((entry) => {
      const home = entry.teams?.home;
      const away = entry.teams?.away;

      return {
        fixtureId: entry.fixture!.id!,
        date: entry.fixture!.date ?? "",
        statusShort: entry.fixture!.status?.short ?? "",
        league: {
          name: entry.league?.name ?? "",
          season: entry.league?.season ?? null,
          round: entry.league?.round ?? null,
        },
        home: {
          id: home?.id ?? 0,
          name: home?.name ?? "",
          logo: home?.logo ?? null,
          winner: home?.winner ?? null,
        },
        away: {
          id: away?.id ?? 0,
          name: away?.name ?? "",
          logo: away?.logo ?? null,
          winner: away?.winner ?? null,
        },
        goals: {
          home: entry.goals?.home ?? null,
          away: entry.goals?.away ?? null,
        },
        score: {
          halftime: {
            home: entry.score?.halftime?.home ?? null,
            away: entry.score?.halftime?.away ?? null,
          },
          fulltime: {
            home: entry.score?.fulltime?.home ?? null,
            away: entry.score?.fulltime?.away ?? null,
          },
        },
      };
    });
}

function normalizeStandingRecord(record: RawStandingRecord | null | undefined) {
  return {
    played: record?.played ?? 0,
    win: record?.win ?? 0,
    draw: record?.draw ?? 0,
    lose: record?.lose ?? 0,
    goals: {
      for: record?.goals?.for ?? 0,
      against: record?.goals?.against ?? 0,
    },
  };
}

function normalizeTeamStanding(entry: RawTeamStanding | null | undefined) {
  if (!entry) return null;

  return {
    rank: entry.rank ?? 0,
    team: {
      id: entry.team?.id ?? 0,
      name: entry.team?.name ?? "",
      logo: entry.team?.logo ?? null,
    },
    points: entry.points ?? 0,
    goalsDiff: entry.goalsDiff ?? 0,
    group: entry.group ?? "",
    form: entry.form ?? null,
    status: entry.status ?? "",
    description: entry.description ?? null,
    all: normalizeStandingRecord(entry.all),
    home: normalizeStandingRecord(entry.home),
    away: normalizeStandingRecord(entry.away),
  };
}

function normalizeFixtureStandings(
  standings: { home?: RawTeamStanding | null; away?: RawTeamStanding | null } | null | undefined
) {
  if (!standings) return null;

  const home = normalizeTeamStanding(standings.home);
  const away = normalizeTeamStanding(standings.away);

  if (!home && !away) return null;

  return { home, away };
}
