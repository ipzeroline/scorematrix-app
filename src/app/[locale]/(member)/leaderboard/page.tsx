import type { Metadata } from "next";
import { getLeaderboardPageCopy } from "@/data/leaderboard-page-content";
import { SITE_NAME } from "@/lib/site";
import LeaderboardClient from "./LeaderboardClient";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const copy = getLeaderboardPageCopy(locale);

  return {
    title: copy.title,
    description: copy.subtitle,
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      title: copy.title,
      description: copy.subtitle,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
