"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Hash,
  Lightbulb,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
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
  keyPoints: string;
  articleDetails: string;
  published: string;
  updated: string;
  category: string;
  readingTime: string;
  topics: string;
  source: string;
  sourceValue: string;
  related: string;
  readMoreNews: string;
  categories: Record<"analysis" | "news" | "feature" | "tips", string>;
};

const copyByLocale: Record<string, DetailCopy> = {
  th: {
    back: "กลับไปหน้าข่าว",
    minRead: "นาที",
    views: "ครั้ง",
    more: "ต้องการอินไซต์ฟุตบอลเพิ่มเติม? ดูคำทำนายล่าสุดบน ScoreMatrix",
    predictions: "ไปที่หน้าทำนาย",
    keyPoints: "ประเด็นสำคัญ",
    articleDetails: "รายละเอียดบทความ",
    published: "เผยแพร่",
    updated: "อัปเดต",
    category: "หมวดหมู่",
    readingTime: "เวลาอ่าน",
    topics: "หัวข้อที่เกี่ยวข้อง",
    source: "แหล่งข้อมูล",
    sourceValue: "ทีมข่าว ScoreMatrix",
    related: "อ่านต่อ",
    readMoreNews: "ข่าวล่าสุด",
    categories: { analysis: "วิเคราะห์", news: "ข่าว", feature: "ฟีเจอร์", tips: "เคล็ดลับ" },
  },
  en: {
    back: "Back to News",
    minRead: "min read",
    views: "views",
    more: "Want more football insights? Check out the latest predictions on ScoreMatrix.",
    predictions: "Go to Predictions",
    keyPoints: "Key Points",
    articleDetails: "Article Details",
    published: "Published",
    updated: "Updated",
    category: "Category",
    readingTime: "Reading time",
    topics: "Related Topics",
    source: "Source",
    sourceValue: "ScoreMatrix Editorial Team",
    related: "Read Next",
    readMoreNews: "Latest News",
    categories: { analysis: "Analysis", news: "News", feature: "Feature", tips: "Tips" },
  },
  lo: {
    back: "ກັບໄປໜ້າຂ່າວ",
    minRead: "ນາທີ",
    views: "ຄັ້ງ",
    more: "ຕ້ອງການອິນໄຊຕ໌ບານເຕະເພີ່ມບໍ? ເບິ່ງຄຳທຳນາຍຫຼ້າສຸດໃນ ScoreMatrix.",
    predictions: "ໄປທີ່ການທຳນາຍ",
    keyPoints: "ປະເດັນສຳຄັນ",
    articleDetails: "ລາຍລະອຽດບົດຄວາມ",
    published: "ເຜີຍແຜ່",
    updated: "ອັບເດດ",
    category: "ໝວດໝູ່",
    readingTime: "ເວລາອ່ານ",
    topics: "ຫົວຂໍ້ກ່ຽວຂ້ອງ",
    source: "ແຫຼ່ງຂໍ້ມູນ",
    sourceValue: "ທີມຂ່າວ ScoreMatrix",
    related: "ອ່ານຕໍ່",
    readMoreNews: "ຂ່າວຫຼ້າສຸດ",
    categories: { analysis: "ວິເຄາະ", news: "ຂ່າວ", feature: "ຟີເຈີ", tips: "ເຄັດລັບ" },
  },
  my: {
    back: "သတင်းစာမျက်နှာသို့ ပြန်သွားရန်",
    minRead: "မိနစ်ဖတ်ရန်",
    views: "ကြိမ်",
    more: "နောက်ထပ် ဘောလုံးအင်ဆိုက်များလိုပါသလား။ ScoreMatrix တွင် နောက်ဆုံးခန့်မှန်းချက်များကို ကြည့်ပါ။",
    predictions: "ခန့်မှန်းချက်များသို့",
    keyPoints: "အဓိကအချက်များ",
    articleDetails: "ဆောင်းပါးအသေးစိတ်",
    published: "ထုတ်ဝေချိန်",
    updated: "နောက်ဆုံးပြင်ဆင်ချိန်",
    category: "အမျိုးအစား",
    readingTime: "ဖတ်ချိန်",
    topics: "ဆက်စပ်ခေါင်းစဉ်များ",
    source: "ရင်းမြစ်",
    sourceValue: "ScoreMatrix သတင်းအဖွဲ့",
    related: "ဆက်ဖတ်ရန်",
    readMoreNews: "နောက်ဆုံးသတင်း",
    categories: { analysis: "သုံးသပ်ချက်", news: "သတင်း", feature: "အထူး", tips: "အကြံပြုချက်" },
  },
  km: {
    back: "ត្រឡប់ទៅព័ត៌មាន",
    minRead: "នាទីអាន",
    views: "ដង",
    more: "ចង់បានការយល់ដឹងបាល់ទាត់បន្ថែមទេ? មើលការទស្សន៍ទាយថ្មីៗនៅលើ ScoreMatrix។",
    predictions: "ទៅកាន់ការទស្សន៍ទាយ",
    keyPoints: "ចំណុចសំខាន់",
    articleDetails: "ព័ត៌មានលម្អិតអត្ថបទ",
    published: "ចេញផ្សាយ",
    updated: "បានធ្វើបច្ចុប្បន្នភាព",
    category: "ប្រភេទ",
    readingTime: "ពេលវេលាអាន",
    topics: "ប្រធានបទពាក់ព័ន្ធ",
    source: "ប្រភព",
    sourceValue: "ក្រុមព័ត៌មាន ScoreMatrix",
    related: "អានបន្ត",
    readMoreNews: "ព័ត៌មានថ្មីៗ",
    categories: { analysis: "វិភាគ", news: "ព័ត៌មាន", feature: "លក្ខណៈពិសេស", tips: "គន្លឹះ" },
  },
  zh: {
    back: "返回新闻",
    minRead: "分钟阅读",
    views: "次阅读",
    more: "想查看更多足球洞察？前往 ScoreMatrix 查看最新预测。",
    predictions: "前往预测",
    keyPoints: "重点摘要",
    articleDetails: "文章详情",
    published: "发布时间",
    updated: "更新时间",
    category: "分类",
    readingTime: "阅读时间",
    topics: "相关主题",
    source: "来源",
    sourceValue: "ScoreMatrix 编辑团队",
    related: "继续阅读",
    readMoreNews: "最新新闻",
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

function getParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function getKeyPoints(summary: string, content: string) {
  return [summary, ...getParagraphs(content)]
    .map((point) => point.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((point, index, list) => list.indexOf(point) === index)
    .slice(0, 4);
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
  const paragraphs = getParagraphs(content);
  const keyPoints = getKeyPoints(summary, content);

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Article */}
        <article className="w-full min-w-0">
          {/* Header */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={cat.variant} size="sm">
                <span className="flex items-center gap-1.5">
                  <Icon size={12} />
                  <span>{categoryLabel}</span>
                </span>
              </Badge>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/15 bg-cyan-300/[0.06] px-2.5 py-1 text-[11px] font-bold text-cyan-100">
                <ShieldCheck size={12} />
                {copy.sourceValue}
              </span>
            </div>

            <h1 className="font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {title}
            </h1>

            <p className="text-base font-semibold leading-7 text-gray-300">
              {summary}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 pb-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <User size={12} />
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {formatDate(article.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <FileText size={12} />
                {article.readTime} {copy.minRead}
              </span>
              {article.viewCount !== undefined && (
                <span className="flex items-center gap-1.5">
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
              sizes="(min-width: 1024px) 760px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
          </div>

          <section className="mb-6 rounded-xl border border-cyan-300/15 bg-[#0b111d] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-cyan-100">
              <Sparkles size={16} />
              <h2>{copy.keyPoints}</h2>
            </div>
            <ul className="space-y-2.5">
              {keyPoints.map((point) => (
                <li key={point} className="flex gap-2.5 text-sm font-semibold leading-6 text-gray-300">
                  <CheckCircle2 size={16} className="mt-1 shrink-0 text-lime-300" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Content */}
          <div className="prose prose-invert prose-sm max-w-none">
            {paragraphs.map((paragraph, i) => (
              <p key={i} className="mb-4 text-sm leading-7 text-gray-300 sm:text-[15px]">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-black text-white">
              <FileText size={16} className="text-cyan-300" />
              <h2>{copy.articleDetails}</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <DetailRow icon={CalendarDays} label={copy.published} value={formatDate(article.publishedAt)} />
              {article.updatedAt && (
                <DetailRow icon={Clock} label={copy.updated} value={formatDate(article.updatedAt)} />
              )}
              <DetailRow icon={Icon} label={copy.category} value={categoryLabel} />
              <DetailRow icon={FileText} label={copy.readingTime} value={`${article.readTime} ${copy.minRead}`} />
              <DetailRow icon={ShieldCheck} label={copy.source} value={copy.sourceValue} />
            </dl>
          </Card>

          <Card className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
              <Hash size={16} className="text-cyan-300" />
              <h2>{copy.topics}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-xs text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-wide text-cyan-300">
              {copy.related}
            </p>
            <div className="grid gap-2">
              <Link
                href={`/${locale}/news`}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-bold text-gray-200 transition-colors hover:border-cyan-300/30 hover:text-white"
              >
                {copy.readMoreNews}
              </Link>
              <Link
                href={`/${locale}/predict`}
                className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-sm font-bold text-cyan-100 transition-colors hover:border-cyan-200/50 hover:text-white"
              >
                {copy.predictions}
              </Link>
            </div>
          </Card>
        </aside>
      </div>

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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <dt className="mt-0.5 flex min-w-[92px] items-center gap-1.5 text-xs font-bold text-gray-500">
        <Icon size={13} />
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-xs font-semibold leading-5 text-gray-300">
        {value}
      </dd>
    </div>
  );
}
