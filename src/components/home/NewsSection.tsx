"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  Eye,
  Lightbulb,
  Newspaper,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NewsArticle } from "@/types/news";

const categoryMeta: Record<
  string,
  {
    label: string;
    variant: "cyan" | "magenta" | "green" | "gold";
    icon: LucideIcon;
  }
> = {
  analysis: { label: "Analysis", variant: "cyan", icon: BarChart3 },
  news: { label: "News", variant: "magenta", icon: Newspaper },
  feature: { label: "Feature", variant: "green", icon: Trophy },
  tips: { label: "Tips", variant: "gold", icon: Lightbulb },
};

function formatNewsDate(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return t("common.today");
  return d.toISOString().slice(0, 10);
}

function localizeField(article: NewsArticle, field: "title" | "summary", locale: string): string {
  const value = article[field];
  if (typeof value === "string") return value;
  return value[locale] ?? value.en ?? "";
}

function formatViewCount(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

interface NewsSectionProps {
  articles: NewsArticle[];
}

export function NewsSection({ articles }: NewsSectionProps) {
  const locale = useLocale();
  const t = useTranslations();
  const latestArticles = articles.slice(0, 6);

  return (
    <div className="flex flex-col gap-3">
      <div className="news-section-heading relative overflow-hidden rounded-lg border border-amber-500/20 bg-[#130f0a] px-3 py-2.5">
        <div className="news-section-heading-ticker absolute inset-0" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="news-section-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-200">
              <Newspaper
                size={17}
                strokeWidth={2.3}
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                aria-hidden="true"
              />
            </span>
            <h2 className="truncate text-base font-bold tracking-normal text-white md:text-lg">
              {t("dashboard.latestNews")}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Sparkles
              size={15}
              strokeWidth={2.2}
              className="shrink-0 text-rose-300 drop-shadow-[0_0_8px_rgba(251,113,133,0.65)]"
              aria-hidden="true"
            />
            <Link
              href={`/${locale}/news`}
              className="whitespace-nowrap text-[11px] font-semibold text-amber-300 transition-colors hover:text-amber-200"
            >
              {t("common.viewAll")} &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {latestArticles.map((article) => {
          const meta = categoryMeta[article.category];
          const CategoryIcon = meta.icon;
          const title = localizeField(article, "title", locale);
          const summary = localizeField(article, "summary", locale);
          const viewCount =
            typeof article.viewCount === "number" && Number.isFinite(article.viewCount)
              ? Math.max(0, Math.trunc(article.viewCount))
              : null;
          return (
            <Link
              key={article.id}
              href={`/${locale}/news/${article.slug}`}
              className="group block h-full"
            >
              <Card
                hover
                className="news-article-card relative flex h-full flex-col gap-2.5 overflow-hidden"
              >
                <div className="news-article-card-sheen absolute inset-0" />
                <div className="relative -mx-3 -mt-3 mb-1 aspect-[16/8.5] overflow-hidden rounded-t-lg bg-gray-950">
                  <Image
                    src={article.image}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-black/15" />
                </div>

                {/* Category badge */}
                <div className="relative flex items-center justify-between">
                  <Badge variant={meta.variant} size="sm">
                    <span className="flex items-center gap-1.5">
                      <CategoryIcon size={12} strokeWidth={2.4} aria-hidden="true" />
                      <span>{t(`dashboard.newsCategories.${article.category}`)}</span>
                    </span>
                  </Badge>
                  <span className="text-[10px] text-gray-600">
                    {formatNewsDate(article.publishedAt, t)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="relative line-clamp-2 text-sm font-semibold leading-snug text-white">
                  {title}
                </h3>

                {/* Summary */}
                <p className="relative line-clamp-2 text-[11px] leading-5 text-gray-400">
                  {summary}
                </p>

                {/* Meta row */}
                <div className="relative flex items-center justify-between mt-auto pt-1 border-t border-gray-800/50">
                  <span className="text-[11px] text-gray-500">
                    {article.author}
                  </span>
                  <div className="flex shrink-0 items-center gap-2 text-[11px] text-gray-600">
                    {viewCount !== null ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-cyan-300/10 bg-cyan-300/[0.04] px-1.5 py-0.5 text-cyan-100/75">
                        <Eye size={12} strokeWidth={2.2} aria-hidden="true" />
                        {formatViewCount(viewCount, locale)} {t("news.views")}
                      </span>
                    ) : null}
                    <span>
                      {article.readTime} {t("news.minRead")}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
