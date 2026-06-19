"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, User, BarChart3, Lightbulb, Newspaper, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { NewsArticle } from "@/types/news";

const categoryMeta: Record<string, { labelKey: keyof DetailCopy["categories"]; variant: "cyan" | "magenta" | "green" | "gold"; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  analysis: { labelKey: "analysis", variant: "cyan", icon: BarChart3 },
  news: { labelKey: "news", variant: "magenta", icon: Newspaper },
  feature: { labelKey: "feature", variant: "green", icon: Trophy },
  tips: { labelKey: "tips", variant: "gold", icon: Lightbulb },
};

type DetailCopy = {
  back: string;
  minRead: string;
  views: string;
  more: string;
  predictions: string;
  categories: Record<"analysis" | "news" | "feature" | "tips", string>;
};

const copyByLocale: Record<string, DetailCopy> = {
  th: {
    back: "กลับไปหน้าข่าว",
    minRead: "นาที",
    views: "ครั้ง",
    more: "ต้องการอินไซต์ฟุตบอลเพิ่มเติม? ดูคำทำนายล่าสุดบน ScoreMatrix",
    predictions: "ไปที่หน้าทำนาย",
    categories: { analysis: "วิเคราะห์", news: "ข่าว", feature: "ฟีเจอร์", tips: "เคล็ดลับ" },
  },
  en: {
    back: "Back to News",
    minRead: "min read",
    views: "views",
    more: "Want more football insights? Check out the latest predictions on ScoreMatrix.",
    predictions: "Go to Predictions",
    categories: { analysis: "Analysis", news: "News", feature: "Feature", tips: "Tips" },
  },
  lo: {
    back: "ກັບໄປໜ້າຂ່າວ",
    minRead: "ນາທີ",
    views: "ຄັ້ງ",
    more: "ຕ້ອງການອິນໄຊຕ໌ບານເຕະເພີ່ມບໍ? ເບິ່ງຄຳທຳນາຍຫຼ້າສຸດໃນ ScoreMatrix.",
    predictions: "ໄປທີ່ການທຳນາຍ",
    categories: { analysis: "ວິເຄາະ", news: "ຂ່າວ", feature: "ຟີເຈີ", tips: "ເຄັດລັບ" },
  },
  my: {
    back: "သတင်းစာမျက်နှာသို့ ပြန်သွားရန်",
    minRead: "မိနစ်ဖတ်ရန်",
    views: "ကြိမ်",
    more: "နောက်ထပ် ဘောလုံးအင်ဆိုက်များလိုပါသလား။ ScoreMatrix တွင် နောက်ဆုံးခန့်မှန်းချက်များကို ကြည့်ပါ။",
    predictions: "ခန့်မှန်းချက်များသို့",
    categories: { analysis: "သုံးသပ်ချက်", news: "သတင်း", feature: "အထူး", tips: "အကြံပြုချက်" },
  },
  km: {
    back: "ត្រឡប់ទៅព័ត៌មាន",
    minRead: "នាទីអាន",
    views: "ដង",
    more: "ចង់បានការយល់ដឹងបាល់ទាត់បន្ថែមទេ? មើលការទស្សន៍ទាយថ្មីៗនៅលើ ScoreMatrix។",
    predictions: "ទៅកាន់ការទស្សន៍ទាយ",
    categories: { analysis: "វិភាគ", news: "ព័ត៌មាន", feature: "លក្ខណៈពិសេស", tips: "គន្លឹះ" },
  },
  zh: {
    back: "返回新闻",
    minRead: "分钟阅读",
    views: "次阅读",
    more: "想查看更多足球洞察？前往 ScoreMatrix 查看最新预测。",
    predictions: "前往预测",
    categories: { analysis: "分析", news: "新闻", feature: "专题", tips: "技巧" },
  },
};

function localizeField(article: NewsArticle, field: "title" | "summary" | "content", locale: string): string {
  const val = article[field];
  if (typeof val === "string") return val;
  return (val as Record<string, string>)[locale] ?? (val as Record<string, string>).en ?? "";
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

function getCopy(locale: string) {
  return copyByLocale[locale] ?? copyByLocale.th;
}

interface Props {
  article: NewsArticle;
  locale: string;
}

export function NewsDetailClient({ article, locale }: Props) {
  const copy = getCopy(locale);
  const cat = categoryMeta[article.category] ?? categoryMeta.news;
  const Icon = cat.icon;
  const title = localizeField(article, "title", locale);
  const content = localizeField(article, "content", locale);
  const summary = localizeField(article, "summary", locale);
  const categoryLabel = copy.categories[cat.labelKey];

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-8 sm:px-0">
      {/* Back link */}
      <Link
        href={`/${locale}/news`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
      >
        <ArrowLeft size={16} />
        {copy.back}
      </Link>

      {/* Article */}
      <article className="w-full">
        {/* Header */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Badge variant={cat.variant} size="sm">
              <span className="flex items-center gap-1.5">
                <Icon size={12} />
                <span>{categoryLabel}</span>
              </span>
            </Badge>
          </div>

          <h1 className="text-2xl font-bold text-white font-display leading-tight">
            {title}
          </h1>

          <p className="text-sm text-gray-400 leading-relaxed">
            {summary}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-600 border-b border-white/10 pb-4">
            <span className="flex items-center gap-1">
              <User size={12} />
              {article.author}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDate(article.publishedAt)}
            </span>
            <span>{article.readTime} {copy.minRead}</span>
            {article.viewCount !== undefined && (
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {article.viewCount.toLocaleString()} {copy.views}
              </span>
            )}
          </div>
        </div>

        <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-gray-950">
          <Image
            src={article.image}
            alt={title}
            fill
            priority
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-sm max-w-none">
          {content.split("\n\n").map((paragraph, i) => (
            <p key={i} className="text-sm text-gray-300 leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-1 rounded-lg bg-white/5 text-gray-400 border border-white/5"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </article>

      {/* Share / More */}
      <Card className="p-4 text-center">
        <p className="text-xs text-gray-500 mb-3">
          {copy.more}
        </p>
        <Link
          href={`/${locale}/predict`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {copy.predictions} &rarr;
        </Link>
      </Card>
    </div>
  );
}
