'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Gift, Crown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { getRewards, mapApiReward, DEFAULT_REWARDS_RESPONSE, type RewardViewItem } from '@/lib/rewards-api';
import { formatPoints } from '@/lib/currency';
import { useUserStore } from '@/stores/user-store';

const emptySubscribe = () => () => {};

function getDefaultSidebarRewards() {
  return (DEFAULT_REWARDS_RESPONSE?.data ?? [])
    .map(mapApiReward)
    .filter((reward) => reward.isActive)
    .slice(0, 4);
}

interface RewardsWidgetProps {
  initialHasAuthSession?: boolean;
}

export function RewardsWidget({ initialHasAuthSession = false }: RewardsWidgetProps) {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const effectiveIsLoggedIn = initialHasAuthSession || (isMounted && isLoggedIn);
  
  const [rewards, setRewards] = useState<RewardViewItem[]>(getDefaultSidebarRewards);

  useEffect(() => {
    if (!effectiveIsLoggedIn) return;

    let active = true;

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

  return (
    <Card className="relative overflow-hidden border border-border bg-surface p-4 hover:border-magenta/35 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-magenta/25 bg-magenta/10 text-magenta">
            <Gift size={14} />
          </span>
          <h3 className="text-sm font-bold text-white">{t('nav.rewards')}</h3>
        </div>
        <span className="flex items-center gap-1 rounded border border-magenta/25 bg-magenta/10 px-2 py-0.5 text-[10px] font-bold text-magenta">
          <Crown size={10} aria-hidden="true" />
          {rewards.length}
        </span>
      </div>

      {/* Body */}
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

      {/* Footer link */}
      <div className="mt-4 pt-3 border-t border-border/40">
        <Link
          href={`/${locale}/rewards`}
          className="group/btn flex items-center justify-center gap-1 w-full rounded-lg border border-border bg-[#151620] py-2 text-xs font-bold text-text-secondary transition-all duration-150 hover:bg-magenta/5 hover:border-magenta/35 hover:text-magenta-dim"
        >
          <span>{t('common.viewAll')}</span>
          <ChevronRight size={13} className="text-text-muted group-hover/btn:text-magenta-dim transition-colors" />
        </Link>
      </div>
    </Card>
  );
}
