import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Globe2, Trophy } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { WorldCupGroupsBoard } from "@/components/world-cup/WorldCupGroupsBoard";
import { LOCALE_CODES } from "@/i18n";
import { worldCupGroups, type WorldCupGroup, type WorldCupMatch, type WorldCupTeam } from "@/data/world-cup-2026";
import {
  ApiFootballError,
  getApiFootballLeagueSchedule,
  getApiFootballStandings,
  type ApiFootballFixture,
  type ApiFootballStanding,
} from "@/lib/api-football";

const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

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
  const { groups, source } = await getWorldCupGroups();
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
    sourceNote:
      source === "api"
        ? `${t("sourceNote")} Live API data refreshes on every request.`
        : t("sourceNote"),
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

      <WorldCupGroupsBoard groups={groups} copy={copy} locale={locale} />
    </div>
  );
}

async function getWorldCupGroups(): Promise<{ groups: WorldCupGroup[]; source: "api" | "local" }> {
  try {
    const [standingsLeague, schedule] = await Promise.all([
      getApiFootballStandings(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON),
      getApiFootballLeagueSchedule(WORLD_CUP_LEAGUE_ID, WORLD_CUP_SEASON, 120),
    ]);

    if (!standingsLeague?.standings?.length && schedule.length === 0) {
      return { groups: worldCupGroups, source: "local" };
    }

    const groups = buildGroupsFromApi(
      standingsLeague?.standings ?? [],
      schedule,
      worldCupGroups
    );

    return {
      groups: groups.length > 0 ? groups : worldCupGroups,
      source: groups.length > 0 ? "api" : "local",
    };
  } catch (error) {
    if (error instanceof ApiFootballError) {
      return { groups: worldCupGroups, source: "local" };
    }
    throw error;
  }
}

function buildGroupsFromApi(
  standings: ApiFootballStanding[][],
  fixtures: ApiFootballFixture[],
  fallbackGroups: WorldCupGroup[]
) {
  const standingGroups = standings
    .map((rows) => {
      const groupId = extractGroupId(rows[0]?.group);
      if (!groupId) return null;
      const fallback = fallbackGroups.find((group) => group.id === groupId);
      const teams = rows.map((row) => mapStandingTeam(row, fallback)).sort((a, b) => {
        if ((b.points ?? 0) !== (a.points ?? 0)) return (b.points ?? 0) - (a.points ?? 0);
        return (b.goalDifference ?? 0) - (a.goalDifference ?? 0);
      });

      return {
        id: groupId,
        name: `Group ${groupId}`,
        spotlight: fallback?.spotlight ?? `Group ${groupId}`,
        teams,
        matches: [] as WorldCupMatch[],
      };
    })
    .filter((group): group is WorldCupGroup => Boolean(group));

  const groups = standingGroups.length > 0 ? standingGroups : fallbackGroups.map((group) => ({ ...group, matches: [] }));

  for (const group of groups) {
    const teamNames = new Set(group.teams.map((team) => normalizeName(team.name)));
    const groupFixtures = fixtures.filter(
      (fixture) =>
        teamNames.has(normalizeName(fixture.home.name)) &&
        teamNames.has(normalizeName(fixture.away.name))
    );

    group.matches = groupFixtures.length > 0
      ? groupFixtures.map((fixture) => mapFixtureToWorldCupMatch(fixture, group.teams))
      : fallbackGroups.find((fallback) => fallback.id === group.id)?.matches ?? [];
  }

  return groups.sort((a, b) => a.id.localeCompare(b.id));
}

function mapStandingTeam(row: ApiFootballStanding, fallback?: WorldCupGroup): WorldCupTeam {
  const fallbackTeam = fallback?.teams.find(
    (team) => normalizeName(team.name) === normalizeName(row.team.name)
  );

  return {
    name: row.team.name,
    code: fallbackTeam?.code ?? teamCode(row.team.name),
    flagCode: fallbackTeam?.flagCode ?? "un",
    rank: fallbackTeam?.rank ?? row.rank,
    logo: row.team.logo,
    played: row.all.played,
    wins: row.all.win,
    draws: row.all.draw,
    losses: row.all.lose,
    goalDifference: row.goalsDiff,
    points: row.points,
  };
}

function mapFixtureToWorldCupMatch(
  fixture: ApiFootballFixture,
  teams: WorldCupTeam[]
): WorldCupMatch {
  return {
    matchday: matchdayFromRound(fixture.league.round),
    kickoffUtc: fixture.kickoffTime,
    homeCode: findTeamCode(teams, fixture.home.name),
    awayCode: findTeamCode(teams, fixture.away.name),
    venue: fixture.venue || fixture.league.round,
    status: fixture.status,
    homeScore: fixture.score.home,
    awayScore: fixture.score.away,
    apiFixtureId: fixture.apiFixtureId,
  };
}

function extractGroupId(group?: string | null) {
  const match = group?.match(/Group\s+([A-L])/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function matchdayFromRound(round: string): 1 | 2 | 3 {
  const match = round.match(/(\d+)/);
  const value = match ? Number.parseInt(match[1], 10) : 1;
  if (value >= 3) return 3;
  if (value === 2) return 2;
  return 1;
}

function findTeamCode(teams: WorldCupTeam[], name: string) {
  return teams.find((team) => normalizeName(team.name) === normalizeName(name))?.code ?? teamCode(name);
}

function teamCode(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}
