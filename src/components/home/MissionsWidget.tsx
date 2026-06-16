'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Target, 
  Flame, 
  Award, 
  Share2, 
  Calendar,
  CalendarCheck,
  CalendarClock, 
  Sparkles, 
  Loader2,
  Lock,
  Compass
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { XPProgressBar } from '@/components/shared/XPProgressBar';
import { cn } from '@/lib/utils';
import { getMissions, mapApiMission, claimMission, DEFAULT_MISSIONS_RESPONSE, type ApiMission } from '@/lib/missions-api';
import { getMissionPageCopy } from '@/data/mission-page-content';
import { MissionType } from '@/types/common';
import type { Mission } from '@/types/mission';
import { useUserStore } from '@/stores/user-store';

const emptySubscribe = () => () => {};

function getCategoryIcon(category: string) {
  switch (category) {
    case 'predict':
      return Target;
    case 'streak':
      return Flame;
    case 'accuracy':
      return Award;
    case 'social':
      return Share2;
    case 'daily_login':
      return CalendarClock;
    default:
      return Zap;
  }
}

function getCategoryStyles(category: string) {
  switch (category) {
    case 'predict':
      return {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20 border-b-cyan-500/40',
        progress: 'cyan' as const,
        glow: 'group-hover:border-cyan-500/40 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]',
        colorName: 'cyan'
      };
    case 'streak':
      return {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20 border-b-amber-500/40',
        progress: 'gold' as const,
        glow: 'group-hover:border-amber-500/40 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.12)]',
        colorName: 'gold'
      };
    case 'accuracy':
      return {
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20 border-b-emerald-500/40',
        progress: 'green' as const,
        glow: 'group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.12)]',
        colorName: 'green'
      };
    case 'social':
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20 border-b-purple-500/40',
        progress: 'purple' as const,
        glow: 'group-hover:border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]',
        colorName: 'purple'
      };
    case 'daily_login':
      return {
        text: 'text-fuchsia-400',
        bg: 'bg-fuchsia-500/10',
        border: 'border-fuchsia-500/20 border-b-fuchsia-500/40',
        progress: 'magenta' as const,
        glow: 'group-hover:border-fuchsia-500/40 group-hover:shadow-[0_0_20px_rgba(217,70,239,0.12)]',
        colorName: 'magenta'
      };
    default:
      return {
        text: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20 border-b-purple-500/40',
        progress: 'purple' as const,
        glow: 'group-hover:border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.12)]',
        colorName: 'purple'
      };
  }
}

interface MissionsWidgetProps {
  initialHasAuthSession?: boolean;
}

