'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { EventCard } from '@/components/shared/EventCard';
import { specialEvents } from '@/data/events';
import { cn } from '@/lib/utils';
import { Calendar, Sparkles } from 'lucide-react';
import type { SpecialEvent } from '@/types/event';

type Filter = 'all' | 'upcoming' | 'active' | 'ended';

export default function EventsPage() {
  const t = useTranslations('events');
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all'
    ? specialEvents
    : specialEvents.filter((e) => e.status === filter);

  const activeEvent = specialEvents.find((e) => e.status === 'active');

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
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live Now</span>
          </div>
          <h2 className="text-base font-bold text-white mb-1">{activeEvent.name}</h2>
          <p className="text-xs text-gray-400">{activeEvent.description.slice(0, 120)}...</p>
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
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No {filter} events</p>
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
