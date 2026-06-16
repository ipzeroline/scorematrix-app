'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  CalendarClock,
  Flame,
  Radio,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/components/shared/EventCard';
import {
  DEFAULT_EVENTS_RESPONSE,
  getEvents,
  mapApiEvent,
} from '@/lib/events-api';
import { cn } from '@/lib/utils';
import type { SpecialEvent } from '@/types/event';

type Filter = 'all' | 'upcoming' | 'active' | 'ended';

export default function EventsPage() {
  const t = useTranslations('events');
  const { locale } = useParams<{ locale: string }>();
  const [filter, setFilter] = useState<Filter>('all');
  const [events, setEvents] = useState<SpecialEvent[]>(
    DEFAULT_EVENTS_RESPONSE.data.map(mapApiEvent)
  );

  useEffect(() => {
    let active = true;

    getEvents({ locale })
      .then((response) => {
        if (!active) return;
        setEvents(response.data.map(mapApiEvent));
      })
      .catch(() => {
        if (!active) return;
        setEvents(DEFAULT_EVENTS_RESPONSE.data.map(mapApiEvent));
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const filtered = (filter === 'all'
    ? events
    : events.filter((e) => e.status === filter))
    .slice()
    .sort(sortEventsByPriority);

  const activeEvent = events.find((e) => e.status === 'active');
  const upcomingCount = events.filter((event) => event.status === 'upcoming').length;
  const activeCount = events.filter((event) => event.status === 'active').length;
  const registeredCount = events.filter((event) => event.isRegistered).length;
  const totalParticipants = events.reduce(
    (sum, event) => sum + event.participantCount,
    0
  );
  const featuredEvent = activeEvent ?? filtered[0] ?? events[0];
  const filterCounts: Record<Filter, number> = {
    all: events.length,
    upcoming: upcomingCount,
    active: activeCount,
    ended: events.filter((event) => event.status === 'ended').length,
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_34%),linear-gradient(315deg,rgba(217,70,239,0.12),transparent_32%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
          <div className="flex min-h-[320px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {t('commandCenter')}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {t('skillNotice')}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t('title')}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t('subtitle')}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroMetric
                icon={Flame}
                label={t('activeEvents')}
                value={activeCount.toLocaleString()}
                tone="text-emerald-300"
              />
              <HeroMetric
                icon={CalendarClock}
                label={t('upcomingEvents')}
                value={upcomingCount.toLocaleString()}
                tone="text-cyan-300"
              />
              <HeroMetric
                icon={Trophy}
                label={t('registeredEvents')}
                value={registeredCount.toLocaleString()}
                tone="text-amber-300"
              />
            </div>
          </div>

          <Card className="relative flex min-h-[320px] flex-col justify-between overflow-hidden border-purple-400/20 bg-[#0b111d] p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400/80 via-purple-400/70 to-amber-300/70" />
            {featuredEvent ? (
              <>
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <Badge
                      variant={featuredEvent.status === 'active' ? 'green' : 'purple'}
                      size="md"
                      className="uppercase tracking-wider"
                    >
                      {featuredEvent.status === 'active' ? t('liveNow') : t('featuredEvent')}
                    </Badge>
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-gray-300">
                      <Users size={14} className="text-cyan-300" />
                      {t('participantCount', {
                        count: featuredEvent.participantCount.toLocaleString(),
                      })}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">
                    {featuredEvent.name}
                  </h2>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-6 text-gray-300 sm:text-base">
                    {featuredEvent.description}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <MiniPanel label={t('eventStatus')} value={t(`statuses.${featuredEvent.status}`)} />
                  <MiniPanel
                    label={t('rewardTiers')}
                    value={t('rewardTierCount', { count: featuredEvent.rewards.length })}
                  />
                  <Link
                    href={`/${locale}/events/${featuredEvent.id}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-500 px-4 text-sm font-black text-black transition-colors hover:bg-cyan-400 sm:col-span-2"
                  >
                    {t('viewEvent')}
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Calendar size={36} className="text-gray-600" />
                <p className="mt-3 text-sm text-gray-500">
                  {t('empty', { filter: t('filters.all') })}
                </p>
              </div>
            )}
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          icon={Radio}
          eyebrow={`${filtered.length}/${events.length} ${t('eventPool')}`}
          title={t('eventArena')}
          description={t('eventArenaHint')}
          action={
            <Badge variant="cyan" size="md">
              {t('participantCount', { count: totalParticipants.toLocaleString() })}
            </Badge>
          }
        />

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-[#080d17] p-2">
        {(['all', 'upcoming', 'active', 'ended'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-black transition-colors',
              filter === f
                ? 'border border-cyan-400/30 bg-cyan-500/12 text-white shadow-[0_0_18px_rgba(34,211,238,0.12)]'
                : 'border border-transparent text-gray-400 hover:border-white/10 hover:bg-white/[0.03] hover:text-gray-200'
            )}
          >
            {t(`filters.${f}`)}
            <span className="rounded-full border border-white/10 bg-black/25 px-2 py-0.5 text-xs text-gray-300">
              {filterCounts[f]}
            </span>
          </button>
        ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <Card className="border-cyan-400/15 bg-[#0b111d] p-10 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-gray-600" />
          <p className="text-base font-bold text-gray-400">
            {t('empty', { filter: t(`filters.${filter}`) })}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}

function sortEventsByPriority(a: SpecialEvent, b: SpecialEvent) {
  const statusOrder = {
    active: 0,
    upcoming: 1,
    ended: 2,
  } satisfies Record<SpecialEvent["status"], number>;

  const statusDiff = statusOrder[a.status] - statusOrder[b.status];
  if (statusDiff !== 0) return statusDiff;

  return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/28 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-gray-400">{label}</p>
        <Icon size={18} className={tone} />
      </div>
      <p className="mt-2 font-mono text-3xl font-black leading-none text-white">
        {value}
      </p>
    </div>
  );
}

function MiniPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black/24 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: typeof Trophy;
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080d17] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
            {eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-black text-white">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-400">
            {description}
          </p>
        </div>
      </div>
      {action}
    </div>
  );
}
