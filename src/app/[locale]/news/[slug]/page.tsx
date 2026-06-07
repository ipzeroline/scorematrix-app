import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/news-generator";
import { NewsDetailClient } from "@/components/news/NewsDetailClient";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const title = typeof article.title === "string" ? article.title : (article.title[locale] ?? article.title.en ?? "");
  const summary = typeof article.summary === "string" ? article.summary : (article.summary[locale] ?? article.summary.en ?? "");
  const image = article.image || "/brand/scorematrix-logo.png";

  return {
    title: `${title} | ScoreMatrix News`,
    description: summary.slice(0, 160),
    alternates: {
      canonical: `/${locale}/news/${slug}`,
      languages: {
        th: `/th/news/${slug}`,
        en: `/en/news/${slug}`,
        lo: `/lo/news/${slug}`,
        my: `/my/news/${slug}`,
        km: `/km/news/${slug}`,
        zh: `/zh/news/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | ScoreMatrix News`,
      description: summary.slice(0, 160),
      type: "article",
      locale,
      url: `/${locale}/news/${slug}`,
      siteName: "ScoreMatrix",
      images: [{ url: image, alt: title }],
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: summary.slice(0, 160),
      images: [image],
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug, locale);

  if (!article) {
    notFound();
  }

  return <NewsDetailClient article={article} locale={locale} />;
}
