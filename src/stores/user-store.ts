import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurrentUserEntitlements } from '@/lib/credit-entitlements';

interface UserState {
  isLoggedIn: boolean;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  phone: string;
  birthYear: string;
  country: string;
  favoriteTeam: string;
  playerType: string;
  language: string;
  marketingConsent: boolean;
  freePoints: number;
  premiumCredits: number;
  xp: number;
  level: number;
  rank: string;
  streak: number;
  bestStreak: number;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  missionsCompleted: number;
  achievementsUnlocked: number;
  streakShields: number;
  predictionBoosts: number;
  entitlements: CurrentUserEntitlements;
  preferences: {
    pushNotifications: boolean;
    matchReminder30min: boolean;
    matchReminder1hr: boolean;
    resultNotification: boolean;
    rankChangeAlert: boolean;
    publicProfile: boolean;
  };
  referralCode: string;
  referralCount: number;
  qualifiedReferrals: number;
  totalReferralEarnings: number;
}

interface UserActions {
  login: (user: { id: string; username: string; displayName: string }) => void;
  logout: () => void;
  addFreePoints: (amount: number) => void;
  addCredits: (amount: number) => void;
  spendFreePoints: (amount: number) => boolean;
  spendCredits: (amount: number) => boolean;
  useStreakShield: () => boolean;
  usePredictionBoost: () => boolean;
  addStreakShield: (count: number) => void;
  addPredictionBoost: (count: number) => void;
  recordPrediction: (correct: boolean, pointsEarned: number) => void;
  updateAccuracy: (total: number, correct: number) => void;
  updatePreference: <K extends keyof UserState['preferences']>(key: K, value: UserState['preferences'][K]) => void;
  incrementReferral: () => void;
  addReferralEarnings: (amount: number) => void;
  setReferralCode: (code: string) => void;
  syncWallet: (wallet: Partial<Pick<UserState, 'freePoints' | 'premiumCredits' | 'xp' | 'level' | 'rank'>>) => void;
  updateProfile: (profile: Partial<Pick<UserState, 'displayName' | 'avatarUrl' | 'email' | 'phone' | 'birthYear' | 'country' | 'favoriteTeam' | 'playerType' | 'language' | 'marketingConsent'>>) => void;
}

const defaultPreferences: UserState['preferences'] = {
  pushNotifications: true,
  matchReminder30min: true,
  matchReminder1hr: true,
  resultNotification: true,
  rankChangeAlert: true,
  publicProfile: false,
};

const initialState: UserState = {
  isLoggedIn: false,
  userId: '',
  username: '',
  displayName: '',
  avatarUrl: '',
  email: '',
  phone: '',
  birthYear: '',
  country: '',
  favoriteTeam: '',
  playerType: '',
  language: 'th',
  marketingConsent: false,
  freePoints: 2840,
  premiumCredits: 150,
  xp: 12000,
  level: 12,
  rank: 'diamond',
  streak: 5,
  bestStreak: 18,
  totalPredictions: 245,
  correctPredictions: 176,
  accuracy: 72,
  missionsCompleted: 87,
  achievementsUnlocked: 14,
  streakShields: 1,
  predictionBoosts: 2,
  entitlements: {},
  preferences: defaultPreferences,
  referralCode: 'SM-FAN99',
  referralCount: 3,
  qualifiedReferrals: 2,
  totalReferralEarnings: 1000,
};

function clampPredictionStats(total: number, correct: number) {
  const safeTotal = Math.max(Number.isFinite(total) ? total : 0, 0);
  const safeCorrect = Math.min(
    Math.max(Number.isFinite(correct) ? correct : 0, 0),
    safeTotal
  );

  return {
    totalPredictions: safeTotal,
    correctPredictions: safeCorrect,
    accuracy: safeTotal > 0 ? Math.round((safeCorrect / safeTotal) * 100) : 0,
  };
}

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (user) =>
        set({
          isLoggedIn: true,
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          avatarUrl: '',
        }),

      logout: () =>
        set({
          isLoggedIn: false,
          userId: '',
          username: '',
          displayName: '',
          avatarUrl: '',
          email: '',
          phone: '',
          birthYear: '',
          country: '',
          favoriteTeam: '',
          playerType: '',
          language: '',
          marketingConsent: false,
          entitlements: {},
        }),

      addFreePoints: (amount) =>
        set((s) => ({ freePoints: s.freePoints + amount })),

      addCredits: (amount) =>
        set((s) => ({ premiumCredits: s.premiumCredits + amount })),

      spendFreePoints: (amount) => {
        const s = get();
        if (s.freePoints < amount) return false;
        set({ freePoints: s.freePoints - amount });
        return true;
      },

      spendCredits: (amount) => {
        const s = get();
        if (s.premiumCredits < amount) return false;
        set({ premiumCredits: s.premiumCredits - amount });
        return true;
      },

      useStreakShield: () => {
        const s = get();
        if (s.streakShields <= 0) return false;
        set({ streakShields: s.streakShields - 1 });
        return true;
      },

      usePredictionBoost: () => {
        const s = get();
        if (s.predictionBoosts <= 0) return false;
        set({ predictionBoosts: s.predictionBoosts - 1 });
        return true;
      },

      addStreakShield: (count) =>
        set((s) => ({ streakShields: s.streakShields + count })),

      addPredictionBoost: (count) =>
        set((s) => ({ predictionBoosts: s.predictionBoosts + count })),

      recordPrediction: (correct, pointsEarned) =>
        set((s) => {
          const newTotal = s.totalPredictions + 1;
          const newCorrect = correct ? s.correctPredictions + 1 : s.correctPredictions;
          const predictionStats = clampPredictionStats(newTotal, newCorrect);
          const newStreak = correct ? s.streak + 1 : 0;
          const newBestStreak = Math.max(s.bestStreak, newStreak);
          const newXP = s.xp + pointsEarned;
          const newLevel = Math.floor(newXP / 1000) + 1;
          return {
            ...predictionStats,
            streak: newStreak,
            bestStreak: newBestStreak,
            xp: newXP,
            level: newLevel,
            freePoints: s.freePoints + pointsEarned,
          };
        }),

      updateAccuracy: (total, correct) =>
        set(clampPredictionStats(total, correct)),

      updatePreference: (key, value) =>
        set((s) => ({ preferences: { ...s.preferences, [key]: value } })),

      incrementReferral: () =>
        set((s) => {
          const newCount = s.referralCount + 1;
          const newQualified = newCount; // simplified: all referrals count as qualified
          return { referralCount: newCount, qualifiedReferrals: newQualified };
        }),

      addReferralEarnings: (amount) =>
        set((s) => ({ totalReferralEarnings: s.totalReferralEarnings + amount })),

      setReferralCode: (code) => set({ referralCode: code }),

      syncWallet: (wallet) => set(wallet),

      updateProfile: (profile) => set(profile),
    }),
    { name: 'scorematrix-user' }
  )
);
