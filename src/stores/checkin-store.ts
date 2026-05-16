import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DayReward {
  day: number;
  baseAmount: number;
  bonus?: string;
}

interface CheckinState {
  lastCheckInDate: string | null;
  currentStreak: number;
  longestStreak: number;
  weeklyChecked: boolean[];
  hasCheckedInToday: boolean;
}

interface CheckinActions {
  checkIn: () => { amount: number; bonus: string | null };
  canCheckIn: () => boolean;
  getNextReward: () => DayReward;
  getStreakProgress: () => { current: number; target: number };
}

const REWARDS: DayReward[] = [
  { day: 1, baseAmount: 5 },
  { day: 2, baseAmount: 5 },
  { day: 3, baseAmount: 7 },
  { day: 4, baseAmount: 7 },
  { day: 5, baseAmount: 8 },
  { day: 6, baseAmount: 10 },
  { day: 7, baseAmount: 10, bonus: 'streakShield' },
];

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDayOfWeek(): number {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1; // Mon=0, Sun=6
}

const initialState: CheckinState = {
  lastCheckInDate: null,
  currentStreak: 0,
  longestStreak: 0,
  weeklyChecked: [false, false, false, false, false, false, false],
  hasCheckedInToday: false,
};

export const useCheckinStore = create<CheckinState & CheckinActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      canCheckIn: () => {
        const s = get();
        if (s.hasCheckedInToday) return false;
        if (!s.lastCheckInDate) return true;
        const last = new Date(s.lastCheckInDate);
        const today = new Date(getToday());
        return last < today;
      },

      checkIn: () => {
        const s = get();
        if (!s.canCheckIn()) return { amount: 0, bonus: null };

        const today = getToday();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);

        const streakKept = s.lastCheckInDate === yesterdayStr;
        const newStreak = streakKept ? s.currentStreak + 1 : 1;
        const newLongest = Math.max(s.longestStreak, newStreak);
        const dayIndex = getDayOfWeek();
        const newWeekly = [...s.weeklyChecked];
        newWeekly[dayIndex] = true;

        const dayOfStreak = ((newStreak - 1) % 7) + 1;
        const reward = REWARDS[dayOfStreak - 1];
        const bonus = dayOfStreak === 7 ? reward.bonus ?? null : null;

        set({
          lastCheckInDate: today,
          currentStreak: newStreak,
          longestStreak: newLongest,
          weeklyChecked: newWeekly,
          hasCheckedInToday: true,
        });

        return { amount: reward.baseAmount, bonus };
      },

      getNextReward: () => {
        const s = get();
        const nextDay = ((s.currentStreak) % 7) + 1;
        return REWARDS[nextDay - 1];
      },

      getStreakProgress: () => {
        const s = get();
        const dayInCycle = ((s.currentStreak - 1) % 7) + 1;
        return { current: dayInCycle, target: 7 };
      },
    }),
    { name: 'scorematrix-checkin' }
  )
);
