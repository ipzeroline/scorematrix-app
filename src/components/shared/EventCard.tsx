'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import {
  Calendar,
  ChevronRight,
  Clock,
  Globe,
  Star,
  Trophy,
  Users,
} from 'lucide-react';
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
  const isRegistered = Boolean(event.isRegistered);

  return (
    <Link href={`/${locale}/events/${event.id}`} className="group">
      <Card
        hover
        neon={isActive ? 'green' : 'cyan'}
        className={cn(
          'relative h-full overflow-hidden border-white/10 bg-[#0b111d] p-4 transition-all sm:p-5',
          isActive && 'border-green-400/25 ring-1 ring-green-500/20'
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/60 via-purple-400/50 to-amber-300/50" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-gray-400">
            {TOURNAMENT_ICONS[event.tournamentType] ?? <Calendar size={16} />}
            {t(`tournamentTypes.${event.tournamentType}`)}
          </span>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {isRegistered && (
              <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-green-400">
                {t('registeredStatus')}
              </span>
            )}
            <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider', STATUS_BADGE[event.status])}>
              {t(`statuses.${event.status}`)}
            </span>
          </div>
        </div>

        <h3 className="mb-3 line-clamp-2 text-xl font-black leading-tight text-white">
          {event.name}
        </h3>

        <p className="mb-5 line-clamp-3 whitespace-pre-line text-sm leading-6 text-gray-400">
          {event.description}
        </p>

        <div className="space-y-2.5 text-sm text-gray-400">
          <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-black/20 px-3 py-2">
            <Clock size={14} className="text-cyan-300" />
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
          <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-black/20 px-3 py-2">
            <Users size={14} className="text-purple-300" />
            <span>
              {event.maxParticipants
                ? t('participantLimit', {
                    count: event.participantCount.toLocaleString(),
                    max: event.maxParticipants.toLocaleString(),
                  })
                : t('participantCount', { count: event.participantCount.toLocaleString() })}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-black/20 px-3 py-2">
            <Trophy size={14} className="text-amber-300" />
            <span>{t('rewardTierCount', { count: event.rewards.length })}</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-gray-800/70 pt-4">
          <span className={cn('text-sm font-black', isFree ? 'text-green-400' : 'text-amber-400')}>
            {formatEntryFee(event, t)}
          </span>
          <span className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-cyan-500 px-3 text-xs font-black text-black transition-colors group-hover:bg-cyan-400">
            {isRegistered ? t('registeredStatus') : isActive ? t('viewEvent') : t('details')}
            <ChevronRight size={14} />
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
