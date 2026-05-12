import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { HeroBanner } from "@/components/home/HeroBanner";
import { LiveMatchHighlights } from "@/components/home/LiveMatchHighlights";
import { TodayMatches } from "@/components/home/TodayMatches";
import { AIMatchOfTheDay } from "@/components/home/AIMatchOfTheDay";
import { LeaderboardPreview } from "@/components/home/LeaderboardPreview";
import { MissionsPreview } from "@/components/home/MissionsPreview";
import { RewardsPreview } from "@/components/home/RewardsPreview";
import { NewsSection } from "@/components/home/NewsSection";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        th: "/th",
        en: "/en",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
      url: `/${locale}`,
      siteName: "ScoreMatrix",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Hero Banner */}
      <section>
        <HeroBanner />
      </section>

      {/* Live Match Highlights */}
      <section>
        <LiveMatchHighlights />
      </section>

      {/* Today's Matches */}
      <section>
        <TodayMatches />
      </section>

      {/* AI Match of the Day */}
      <section>
        <h2
          className="text-xl font-bold font-display text-white mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("aiMatchOfTheDay")}
        </h2>
        <AIMatchOfTheDay />
      </section>

      {/* Bottom 3-column grid: Leaderboard, Missions, Rewards */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LeaderboardPreview />
          <MissionsPreview />
          <RewardsPreview />
        </div>
      </section>

      {/* News Section */}
      <section>
        <NewsSection />
      </section>

      <section className="rounded-xl border border-gray-800 bg-[#0a0a0f] p-5 md:p-6">
        <div className="max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400">
            {t("seoContent.eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">
            {t("seoContent.title")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-400">
            {t("seoContent.description")}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {["predictions", "liveScores", "rewards"].map((key) => (
            <div key={key} className="border-l border-cyan-500/30 pl-4">
              <h3 className="text-sm font-semibold text-white">
                {t(`seoContent.cards.${key}.title`)}
              </h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {t(`seoContent.cards.${key}.text`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
