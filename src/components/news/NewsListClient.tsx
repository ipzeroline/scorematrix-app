"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Clock,
  User,
  BarChart3,
  Lightbulb,
  Newspaper,
  Trophy,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { NewsArticle } from "@/types/news";

const categoryMeta: Record<string, { labelKey: keyof NewsCopy["categories"]; variant: "cyan" | "magenta" | "green" | "gold"; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  analysis: { labelKey: "analysis", variant: "cyan", icon: BarChart3 },
  news: { labelKey: "news", variant: "magenta", icon: Newspaper },
  feature: { labelKey: "feature", variant: "green", icon: Trophy },
  tips: { labelKey: "tips", variant: "gold", icon: Lightbulb },
};

type NewsCopy = {
  title: string;
  subtitle: string;
  searchPlaceholder: string;
  all: string;
  noResults: string;
  noArticles: string;
  today: string;
  yesterday: string;
  daysAgo: string;
  minRead: string;
  article: string;
  articles: string;
  categories: Record<"analysis" | "news" | "feature" | "tips", string>;
};

const copyByLocale: Record<string, NewsCopy> = {
  th: {
    title: "ข่าวสารและบทวิเคราะห์",
    subtitle: "ข่าวฟุตบอลจากรายการ API วันนี้ รายงานผล พรีวิว และเคล็ดลับการทำนาย",
    searchPlaceholder: "ค้นหาข่าว...",
    all: "ทั้งหมด",
    noResults: "ไม่พบบทความที่ตรงกับ",
    noArticles: "ยังไม่มีข่าว",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    daysAgo: "วันที่แล้ว",
    minRead: "นาที",
    article: "ข่าว",
    articles: "ข่าว",
    categories: { analysis: "วิเคราะห์", news: "ข่าว", feature: "ฟีเจอร์", tips: "เคล็ดลับ" },
  },
  en: {
    title: "News & Analysis",
    subtitle: "Football news from today's API fixtures, match reports, previews, and prediction tips",
    searchPlaceholder: "Search articles...",
    all: "All",
    noResults: "No articles matching",
    noArticles: "No articles found",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "d ago",
    minRead: "min read",
    article: "article",
    articles: "articles",
    categories: { analysis: "Analysis", news: "News", feature: "Feature", tips: "Tips" },
  },
  lo: {
    title: "ຂ່າວ ແລະ ບົດວິເຄາະ",
    subtitle: "ຂ່າວບານເຕະຈາກລາຍການ API ມື້ນີ້ ລາຍງານຜົນ ພຣີວິວ ແລະເຄັດລັບການທຳນາຍ",
    searchPlaceholder: "ຄົ້ນຫາຂ່າວ...",
    all: "ທັງໝົດ",
    noResults: "ບໍ່ພົບບົດຄວາມທີ່ກົງກັບ",
    noArticles: "ຍັງບໍ່ມີຂ່າວ",
    today: "ມື້ນີ້",
    yesterday: "ມື້ວານ",
    daysAgo: "ມື້ກ່ອນ",
    minRead: "ນາທີ",
    article: "ຂ່າວ",
    articles: "ຂ່າວ",
    categories: { analysis: "ວິເຄາະ", news: "ຂ່າວ", feature: "ຟີເຈີ", tips: "ເຄັດລັບ" },
  },
  my: {
    title: "သတင်းနှင့် သုံးသပ်ချက်",
    subtitle: "ယနေ့ API ပွဲစဉ်များမှ ဘောလုံးသတင်း၊ ပွဲရလဒ်၊ ကြိုတင်သုံးသပ်ချက်နှင့် ခန့်မှန်းချက်အကြံပြုချက်များ",
    searchPlaceholder: "သတင်းရှာရန်...",
    all: "အားလုံး",
    noResults: "ကိုက်ညီသောဆောင်းပါးမရှိ",
    noArticles: "သတင်းမရှိသေးပါ",
    today: "ယနေ့",
    yesterday: "မနေ့က",
    daysAgo: "ရက်က",
    minRead: "မိနစ်ဖတ်ရန်",
    article: "ဆောင်းပါး",
    articles: "ဆောင်းပါး",
    categories: { analysis: "သုံးသပ်ချက်", news: "သတင်း", feature: "အထူး", tips: "အကြံပြုချက်" },
  },
  km: {
    title: "ព័ត៌មាន និងវិភាគ",
    subtitle: "ព័ត៌មានបាល់ទាត់ពីការប្រកួត API ថ្ងៃនេះ របាយការណ៍លទ្ធផល ការមើលមុន និងគន្លឹះទស្សន៍ទាយ",
    searchPlaceholder: "ស្វែងរកអត្ថបទ...",
    all: "ទាំងអស់",
    noResults: "រកមិនឃើញអត្ថបទដែលត្រូវនឹង",
    noArticles: "មិនទាន់មានព័ត៌មាន",
    today: "ថ្ងៃនេះ",
    yesterday: "ម្សិលមិញ",
    daysAgo: "ថ្ងៃមុន",
    minRead: "នាទីអាន",
    article: "អត្ថបទ",
    articles: "អត្ថបទ",
    categories: { analysis: "វិភាគ", news: "ព័ត៌មាន", feature: "លក្ខណៈពិសេស", tips: "គន្លឹះ" },
  },
  zh: {
    title: "新闻与分析",
    subtitle: "来自今日 API 赛程的足球新闻、赛报、前瞻与预测技巧",
    searchPlaceholder: "搜索文章...",
    all: "全部",
    noResults: "没有匹配的文章",
    noArticles: "暂无新闻",
    today: "今天",
    yesterday: "昨天",
    daysAgo: "天前",
    minRead: "分钟阅读",
    article: "篇文章",
    articles: "篇文章",
    categories: { analysis: "分析", news: "新闻", feature: "专题", tips: "技巧" },
  },
};

