import { getTranslations } from 'next-intl/server';
import { StatsDashboard } from '@/components/shared/StatsDashboard';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stats' });
  return {
    title: t('title'),
    description: t('subtitle'),
  };
}

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'stats' });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(168,85,247,0.13),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200">
              {t('commandCenter')}
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
              {t('skillBased')}
            </span>
          </div>
          <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-gray-300 sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </section>
      <StatsDashboard />
    </div>
  );
}
