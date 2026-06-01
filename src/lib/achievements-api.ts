import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type ApiAchievement = {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: string;
  badgeIconUrl: string | null;
  rewardPoints: number;
  rewardXp: number;
  progress: {
    current: number;
    required: number;
  };
};

export type AchievementsResponse = {
  unlocked: ApiAchievement[];
  locked: ApiAchievement[];
  hidden: ApiAchievement[];
  totalUnlocked: number;
  totalAvailable: number;
};

type AchievementsPayload =
  | AchievementsResponse
  | {
      data?: AchievementsResponse;
      achievements?: AchievementsResponse;
    };

export async function getAchievements(options?: ApiRequestOptions) {
  const response = await apiGetRaw<AchievementsPayload>(
    "/achievements",
    options
  );
  return normalizeAchievementsResponse(response);
}

function normalizeAchievementsResponse(
  response: AchievementsPayload
): AchievementsResponse {
  if (
    "unlocked" in response &&
    Array.isArray(response.unlocked) &&
    Array.isArray(response.locked)
  ) {
    return {
      unlocked: response.unlocked.map(normalizeAchievement),
      locked: response.locked.map(normalizeAchievement),
      hidden: Array.isArray(response.hidden)
        ? response.hidden.map(normalizeAchievement)
        : [],
      totalUnlocked: Number(response.totalUnlocked ?? response.unlocked.length),
      totalAvailable: Number(
        response.totalAvailable ??
          response.unlocked.length + response.locked.length
      ),
    };
  }

  if ("data" in response && response.data) {
    return normalizeAchievementsResponse(response.data);
  }

  if ("achievements" in response && response.achievements) {
    return normalizeAchievementsResponse(response.achievements);
  }

  return {
    unlocked: [],
    locked: [],
    hidden: [],
    totalUnlocked: 0,
    totalAvailable: 0,
  };
}

function normalizeAchievement(achievement: ApiAchievement): ApiAchievement {
  const current = Number(achievement.progress?.current ?? 0);
  const required = Number(achievement.progress?.required ?? 0);

  return {
    id: String(achievement.id ?? ""),
    name: String(achievement.name ?? ""),
    description: String(achievement.description ?? ""),
    category: String(achievement.category ?? ""),
    tier: String(achievement.tier ?? ""),
    badgeIconUrl: achievement.badgeIconUrl ?? null,
    rewardPoints: Number(achievement.rewardPoints ?? 0),
    rewardXp: Number(achievement.rewardXp ?? 0),
    progress: {
      current: Number.isFinite(current) ? current : 0,
      required: Number.isFinite(required) ? required : 0,
    },
  };
}
