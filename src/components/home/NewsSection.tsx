"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  BarChart3,
  Lightbulb,
  Newspaper,
  Sparkles,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface NewsItem {
  id: string;
  titleKey: string;
  summaryKey: string;
  author: string;
  category: "analysis" | "news" | "feature" | "tips";
  readTime: number;
  date: string;
}

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

const newsArticles: NewsItem[] = [
  {
    id: "nw-1",
    titleKey: "aiChanging.title",
    summaryKey: "aiChanging.summary",
    author: "Alex Chen",
    category: "analysis",
    readTime: 5,
    date: "2026-05-11",
  },
  {
    id: "nw-2",
    titleKey: "unbeatenRun.title",
    summaryKey: "unbeatenRun.summary",
    author: "Sarah Jones",
    category: "news",
    readTime: 3,
    date: "2026-05-10",
  },
  {
    id: "nw-3",
    titleKey: "topPredictors.title",
    summaryKey: "topPredictors.summary",
    author: "Marcus Vega",
    category: "feature",
    readTime: 7,
    date: "2026-05-09",
  },
  {
    id: "nw-4",
    titleKey: "tips.title",
    summaryKey: "tips.summary",
    author: "Priya Kapoor",
    category: "tips",
    readTime: 4,
    date: "2026-05-08",
  },
  {
    id: "nw-5",
    titleKey: "transfer.title",
    summaryKey: "transfer.summary",
    author: "Tom Bradley",
    category: "news",
    readTime: 6,
    date: "2026-05-07",
  },
  {
    id: "nw-6",
    titleKey: "xg.title",
    summaryKey: "xg.summary",
    author: "Alex Chen",
    category: "analysis",
    readTime: 8,
    date: "2026-05-06",
  },
];

function formatNewsDate(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return t("common.today");
  if (diffDays === 1) return t("common.yesterday");
  return t("dashboard.daysAgo", { count: diffDays });
}

export function NewsSection() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-4">
      <div className="news-section-heading relative overflow-hidden rounded-xl border border-amber-500/20 bg-[#130f0a] px-4 py-3">
        <div className="news-section-heading-ticker absolute inset-0" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="news-section-icon grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-amber-400/35 bg-amber-400/10 text-amber-200">
              <Newspaper
                size={20}
                strokeWidth={2.3}
                className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                aria-hidden="true"
              />
            </span>
            <h2
              className="font-display truncate text-xl font-bold tracking-normal text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {t("dashboard.latestNews")}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Sparkles
              size={18}
              strokeWidth={2.2}
              className="shrink-0 text-rose-300 drop-shadow-[0_0_8px_rgba(251,113,133,0.65)]"
              aria-hidden="true"
            />
            <Link
              href={`/${locale}/news`}
              className="whitespace-nowrap text-xs font-medium text-amber-300 transition-colors hover:text-amber-200"
            >
              {t("common.viewAll")} &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsArticles.map((article) => {
          const meta = categoryMeta[article.category];
          const CategoryIcon = meta.icon;
          return (
            <Card
              key={article.id}
              hover
              className="news-article-card relative flex flex-col gap-3 overflow-hidden"
            >
              <div className="news-article-card-sheen absolute inset-0" />
              {/* Category badge */}
              <div className="relative flex items-center justify-between">
                <Badge variant={meta.variant} size="sm">
                  <span className="flex items-center gap-1.5">
                    <CategoryIcon size={12} strokeWidth={2.4} aria-hidden="true" />
                    <span>{t(`dashboard.newsCategories.${article.category}`)}</span>
                  </span>
                </Badge>
                <span className="text-[10px] text-gray-600">
                  {formatNewsDate(article.date, t)}
                </span>
              </div>

              {/* Title */}
              <h3 className="relative text-base font-semibold text-white leading-snug line-clamp-2">
                {t(`dashboard.newsItems.${article.titleKey}`)}
              </h3>

              {/* Summary */}
              <p className="relative text-xs text-gray-400 leading-relaxed line-clamp-2">
                {t(`dashboard.newsItems.${article.summaryKey}`)}
              </p>

              {/* Meta row */}
              <div className="relative flex items-center justify-between mt-auto pt-1 border-t border-gray-800/50">
                <span className="text-[11px] text-gray-500">
                  {article.author}
                </span>
                <span className="text-[11px] text-gray-600">
                  {article.readTime} {t("news.minRead")}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
