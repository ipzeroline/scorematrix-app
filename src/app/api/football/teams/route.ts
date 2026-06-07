import { getFootballApiUrl } from "@/lib/backend-api-urls";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const response = await fetch(getFootballApiUrl("/teams"), {
    headers: buildHeaders(request),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({
    error: "Invalid soccer teams response",
  }));

  if (!response.ok) {
    return Response.json(
      {
        source: "mongodb",
        data: [],
        teams: [],
        error: "Unable to fetch football teams",
        details: payload,
      },
      { status: response.status }
    );
  }

  return Response.json(normalizeTeamsPayload(payload), {
    headers: NO_CACHE_HEADERS,
  });
}

type TeamGroupPayload = {
  source?: string;
  data?: RawTeamGroup[];
  teams?: NormalizedTeamGroup[];
};

type RawTeamGroup = {
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

type NormalizedTeamGroup = {
  league: {
    id: number;
    name: string;
    country: string;
    countryFlag: string | null;
    logo: string | null;
  };
  teams: {
    id: number;
    name: string;
    code: string | null;
    logo: string | null;
  }[];
};

function normalizeTeamsPayload(payload: TeamGroupPayload) {
  const source = payload.source ?? "mongodb";
  const rawGroups = payload.data ?? payload.teams ?? [];
  const teams = rawGroups.map(normalizeTeamGroup);

  return {
    source,
    data: payload.data ?? teams,
    teams,
  };
}

function normalizeTeamGroup(group: RawTeamGroup | NormalizedTeamGroup): NormalizedTeamGroup {
  return {
    league: {
      id: group.league.id,
      name: group.league.name,
      country: group.league.country,
      countryFlag:
        "country_flag" in group.league
          ? group.league.country_flag ?? group.league.countryFlag ?? null
          : group.league.countryFlag ?? null,
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

function buildHeaders(request: Request): HeadersInit {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const locale =
    request.headers.get("X-Locale") ??
    request.headers.get("X-App-Locale") ??
    request.headers.get("Accept-Language");

  if (locale) {
    headers.set("Accept-Language", locale);
    headers.set("X-Locale", locale);
    headers.set("X-App-Locale", locale);
  }

  return headers;
}
