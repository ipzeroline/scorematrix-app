import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPaginatedArticles } from "@/lib/news-generator";
import { NewsListClient } from "@/components/news/NewsListClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string | string[]; q?: string | string[] }>;
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

function getNewsUrl(locale: string, query: string, page: number) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return `/${locale}/news${suffix ? `?${suffix}` : ""}`;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const query = getQuery(resolvedSearchParams);
  const page = getPage(resolvedSearchParams);
  const t = await getTranslations({ locale, namespace: "seo.news" });
  const title = query ? `${query} | ${t("title")}` : t("title");
  const description = query
    ? `Search ScoreMatrix football news for ${query}. ${t("description")}`
    : t("description");
  const canonical = getNewsUrl(locale, query, page);

  return {
    title,
    description,
    keywords: t("keywords"),
    alternates: {
      canonical,
      languages: {
        th: getNewsUrl("th", query, page),
        en: getNewsUrl("en", query, page),
        lo: getNewsUrl("lo", query, page),
        my: getNewsUrl("my", query, page),
        km: getNewsUrl("km", query, page),
        zh: getNewsUrl("zh", query, page),
      },
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
  const result = await getPaginatedArticles(locale, page, query);

  return (
    <NewsListClient
      articles={result.articles}
      source={result.source}
      locale={locale}
      initialSearch={query}
      currentPage={result.currentPage}
      totalPages={result.totalPages}
      totalArticles={result.totalArticles}
    />
  );
}
