'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Flame,
  Loader2,
  Radio,
  Search,
  ShieldCheck,
  Trophy,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/components/shared/EventCard';
import {
  getEvents,
  mapApiEvent,
} from '@/lib/events-api';
import { cn } from '@/lib/utils';
import type { SpecialEvent } from '@/types/event';

type Filter = 'all' | 'upcoming' | 'active' | 'ended';
type EventTypeFilter = 'all' | 'tournament' | 'single-match' | 'season';
const PAGE_SIZE = 20;

export default function EventsPage() {
  const t = useTranslations('events');
  const { locale } = useParams<{ locale: string }>();
  const [filter, setFilter] = useState<Filter>('all');
  const [eventTypeFilter, setEventTypeFilter] = useState<EventTypeFilter>('all');
  const [events, setEvents] = useState<SpecialEvent[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    getEvents(
      {
        status: filter === 'all' ? undefined : filter,
        eventType: eventTypeFilter === 'all' ? undefined : eventTypeFilter,
        search: searchTerm,
        page,
        limit: PAGE_SIZE,
      },
      { locale }
    )
      .then((response) => {
        if (!active) return;
        setEvents(response.data.map(mapApiEvent));
        setTotal(response.meta?.total ?? response.data.length);
      })
      .catch((apiError) => {
        if (!active) return;
        setEvents([]);
        setTotal(0);
        setError(apiError instanceof Error ? apiError.message : t('loadFailed'));
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [eventTypeFilter, filter, locale, page, searchTerm, t]);

  const filtered = events
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
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFilterChange = (nextFilter: Filter) => {
    if (nextFilter === filter && page === 1) return;
    setIsLoading(true);
    setError(null);
    setFilter(nextFilter);
    setPage(1);
  };

  const handleEventTypeChange = (nextEventType: EventTypeFilter) => {
    if (nextEventType === eventTypeFilter && page === 1) return;
    setIsLoading(true);
    setError(null);
    setEventTypeFilter(nextEventType);
    setPage(1);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSearchTerm = searchInput.trim();
    if (nextSearchTerm === searchTerm && page === 1) return;
    setIsLoading(true);
    setError(null);
    setSearchTerm(nextSearchTerm);
    setPage(1);
  };

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page) return;
    setIsLoading(true);
    setError(null);
    setPage(nextPage);
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
          eyebrow={`${filtered.length}/${total} ${t('eventPool')}`}
          title={t('eventArena')}
          description={t('eventArenaHint')}
          action={
            <Badge variant="cyan" size="md">
              {t('participantCount', { count: totalParticipants.toLocaleString() })}
            </Badge>
          }
        />

        <div className="rounded-2xl border border-white/10 bg-[#080d17]/95 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)] xl:items-center">
          <div className="flex overflow-x-auto rounded-xl border border-cyan-400/10 bg-black/20 p-1">
            {(['all', 'upcoming', 'active', 'ended'] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  'inline-flex min-h-10 shrink-0 items-center rounded-lg px-4 text-sm font-black transition-colors',
                  filter === f
                    ? 'bg-cyan-500 text-black shadow-[0_0_18px_rgba(34,211,238,0.18)]'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                )}
              >
                {t(`filters.${f}`)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex min-h-12 items-center gap-2 rounded-xl border border-white/10 bg-black/28 px-3 shadow-inner shadow-black/20 focus-within:border-cyan-400/40">
            <Search size={16} className="shrink-0 text-cyan-300" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-black text-black transition-colors hover:bg-cyan-400"
            >
              {t('search')}
            </button>
          </form>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto">
            {(['all', 'tournament', 'single-match', 'season'] as EventTypeFilter[]).map((eventType) => (
              <button
                key={eventType}
                onClick={() => handleEventTypeChange(eventType)}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center rounded-lg px-3 text-xs font-black transition-colors sm:text-sm',
                  eventTypeFilter === eventType
                    ? 'border border-white/15 bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]'
                    : 'border border-transparent text-gray-500 hover:text-gray-300'
                )}
              >
                {t(`eventTypeFilters.${eventType}`)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error ? (
        <Card className="border-red-400/15 bg-[#0b111d] p-10 text-center">
          <Calendar size={36} className="mx-auto mb-3 text-red-300/70" />
          <p className="text-base font-bold text-gray-300">{t('loadFailed')}</p>
          <p className="mt-2 text-sm text-gray-500">{error}</p>
        </Card>
      ) : isLoading ? (
        <Card className="border-cyan-400/15 bg-[#0b111d] p-10 text-center">
          <Loader2 size={36} className="mx-auto mb-3 animate-spin text-cyan-300" />
          <p className="text-base font-bold text-gray-400">{t('loading')}</p>
        </Card>
      ) : filtered.length === 0 ? (
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

      {!error && totalPages > 1 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#080d17] p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-gray-400">
            {t('pageStatus', { page, total: totalPages })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={isLoading || page <= 1}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-gray-300 transition-colors hover:border-cyan-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              {t('previousPage')}
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={isLoading || page >= totalPages}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-gray-300 transition-colors hover:border-cyan-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('nextPage')}
              <ChevronRight size={16} />
            </button>
          </div>
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
