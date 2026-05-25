export enum MatchStatus {
  UPCOMING = 'upcoming',
  LIVE = 'live',
  FINISHED = 'finished',
  POSTPONED = 'postponed',
  CANCELLED = 'cancelled',
}

export enum MatchResult {
  HOME = 'home',
  AWAY = 'away',
  DRAW = 'draw',
}

export enum PredictionStatus {
  PENDING = 'pending',
  CORRECT = 'correct',
  INCORRECT = 'incorrect',
  PARTIAL = 'partial',
}

export enum RewardCategory {
  MERCHANDISE = 'merchandise',
  DIGITAL = 'digital',
  COSMETIC = 'cosmetic',
  VOUCHER = 'voucher',
}

export enum RedemptionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum MissionType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SPECIAL = 'special',
}

export enum AchievementCategory {
  PREDICTION = 'prediction',
  STREAK = 'streak',
  SOCIAL = 'social',
  SPECIAL = 'special',
}

export enum LeaderboardPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  SEASONAL = 'seasonal',
}

export type Locale = 'en' | 'th' | 'zh' | 'ja' | 'ko' | 'vi';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
