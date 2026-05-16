import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getTodayArticles, searchArticles } from "@/lib/news-generator";
import { NewsListClient } from "@/components/news/NewsListClient";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ q?: string | string[] }>;
};

function getQuery(searchParams?: { q?: string | string[] }) {
  const value = searchParams?.q;
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const query = getQuery(await searchParams);
  const t = await getTranslations({ locale, namespace: "seo.news" });
  const title = query ? `${query} | ${t("title")}` : t("title");
  const description = query
    ? `Search ScoreMatrix football news for ${query}. ${t("description")}`
    : t("description");
  const canonical = query ? `/${locale}/news?q=${encodeURIComponent(query)}` : `/${locale}/news`;

  return {
    title,
    description,
    keywords: t("keywords"),
    alternates: {
      canonical,
      languages: {
        th: query ? `/th/news?q=${encodeURIComponent(query)}` : "/th/news",
        en: query ? `/en/news?q=${encodeURIComponent(query)}` : "/en/news",
        lo: query ? `/lo/news?q=${encodeURIComponent(query)}` : "/lo/news",
        my: query ? `/my/news?q=${encodeURIComponent(query)}` : "/my/news",
        km: query ? `/km/news?q=${encodeURIComponent(query)}` : "/km/news",
        zh: query ? `/zh/news?q=${encodeURIComponent(query)}` : "/zh/news",
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
  const query = getQuery(await searchParams);
  const result = query
    ? { articles: await searchArticles(query, locale), source: "json" as const }
    : await getTodayArticles(locale);

  return <NewsListClient articles={result.articles} source={result.source} locale={locale} initialSearch={query} />;
}
