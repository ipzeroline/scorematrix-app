'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Zap, Gift, CheckCircle2, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { getMissions, mapApiMission, DEFAULT_MISSIONS_RESPONSE } from '@/lib/missions-api';
import { getRewards, mapApiReward, DEFAULT_REWARDS_RESPONSE, type RewardViewItem } from '@/lib/rewards-api';
import { formatPoints } from '@/lib/currency';
import { useUserStore } from '@/stores/user-store';
import { MissionType } from '@/types/common';
import type { Mission } from '@/types/mission';

const emptySubscribe = () => () => {};

const categoryColors: Record<string, 'cyan' | 'green' | 'gold' | 'purple' | 'magenta'> = {
  predict: 'cyan',
  streak: 'gold',
  accuracy: 'green',
  social: 'purple',
  daily_login: 'magenta',
};

function getDefaultSidebarMissions() {
  return [
    ...(DEFAULT_MISSIONS_RESPONSE?.daily ?? []).map((m) => mapApiMission(m, MissionType.DAILY)),
    ...(DEFAULT_MISSIONS_RESPONSE?.weekly ?? []).map((m) => mapApiMission(m, MissionType.WEEKLY)),
    ...(DEFAULT_MISSIONS_RESPONSE?.special ?? []).map((m) => mapApiMission(m, MissionType.SPECIAL)),
  ].slice(0, 4);
}

function getDefaultSidebarRewards() {
  return (DEFAULT_REWARDS_RESPONSE?.data ?? [])
    .map(mapApiReward)
    .filter((reward) => reward.isActive)
    .slice(0, 4);
}

interface MissionsAndRewardsWidgetProps {
  initialHasAuthSession?: boolean;
}

