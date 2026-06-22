import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe2, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { WorldCupGroupsBoard } from "@/components/world-cup/WorldCupGroupsBoard";
import { LOCALE_CODES } from "@/i18n";
import { getWorldCup2026SeoContent } from "@/data/world-cup-2026-seo-content";
import {
  worldCupGroups,
  type WorldCupGroup,
  type WorldCupMatch,
  type WorldCupTeam,
} from "@/data/world-cup-2026";
import {
  ApiFootballError,
  getApiFootballLeagueDetail,
  type ApiLeagueDetailStanding,
  type ApiLeagueDetailFixture,
} from "@/lib/api-football";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;
const WORLD_CUP_OFFICIAL_URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026";
const WORLD_CUP_SCHEDULE_URL =
  "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-groups-teams-stadiums";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const seo = getWorldCup2026SeoContent(locale);
  const canonical = `${SITE_URL}/${locale}/world-cup-2026`;
  const image = `${SITE_URL}/brand/fifa-world-cup-2026.png`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/world-cup-2026`])
  );

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/world-cup-2026`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      type: "website",
      locale,
      url: canonical,
      siteName: SITE_NAME,
      images: [
        {
          url: image,
          width: 1024,
          height: 1536,
          alt: "FIFA World Cup 2026 groups and fixtures on ScoreMatrix",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle,
      description: seo.ogDescription,
      images: [image],
    },
    category: "sports",
    other: {
      "article:section": "Football",
      "sports:event": "FIFA World Cup 2026",
      "sports:season": "2026",
    },
  };
}

