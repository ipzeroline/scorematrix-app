import "server-only";

import { cache } from "react";
import { LOCALE_CODES, type LocaleCode } from "@/i18n";
import type { NewsArticle } from "@/types/news";

export const ARTICLES_PAGE_SIZE = 9;

export type ArticleType = "news" | "analysis";

export interface ArticleListResult {
  articles: NewsArticle[];
  source: "api";
  currentPage: number;
  totalPages: number;
  totalArticles: number;
}

interface ApiArticle {
  id: number | string;
  slug: string;
  title: string;
  summary?: string | null;
  content?: string | null;
  image?: string | null;
  author?: string | null;
  category?: string | null;
  type?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  tags?: string[] | string | null;
  readTime?: number | string | null;
  read_time?: number | string | null;
  keywords?: string | string[] | null;
  view_count?: number | string | null;
  viewCount?: number | string | null;
}

interface ApiListPayload {
  data?: ApiArticle[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    total_pages?: number;
  };
}

interface ApiDetailPayload {
  data?: ApiArticle;
}

const localeToTranslateTarget: Record<LocaleCode, string> = {
  th: "th",
  en: "en",
  lo: "lo",
  my: "my",
  km: "km",
  zh: "zh-CN",
};

function getArticlesApiUrl(pathname: string) {
  const base = process.env.DATA_BASE_URL ?? "https://api.scorematrix.live/api/v1/scorm";
  const url = new URL(base);
  const baseSegments = url.pathname.split("/").filter(Boolean);
  while (baseSegments.at(-1)?.toLowerCase() === "scorm") baseSegments.pop();
  const pathSegments = pathname.split("/").filter(Boolean);
  url.pathname = `/${[...baseSegments, "scorm", ...pathSegments].join("/")}`;
  url.search = "";
  url.hash = "";
  return url;
}

function normalizeLocale(locale: string): LocaleCode {
  return LOCALE_CODES.includes(locale as LocaleCode) ? (locale as LocaleCode) : "th";
}

function normalizeType(value?: string | string[] | null): ArticleType | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "news" || raw === "analysis" ? raw : undefined;
}

export function parseArticleType(value?: string | string[] | null): ArticleType | undefined {
  return normalizeType(value);
}

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Articles request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const getPaginatedScormArticles = cache(
  async (
    locale: string,
    page = 1,
    query = "",
    type?: ArticleType,
    limit = ARTICLES_PAGE_SIZE
  ): Promise<ArticleListResult> => {
    const url = getArticlesApiUrl("/articles");
    url.searchParams.set("page", String(Math.max(1, page)));
    url.searchParams.set("limit", String(limit));
    if (type) url.searchParams.set("type", type);

    const payload = await fetchJson<ApiListPayload>(url);
    const articles = await Promise.all(
      (payload.data ?? []).map((article) => normalizeArticle(article, locale))
    );
    const filteredArticles = filterArticles(articles, query);
    const pagination = payload.pagination;

    return {
      articles: filteredArticles,
      source: "api",
      currentPage: pagination?.page ?? page,
      totalPages: pagination?.totalPages ?? pagination?.total_pages ?? 1,
      totalArticles: pagination?.total ?? filteredArticles.length,
    };
  }
);

export const getScormArticleBySlug = cache(
  async (slug: string, locale: string): Promise<NewsArticle | null> => {
    const url = getArticlesApiUrl(`/articles/${encodeURIComponent(slug)}`);

    try {
      const payload = await fetchJson<ApiDetailPayload>(url);
      return payload.data ? normalizeArticle(payload.data, locale) : null;
    } catch {
      return null;
    }
  }
);

export const getLatestScormArticles = cache(
  async (limit = 50): Promise<NewsArticle[]> => {
    const url = getArticlesApiUrl("/articles");
    url.searchParams.set("page", "1");
    url.searchParams.set("limit", String(limit));

    try {
      const payload = await fetchJson<ApiListPayload>(url);
      return Promise.all((payload.data ?? []).map((article) => normalizeArticle(article, "th")));
    } catch {
      return [];
    }
  }
);

