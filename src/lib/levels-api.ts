import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type LevelConfig = {
  level: number;
  xpRequired: number;
  rewardPoints: number;
  rank: string;
  maxOwnedLeagues: number;
  maxLeagueMembers: number;
};

type LevelsPayload =
  | {
      levels?: unknown[];
      data?: unknown;
    }
  | unknown[];

export async function getLevels(options?: ApiRequestOptions) {
  const response = await apiGetRaw<LevelsPayload>("/levels", options);
  return normalizeLevelsResponse(response);
}

export function normalizeLevelsResponse(response: LevelsPayload): LevelConfig[] {
  const levels = Array.isArray(response)
    ? response
    : Array.isArray(response.levels)
      ? response.levels
      : Array.isArray(response.data)
        ? response.data
        : isRecord(response.data) && Array.isArray(response.data.levels)
          ? response.data.levels
          : [];

  return levels
    .map(normalizeLevel)
    .filter((level): level is LevelConfig => level !== null)
    .sort((left, right) => left.level - right.level);
}

function normalizeLevel(value: unknown): LevelConfig | null {
  if (!isRecord(value)) return null;

  const level = readNumber(value.level);
  if (level === null) return null;

  return {
    level,
    xpRequired: readNumber(value.xpRequired, value.xp_required) ?? 0,
    rewardPoints: readNumber(value.rewardPoints, value.reward_points) ?? 0,
    rank: readString(value.rank) ?? "bronze",
    maxOwnedLeagues:
      readNumber(value.maxOwnedLeagues, value.max_owned_leagues) ?? 0,
    maxLeagueMembers:
      readNumber(value.maxLeagueMembers, value.max_league_members) ?? 0,
  };
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return null;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
