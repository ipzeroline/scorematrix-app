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
  getApiFootballLeagueSchedule,
  getApiFootballLeagues,
  getApiFootballStandings,
} from "@/lib/api-football";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import { MatchStatus } from "@/types/common";

type Props = {
  params: Promise<{ locale: string; leagueId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function FootballLeaguePage({ params, searchParams }: Props) {
  const { locale, leagueId } = await params;
  const t = await getTranslations({ locale });
  const { season: seasonParam } = await searchParams;
  const league = Number.parseInt(leagueId, 10);
  const season = Number.parseInt(seasonParam ?? String(new Date().getFullYear()), 10);
  const [leagueInfo, standings, schedule] = await Promise.all([
    getApiFootballLeagues({ id: league }),
    getApiFootballStandings(league, season),
    getApiFootballLeagueSchedule(league, season, 120),
  ]);
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
            {t("dashboard.matchCount", { count: schedule.length })}
          </Badge>
          <Badge variant="green" size="md">
            {t("football.teamCount", { count: standings?.standings[0]?.length ?? 0 })}
          </Badge>
        </div>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
            <CalendarDays size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">{t("football.leagueSchedule")}</h2>
          </div>
          <div className="divide-y divide-gray-800/70">
            {schedule.map((match) => (
              <div
                key={match.id}
                className="grid gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] md:grid-cols-[92px_minmax(0,1fr)_120px_120px]"
              >
                <Link
                  href={`/${locale}/livescore/${buildFixtureSeoSlug(match)}`}
                  className="contents"
                >
                  <span className="font-mono text-xs text-gray-500">
                    {new Date(match.kickoffTime).toLocaleDateString()}
                  </span>
                  <div className="grid grid-cols-[1fr_76px_1fr] items-center gap-2">
                    <TeamName name={match.home.name} logo={match.home.logo} align="right" />
                    <span className="text-center font-mono text-sm font-bold text-white">
                      {match.score.home !== null
                        ? `${match.score.home} - ${match.score.away}`
                        : t("common.vs")}
                    </span>
                    <TeamName name={match.away.name} logo={match.away.logo} />
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge status={match.status} />
                  </div>
                </Link>
                <div className="flex justify-start md:justify-end">
                  {match.status === MatchStatus.UPCOMING ? (
                    <Link href={`/${locale}/predict/${buildFixtureSeoSlug(match)}`}>
                      <Button size="sm" variant="gold">
                        {t("prediction.predictScore")}
                      </Button>
                    </Link>
                  ) : (
                    <span className="inline-flex min-w-20 justify-center rounded-lg border border-gray-800 bg-black/20 px-3 py-1.5 text-xs text-gray-600">
                      -
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
            <Table2 size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">{t("football.standings")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
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
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
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
