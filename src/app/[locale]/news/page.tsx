import type { Metadata } from "next";
import type { NewsArticle } from "@/types/news";
import { getNewsSeoContent } from "@/data/news-seo-content";
import { getPaginatedScormArticles, parseArticleType } from "@/lib/articles-api";
import { NewsListClient } from "@/components/news/NewsListClient";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    page?: string | string[];
    q?: string | string[];
    type?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getQuery(searchParams?: { q?: string | string[] }) {
  const value = searchParams?.q;
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

function getPage(searchParams?: { page?: string | string[] }) {
  const value = searchParams?.page;
  const raw = Array.isArray(value) ? value[0] : value;
  const page = Number.parseInt(raw ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function getNewsUrl(locale: string, query: string, page: number, type?: string) {
  return `${SITE_URL}${getNewsPath(locale, query, page, type)}`;
}

function getNewsPath(locale: string, query: string, page: number, type?: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type) params.set("type", type);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/${locale}/news${suffix ? `?${suffix}` : ""}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = getQuery(resolvedSearchParams);
  const page = getPage(resolvedSearchParams);
  const type = parseArticleType(resolvedSearchParams?.type);
  const seo = getNewsSeoContent(locale);
  const sectionTitle = type === "analysis"
    ? seo.analysisTitle
    : type === "news"
      ? seo.newsTitle
      : seo.title;
  const title = query ? `${query} | ${seo.searchTitle}` : sectionTitle;
  const description = query
    ? `${seo.searchDescription} Query: ${query}.`
    : type === "analysis"
      ? seo.analysisDescription
      : type === "news"
        ? seo.newsDescription
        : seo.description;
  const canonical = getNewsUrl(locale, query, page, type);
  const shouldIndex = !query;

  return {
    title,
    description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...Object.fromEntries(
          LOCALE_CODES.map((code) => [code, getNewsUrl(code, query, page, type)])
        ),
        "x-default": getNewsUrl("th", query, page, type),
      },
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: query ? title : seo.ogTitle,
      description,
      type: "website",
      locale,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: `${SITE_URL}/brand/scorematrix-logo.png`,
          width: 512,
          height: 512,
          alt: `${SITE_NAME} news and analysis`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: query ? title : seo.ogTitle,
      description,
      images: [`${SITE_URL}/brand/scorematrix-logo.png`],
    },
  };
}

export default async function NewsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = getQuery(resolvedSearchParams);
  const page = getPage(resolvedSearchParams);
  const type = parseArticleType(resolvedSearchParams?.type);
  const result = await getPaginatedScormArticles(locale, page, query, type);
  const seo = getNewsSeoContent(locale);
  const canonical = getNewsUrl(locale, query, page, type);
  const jsonLd = buildNewsStructuredData({
    locale,
    seo,
    articles: result.articles,
    canonical,
    page,
    query,
    type,
  });

  return (
    <div className="space-y-8 pb-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <NewsListClient
        articles={result.articles}
        source={result.source}
        locale={locale}
        initialSearch={query}
        currentPage={result.currentPage}
        totalPages={result.totalPages}
        totalArticles={result.totalArticles}
        activeType={type}
      />
      <section className="mx-auto max-w-6xl rounded-2xl border border-cyan-300/15 bg-[#0b111d] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-sm font-black uppercase tracking-wide text-cyan-300">
            ScoreMatrix News
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
    </div>
  );
}

function buildNewsStructuredData({
  locale,
  seo,
  articles,
  canonical,
  page,
  query,
  type,
}: {
  locale: string;
  seo: ReturnType<typeof getNewsSeoContent>;
  articles: NewsArticle[];
  canonical: string;
  page: number;
  query: string;
  type?: "news" | "analysis";
}) {
  const articleItems = articles.slice(0, 20).map((article, index) => {
    const title = localizeArticleText(article.title, locale);
    const summary = localizeArticleText(article.summary, locale);
    const articleUrl = `${SITE_URL}/${locale}/news/${article.slug}`;

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": article.category === "analysis" ? "AnalysisNewsArticle" : "NewsArticle",
        "@id": `${articleUrl}#article`,
        url: articleUrl,
        headline: title,
        description: summary || undefined,
        image: resolveArticleImage(article.image),
        datePublished: article.publishedAt,
        dateModified: article.updatedAt ?? article.publishedAt,
        author: {
          "@type": "Organization",
          name: article.author || SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/brand/scorematrix-logo.png`,
          },
        },
        inLanguage: locale,
        keywords: article.tags.join(", "),
      },
    };
  });

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: seo.title,
      description: query
        ? `${seo.searchDescription} Query: ${query}.`
        : type === "analysis"
          ? seo.analysisDescription
          : type === "news"
            ? seo.newsDescription
            : seo.description,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        "football news",
        "football analysis",
        "football prediction tips",
        "AI football insight",
      ],
      mainEntity: {
        "@type": "ItemList",
        "@id": `${canonical}#articles`,
        name: seo.pageTitle,
        numberOfItems: articleItems.length,
        itemListElement: articleItems,
      },
      pagination: page > 1 ? `Page ${page}` : undefined,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${canonical}#faq`,
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
      "@id": `${canonical}#breadcrumb`,
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
          name: "News",
          item: `${SITE_URL}/${locale}/news`,
        },
      ],
    },
  ];
}

function localizeArticleText(value: NewsArticle["title"], locale: string) {
  return typeof value === "string"
    ? value
    : value[locale] ?? value.th ?? value.en ?? "";
}

function resolveArticleImage(image: string) {
  if (/^https?:\/\//i.test(image)) return image;
  return `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;
}
