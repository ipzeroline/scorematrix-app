export interface ReferralTier {
  referrals: number;
  rewardPoints: number;
  rewardCredits: number;
  label: string;
}

export const REFERRAL_REWARDS = {
  friendSignupBonus: 50,
  creditPurchaseCommission: 0.10,
  tiers: [
    { referrals: 1, rewardPoints: 500, rewardCredits: 0, label: 'Bronze Referrer' },
    { referrals: 5, rewardPoints: 3500, rewardCredits: 50, label: 'Silver Referrer' },
    { referrals: 10, rewardPoints: 9000, rewardCredits: 150, label: 'Gold Referrer' },
    { referrals: 25, rewardPoints: 30000, rewardCredits: 500, label: 'Platinum Referrer' },
    { referrals: 50, rewardPoints: 75000, rewardCredits: 1500, label: 'Diamond Referrer' },
  ] as ReferralTier[],
};
