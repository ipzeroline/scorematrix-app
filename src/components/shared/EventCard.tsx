'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { Trophy, Globe, Star, Calendar, Users, Clock } from 'lucide-react';
import type { SpecialEvent } from '@/types/event';

const TOURNAMENT_ICONS: Record<string, React.ReactNode> = {
  worldCup: <Trophy size={16} className="text-amber-400" />,
  ucl: <Star size={16} className="text-cyan-400" />,
  afc: <Globe size={16} className="text-emerald-400" />,
  custom: <Calendar size={16} className="text-violet-400" />,
};

const STATUS_BADGE: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  ended: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

export function EventCard({ event }: { event: SpecialEvent }) {
  const { locale } = useParams<{ locale: string }>();
  const t = useTranslations('events');
  const [now] = useState(() => Date.now());

  const daysUntilStart = Math.ceil(
    (new Date(event.startDate).getTime() - now) / 86400000
  );

  const isActive = event.status === 'active';
  const isFree = event.entryFee === 0;

  return (
    <Link href={`/${locale}/events/${event.id}`}>
      <Card hover className={cn('p-5 h-full transition-all', isActive && 'ring-1 ring-green-500/20')}>
        {/* Status + Tournament type */}
        <div className="flex items-center justify-between mb-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            {TOURNAMENT_ICONS[event.tournamentType] ?? <Calendar size={16} />}
            {t(`tournamentTypes.${event.tournamentType}`)}
          </span>
          <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold border', STATUS_BADGE[event.status])}>
            {t(`statuses.${event.status}`)}
          </span>
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2">{event.name}</h3>

        {/* Description */}
        <p className="text-xs text-gray-400 mb-4 line-clamp-2 whitespace-pre-line">{event.description}</p>

        {/* Meta */}
        <div className="space-y-1.5 text-[10px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>
              {event.status === 'upcoming'
                ? daysUntilStart > 0
                  ? t('startsInDays', { days: daysUntilStart })
                  : t('startingSoon')
                : event.status === 'active'
                  ? t('inProgress')
                  : t('ended')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            <span>
              {event.maxParticipants
                ? t('participantLimit', {
                    count: event.participantCount.toLocaleString(),
                    max: event.maxParticipants.toLocaleString(),
                  })
                : t('participantCount', { count: event.participantCount.toLocaleString() })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Trophy size={12} />
            <span>{t('rewardTierCount', { count: event.rewards.length })}</span>
          </div>
        </div>

        {/* Entry fee */}
        <div className="mt-4 pt-3 border-t border-gray-800/50 flex items-center justify-between">
          <span className={cn('text-xs font-bold', isFree ? 'text-green-400' : 'text-amber-400')}>
            {formatEntryFee(event, t)}
          </span>
          <span className="text-[10px] text-cyan-400 font-medium">
            {isActive ? t('viewEvent') : t('details')}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function formatEntryFee(
  event: SpecialEvent,
  t: ReturnType<typeof useTranslations<'events'>>
) {
  const points = event.entryFeePoints ?? 0;
  const credits = event.entryFeeCredits ?? event.entryFee;

  if (points <= 0 && credits <= 0) return t('freeEntry');
  if (points > 0 && credits > 0) {
    return `${t('pointsAmount', { amount: points })} + ${t('creditsAmount', { amount: credits })}`;
  }
  if (points > 0) return t('pointsAmount', { amount: points });
  return t('creditsAmount', { amount: credits });
}
