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
  const apiPeriod = period === "seasonal" ? "season" : period;
  const response = await apiGetRaw<LeaderboardApiPayload>(
    `/leaderboard?period=${encodeURIComponent(apiPeriod)}`,
    {
      cache: "no-store",
      ...options,
    }
  );
  return normalizeLeaderboardResponse(response, period);
}

export function normalizeLeaderboardResponse(
  response: LeaderboardApiPayload,
  period?: LeaderboardPeriodQuery
): LeaderboardResponse {
  return normalizeLeaderboardPayload(response, period) ?? EMPTY_LEADERBOARD_RESPONSE;
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

function normalizeLeaderboardPayload(
  payload: unknown,
  requestedPeriod?: LeaderboardPeriodQuery
): LeaderboardResponse | null {
  if (Array.isArray(payload)) {
    const periodPayload = pickPeriodPayloadFromArray(payload, requestedPeriod);
    if (periodPayload) return normalizeLeaderboardPayload(periodPayload, requestedPeriod);

    return {
      ...EMPTY_LEADERBOARD_RESPONSE,
      entries: payload.map(normalizeApiLeaderboardEntry),
    };
  }

  if (!isRecord(payload)) return null;

  const periodPayload = pickPeriodPayload(payload, requestedPeriod);
  if (periodPayload && periodPayload !== payload) {
    const normalized = normalizeLeaderboardPayload(periodPayload, requestedPeriod);
    if (normalized) {
      return {
        ...normalized,
        rewards:
          normalized.rewards.length > 0
            ? normalized.rewards
            : normalizeLeaderboardRewardsForPeriod(payload.rewards, requestedPeriod),
      };
    }
  }

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
    normalizeLeaderboardPayload(payload.data, requestedPeriod) ??
    normalizeLeaderboardPayload(payload.leaderboard, requestedPeriod) ??
    normalizeLeaderboardPayload(payload.leaderboards, requestedPeriod) ??
    normalizeLeaderboardPayload(payload.payload, requestedPeriod) ??
    normalizeLeaderboardPayload(payload.result, requestedPeriod)
  );
}

function pickPeriodPayload(
  payload: Record<string, unknown>,
  requestedPeriod?: LeaderboardPeriodQuery
) {
  if (!requestedPeriod) return null;

  const aliases = periodAliases(requestedPeriod);
  for (const alias of aliases) {
    if (payload[alias]) return payload[alias];
  }

  const boards = payload.leaderboards ?? payload.leaderboard ?? payload.rankings;
  if (isRecord(boards)) {
    for (const alias of aliases) {
      if (boards[alias]) return boards[alias];
    }
  }

  const periods = payload.periods ?? payload.data;
  if (isRecord(periods)) {
    for (const alias of aliases) {
      if (periods[alias]) return periods[alias];
    }
  }

  return null;
}

function pickPeriodPayloadFromArray(
  payload: unknown[],
  requestedPeriod?: LeaderboardPeriodQuery
) {
  if (!requestedPeriod) return null;
  const aliases = periodAliases(requestedPeriod);

  return (
    payload.find((item) => {
      if (!isRecord(item)) return false;
      const itemPeriod = getPeriodKey(item.period ?? item.type ?? item.periodType ?? item.period_type);
      return itemPeriod ? aliases.includes(itemPeriod) : false;
    }) ?? null
  );
}

function normalizeApiLeaderboardEntry(entry: unknown): ApiLeaderboardEntry {
  const value = isRecord(entry) ? entry : {};
  const user = firstRecord(value.user, value.member, value.profile, value.player);
  const userId = value.userId ?? value.user_id ?? value.id ?? user?.userId ?? user?.user_id ?? user?.id ?? "";

  return {
    rank: toNumber(value.rank, 0),
    userId: String(userId),
    username: toNullableString(
      value.username ??
        value.displayName ??
        value.display_name ??
        value.name ??
        user?.username ??
        user?.displayName ??
        user?.display_name ??
        user?.name
    ),
    avatarUrl: pickAvatarUrl(value, user),
    points: toNumber(value.points ?? value.score, 0),
    accuracy: toNumber(value.accuracy, 0),
    streak: toNumber(value.streak ?? value.current_streak, 0),
    level: toNumber(value.level, 1),
  };
}

