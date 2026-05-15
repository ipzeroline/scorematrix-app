import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  History,
  ListChecks,
  ListPlus,
  Shirt,
  ShieldCheck,
  Table2,
  TrendingUp,
  Users,
} from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ApiFootballError,
  type ApiFootballFixture,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  type ApiFootballTeamStatistics,
  getApiFootballFixtureDetails,
  getApiFootballH2H,
} from "@/lib/api-football";
import { buildFixtureSeoSlug, extractApiFixtureId } from "@/lib/football-slugs";
import { MatchStatus } from "@/types/common";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

export default async function MatchDetailPage({ params }: Props) {
  const { locale, matchId } = await params;
  const t = await getTranslations({ locale });
  const apiFixtureId = parseApiFixtureId(matchId);

  if (!apiFixtureId) {
    return (
      <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <Card className="p-6 text-center">
          <h1 className="text-lg font-bold text-white">{t("matchDetail.unavailableTitle")}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {t("matchDetail.noApiFixtureId")}
          </p>
        </Card>
      </MatchDetailShell>
    );
  }

  try {
    const details = await getApiFootballFixtureDetails(apiFixtureId);
    const { fixture, events, lineups, statistics, playerStats } = details;
    const h2h =
      fixture.home.apiTeamId && fixture.away.apiTeamId
        ? await getApiFootballH2H(fixture.home.apiTeamId, fixture.away.apiTeamId)
        : [];
    const season = fixture.league.season ?? new Date().getFullYear();

    return (
      <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <Card neon="cyan" className="overflow-hidden p-3 text-center sm:p-6">
          <Link
            href={`/${locale}/football/leagues/${fixture.league.apiLeagueId ?? fixture.league.id}?season=${season}`}
            className="mx-auto mb-4 inline-flex max-w-full items-center gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-left transition-colors hover:border-cyan-400/40 sm:px-4"
          >
            <ApiLeagueLogo
              name={fixture.league.name}
              logo={fixture.league.logo}
              size="md"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold text-white">
                {fixture.league.name}
              </span>
              <span className="block truncate text-[10px] text-gray-500">
                {fixture.league.round}
              </span>
            </span>
          </Link>
          <div className="grid grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_160px_minmax(0,1fr)] sm:gap-3">
            <TeamHeader
              name={fixture.home.name}
              logo={fixture.home.logo}
              href={
                fixture.home.apiTeamId
                  ? `/${locale}/football/teams/${fixture.home.apiTeamId}?league=${fixture.league.apiLeagueId ?? ""}&season=${season}`
                  : undefined
              }
              accent="cyan"
              align="right"
            />
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <StatusBadge status={fixture.status} />
              </div>
              <div className="font-mono text-2xl font-bold text-white sm:text-4xl">
                {fixture.score.home !== null
                  ? `${fixture.score.home} - ${fixture.score.away}`
                  : t("common.vs")}
              </div>
              <p className="mt-2 break-words font-mono text-[10px] text-gray-500 sm:text-xs">
                {formatFixtureTime(fixture.kickoffTime)}
              </p>
            </div>
            <TeamHeader
              name={fixture.away.name}
              logo={fixture.away.logo}
              href={
                fixture.away.apiTeamId
                  ? `/${locale}/football/teams/${fixture.away.apiTeamId}?league=${fixture.league.apiLeagueId ?? ""}&season=${season}`
                  : undefined
              }
              accent="magenta"
            />
          </div>
          <p className="mt-4 text-xs text-gray-500">
            {fixture.venue || t("matchDetail.venueUnavailable")}
          </p>
          {fixture.status === MatchStatus.UPCOMING && (
            <div className="mt-4 flex justify-center">
              <Link href={`/${locale}/predict/${buildFixtureSeoSlug(fixture)}`} className="w-full sm:w-auto">
                <Button variant="gold" size="md" className="w-full sm:w-auto">
                  {t("prediction.predictScore")}
                </Button>
              </Link>
            </div>
          )}
        </Card>

        <section className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          <InfoTile icon={ClipboardList} label={t("matchDetail.events")} value={events.length} />
          <InfoTile icon={BarChart3} label={t("matchDetail.statsGroups")} value={statistics.length} />
          <InfoTile icon={Shirt} label={t("matchDetail.lineups")} value={lineups.length} />
          <InfoTile icon={Users} label={t("matchDetail.playerStats")} value={countPlayers(playerStats)} />
        </section>

        <StatsAnalysisPanel
          statistics={statistics}
          labels={{
            title: t("matchDetail.analysisGraph"),
            subtitle: t("matchDetail.analysisGraphHint"),
            empty: t("matchDetail.noTeamStatistics"),
            balanced: t("matchDetail.balancedStat"),
          }}
        />

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <EventsPanel events={events} title={t("matchDetail.matchEvents")} emptyLabel={t("matchDetail.noEventData")} />
          <TeamStatsPanel statistics={statistics} title={t("matchDetail.teamStatistics")} emptyLabel={t("matchDetail.noTeamStatistics")} />
        </section>

        <H2HPanel h2h={h2h} locale={locale} title={t("matchDetail.h2h")} emptyLabel={t("matchDetail.noH2hData")} vsLabel={t("common.vs")} />
        <LineupsPanel lineups={lineups} locale={locale} season={season} labels={{
          empty: t("matchDetail.noLineupData"),
          coach: t("matchDetail.coach"),
          unavailable: t("matchDetail.unavailable"),
          startingXI: t("matchDetail.startingXI"),
          substitutes: t("matchDetail.substitutes"),
          formationPitch: t("matchDetail.formationPitch"),
          noGridData: t("matchDetail.noGridData"),
        }} />
        <PlayerStatsPanel playerStats={playerStats} locale={locale} season={season} labels={{
          empty: t("matchDetail.noPlayerStatistics"),
          titleSuffix: t("matchDetail.playerStatsTitleSuffix"),
          player: t("football.table.player"),
          minutes: t("football.table.minutesShort"),
          rating: t("football.table.ratingShort"),
          goalsAssists: t("football.table.goalsAssistsShort"),
          shots: t("matchDetail.shots"),
          pass: t("matchDetail.passes"),
          cards: t("football.table.cards"),
          captain: t("matchDetail.captain"),
        }} />
      </MatchDetailShell>
    );
  } catch (error) {
    const message =
      error instanceof ApiFootballError
        ? error.message
        : t("matchDetail.loadError");

    return (
      <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <Card className="border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <h1 className="text-lg font-bold text-white">{t("matchDetail.unavailableTitle")}</h1>
          <p className="mt-2 text-sm text-amber-300">{message}</p>
        </Card>
      </MatchDetailShell>
    );
  }
}

