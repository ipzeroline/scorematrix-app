import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MatchesMockup } from "@/components/matches/MatchesMockup";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.matches" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: `/${locale}/matches`,
      languages: {
        th: "/th/matches",
        en: "/en/matches",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
      url: `/${locale}/matches`,
      siteName: "ScoreMatrix",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default function MatchesPage() {
  return <MatchesMockup />;
}
