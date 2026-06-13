import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";
import type { LeaderboardEntry, LeaderboardReward } from "@/types/leaderboard";

export type LeaderboardPeriodQuery = "daily" | "weekly" | "seasonal";

export type ApiLeaderboardEntry = {
  rank: number;
  userId: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  accuracy: number;
  streak: number;
  level: number;
};

export type LeaderboardResponse = {
  period: {
    start: string;
    end: string;
  };
  entries: ApiLeaderboardEntry[];
  userEntry: ApiLeaderboardEntry | null;
  rewards: LeaderboardReward[];
};

type LeaderboardApiPayload =
  | LeaderboardResponse
  | {
      data?: unknown;
      leaderboard?: unknown;
      payload?: unknown;
      result?: unknown;
    };

export const EMPTY_LEADERBOARD_RESPONSE: LeaderboardResponse = {
  period: {
    start: "",
    end: "",
  },
  entries: [],
  userEntry: null,
  rewards: [],
};

export async function getLeaderboard(
  period: LeaderboardPeriodQuery,
  options?: ApiRequestOptions
) {
  const response = await apiGetRaw<LeaderboardApiPayload>(
    `/leaderboard?period=${encodeURIComponent(period)}`,
    {
      cache: "no-store",
      ...options,
    }
  );
  return normalizeLeaderboardResponse(response);
}

export function normalizeLeaderboardResponse(
  response: LeaderboardApiPayload
): LeaderboardResponse {
  return normalizeLeaderboardPayload(response) ?? EMPTY_LEADERBOARD_RESPONSE;
}

export function mapApiLeaderboardEntry(entry: ApiLeaderboardEntry): LeaderboardEntry {
  return {
    rank: Number(entry.rank ?? 0),
    userId: String(entry.userId ?? ""),
    username: entry.username?.trim() || fallbackUsername(entry.userId),
    avatar: entry.avatarUrl,
    points: Number(entry.points ?? 0),
    accuracy: Number(entry.accuracy ?? 0),
    streak: Number(entry.streak ?? 0),
    level: Number(entry.level ?? 1),
  };
}

function normalizeLeaderboardPayload(payload: unknown): LeaderboardResponse | null {
  if (Array.isArray(payload)) {
    return {
      ...EMPTY_LEADERBOARD_RESPONSE,
      entries: payload.map(normalizeApiLeaderboardEntry),
    };
  }

  if (!isRecord(payload)) return null;

  const entries = payload.entries ?? payload.rankings ?? payload.users;

  if (Array.isArray(entries)) {
    return {
      period: normalizePeriod(payload.period),
      entries: entries.map(normalizeApiLeaderboardEntry),
      userEntry: normalizeNullableLeaderboardEntry(
        payload.userEntry ?? payload.user_entry ?? payload.currentUser
      ),
      rewards: normalizeLeaderboardRewards(payload.rewards),
    };
  }

  return (
    normalizeLeaderboardPayload(payload.data) ??
    normalizeLeaderboardPayload(payload.leaderboard) ??
    normalizeLeaderboardPayload(payload.payload) ??
    normalizeLeaderboardPayload(payload.result)
  );
}

function normalizeApiLeaderboardEntry(entry: unknown): ApiLeaderboardEntry {
  const value = isRecord(entry) ? entry : {};
  const userId = value.userId ?? value.user_id ?? value.id ?? "";

  return {
    rank: toNumber(value.rank, 0),
    userId: String(userId),
    username: toNullableString(
      value.username ?? value.displayName ?? value.display_name ?? value.name
    ),
    avatarUrl: toNullableString(value.avatarUrl ?? value.avatar_url ?? value.avatar),
    points: toNumber(value.points ?? value.score, 0),
    accuracy: toNumber(value.accuracy, 0),
    streak: toNumber(value.streak ?? value.current_streak, 0),
    level: toNumber(value.level, 1),
  };
}

function normalizeNullableLeaderboardEntry(entry: unknown) {
  if (!entry) return null;
  return normalizeApiLeaderboardEntry(entry);
}

function normalizePeriod(period: unknown) {
  const value = isRecord(period) ? period : {};

  return {
    start: toStringValue(value.start ?? value.startDate ?? value.start_date),
    end: toStringValue(value.end ?? value.endDate ?? value.end_date),
  };
}

function normalizeLeaderboardRewards(rewards: unknown): LeaderboardReward[] {
  return Array.isArray(rewards) ? (rewards as LeaderboardReward[]) : [];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function fallbackUsername(userId: string) {
  const id = String(userId ?? "");
  if (!id) return "Player";
  return `User ${id.length > 8 ? id.slice(0, 8) : id}`;
}
