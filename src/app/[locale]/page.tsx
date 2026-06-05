import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { DailyCheckIn } from "@/components/shared/DailyCheckIn";
import { WorldFootballFeature } from "@/components/home/WorldFootballFeature";
import { LiveMatchHighlights } from "@/components/home/LiveMatchHighlights";
import { TodayMatches } from "@/components/home/TodayMatches";
import { AIMatchOfTheDay } from "@/components/home/AIMatchOfTheDay";
import { NewsSection } from "@/components/home/NewsSection";
import { LOCALE_CODES } from "@/i18n";
import { MatchStatus } from "@/types/common";
import {
  loadLiveFixtures,
  pickRandomFixture,
} from "@/lib/football-page-data";
import { getLatestArticles } from "@/lib/news-generator";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, `/${code}`])
      ),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
      url: `/${locale}`,
      siteName: "ScoreMatrix",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const [liveFixtures, latestArticles, cookieStore] = await Promise.all([
    loadLiveFixtures(24, 0),
    getLatestArticles(locale, 6),
    cookies(),
  ]);
  const homepageFixtures = liveFixtures.slice(0, 16);
  const initialHasAuthSession =
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value) ||
    Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
  const aiFixture =
    pickRandomFixture(homepageFixtures.filter((fixture) => fixture.status === MatchStatus.UPCOMING)) ??
    pickRandomFixture(homepageFixtures) ??
    pickRandomFixture(liveFixtures);

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Banner */}
      <section>
        <HeroBanner />
      </section>

      {/* Daily Check-in */}
      <DailyCheckIn initialHasAuthSession={initialHasAuthSession} />

      <WorldFootballFeature />

      {/* Live Match Highlights */}
      <section>
        <LiveMatchHighlights fixtures={liveFixtures} apiMode />
      </section>

      {/* Today's Matches */}
      <section>
        <TodayMatches fixtures={homepageFixtures} />
      </section>

      {/* AI Match of the Day */}
      <section>
        <div className="ai-section-heading relative mb-4 overflow-hidden rounded-xl border border-magenta-500/20 bg-[#120d1a] px-4 py-3">
          <div className="ai-section-heading-wave absolute inset-0" />
          <div className="relative flex items-center gap-3">
            <span className="ai-section-heading-node grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-magenta-400/40 bg-magenta-500/10 text-magenta-200">
              <Sparkles
                size={20}
                strokeWidth={2.3}
                className="drop-shadow-[0_0_8px_rgba(217,70,239,0.85)]"
                aria-hidden="true"
              />
            </span>
            <h2
              className="font-display text-xl font-bold tracking-normal text-white text-glow-magenta"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("aiMatchOfTheDay")}
            </h2>
          </div>
        </div>
        <AIMatchOfTheDay fixture={aiFixture} />
      </section>

      {/* News Section */}
      <section>
        <NewsSection articles={latestArticles} />
      </section>

      <section className="rounded-xl border border-gray-800 bg-[#0a0a0f] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm md:text-base font-semibold leading-relaxed tracking-normal text-cyan-300">
            {t("seoContent.eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold leading-tight text-white">
            {t("seoContent.title")}
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-300">
            {t("seoContent.description")}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["predictions", "liveScores", "rewards"].map((key) => (
            <div key={key} className="border-l border-cyan-500/30 pl-4">
              <h3 className="text-sm font-semibold text-white">
                {t(`seoContent.cards.${key}.title`)}
              </h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {t(`seoContent.cards.${key}.text`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
