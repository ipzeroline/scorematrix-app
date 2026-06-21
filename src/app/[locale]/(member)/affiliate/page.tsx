import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AffiliateDashboard } from "@/components/affiliate/AffiliateDashboard";
import { LOCALE_CODES } from "@/i18n";
import { SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "affiliate" });
  const canonical = `${SITE_URL}/${locale}/affiliate`;

  return {
    title: `${t("title")} | ScoreMatrix`,
    description: t("description"),
    alternates: {
      canonical,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/affiliate`])
      ),
    },
  };
}

export default function AffiliatePage() {
  return <AffiliateDashboard />;
}
