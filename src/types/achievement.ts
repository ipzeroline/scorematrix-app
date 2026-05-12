import { AchievementCategory } from './common';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  progress: number;
  target: number;
  unlockedAt: string | null;
  rewardXP: number;
}
