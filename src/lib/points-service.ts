// Cross-store coordination utility
// Centralizes multi-store mutations to avoid scattered logic

import { useUserStore } from '@/stores/user-store';
import { useNotificationStore } from '@/stores/notification-store';

export function awardPoints(amount: number, reason: string) {
  const addFreePoints = useUserStore.getState().addFreePoints;
  const addToast = useNotificationStore.getState().addToast;
  addFreePoints(amount);
  addToast({ type: 'points', title: reason, amount });
}

export function awardCredits(amount: number, reason: string) {
  const addCredits = useUserStore.getState().addCredits;
  const addToast = useNotificationStore.getState().addToast;
  addCredits(amount);
  addToast({ type: 'credits', title: reason, amount });
}

export function processCheckIn(amount: number, streak: number) {
  awardPoints(amount, `Daily check-in · Day ${streak}`);
  addNotificationToStore('checkinReminder', 'Check-in Complete', `You earned ${amount} free points. ${streak}-day streak!`);
}

export function processReferralReward(points: number, credits: number) {
  if (points > 0) awardPoints(points, 'Referral reward');
  if (credits > 0) awardCredits(credits, 'Referral bonus');
  const incrementReferral = useUserStore.getState().incrementReferral;
  const addReferralEarnings = useUserStore.getState().addReferralEarnings;
  incrementReferral();
  addReferralEarnings(points + credits);
  addNotificationToStore('referralBonus', 'Referral Bonus Earned', `You earned ${points} pts and ${credits} credits from referrals!`);
}

export function claimLeaderboardReward(rank: number, freePoints: number, premiumCredits: number, badge?: string) {
  if (freePoints > 0) awardPoints(freePoints, `Leaderboard reward · Rank #${rank}`);
  if (premiumCredits > 0) awardCredits(premiumCredits, `Leaderboard bonus · Rank #${rank}`);
  const msg = badge
    ? `Rank #${rank}! You earned ${freePoints} pts, ${premiumCredits} credits, and the ${badge} badge.`
    : `Rank #${rank}! You earned ${freePoints} pts and ${premiumCredits} credits.`;
  addNotificationToStore('rewardEarned', 'Leaderboard Reward Claimed', msg);
}

function addNotificationToStore(type: string, title: string, message: string) {
  const addNotification = useNotificationStore.getState().addNotification;
  addNotification({ type, title, message });
}
