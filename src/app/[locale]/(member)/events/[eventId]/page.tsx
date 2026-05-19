'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/user-store';
import { useEventStore } from '@/stores/event-store';
import { useNotificationStore } from '@/stores/notification-store';
import { specialEvents } from '@/data/events';
import { cn } from '@/lib/utils';
import { Trophy, Users, Clock, Coins, CheckCircle, Star, Globe, Shield } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function EventDetailPage() {
  const { eventId, locale } = useParams<{ eventId: string; locale: string }>();
  const t = useTranslations('events');
  const [showConfirm, setShowConfirm] = useState(false);
  const [entered, setEntered] = useState(false);
  const [now] = useState(() => Date.now());

  const event = specialEvents.find((e) => e.id === eventId);
  if (!event) notFound();

  const spendCredits = useUserStore((s) => s.spendCredits);
  const premiumCredits = useUserStore((s) => s.premiumCredits);
  const registerForEvent = useEventStore((s) => s.registerForEvent);
  const isRegistered = useEventStore((s) => s.isRegistered);
  const addToast = useNotificationStore((s) => s.addToast);

  const alreadyRegistered = isRegistered(event.id) || entered;
  const canAfford = premiumCredits >= event.entryFee;
  const isFree = event.entryFee === 0;

  const daysUntilStart = Math.ceil(
    (new Date(event.startDate).getTime() - now) / 86400000
  );

  const handleEnter = () => {
    if (!isFree) {
      const success = spendCredits(event.entryFee);
      if (!success) {
        addToast({ type: 'error', title: t('insufficientCredits'), message: t('buyCreditsToEnter') });
        return;
      }
    }
    registerForEvent(event.id);
    setEntered(true);
    setShowConfirm(false);
    addToast({
      type: 'success',
      title: t('eventEntered'),
      message: t('registeredForEvent', { event: t(`items.${event.id}.name`) }),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero */}
      <Card className={cn('p-6', event.status === 'active' && 'ring-1 ring-green-500/20')}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20">
            {t(`tournamentTypes.${event.tournamentType}`)}
          </span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-[10px] font-bold border',
            event.status === 'upcoming' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            event.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
            'bg-gray-500/10 text-gray-500 border-gray-500/20'
          )}>
            {t(`statuses.${event.status}`)}
          </span>
        </div>

        <h1 className="text-2xl font-bold font-display text-white mb-2">{t(`items.${event.id}.name`)}</h1>
        <p className="text-sm text-gray-400 max-w-2xl">{t(`items.${event.id}.description`)}</p>

        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-800/50">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={14} className="text-gray-500" />
            <span>{new Date(event.startDate).toLocaleDateString(locale)} - {new Date(event.endDate).toLocaleDateString(locale)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={14} className="text-gray-500" />
            <span>{t('participantCount', { count: event.participantCount.toLocaleString() })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Coins size={14} className={isFree ? 'text-green-400' : 'text-amber-400'} />
            <span className={isFree ? 'text-green-400 font-bold' : 'text-amber-400 font-bold'}>
              {isFree ? t('free') : t('creditsAmount', { amount: event.entryFee })}
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Rewards */}
          <Card className="p-4">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" /> {t('rewardTiers')}
            </h2>
            <div className="space-y-2">
              {event.rewards.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
                  <span className="text-xs text-white font-medium">
                    {Array.isArray(r.rank) ? `#${r.rank[0]} – #${r.rank[1]}` : `#${r.rank}`}
                  </span>
                  <div className="flex items-center gap-3">
                    {r.freePoints > 0 && (
                      <span className="text-xs text-green-400 font-mono">{t('pointsAmount', { amount: r.freePoints.toLocaleString() })}</span>
                    )}
                    {r.premiumCredits && r.premiumCredits > 0 && (
                      <span className="text-xs text-amber-400 font-mono">{t('creditsAmount', { amount: r.premiumCredits.toLocaleString() })}</span>
                    )}
                    {r.badge && (
                      <Shield size={12} className="text-violet-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rules */}
          {event.rules && (
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-white mb-3">{t('rules')}</h2>
              <ul className="space-y-1.5">
                {event.rules.map((_, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="text-cyan-400 mt-0.5">•</span>
                    {t(`items.${event.id}.rules.${i}`)}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Badges */}
          {event.badges.length > 0 && (
            <Card className="p-4">
              <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Star size={16} className="text-amber-400" /> {t('exclusiveBadges')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-gray-800">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                      {badge.icon === 'trophy' ? <Trophy size={18} className="text-amber-400" /> : <Globe size={18} className="text-violet-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">{t(`badges.${badge.id}.name`)}</p>
                      <p className="text-[10px] text-gray-500">{t(`badges.${badge.id}.description`)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Entry card */}
          <Card className="p-5 sticky top-20">
            {alreadyRegistered ? (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-green-400" />
                </div>
                <h3 className="text-sm font-bold text-white">{t('youAreIn')}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {daysUntilStart > 0 ? t('startsInDays', { days: daysUntilStart }) : t('eventIsLive')}
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-white mb-3">{t('enterEvent')}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('entryFee')}</span>
                    <span className={isFree ? 'text-green-400 font-bold' : 'text-amber-400 font-mono font-bold'}>
                      {isFree ? t('free') : t('creditsAmount', { amount: event.entryFee })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">{t('yourBalance')}</span>
                    <span className="text-white font-mono">{t('creditsAmount', { amount: premiumCredits })}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={!isFree && !canAfford}
                  className={cn(
                    'w-full py-2.5 rounded-lg text-sm font-bold transition-all',
                    isFree
                      ? 'bg-green-500 text-black hover:bg-green-400'
                      : canAfford
                        ? 'bg-cyan-500 text-black hover:bg-cyan-400'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {isFree ? t('joinFree') : !canAfford ? t('insufficientCredits') : t('enterNow')}
                </button>
                {!isFree && !canAfford && (
                  <p className="text-[10px] text-gray-500 text-center mt-2">{t('buyCreditsToEnter')}</p>
                )}
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold text-white text-center">{t('confirmEntry')}</h2>
            <p className="text-sm text-gray-400 text-center">
              {isFree
                ? t('joinFreeQuestion')
                : t('enterWithCreditsQuestion', { amount: event.entryFee })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleEnter}
                className={cn(
                  'flex-1 py-2.5 rounded-lg text-sm font-bold text-black transition-colors',
                  isFree ? 'bg-green-500 hover:bg-green-400' : 'bg-cyan-500 hover:bg-cyan-400'
                )}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
