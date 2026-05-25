import { apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";

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

export function createCheckIn(options?: ApiRequestOptions) {
  return apiPostRaw<CheckInResponse>("/checkins", undefined, options);
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