export function MissionsWidget({ initialHasAuthSession = false }: MissionsWidgetProps) {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const copy = getMissionPageCopy(locale);
  
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);

  const userXP = useUserStore((s) => s.xp);
  const userLevel = useUserStore((s) => s.level);
  const userRank = useUserStore((s) => s.rank);
  const userStreak = useUserStore((s) => s.streak);
  const missionsCompleted = useUserStore((s) => s.missionsCompleted);
  
  const [daily, setDaily] = useState<Mission[]>([]);
  const [weekly, setWeekly] = useState<Mission[]>([]);
  const [special, setSpecial] = useState<Mission[]>([]);
  
  const [claimingIds, setClaimingIds] = useState<Record<string, boolean>>({});
  const [localClaimed, setLocalClaimed] = useState<Record<string, boolean>>({});
  const [claimToast, setClaimToast] = useState<{ show: boolean; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');

  const mapList = (list: ApiMission[], type: MissionType) => (list ?? []).map((m) => mapApiMission(m, type));

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

    getMissions({ locale })
      .then((response) => {
        if (!active) return;
        setDaily(mapList(response?.daily, MissionType.DAILY));
        setWeekly(mapList(response?.weekly, MissionType.WEEKLY));
        setSpecial(mapList(response?.special, MissionType.SPECIAL));
      })
      .catch(() => {
        if (!active) return;
        setDaily(mapList(DEFAULT_MISSIONS_RESPONSE.daily, MissionType.DAILY));
        setWeekly(mapList(DEFAULT_MISSIONS_RESPONSE.weekly, MissionType.WEEKLY));
        setSpecial(mapList(DEFAULT_MISSIONS_RESPONSE.special, MissionType.SPECIAL));
      });

    return () => {
      active = false;
    };
  }, [effectiveIsLoggedIn, locale]);

  const handleClaim = async (mission: Mission) => {
    if (claimingIds[mission.id] || localClaimed[mission.id]) return;

    setClaimingIds((prev) => ({ ...prev, [mission.id]: true }));
    try {
      await claimMission(mission.id, { locale });
      setLocalClaimed((prev) => ({ ...prev, [mission.id]: true }));
      
      const store = useUserStore.getState();
      const rewardCredits = mission.rewardCredits ?? 0;
      const nextPoints = store.freePoints + mission.rewardPoints;
      const nextCredits = store.premiumCredits + rewardCredits;
      const nextXP = store.xp + mission.rewardXP;
      const nextLevel = Math.floor(nextXP / 1000) + 1;
      const nextCompleted = store.missionsCompleted + 1;

      useUserStore.setState({
        freePoints: nextPoints,
        premiumCredits: nextCredits,
        xp: nextXP,
        level: nextLevel,
        missionsCompleted: nextCompleted,
      });

      const rewardsText = [
        mission.rewardPoints > 0 ? `+${mission.rewardPoints} PTS` : null,
        mission.rewardXP > 0 ? `+${mission.rewardXP} XP` : null,
        rewardCredits > 0 ? `+${rewardCredits} CR` : null,
      ].filter(Boolean).join(' · ');

      setClaimToast({
        show: true,
        text: `${t('gamification.claim')} ${mission.title}! ${rewardsText}`
      });

    } catch (err) {
      console.warn("Failed to claim mission on server, applying local state", err);
      setLocalClaimed((prev) => ({ ...prev, [mission.id]: true }));
      const store = useUserStore.getState();
      const rewardCredits = mission.rewardCredits ?? 0;
      useUserStore.setState({
        freePoints: store.freePoints + mission.rewardPoints,
        premiumCredits: store.premiumCredits + rewardCredits,
        xp: store.xp + mission.rewardXP,
        missionsCompleted: store.missionsCompleted + 1,
      });

      const rewardsText = [
        mission.rewardPoints > 0 ? `+${mission.rewardPoints} PTS` : null,
        mission.rewardXP > 0 ? `+${mission.rewardXP} XP` : null,
        rewardCredits > 0 ? `+${rewardCredits} CR` : null,
      ].filter(Boolean).join(' · ');

      setClaimToast({
        show: true,
        text: `${t('gamification.claim')} ${mission.title}! ${rewardsText}`
      });
    } finally {
      setClaimingIds((prev) => ({ ...prev, [mission.id]: false }));
    }
  };

  useEffect(() => {
    if (!claimToast) return;
    const timer = setTimeout(() => {
      setClaimToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [claimToast]);

  if (!effectiveIsLoggedIn) {
    return null;
  }

  const activeMissions = activeTab === 'daily' ? daily : activeTab === 'weekly' ? weekly : special;

  const levelBadgeColor = (lvl: number): string => {
    if (lvl >= 50) return "text-magenta border-magenta bg-magenta/10 shadow-[0_0_8px_rgba(255,0,160,0.2)]";
    if (lvl >= 30) return "text-purple border-purple bg-purple/10 shadow-[0_0_8px_rgba(189,0,255,0.2)]";
    if (lvl >= 15) return "text-cyan border-cyan bg-cyan/10 shadow-[0_0_8px_rgba(0,240,255,0.2)]";
    if (lvl >= 5) return "text-amber-400 border-amber-500 bg-amber-500/10";
    return "text-green border-green bg-green/10";
  };

  return (
    <div className="relative flex flex-col gap-6 w-full">
      {claimToast && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#071911] px-5 py-3.5 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <CheckCircle2 size={16} />
          </span>
          <p className="text-xs font-bold text-emerald-200">{claimToast.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_1fr]">
        
        <Card className="relative flex flex-col justify-between overflow-hidden border border-cyan-300/15 bg-[#0b111d]/95 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-sm">
          <div className="absolute -top-12 -left-12 h-32 w-32 rounded-full bg-purple/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-cyan/10 blur-3xl pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-purple-300" />
          
          <div className="relative space-y-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-base font-black uppercase tracking-wide",
                levelBadgeColor(userLevel)
              )}>
                Lv.{userLevel}
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide text-gray-400">
                  {t('gamification.rank')}: <span className="text-purple-300">{userRank.toUpperCase()}</span>
                </span>
                <span className="block truncate text-lg font-black leading-tight text-white">
                  {copy.title} {t('nav.profile')}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/24 p-3.5">
              <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wide text-gray-400">
                <span>{t('gamification.xp')} {copy.progress}</span>
                <span className="text-white">{userXP % 1000}/1000 XP</span>
              </div>
              <XPProgressBar currentXP={userXP} level={userLevel} className="!space-y-0" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-3 text-center">
                <Flame size={18} className="text-amber-500 mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{t('leaderboard.streak')}</span>
                <span className="mt-1 text-xl font-black leading-none text-white">{userStreak} {copy.days}</span>
              </div>
              <div className="flex flex-col items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.04] p-3 text-center">
                <CheckCircle2 size={18} className="text-emerald-500 mb-1" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{copy.title} {t('gamification.complete')}</span>
                <span className="mt-1 text-xl font-black leading-none text-white">{missionsCompleted}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-5 border-t border-white/10 pt-4 text-center">
            <p className="text-xs font-semibold leading-relaxed text-gray-400">
              &ldquo;{copy.subtitle}&rdquo;
            </p>
          </div>
        </Card>

        <Card className="flex flex-col justify-between border border-cyan-300/15 bg-[#0d0e14] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="space-y-5">
            <div className="grid gap-4 border-b border-white/10 pb-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-purple-300/25 bg-purple-300/10 text-purple-200 shadow-[0_0_24px_rgba(168,85,247,0.14)]">
                  <Sparkles size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="whitespace-nowrap text-2xl font-black leading-tight text-white [word-break:keep-all]">
                    {copy.title}
                  </h3>
                  <p className="mt-1 max-w-[680px] text-sm font-semibold leading-6 text-gray-400">
                    {copy.subtitle}
                  </p>
                </div>
              </div>
              
              <div className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-white/10 bg-[#090a0f] p-1 shadow-inner shadow-black/40 xl:w-[400px]">
                <button
                  onClick={() => setActiveTab('daily')}
                  className={cn(
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-extrabold whitespace-nowrap [word-break:keep-all] transition-all duration-150',
                    activeTab === 'daily'
                      ? 'border border-cyan-300/50 bg-gradient-to-br from-cyan-300/20 via-indigo-500/18 to-fuchsia-500/16 text-white shadow-[0_0_24px_rgba(34,211,238,0.14)]'
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <CalendarCheck size={16} className="shrink-0" />
                  {copy.daily}
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={cn(
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-extrabold whitespace-nowrap [word-break:keep-all] transition-all duration-150',
                    activeTab === 'weekly'
                      ? 'border border-cyan-300/50 bg-gradient-to-br from-cyan-300/20 via-indigo-500/18 to-fuchsia-500/16 text-white shadow-[0_0_24px_rgba(34,211,238,0.14)]'
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <Calendar size={16} className="shrink-0" />
                  {copy.weekly}
                </button>
                <button
                  onClick={() => setActiveTab('special')}
                  className={cn(
                    'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-transparent px-3 py-2 text-sm font-extrabold whitespace-nowrap [word-break:keep-all] transition-all duration-150',
                    activeTab === 'special'
                      ? 'border border-cyan-300/50 bg-gradient-to-br from-cyan-300/20 via-indigo-500/18 to-fuchsia-500/16 text-white shadow-[0_0_24px_rgba(34,211,238,0.14)]'
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-white'
                  )}
                >
                  <Sparkles size={16} className="shrink-0" />
                  {copy.special}
                </button>
              </div>
            </div>

            {activeMissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Compass className="h-10 w-10 text-border animate-pulse mb-3" />
                <p className="text-xs font-bold text-text-muted">{copy.noMissions}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {activeMissions.map((mission) => {
                  const isClaimed = localClaimed[mission.id] || mission.claimed;
                  const isCompleted = mission.completed || mission.progress >= mission.target;
                  const isClaiming = claimingIds[mission.id];
                  const styles = getCategoryStyles(mission.category);
                  const Icon = getCategoryIcon(mission.category);

                  return (
                    <div
                      key={mission.id}
                      className={cn(
                        'group flex min-h-[148px] flex-col justify-between rounded-2xl border border-white/10 bg-[#080d16] p-3.5 transition-all duration-300',
                        styles.glow,
                        isClaimed && 'border-green-500/15 opacity-80 hover:shadow-none'
                      )}
                    >
                      <div>
                        <div className="mb-3 flex items-start justify-between gap-2.5">
                          <span className={cn(
                            'grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-300',
                            isClaimed ? 'bg-green-500/10 border-green-500/20 text-green-400' : `${styles.bg} ${styles.border} ${styles.text}`
                          )}>
                            <Icon size={17} className="transition-transform duration-200 group-hover:scale-110" />
                          </span>
                          
                          <div className="flex max-w-[132px] flex-wrap justify-end gap-1">
                            {mission.rewardPoints > 0 && (
                              <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-300">
                                +{mission.rewardPoints} PTS
                              </span>
                            )}
                            {mission.rewardCredits && mission.rewardCredits > 0 ? (
                              <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black text-cyan-300">
                                +{mission.rewardCredits} CR
                              </span>
                            ) : (
                              mission.rewardXP > 0 && (
                                <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] font-black text-purple-200">
                                  +{mission.rewardXP} XP
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <h4 className="text-lg font-black leading-tight text-white transition-colors duration-150 group-hover:text-cyan-200">
                          {mission.title}
                        </h4>
                        <p className="mt-1.5 line-clamp-2 text-xs font-semibold leading-relaxed text-gray-400">
                          {mission.description || copy.inProgress}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-2.5 border-t border-white/10 pt-3">
                        <div className="flex-1 min-w-0">
                          <div className="mb-1.5 flex justify-between text-[11px] font-black">
                            <span className="text-gray-300">
                              {isClaimed ? t('gamification.complete') : `${copy.progress} (${Math.min(mission.progress, mission.target)}/${mission.target})`}
                            </span>
                          </div>
                          <ProgressBar
                            value={isClaimed ? mission.target : mission.progress}
                            max={mission.target || 1}
                            color={isClaimed ? 'green' : styles.progress}
                            size="sm"
                          />
                        </div>

                        <div className="shrink-0">
                          {isClaimed ? (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green">
                              <CheckCircle2 size={14} />
                              {t('gamification.claimed')}
                            </span>
                          ) : isCompleted ? (
                            <button
                              onClick={() => handleClaim(mission)}
                              disabled={isClaiming}
                              className={cn(
                                "flex items-center justify-center rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wide text-black transition-all duration-200",
                                isClaiming 
                                  ? "bg-slate-800 border-slate-700 text-text-muted" 
                                  : "bg-cyan border-cyan-300 hover:bg-[#00d0ff] hover:scale-105 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                              )}
                            >
                              {isClaiming ? (
                                <Loader2 size={11} className="animate-spin" />
                              ) : (
                                t('gamification.claim')
                              )}
                            </button>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                              <Lock size={12} />
                              {copy.inProgress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t border-white/10 pt-4">
            <Link
              href={`/${locale}/missions`}
              className="group/btn flex items-center gap-2 rounded-xl border border-purple-300/15 bg-purple-300/5 px-4 py-2 text-sm font-black text-purple-200 transition-all duration-150 hover:border-purple-300/30 hover:bg-purple-300/10 hover:text-white"
            >
              <span>{t('common.viewAll')}</span>
              <ChevronRight size={16} className="text-purple-200 transition-colors group-hover/btn:text-white" />
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
