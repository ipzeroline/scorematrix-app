import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";
import { RewardCategory } from "@/types/common";
import type { Reward } from "@/types/reward";

export type ApiReward = {
  id: number | string;
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  stock?: number;
  stockRemaining: number;
  imageUrl: string | null;
  requiresShipping?: boolean;
  isLimited: boolean;
  isActive: boolean;
  userBalance?: {
    freePoints?: number;
  };
  canAfford: boolean;
  redemptionCount?: number;
};

export type RewardsResponse = {
  data: ApiReward[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type RedeemRewardResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

type RewardsApiPayload =
  | ApiReward[]
  | RewardsResponse
  | {
      rewards?: ApiReward[];
    };

export type RewardViewItem = Reward & {
  imageUrl: string | null;
  isLimited: boolean;
  isActive: boolean;
  canAfford: boolean;
  apiCategory: string;
  userBalance: {
    freePoints: number;
  };
  redemptionCount: number;
};

export const DEFAULT_REWARDS_RESPONSE: RewardsResponse = {
  data: [
    {
      id: 2,
      name: "เสื้อบอลทีมเหย้า",
      description: "เสื้อแข่งทีมโปรดของคุณ ลายเหย้า",
      category: "external",
      pointsCost: 5000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 3,
      name: "ผ้าพันคอสโมสร",
      description: "ผ้าพันคอทีมโปรด สีสวย เนื้อดี",
      category: "external",
      pointsCost: 2000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 4,
      name: "หมวกแก๊ป",
      description: "หมวกแก๊ป ScoreMatrix ลิขสิทธิ์แท้",
      category: "external",
      pointsCost: 1500,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 5,
      name: "Grab Voucher 100 THB",
      description: "บัตรของขวัญ Grab มูลค่า 100 บาท",
      category: "external",
      pointsCost: 3000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 6,
      name: "Grab Voucher 300 THB",
      description: "บัตรของขวัญ Grab มูลค่า 300 บาท",
      category: "external",
      pointsCost: 8000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 7,
      name: "Netflix 1 เดือน",
      description: "แพ็กเกจ Netflix Standard 1 เดือน",
      category: "wallet_credit",
      pointsCost: 10000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: true,
      isActive: true,
      canAfford: false,
    },
    {
      id: 8,
      name: "กรอบรูปทอง",
      description: "กรอบโปรไฟล์สีทอง ใช้ได้ถาวร",
      category: "external",
      pointsCost: 2000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: false,
      isActive: true,
      canAfford: false,
    },
    {
      id: 9,
      name: "ธีม avatar ทีมชาติไทย",
      description: "รูปโปรไฟล์ธีมทีมชาติไทย",
      category: "external",
      pointsCost: 1000,
      stockRemaining: 999,
      imageUrl: null,
      isLimited: false,
      isActive: true,
      canAfford: false,
    },
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 8,
    totalPages: 1,
  },
};

export async function getRewards(options?: ApiRequestOptions) {
  const response = await apiGetRaw<RewardsApiPayload>("/rewards", options);
  return normalizeRewardsResponse(response);
}

export async function getReward(rewardId: string | number, options?: ApiRequestOptions) {
  const response = await apiGetRaw<ApiReward>(`/rewards/${encodeURIComponent(String(rewardId))}`, options);
  return response;
}

export async function redeemReward(rewardId: string | number, shippingAddress?: string, options?: ApiRequestOptions) {
  const body = shippingAddress ? { shippingAddress } : {};
  const response = await apiPostRaw<RedeemRewardResponse>(`/rewards/${encodeURIComponent(String(rewardId))}/redeem`, body, options);
  return response;
}

export function normalizeRewardsResponse(response: RewardsApiPayload): RewardsResponse {
  if (Array.isArray(response)) return { data: response };
  if ("data" in response && Array.isArray(response.data)) return response;
  if ("rewards" in response && Array.isArray(response.rewards)) {
    return { data: response.rewards };
  }
  return DEFAULT_REWARDS_RESPONSE;
}

export function mapApiReward(reward: ApiReward): RewardViewItem {
  const category = mapRewardCategory(reward);
  const pointsCost = Number(reward.pointsCost ?? 0);
  const stock = Number(reward.stockRemaining ?? reward.stock ?? 0);

  return {
    id: String(reward.id),
    name: reward.name,
    description: reward.description,
    longDescription: reward.description,
    category,
    pointsCost,
    creditCost: 0,
    image: fallbackRewardIcon(reward, category),
    imageUrl: reward.imageUrl,
    stock,
    isPremiumOnly: false,
    isFreeOnly: true,
    requiresShipping: Boolean(reward.requiresShipping ?? category === RewardCategory.MERCHANDISE),
    shippingInfo: null,
    isLimited: Boolean(reward.isLimited),
    isActive: Boolean(reward.isActive),
    canAfford: Boolean(reward.canAfford),
    apiCategory: reward.category,
    userBalance: {
      freePoints: Number(reward.userBalance?.freePoints ?? 0),
    },
    redemptionCount: Number(reward.redemptionCount ?? 0),
  };
}

function mapRewardCategory(reward: ApiReward): RewardCategory {
  const category = reward.category.toLowerCase();
  const name = reward.name.toLowerCase();

  if (category === "wallet_credit") return RewardCategory.DIGITAL;
  if (category === "digital") return RewardCategory.DIGITAL;
  if (category === "voucher" || name.includes("voucher")) {
    return RewardCategory.VOUCHER;
  }
  if (
    category === "cosmetic" ||
    name.includes("avatar") ||
    name.includes("ธีม") ||
    name.includes("กรอบ")
  ) {
    return RewardCategory.COSMETIC;
  }
  if (category === "merchandise") return RewardCategory.MERCHANDISE;
  return RewardCategory.MERCHANDISE;
}

function fallbackRewardIcon(reward: ApiReward, category: RewardCategory) {
  const name = reward.name.toLowerCase();
  if (name.includes("เสื้อ") || name.includes("jersey")) return "👕";
  if (name.includes("ผ้าพันคอ") || name.includes("scarf")) return "🧣";
  if (name.includes("หมวก") || name.includes("cap")) return "🧢";
  if (name.includes("grab") || name.includes("voucher")) return "🎟️";
  if (name.includes("netflix")) return "🎬";
  if (name.includes("กรอบ")) return "✨";
  if (name.includes("avatar") || name.includes("ธีม")) return "🖼️";
  if (category === RewardCategory.DIGITAL) return "💾";
  if (category === RewardCategory.COSMETIC) return "✨";
  if (category === RewardCategory.VOUCHER) return "🎟️";
  return "🎁";
}
