import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import { MatchesApi } from "@/components/matches/MatchesApi";
import {
  ApiFootballError,
  getApiFootballFixtureList,
  type ApiFootballFixture,
  type ApiFootballFixtureCounts,
} from "@/lib/api-football";
import { sortFixtures } from "@/lib/football-page-data";
import { getThailandDateKey, THAILAND_TIME_ZONE } from "@/lib/utils";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ date?: string }>;
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

export default async function MatchesPage({ searchParams }: Props) {
  const { date } = await searchParams;
  const selectedDate = isDateKey(date) ? date : getThailandDateKey();
  const cookieStore = await cookies();
  const initialHasAuthSession =
    Boolean(cookieStore.get(AUTH_TOKEN_COOKIE_NAME)?.value) ||
    Boolean(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
  let fixtures: ApiFootballFixture[] = [];
  let counts = emptyCounts();
  let loadError = false;

  try {
    const result = await getApiFootballFixtureList({
      date: selectedDate,
      timezone: THAILAND_TIME_ZONE,
      limit: 500,
    });
    fixtures = sortFixtures(result.fixtures);
    counts = result.counts;
  } catch (error) {
    loadError = true;
    if (!(error instanceof ApiFootballError)) {
      console.error(error);
    }
  }

  return (
    <MatchesApi
      key={selectedDate}
      fixtures={fixtures}
      counts={counts}
      selectedDate={selectedDate}
      initialLoadError={loadError}
      initialHasAuthSession={initialHasAuthSession}
    />
  );
}

function isDateKey(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function emptyCounts(): ApiFootballFixtureCounts {
  return {
    total: 0,
    live: 0,
    upcoming: 0,
    finished: 0,
    postponed: 0,
    cancelled: 0,
  };
}
