import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CalendarDays, Table2 } from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ApiFootballError,
  type ApiFootballFixture,
  getApiFootballLeagueSchedule,
  getApiFootballLeagues,
  getApiFootballStandings,
} from "@/lib/api-football";
import { buildFixtureSeoSlug, extractFootballEntityId } from "@/lib/football-slugs";
import { buildFootballStatusLabels, getFixtureStatusLabel } from "@/lib/football-status";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { THAILAND_TIME_ZONE_ABBR, THAILAND_TIME_ZONE_LABEL, formatDate, formatTime } from "@/lib/utils";
import { MatchStatus } from "@/types/common";

type Props = {
  params: Promise<{ locale: string; leagueId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function FootballLeaguePage({ params, searchParams }: Props) {
  const { locale, leagueId } = await params;
  const t = await getTranslations({ locale });
  const statusLabels = buildFootballStatusLabels(t);
  const { season: seasonParam } = await searchParams;
  const league = extractFootballEntityId(leagueId);
  const season = parseSeason(seasonParam);

  if (!league) {
    return (
      <div className="mx-auto max-w-4xl pb-8">
        <Card className="border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <h1 className="text-lg font-bold text-white">
            {t("matchDetail.unavailableTitle")}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("matchDetail.noApiFixtureId")}
          </p>
        </Card>
      </div>
    );
  }

  const [leagueInfo, standings, schedule] = await Promise.all([
    loadOptional(() => getApiFootballLeagues({ id: league }), []),
    loadOptional(() => getApiFootballStandings(league, season), null),
    loadOptional(() => getApiFootballLeagueSchedule(league, season, 120), []),
  ]);
  const latestSchedule = [...schedule].sort(
    (a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime()
  );
  const info = leagueInfo[0];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <Card neon="cyan" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <ApiLeagueLogo
            name={info?.league.name ?? standings?.name ?? "League"}
            logo={info?.league.logo ?? standings?.logo}
            size="lg"
          />
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-white">
              {info?.league.name ?? standings?.name ?? `League ${league}`}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {info?.country.name ?? standings?.country ?? t("football.countryUnavailable")} - {t("football.season", { season })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="cyan" size="md">
            {t("dashboard.matchCount", { count: latestSchedule.length })}
          </Badge>
          <Badge variant="green" size="md">
            {t("football.teamCount", { count: standings?.standings[0]?.length ?? 0 })}
          </Badge>
          <Badge variant="cyan" size="md">
            {THAILAND_TIME_ZONE_LABEL}
          </Badge>
        </div>
      </Card>

      <section className="grid gap-5">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t("football.leagueSchedule")}</h2>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {t("dashboard.matchCount", { count: latestSchedule.length })}
            </span>
          </div>
          <div className="divide-y divide-gray-800/70">
            {latestSchedule.map((match) => (
              <div
                key={match.id}
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[190px_minmax(0,1fr)_140px]"
              >
                <Link
                  href={buildMatchDetailHref(match, locale)}
                  className="contents"
                >
                  <div className="flex items-center justify-between gap-3 md:justify-start">
                    <p className="text-xs font-medium text-gray-300">
                      {formatDate(match.kickoffTime, locale)}
                    </p>
                    <p className="font-mono text-xs text-cyan-300">
                      {formatTime(match.kickoffTime, locale)}{" "}
                      <span className="text-[10px] text-gray-600">
                        {THAILAND_TIME_ZONE_ABBR}
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-3">
                    <TeamName name={match.home.name} logo={match.home.logo} align="right" />
                    <span className="rounded-lg border border-gray-800 bg-black/25 px-2 py-2 text-center font-mono text-sm font-bold text-white">
                      {match.score.home !== null
                        ? `${match.score.home} - ${match.score.away}`
                        : t("common.vs")}
                    </span>
                    <TeamName name={match.away.name} logo={match.away.logo} />
                  </div>
                  <div className="flex justify-center md:justify-end">
                    <StatusBadge
                      status={match.status}
                      label={getFixtureStatusLabel(match, statusLabels)}
                    />
                  </div>
                </Link>
                {match.status === MatchStatus.UPCOMING && (
                  <div className="flex justify-center md:col-span-3">
                    <Link
                      href={buildPredictMatchHref(
                        locale,
                        buildFixtureSeoSlug(match),
                        match.home.apiTeamId ?? match.home.id,
                        match.away.apiTeamId ?? match.away.id
                      )}
                    >
                      <Button size="sm" variant="gold">
                        {t("prediction.predictScore")}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Table2 size={14} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t("football.standings")}</h2>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {t("football.teamCount", { count: standings?.standings[0]?.length ?? 0 })}
            </span>
          </div>
          <div className="overflow-x-auto">
            {(standings?.standings[0]?.length ?? 0) > 0 ? <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">{t("football.table.team")}</th>
                  <th className="px-3 py-2 text-center">{t("football.table.playedShort")}</th>
                  <th className="px-3 py-2 text-center">{t("football.table.goalDiffShort")}</th>
                  <th className="px-3 py-2 text-center">{t("football.table.pointsShort")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/70">
                {(standings?.standings[0] ?? []).map((row) => (
                  <tr key={row.team.id}>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {row.rank}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/${locale}/football/teams/${row.team.id}?league=${league}&season=${season}`}
                        className="flex min-w-0 items-center gap-2"
                      >
                        <ApiTeamLogo name={row.team.name} logo={row.team.logo} size="sm" />
                        <span className="truncate text-xs font-semibold text-white">
                          {row.team.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                      {row.all.played}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                      {row.goalsDiff}
                    </td>
                    <td className="px-3 py-2 text-center font-mono text-xs font-bold text-white">
                      {row.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table> : (
              <p className="p-6 text-center text-sm text-gray-500">
                {t("leagues.noStandings")}
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}

function buildMatchDetailHref(
  match: ApiFootballFixture,
  locale: string
) {
  return `/${locale}/matches/detail/${match.apiFixtureId ?? buildFixtureSeoSlug(match)}`;
}

async function loadOptional<T>(loader: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof ApiFootballError) return fallback;
    throw error;
  }
}

function parseSeason(value?: string) {
  const parsed = Number.parseInt(value ?? String(new Date().getFullYear()), 10);
  return Number.isNaN(parsed) ? new Date().getFullYear() : parsed;
}

function TeamName({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex min-w-0 items-center gap-2 ${align === "right" ? "justify-end text-right" : ""}`}>
      {align === "left" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
      <span className="truncate text-xs font-semibold text-white">{name}</span>
      {align === "right" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
    </div>
  );
}
