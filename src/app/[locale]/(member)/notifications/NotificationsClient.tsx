'use client';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/Card';
import { useNotificationStore, type AppNotification } from '@/stores/notification-store';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck, Trash2, Clock, Trophy, Gift, UserPlus, Calendar, Zap, AlertTriangle } from 'lucide-react';

const TYPE_ICON: Record<string, React.ReactNode> = {
  matchReminder: <Clock size={14} />,
  matchResult: <Zap size={14} />,
  rankChange: <Trophy size={14} />,
  checkinReminder: <Calendar size={14} />,
  rewardEarned: <Gift size={14} />,
  referralBonus: <UserPlus size={14} />,
  eventStart: <Calendar size={14} />,
  streakLost: <AlertTriangle size={14} />,
  system: <Bell size={14} />,
};

function groupByDate(notifications: AppNotification[]) {
  const groups: Record<string, AppNotification[]> = {
    Today: [],
    Yesterday: [],
    'This Week': [],
    Older: [],
  };
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);

  for (const n of notifications) {
    const d = n.createdAt.slice(0, 10);
    if (d === today) groups['Today'].push(n);
    else if (d === yesterday) groups['Yesterday'].push(n);
    else if (d >= weekAgo) groups['This Week'].push(n);
    else groups['Older'].push(n);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const clearAll = useNotificationStore((s) => s.clearAll);

  const grouped = groupByDate(notifications);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">{t('title')}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {notifications.filter((n) => !n.read).length} unread
          </p>
        </div>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-700 text-gray-300 hover:text-white transition-colors"
              >
                <CheckCheck size={14} /> {t('markAllRead')}
              </button>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-500/30 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 size={14} /> {t('clearAll')}
              </button>
            </>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">{t('empty')}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(([label, items]) => (
            <div key={label}>
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
                {label}
              </h2>
              <div className="space-y-1">
                {items.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    className={cn(
                      'w-full text-left flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.03]',
                      !n.read && 'bg-cyan-500/5 border border-cyan-500/10'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      n.read ? 'bg-gray-500/10 text-gray-500' : 'bg-cyan-500/10 text-cyan-400'
                    )}>
                      {TYPE_ICON[n.type] ?? <Bell size={14} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {n.createdAt.slice(0, 10)} {n.createdAt.slice(11, 16)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