async function normalizeArticle(article: ApiArticle, requestedLocale: string): Promise<NewsArticle> {
  const locale = normalizeLocale(requestedLocale);
  const category = normalizeCategory(article.category ?? article.type);
  const titleTh = cleanText(article.title);
  const summaryTh = cleanText(article.summary ?? "");
  const contentTh = cleanText(article.content ?? summaryTh);
  const translated = await translateArticleFields({ title: titleTh, summary: summaryTh, content: contentTh }, locale);
  const tags = normalizeTags(article.tags);
  const keywordTags = normalizeKeywords(article.keywords);

  return {
    id: String(article.id),
    slug: article.slug,
    title: { th: titleTh, [locale]: translated.title },
    summary: { th: summaryTh, [locale]: translated.summary },
    content: { th: contentTh, [locale]: translated.content },
    image: article.image || "/brand/scorematrix-logo.png",
    author: article.author?.trim() || "ScoreMatrix",
    category,
    publishedAt: article.publishedAt ?? article.published_at ?? article.updated_at ?? new Date().toISOString(),
    tags: [...new Set([...tags, ...keywordTags])].slice(0, 12),
    readTime: normalizeReadTime(article.readTime ?? article.read_time, contentTh),
    keywords: keywordTags,
    viewCount: normalizeNumber(article.view_count ?? article.viewCount),
    updatedAt: article.updated_at ?? article.publishedAt ?? article.published_at,
  };
}

function normalizeCategory(category?: string | null): NewsArticle["category"] {
  return category === "analysis" ? "analysis" : "news";
}

function normalizeTags(tags: ApiArticle["tags"]): string[] {
  if (Array.isArray(tags)) return tags.map(stripHash).filter(Boolean);
  if (typeof tags === "string") return tags.split(",").map(stripHash).filter(Boolean);
  return [];
}

function normalizeKeywords(keywords: ApiArticle["keywords"]): string[] {
  if (Array.isArray(keywords)) return keywords.map(stripHash).filter(Boolean);
  if (typeof keywords === "string") return keywords.split(",").map(stripHash).filter(Boolean);
  return [];
}

function normalizeReadTime(value: ApiArticle["readTime"], content: string) {
  const parsed = Number(value);
  if (Number.isFinite(parsed) && parsed > 0) return Math.ceil(parsed);
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function normalizeNumber(value: number | string | null | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function stripHash(value: string) {
  return value.trim().replace(/^#+/, "");
}

function cleanText(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function filterArticles(articles: NewsArticle[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return articles;

  return articles.filter((article) => {
    const fields = [
      localizeArticleField(article.title, "th"),
      localizeArticleField(article.title, "en"),
      localizeArticleField(article.summary, "th"),
      article.tags.join(" "),
      article.keywords?.join(" ") ?? "",
    ];
    return fields.join(" ").toLowerCase().includes(normalizedQuery);
  });
}

function localizeArticleField(value: NewsArticle["title"], locale: string) {
  return typeof value === "string" ? value : value[locale] ?? value.th ?? value.en ?? "";
}

async function translateArticleFields(
  fields: { title: string; summary: string; content: string },
  locale: LocaleCode
) {
  if (locale === "th") return fields;

  const [title, summary, content] = await Promise.all([
    translateThaiText(fields.title, locale),
    translateThaiText(fields.summary, locale),
    translateLongThaiText(fields.content, locale),
  ]);

  return { title, summary, content };
}

async function translateLongThaiText(text: string, locale: LocaleCode) {
  if (!text.trim()) return text;

  const chunks = chunkText(text, 1600);
  const translated = await Promise.all(chunks.map((chunk) => translateThaiText(chunk, locale)));
  return translated.join("\n\n");
}

function chunkText(text: string, maxLength: number) {
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const next = current ? `${current}\n\n${paragraph}` : paragraph;
    if (next.length <= maxLength) {
      current = next;
      continue;
    }
    if (current) chunks.push(current);
    current = paragraph;
  }

  if (current) chunks.push(current);
  return chunks;
}

const translateThaiText = cache(async (text: string, locale: LocaleCode): Promise<string> => {
  if (locale === "th" || !text.trim()) return text;

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "th");
  url.searchParams.set("tl", localeToTranslateTarget[locale]);
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) return text;
    const payload = (await response.json()) as unknown;
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) return text;

    const translated = payload[0]
      .map((item) => (Array.isArray(item) && typeof item[0] === "string" ? item[0] : ""))
      .join("")
      .trim();

    return translated || text;
  } catch {
    return text;
  }
});
