import type { LeaderboardReward } from '@/types/leaderboard';

export const WEEKLY_REWARDS: LeaderboardReward[] = [
  { rankRange: [1, 1], reward: { freePoints: 5000, premiumCredits: 200, badge: 'weekly-champion' } },
  { rankRange: [2, 2], reward: { freePoints: 3000, premiumCredits: 100 } },
  { rankRange: [3, 3], reward: { freePoints: 1500, premiumCredits: 50 } },
  { rankRange: [4, 5], reward: { freePoints: 1000, streakShield: 1 } },
  { rankRange: [6, 10], reward: { freePoints: 500 } },
];

export const MONTHLY_REWARDS: LeaderboardReward[] = [
  { rankRange: [1, 1], reward: { freePoints: 20000, premiumCredits: 1000, badge: 'monthly-champion' } },
  { rankRange: [2, 2], reward: { freePoints: 10000, premiumCredits: 500, badge: 'monthly-runner-up' } },
  { rankRange: [3, 3], reward: { freePoints: 5000, premiumCredits: 250 } },
  { rankRange: [4, 10], reward: { freePoints: 2000, streakShield: 2 } },
  { rankRange: [11, 25], reward: { freePoints: 1000 } },
  { rankRange: [26, 50], reward: { freePoints: 500 } },
];
