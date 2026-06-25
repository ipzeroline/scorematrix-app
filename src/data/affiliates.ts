export type AffiliateReferral = {
  id: string;
  username: string;
  joinedAt: string;
  status: "registered" | "qualified" | "rewarded";
  rewardPoints: number;
};

export type AffiliateTier = {
  referrals: number;
  rewardPoints: number;
  rewardCredits: number;
};

export type AffiliateMission = {
  id: "ref-1" | "ref-5" | "ref-10";
  translationKey: "ref1" | "ref5" | "ref10";
  condition: "qualified_prediction" | "qualified_referral_count";
  count: number;
  rewardPoints: number;
};

export const affiliateProgram = {
  code: "CYBERFAN99",
  totalClicks: 428,
  totalSignups: 36,
  qualifiedSignups: 18,
  pendingSignups: 12,
  totalPointsEarned: 18400,
  totalCreditsEarned: 320,
  conversionRate: 8.4,
};

export const affiliateTiers: AffiliateTier[] = [
  { referrals: 1, rewardPoints: 500, rewardCredits: 0 },
  { referrals: 5, rewardPoints: 3500, rewardCredits: 50 },
  { referrals: 10, rewardPoints: 9000, rewardCredits: 150 },
  { referrals: 25, rewardPoints: 30000, rewardCredits: 500 },
];

export const affiliateMissions: AffiliateMission[] = [
  {
    id: "ref-1",
    translationKey: "ref1",
    condition: "qualified_prediction",
    count: 1,
    rewardPoints: 50,
  },
  {
    id: "ref-5",
    translationKey: "ref5",
    condition: "qualified_referral_count",
    count: 5,
    rewardPoints: 200,
  },
  {
    id: "ref-10",
    translationKey: "ref10",
    condition: "qualified_referral_count",
    count: 10,
    rewardPoints: 500,
  },
];

export const affiliateReferrals: AffiliateReferral[] = [
  {
    id: "ref-001",
    username: "MerseySharp",
    joinedAt: "2026-05-10T11:20:00Z",
    status: "rewarded",
    rewardPoints: 500,
  },
  {
    id: "ref-002",
    username: "GoalOracle",
    joinedAt: "2026-05-09T08:45:00Z",
    status: "qualified",
    rewardPoints: 500,
  },
  {
    id: "ref-003",
    username: "DerbyPulse",
    joinedAt: "2026-05-07T14:15:00Z",
    status: "registered",
    rewardPoints: 0,
  },
  {
    id: "ref-004",
    username: "NeonKeeper",
    joinedAt: "2026-05-04T19:10:00Z",
    status: "rewarded",
    rewardPoints: 500,
  },
];
