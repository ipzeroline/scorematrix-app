import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  Flag,
  Shield,
  Table2,
  Trophy,
  Users,
} from "lucide-react";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ApiFootballError,
  type ApiFootballFixture,
  type ApiFootballStanding,
  getApiFootballLeagueProfile,
  getApiFootballLeagueSchedule,
} from "@/lib/api-football";
import { buildFixtureSeoSlug, extractFootballEntityId } from "@/lib/football-slugs";
import { buildFootballStatusLabels, getFixtureStatusLabel } from "@/lib/football-status";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { hasAuthSession } from "@/lib/auth-session-server";
import {
  THAILAND_TIME_ZONE_ABBR,
  THAILAND_TIME_ZONE_LABEL,
  formatDate,
  formatTime,
} from "@/lib/utils";
import { MatchStatus } from "@/types/common";

type Props = {
  params: Promise<{ locale: string; leagueId: string }>;
  searchParams: Promise<{ season?: string }>;
};

const LEAGUE_SCHEDULE_PREVIEW_LIMIT = 20;

export default async function FootballLeaguePage({ params, searchParams }: Props) {
  const { locale, leagueId } = await params;
  const t = await getTranslations({ locale });
  const statusLabels = buildFootballStatusLabels(t);
  const isLoggedIn = await hasAuthSession();
  const { season: seasonParam } = await searchParams;
  const league = extractFootballEntityId(leagueId);

  if (!league) {
    return <Unavailable title={t("football.leagueUnavailable")} body={t("football.leagueUnavailableHint")} />;
  }

  const leagueProfile = await loadOptional(() => getApiFootballLeagueProfile(league), null);
  const fallbackSeason = leagueProfile?.league.season ?? leagueProfile?.league.currentSeason ?? new Date().getFullYear();
  const season = parseSeason(seasonParam, fallbackSeason);
  const schedule = await loadOptional(
    () => getApiFootballLeagueSchedule(league, season, LEAGUE_SCHEDULE_PREVIEW_LIMIT),
    []
  );
  const profile = leagueProfile;
  const standings = profile?.standings ?? [];
  const standingGroups = groupStandings(standings);
  const teams = profile?.teams.data ?? [];
  const latestSchedule = [...schedule].sort(
    (a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime()
  );

  if (!profile) {
    return <Unavailable title={t("football.leagueUnavailable")} body={t("football.leagueUnavailableHint")} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <HistoryBackButton label={t("common.back")} fallbackHref={`/${locale}/football/leagues`} />

      <Card neon="cyan" className="overflow-hidden p-0">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.15),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_30%),linear-gradient(135deg,#08111f_0%,#111827_55%,#090d16_100%)]" />
          <div className="relative flex flex-col gap-6 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <ApiLeagueLogo
                name={profile.league.name}
                logo={profile.league.logo}
                size="lg"
              />
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="cyan">{profile.league.type || t("football.unavailableValue")}</Badge>
                  <Badge variant="magenta">{t("football.season", { season })}</Badge>
                  <Badge variant="green">{THAILAND_TIME_ZONE_LABEL}</Badge>
                </div>
                <div>
                  <h1 className="truncate text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {profile.league.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    {profile.country.name || t("football.countryUnavailable")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <span>{profile.country.code || t("football.unavailableValue")}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{t("football.teamCount", { count: profile.teams.count })}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{t("dashboard.matchCount", { count: latestSchedule.length })}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <HeroStat
                label={t("football.teamCount", { count: profile.teams.count })}
                value={String(profile.teams.count)}
                icon={<Users size={16} className="text-cyan-300" />}
              />
              <HeroStat
                label={t("football.standings")}
                value={String(standings.length)}
                icon={<Table2 size={16} className="text-green-300" />}
              />
              <HeroStat
                label={t("football.currentSeason")}
                value={String(profile.league.season ?? season)}
                icon={<CalendarDays size={16} className="text-amber-300" />}
              />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Info icon={Trophy} label={t("football.leagueType")} value={profile.league.type || t("football.unavailableValue")} />
        <Info icon={Flag} label={t("football.country")} value={profile.country.name || t("football.countryUnavailable")} />
        <Info icon={Shield} label={t("football.countryCode")} value={profile.country.code || t("football.unavailableValue")} />
        <Info
          icon={CalendarDays}
          label={t("football.currentSeason")}
          value={String(profile.league.currentSeason ?? profile.league.season ?? season)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
                {t("football.leagueProfile")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t("football.leagueProfileHint")}</p>
            </div>
            <Badge variant="cyan">{profile.league.id}</Badge>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label={t("football.leagueName")} value={profile.league.name} />
            <Detail label={t("football.leagueType")} value={profile.league.type || t("football.unavailableValue")} />
            <Detail label={t("football.country")} value={profile.country.name || t("football.countryUnavailable")} />
            <Detail label={t("football.countryCode")} value={profile.country.code || t("football.unavailableValue")} />
            <Detail label={t("football.currentSeason")} value={String(profile.league.currentSeason ?? profile.league.season ?? season)} />
            <Detail label={t("football.teamCount", { count: profile.teams.count })} value={String(profile.teams.count)} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("football.featuredTeams")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t("football.featuredTeamsHint")}</p>
            </div>
            <Badge variant="magenta">{profile.teams.count}</Badge>
          </div>
          {teams.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {teams.slice(0, 8).map((team) => (
                <Link
                  key={team.id}
                  href={`/${locale}/football/teams/${team.id}?league=${profile.league.id}&season=${season}`}
                >
                  <Card hover className="flex items-center gap-3 p-3">
                    <ApiTeamLogo name={team.name} logo={team.logo} size="sm" accent="gray" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{team.name}</p>
                      <p className="truncate text-xs text-gray-500">
                        {team.code || team.country || t("football.unavailableValue")}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyPanel label={t("football.teamsUnavailable")} />
          )}
        </Card>
      </section>

      <section className="grid gap-5">
        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Table2 size={14} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t("football.standings")}</h2>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {t("football.teamCount", { count: standings.length })}
            </span>
          </div>
          <div className="overflow-x-auto">
            {standings.length > 0 ? (
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">{t("football.table.team")}</th>
                    <th className="px-3 py-2 text-center">{t("football.table.playedShort")}</th>
                    <th className="px-3 py-2 text-center">{t("football.wins")}</th>
                    <th className="px-3 py-2 text-center">{t("football.draws")}</th>
                    <th className="px-3 py-2 text-center">{t("football.losses")}</th>
                    <th className="px-3 py-2 text-center">{t("football.table.goalDiffShort")}</th>
                    <th className="px-3 py-2 text-center">{t("football.table.pointsShort")}</th>
                  </tr>
                </thead>
                {standingGroups.map((group) => (
                  <tbody key={group.key} className="divide-y divide-gray-800/70">
                    {standingGroups.length > 1 && (
                      <tr className="border-t border-gray-800 bg-white/[0.03]">
                        <td
                          colSpan={8}
                          className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-cyan-300"
                        >
                          {group.name}
                        </td>
                      </tr>
                    )}
                    {group.rows.map((row) => (
                      <tr key={`${group.key}-${row.rank}-${row.team.id || row.team.name}`}>
                        <td className="px-3 py-2 font-mono text-xs text-gray-500">{row.rank}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/${locale}/football/teams/${row.team.id}?league=${profile.league.id}&season=${season}`}
                            className="flex min-w-0 items-center gap-2"
                          >
                            <ApiTeamLogo name={row.team.name} logo={row.team.logo} size="sm" />
                            <span className="truncate text-xs font-semibold text-white">{row.team.name}</span>
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">{row.all.played}</td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-green-300">{row.all.win}</td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-amber-300">{row.all.draw}</td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-red-300">{row.all.lose}</td>
                        <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">{row.goalsDiff}</td>
                        <td className="px-3 py-2 text-center font-mono text-xs font-bold text-white">{row.points}</td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            ) : (
              <EmptyPanel label={t("leagues.noStandings")} compact />
            )}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="flex flex-col gap-2 border-b border-gray-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">{t("football.leagueSchedule")}</h2>
            </div>
            <span className="font-mono text-xs text-gray-500">
              {t("football.schedulePreviewCount", { count: latestSchedule.length })}
            </span>
          </div>
          <div className="divide-y divide-gray-800/70">
            {latestSchedule.length > 0 ? latestSchedule.map((match) => (
              <div
                key={match.id}
                className="grid gap-4 px-4 py-4 transition-colors hover:bg-white/[0.03] md:grid-cols-[190px_minmax(0,1fr)_140px]"
              >
                <Link href={buildMatchDetailHref(match, locale)} className="contents">
                  <div className="flex items-center justify-between gap-3 md:justify-start">
                    <p className="text-xs font-medium text-gray-300">{formatDate(match.kickoffTime, locale)}</p>
                    <p className="font-mono text-xs text-cyan-300">
                      {formatTime(match.kickoffTime, locale)}{" "}
                      <span className="text-[10px] text-gray-600">{THAILAND_TIME_ZONE_ABBR}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-3">
                    <TeamName name={match.home.name} logo={match.home.logo} align="right" />
                    <span className="rounded-lg border border-gray-800 bg-black/25 px-2 py-2 text-center font-mono text-sm font-bold text-white">
                      {match.score.home !== null ? `${match.score.home} - ${match.score.away}` : t("common.vs")}
                    </span>
                    <TeamName name={match.away.name} logo={match.away.logo} />
                  </div>
                  <div className="flex justify-center md:justify-end">
                    <StatusBadge status={match.status} label={getFixtureStatusLabel(match, statusLabels)} />
                  </div>
                </Link>
                {match.status === MatchStatus.UPCOMING && isLoggedIn && (
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
            )) : <EmptyPanel label={t("football.scheduleUnavailable")} compact />}
          </div>
        </Card>
      </section>
    </div>
  );
}

function buildMatchDetailHref(match: ApiFootballFixture, locale: string) {
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

type StandingGroup = {
  key: string;
  name: string;
  rows: ApiFootballStanding[];
};

function groupStandings(standings: ApiFootballStanding[]): StandingGroup[] {
  const groups: StandingGroup[] = [];
  const index = new Map<string, StandingGroup>();

  for (const row of standings) {
    const name = row.group.trim();
    const key = name || "__default__";
    let group = index.get(key);
    if (!group) {
      group = { key, name, rows: [] };
      index.set(key, group);
      groups.push(group);
    }
    group.rows.push(row);
  }

  return groups;
}

function parseSeason(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <Icon size={18} className="text-cyan-400" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      </div>
    </Card>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
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

function EmptyPanel({ label, compact = false }: { label: string; compact?: boolean }) {
  return (
    <div className={compact ? "p-6 text-center text-sm text-gray-500" : "rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-gray-400"}>
      {label}
    </div>
  );
}

function Unavailable({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-4xl pb-8">
      <Card className="p-6 text-center">
        <h1 className="text-lg font-bold text-white">{title}</h1>
        <p className="mt-2 text-sm text-gray-500">{body}</p>
      </Card>
    </div>
  );
}
