import { RewardCategory, RedemptionStatus } from './common';

export interface Reward {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: RewardCategory;
  pointsCost: number;
  creditCost: number;
  image: string;
  stock: number;
  isPremiumOnly: boolean;
  isFreeOnly: boolean;
  requiresShipping: boolean;
  shippingInfo: ShippingInfo | null;
}

export interface ShippingInfo {
  estimatedDays: number;
  regions: string[];
  trackingAvailable: boolean;
}

export interface Redemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  creditsSpent: number;
  status: RedemptionStatus;
  shippingStatus: string | null;
  shippingTracking: string | null;
  createdAt: string;
  updatedAt: string;
}
