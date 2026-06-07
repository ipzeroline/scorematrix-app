import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { MatchesApi } from "@/components/matches/MatchesApi";
import { loadUpcomingFixtures, sortFixtures } from "@/lib/football-page-data";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

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

export default async function MatchesPage() {
  const cookieStore = await cookies();
  const initialHasAuthSession =
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value) ||
    Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
  const fixtures = sortFixtures(await loadUpcomingFixtures());

  return <MatchesApi fixtures={fixtures} initialHasAuthSession={initialHasAuthSession} />;
}
