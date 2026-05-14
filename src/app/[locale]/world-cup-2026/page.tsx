import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe2, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { WorldCupGroupsBoard } from "@/components/world-cup/WorldCupGroupsBoard";
import { LOCALE_CODES } from "@/i18n";
import { worldCupGroups } from "@/data/world-cup-2026";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "worldCup2026" });

  return {
    title: `${t("title")} | ScoreMatrix`,
    description: t("description"),
    alternates: {
      canonical: `/${locale}/world-cup-2026`,
      languages: Object.fromEntries(
        LOCALE_CODES.map((code) => [code, `/${code}/world-cup-2026`])
      ),
    },
    openGraph: {
      title: `${t("title")} | ScoreMatrix`,
      description: t("description"),
      type: "website",
      locale,
      url: `/${locale}/world-cup-2026`,
      siteName: "ScoreMatrix",
    },
  };
}

export default async function WorldCup2026Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "worldCup2026" });
  const copy = {
    title: t("title"),
    description: t("description"),
    eyebrow: t("eyebrow"),
    backHome: t("backHome"),
    allGroups: t("allGroups"),
    groupLabel: t("groupLabel"),
    groupSpotlights: Object.fromEntries(
      worldCupGroups.map((group) => [group.id, t(`spotlights.${group.id}`)])
    ),
    standings: t("standings"),
    team: t("team"),
    teamsCount: t("teamsCount", { count: 4 }),
    matches: t("matches"),
    match: t("match"),
    vs: t("vs"),
    flagAlt: t("flagAlt"),
    played: t("played"),
    wins: t("wins"),
    draws: t("draws"),
    losses: t("losses"),
    goalDifference: t("goalDifference"),
    points: t("points"),
    fifaRank: t("fifaRank"),
    nextFixtures: t("nextFixtures"),
    groupStageSchedule: t("groupStageSchedule"),
    matchday: t("matchday"),
    timeZone: t("timeZone"),
    winner: t("winner"),
    runnerUp: t("runnerUp"),
    third: t("third"),
    sourceNote: t("sourceNote"),
    statTeams: t("statTeams"),
    statGroups: t("statGroups"),
    statKickoff: t("statKickoff"),
  };

  return (
    <div className="flex flex-col gap-5 pb-8">
      <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#080b12] p-4 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(245,158,11,0.14),transparent_26%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,38px_38px,38px_38px]" />
        <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_180px] md:items-center">
          <div>
            <Link
              href={`/${locale}`}
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-cyan-300"
            >
              <ArrowLeft size={16} />
              {copy.backHome}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="gold" size="md">
                {copy.eyebrow}
              </Badge>
              <Badge variant="cyan" size="md">
                {copy.allGroups}
              </Badge>
            </div>
            <h1 className="mt-3 font-display text-3xl font-black leading-tight text-white md:text-5xl">
              {copy.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400 md:text-base">
              {copy.description}
            </p>
            <div className="mt-5 grid max-w-2xl grid-cols-3 gap-2">
              {[
                { icon: Trophy, label: copy.statTeams },
                { icon: Globe2, label: copy.statGroups },
                { icon: CalendarDays, label: copy.statKickoff },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-lg border border-gray-800 bg-black/25 p-3"
                  >
                    <Icon size={16} className="text-cyan-300" />
                    <p className="mt-2 text-xs font-bold text-white md:text-sm">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative mx-auto h-52 w-36 overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_0_38px_rgba(245,158,11,0.2)] md:h-64 md:w-44">
            <Image
              src="/brand/fifa-world-cup-2026.png"
              alt="FIFA World Cup 2026"
              fill
              priority
              sizes="(min-width: 768px) 176px, 144px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <WorldCupGroupsBoard groups={worldCupGroups} copy={copy} locale={locale} />
    </div>
  );
}
