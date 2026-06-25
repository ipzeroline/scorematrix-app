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

type RawCheckInRewardDay = CheckInRewardDay & {
  day_name?: unknown;
  bonus_type?: unknown;
  bonus_points?: unknown;
  is_next?: unknown;
  is_completed?: unknown;
};

type RawCheckInRewardsResponse = Partial<CheckInRewardsResponse> & {
  checked_in_today?: unknown;
  can_check_in?: unknown;
  next_day?: unknown;
  today?: {
    day?: unknown;
    dayName?: unknown;
    day_name?: unknown;
  };
  days?: RawCheckInRewardDay[];
};

type CheckInRewardsPayload =
  | RawCheckInRewardsResponse
  | {
      data?: RawCheckInRewardsResponse;
      rewards?: RawCheckInRewardsResponse;
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
    const days = response.days as RawCheckInRewardDay[];
    const checkedInToday = readBoolean(
      response.checkedInToday,
      response.checked_in_today
    ) ?? false;
    const canCheckIn = readBoolean(response.canCheckIn, response.can_check_in);
    const nextDay = readNumber(response.nextDay, response.next_day) ?? 1;

    return {
      checkedInToday,
      canCheckIn: canCheckIn ?? !checkedInToday,
      nextDay,
      today: {
        day: readNumber(response.today?.day, nextDay) ?? 1,
        dayName: readString(response.today?.dayName, response.today?.day_name),
      },
      days: days.map((day) => ({
        day: readNumber(day.day) ?? 0,
        dayName: readString(day.dayName, day.day_name),
        points: readNumber(day.points) ?? 0,
        bonusType: readNullableString(day.bonusType, day.bonus_type),
        bonusPoints: readNumber(day.bonusPoints, day.bonus_points) ?? 0,
        isNext: readBoolean(day.isNext, day.is_next) ?? false,
        isCompleted: readBoolean(day.isCompleted, day.is_completed) ?? false,
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

function readBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes"].includes(normalized)) return true;
      if (["false", "0", "no"].includes(normalized)) return false;
    }
  }

  return undefined;
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }

  return undefined;
}

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
  }

  return "";
}

function readNullableString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return null;
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
