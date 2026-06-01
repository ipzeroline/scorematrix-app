import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";

export type CheckInResponse = {
  success?: boolean;
  message?: string;
  pointsEarned?: number;
  rewardPoints?: number;
  freePoints?: number;
  streak?: number;
  currentStreak?: number;
  bonus?: string | null;
  data?: {
    pointsEarned?: number;
    rewardPoints?: number;
    freePoints?: number;
    streak?: number;
    currentStreak?: number;
    bonus?: string | null;
  };
};

export type CheckInRewardDay = {
  day: number;
  dayName: string;
  points: number;
  bonusType: string | null;
  bonusPoints: number;
  isNext: boolean;
  isCompleted: boolean;
};

export type CheckInRewardsResponse = {
  checkedInToday: boolean;
  canCheckIn: boolean;
  nextDay: number;
  today: {
    day: number;
    dayName: string;
  };
  days: CheckInRewardDay[];
};

type CheckInRewardsPayload =
  | CheckInRewardsResponse
  | {
      data?: CheckInRewardsResponse;
      rewards?: CheckInRewardsResponse;
    };

export function createCheckIn(options?: ApiRequestOptions) {
  return apiPostRaw<CheckInResponse>("/checkins", undefined, options);
}

export async function getCheckInRewards(options?: ApiRequestOptions) {
  const response = await apiGetRaw<CheckInRewardsPayload>(
    "/checkins/rewards",
    options
  );
  return normalizeCheckInRewards(response);
}

function normalizeCheckInRewards(
  response: CheckInRewardsPayload
): CheckInRewardsResponse {
  if ("days" in response && Array.isArray(response.days)) {
    return {
      checkedInToday: Boolean(response.checkedInToday),
      canCheckIn: Boolean(response.canCheckIn),
      nextDay: Number(response.nextDay ?? 1),
      today: {
        day: Number(response.today?.day ?? response.nextDay ?? 1),
        dayName: String(response.today?.dayName ?? ""),
      },
      days: response.days.map((day) => ({
        day: Number(day.day ?? 0),
        dayName: String(day.dayName ?? ""),
        points: Number(day.points ?? 0),
        bonusType: day.bonusType ?? null,
        bonusPoints: Number(day.bonusPoints ?? 0),
        isNext: Boolean(day.isNext),
        isCompleted: Boolean(day.isCompleted),
      })),
    };
  }

  if ("data" in response && response.data) {
    return normalizeCheckInRewards(response.data);
  }

  if ("rewards" in response && response.rewards) {
    return normalizeCheckInRewards(response.rewards);
  }

  return {
    checkedInToday: false,
    canCheckIn: false,
    nextDay: 1,
    today: { day: 1, dayName: "" },
    days: [],
  };
}

export function getCheckInPoints(response: CheckInResponse) {
  return Number(
    response.pointsEarned ??
      response.rewardPoints ??
      response.freePoints ??
      response.data?.pointsEarned ??
      response.data?.rewardPoints ??
      response.data?.freePoints ??
      0
  );
}

export function getCheckInBonus(response: CheckInResponse) {
  return response.bonus ?? response.data?.bonus ?? null;
}