function localizeField(article: NewsArticle, field: "title" | "summary" | "content", locale: string): string {
  const val = article[field];
  if (typeof val === "string") return val;
  return (val as Record<string, string>)[locale] ?? (val as Record<string, string>).en ?? "";
}

function getCopy(locale: string) {
  return copyByLocale[locale] ?? copyByLocale.th;
}

function formatDate(iso: string, copy: NewsCopy): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return copy.today;
    if (diffDays === 1) return copy.yesterday;
    if (diffDays < 7) return `${diffDays}${copy.daysAgo}`;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
}

interface Props {
  articles: NewsArticle[];
  source: string;
  locale: string;
  initialSearch?: string;
  currentPage?: number;
  totalPages?: number;
  totalArticles?: number;
}

export function NewsListClient({
  articles,
  locale,
  initialSearch = "",
  currentPage = 1,
  totalPages = 1,
  totalArticles,
}: Props) {
  const copy = getCopy(locale);
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = articles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => {
        const title = localizeField(a, "title", locale).toLowerCase();
        const summary = localizeField(a, "summary", locale).toLowerCase();
        const tags = a.tags.join(" ").toLowerCase();
        return title.includes(q) || summary.includes(q) || tags.includes(q);
      });
    }
    if (categoryFilter) {
      result = result.filter((a) => a.category === categoryFilter);
    }
    return result;
  }, [articles, search, categoryFilter, locale]);

  const categories = ["analysis", "news", "feature", "tips"];
  const shownTotal = totalArticles ?? articles.length;
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (initialSearch) params.set("q", initialSearch);
    if (page > 1) params.set("page", String(page));
    const suffix = params.toString();
    return `/${locale}/news${suffix ? `?${suffix}` : ""}`;
  };
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).filter((page) => {
    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            {copy.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {copy.subtitle}
          </p>
        </div>
      </div>

      {/* Search bar */}
      <form action={`/${locale}/news`} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          name="q"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={copy.searchPlaceholder}
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              if (initialSearch) {
                window.location.href = `/${locale}/news`;
              }
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </form>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setCategoryFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            categoryFilter === null
              ? "bg-white/10 text-white border border-white/10"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          {copy.all}
        </button>
        {categories.map((cat) => {
          const meta = categoryMeta[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {copy.categories[meta.labelKey]}
            </button>
          );
        })}
      </div>

      {/* Article grid */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText size={32} className="text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {search ? `${copy.noResults} "${search}"` : copy.noArticles}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((article) => {
            const cat = categoryMeta[article.category] ?? categoryMeta.news;
            const Icon = cat.icon;
            const title = localizeField(article, "title", locale);
            const summary = localizeField(article, "summary", locale);
            const categoryLabel = copy.categories[cat.labelKey];

            return (
              <Link key={article.id} href={`/${locale}/news/${article.slug}`}>
                <Card
                  hover
                  className="group h-full flex flex-col overflow-hidden p-4"
                >
                  <div className="-mx-4 -mt-4 mb-4 aspect-[16/9] overflow-hidden rounded-t-xl bg-gray-950">
                    <Image
                      src={article.image}
                      alt={title}
                      width={640}
                      height={360}
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Category badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={cat.variant} size="sm">
                      <span className="flex items-center gap-1.5">
                        <Icon size={12} />
                        <span>{categoryLabel}</span>
                      </span>
                    </Badge>
                    <span className="text-[10px] text-gray-600 flex items-center gap-1">
                      <Clock size={10} />
                      {formatDate(article.publishedAt, copy)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-300 transition-colors">
                    {title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    {summary}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center justify-between text-[10px] text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={10} />
                      <span>{article.author}</span>
                    </div>
                    <span>{article.readTime} {copy.minRead}</span>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Results count */}
      <p className="text-center text-xs text-gray-600">
        {shownTotal} {shownTotal === 1 ? copy.article : copy.articles}
      </p>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="News pages">
          <Link
            href={pageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className={`grid h-9 w-9 place-items-center rounded-lg border border-white/10 transition-colors ${
              currentPage === 1
                ? "pointer-events-none text-gray-700"
                : "text-gray-400 hover:border-cyan-500/40 hover:text-cyan-200"
            }`}
          >
            <ChevronLeft size={16} />
          </Link>

          {pageNumbers.map((page, index) => {
            const previous = pageNumbers[index - 1];
            const showGap = previous !== undefined && page - previous > 1;

            return (
              <div key={page} className="flex items-center gap-2">
                {showGap && <span className="text-xs text-gray-700">...</span>}
                <Link
                  href={pageHref(page)}
                  className={`grid h-9 min-w-9 place-items-center rounded-lg px-3 text-xs font-semibold transition-colors ${
                    page === currentPage
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-500/30"
                      : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                  }`}
                >
                  {page}
                </Link>
              </div>
            );
          })}

          <Link
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className={`grid h-9 w-9 place-items-center rounded-lg border border-white/10 transition-colors ${
              currentPage === totalPages
                ? "pointer-events-none text-gray-700"
                : "text-gray-400 hover:border-cyan-500/40 hover:text-cyan-200"
            }`}
          >
            <ChevronRight size={16} />
          </Link>
        </nav>
      )}
    </div>
  );
}