function pickAvatarUrl(
  value: Record<string, unknown>,
  nested?: Record<string, unknown>
) {
  return toNullableString(
    value.avatarUrl ??
      value.avatar_url ??
      value.avatar ??
      value.imageUrl ??
      value.image_url ??
      value.profileImageUrl ??
      value.profile_image_url ??
      value.photoUrl ??
      value.photo_url ??
      value.picture ??
      value.photo ??
      nested?.avatarUrl ??
      nested?.avatar_url ??
      nested?.avatar ??
      nested?.imageUrl ??
      nested?.image_url ??
      nested?.profileImageUrl ??
      nested?.profile_image_url ??
      nested?.photoUrl ??
      nested?.photo_url ??
      nested?.picture ??
      nested?.photo
  );
}

function firstRecord(...values: unknown[]) {
  return values.find(isRecord);
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
  return Array.isArray(rewards)
    ? rewards.map(normalizeLeaderboardReward).filter((reward): reward is LeaderboardReward => reward !== null)
    : [];
}

function normalizeLeaderboardRewardsForPeriod(
  rewards: unknown,
  requestedPeriod?: LeaderboardPeriodQuery
) {
  if (Array.isArray(rewards)) return normalizeLeaderboardRewards(rewards);
  if (!isRecord(rewards) || !requestedPeriod) return [];

  for (const alias of periodAliases(requestedPeriod)) {
    const periodRewards = rewards[alias];
    if (Array.isArray(periodRewards)) return normalizeLeaderboardRewards(periodRewards);
  }

  return [];
}

function periodAliases(period: LeaderboardPeriodQuery) {
  if (period === "seasonal") return ["seasonal", "season"];
  return [period];
}

function getPeriodKey(value: unknown) {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (isRecord(value)) {
    return getPeriodKey(value.key ?? value.type ?? value.name ?? value.period);
  }
  return "";
}

function normalizeLeaderboardReward(reward: unknown): LeaderboardReward | null {
  if (!isRecord(reward)) return null;

  const rewardValue = isRecord(reward.reward) ? reward.reward : reward;
  const rankRange = normalizeRankRange(reward);

  return {
    rankRange,
    reward: {
      freePoints: toNumber(
        rewardValue.freePoints ??
          rewardValue.free_points ??
          rewardValue.points ??
          rewardValue.point_reward,
        0
      ),
      premiumCredits: optionalNumber(
        rewardValue.premiumCredits ??
          rewardValue.premium_credits ??
          rewardValue.credits ??
          rewardValue.credit_reward
      ),
      badge: toNullableString(rewardValue.badge ?? rewardValue.badgeName ?? rewardValue.badge_name) ?? undefined,
      streakShield: optionalNumber(rewardValue.streakShield ?? rewardValue.streak_shield),
    },
  };
}

function normalizeRankRange(reward: Record<string, unknown>): [number, number] {
  const rawRange = reward.rankRange ?? reward.rank_range;

  if (Array.isArray(rawRange)) {
    const start = toNumber(rawRange[0], 1);
    const end = toNumber(rawRange[1] ?? rawRange[0], start);
    return [start, end];
  }

  if (isRecord(rawRange)) {
    const start = toNumber(rawRange.start ?? rawRange.from ?? rawRange.min, 1);
    const end = toNumber(rawRange.end ?? rawRange.to ?? rawRange.max, start);
    return [start, end];
  }

  const rank = reward.rank ?? reward.position;
  const start = toNumber(reward.rankFrom ?? reward.rank_from ?? reward.from ?? reward.minRank ?? reward.min_rank ?? rank, 1);
  const end = toNumber(reward.rankTo ?? reward.rank_to ?? reward.to ?? reward.maxRank ?? reward.max_rank ?? rank, start);

  return [start, end];
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

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function fallbackUsername(userId: string) {
  const id = String(userId ?? "");
  if (!id) return "Player";
  return `User ${id.length > 8 ? id.slice(0, 8) : id}`;
}
