'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/components/shared/EventCard';
import {
  DEFAULT_EVENTS_RESPONSE,
  getEvents,
  mapApiEvent,
} from '@/lib/events-api';
import { cn } from '@/lib/utils';
import { Calendar, Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';
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

  const filtered = filter === 'all'
    ? events
    : events.filter((e) => e.status === filter);

  const activeEvent = events.find((e) => e.status === 'active');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold font-display text-white">{t('title')}</h1>
        <p className="text-sm text-gray-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Active event highlight */}
      {activeEvent && (
        <Card className="p-5 border-green-500/20 bg-gradient-to-r from-green-500/[0.04] to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-green-400" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">{t('liveNow')}</span>
          </div>
          <h2 className="text-base font-bold text-white mb-1">{activeEvent.name}</h2>
          <p className="text-xs text-gray-400 whitespace-pre-line">{activeEvent.description.slice(0, 120)}...</p>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'upcoming', 'active', 'ended'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filter === f
                ? 'bg-white/10 text-white border border-white/10'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {t(`filters.${f}`)}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('empty', { filter: t(`filters.${filter}`) })}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
