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
  requirementType?: MissionRequirementType;
  requirement_type?: MissionRequirementType;
  requirementCount?: number;
  requirement_count?: number;
  rewardPoints?: number;
  reward_points?: number;
  rewardXp?: number;
  reward_xp?: number;
  rewardCredits?: number;
  reward_credits?: number;
  icon: string;
  userProgress?: {
    progress?: number;
    current?: number;
    required?: number;
    completed?: boolean;
    claimed?: boolean;
  } | null;
  user_progress?: {
    progress?: number;
    current?: number;
    required?: number;
    completed?: boolean;
    claimed?: boolean;
  } | null;
  progress?: number | {
    progress?: number;
    current?: number;
    required?: number;
  };
  completed?: boolean;
  claimed?: boolean;
  startsAt?: string;
  starts_at?: string;
  startAt?: string;
  start_at?: string;
  availableFrom?: string;
  available_from?: string;
  resetAt?: string;
  reset_at?: string;
  endAt?: string;
  end_at?: string;
  expiresAt?: string;
  expires_at?: string;
};

export type MissionCurrentStats = {
  missionStreak: number;
  todayMissionPoints: number;
  todayCompleted: number;
  level: number;
  xp: number;
};

export type MissionsResponse = {
  daily: ApiMission[];
  weekly: ApiMission[];
  special: ApiMission[];
  periods: MissionPeriodWindows;
  currentStats: MissionCurrentStats;
};

export type MissionPeriodKey = "daily" | "weekly" | "special";

export type MissionPeriodWindow = {
  start: string;
  end: string;
  resetAt: string;
};

export type MissionPeriodWindows = Record<MissionPeriodKey, MissionPeriodWindow | null>;

export const DEFAULT_MISSION_CURRENT_STATS: MissionCurrentStats = {
  missionStreak: 0,
  todayMissionPoints: 0,
  todayCompleted: 0,
  level: 1,
  xp: 0,
};

