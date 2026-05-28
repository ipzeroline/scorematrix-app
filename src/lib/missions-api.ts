import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";
import { MissionType } from "@/types/common";
import type { Mission } from "@/types/mission";

export type MissionRequirementType =
  | "predictions"
  | "streak"
  | "accuracy"
  | "checkins"
  | "referrals"
  | string;

export type ApiMission = {
  id: string;
  title: string;
  description: string;
  requirementType: MissionRequirementType;
  requirementCount: number;
  rewardPoints: number;
  rewardXp: number;
  rewardCredits: number;
  icon: string;
  userProgress?: {
    progress?: number;
    completed?: boolean;
    claimed?: boolean;
  } | null;
  expiresAt: string;
};

export type MissionsResponse = {
  daily: ApiMission[];
  weekly: ApiMission[];
  special: ApiMission[];
};

export const DEFAULT_MISSIONS_RESPONSE: MissionsResponse = {
  daily: [
    {
      id: "bold-win",
      title: "เสี่ยงแม่น",
      description: "ทายแบบ bold แล้วถูก",
      requirementType: "predictions",
      requirementCount: 1,
      rewardPoints: 80,
      rewardXp: 15,
      rewardCredits: 0,
      icon: "dice-5",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "perfect-3",
      title: "ทายแม่น 3 คู่รวด",
      description: "ทายผลถูกต้อง 3 คู่ติดต่อกัน",
      requirementType: "streak",
      requirementCount: 3,
      rewardPoints: 100,
      rewardXp: 20,
      rewardCredits: 5,
      icon: "flame",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "predict-3",
      title: "ทายผล 3 คู่",
      description: "ทำนายผลบอล 3 คู่ในวันนี้",
      requirementType: "predictions",
      requirementCount: 3,
      rewardPoints: 30,
      rewardXp: 5,
      rewardCredits: 0,
      icon: "target",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "predict-5",
      title: "ทายผล 5 คู่",
      description: "ทำนายผลบอล 5 คู่ในวันนี้",
      requirementType: "predictions",
      requirementCount: 5,
      rewardPoints: 50,
      rewardXp: 10,
      rewardCredits: 0,
      icon: "zap",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
  ],
  weekly: [
    {
      id: "weekly-10",
      title: "ทายครบ 10 คู่",
      description: "ทำนายผลบอล 10 คู่ในสัปดาห์นี้",
      requirementType: "predictions",
      requirementCount: 10,
      rewardPoints: 100,
      rewardXp: 30,
      rewardCredits: 10,
      icon: "calendar-check",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "weekly-25",
      title: "ทายครบ 25 คู่",
      description: "ทำนายผลบอล 25 คู่ในสัปดาห์นี้",
      requirementType: "predictions",
      requirementCount: 25,
      rewardPoints: 200,
      rewardXp: 50,
      rewardCredits: 20,
      icon: "trophy",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "weekly-acc-70",
      title: "ความแม่นขั้นเทพ",
      description: "ความแม่นยำ 70%+ ในสัปดาห์นี้",
      requirementType: "accuracy",
      requirementCount: 70,
      rewardPoints: 300,
      rewardXp: 60,
      rewardCredits: 30,
      icon: "target",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
  ],
  special: [
    {
      id: "checkin-7",
      title: "เช็คอิน 7 วัน",
      description: "เช็คอินติดต่อกัน 7 วัน",
      requirementType: "checkins",
      requirementCount: 7,
      rewardPoints: 150,
      rewardXp: 40,
      rewardCredits: 0,
      icon: "calendar",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "pred-100",
      title: "ครบ 100 คำทำนาย",
      description: "ทำนายผลบอลสะสมครบ 100 ครั้ง",
      requirementType: "predictions",
      requirementCount: 100,
      rewardPoints: 500,
      rewardXp: 100,
      rewardCredits: 50,
      icon: "award",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
    {
      id: "referral-3",
      title: "ชวนเพื่อน 3 คน",
      description: "ชวนเพื่อนสำเร็จ 3 คน",
      requirementType: "referrals",
      requirementCount: 3,
      rewardPoints: 200,
      rewardXp: 30,
      rewardCredits: 50,
      icon: "users",
      userProgress: { progress: 0, completed: false, claimed: false },
      expiresAt: "2026-05-30 16:45:56",
    },
  ],
};

type MissionsApiPayload =
  | MissionsResponse
  | {
      data?: MissionsResponse;
      missions?: MissionsResponse;
    };

export async function getMissions(options?: ApiRequestOptions) {
  const response = await apiGetRaw<MissionsApiPayload>("/missions", options);
  return normalizeMissionsResponse(response);
}

export async function claimMission(missionId: string | number, options?: ApiRequestOptions) {
  const response = await apiPostRaw<any>(`/missions/${encodeURIComponent(String(missionId))}/claim`, {}, options);
  return response;
}

export function normalizeMissionsResponse(
  response: MissionsApiPayload
): MissionsResponse {
  if ("daily" in response && Array.isArray(response.daily)) {
    return {
      daily: response.daily,
      weekly: Array.isArray(response.weekly) ? response.weekly : [],
      special: Array.isArray(response.special) ? response.special : [],
    };
  }

  if ("data" in response && response.data?.daily) {
    return normalizeMissionsResponse(response.data);
  }

  if ("missions" in response && response.missions?.daily) {
    return normalizeMissionsResponse(response.missions);
  }

  return DEFAULT_MISSIONS_RESPONSE;
}

export function mapApiMission(
  mission: ApiMission,
  type: MissionType
): Mission {
  const progress = Number(mission.userProgress?.progress ?? 0);
  const target = Number(mission.requirementCount ?? 0);
  const completed = Boolean(mission.userProgress?.completed) || progress >= target;

  return {
    id: mission.id,
    title: mission.title,
    description: mission.description,
    type,
    category: mapRequirementCategory(mission.requirementType),
    icon: mission.icon,
    target,
    progress,
    rewardPoints: Number(mission.rewardPoints ?? 0),
    rewardXP: Number(mission.rewardXp ?? 0),
    rewardCredits: Number(mission.rewardCredits ?? 0),
    completed,
    claimed: Boolean(mission.userProgress?.claimed),
    expiresAt: mission.expiresAt,
    resetAt: mission.expiresAt,
  };
}

function mapRequirementCategory(
  requirementType: MissionRequirementType
): Mission["category"] {
  switch (requirementType) {
    case "accuracy":
      return "accuracy";
    case "streak":
      return "streak";
    case "referrals":
      return "social";
    case "checkins":
      return "daily_login";
    case "predictions":
    default:
      return "predict";
  }
}
