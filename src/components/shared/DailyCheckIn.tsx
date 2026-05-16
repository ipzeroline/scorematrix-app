'use client';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useCheckinStore } from '@/stores/checkin-store';
import { useUserStore } from '@/stores/user-store';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { Check, Gift, Shield, Zap } from 'lucide-react';
import { DAILY_CHECKIN_REWARDS } from '@/data/checkin-rewards';

export function DailyCheckIn() {
  const t = useTranslations('checkin');
  const { hasCheckedInToday, currentStreak, weeklyChecked, checkIn, getNextReward, getStreakProgress } = useCheckinStore();
  const addFreePoints = useUserStore((s) => s.addFreePoints);
  const addStreakShield = useUserStore((s) => s.addStreakShield);
  const addToast = useNotificationStore((s) => s.addToast);

  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const streakProgress = getStreakProgress();
  const nextReward = getNextReward();

  const handleCheckIn = () => {
    const result = checkIn();
    if (result.amount > 0) {
      addFreePoints(result.amount);
      addToast({
        type: 'points',
        title: t('claimed'),
        message: `Day ${streakProgress.current + 1} · ${currentStreak + 1} day streak`,
        amount: result.amount,
      });
      if (result.bonus === 'streakShield') {
        addStreakShield(1);
        addToast({
          type: 'success',
          title: t('shieldBonus'),
          message: '+1 Streak Shield',
        });
      }
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {currentStreak} day streak · {streakProgress.target - streakProgress.current} days to bonus
          </p>
        </div>
        {hasCheckedInToday ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
            <Check size={12} /> {t('checkedIn')}
          </span>
        ) : (
          <button
            onClick={handleCheckIn}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
          >
            <Gift size={14} /> {t('claimReward')}
          </button>
        )}
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {DAILY_CHECKIN_REWARDS.map((reward, i) => {
          const isToday = i === todayIndex;
          const isChecked = weeklyChecked[i];
          const isPast = i < todayIndex;

          return (
            <div
              key={reward.day}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors',
                isChecked && 'border-emerald-500/30 bg-emerald-500/10',
                isToday && !isChecked && 'border-cyan-500/40 bg-cyan-500/10 ring-1 ring-cyan-500/20',
                !isChecked && !isToday && 'border-gray-800 bg-transparent',
                isPast && !isChecked && 'border-red-500/20 bg-red-500/5 opacity-50'
              )}
            >
              <span className="text-[9px] text-gray-500 font-medium">{reward.label}</span>
              <span className={cn(
                'text-sm font-bold font-mono',
                isChecked ? 'text-emerald-400' : isToday ? 'text-cyan-400' : 'text-gray-700'
              )}>
                {isChecked ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  `+${reward.baseAmount}`
                )}
              </span>
              {reward.bonus && (
                <Shield size={10} className={cn(
                  isChecked ? 'text-emerald-400' : 'text-gray-700'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Streak info */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-800/50">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <Zap size={12} className="text-amber-400" />
          <span>Next: <span className="text-white">+{nextReward.baseAmount} pts</span></span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <Shield size={12} className="text-emerald-400" />
          <span>Day 7: <span className="text-emerald-400">+1 Shield</span></span>
        </div>
      </div>
    </Card>
  );
}
