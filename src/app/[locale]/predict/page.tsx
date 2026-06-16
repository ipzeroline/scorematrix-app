import type { Metadata } from "next";
import { PredictApi } from "@/components/predict/PredictApi";
import { getPredictSeoContent } from "@/data/predict-seo-content";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getPredictSeoContent(locale);
  const pathname = `/${locale}/predict`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/predict`])
  );

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/predict`,
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
          alt: `${SITE_NAME} Predict`,
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

export default async function PredictPage({ params }: Props) {
  const { locale } = await params;
  const seo = getPredictSeoContent(locale);
  const structuredData = buildPredictStructuredData(locale, seo);

  return (
    <div className="space-y-8 pb-8">
      <PredictApi />

      <section className="rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix Predict
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

function buildPredictStructuredData(
  locale: string,
  seo: ReturnType<typeof getPredictSeoContent>
) {
  const url = `${SITE_URL}/${locale}/predict`;

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
        "skill-based prediction game",
        "football score prediction",
        "football prediction points",
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
          name: "Predict",
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "@id": `${url}#how-to-predict`,
      name: seo.pageTitle,
      description: seo.pageDescription,
      totalTime: "PT3M",
      supply: [
        {
          "@type": "HowToSupply",
          name: "ScoreMatrix account",
        },
        {
          "@type": "HowToSupply",
          name: "Eligible football fixture",
        },
      ],
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Choose an eligible match",
          text: "Browse the public prediction hub and open a match that is available for prediction.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Review match context",
          text: "Check kickoff time, teams, league context, live score data and AI insight when available.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Submit a score prediction",
          text: "Sign in when required, choose your prediction details and submit before the prediction lock time.",
        },
      ],
    },
  ];
}
