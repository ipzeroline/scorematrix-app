import { MissionType } from './common';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  category: 'predict' | 'streak' | 'accuracy' | 'social' | 'daily_login';
  target: number;
  progress: number;
  rewardPoints: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
  resetAt: string;
}
