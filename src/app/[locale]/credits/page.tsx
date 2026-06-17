import type { Metadata } from "next";
import { LOCALE_CODES } from "@/i18n";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import CreditsClient from "./CreditsClient";

type Props = {
  params: Promise<{ locale: string }>;
};

const metadataCopy: Record<string, { title: string; description: string }> = {
  th: {
    title: "แพ็กเกจเครดิต ScoreMatrix",
    description:
      "ซื้อเครดิตสำหรับ AI Insight สถิติขั้นสูง บูสต์การทายผล และฟีเจอร์สมาชิก ScoreMatrix",
  },
  en: {
    title: "ScoreMatrix Credit Packages",
    description:
      "Buy credits for AI insights, advanced statistics, prediction boosts, and ScoreMatrix member features.",
  },
  lo: {
    title: "ແພັກເກດເຄຣດິດ ScoreMatrix",
    description:
      "ຊື້ເຄຣດິດສໍາລັບ AI Insight, ສະຖິຕິຂັ້ນສູງ ແລະຟີເຈີສະມາຊິກ ScoreMatrix.",
  },
  my: {
    title: "ScoreMatrix Credit Packages",
    description:
      "AI insights၊ အဆင့်မြင့်စာရင်းအင်းများ၊ prediction boosts နှင့် member features အတွက် credits ဝယ်ယူပါ။",
  },
  km: {
    title: "កញ្ចប់ក្រេឌីត ScoreMatrix",
    description:
      "ទិញក្រេឌីតសម្រាប់ AI Insight ស្ថិតិកម្រិតខ្ពស់ prediction boosts និងមុខងារសមាជិក ScoreMatrix។",
  },
  zh: {
    title: "ScoreMatrix 积分套餐",
    description:
      "购买积分用于 AI 洞察、高级数据、预测加成和 ScoreMatrix 会员功能。",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = metadataCopy[locale] ?? metadataCopy.en;
  const pathname = `/${locale}/credits`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/credits`])
  );

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/credits`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [
        {
          url: "/brand/scorematrix-logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} credits`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: ["/brand/scorematrix-logo.png"],
    },
  };
}

export default function CreditsPage() {
  return <CreditsClient />;
}
