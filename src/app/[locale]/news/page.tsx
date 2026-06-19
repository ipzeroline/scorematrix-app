import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPaginatedScormArticles, parseArticleType } from "@/lib/articles-api";
import { NewsListClient } from "@/components/news/NewsListClient";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";

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
  const t = await getTranslations({ locale, namespace: "seo.news" });
  const sectionTitle = type === "analysis"
    ? t("analysisTitle")
    : type === "news"
      ? t("newsTitle")
      : t("title");
  const title = query ? `${query} | ${sectionTitle}` : sectionTitle;
  const description = query
    ? `Search ScoreMatrix football news for ${query}. ${t("description")}`
    : t("description");
  const canonical = getNewsUrl(locale, query, page, type);

  return {
    title,
    description,
    keywords: t("keywords"),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, getNewsUrl(code, query, page, type)])
      ),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale,
      url: canonical,
      siteName: "ScoreMatrix",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ScoreMatrix News and Analysis",
    inLanguage: locale,
    url: `/${locale}/news`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: result.articles.map((article, index) => {
        const title = typeof article.title === "string" ? article.title : article.title[locale] ?? article.title.th ?? "";
        return {
          "@type": "ListItem",
          position: index + 1,
          url: `/${locale}/news/${article.slug}`,
          name: title,
        };
      }),
    },
  };

  return (
    <>
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
    </>
  );
}
