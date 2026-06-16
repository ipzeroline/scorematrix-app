import type { Metadata } from "next";
import { cookies } from "next/headers";
import { MatchesApi } from "@/components/matches/MatchesApi";
import { getMatchesSeoContent } from "@/data/matches-seo-content";
import { LOCALE_CODES } from "@/i18n";
import {
  ApiFootballError,
  getApiFootballFixtureList,
  type ApiFootballFixture,
  type ApiFootballFixtureCounts,
} from "@/lib/api-football";
import { sortFixtures } from "@/lib/football-page-data";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { getThailandDateKey, THAILAND_TIME_ZONE } from "@/lib/utils";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";
import { MatchStatus } from "@/types/common";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getMatchesSeoContent(locale);
  const pathname = `/${locale}/matches`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/matches`])
  );

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/matches`,
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
      type: "website",
      locale,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: "/brand/scorematrix-logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} matches`,
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

export default async function MatchesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { date } = await searchParams;
  const selectedDate = isDateKey(date) ? date : getThailandDateKey();
  const seo = getMatchesSeoContent(locale);
  const cookieStore = await cookies();
  const initialHasAuthSession =
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value) ||
    Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
  let fixtures: ApiFootballFixture[] = [];
  let counts = emptyCounts();
  let loadError = false;

  try {
    const result = await getApiFootballFixtureList({
      date: selectedDate,
      timezone: THAILAND_TIME_ZONE,
      limit: 500,
    });
    fixtures = sortFixtures(result.fixtures);
    counts = result.counts;
  } catch (error) {
    loadError = true;
    if (!(error instanceof ApiFootballError)) {
      console.error(error);
    }
  }

  const structuredData = buildMatchesStructuredData(
    locale,
    seo,
    selectedDate,
    fixtures
  );

  return (
    <div className="space-y-8 pb-8">
      <MatchesApi
        key={selectedDate}
        fixtures={fixtures}
        counts={counts}
        selectedDate={selectedDate}
        initialLoadError={loadError}
        initialHasAuthSession={initialHasAuthSession}
      />

      <section className="rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix Matches
          </p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
            {seo.pageTitle}
          </h2>
          <p className="mt-3 text-base font-semibold leading-7 text-gray-400">
            {seo.pageDescription}
          </p>
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

function isDateKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function emptyCounts(): ApiFootballFixtureCounts {
  return {
    total: 0,
    live: 0,
    upcoming: 0,
    finished: 0,
    postponed: 0,
    cancelled: 0,
  };
}

function buildMatchesStructuredData(
  locale: string,
  seo: ReturnType<typeof getMatchesSeoContent>,
  selectedDate: string,
  fixtures: ApiFootballFixture[]
) {
  const url = `${SITE_URL}/${locale}/matches`;
  const eventItems = fixtures.slice(0, 20).map((fixture, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SportsEvent",
      name: `${fixture.home.name} vs ${fixture.away.name}`,
      startDate: fixture.kickoffTime,
      eventStatus: getSchemaEventStatus(fixture.status),
      sport: "Football",
      url,
      organizer: {
        "@type": "SportsOrganization",
        name: fixture.league.name,
      },
      homeTeam: {
        "@type": "SportsTeam",
        name: fixture.home.name,
      },
      awayTeam: {
        "@type": "SportsTeam",
        name: fixture.away.name,
      },
      location: fixture.venue
        ? {
            "@type": "Place",
            name: fixture.venue,
            address: fixture.league.country,
          }
        : undefined,
    },
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: seo.title,
      description: seo.description,
      inLanguage: locale,
      dateModified: selectedDate,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        "football fixtures",
        "football match schedule",
        "live football matches",
        "soccer fixtures",
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
          item: `${SITE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Matches",
          item: url,
        },
      ],
    },
    ...(eventItems.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${url}#fixtures`,
            name: seo.pageTitle,
            itemListElement: eventItems,
          },
        ]
      : []),
  ];
}

function getSchemaEventStatus(status: MatchStatus): string {
  if (status === MatchStatus.LIVE) return "https://schema.org/EventInProgress";
  if (status === MatchStatus.FINISHED) return "https://schema.org/EventCompleted";
  if (status === MatchStatus.POSTPONED) return "https://schema.org/EventPostponed";
  if (status === MatchStatus.CANCELLED) return "https://schema.org/EventCancelled";
  return "https://schema.org/EventScheduled";
}
