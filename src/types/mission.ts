import { MissionType } from './common';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  category: 'predict' | 'streak' | 'accuracy' | 'social' | 'daily_login';
  icon?: string;
  target: number;
  progress: number;
  rewardPoints: number;
  rewardXP: number;
  rewardCredits?: number;
  completed: boolean;
  claimed: boolean;
  startsAt?: string;
  expiresAt: string;
  resetAt: string;
}
