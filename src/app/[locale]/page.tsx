import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { Brain } from "lucide-react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { DailyCheckIn } from "@/components/shared/DailyCheckIn";
import { MissionsWidget } from "@/components/home/MissionsWidget";
import { WorldFootballFeature } from "@/components/home/WorldFootballFeature";
import { LiveMatchHighlights } from "@/components/home/LiveMatchHighlights";
import { TodayMatches } from "@/components/home/TodayMatches";
import { AIMatchOfTheDay } from "@/components/home/AIMatchOfTheDay";
import { NewsSection } from "@/components/home/NewsSection";
import {
  ApiFootballError,
  getApiFootballAIInsights,
  type ApiFootballAIInsight,
} from "@/lib/api-football";
import {
  loadLiveFixtures,
  loadTodayFixtures,
  sortFixtures,
} from "@/lib/football-page-data";
import { getFixtureStatusGroup } from "@/lib/football-status";
import { serializeJsonLd } from "@/lib/json-ld";
import { getLatestArticles } from "@/lib/news-generator";
import { LOCALE_CODES } from "@/i18n";
import { getHomeSeoContent } from "@/data/home-seo-content";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";
import { MatchStatus } from "@/types/common";
import { getWorldCupGroups } from "./world-cup-2026/page";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getHomeSeoContent(locale);
  const pathname = `/${locale}`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}`])
  );

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [
        {
          url: "/brand/scorematrix-logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: ["/brand/scorematrix-logo.png"],
    },
  };
}

const featuredBadgeCopy: Record<string, string> = {
  en: "Featured",
  th: "คู่เด่น",
  lo: "ແນະນຳ",
  my: "အထူးအသားပေး",
  km: "ពិសេស",
  zh: "精选",
};

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  const seo = getHomeSeoContent(locale);
  const cookieStore = await cookies();
  const liveResult = await loadLiveFixtures();
  const todayFixtures = await loadTodayFixtures();
  const homepageFixtures = sortFixtures(todayFixtures)
    .filter((fixture) => {
      if (getFixtureStatusGroup(fixture) === MatchStatus.LIVE) {
        return false;
      }

      return getFixtureStatusGroup(fixture) === MatchStatus.UPCOMING;
    });
  const wcGroups = await getWorldCupGroups();
  const latestArticles = await getLatestArticles(locale, 3);
  const aiInsight = await loadFeaturedAIInsight();

  const wcTodayMatches = sortFixtures(todayFixtures).filter(
    (fixture) =>
      fixture.league.id === "1" ||
      fixture.league.apiLeagueId === 1 ||
      fixture.league.name === "World Cup"
  );
  const initialHasAuthSession =
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value) ||
    Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
  const structuredData = buildHomeStructuredData(locale, seo);

  const mainContent = (
    <>
      <WorldFootballFeature wcGroups={wcGroups} wcTodayMatches={wcTodayMatches} />

      {/* Live Match Highlights */}
      <section>
        <LiveMatchHighlights
          fixtures={liveResult.fixtures}
          initialError={liveResult.error}
        />
      </section>

      {/* Today's Matches */}
      <section>
        <TodayMatches fixtures={homepageFixtures} />
      </section>

      {/* AI Match of the Day */}
      {aiInsight && (
        <section>
          <div className="relative mb-4 overflow-hidden rounded-xl border border-border bg-surface px-4 py-3">
            {/* Top edge accent gradient line for the featured section */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500" />

            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  <Brain
                    size={20}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </span>
                <h2 className="text-lg font-extrabold tracking-normal text-white">
                  {t("aiMatchOfTheDay")}
                </h2>
              </div>

              {/* Featured Badge */}
              <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                {featuredBadgeCopy[locale] || "Featured"}
              </span>
            </div>
          </div>
          <AIMatchOfTheDay insight={aiInsight} />
        </section>
      )}

      {/* News Section */}
      <section>
        <NewsSection articles={latestArticles} />
      </section>
    </>
  );

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Banner */}
      <section>
        <HeroBanner />
      </section>

      {/* Daily Check-in (Full Width) */}
      <DailyCheckIn initialHasAuthSession={initialHasAuthSession} />

      {/* Missions Widget (Full Width) */}
      {initialHasAuthSession && (
        <MissionsWidget initialHasAuthSession={initialHasAuthSession} />
      )}

      {/* Main Content (Matches, AI, News) */}
      {mainContent}

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

      <section className="rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
            {seo.faqTitle}
          </h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {seo.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <h3 className="text-base font-black leading-6 text-white">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-400">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </div>
  );
}

function buildHomeStructuredData(
  locale: string,
  seo: ReturnType<typeof getHomeSeoContent>
) {
  const url = `${SITE_URL}/${locale}`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        "football predictions",
        "live football scores",
        "AI football insights",
        "football rewards",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: url,
        },
      ],
    },
  ];
}

async function loadFeaturedAIInsight(): Promise<ApiFootballAIInsight | null> {
  try {
    const insights = await getApiFootballAIInsights();
    const candidates =
      insights.highConfidence.length > 0
        ? insights.highConfidence
        : insights.live;

    return candidates
      .filter(hasCompleteAIProbabilities)
      .sort((a, b) => (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0))[0] ?? null;
  } catch (error) {
    if (error instanceof ApiFootballError) return null;
    throw error;
  }
}

function hasCompleteAIProbabilities(insight: ApiFootballAIInsight): boolean {
  return [
    insight.confidenceScore,
    insight.homeWinProbability,
    insight.drawProbability,
    insight.awayWinProbability,
  ].every((value) => typeof value === "number");
}
