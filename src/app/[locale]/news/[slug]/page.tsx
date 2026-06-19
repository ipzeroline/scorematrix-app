import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getScormArticleBySlug } from "@/lib/articles-api";
import { NewsDetailClient } from "@/components/news/NewsDetailClient";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

const getArticleBySlugCached = cache((slug: string, locale: string) =>
  getScormArticleBySlug(slug, locale)
);

function absoluteUrl(pathnameOrUrl: string) {
  if (/^https?:\/\//i.test(pathnameOrUrl)) return pathnameOrUrl;
  return `${SITE_URL}${pathnameOrUrl.startsWith("/") ? pathnameOrUrl : `/${pathnameOrUrl}`}`;
}

function localizeField(value: string | Record<string, string>, locale: string) {
  return typeof value === "string" ? value : value[locale] ?? value.th ?? value.en ?? "";
}

function getDescription(summary: string) {
  return summary.replace(/\s+/g, " ").trim().slice(0, 160);
}

function getWordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlugCached(slug, locale);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const title = localizeField(article.title, locale);
  const summary = localizeField(article.summary, locale);
  const description = getDescription(summary);
  const image = absoluteUrl(article.image || "/brand/scorematrix-logo.png");
  const canonical = absoluteUrl(`/${locale}/news/${slug}`);
  const keywords = article.keywords?.length ? article.keywords : article.tags;
  const articleTitle = `${title} | ${SITE_NAME}`;

  return {
    title: {
      absolute: articleTitle,
    },
    description,
    keywords,
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, absoluteUrl(`/${code}/news/${slug}`)])
      ),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: articleTitle,
      description,
      type: "article",
      locale,
      alternateLocale: LOCALE_CODES.filter((code) => code !== locale),
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: image, alt: title, width: 1200, height: 675 }],
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      authors: [article.author],
      section: article.category === "analysis" ? "Football Analysis" : "Football News",
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: articleTitle,
      description,
      images: [image],
    },
    other: {
      "article:section": article.category === "analysis" ? "Football Analysis" : "Football News",
      "article:published_time": article.publishedAt,
      "article:modified_time": article.updatedAt ?? article.publishedAt,
    },
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const article = await getArticleBySlugCached(slug, locale);

  if (!article) {
    notFound();
  }

  const title = localizeField(article.title, locale);
  const summary = localizeField(article.summary, locale);
  const content = localizeField(article.content, locale);
  const canonical = absoluteUrl(`/${locale}/news/${slug}`);
  const image = absoluteUrl(article.image || "/brand/scorematrix-logo.png");
  const keywords = article.keywords?.length ? article.keywords : article.tags;
  const articleSection = article.category === "analysis" ? "Football Analysis" : "Football News";
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": article.category === "analysis" ? "AnalysisNewsArticle" : "NewsArticle",
      "@id": `${canonical}#article`,
      headline: title,
      description: summary,
      url: canonical,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonical,
      },
      image: {
        "@type": "ImageObject",
        url: image,
        width: 1200,
        height: 675,
      },
      thumbnailUrl: image,
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      author: {
        "@type": "Organization",
        name: article.author || SITE_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/brand/scorematrix-logo.png"),
        },
      },
      articleSection,
      keywords: keywords.join(", "),
      wordCount: getWordCount(content),
      isAccessibleForFree: true,
      inLanguage: locale,
      about: keywords.slice(0, 6).map((keyword) => ({
        "@type": "Thing",
        name: keyword,
      })),
      interactionStatistic: article.viewCount === undefined ? undefined : {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/ReadAction",
        userInteractionCount: article.viewCount,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": canonical,
      url: canonical,
      name: title,
      description: summary,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: image,
      },
      breadcrumb: `${canonical}#breadcrumb`,
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
          item: absoluteUrl(`/${locale}`),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "News",
          item: absoluteUrl(`/${locale}/news`),
        },
        {
          "@type": "ListItem",
          position: 3,
          name: title,
          item: canonical,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <NewsDetailClient article={article} locale={locale} />
    </>
  );
}
