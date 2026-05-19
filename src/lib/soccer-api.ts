import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type SoccerTeam = {
  id: number;
  name: string;
  logo: string | null;
};

export type SoccerTeamLeague = {
  id: number;
  name: string;
  country: string;
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

export function getSoccerTeamGroups(options?: ApiRequestOptions) {
  return apiGetRaw<SoccerTeamsResponse>("/soccer/teams", options);
}
