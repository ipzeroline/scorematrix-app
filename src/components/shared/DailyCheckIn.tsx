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
      console.warn("Check-in API failed, executing client-side check-in fallback", error);
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
            {placeholderDays.map((i) => (
              <div
                key={i}
                className="daily-checkin-day relative flex h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border border-cyan-950/70 bg-black/20 px-1"
              >
                <span className="text-[10px] font-black uppercase leading-none tracking-wide text-cyan-100/70">
                  {t(`days.${dayLabelKeys[i]}`)}
                </span>
                <span className="font-mono text-xs font-black leading-none text-cyan-800">
                  +--
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
              <span className="text-amber-200">
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
                      'daily-checkin-day relative flex h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-1 transition-colors',
                      isChecked && 'border-emerald-400/45 bg-emerald-400/[0.12]',
                      isToday && !isChecked && 'daily-checkin-today border-cyan-300/70 bg-cyan-400/[0.14]',
                      !isChecked && !isToday && 'border-cyan-700/35 bg-cyan-950/20',
                      isPast && !isChecked && 'border-cyan-900/45 bg-cyan-950/10 opacity-55'
                    )}
                  >
                    {isToday && <span className="absolute inset-x-2 top-1 h-px bg-cyan-200/60" />}
                    <span className={cn(
                      'max-w-full truncate text-[10px] font-black uppercase leading-none tracking-wide',
                      isChecked
                        ? 'text-emerald-200'
                        : isToday
                          ? 'text-cyan-50'
                          : isPast
                            ? 'text-cyan-200/45'
                            : 'text-cyan-100/75'
                    )}>
                      {reward.dayName || t(`days.${dayLabelKeys[i]}`)}
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
                        `+${getRewardPoints(reward)}`
                      )}
                    </span>
                    {(reward.bonusType || reward.bonusPoints > 0) && (
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
              })
            ) : (
              placeholderDays.map((i) => (
                <div
                  key={i}
                  className="daily-checkin-day relative flex h-11 flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border border-cyan-700/35 bg-cyan-950/20 px-1"
                >
                  <span className="max-w-full truncate text-[10px] font-black uppercase leading-none tracking-wide text-cyan-100/50">
                    {t(`days.${dayLabelKeys[i]}`)}
                  </span>
                  <span className="font-mono text-sm font-black leading-none text-cyan-300/40">
                    +--
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:justify-end">
          <span className="hidden items-center gap-1.5 rounded-md border border-emerald-300/20 bg-emerald-400/[0.07] px-2.5 py-1.5 text-xs text-emerald-100/85 lg:flex">
            <Shield size={13} className="text-emerald-300" />
            {daysToBonus} {t('bonusIn')}
          </span>
          {hasClaimedToday ? (
            <span className="daily-checkin-claimed flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-green-400/35 bg-green-400/12 px-3 py-2 text-xs font-black text-green-300 md:flex-none">
              <Check size={14} /> {t('checkedIn')}
            </span>
          ) : (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn || rewardsLoading || !canClaimToday}
              className="daily-checkin-button flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-cyan-400 px-4 py-2 text-xs font-black text-black transition-colors hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60 md:flex-none"
            >
              <Gift size={14} /> {isCheckingIn ? tCommon('loading') : t('claimReward')}
            </button>
          )}
        </div>
        {(errorMessage || rewardsError) && (
          <p className="md:col-span-3 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {errorMessage ?? rewardsError}
          </p>
        )}
      </div>
      )}
      {/* Premium Cyberpunk Daily Check-in Success Streak Modal */}
      {checkInModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes checkin-pulse {
              0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4), 0 0 40px rgba(34, 211, 238, 0.2); }
              50% { box-shadow: 0 0 35px rgba(6, 182, 212, 0.6), 0 0 60px rgba(34, 211, 238, 0.4); }
            }
            @keyframes scanline-checkin {
              0% { top: 0%; }
              100% { top: 100%; }
            }
            @keyframes pop-streak {
              0% { transform: scale(0.6); opacity: 0; }
              50% { transform: scale(1.15); }
              100% { transform: scale(1); opacity: 1; }
            }
            .cyber-checkin-modal {
              animation: checkin-pulse 3s infinite alternate;
            }
            .scan-line-checkin {
              animation: scanline-checkin 2.5s linear infinite;
            }
            .streak-pop {
              animation: pop-streak 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
          `}} />
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setCheckInModal((prev) => ({ ...prev, isOpen: false }))}
          />

          {/* Modal Container */}
          <div className="cyber-checkin-modal relative w-full max-w-sm overflow-hidden rounded-2xl border-2 border-cyan-500/50 bg-[#060913] p-6 text-center shadow-2xl transition-all duration-300">
            {/* Holographic grid and scanning line */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,38,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.3)_1px,transparent_1px)] bg-[size:20px_20px] opacity-25" />
            <div className="scan-line-checkin absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-40" />

            {/* Corner Decos */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-amber-400" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-amber-400" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

            <div className="relative z-10 space-y-5">
              {/* Pulsing fire/shield crest */}
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/20 via-orange-500/10 to-amber-500/20 p-2 border border-cyan-400/30">
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#090e1a] border border-orange-500/40 animate-pulse">
                  <Flame size={44} className="text-orange-400 animate-bounce" />
                  <Sparkles size={20} className="absolute -top-1 -right-1 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
                </div>
              </div>

              <div>
                <span className="inline-block rounded-full bg-cyan-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-cyan-300 uppercase border border-cyan-500/20">
                  {t('claimed')} SECURED
                </span>
                <h2 className="mt-3 font-display text-2xl font-black text-white">
                  {t('checkedIn')}!
                </h2>
                <p className="mt-1 text-xs text-cyan-400/70 font-mono">
                  STREAK MULTIPLIER ACTIVE
                </p>
              </div>

              {/* Streak info & rewards */}
              <div className="grid grid-cols-2 gap-3 py-1">
                {/* Streak count */}
                <div className="streak-pop opacity-0 rounded-xl border border-orange-500/30 bg-orange-950/20 p-3 text-center" style={{ animationDelay: '0.1s' }}>
                  <div className="font-mono text-3xl font-black text-orange-400">
                    {checkInModal.streak}
                  </div>
                  <div className="mt-1 text-[9px] uppercase font-bold tracking-wider text-orange-500">
                    Day Streak
                  </div>
                </div>

                {/* Points Earned */}
                <div className="streak-pop opacity-0 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-3 text-center" style={{ animationDelay: '0.2s' }}>
                  <div className="font-mono text-3xl font-black text-cyan-300">
                    +{checkInModal.points}
                  </div>
                  <div className="mt-1 text-[9px] uppercase font-bold tracking-wider text-cyan-500">
                    {t('pointsShort')}
                  </div>
                </div>
              </div>

              {/* Special Streak Shield Bonus */}
              {checkInModal.bonusShield && (
                <div className="streak-pop opacity-0 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3 text-emerald-300" style={{ animationDelay: '0.3s' }}>
                  <Shield size={18} className="text-emerald-400 animate-pulse" />
                  <div className="text-left">
                    <div className="text-xs font-bold font-mono">STREAK SHIELD EARNED</div>
                    <div className="text-[9px] text-emerald-400/80">Protects your streak for 1 missed day!</div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <button
                className="w-full rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black py-2.5 text-xs font-black uppercase tracking-widest border border-cyan-300/40 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-colors"
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