export function MissionsAndRewardsWidget({ initialHasAuthSession = false }: MissionsAndRewardsWidgetProps) {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState<'missions' | 'rewards'>('missions');
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);
  
  const [missions, setMissions] = useState<Mission[]>(getDefaultSidebarMissions);
  const [rewards, setRewards] = useState<RewardViewItem[]>(getDefaultSidebarRewards);

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

    getMissions({ locale })
      .then((response) => {
        if (!active) return;
        const nextMissions = [
          ...(response?.daily ?? []).map((m) => mapApiMission(m, MissionType.DAILY)),
          ...(response?.weekly ?? []).map((m) => mapApiMission(m, MissionType.WEEKLY)),
          ...(response?.special ?? []).map((m) => mapApiMission(m, MissionType.SPECIAL)),
        ].slice(0, 4);
        setMissions(nextMissions.length > 0 ? nextMissions : getDefaultSidebarMissions());
      })
      .catch(() => {
        if (active) setMissions(getDefaultSidebarMissions());
      });

    getRewards({ locale })
      .then((response) => {
        if (!active) return;
        const nextRewards = (response?.data ?? [])
          .map(mapApiReward)
          .filter((reward) => reward.isActive)
          .slice(0, 4);
        setRewards(nextRewards.length > 0 ? nextRewards : getDefaultSidebarRewards());
      })
      .catch(() => {
        if (active) setRewards(getDefaultSidebarRewards());
      });

    return () => {
      active = false;
    };
  }, [effectiveIsLoggedIn, locale]);

  if (!effectiveIsLoggedIn) {
    return null;
  }

  const completedMissionsCount = missions.filter((m) => m.completed || m.claimed).length;

  return (
    <Card className="relative overflow-hidden border border-border bg-surface p-4 hover:border-cyan/20 transition-all duration-300">
      {/* Header Tabs */}
      <div className="flex border-b border-border/60 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('missions')}
          className={cn(
            'flex items-center gap-2 pb-2 px-1 text-sm font-bold border-b-2 transition-all duration-150',
            activeTab === 'missions'
              ? 'border-purple-500 text-purple-300'
              : 'border-transparent text-text-secondary hover:text-white'
          )}
        >
          <Zap size={14} className={activeTab === 'missions' ? 'text-purple-400' : 'text-text-muted'} />
          <span>{t('nav.missions')}</span>
          <span className={cn(
            'ml-1 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border',
            activeTab === 'missions'
              ? 'bg-purple-500/10 border-purple-500/25 text-purple-300'
              : 'bg-black/20 border-border/40 text-text-muted'
          )}>
            {completedMissionsCount}/{missions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('rewards')}
          className={cn(
            'flex items-center gap-2 pb-2 px-1 ml-6 text-sm font-bold border-b-2 transition-all duration-150',
            activeTab === 'rewards'
              ? 'border-magenta text-magenta-dim'
              : 'border-transparent text-text-secondary hover:text-white'
          )}
        >
          <Gift size={14} className={activeTab === 'rewards' ? 'text-magenta' : 'text-text-muted'} />
          <span>{t('nav.rewards')}</span>
          <span className={cn(
            'ml-1 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold border',
            activeTab === 'rewards'
              ? 'bg-magenta/10 border-magenta/25 text-magenta'
              : 'bg-black/20 border-border/40 text-text-muted'
          )}>
            {rewards.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[220px]">
        {activeTab === 'missions' ? (
          <div className="space-y-2.5">
            {missions.map((mission) => {
              const done = mission.completed || mission.claimed || mission.progress >= mission.target;
              const reward = mission.rewardCredits && mission.rewardCredits > 0
                ? `+${mission.rewardCredits} CR`
                : `+${mission.rewardXP} XP`;
              const color = categoryColors[mission.category] ?? 'cyan';

              return (
                <div key={mission.id} className="rounded-lg border border-border bg-black/20 p-2.5 hover:border-border/80 transition-colors">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-semibold text-gray-200">
                      <CheckCircle2
                        size={12}
                        className={done ? 'text-green' : 'text-purple-400'}
                        aria-hidden="true"
                      />
                      <span className="truncate">{mission.title}</span>
                    </span>
                    <span className={cn(
                      'shrink-0 text-[10px] font-bold font-mono px-1 rounded',
                      mission.rewardCredits && mission.rewardCredits > 0 ? 'text-cyan bg-cyan/5' : 'text-purple-300 bg-purple-500/5'
                    )}>
                      {reward}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ProgressBar
                      value={mission.progress}
                      max={mission.target || 1}
                      color={done ? 'green' : color}
                      size="sm"
                      className="flex-1 min-w-0"
                    />
                    <span className="w-8 text-right text-[10px] font-mono text-text-muted">
                      {mission.progress}/{mission.target}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {rewards.map((reward) => (
              <div key={reward.id} className="rounded-lg border border-border bg-black/20 p-2.5 hover:border-border/80 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs font-semibold text-white">
                    {reward.name}
                  </span>
                  <span className="shrink-0 text-[10px] font-mono font-bold text-gold bg-gold/5 px-1.5 py-0.5 rounded border border-gold/10">
                    {formatPoints(reward.pointsCost)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="rounded bg-magenta/5 border border-magenta/10 px-1.5 py-0.5 text-[9px] font-bold text-magenta">
                    {t(`rewards.${reward.category}`)}
                  </span>
                  <span className={cn(
                    'text-[9px] font-mono font-bold',
                    reward.stock <= 30 ? 'text-red' : 'text-text-muted'
                  )}>
                    stock {reward.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-border/40">
        <Link
          href={`/${locale}/${activeTab}`}
          className="group/btn flex items-center justify-center gap-1 w-full rounded-lg border border-border bg-[#151620] py-2 text-xs font-bold text-text-secondary transition-all duration-150 hover:bg-cyan/5 hover:border-cyan/35 hover:text-cyan"
        >
          <span>{t('common.viewAll')}</span>
          <ChevronRight size={13} className="text-text-muted group-hover/btn:text-cyan transition-colors" />
        </Link>
      </div>
    </Card>
  );
}
