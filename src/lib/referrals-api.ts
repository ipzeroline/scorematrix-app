import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";
import {
  affiliateProgram,
  affiliateReferrals,
  affiliateTiers,
  type AffiliateReferral,
  type AffiliateTier,
} from "@/data/affiliates";

export type ApiReferral = {
  id?: string | number;
  username?: string | null;
  name?: string | null;
  joinedAt?: string | null;
  createdAt?: string | null;
  status?: "registered" | "qualified" | "rewarded" | string | null;
  rewardPoints?: number | null;
};

export type ApiReferralTier = {
  count: number;
  reward: string;
};

export type ReferralsResponse = {
  referralCode: string;
  totalInvited: number;
  qualified: number;
  totalEarnings: number;
  referrals: ApiReferral[];
  shareUrl: string;
  rewardTiers: ApiReferralTier[];
};

type ReferralsApiPayload =
  | ReferralsResponse
  | {
      data?: ReferralsResponse;
      referrals?: ReferralsResponse;
    };

export type AffiliateProgramView = typeof affiliateProgram & {
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

export const DEFAULT_REFERRALS_VIEW_DATA: AffiliateViewData = {
  program: {
    ...affiliateProgram,
    shareUrl: `/auth/register?ref=${affiliateProgram.code}`,
  },
  referrals: affiliateReferrals,
  tiers: affiliateTiers,
};

export async function getReferrals(options?: ApiRequestOptions) {
  const response = await apiGetRaw<ReferralsApiPayload>("/referrals", options);
  return normalizeReferralsResponse(response);
}

export function normalizeReferralsResponse(response: ReferralsApiPayload): ReferralsResponse {
  if ("referralCode" in response) return response;
  if ("data" in response && response.data?.referralCode) return response.data;
  if ("referrals" in response && response.referrals?.referralCode) {
    return response.referrals;
  }
  return mapDefaultViewDataToApiResponse(DEFAULT_REFERRALS_VIEW_DATA);
}

export function mapApiReferrals(response: ReferralsResponse): AffiliateViewData {
  const totalInvited = Number(response.totalInvited ?? 0);
  const qualified = Number(response.qualified ?? 0);
  const conversionRate =
    totalInvited > 0 ? Math.round((qualified / totalInvited) * 1000) / 10 : 0;

  return {
    program: {
      code: response.referralCode || affiliateProgram.code,
      totalClicks: 0,
      totalSignups: totalInvited,
      qualifiedSignups: qualified,
      pendingSignups: Math.max(0, totalInvited - qualified),
      totalPointsEarned: Number(response.totalEarnings ?? 0),
      totalCreditsEarned: 0,
      conversionRate,
      shareUrl: response.shareUrl || `/auth/register?ref=${response.referralCode}`,
    },
    referrals: response.referrals.map(mapApiReferral),
    tiers: response.rewardTiers.map(mapApiReferralTier),
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
      referral.createdAt ||
      new Date().toISOString(),
    status,
    rewardPoints: Number(referral.rewardPoints ?? 0),
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

function mapDefaultViewDataToApiResponse(data: AffiliateViewData): ReferralsResponse {
  return {
    referralCode: data.program.code,
    totalInvited: data.program.totalSignups,
    qualified: data.program.qualifiedSignups,
    totalEarnings: data.program.totalPointsEarned,
    referrals: data.referrals,
    shareUrl: data.program.shareUrl,
    rewardTiers: data.tiers.map((tier) => ({
      count: tier.referrals,
      reward:
        tier.rewardLabel ??
        `${tier.rewardPoints} points${tier.rewardCredits ? ` + ${tier.rewardCredits} credits` : ""}`,
    })),
  };
}
