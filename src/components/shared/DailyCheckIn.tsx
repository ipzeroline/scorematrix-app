'use client';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useCheckinStore } from '@/stores/checkin-store';
import { useUserStore } from '@/stores/user-store';
import { useNotificationStore } from '@/stores/notification-store';
import {
  createCheckIn,
  getCheckInBonus,
  getCheckInPoints,
  getCheckInRewards,
  type CheckInRewardDay,
  type CheckInRewardsResponse,
} from '@/lib/checkins-api';
import { isAuthSessionExpiredError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { Check, Gift, Shield, Sparkles, Flame } from 'lucide-react';

const dayLabelKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const emptySubscribe = () => () => {};
const placeholderDays = Array.from({ length: 7 }, (_, index) => index);

interface DailyCheckInProps {
  initialHasAuthSession?: boolean;
}

export function DailyCheckIn({ initialHasAuthSession = false }: DailyCheckInProps) {
  const t = useTranslations('checkin');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { hasCheckedInToday, currentStreak, checkIn, getNextReward, getStreakProgress } = useCheckinStore();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const addFreePoints = useUserStore((s) => s.addFreePoints);
  const addStreakShield = useUserStore((s) => s.addStreakShield);
  const addToast = useNotificationStore((s) => s.addToast);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkInModal, setCheckInModal] = useState<{
    isOpen: boolean;
    points: number;
    streak: number;
    bonusShield: boolean;
  }>({
    isOpen: false,
    points: 0,
    streak: 0,
    bonusShield: false,
  });
  const [rewardSchedule, setRewardSchedule] = useState<CheckInRewardsResponse | null>(null);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [rewardsError, setRewardsError] = useState<string | null>(null);
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const streakProgress = getStreakProgress();
  const nextReward = getNextReward();
  const effectiveIsLoggedIn = isLoggedIn || initialHasAuthSession;
  const activeReward = getActiveReward(rewardSchedule);
  const activeRewardPoints = activeReward ? getRewardPoints(activeReward) : nextReward.baseAmount;
  const hasClaimedToday = rewardSchedule?.checkedInToday ?? hasCheckedInToday;
  const canClaimToday = rewardSchedule
    ? rewardSchedule.canCheckIn && !rewardSchedule.checkedInToday
    : !hasCheckedInToday;
  const daysToBonus = getDaysToBonus(rewardSchedule) ?? Math.max(streakProgress.target - streakProgress.current, 0);

  const loadRewards = useCallback(async () => {
    setRewardsLoading(true);
    setRewardsError(null);

    try {
      const rewards = await getCheckInRewards({ locale, cache: 'no-store' });
      setRewardSchedule(rewards);
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return;
      console.error('Failed to load check-in rewards', error);
      setRewardsError(tCommon('error'));
    } finally {
      setRewardsLoading(false);
    }
  }, [locale, tCommon]);

  useEffect(() => {
    if (!effectiveIsLoggedIn || !isMounted) return;
    const timeoutId = window.setTimeout(() => {
      void loadRewards();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [effectiveIsLoggedIn, isMounted, loadRewards]);

  if (!effectiveIsLoggedIn) {
    return null;
  }

  const handleCheckIn = async () => {
    if (isCheckingIn) return;

    setIsCheckingIn(true);
    setErrorMessage(null);

    let amount = 0;
    let bonus: string | null = null;
    let checkedInSuccess = false;

    try {
      const response = await createCheckIn({ locale });
      const apiAmount = getCheckInPoints(response);
      const apiBonus = getCheckInBonus(response);
      const result = checkIn();
      const scheduledAmount = activeReward ? getRewardPoints(activeReward) : 0;
      amount = apiAmount > 0 ? apiAmount : scheduledAmount > 0 ? scheduledAmount : result.amount;
      bonus = apiBonus ?? activeReward?.bonusType ?? result.bonus;
      checkedInSuccess = true;
    } catch (error) {
      if (isAuthSessionExpiredError(error)) {
        setIsCheckingIn(false);
        return;
      }
      console.warn("Check-in request failed, executing client-side check-in fallback", error);
      try {
        const result = checkIn();
        const scheduledAmount = activeReward ? getRewardPoints(activeReward) : 0;
        amount = scheduledAmount > 0 ? scheduledAmount : result.amount;
        bonus = activeReward?.bonusType ?? result.bonus;
        checkedInSuccess = true;
      } catch (fallbackError) {
        console.error("Local check-in fallback failed", fallbackError);
      }
    }

    if (checkedInSuccess) {
      if (amount > 0) {
        addFreePoints(amount);
      }

      setRewardSchedule((current) =>
        current
          ? {
              ...current,
              checkedInToday: true,
              canCheckIn: false,
              days: current.days.map((day) =>
                day.isNext
                  ? { ...day, isCompleted: true, isNext: false }
                  : day
              ),
            }
          : current
      );

      setCheckInModal({
        isOpen: true,
        points: amount,
        streak: currentStreak + 1,
        bonusShield: bonus === 'streakShield',
      });

      addToast({
        type: 'points',
        title: t('claimed'),
        message: t('claimToast', {
          day: streakProgress.current + 1,
          streak: currentStreak + 1,
        }),
        amount,
      });

      if (bonus === 'streakShield') {
        addStreakShield(1);
        addToast({
          type: 'success',
          title: t('shieldBonus'),
          message: t('shieldBonusMessage'),
        });
      }

      void loadRewards();
    } else {
      const fallbackMessage = tCommon('error');
      setErrorMessage(fallbackMessage);
      addToast({
        type: 'error',
        title: tCommon('error'),
        message: fallbackMessage,
      });
    }

    setIsCheckingIn(false);
  };

  return (
    <Card className="daily-checkin-panel relative overflow-hidden p-0 border border-border bg-surface hover:border-cyan/35 transition-colors duration-300">
      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan via-cyan-dim to-green" />
      
      {!isMounted ? (
        <div className="relative grid gap-2.5 p-2.5 md:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)_auto] md:items-center md:p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
              <Sparkles size={17} />
            </div>
            <div className="min-w-0">
              <h3 className="truncate font-display text-base font-bold leading-tight text-white">
                {t('title')}
              </h3>
              <p className="mt-0.5 text-xs leading-4 text-text-secondary">
                {t('subtitle')}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {placeholderDays.map((i) => (
              <div
                key={i}
                className="daily-checkin-day relative flex h-13 flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-border bg-black/20 px-1"
              >
                <span className="max-w-full truncate text-[10px] font-bold uppercase leading-tight tracking-wide text-text-muted">
                  {t(`days.${dayLabelKeys[i]}`)}
                </span>
                <span className="font-mono text-xs font-bold leading-none text-text-muted">
                  +--
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 md:justify-end">
            <span className="daily-checkin-button flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-cyan/20 bg-[#151620] px-4 py-2 text-xs font-bold text-cyan opacity-70 md:flex-none">
              <Gift size={14} /> {t('claimReward')}
            </span>
          </div>
        </div>
      ) : (
      <div className="relative grid gap-2.5 p-2.5 md:grid-cols-[minmax(170px,0.42fr)_minmax(0,1fr)_auto] md:items-center md:p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan/20 bg-cyan/10 text-cyan">
            <Flame size={18} className={cn(!hasClaimedToday && canClaimToday && "animate-pulse")} />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-display text-base font-bold leading-tight text-white">
              {t('title')}
            </h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-4 text-text-secondary">
              <span className="font-mono font-bold text-cyan">{currentStreak}</span>
              <span>{t('streak')}</span>
              <span className="text-border">|</span>
              <span className="text-gold font-bold">
                {rewardsLoading && !rewardSchedule ? '+--' : `+${activeRewardPoints}`} {t('pointsShort')}
              </span>
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-7 gap-1.5">
            {rewardSchedule?.days.length ? (
              rewardSchedule.days.map((reward, i) => {
                const isToday = reward.isNext || reward.day === rewardSchedule.today.day;
                const isChecked = reward.isCompleted;
                const isPast = !isChecked && !reward.isNext && reward.day < rewardSchedule.nextDay;

                return (
                  <div
                    key={`${reward.day}-${reward.dayName}`}
                    className={cn(
                      'daily-checkin-day relative flex h-13 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-1 transition-all duration-200',
                      isChecked && 'border-green/50 bg-green/10 text-green',
                      isToday && !isChecked && 'border-cyan bg-cyan/15 text-cyan shadow-[0_0_12px_rgba(56,189,248,0.15)] scale-[1.02] z-10',
                      !isChecked && !isToday && 'border-border bg-black/40 text-text-secondary hover:border-text-muted',
                      isPast && !isChecked && 'border-border/30 bg-black/25 opacity-40 text-text-muted'
                    )}
                  >
                    <span className={cn(
                      'max-w-full truncate text-[10px] font-bold uppercase leading-tight tracking-wide',
                      isChecked
                        ? 'text-green'
                        : isToday
                          ? 'text-cyan font-extrabold'
                          : isPast
                            ? 'text-text-muted'
                            : 'text-text-secondary'
                    )}>
                      {reward.dayName || t(`days.${dayLabelKeys[i]}`)}
                    </span>
                    <span className={cn(
                      'font-mono text-xs font-bold leading-none mt-0.5',
                      isChecked
                        ? 'text-green'
                        : isToday
                          ? 'text-cyan font-extrabold'
                          : isPast
                            ? 'text-text-muted'
                            : 'text-text-secondary'
                    )}>
                    {isChecked ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        `+${getRewardPoints(reward)}`
                      )}
                    </span>
                    {(reward.bonusType || reward.bonusPoints > 0) && (
                      <Shield size={10} className={cn(
                        isChecked
                          ? 'text-green'
                          : isToday
                            ? 'text-cyan/90'
                            : isPast
                              ? 'text-text-muted/50'
                              : 'text-text-secondary/75'
                      )} />
                    )}
                  </div>
                );
              })
            ) : (
              placeholderDays.map((i) => (
                <div
                  key={i}
                  className="daily-checkin-day relative flex h-13 flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-border bg-black/40 px-1"
                >
                  <span className="max-w-full truncate text-[10px] font-semibold uppercase leading-tight tracking-wide text-text-muted">
                    {t(`days.${dayLabelKeys[i]}`)}
                  </span>
                  <span className="font-mono text-xs font-bold leading-none text-text-muted">
                    +--
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <span className="hidden items-center gap-1.5 rounded-md border border-green/20 bg-green/5 px-2.5 py-1.5 text-xs text-green lg:flex">
            <Shield size={13} className="text-green" />
            {daysToBonus} {t('bonusIn')}
          </span>
          {hasClaimedToday ? (
            <span className="daily-checkin-claimed flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-green/20 bg-green/5 px-3 py-2 text-xs font-bold text-green md:flex-none">
              <Check size={14} /> {t('checkedIn')}
            </span>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn || rewardsLoading || !canClaimToday}
              className="daily-checkin-button flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-cyan/40 bg-[#151620] px-4 py-2 text-xs font-bold text-cyan transition-all duration-150 hover:bg-cyan/10 hover:border-cyan/70 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
            >
              <Gift size={14} /> {isCheckingIn ? tCommon('loading') : t('claimReward')}
            </button>
          )}
        </div>
        {(errorMessage || rewardsError) && (
          <p className="md:col-span-3 rounded-md border border-red/25 bg-red/10 px-3 py-2 text-xs text-red">
            {errorMessage ?? rewardsError}
          </p>
        )}
      </div>
      )}
      {/* Premium E-sports Daily Check-in Success Streak Modal */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes pop-streak {
              0% { transform: scale(0.6); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            .streak-pop {
              animation: pop-streak 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
            }
          `}} />
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setCheckInModal((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Modal Container */}
          <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-border bg-surface p-6 text-center shadow-2xl transition-all duration-300">
            <div className="relative z-10 space-y-5">
              {/* E-sports Flame badge */}
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan/10 p-2 border border-cyan/20">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-elevated border border-orange-500/20">
                  <Flame size={32} className="text-orange-500 animate-pulse" />
                </div>
              </div>

              <div>
                <span className="inline-block rounded-full bg-cyan/10 px-3 py-1 text-[10px] font-bold tracking-wider text-cyan uppercase border border-cyan/20">
                  {t('claimed')} SECURED
                </span>
                <h2 className="mt-3 font-display text-xl font-bold text-white">
                  {t('checkedIn')}!
                </h2>
                <p className="mt-1 text-xs text-text-secondary font-mono">
                  STREAK MULTIPLIER ACTIVE
                </p>
              </div>

              {/* Streak info & rewards */}
              <div className="grid grid-cols-2 gap-3 py-1">
                {/* Streak count */}
                <div className="streak-pop opacity-0 rounded-xl border border-orange-500/20 bg-orange-500/5 p-3 text-center" style={{ animationDelay: '0.05s' }}>
                  <div className="font-mono text-2xl font-bold text-orange-500">
                    {checkInModal.streak}
                  </div>
                  <div className="mt-1 text-[9px] uppercase font-bold tracking-wider text-text-secondary">
                    Day Streak
                  </div>
                </div>

                {/* Points Earned */}
                <div className="streak-pop opacity-0 rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-center" style={{ animationDelay: '0.1s' }}>
                  <div className="font-mono text-2xl font-bold text-cyan">
                    +{checkInModal.points}
                  </div>
                  <div className="mt-1 text-[9px] uppercase font-bold tracking-wider text-text-secondary">
                    {t('pointsShort')}
                  </div>
                </div>
              </div>

              {/* Special Streak Shield Bonus */}
              {checkInModal.bonusShield && (
                <div className="streak-pop opacity-0 flex items-center justify-center gap-2 rounded-xl border border-green/20 bg-green/5 p-3 text-green" style={{ animationDelay: '0.15s' }}>
                  <Shield size={18} className="text-green animate-pulse" />
                  <div className="text-left">
                    <div className="text-xs font-bold font-mono">STREAK SHIELD EARNED</div>
                    <div className="text-[9px] text-text-secondary">Protects your streak for 1 missed day!</div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                className="w-full rounded-lg border border-cyan/40 bg-[#151620] hover:bg-cyan/10 text-cyan py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-150 shadow-lg"
                onClick={() => setCheckInModal((prev) => ({ ...prev, isOpen: false }))}
              >
                RESUME MISSION
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

function getRewardPoints(reward: CheckInRewardDay) {
  return Number(reward.points ?? 0) + Number(reward.bonusPoints ?? 0);
}

function getActiveReward(schedule: CheckInRewardsResponse | null) {
  if (!schedule?.days.length) return null;
  return (
    schedule.days.find((day) => day.isNext) ??
    schedule.days.find((day) => day.day === schedule.nextDay) ??
    schedule.days.find((day) => day.day === schedule.today.day) ??
    null
  );
}

function getDaysToBonus(schedule: CheckInRewardsResponse | null) {
  if (!schedule?.days.length) return null;

  const activeIndex = schedule.days.findIndex((day) => day.isNext);
  const bonusIndex = schedule.days.findIndex(
    (day, index) =>
      index >= Math.max(activeIndex, 0) &&
      (Boolean(day.bonusType) || Number(day.bonusPoints ?? 0) > 0)
  );

  if (activeIndex < 0 || bonusIndex < 0) return null;
  return Math.max(bonusIndex - activeIndex, 0);
}
