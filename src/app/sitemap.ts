import type { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";
import { LOCALE_CODES } from "@/i18n";
import { getLatestScormArticles } from "@/lib/articles-api";
import { SITE_URL } from "@/lib/site";
import type { NewsArticle } from "@/types/news";

export const dynamic = "force-dynamic";

const staticRoutes = [
  "",
  "/livescore",
  "/matches",
  "/predict",
  "/ai-insight",
  "/auth/login",
  "/auth/register",
  "/football/leagues",
  "/news",
  "/world-cup-2026",
  "/legal/about",
  "/legal/contact",
  "/legal/faq",
  "/legal/legal-notice",
  "/legal/privacy",
  "/legal/reward-rules",
  "/legal/terms",
] as const;

const routeSeoWeight: Partial<
  Record<
    typeof staticRoutes[number],
    {
      changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
      priority: number;
    }
  >
> = {
  "": { changeFrequency: "daily", priority: 1 },
  "/news": { changeFrequency: "daily", priority: 0.9 },
  "/world-cup-2026": { changeFrequency: "daily", priority: 0.92 },
};

function absoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname}`;
}

async function getNewsEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();
  const apiArticles = await getLatestScormArticles(100);

  for (const article of apiArticles) {
    const lastModified = article.updatedAt ?? article.publishedAt;
    for (const locale of LOCALE_CODES) {
      const url = absoluteUrl(`/${locale}/news/${article.slug}`);
      if (seen.has(url)) continue;
      seen.add(url);
      entries.push({
        url,
        lastModified: lastModified ? new Date(lastModified) : new Date(),
        changeFrequency: "daily",
        priority: article.category === "analysis" ? 0.72 : 0.7,
      });
    }
  }

  const newsDir = path.join(process.cwd(), "src", "data", "news");

  try {
    const dateDirs = await fs.readdir(newsDir, { withFileTypes: true });

    for (const dateDir of dateDirs.filter((entry) => entry.isDirectory()).map((entry) => entry.name)) {
      for (const locale of LOCALE_CODES) {
        const file = path.join(newsDir, dateDir, `${locale}.json`);

        try {
          const raw = await fs.readFile(file, "utf-8");
          const articles = JSON.parse(raw) as NewsArticle[];

          for (const article of articles) {
            const url = absoluteUrl(`/${locale}/news/${article.slug}`);
            if (seen.has(url)) continue;
            seen.add(url);
            entries.push({
              url,
              lastModified: article.publishedAt ? new Date(article.publishedAt) : new Date(dateDir),
              changeFrequency: "monthly",
              priority: 0.65,
            });
          }
        } catch {
          // Locale file may not exist for older generated news dates.
        }
      }
    }
  } catch {
    // News directory is optional in fresh environments.
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const routeEntries = LOCALE_CODES.flatMap((locale) =>
    staticRoutes.map((route) => {
      const weight = routeSeoWeight[route] ?? { changeFrequency: "weekly" as const, priority: 0.75 };

      return {
        url: absoluteUrl(`/${locale}${route}`),
        lastModified: now,
        changeFrequency: weight.changeFrequency,
        priority: weight.priority,
      };
    }),
  );

  const newsEntries = await getNewsEntries();
  return [...routeEntries, ...newsEntries];
}
