"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
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
  { label: string; variant: "cyan" | "magenta" | "green" | "gold" }
> = {
  analysis: { label: "Analysis", variant: "cyan" },
  news: { label: "News", variant: "magenta" },
  feature: { label: "Feature", variant: "green" },
  tips: { label: "Tips", variant: "gold" },
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
      <div className="flex items-center justify-between">
        <h2
          className="text-xl font-bold font-display text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("dashboard.latestNews")}
        </h2>
        <Link
          href={`/${locale}/news`}
          className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {t("common.viewAll")} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {newsArticles.map((article) => {
          const meta = categoryMeta[article.category];
          return (
            <Card key={article.id} hover className="flex flex-col gap-3">
              {/* Category badge */}
              <div className="flex items-center justify-between">
                <Badge variant={meta.variant} size="sm">
                  {t(`dashboard.newsCategories.${article.category}`)}
                </Badge>
                <span className="text-[10px] text-gray-600">
                  {formatNewsDate(article.date, t)}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-white leading-snug line-clamp-2">
                {t(`dashboard.newsItems.${article.titleKey}`)}
              </h3>

              {/* Summary */}
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                {t(`dashboard.newsItems.${article.summaryKey}`)}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-800/50">
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
