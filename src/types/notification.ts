export type NotificationType =
  | 'matchReminder'
  | 'matchResult'
  | 'rankChange'
  | 'checkinReminder'
  | 'rewardEarned'
  | 'referralBonus'
  | 'eventStart'
  | 'streakLost'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}