export default async function WorldCup2026Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "worldCup2026" });
  const groups = await getWorldCupGroups();
  const seo = getWorldCup2026SeoContent(locale);
  const structuredData = buildWorldCupStructuredData(locale, seo, groups);
  const copy = {
    title: t("title"),
    description: t("description"),
    eyebrow: t("eyebrow"),
    backHome: t("backHome"),
    allGroups: t("allGroups"),
    groupLabel: t("groupLabel"),
    groupSpotlights: Object.fromEntries(
      groups.map((group) => [group.id, t(`spotlights.${group.id}`)])
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(245,158,11,0.14),transparent_26%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[100%_100%,100%_100%,38px_38px,38px_38px]" />
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
                { id: "teams", icon: Trophy, label: copy.statTeams },
                { id: "groups", icon: Globe2, label: copy.statGroups },
                { id: "kickoff", icon: CalendarDays, label: copy.statKickoff },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
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

      <WorldCupGroupsBoard groups={groups} copy={copy} locale={locale} />

      <section className="rounded-xl border border-cyan-300/15 bg-[#080d16] p-4 md:p-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-cyan-300">
              FIFA World Cup 2026
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-white md:text-3xl">
              {seo.contentTitle}
            </h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-7 text-gray-400">
              {seo.contentIntro}
            </p>

            <h3 className="mt-5 text-sm font-black uppercase tracking-wide text-white">
              {seo.factsTitle}
            </h3>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {seo.facts.map((fact) => (
                <div
                  key={fact}
                  className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold leading-6 text-gray-300"
                >
                  {fact}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <h3 className="text-base font-black text-white">{seo.faqTitle}</h3>
            <div className="mt-3 space-y-3">
              {seo.faqs.map((faq) => (
                <article key={faq.question} className="border-t border-white/10 pt-3 first:border-t-0 first:pt-0">
                  <h4 className="text-sm font-black leading-6 text-cyan-100">
                    {faq.question}
                  </h4>
                  <p className="mt-1 text-sm font-semibold leading-6 text-gray-400">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </div>
  );
}

function buildWorldCupStructuredData(
  locale: string,
  seo: ReturnType<typeof getWorldCup2026SeoContent>,
  groups: WorldCupGroup[]
) {
  const url = `${SITE_URL}/${locale}/world-cup-2026`;
  const image = `${SITE_URL}/brand/fifa-world-cup-2026.png`;
  const groupItems = groups.map((group, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: group.name,
    item: {
      "@type": "Thing",
      name: group.name,
      description: group.teams.map((team) => team.name).join(", "),
    },
  }));

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: seo.metaTitle,
      headline: seo.contentTitle,
      description: seo.metaDescription,
      inLanguage: locale,
      image,
      dateModified: "2026-06-22",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: [
        {
          "@type": "SportsEvent",
          "@id": `${url}#fifa-world-cup-2026`,
          name: "FIFA World Cup 2026",
          alternateName: ["FIFA World Cup 26", "2026 FIFA World Cup"],
          sport: "Soccer",
          startDate: "2026-06-11",
          endDate: "2026-07-19",
          eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
          eventStatus: "https://schema.org/EventScheduled",
          image,
          url: WORLD_CUP_OFFICIAL_URL,
          sameAs: [WORLD_CUP_OFFICIAL_URL, WORLD_CUP_SCHEDULE_URL],
          organizer: {
            "@type": "Organization",
            name: "FIFA",
            url: "https://www.fifa.com",
          },
          location: [
            { "@type": "Country", name: "Canada" },
            { "@type": "Country", name: "Mexico" },
            { "@type": "Country", name: "United States" },
          ],
        },
        "World Cup 2026 groups",
        "World Cup 2026 fixtures",
        "World Cup 2026 standings",
        "football predictions",
      ],
      mainEntity: {
        "@type": "ItemList",
        "@id": `${url}#groups`,
        name: "FIFA World Cup 2026 groups",
        numberOfItems: groups.length,
        itemListElement: groupItems,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: seo.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "FIFA World Cup 2026",
          item: url,
        },
      ],
    },
  ];
}

export async function getWorldCupGroups(): Promise<WorldCupGroup[]> {
  try {
    const { standings, fixtures } = await getApiFootballLeagueDetail(
      WORLD_CUP_LEAGUE_ID,
      WORLD_CUP_SEASON
    );

    if (standings.length === 0) return worldCupGroups;

    return buildGroupsFromLeagueDetail(standings, fixtures);
  } catch (error) {
    if (!(error instanceof ApiFootballError)) throw error;
    console.error("World Cup data error:", error.message);
    return worldCupGroups;
  }
}

function buildGroupsFromLeagueDetail(
  standings: ApiLeagueDetailStanding[],
  fixtures: ApiLeagueDetailFixture[]
): WorldCupGroup[] {
  // Group standings by group id (e.g. "Group A" → "A")
  const groupMap = new Map<string, ApiLeagueDetailStanding[]>();
  for (const row of standings) {
    const id = extractGroupId(row.group);
    if (!id) continue;
    const bucket = groupMap.get(id) ?? [];
    bucket.push(row);
    groupMap.set(id, bucket);
  }

  const groups: WorldCupGroup[] = [];

  for (const [id, rows] of groupMap) {
    const seenTeamNames = new Set<string>();
    const uniqueRows = rows.filter((row) => {
      const name = normalizeName(row.team.name);
      if (!name || seenTeamNames.has(name)) return false;

      seenTeamNames.add(name);
      return true;
    });
    const teamCodes = createUniqueTeamCodes(uniqueRows);
    const teams: WorldCupTeam[] = uniqueRows
      .map((row) => ({
        providerId: row.team.id,
        name: row.team.name,
        code: teamCodes.get(normalizeName(row.team.name)) ?? teamCode(row.team.name),
        flagCode: "un",
        rank: row.rank,
        logo: row.team.logo,
        played: row.all.played,
        wins: row.all.win,
        draws: row.all.draw,
        losses: row.all.lose,
        goalDifference: row.goalsDiff,
        points: row.points,
      }))
      .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));

    const teamNameSet = new Set(teams.map((t) => normalizeName(t.name)));
    const seenFixtures = new Set<string>();
    const groupFixtures = fixtures.filter((fixture) => {
      const homeName = normalizeName(fixture.home.name);
      const awayName = normalizeName(fixture.away.name);
      if (
        homeName === awayName ||
        !teamNameSet.has(homeName) ||
        !teamNameSet.has(awayName)
      ) {
        return false;
      }

      const fixtureKey =
        fixture.apiFixtureId != null
          ? `id:${fixture.apiFixtureId}`
          : `${fixture.kickoffTime}:${homeName}:${awayName}`;
      if (seenFixtures.has(fixtureKey)) return false;

      seenFixtures.add(fixtureKey);
      return true;
    });

    const matches: WorldCupMatch[] = groupFixtures
      .slice()
      .sort((a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime())
      .map((f, index) => ({
        matchday: assignMatchday(index) as 1 | 2 | 3,
        kickoffUtc: f.kickoffTime,
        homeCode: findTeamCode(teams, f.home.name),
        awayCode: findTeamCode(teams, f.away.name),
        venue: f.venue || f.round || "",
        status: f.status,
        homeScore: f.score.home,
        awayScore: f.score.away,
        apiFixtureId: f.apiFixtureId,
      }));

    groups.push({
      id,
      name: `Group ${id}`,
      spotlight: `Group ${id}`,
      teams,
      matches,
    });
  }

  return groups.sort((a, b) => a.id.localeCompare(b.id));
}

function assignMatchday(index: number): 1 | 2 | 3 {
  if (index < 2) return 1;
  if (index < 4) return 2;
  return 3;
}

function extractGroupId(group: string) {
  const match = group.match(/Group\s+([A-L])/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function findTeamCode(teams: WorldCupTeam[], name: string) {
  return (
    teams.find((t) => normalizeName(t.name) === normalizeName(name))?.code ??
    teamCode(name)
  );
}

function createUniqueTeamCodes(rows: ApiLeagueDetailStanding[]) {
  const codes = new Map<string, string>();
  const usedCodes = new Set<string>();

  for (const row of rows) {
    const normalizedName = normalizeName(row.team.name);
    const baseCode = teamCode(row.team.name);
    let code = baseCode;
    let suffix = 2;

    while (usedCodes.has(code)) {
      const suffixText = String(suffix);
      code = `${baseCode.slice(0, Math.max(1, 3 - suffixText.length))}${suffixText}`;
      suffix += 1;
    }

    usedCodes.add(code);
    codes.set(normalizedName, code);
  }

  return codes;
}

function teamCode(name: string) {
  return normalizeName(name).slice(0, 3).toUpperCase() || "TBD";
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
