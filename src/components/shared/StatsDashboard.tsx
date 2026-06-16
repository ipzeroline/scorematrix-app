'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useUserStore } from '@/stores/user-store';
import { useShallow } from 'zustand/react/shallow';
import {
  EMPTY_STATS_ACCURACY,
  getStatsAccuracy,
  type StatsAccuracyResponse,
} from '@/lib/stats-api';
import { isAuthSessionExpiredError } from '@/lib/api-client';
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, BarChart3, CalendarDays, Flame, Lock, ShieldCheck, Target, TrendingUp, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StatsDashboard() {
  const t = useTranslations('stats');
  const { locale } = useParams<{ locale: string }>();
  const [apiStats, setApiStats] = useState<StatsAccuracyResponse>(EMPTY_STATS_ACCURACY);
  const [loading, setLoading] = useState(true);
  const stats = useUserStore(
    useShallow((s) => ({
      bestStreak: s.bestStreak,
    }))
  );

  useEffect(() => {
    const controller = new AbortController();

    getStatsAccuracy({ locale, signal: controller.signal })
      .then((response) => {
        setApiStats(response);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (isAuthSessionExpiredError(error)) return;
        console.error("Failed to load accuracy stats:", error);
        setApiStats(EMPTY_STATS_ACCURACY);
      })
      .finally(() => {
        if (controller.signal.aborted) return;
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [locale]);

  const sortedLeagues = useMemo(
    () => [...apiStats.leagueBreakdown].sort((a, b) => b.accuracy - a.accuracy),
    [apiStats.leagueBreakdown]
  );
  const localizedLeagues = useMemo(
    () =>
      sortedLeagues.map((league) => ({
        ...league,
        leagueName: league.leagueName || league.leagueId,
      })),
    [sortedLeagues]
  );

  const bestLeague = localizedLeagues[0];
  const exactHitRate = apiStats.byResultType.exact.percentage;
  const boldAccuracy = apiStats.byConfidence.bold.accuracy;
  const latestTrend = apiStats.trend[apiStats.trend.length - 1];
  const trendLabel = latestTrend
    ? `${latestTrend.accuracy}% / ${latestTrend.points.toLocaleString()} ${t('pointsMetric')}`
    : '—';

  const summaryCards = [
    { label: t('overallAccuracy'), value: loading ? '...' : `${apiStats.overall.accuracy}%`, helper: `${apiStats.overall.correct.toLocaleString()}/${apiStats.overall.total.toLocaleString()}`, icon: Target, color: 'text-emerald-300' },
    { label: t('totalPredictions'), value: loading ? '...' : apiStats.overall.total.toLocaleString(), helper: t('predictionVolume'), icon: TrendingUp, color: 'text-cyan-300' },
    { label: t('bestStreak'), value: stats.bestStreak.toString(), helper: t('streakSignal'), icon: Flame, color: 'text-amber-300' },
    { label: t('bestLeague'), value: bestLeague?.leagueName ?? '—', helper: bestLeague ? `${bestLeague.accuracy}%` : t('noData'), icon: Trophy, color: 'text-violet-300' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} hover={false} className="relative overflow-hidden border-white/10 bg-[#0b111d] p-4 sm:p-5">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-400">{card.label}</p>
                <p className="mt-2 truncate font-mono text-3xl font-black leading-none text-white">
                  {card.value}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                  {card.helper}
                </p>
              </div>
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                <card.icon size={22} className={card.color} />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden border-cyan-400/20 bg-[#0b111d] p-4 sm:p-5">
          <PanelTitle
            icon={BarChart3}
            eyebrow={t('analysisPanel')}
            title={t('leagueBreakdown')}
            description={t('leagueBreakdownHint')}
          />
          <div className="mt-4 min-w-0">
            <ResponsiveContainer width="100%" height={340} minWidth={0}>
              <BarChart data={localizedLeagues.slice(0, 8)} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="leagueName" tick={{ fontSize: 12, fill: '#cbd5e1', fontWeight: 700 }} width={132} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#101827', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '12px', fontSize: 12, color: '#e5e7eb' }}
                formatter={(value) => [`${value}%`]}
              />
                <Bar dataKey="accuracy" radius={[0, 8, 8, 0]} barSize={18}>
                {localizedLeagues.slice(0, 8).map((entry) => (
                  <Cell key={entry.leagueId} fill={entry.accuracy >= 70 ? '#10b981' : entry.accuracy >= 60 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        </Card>

        <Card className="overflow-hidden border-fuchsia-400/20 bg-[#0b111d] p-4 sm:p-5">
          <PanelTitle
            icon={CalendarDays}
            eyebrow={t('formMonitor')}
            title={t('dailyForm')}
            description={t('dailyFormHint')}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="cyan" size="md">{t('latestSignal')}: {trendLabel}</Badge>
            <Badge variant="gold" size="md">{t('exactRate')}: {exactHitRate}%</Badge>
            <Badge variant="purple" size="md">{t('boldAccuracy')}: {boldAccuracy}%</Badge>
          </div>
          <div className="mt-5 min-w-0">
            <ResponsiveContainer width="100%" height={295} minWidth={0}>
            <LineChart data={apiStats.trend} margin={{ top: 8, right: 20, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.14)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={(v: string) => {
                  const d = new Date(v);
                  if (Number.isNaN(d.getTime())) return v;
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#101827', border: '1px solid rgba(217,70,239,0.25)', borderRadius: '12px', fontSize: 12, color: '#e5e7eb' }}
              />
              <Line type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} dot={false} name={t('accuracyMetric')} />
              <Line type="monotone" dataKey="points" stroke="#f59e0b" strokeWidth={2} dot={false} name={t('pointsMetric')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-white/10 bg-[#0b111d] p-4 sm:p-5">
          <PanelTitle
            icon={ShieldCheck}
            eyebrow={t('accuracyMatrix')}
            title={t('resultType')}
            description={t('resultTypeHint')}
          />
          <div className="mt-5 space-y-3">
            <AccuracyRow label={t('exactScore')} count={apiStats.byResultType.exact.count} percentage={apiStats.byResultType.exact.percentage} tone="cyan" />
            <AccuracyRow label={t('goalDiff')} count={apiStats.byResultType.goalDiff.count} percentage={apiStats.byResultType.goalDiff.percentage} tone="green" />
            <AccuracyRow label={t('resultOnly')} count={apiStats.byResultType.result.count} percentage={apiStats.byResultType.result.percentage} tone="gold" />
            <AccuracyRow label={t('wrongPick')} count={apiStats.byResultType.wrong.count} percentage={apiStats.byResultType.wrong.percentage} tone="red" />
          </div>
        </Card>

        <Card className="border-white/10 bg-[#0b111d] p-4 sm:p-5">
          <PanelTitle
            icon={Activity}
            eyebrow={t('confidenceMatrix')}
            title={t('confidenceBreakdown')}
            description={t('confidenceHint')}
          />
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <ConfidenceCard label={t('safeMode')} data={apiStats.byConfidence.safe} tone="green" />
            <ConfidenceCard label={t('confidentMode')} data={apiStats.byConfidence.confident} tone="cyan" />
            <ConfidenceCard label={t('boldMode')} data={apiStats.byConfidence.bold} tone="purple" />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.08] via-purple-500/[0.04] to-transparent p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                <Lock size={18} className="text-cyan-300" />
              </span>
              <h3 className="text-xl font-black text-white">{t('proStatsTeaser')}</h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              {t('proStatsDescription')}
            </p>
          </div>
          <Link
            href={`/${locale}/credits`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 px-5 text-sm font-black text-black transition-colors hover:bg-cyan-400"
          >
            {t('unlockPro')}
          </Link>
        </div>
      </Card>
    </div>
  );
}

function PanelTitle({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: typeof Target;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
          <Icon size={16} />
        </span>
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
    </div>
  );
}

function AccuracyRow({
  label,
  count,
  percentage,
  tone,
}: {
  label: string;
  count: number;
  percentage: number;
  tone: 'cyan' | 'green' | 'gold' | 'red';
}) {
  const toneClass = {
    cyan: 'bg-cyan-400',
    green: 'bg-emerald-400',
    gold: 'bg-amber-400',
    red: 'bg-red-400',
  }[tone];

  return (
    <div className="rounded-xl border border-white/10 bg-black/22 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-white">{label}</span>
        <span className="font-mono text-sm font-black text-gray-300">
          {count.toLocaleString()} / {percentage}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-800">
        <div className={cn("h-full rounded-full", toneClass)} style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }} />
      </div>
    </div>
  );
}

function ConfidenceCard({
  label,
  data,
  tone,
}: {
  label: string;
  data: StatsAccuracyResponse['byConfidence']['safe'];
  tone: 'green' | 'cyan' | 'purple';
}) {
  const toneClass = {
    green: 'text-emerald-300 border-emerald-400/20 bg-emerald-400/10',
    cyan: 'text-cyan-300 border-cyan-400/20 bg-cyan-400/10',
    purple: 'text-purple-300 border-purple-400/20 bg-purple-400/10',
  }[tone];

  return (
    <div className={cn("rounded-2xl border p-4", toneClass)}>
      <p className="text-sm font-black text-white">{label}</p>
      <p className="mt-3 font-mono text-3xl font-black leading-none">
        {data.accuracy}%
      </p>
      <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-400">
        {data.correct.toLocaleString()}/{data.total.toLocaleString()}
      </p>
    </div>
  );
}
