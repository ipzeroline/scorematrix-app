import type { Metadata } from "next";
import { Livescore, type FixturesPayload } from "@/components/livescore/Livescore";
import { getLivescoreSeoContent } from "@/data/livescore-seo-content";
import { LOCALE_CODES } from "@/i18n";
import {
  ApiFootballError,
  type ApiFootballFixture,
  getApiFootballLiveFixtures,
} from "@/lib/api-football";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getLivescoreSeoContent(locale);
  const pathname = `/${locale}/livescore`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/livescore`])
  );

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/livescore`,
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
          alt: `${SITE_NAME} livescore`,
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

export default async function LivescorePage({ params }: Props) {
  const { locale } = await params;
  const seo = getLivescoreSeoContent(locale);
  const initialPayload = await loadInitialFixtures();
  const structuredData = buildLivescoreStructuredData(
    locale,
    seo,
    initialPayload.fixtures
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-8 sm:px-0">
      <Livescore initialPayload={initialPayload} locale={locale} />

      <section className="rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix Livescore
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

async function loadInitialFixtures(): Promise<FixturesPayload> {
  try {
    return await getApiFootballLiveFixtures();
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch football fixtures", 500);
    return {
      fetchedAt: new Date().toISOString(),
      count: 0,
      fixtures: [],
      rateLimit: {
        requestsRemaining: null,
        requestsLimit: null,
      },
      error: apiError.message,
    };
  }
}

function buildLivescoreStructuredData(
  locale: string,
  seo: ReturnType<typeof getLivescoreSeoContent>,
  fixtures: ApiFootballFixture[]
) {
  const url = `${SITE_URL}/${locale}/livescore`;
  const liveEvents = fixtures.slice(0, 12).map((fixture, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SportsEvent",
      name: `${fixture.home.name} vs ${fixture.away.name}`,
      startDate: fixture.kickoffTime,
      eventStatus: "https://schema.org/EventInProgress",
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
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        "live football scores",
        "football match status",
        "football fixtures",
        "soccer live scores",
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
          name: "Livescore",
          item: url,
        },
      ],
    },
    ...(liveEvents.length > 0
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": `${url}#live-events`,
            name: seo.pageTitle,
            itemListElement: liveEvents,
          },
        ]
      : []),
  ];
}