function MatchDetailShell({
  locale,
  backLabel,
  children,
}: {
  locale: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 overflow-hidden px-3 pb-8 sm:px-0">
      <Link
        href={`/${locale}/matches`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      {children}
    </div>
  );
}

function TeamHeader({
  name,
  logo,
  href,
  accent,
  align = "left",
}: {
  name: string;
  logo: string | null;
  href?: string;
  accent: "cyan" | "magenta";
  align?: "left" | "right";
}) {
  const content = (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1.5 sm:gap-2",
        align === "right" && "sm:items-end",
        align === "left" && "sm:items-start"
      )}
    >
      <ApiTeamLogo name={name} logo={logo} size="lg" accent={accent} />
      <h1 className="max-w-full truncate text-xs font-bold text-white sm:text-base">
        {name}
      </h1>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="min-w-0 transition-opacity hover:opacity-80">
      {content}
    </Link>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex min-w-0 items-center gap-2 p-3 sm:gap-3 sm:p-4">
      <Icon size={18} className="shrink-0 text-cyan-400" />
      <div className="min-w-0">
        <p className="font-mono text-lg font-bold text-white sm:text-xl">{value}</p>
        <p className="truncate text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      </div>
    </Card>
  );
}

function EventsPanel({
  events,
  title,
  emptyLabel,
}: {
  events: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["events"];
  title: string;
  emptyLabel: string;
}) {
  return (
    <Card className="p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <ClipboardList size={16} className="shrink-0 text-amber-300" aria-hidden="true" />
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      {events.length === 0 ? (
        <EmptyDetail label={emptyLabel} />
      ) : (
        <div className="space-y-2">
          {events.map((event, index) => {
            const style = eventStyle(event.type, event.detail);

            return (
              <div
                key={`${event.time.elapsed}-${event.type}-${index}`}
                className={`grid grid-cols-[40px_24px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2 py-2 sm:grid-cols-[48px_28px_minmax(0,1fr)_128px] sm:gap-3 sm:px-3 ${style.rowClass}`}
              >
                <span className="font-mono text-xs text-cyan-300">
                  {event.time.elapsed}
                  {event.time.extra ? `+${event.time.extra}` : ""}'
                </span>
                <span
                  className={`flex h-6 w-5 items-center justify-center rounded-sm border text-[11px] font-bold ${style.iconClass}`}
                  aria-label={style.label}
                  title={style.label}
                >
                  {style.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {event.player.name ?? event.team.name}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">
                    {event.detail}
                    {event.assist.name ? ` by ${event.assist.name}` : ""}
                  </p>
                </div>
                <span
                  className={`col-start-3 justify-self-start rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide sm:col-auto sm:justify-self-end ${style.badgeClass}`}
                >
                  {style.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function eventStyle(type: string, detail: string) {
  const normalized = `${type} ${detail}`.toLowerCase();

  if (normalized.includes("red card")) {
    return {
      label: detail || type,
      icon: "R",
      rowClass: "border-red-500/30 bg-red-500/10",
      iconClass: "border-red-300/70 bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]",
      badgeClass: "border-red-500/40 bg-red-500/15 text-red-200",
    };
  }

  if (normalized.includes("yellow card")) {
    return {
      label: detail || type,
      icon: "Y",
      rowClass: "border-amber-500/30 bg-amber-500/10",
      iconClass: "border-amber-200/80 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.35)]",
      badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    };
  }

  if (type === "Goal") {
    return {
      label: type,
      icon: "G",
      rowClass: "border-green-500/25 bg-green-500/10",
      iconClass: "border-green-400/50 bg-green-500/20 text-green-200",
      badgeClass: "border-green-500/40 bg-green-500/15 text-green-200",
    };
  }

  return {
    label: type,
    icon: "•",
    rowClass: "border-gray-800 bg-[#0a0a0f]",
    iconClass: "border-gray-700 bg-gray-800 text-gray-300",
    badgeClass: "border-gray-700 bg-gray-800/60 text-gray-300",
  };
}

function TeamStatsPanel({
  statistics,
  title,
  emptyLabel,
}: {
  statistics: ApiFootballTeamStatistics[];
  title: string;
  emptyLabel: string;
}) {
  const homeStats = statistics[0];
  const awayStats = statistics[1];

  return (
    <Card className="p-4">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Table2 size={16} className="shrink-0 text-magenta-300" aria-hidden="true" />
        <span className="min-w-0 truncate">{title}</span>
      </h2>
      {!homeStats || !awayStats ? (
        <EmptyDetail label={emptyLabel} />
      ) : (
        <div className="space-y-3">
          {homeStats.statistics.map((stat, index) => {
            const awayValue = awayStats.statistics[index]?.value ?? "-";
            return (
              <div key={stat.type} className="rounded-lg border border-gray-800 p-3">
                <div className="mb-1 grid grid-cols-[56px_minmax(0,1fr)_56px] items-center gap-2 text-xs">
                  <span className="truncate font-mono text-cyan-300">
                    {formatStatValue(stat.value)}
                  </span>
                  <span className="truncate px-1 text-center text-gray-400">{stat.type}</span>
                  <span className="truncate text-right font-mono text-magenta-300">
                    {formatStatValue(awayValue)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function StatsAnalysisPanel({
  statistics,
  labels,
}: {
  statistics: ApiFootballTeamStatistics[];
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    balanced: string;
  };
}) {
  const homeStats = statistics[0];
  const awayStats = statistics[1];
  const rows = buildAnalysisRows(homeStats, awayStats);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 via-white/[0.02] to-magenta-500/10 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="shrink-0 text-cyan-300" />
            <h2 className="min-w-0 truncate text-sm font-semibold text-white">{labels.title}</h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">{labels.subtitle}</p>
        </div>
        {homeStats && awayStats ? (
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs sm:flex-nowrap">
            <TeamMiniLabel team={homeStats.team} tone="cyan" />
            <span className="font-mono text-gray-600">vs</span>
            <TeamMiniLabel team={awayStats.team} tone="magenta" />
          </div>
        ) : null}
      </div>

      {!homeStats || !awayStats || rows.length === 0 ? (
        <div className="p-4">
          <EmptyDetail label={labels.empty} />
        </div>
      ) : (
        <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.type}
              className="rounded-xl border border-gray-800 bg-[#08080d] p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="min-w-[42px] truncate font-mono text-xs font-bold text-cyan-300">
                  {row.homeDisplay}
                </span>
                <span className="min-w-0 truncate px-2 text-center text-xs font-semibold text-white">
                  {row.type}
                </span>
                <span className="min-w-[42px] truncate text-right font-mono text-xs font-bold text-magenta-300">
                  {row.awayDisplay}
                </span>
              </div>
              <div className="grid grid-cols-[1fr_34px_1fr] items-center gap-2 sm:grid-cols-[1fr_40px_1fr]">
                <div className="flex h-3 justify-end rounded-full bg-gray-900">
                  <div
                    className="h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.35)]"
                    style={{ width: `${row.homePercent}%` }}
                  />
                </div>
                <span className="text-center text-[10px] text-gray-500">
                  {row.homePercent === row.awayPercent ? labels.balanced : `${row.homePercent}/${row.awayPercent}`}
                </span>
                <div className="h-3 rounded-full bg-gray-900">
                  <div
                    className="h-3 rounded-full bg-magenta-400 shadow-[0_0_12px_rgba(217,70,239,0.35)]"
                    style={{ width: `${row.awayPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function TeamMiniLabel({
  team,
  tone,
}: {
  team: ApiFootballTeamStatistics["team"];
  tone: "cyan" | "magenta";
}) {
  return (
    <span className="inline-flex min-w-0 max-w-[136px] items-center gap-2 rounded-full border border-gray-800 bg-black/30 px-2 py-1 sm:max-w-[170px]">
      <ApiTeamLogo name={team.name} logo={team.logo} size="sm" accent={tone} />
      <span className="min-w-0 truncate text-gray-300">{team.name}</span>
    </span>
  );
}

function H2HPanel({
  h2h,
  locale,
  title,
  emptyLabel,
  vsLabel,
}: {
  h2h: ApiFootballFixture[];
  locale: string;
  title: string;
  emptyLabel: string;
  vsLabel: string;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <History size={16} className="shrink-0 text-purple-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{title}</span>
        </h2>
      </div>
      {h2h.length === 0 ? (
        <div className="p-4">
          <EmptyDetail label={emptyLabel} />
        </div>
      ) : (
        <div className="divide-y divide-gray-800/70">
          {h2h.map((match) => (
            <Link
              key={match.id}
              href={`/${locale}/livescore/${buildFixtureSeoSlug(match)}`}
              className="grid gap-2 px-3 py-3 transition-colors hover:bg-white/[0.03] sm:grid-cols-[110px_minmax(0,1fr)_90px] sm:gap-3 sm:px-4"
            >
              <span className="font-mono text-xs text-gray-500">
                {new Date(match.kickoffTime).toLocaleDateString()}
              </span>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[1fr_76px_1fr]">
                <span className="truncate text-right text-xs font-semibold text-white">
                  {match.home.name}
                </span>
                <span className="text-center font-mono text-sm font-bold text-white">
                  {match.score.home !== null
                    ? `${match.score.home} - ${match.score.away}`
                    : vsLabel}
                </span>
                <span className="truncate text-xs font-semibold text-white">
                  {match.away.name}
                </span>
              </div>
              <span className="truncate text-[10px] text-gray-500 sm:text-right">
                {match.league.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}

function LineupsPanel({
  lineups,
  locale,
  season,
  labels,
}: {
  lineups: ApiFootballLineup[];
  locale: string;
  season: number;
  labels: {
    empty: string;
    coach: string;
    unavailable: string;
    startingXI: string;
    substitutes: string;
    formationPitch: string;
    noGridData: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {lineups.length === 0 ? (
        <Card className="p-4 lg:col-span-2">
          <EmptyDetail label={labels.empty} />
        </Card>
      ) : (
        lineups.map((lineup, index) => (
          <Card key={lineup.team.id} className="overflow-hidden p-0">
            <div
              className={cn(
                "flex items-center justify-between gap-3 border-b border-gray-800 px-3 py-3 sm:px-4",
                index === 0
                  ? "bg-cyan-500/10"
                  : "bg-magenta-500/10"
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ApiTeamLogo
                  name={lineup.team.name}
                  logo={lineup.team.logo}
                  size="sm"
                  accent={index === 0 ? "cyan" : "magenta"}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-white">
                    {lineup.team.name}
                  </h2>
                  <p className="truncate text-[10px] text-gray-500">
                    {labels.coach}: {lineup.coach.name ?? labels.unavailable}
                  </p>
                </div>
              </div>
              <Badge variant={index === 0 ? "cyan" : "magenta"} size="md" className="shrink-0">
                {lineup.formation ?? "N/A"}
              </Badge>
            </div>

            <div className="space-y-4 p-3 sm:p-4">
              <FormationPitch
                lineup={lineup}
                tone={index === 0 ? "cyan" : "magenta"}
                title={labels.formationPitch}
                emptyLabel={labels.noGridData}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="min-w-0">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <ListChecks size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />
                    <span className="min-w-0 truncate">{labels.startingXI}</span>
                  </h3>
                  <div className="grid gap-2">
                    {lineup.startXI.map(({ player }) => (
                      <PlayerRow
                        key={`${player.id}-${player.number}`}
                        player={player}
                        locale={locale}
                        season={season}
                      />
                    ))}
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <ListPlus size={14} className="shrink-0 text-green-300" aria-hidden="true" />
                    <span className="min-w-0 truncate">{labels.substitutes}</span>
                  </h3>
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {lineup.substitutes.map(({ player }) => (
                      <PlayerRow
                        key={`${player.id}-${player.number}`}
                        player={player}
                        locale={locale}
                        season={season}
                        compact
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </section>
  );
}

function FormationPitch({
  lineup,
  tone,
  title,
  emptyLabel,
}: {
  lineup: ApiFootballLineup;
  tone: "cyan" | "magenta";
  title: string;
  emptyLabel: string;
}) {
  const players = lineup.startXI
    .map(({ player }) => ({
      ...player,
      gridPosition: parseGridPosition(player.grid),
    }))
    .filter((player) => player.gridPosition);

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        <ShieldCheck size={14} className="shrink-0 text-emerald-300" aria-hidden="true" />
        <span className="min-w-0 truncate">{title}</span>
      </h3>
      <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-emerald-500/20 bg-[linear-gradient(90deg,rgba(16,185,129,0.08)_50%,rgba(16,185,129,0.14)_50%),linear-gradient(0deg,transparent_48%,rgba(255,255,255,0.12)_49%,rgba(255,255,255,0.12)_51%,transparent_52%)] bg-[length:40px_40px,100%_100%] sm:min-h-[360px]">
        <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute inset-x-10 top-4 h-12 rounded-b-xl border-x border-b border-white/10" />
        <div className="absolute inset-x-10 bottom-4 h-12 rounded-t-xl border-x border-t border-white/10" />

        {players.length === 0 ? (
          <div className="absolute inset-4 flex items-center justify-center rounded-lg border border-dashed border-white/10 bg-black/20 px-4 text-center text-xs text-gray-500">
            {emptyLabel}
          </div>
        ) : (
          players.map((player) => {
            const position = player.gridPosition!;
            const top = clamp(8 + (position.row - 1) * 17, 8, 88);
            const left = clamp(10 + (position.column - 1) * 20, 10, 90);

            return (
              <div
                key={`${player.id}-${player.number}-${player.grid}`}
                className="absolute w-16 -translate-x-1/2 -translate-y-1/2 text-center sm:w-24"
                style={{ top: `${top}%`, left: `${left}%` }}
                title={`${player.number ?? "-"} ${player.name}`}
              >
                <div
                  className={cn(
                    "mx-auto flex h-8 w-8 items-center justify-center rounded-full border font-mono text-[11px] font-bold shadow-lg sm:h-9 sm:w-9 sm:text-xs",
                    tone === "cyan"
                      ? "border-cyan-300/70 bg-cyan-500 text-black shadow-cyan-500/20"
                      : "border-magenta-300/70 bg-magenta-500 text-black shadow-magenta-500/20"
                  )}
                >
                  {player.number ?? "-"}
                </div>
                <p className="mt-1 truncate rounded bg-black/55 px-1 text-[9px] font-medium text-white sm:text-[10px]">
                  {shortenPlayerName(player.name)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  locale,
  season,
  compact = false,
}: {
  player: ApiFootballLineup["startXI"][number]["player"];
  locale: string;
  season: number;
  compact?: boolean;
}) {
  const name = (
    <span className={cn("truncate text-white", compact ? "text-xs" : "text-sm")}>
      {player.name}
    </span>
  );

  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)_38px] items-center gap-2 rounded-md border border-gray-800 bg-[#0a0a0f] px-2 py-2 sm:grid-cols-[36px_minmax(0,1fr)_44px]">
      <span className="font-mono text-xs font-bold text-white">
        {player.number ?? "-"}
      </span>
      {player.id ? (
        <Link
          href={`/${locale}/football/players/${player.id}?season=${season}`}
          className="min-w-0 transition-colors hover:text-cyan-300"
        >
          {name}
        </Link>
      ) : (
        name
      )}
      <span className="text-right text-[10px] text-gray-500">
        {player.pos ?? player.grid ?? "-"}
      </span>
    </div>
  );
}

function PlayerStatsPanel({
  playerStats,
  locale,
  season,
  labels,
}: {
  playerStats: ApiFootballPlayerStats[];
  locale: string;
  season: number;
  labels: {
    empty: string;
    titleSuffix: string;
    player: string;
    minutes: string;
    rating: string;
    goalsAssists: string;
    shots: string;
    pass: string;
    cards: string;
    captain: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {playerStats.length === 0 ? (
        <Card className="p-4 lg:col-span-2">
          <EmptyDetail label={labels.empty} />
        </Card>
      ) : (
        playerStats.map((teamStats, index) => (
          <Card key={teamStats.team.id} className="min-w-0 p-3 sm:p-4">
            <div className="mb-4 flex items-center gap-3">
              <ApiTeamLogo
                name={teamStats.team.name}
                logo={teamStats.team.logo}
                size="sm"
                accent={index === 0 ? "cyan" : "magenta"}
              />
              <div className="flex min-w-0 items-center gap-2">
                <Users size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
                <h2 className="truncate text-sm font-bold text-white">
                  {teamStats.team.name} {labels.titleSuffix}
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto [scrollbar-width:thin]">
              <table className="w-full min-w-[460px] text-sm sm:min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-2 py-2 text-left">{labels.player}</th>
                    <th className="px-2 py-2 text-center">{labels.minutes}</th>
                    <th className="px-2 py-2 text-center">{labels.rating}</th>
                    <th className="px-2 py-2 text-center">{labels.goalsAssists}</th>
                    <th className="px-2 py-2 text-center">{labels.shots}</th>
                    <th className="px-2 py-2 text-center">{labels.pass}</th>
                    <th className="px-2 py-2 text-center">{labels.cards}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70">
                  {teamStats.players.slice(0, 14).map(({ player, statistics }) => {
                    const stat = statistics[0];
                    return (
                      <tr key={player.id}>
                        <td className="px-2 py-2">
                          <Link
                            href={`/${locale}/football/players/${player.id}?season=${season}`}
                            className="block min-w-0"
                          >
                            <p className="truncate text-xs font-semibold text-white transition-colors hover:text-cyan-300">
                              {player.name}
                            </p>
                          </Link>
                          <p className="text-[10px] text-gray-600">
                            {stat?.games.position ?? "-"}
                            {stat?.games.captain ? ` - ${labels.captain}` : ""}
                          </p>
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat?.games.minutes ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-cyan-300">
                          {stat?.games.rating ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.goals.total ?? 0}/${stat.goals.assists ?? 0}` : "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.shots.on ?? 0}/${stat.shots.total ?? 0}` : "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat?.passes.accuracy ?? "-"}
                        </td>
                        <td className="px-2 py-2 text-center font-mono text-xs text-gray-400">
                          {stat ? `${stat.cards.yellow ?? 0}/${stat.cards.red ?? 0}` : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))
      )}
    </section>
  );
}

function EmptyDetail({ label }: { label: string }) {
  return (
    <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}

function parseApiFixtureId(matchId: string): number | null {
  return extractApiFixtureId(matchId);
}

function countPlayers(playerStats: ApiFootballPlayerStats[]) {
  return playerStats.reduce((total, team) => total + team.players.length, 0);
}

function buildAnalysisRows(
  homeStats?: ApiFootballTeamStatistics,
  awayStats?: ApiFootballTeamStatistics
) {
  if (!homeStats || !awayStats) return [];

  return homeStats.statistics
    .map((homeStat) => {
      const awayStat = awayStats.statistics.find((item) => item.type === homeStat.type);
      const homeValue = parseStatNumber(homeStat.value);
      const awayValue = parseStatNumber(awayStat?.value ?? null);

      if (homeValue === null || awayValue === null) return null;

      const total = homeValue + awayValue;
      const homePercent = total > 0 ? Math.round((homeValue / total) * 100) : 50;
      const awayPercent = total > 0 ? 100 - homePercent : 50;

      return {
        type: homeStat.type,
        homeDisplay: formatStatValue(homeStat.value),
        awayDisplay: formatStatValue(awayStat?.value ?? null),
        homePercent: clamp(homePercent, 4, 96),
        awayPercent: clamp(awayPercent, 4, 96),
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .slice(0, 12);
}

function parseStatNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return null;

  const parsed = Number.parseFloat(value.replace("%", ""));
  return Number.isNaN(parsed) ? null : parsed;
}

function parseGridPosition(grid: string | null) {
  if (!grid) return null;

  const [row, column] = grid.split(":").map((part) => Number.parseInt(part, 10));
  if (!row || !column) return null;

  return { row, column };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shortenPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts.at(-1)}`;
}

function formatFixtureTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatValue(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  return String(value);
}