export const DEFAULT_MISSIONS_RESPONSE: MissionsResponse = {
  currentStats: { ...DEFAULT_MISSION_CURRENT_STATS },
  periods: {
    daily: null,
    weekly: null,
    special: null,
  },
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

type ApiCurrentStats = {
  missionStreak?: number;
  mission_streak?: number;
  todayMissionPoints?: number;
  today_mission_points?: number;
  todayCompleted?: number;
  today_completed?: number;
  level?: number;
  xp?: number;
};

type ApiMissionsResponse = {
  daily?: ApiMission[];
  weekly?: ApiMission[];
  special?: ApiMission[];
  periods?: unknown;
  period?: unknown;
  windows?: unknown;
  resetWindows?: unknown;
  reset_windows?: unknown;
  dailyPeriod?: unknown;
  daily_period?: unknown;
  weeklyPeriod?: unknown;
  weekly_period?: unknown;
  specialPeriod?: unknown;
  special_period?: unknown;
  currentStats?: ApiCurrentStats;
  current_stats?: ApiCurrentStats;
};

type MissionsApiPayload =
  | ApiMissionsResponse
  | {
      data?: ApiMissionsResponse;
      missions?: ApiMissionsResponse;
    };

export async function getMissions(options?: ApiRequestOptions) {
  const response = await apiGetRaw<MissionsApiPayload>("/missions", options);
  return normalizeMissionsResponse(response);
}

export async function claimMission(missionId: string | number, options?: ApiRequestOptions) {
  const response = await apiPostRaw<unknown>(
    `/missions/${encodeURIComponent(String(missionId))}/claim`,
    {},
    options
  );
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
      periods: normalizeMissionPeriods(response),
      currentStats: normalizeCurrentStats(
        response.currentStats ?? response.current_stats
      ),
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

function normalizeCurrentStats(stats?: ApiCurrentStats): MissionCurrentStats {
  if (!stats) {
    return { ...DEFAULT_MISSION_CURRENT_STATS };
  }

  return {
    missionStreak: toNumber(
      stats.missionStreak ?? stats.mission_streak,
      DEFAULT_MISSION_CURRENT_STATS.missionStreak
    ),
    todayMissionPoints: toNumber(
      stats.todayMissionPoints ?? stats.today_mission_points,
      DEFAULT_MISSION_CURRENT_STATS.todayMissionPoints
    ),
    todayCompleted: toNumber(
      stats.todayCompleted ?? stats.today_completed,
      DEFAULT_MISSION_CURRENT_STATS.todayCompleted
    ),
    level: toNumber(stats.level, DEFAULT_MISSION_CURRENT_STATS.level),
    xp: toNumber(stats.xp, DEFAULT_MISSION_CURRENT_STATS.xp),
  };
}

export function mapApiMission(
  mission: ApiMission,
  type: MissionType
): Mission {
  const userProgress = mission.userProgress ?? mission.user_progress ?? null;
  const progressSource = isRecord(mission.progress) ? mission.progress : null;
  const progress = toNumber(
    userProgress?.progress ??
      userProgress?.current ??
      progressSource?.progress ??
      progressSource?.current ??
      mission.progress,
    0
  );
  const target = toNumber(
    userProgress?.required ??
      progressSource?.required ??
      mission.requirementCount ??
      mission.requirement_count,
    0
  );
  const completed =
    Boolean(userProgress?.completed ?? mission.completed) ||
    (target > 0 && progress >= target);

  return {
    id: String(mission.id),
    title: mission.title,
    description: mission.description,
    type,
    category: mapRequirementCategory(
      mission.requirementType ?? mission.requirement_type ?? "predictions"
    ),
    icon: mission.icon,
    target,
    progress,
    rewardPoints: toNumber(mission.rewardPoints ?? mission.reward_points, 0),
    rewardXP: toNumber(mission.rewardXp ?? mission.reward_xp, 0),
    rewardCredits: toPositiveNumber(
      mission.rewardCredits ?? mission.reward_credits
    ),
    completed,
    claimed: Boolean(userProgress?.claimed ?? mission.claimed),
    startsAt:
      mission.startsAt ??
      mission.starts_at ??
      mission.startAt ??
      mission.start_at ??
      mission.availableFrom ??
      mission.available_from,
    expiresAt:
      mission.expiresAt ??
      mission.expires_at ??
      mission.endAt ??
      mission.end_at ??
      mission.resetAt ??
      mission.reset_at ??
      "",
    resetAt:
      mission.resetAt ??
      mission.reset_at ??
      mission.expiresAt ??
      mission.expires_at ??
      mission.endAt ??
      mission.end_at ??
      "",
  };
}

function normalizeMissionPeriods(
  response: ApiMissionsResponse
): MissionPeriodWindows {
  return {
    daily: normalizeMissionPeriodWindow(
      pickPeriodWindow(response, "daily"),
      response.daily
    ),
    weekly: normalizeMissionPeriodWindow(
      pickPeriodWindow(response, "weekly"),
      response.weekly
    ),
    special: normalizeMissionPeriodWindow(
      pickPeriodWindow(response, "special"),
      response.special
    ),
  };
}

function pickPeriodWindow(response: ApiMissionsResponse, key: MissionPeriodKey) {
  const direct =
    key === "daily"
      ? response.dailyPeriod ?? response.daily_period
      : key === "weekly"
      ? response.weeklyPeriod ?? response.weekly_period
      : response.specialPeriod ?? response.special_period;

  if (direct) return direct;

  for (const source of [
    response.periods,
    response.period,
    response.windows,
    response.resetWindows,
    response.reset_windows,
  ]) {
    if (!isRecord(source)) continue;
    const value =
      source[key] ??
      source[`${key}Period`] ??
      source[`${key}_period`] ??
      source[`${key}Window`] ??
      source[`${key}_window`];
    if (value) return value;
  }

  return null;
}

function normalizeMissionPeriodWindow(
  window: unknown,
  missions?: ApiMission[]
): MissionPeriodWindow | null {
  const value = isRecord(window) ? window : {};
  const start = toStringValue(
    value.start ??
      value.startsAt ??
      value.starts_at ??
      value.startAt ??
      value.start_at ??
      value.from ??
      value.availableFrom ??
      value.available_from
  );
  const end = toStringValue(
    value.end ??
      value.endsAt ??
      value.ends_at ??
      value.endAt ??
      value.end_at ??
      value.to ??
      value.expiresAt ??
      value.expires_at ??
      value.resetAt ??
      value.reset_at
  );
  const resetAt = toStringValue(
    value.resetAt ??
      value.reset_at ??
      value.nextResetAt ??
      value.next_reset_at ??
      end
  );

  if (start || end || resetAt) {
    return {
      start,
      end: end || resetAt,
      resetAt: resetAt || end,
    };
  }

  const missionWindow = normalizeWindowFromMissions(missions);
  return missionWindow;
}

function normalizeWindowFromMissions(
  missions?: ApiMission[]
): MissionPeriodWindow | null {
  if (!Array.isArray(missions) || missions.length === 0) return null;

  const starts = missions
    .map((mission) =>
      toStringValue(
        mission.startsAt ??
          mission.starts_at ??
          mission.startAt ??
          mission.start_at ??
          mission.availableFrom ??
          mission.available_from
      )
    )
    .filter(Boolean);
  const ends = missions
    .map((mission) =>
      toStringValue(
        mission.resetAt ??
          mission.reset_at ??
          mission.expiresAt ??
          mission.expires_at ??
          mission.endAt ??
          mission.end_at
      )
    )
    .filter(Boolean);

  const start = starts[0] ?? "";
  const end = ends[0] ?? "";
  if (!start && !end) return null;

  return {
    start,
    end,
    resetAt: end,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toPositiveNumber(value: unknown) {
  const numberValue = toNumber(value, 0);
  return numberValue > 0 ? numberValue : undefined;
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
