import { type ApiRequestOptions } from "@/lib/api-client";

export type SoccerTeam = {
  id: number;
  name: string;
  code?: string | null;
  logo: string | null;
};

export type SoccerTeamLeague = {
  id: number;
  name: string;
  country: string;
  countryFlag?: string | null;
  logo: string | null;
};

export type SoccerTeamGroup = {
  league: SoccerTeamLeague;
  teams: SoccerTeam[];
};

export type SoccerTeamsResponse = {
  source: string;
  teams: SoccerTeamGroup[];
};

type RawTeamsResponse = {
  source?: string;
  data?: RawSoccerTeamGroup[];
  teams?: SoccerTeamGroup[];
};

type RawSoccerTeamGroup = {
  league: {
    id: number;
    name: string;
    country: string;
    country_flag?: string | null;
    countryFlag?: string | null;
    logo: string | null;
  };
  teams: {
    id: number;
    name: string;
    code?: string | null;
    logo: string | null;
  }[];
};

export async function getSoccerTeamGroups(
  options?: ApiRequestOptions
): Promise<SoccerTeamsResponse> {
  const response = await fetch("/api/football/teams", {
    headers: buildTeamRequestHeaders(options),
    signal: options?.signal,
    cache: options?.cache,
    next: options?.next,
  });

  const payload = (await response.json()) as RawTeamsResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load teams");
  }

  return {
    source: payload.source ?? "api",
    teams: payload.teams ?? (payload.data ?? []).map(mapRawSoccerTeamGroup),
  };
}

function mapRawSoccerTeamGroup(group: RawSoccerTeamGroup): SoccerTeamGroup {
  return {
    league: {
      id: group.league.id,
      name: group.league.name,
      country: group.league.country,
      countryFlag: group.league.countryFlag ?? group.league.country_flag ?? null,
      logo: group.league.logo,
    },
    teams: group.teams.map((team) => ({
      id: team.id,
      name: team.name,
      code: team.code ?? null,
      logo: team.logo,
    })),
  };
}

function buildTeamRequestHeaders(options?: ApiRequestOptions): HeadersInit {
  const headers = new Headers(options?.headers);
  headers.set("Accept", "application/json");

  if (options?.locale) {
    headers.set("Accept-Language", options.locale);
    headers.set("X-Locale", options.locale);
    headers.set("X-App-Locale", options.locale);
  }

  return headers;
}
