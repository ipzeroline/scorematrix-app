export interface CheckInReward {
  day: number;
  baseAmount: number;
  bonus?: string;
  label: string;
}

export const DAILY_CHECKIN_REWARDS: CheckInReward[] = [
  { day: 1, baseAmount: 5, label: 'Mon' },
  { day: 2, baseAmount: 5, label: 'Tue' },
  { day: 3, baseAmount: 7, label: 'Wed' },
  { day: 4, baseAmount: 7, label: 'Thu' },
  { day: 5, baseAmount: 8, label: 'Fri' },
  { day: 6, baseAmount: 10, label: 'Sat' },
  { day: 7, baseAmount: 10, bonus: 'streakShield', label: 'Sun' },
];

// Total: 52 points + 1 streak shield per 7-day cycle
