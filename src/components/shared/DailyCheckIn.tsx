'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useCheckinStore } from '@/stores/checkin-store';
import { useUserStore } from '@/stores/user-store';
import { useNotificationStore } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { Check, Gift, Shield, Sparkles } from 'lucide-react';
import { DAILY_CHECKIN_REWARDS } from '@/data/checkin-rewards';

const dayLabelKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function DailyCheckIn() {
  const t = useTranslations('checkin');
  const { hasCheckedInToday, currentStreak, weeklyChecked, checkIn, getNextReward, getStreakProgress } = useCheckinStore();
  const addFreePoints = useUserStore((s) => s.addFreePoints);
  const addStreakShield = useUserStore((s) => s.addStreakShield);
  const addToast = useNotificationStore((s) => s.addToast);
  const [isMounted, setIsMounted] = useState(false);
  const [todayIndex] = useState(() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const streakProgress = getStreakProgress();
  const nextReward = getNextReward();
  const daysToBonus = Math.max(streakProgress.target - streakProgress.current, 0);

  const handleCheckIn = () => {
    const result = checkIn();
    if (result.amount > 0) {
      addFreePoints(result.amount);
      addToast({
        type: 'points',
        title: t('claimed'),
        message: t('claimToast', {
          day: streakProgress.current + 1,
          streak: currentStreak + 1,
        }),
        amount: result.amount,
      });
      if (result.bonus === 'streakShield') {
        addStreakShield(1);
        addToast({
          type: 'success',
          title: t('shieldBonus'),
          message: t('shieldBonusMessage'),
        });
      }
    }
  };

  return (
    <Card className="daily-checkin-panel relative overflow-hidden border-cyan-400/40 bg-[#060912] p-0">
      <div className="daily-checkin-grid absolute inset-0" />
      <div className="daily-checkin-scan absolute inset-0" />
      <div className="daily-checkin-circuit daily-checkin-circuit-top" />
      <div className="daily-checkin-circuit daily-checkin-circuit-bottom" />

      {!isMounted ? (
        <div className="relative grid gap-2.5 p-2.5 md:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)_auto] md:items-center md:p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-300/35 bg-cyan-400/10 text-cyan-200 daily-checkin-today">
              <Sparkles size={17} className="daily-checkin-spark" />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-black leading-tight text-white text-glow-cyan">
                {t('title')}
              </h3>
              <p className="mt-0.5 text-xs leading-4 text-cyan-100/60">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {DAILY_CHECKIN_REWARDS.map((reward, i) => (
              <div
                key={reward.day}
                className="daily-checkin-day relative flex h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border border-cyan-950/70 bg-black/20 px-1"
              >
                <span className="text-[10px] font-black uppercase leading-none tracking-wide text-cyan-100/70">
                  {t(`days.${dayLabelKeys[i]}`)}
                </span>
                <span className="font-mono text-xs font-black leading-none text-cyan-800">
                  +{reward.baseAmount}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <span className="daily-checkin-button flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-cyan-400 px-4 py-2 text-xs font-black text-black opacity-70 md:flex-none">
              <Gift size={14} /> {t('claimReward')}
            </span>
          </div>
        </div>
      ) : (
      <div className="relative grid gap-2.5 p-2.5 md:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)_auto] md:items-center md:p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-300/35 bg-cyan-400/10 text-cyan-200 daily-checkin-today">
            <Sparkles size={17} className="daily-checkin-spark" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-black leading-tight text-white text-glow-cyan">
              {t('title')}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-4 text-cyan-100/75">
              <span className="font-mono font-black text-cyan-200">{currentStreak}</span>
              <span>{t('streak')}</span>
              <span className="text-cyan-700">|</span>
              <span className="text-amber-200">+{nextReward.baseAmount} {t('pointsShort')}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-7 gap-1.5">
            {DAILY_CHECKIN_REWARDS.map((reward, i) => {
              const isToday = i === todayIndex;
              const isChecked = weeklyChecked[i];
              const isPast = i < todayIndex;

              return (
                <div
                  key={reward.day}
                  className={cn(
                    'daily-checkin-day relative flex h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-1 transition-colors',
                    isChecked && 'border-emerald-400/45 bg-emerald-400/[0.12]',
                    isToday && !isChecked && 'daily-checkin-today border-cyan-300/70 bg-cyan-400/[0.14]',
                    !isChecked && !isToday && 'border-cyan-700/35 bg-cyan-950/20',
                    isPast && !isChecked && 'border-cyan-900/45 bg-cyan-950/10 opacity-55'
                  )}
                >
                  {isToday && <span className="absolute inset-x-2 top-1 h-px bg-cyan-200/60" />}
                  <span className={cn(
                    'text-[11px] font-black uppercase leading-none tracking-wide',
                    isChecked
                      ? 'text-emerald-200'
                      : isToday
                        ? 'text-cyan-50'
                        : isPast
                          ? 'text-cyan-200/45'
                          : 'text-cyan-100/75'
                  )}>
                    {t(`days.${dayLabelKeys[i]}`)}
                  </span>
                  <span className={cn(
                    'font-mono text-sm font-black leading-none',
                    isChecked
                      ? 'text-emerald-300'
                      : isToday
                        ? 'text-amber-200 text-glow-cyan'
                        : isPast
                          ? 'text-cyan-300/40'
                          : 'text-cyan-200/80'
                  )}>
                  {isChecked ? (
                      <Check size={14} className="text-emerald-300" />
                    ) : (
                      `+${reward.baseAmount}`
                    )}
                  </span>
                  {reward.bonus && (
                    <Shield size={11} className={cn(
                      isChecked
                        ? 'text-emerald-300'
                        : isToday
                          ? 'text-amber-200/90'
                          : isPast
                            ? 'text-cyan-300/35'
                            : 'text-cyan-200/65'
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <span className="hidden items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-400/[0.07] px-2.5 py-1.5 text-xs text-emerald-100/85 lg:flex">
            <Shield size={13} className="text-emerald-300" />
            {daysToBonus} {t('bonusIn')}
          </span>
          {hasCheckedInToday ? (
            <span className="daily-checkin-claimed flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-green-400/35 bg-green-400/12 px-3 py-2 text-xs font-black text-green-300 md:flex-none">
              <Check size={14} /> {t('checkedIn')}
            </span>
          ) : (
            <button
              onClick={handleCheckIn}
              className="daily-checkin-button flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-cyan-400 px-4 py-2 text-xs font-black text-black transition-colors hover:bg-cyan-300 md:flex-none"
            >
              <Gift size={14} /> {t('claimReward')}
            </button>
          )}
        </div>
      </div>
      )}
    </Card>
  );
}
