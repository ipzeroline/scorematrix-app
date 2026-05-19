'use client';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { useUserStore } from '@/stores/user-store';
import { useShallow } from 'zustand/react/shallow';
import { LEAGUE_ACCURACY, DAILY_FORM_30_DAY } from '@/data/stats';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Star, Trophy, Lock } from 'lucide-react';

export function StatsDashboard() {
  const t = useTranslations('stats');
  const { locale } = useParams<{ locale: string }>();
  const stats = useUserStore(
    useShallow((s) => ({
      totalPredictions: s.totalPredictions,
      correctPredictions: s.correctPredictions,
      accuracy: s.accuracy,
      streak: s.streak,
      bestStreak: s.bestStreak,
      level: s.level,
      xp: s.xp,
    }))
  );

  const sortedLeagues = useMemo(
    () => [...LEAGUE_ACCURACY].sort((a, b) => b.accuracy - a.accuracy),
    []
  );
  const localizedLeagues = useMemo(
    () =>
      sortedLeagues.map((league) => ({
        ...league,
        leagueName: t(`leagues.${league.leagueId}`),
      })),
    [sortedLeagues, t]
  );

  const bestLeague = localizedLeagues[0];

  const summaryCards = [
    { label: t('overallAccuracy'), value: `${stats.accuracy}%`, icon: Target, color: 'text-emerald-400' },
    { label: t('totalPredictions'), value: stats.totalPredictions.toString(), icon: TrendingUp, color: 'text-cyan-400' },
    { label: t('bestStreak'), value: stats.bestStreak.toString(), icon: Star, color: 'text-amber-400' },
    { label: t('bestLeague'), value: bestLeague?.leagueName ?? '—', icon: Trophy, color: 'text-violet-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => (
          <Card key={card.label} hover={false} className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={14} className={card.color} />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{card.label}</span>
            </div>
            <p className="text-xl font-bold text-white font-mono truncate">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* League accuracy chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">{t('leagueBreakdown')}</h3>
        <div className="min-w-0 w-full">
          <ResponsiveContainer width="100%" height={300} minWidth={0}>
            <BarChart data={localizedLeagues} layout="vertical" margin={{ left: 100, right: 20, top: 5, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280' }} />
              <YAxis type="category" dataKey="leagueName" tick={{ fontSize: 11, fill: '#9ca3af' }} width={100} />
              <Tooltip
                contentStyle={{ background: '#1f1f2d', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
                formatter={(value) => [`${value}%`]}
              />
              <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={16}>
                {localizedLeagues.map((entry) => (
                  <Cell key={entry.leagueId} fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy >= 60 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 30-day form chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-4">{t('dailyForm')}</h3>
        <div className="min-w-0 w-full">
          <ResponsiveContainer width="100%" height={250} minWidth={0}>
            <LineChart data={DAILY_FORM_30_DAY} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{ background: '#1f1f2d', border: '1px solid #374151', borderRadius: '8px', fontSize: 12 }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={false} name={t('accuracyMetric')} />
              <Line type="monotone" dataKey="points" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('pointsMetric')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pro Stats teaser */}
      <Card className="p-5 border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.03] to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Lock size={14} className="text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">{t('proStatsTeaser')}</h3>
            </div>
            <p className="text-xs text-gray-500 max-w-md">
              {t('proStatsDescription')}
            </p>
          </div>
          <Link
            href={`/${locale}/credits`}
            className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
          >
            {t('unlockPro')}
          </Link>
        </div>
      </Card>
    </div>
  );
}
