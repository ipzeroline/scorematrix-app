import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";
import { LOCALE_CODES } from "@/i18n";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "affiliate" });

  return {
    title: `${t("title")} | ScoreMatrix`,
    description: t("description"),
    alternates: {
      canonical: `/${locale}/affiliate`,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, `/${code}/affiliate`])
      ),
    },
  };
}

export default function AffiliatePage() {
  return <AffiliateDashboard />;
}
