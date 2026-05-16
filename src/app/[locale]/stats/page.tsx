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

export default function StatsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold font-display text-white">Your Stats</h1>
        <p className="text-sm text-gray-400 mt-1">Track your prediction performance across leagues and time.</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
