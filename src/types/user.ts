import { Locale } from './common';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  favoriteTeam: string | null;
  role: 'user' | 'admin';
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserStats {
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
  joinedLeagueCount: number;
}

export interface UserPreferences {
  locale: Locale;
  emailNotifications: boolean;
  publicProfile: boolean;
}

export interface Rank {
  id: string;
  name: string;
  icon: string;
  minXP: number;
  color: string;
}
