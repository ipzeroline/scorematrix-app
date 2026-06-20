import {
  ApiClientError,
  apiGetRaw,
  type ApiRequestOptions,
} from "@/lib/api-client";
import {
  type AffiliateReferral,
  type AffiliateTier,
} from "@/data/affiliates";

export type ApiReferral = {
  id?: string | number;
  username?: string | null;
  name?: string | null;
  joinedAt?: string | null;
  joined_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  status?: "registered" | "qualified" | "rewarded" | string | null;
  rewardPoints?: number | null;
  reward_points?: number | null;
};

export type ApiReferralTier = {
  count: number;
  reward: string;
};

export type ReferralsResponse = {
  referralCode: string;
  totalClicks: number;
  totalInvited: number;
  qualified: number;
  pendingSignups: number;
  totalEarnings: number;
  totalCreditsEarned: number;
  conversionRate?: number;
  referrals: ApiReferral[];
  shareUrl: string;
  rewardTiers: ApiReferralTier[];
};

type ReferralCodeResponse = {
  referralCode?: string;
  referral_code?: string;
  code?: string;
  shareUrl?: string;
  share_url?: string;
  qrCodeUrl?: string;
  qr_code_url?: string;
};

export type AffiliateProgramView = {
  code: string;
  totalClicks: number;
  totalSignups: number;
  qualifiedSignups: number;
  pendingSignups: number;
  totalPointsEarned: number;
  totalCreditsEarned: number;
  conversionRate: number;
  shareUrl: string;
};

export type AffiliateTierView = AffiliateTier & {
  rewardLabel?: string;
};

export type AffiliateViewData = {
  program: AffiliateProgramView;
  referrals: AffiliateReferral[];
  tiers: AffiliateTierView[];
};

export const EMPTY_REFERRALS_VIEW_DATA: AffiliateViewData = {
  program: {
    code: "",
    totalClicks: 0,
    totalSignups: 0,
    qualifiedSignups: 0,
    pendingSignups: 0,
    totalPointsEarned: 0,
    totalCreditsEarned: 0,
    conversionRate: 0,
    shareUrl: "",
  },
  referrals: [],
  tiers: [],
};

export async function getReferrals(options?: ApiRequestOptions) {
  try {
    return normalizeReferralsResponse(
      await apiGetRaw<unknown>("/referral", options)
    );
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      throw error;
    }
  }

  let referralCodeData: ReferralsResponse | null = null;

  try {
    const codeResponse = await apiGetRaw<unknown>("/referrals/code", options);
    referralCodeData = normalizeReferralCodeResponse(codeResponse);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      throw error;
    }
  }

  try {
    const response = await apiGetRaw<unknown>("/referrals", options);
    const referralsData = normalizeReferralsResponse(response);

    return referralCodeData
      ? {
          ...referralsData,
          referralCode: referralCodeData.referralCode,
          shareUrl: referralCodeData.shareUrl || referralsData.shareUrl,
        }
      : referralsData;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      throw error;
    }
    if (referralCodeData) return referralCodeData;
    throw error;
  }
}

export function normalizeReferralsResponse(response: unknown): ReferralsResponse {
  const record = unwrapRecord(response);
  if (!record) throw new Error("Invalid referrals response");

  const referralCode =
    readString(record.referralCode) ??
    readString(record.referral_code) ??
    readString(record.code);
  const referrals = readArray(record.referrals);
  const rewardTiers =
    readArray(record.rewardTiers) ??
    readArray(record.reward_tiers) ??
    readArray(record.tiers);

  if (referralCode) {
    const totalInvited =
      readNumber(
        record.totalInvited,
        record.total_invited,
        record.totalSignups,
        record.total_signups,
        record.signups
      ) ?? referrals.length;
    const qualified =
      readNumber(
        record.qualified,
        record.qualifiedSignups,
        record.qualified_signups
      ) ?? 0;

    return {
      referralCode,
      totalClicks:
        readNumber(record.totalClicks, record.total_clicks, record.clicks) ?? 0,
      totalInvited,
      qualified,
      pendingSignups:
        readNumber(record.pendingSignups, record.pending_signups) ??
        Math.max(0, totalInvited - qualified),
      totalEarnings:
        readNumber(
          record.totalEarnings,
          record.total_earnings,
          record.totalPointsEarned,
          record.total_points_earned,
          record.points_earned
        ) ?? 0,
      totalCreditsEarned:
        readNumber(
          record.totalCreditsEarned,
          record.total_credits_earned,
          record.credits_earned
        ) ?? 0,
      conversionRate: readNumber(record.conversionRate, record.conversion_rate),
      referrals: referrals as ApiReferral[],
      shareUrl:
        readString(record.shareUrl) ??
        readString(record.share_url) ??
        "",
      rewardTiers: rewardTiers.map(normalizeRewardTier),
    };
  }

  throw new Error("Invalid referrals response");
}

function normalizeReferralCodeResponse(response: unknown): ReferralsResponse {
  const record = unwrapRecord(response) as ReferralCodeResponse | undefined;
  const referralCode =
    record?.referralCode ?? record?.referral_code ?? record?.code ?? "";

  if (!record || !referralCode) {
    throw new Error("Invalid referral code response");
  }

  return {
    referralCode,
    totalClicks: 0,
    totalInvited: 0,
    qualified: 0,
    pendingSignups: 0,
    totalEarnings: 0,
    totalCreditsEarned: 0,
    referrals: [],
    shareUrl: record.shareUrl ?? record.share_url ?? "",
    rewardTiers: [],
  };
}

export function mapApiReferrals(response: ReferralsResponse): AffiliateViewData {
  const totalInvited = Number(response.totalInvited ?? 0);
  const qualified = Number(response.qualified ?? 0);
  const conversionRate =
    response.conversionRate !== undefined
      ? Number(response.conversionRate)
      : totalInvited > 0
        ? Math.round((qualified / totalInvited) * 1000) / 10
        : 0;

  return {
    program: {
      code: response.referralCode || "",
      totalClicks: Number(response.totalClicks ?? 0),
      totalSignups: totalInvited,
      qualifiedSignups: qualified,
      pendingSignups: Number(
        response.pendingSignups ?? Math.max(0, totalInvited - qualified)
      ),
      totalPointsEarned: Number(response.totalEarnings ?? 0),
      totalCreditsEarned: Number(response.totalCreditsEarned ?? 0),
      conversionRate,
      shareUrl:
        response.shareUrl ||
        (response.referralCode ? `/auth/register?ref=${response.referralCode}` : ""),
    },
    referrals: (response.referrals ?? []).map(mapApiReferral),
    tiers: (response.rewardTiers ?? []).map(mapApiReferralTier),
  };
}

function mapApiReferral(referral: ApiReferral, index: number): AffiliateReferral {
  const status = mapReferralStatus(referral.status);

  return {
    id: String(referral.id ?? `referral-${index + 1}`),
    username:
      referral.username?.trim() ||
      referral.name?.trim() ||
      `Friend ${index + 1}`,
    joinedAt:
      referral.joinedAt ||
      referral.joined_at ||
      referral.createdAt ||
      referral.created_at ||
      new Date().toISOString(),
    status,
    rewardPoints: Number(referral.rewardPoints ?? referral.reward_points ?? 0),
  };
}

function mapApiReferralTier(tier: ApiReferralTier): AffiliateTierView {
  return {
    referrals: Number(tier.count ?? 0),
    rewardPoints: extractFirstNumber(tier.reward),
    rewardCredits: 0,
    rewardLabel: tier.reward,
  };
}

function mapReferralStatus(status: ApiReferral["status"]): AffiliateReferral["status"] {
  if (status === "qualified" || status === "rewarded") return status;
  return "registered";
}

function extractFirstNumber(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

function unwrapRecord(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) return undefined;

  const data = value.data;
  if (isRecord(data)) {
    const nested = unwrapRecord(data);
    if (nested) return nested;
  }

  if (hasReferralResponseFields(value)) return value;

  const referrals = value.referrals;
  if (isRecord(referrals)) {
    const nested = unwrapRecord(referrals);
    if (nested) return nested;
  }

  const referral = value.referral;
  if (isRecord(referral)) {
    const nested = unwrapRecord(referral);
    if (nested) return nested;
  }

  return value;
}

function hasReferralResponseFields(value: Record<string, unknown>) {
  return [
    "referralCode",
    "referral_code",
    "totalClicks",
    "total_clicks",
    "totalSignups",
    "total_signups",
    "referrals",
    "rewardTiers",
    "reward_tiers",
  ].some((key) => key in value);
}

function normalizeRewardTier(value: unknown): ApiReferralTier {
  if (!isRecord(value)) return { count: 0, reward: "" };

  return {
    count: readNumber(value.count, value.referrals, value.referral_count) ?? 0,
    reward:
      readString(value.reward) ??
      readString(value.rewardLabel) ??
      readString(value.reward_label) ??
      [
        readNumber(value.rewardPoints, value.reward_points),
        readNumber(value.rewardCredits, value.reward_credits),
      ]
        .filter((item) => item !== undefined)
        .join(" + "),
  };
}

function readArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return undefined;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
