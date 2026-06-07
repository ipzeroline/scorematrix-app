import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  Clock,
  ClipboardList,
  History,
  ListChecks,
  ListPlus,
  MapPin,
  Radio,
  ShieldCheck,
  Table2,
  Timer,
  TrendingUp,
  User,
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
import { isIgnorableFixtureSupplementError } from "@/lib/api-football-fixture-details";
import { buildFixtureSeoSlug, buildLeagueSeoSlug, extractApiFixtureId } from "@/lib/football-slugs";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { MatchStatus } from "@/types/common";
import { cn, formatDate, formatTime } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
  showJsonBox?: boolean;
};

export default async function MatchDetailPage({ params, showJsonBox = false }: Props) {
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

  let matchDetails:
    | {
        fixture: ApiFootballFixture;
        events: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["events"];
        lineups: ApiFootballLineup[];
        statistics: ApiFootballTeamStatistics[];
        playerStats: ApiFootballPlayerStats[];
        h2h: ApiFootballFixture[];
        season: number;
        fetchedAt: string;
      }
    | undefined;
  let loadErrorMessage: string | undefined;

  try {
    const details = await getApiFootballFixtureDetails(apiFixtureId);
    const { fixture, events, lineups, statistics, playerStats } = details;
    let h2h: ApiFootballFixture[] = [];
    if (fixture.home.apiTeamId && fixture.away.apiTeamId) {
      try {
        h2h = await getApiFootballH2H(fixture.home.apiTeamId, fixture.away.apiTeamId);
      } catch (error) {
        if (!isIgnorableFixtureSupplementError(error)) {
          throw error;
        }
      }
    }
    const season = fixture.league.season ?? new Date().getFullYear();

    matchDetails = { fixture, events, lineups, statistics, playerStats, h2h, season, fetchedAt: details.fetchedAt };
  } catch (error) {
    loadErrorMessage =
      error instanceof ApiFootballError
        ? error.message
        : t("matchDetail.loadError");
  }

  if (!matchDetails) {
    return (
      <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <Card className="border-amber-500/20 bg-amber-500/5 p-6 text-center">
          <h1 className="text-lg font-bold text-white">{t("matchDetail.unavailableTitle")}</h1>
          <p className="mt-2 text-sm text-amber-300">{loadErrorMessage}</p>
        </Card>
      </MatchDetailShell>
    );
  }

  const { fixture, events, lineups, statistics, playerStats, h2h, season, fetchedAt } = matchDetails;
  const homeLineup = lineups.find((lineup) => lineup.team.id === fixture.home.apiTeamId) ?? lineups[0];
  const awayLineup = lineups.find((lineup) => lineup.team.id === fixture.away.apiTeamId) ?? lineups[1];

  return (
    <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
      <Card neon="cyan" className="overflow-hidden p-3 text-center sm:p-4">
        <Link
          href={`/${locale}/football/leagues/${buildLeagueSeoSlug(fixture.league)}?season=${season}`}
          className="mx-auto mb-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5 text-left transition-colors hover:border-cyan-400/40"
        >
          <ApiLeagueLogo
            name={fixture.league.name}
            logo={fixture.league.logo}
            size="sm"
          />
          <span className="min-w-0">
            <span className="block truncate text-xs font-bold text-white sm:text-sm">
              {fixture.league.name}
            </span>
            <span className="block truncate text-[10px] text-gray-500">
              {fixture.league.round}
            </span>
          </span>
        </Link>
        <div className="grid grid-cols-[minmax(0,1fr)_86px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)] sm:gap-3">
          <TeamHeader
            name={fixture.home.name}
            logo={fixture.home.logo}
            href={
              fixture.home.apiTeamId
                ? buildTeamDetailHref(fixture.home.apiTeamId, fixture.league.apiLeagueId, season)
                : undefined
            }
            accent="cyan"
            align="right"
            lineup={homeLineup}
          />
          <div className="min-w-0 text-center">
            <div className="mb-1.5 flex justify-center">
              <StatusBadge status={fixture.status} />
            </div>
            <div className="font-mono text-[26px] font-bold leading-none text-white sm:text-4xl">
              {fixture.score.home !== null
                ? `${fixture.score.home} - ${fixture.score.away}`
                : t("common.vs")}
            </div>
            <p className="mt-1.5 break-words font-mono text-[11px] leading-tight text-gray-400 sm:text-[11px]">
              {formatFixtureDateTime(fixture.kickoffTime, locale)}
            </p>
            {fixture.status === MatchStatus.LIVE && fixture.elapsed !== null && (
              <p className="mt-1 font-mono text-[13px] font-bold text-green-300 sm:text-xs">
                {fixture.elapsed}
                {fixture.statusExtra ? `+${fixture.statusExtra}` : ""}&apos;
              </p>
            )}
          </div>
          <TeamHeader
            name={fixture.away.name}
            logo={fixture.away.logo}
            href={
              fixture.away.apiTeamId
                ? buildTeamDetailHref(fixture.away.apiTeamId, fixture.league.apiLeagueId, season)
                : undefined
            }
            accent="magenta"
            lineup={awayLineup}
          />
        </div>
        {fixture.status === MatchStatus.UPCOMING && (
          <div className="mt-4 flex justify-center">
            <Link
              href={buildPredictMatchHref(
                locale,
                buildFixtureSeoSlug(fixture),
                fixture.home.apiTeamId ?? fixture.home.id,
                fixture.away.apiTeamId ?? fixture.away.id
              )}
              className="w-full sm:w-auto"
            >
              <Button variant="gold" size="md" className="w-full sm:w-auto">
                {t("prediction.predictScore")}
              </Button>
            </Link>
          </div>
        )}
      </Card>

      <MatchContextPanel
        fixture={fixture}
        fetchedAt={fetchedAt}
        locale={locale}
        labels={{
          title: t("matchDetail.matchInfo"),
          status: t("matchDetail.liveStatus"),
          kickoff: t("matchDetail.kickoffTime"),
          elapsed: t("matchDetail.elapsed"),
          addedTime: t("matchDetail.addedTime"),
          referee: t("matchDetail.referee"),
          venue: t("matchDetail.venue"),
          firstPeriod: t("matchDetail.firstPeriod"),
          secondPeriod: t("matchDetail.secondPeriod"),
          lastUpdated: t("matchDetail.lastUpdated"),
          unavailable: t("matchDetail.unavailable"),
          statusFirstHalf: t("matchDetail.statusFirstHalf"),
          statusSecondHalf: t("matchDetail.statusSecondHalf"),
          statusHalftime: t("matchDetail.statusHalftime"),
          statusFulltime: t("matchDetail.statusFulltime"),
          statusExtraTime: t("matchDetail.statusExtraTime"),
          statusPenalty: t("matchDetail.statusPenalty"),
          statusPostponed: t("matchDetail.statusPostponed"),
          statusCancelled: t("matchDetail.statusCancelled"),
          statusNotStarted: t("matchDetail.statusNotStarted"),
        }}
      />

      {showJsonBox && (
        <JsonBox
          title={`GET /fixtures/${apiFixtureId}`}
          value={{
            fixture,
            events,
            lineups,
            statistics,
            playerStats,
            h2h,
          }}
        />
      )}

      <StatsAnalysisPanel
        statistics={statistics}
        lineups={lineups}
        labels={{
          title: t("matchDetail.analysisGraph"),
          empty: t("matchDetail.noTeamStatistics"),
          balanced: t("matchDetail.balancedStat"),
        }}
        statLabels={buildTeamStatLabels(t)}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <EventsPanel
          events={events}
          title={t("matchDetail.matchEvents")}
          emptyLabel={t("matchDetail.noEventData")}
          relatedLabel={t("matchDetail.relatedPlayer")}
          labels={buildEventLabels(t)}
        />
        <TeamStatsPanel
          statistics={statistics}
          title={t("matchDetail.teamStatistics")}
          emptyLabel={t("matchDetail.noTeamStatistics")}
          labels={buildTeamStatLabels(t)}
        />
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
        captain: t("matchDetail.captain"),
      }} playerStats={playerStats} />
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
}

function JsonBox({ title, value }: { title: string; value: unknown }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-gray-800 px-4 py-3">
        <h2 className="min-w-0 truncate font-mono text-xs font-semibold text-cyan-300">
          {title}
        </h2>
        <span className="shrink-0 rounded-md border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 font-mono text-[10px] font-semibold text-cyan-200">
          JSON
        </span>
      </div>
      <pre className="max-h-[520px] overflow-auto bg-[#05070d] p-4 text-[11px] leading-5 text-gray-300">
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    </Card>
  );
}

function buildEventLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    goal: t("matchDetail.eventGoal"),
    substitution: t("matchDetail.eventSubstitution"),
    yellowCard: t("matchDetail.eventYellowCard"),
    redCard: t("matchDetail.eventRedCard"),
    card: t("matchDetail.eventCard"),
    var: t("matchDetail.eventVar"),
    unknown: t("matchDetail.eventUnknown"),
  };
}

function buildTeamStatLabels(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    shotsOnGoal: t("matchDetail.statShotsOnGoal"),
    shotsOffGoal: t("matchDetail.statShotsOffGoal"),
    totalShots: t("matchDetail.statTotalShots"),
    blockedShots: t("matchDetail.statBlockedShots"),
    shotsInsideBox: t("matchDetail.statShotsInsideBox"),
    shotsOutsideBox: t("matchDetail.statShotsOutsideBox"),
    fouls: t("matchDetail.statFouls"),
    cornerKicks: t("matchDetail.statCornerKicks"),
    offsides: t("matchDetail.statOffsides"),
    ballPossession: t("matchDetail.statBallPossession"),
    yellowCards: t("matchDetail.statYellowCards"),
    redCards: t("matchDetail.statRedCards"),
    goalkeeperSaves: t("matchDetail.statGoalkeeperSaves"),
    totalPasses: t("matchDetail.statTotalPasses"),
    passesAccurate: t("matchDetail.statPassesAccurate"),
    passesPercent: t("matchDetail.statPassesPercent"),
    expectedGoals: t("matchDetail.statExpectedGoals"),
    goalsPrevented: t("matchDetail.statGoalsPrevented"),
  };
}

function MatchContextPanel({
  fixture,
  fetchedAt,
  locale,
  labels,
}: {
  fixture: ApiFootballFixture;
  fetchedAt: string;
  locale: string;
  labels: {
    title: string;
    status: string;
    kickoff: string;
    elapsed: string;
    addedTime: string;
    referee: string;
    venue: string;
    firstPeriod: string;
    secondPeriod: string;
    lastUpdated: string;
    unavailable: string;
    statusFirstHalf: string;
    statusSecondHalf: string;
    statusHalftime: string;
    statusFulltime: string;
    statusExtraTime: string;
    statusPenalty: string;
    statusPostponed: string;
    statusCancelled: string;
    statusNotStarted: string;
  };
}) {
  const elapsedValue = fixture.elapsed === null
    ? labels.unavailable
    : `${fixture.elapsed}${fixture.statusExtra ? `+${fixture.statusExtra}` : ""}'`;

  const items = [
    {
      icon: Radio,
      label: labels.status,
      value: translateFixtureStatus(fixture, labels),
      tone: "text-green-300",
    },
    {
      icon: Clock,
      label: labels.kickoff,
      value: formatFixtureDateTime(fixture.kickoffTime, locale),
      tone: "text-cyan-300",
    },
    {
      icon: Timer,
      label: labels.elapsed,
      value: elapsedValue,
      tone: "text-amber-300",
    },
    {
      icon: Timer,
      label: labels.addedTime,
      value: fixture.statusExtra === null ? labels.unavailable : `${fixture.statusExtra}'`,
      tone: "text-amber-300",
    },
    {
      icon: User,
      label: labels.referee,
      value: fixture.referee ?? labels.unavailable,
      tone: "text-purple-300",
    },
    {
      icon: MapPin,
      label: labels.venue,
      value: fixture.venue || labels.unavailable,
      tone: "text-magenta-300",
    },
    {
      icon: Clock,
      label: labels.firstPeriod,
      value: formatUnixTimestamp(fixture.periods.first, labels.unavailable, locale),
      tone: "text-cyan-300",
    },
    {
      icon: Clock,
      label: labels.secondPeriod,
      value: formatUnixTimestamp(fixture.periods.second, labels.unavailable, locale),
      tone: "text-gray-400",
    },
    {
      icon: Radio,
      label: labels.lastUpdated,
      value: formatFixtureDateTime(fetchedAt, locale),
      tone: "text-green-300",
    },
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 bg-white/[0.02] px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Radio size={16} className="shrink-0 text-green-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{labels.title}</span>
        </h2>
      </div>
      <div className="grid gap-px bg-gray-800 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="min-w-0 bg-[#12121a] px-4 py-3">
            <div className="mb-1 flex items-center gap-2">
              <Icon size={14} className={cn("shrink-0", tone)} aria-hidden="true" />
              <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                {label}
              </span>
            </div>
            <p className="break-words text-xs font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function translateFixtureStatus(
  fixture: ApiFootballFixture,
  labels: {
    unavailable: string;
    statusFirstHalf: string;
    statusSecondHalf: string;
    statusHalftime: string;
    statusFulltime: string;
    statusExtraTime: string;
    statusPenalty: string;
    statusPostponed: string;
    statusCancelled: string;
    statusNotStarted: string;
  }
) {
  switch (fixture.statusShort.toUpperCase()) {
    case "1H":
      return labels.statusFirstHalf;
    case "2H":
      return labels.statusSecondHalf;
    case "HT":
      return labels.statusHalftime;
    case "FT":
      return labels.statusFulltime;
    case "ET":
    case "AET":
      return labels.statusExtraTime;
    case "P":
    case "PEN":
      return labels.statusPenalty;
    case "PST":
      return labels.statusPostponed;
    case "CANC":
    case "ABD":
    case "AWD":
    case "WO":
      return labels.statusCancelled;
    case "NS":
    case "TBD":
      return labels.statusNotStarted;
    default:
      return fixture.statusLong || fixture.statusShort || labels.unavailable;
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

function buildTeamDetailHref(teamId: number, leagueId: number | null, season: number) {
  const query = new URLSearchParams({ season: String(season) });

  if (leagueId) {
    query.set("league", String(leagueId));
  }

  return `/football/teams/${teamId}?${query.toString()}`;
}

function TeamHeader({
  name,
  logo,
  href,
  accent,
  lineup,
  align = "left",
}: {
  name: string;
  logo: string | null;
  href?: string;
  accent: "cyan" | "magenta";
  lineup?: ApiFootballLineup;
  align?: "left" | "right";
}) {
  const kit = getTeamHeaderKitColors(lineup, accent);
  const content = (
    <div
      className={cn(
        "flex min-w-0 flex-col items-center gap-1.5 sm:gap-2",
        align === "right" && "sm:items-end",
        align === "left" && "sm:items-start"
      )}
    >
      <TeamShirtLogo name={name} logo={logo} kit={kit} />
      <h1 className="max-w-full truncate text-[13px] font-bold leading-tight text-white sm:text-sm">
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

function TeamShirtLogo({
  name,
  logo,
  kit,
}: {
  name: string;
  logo: string | null;
  kit: ResolvedKitColor;
}) {
  return (
    <div className="relative h-12 w-14 sm:h-16 sm:w-20">
      <div
        className="absolute inset-0 flex items-center justify-center border shadow-[0_14px_30px_rgba(0,0,0,0.34)]"
        style={{
          backgroundColor: kit.primary,
          borderColor: kit.border,
          clipPath:
            "polygon(18% 0%, 35% 0%, 42% 12%, 58% 12%, 65% 0%, 82% 0%, 100% 22%, 84% 38%, 78% 100%, 22% 100%, 16% 38%, 0% 22%)",
        }}
      >
        <span className="grid h-7 w-7 place-items-center rounded-full border border-white/45 bg-white p-1 shadow-[0_4px_12px_rgba(0,0,0,0.3)] sm:h-9 sm:w-9">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={`${name} logo`} className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs font-black text-black">{name.slice(0, 2).toUpperCase()}</span>
          )}
        </span>
      </div>
    </div>
  );
}

function EventsPanel({
  events,
  title,
  emptyLabel,
  relatedLabel,
  labels,
}: {
  events: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["events"];
  title: string;
  emptyLabel: string;
  relatedLabel: string;
  labels: EventLabels;
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
            const style = eventStyle(event.type, event.detail, labels);
            const detailLabel = translateEventDetail(event.detail, labels);

            return (
              <div
                key={`${event.time.elapsed}-${event.type}-${index}`}
                className={`grid grid-cols-[40px_24px_minmax(0,1fr)] items-center gap-2 rounded-lg border px-2 py-2 sm:grid-cols-[48px_28px_minmax(0,1fr)_128px] sm:gap-3 sm:px-3 ${style.rowClass}`}
              >
                <span className="font-mono text-xs text-cyan-300">
                  {event.time.elapsed}
                  {event.time.extra ? `+${event.time.extra}` : ""}&apos;
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
                    {detailLabel}
                    {event.assist.name ? ` · ${relatedLabel}: ${event.assist.name}` : ""}
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

type EventLabels = {
  goal: string;
  substitution: string;
  yellowCard: string;
  redCard: string;
  card: string;
  var: string;
  unknown: string;
};

function eventStyle(type: string, detail: string, labels: EventLabels) {
  const normalized = `${type} ${detail}`.toLowerCase();

  if (normalized.includes("red card")) {
    return {
      label: labels.redCard,
      icon: "R",
      rowClass: "border-red-500/30 bg-red-500/10",
      iconClass: "border-red-300/70 bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]",
      badgeClass: "border-red-500/40 bg-red-500/15 text-red-200",
    };
  }

  if (normalized.includes("yellow card")) {
    return {
      label: labels.yellowCard,
      icon: "Y",
      rowClass: "border-amber-500/30 bg-amber-500/10",
      iconClass: "border-amber-200/80 bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.35)]",
      badgeClass: "border-amber-500/40 bg-amber-500/15 text-amber-200",
    };
  }

  if (type === "Goal") {
    return {
      label: labels.goal,
      icon: "G",
      rowClass: "border-green-500/25 bg-green-500/10",
      iconClass: "border-green-400/50 bg-green-500/20 text-green-200",
      badgeClass: "border-green-500/40 bg-green-500/15 text-green-200",
    };
  }

  if (normalized.includes("substitution")) {
    return {
      label: labels.substitution,
      icon: "S",
      rowClass: "border-cyan-500/25 bg-cyan-500/10",
      iconClass: "border-cyan-300/60 bg-cyan-500/20 text-cyan-200",
      badgeClass: "border-cyan-500/40 bg-cyan-500/15 text-cyan-200",
    };
  }

  return {
    label: translateEventType(type, labels),
    icon: "•",
    rowClass: "border-gray-800 bg-[#0a0a0f]",
    iconClass: "border-gray-700 bg-gray-800 text-gray-300",
    badgeClass: "border-gray-700 bg-gray-800/60 text-gray-300",
  };
}

function translateEventType(type: string, labels: EventLabels) {
  switch (type.toLowerCase()) {
    case "goal":
      return labels.goal;
    case "substitution":
      return labels.substitution;
    case "card":
      return labels.card;
    case "var":
      return labels.var;
    default:
      return type || labels.unknown;
  }
}

function translateEventDetail(detail: string, labels: EventLabels) {
  const normalized = detail.toLowerCase();
  if (normalized.includes("red card")) return labels.redCard;
  if (normalized.includes("yellow card")) return labels.yellowCard;
  if (normalized.includes("substitution")) return labels.substitution;
  if (normalized.includes("goal")) return labels.goal;
  return detail || labels.unknown;
}

function TeamStatsPanel({
  statistics,
  title,
  emptyLabel,
  labels,
}: {
  statistics: ApiFootballTeamStatistics[];
  title: string;
  emptyLabel: string;
  labels: TeamStatLabels;
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
                  <span className="truncate px-1 text-center text-gray-400">
                    {translateTeamStat(stat.type, labels)}
                  </span>
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
  lineups,
  labels,
  statLabels,
}: {
  statistics: ApiFootballTeamStatistics[];
  lineups: ApiFootballLineup[];
  labels: {
    title: string;
    empty: string;
    balanced: string;
  };
  statLabels: TeamStatLabels;
}) {
  const homeStats = statistics[0];
  const awayStats = statistics[1];
  const rows = buildAnalysisRows(homeStats, awayStats);
  const homeKitColor = getTeamPrimaryKitColor(lineups[0], "#22d3ee");
  const awayKitColor = getTeamPrimaryKitColor(lineups[1], "#e879f9");

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-3 border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 via-white/[0.02] to-magenta-500/10 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="shrink-0 text-cyan-300" />
            <h2 className="min-w-0 truncate text-sm font-semibold text-white">{labels.title}</h2>
          </div>
        </div>
        {homeStats && awayStats ? (
          <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 text-xs sm:flex sm:w-auto sm:flex-nowrap sm:items-center">
            <TeamMiniLabel team={homeStats.team} tone="cyan" />
            <span className="mt-3 inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-cyan-300/25 bg-white/[0.06] px-2 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)] sm:mt-0">
              vs
            </span>
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
                  {translateTeamStat(row.type, statLabels)}
                </span>
                <span className="min-w-[42px] truncate text-right font-mono text-xs font-bold text-magenta-300">
                  {row.awayDisplay}
                </span>
              </div>
              <div className="overflow-hidden rounded-full border border-gray-800 bg-gray-950">
                <div className="flex h-3 w-full">
                  <div
                    className="h-full"
                    style={{
                      width: `${row.homePercent}%`,
                      backgroundColor: homeKitColor,
                    }}
                  />
                  <div
                    className="h-full"
                    style={{
                      width: `${row.awayPercent}%`,
                      backgroundColor: awayKitColor,
                    }}
                  />
                </div>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-gray-500">
                <span>{row.homePercent}%</span>
                <span>{row.homePercent === row.awayPercent ? labels.balanced : ""}</span>
                <span>{row.awayPercent}%</span>
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
    <span className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-1 text-center sm:inline-flex sm:max-w-[170px] sm:flex-row sm:justify-start sm:gap-2 sm:text-left">
      <ApiTeamLogo name={team.name} logo={team.logo} size="sm" accent={tone} />
      <span className="min-w-0 max-w-full truncate text-gray-300">{team.name}</span>
    </span>
  );
}

type TeamStatLabels = {
  shotsOnGoal: string;
  shotsOffGoal: string;
  totalShots: string;
  blockedShots: string;
  shotsInsideBox: string;
  shotsOutsideBox: string;
  fouls: string;
  cornerKicks: string;
  offsides: string;
  ballPossession: string;
  yellowCards: string;
  redCards: string;
  goalkeeperSaves: string;
  totalPasses: string;
  passesAccurate: string;
  passesPercent: string;
  expectedGoals: string;
  goalsPrevented: string;
};

function translateTeamStat(type: string, labels: TeamStatLabels) {
  const normalized = type.toLowerCase().replace(/[\s_-]+/g, " ").trim();

  switch (normalized) {
    case "shots on goal":
      return labels.shotsOnGoal;
    case "shots off goal":
      return labels.shotsOffGoal;
    case "total shots":
      return labels.totalShots;
    case "blocked shots":
      return labels.blockedShots;
    case "shots insidebox":
    case "shots inside box":
      return labels.shotsInsideBox;
    case "shots outsidebox":
    case "shots outside box":
      return labels.shotsOutsideBox;
    case "fouls":
      return labels.fouls;
    case "corner kicks":
      return labels.cornerKicks;
    case "offsides":
      return labels.offsides;
    case "ball possession":
      return labels.ballPossession;
    case "yellow cards":
      return labels.yellowCards;
    case "red cards":
      return labels.redCards;
    case "goalkeeper saves":
      return labels.goalkeeperSaves;
    case "total passes":
      return labels.totalPasses;
    case "passes accurate":
      return labels.passesAccurate;
    case "passes %":
      return labels.passesPercent;
    case "expected goals":
    case "expected goals xg":
      return labels.expectedGoals;
    case "goals prevented":
      return labels.goalsPrevented;
    default:
      return type;
  }
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
                {formatDate(match.kickoffTime)}
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
  playerStats,
  locale,
  season,
  labels,
}: {
  lineups: ApiFootballLineup[];
  playerStats: ApiFootballPlayerStats[];
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
    captain: string;
  };
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {lineups.length === 0 ? (
        <Card className="p-4 lg:col-span-2">
          <EmptyDetail label={labels.empty} />
        </Card>
      ) : (
        lineups.map((lineup, index) => {
          const captainIds = getCaptainPlayerIds(lineup.team.id, playerStats);
          const startingXI = lineup.startXI ?? [];
          const substitutes = lineup.substitutes ?? [];

          return (
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
                  title={labels.formationPitch}
                  emptyLabel={labels.noGridData}
                  captainIds={captainIds}
                  captainLabel={labels.captain}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="min-w-0">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <ListChecks size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />
                      <span className="min-w-0 truncate">{labels.startingXI}</span>
                    </h3>
                    <div className="grid gap-2">
                      {startingXI.map(({ player }) => (
                        <PlayerRow
                          key={`${player.id}-${player.number}`}
                          player={player}
                          locale={locale}
                          season={season}
                          isCaptain={isCaptainPlayer(player.id, captainIds)}
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
                      {substitutes.map(({ player }) => (
                        <PlayerRow
                          key={`${player.id}-${player.number}`}
                          player={player}
                          locale={locale}
                          season={season}
                          compact
                          isCaptain={isCaptainPlayer(player.id, captainIds)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })
      )}
    </section>
  );
}

function FormationPitch({
  lineup,
  title,
  emptyLabel,
  captainIds,
  captainLabel,
}: {
  lineup: ApiFootballLineup;
  title: string;
  emptyLabel: string;
  captainIds: Set<number>;
  captainLabel: string;
}) {
  const players = (lineup.startXI ?? [])
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
            const rowCount = getFormationRowCount(players);
            const columnCount = getFormationColumnCount(players, position.row);
            const top = getVerticalPitchTop(position.row, rowCount);
            const left = getHorizontalPitchLeft(position.column, columnCount);
            const kit = getPlayerKitColors(lineup, player.pos);
            const isCaptain = isCaptainPlayer(player.id, captainIds);

            return (
              <div
                key={`${player.id}-${player.number}-${player.grid}`}
                className="absolute w-[58px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[72px]"
                style={{ top: `${top}%`, left: `${left}%` }}
                title={`${player.number ?? "-"} ${player.name}${isCaptain ? ` (${captainLabel})` : ""}`}
              >
                <FootballShirt
                  number={player.number}
                  kit={kit}
                  isCaptain={isCaptain}
                  captainLabel={captainLabel}
                />
                <p className="mt-0.5 truncate rounded bg-black/55 px-1 text-[8px] font-medium text-white sm:text-[9px]">
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

function FootballShirt({
  number,
  kit,
  isCaptain,
  captainLabel,
}: {
  number: number | null;
  kit: ResolvedKitColor;
  isCaptain: boolean;
  captainLabel: string;
}) {
  return (
    <div className="relative mx-auto h-8 w-9 sm:h-9 sm:w-10">
      <div
        className="absolute inset-0 flex items-center justify-center border font-mono text-[10px] font-black shadow-[0_8px_18px_rgba(0,0,0,0.32)] sm:text-[11px]"
        style={{
          backgroundColor: kit.primary,
          borderColor: kit.border,
          color: kit.number,
          clipPath:
            "polygon(18% 0%, 35% 0%, 42% 12%, 58% 12%, 65% 0%, 82% 0%, 100% 22%, 84% 38%, 78% 100%, 22% 100%, 16% 38%, 0% 22%)",
        }}
      >
        <span className="mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {number ?? "-"}
        </span>
      </div>
      {isCaptain && (
        <span
          aria-label={captainLabel}
          title={captainLabel}
          className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-amber-200 bg-amber-400 px-1 font-mono text-[9px] font-black text-black shadow-[0_0_14px_rgba(251,191,36,0.55)]"
        >
          C
        </span>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  locale,
  season,
  compact = false,
  isCaptain = false,
}: {
  player: ApiFootballLineup["startXI"][number]["player"];
  locale: string;
  season: number;
  compact?: boolean;
  isCaptain?: boolean;
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
      <span className="flex items-center justify-end gap-1 text-right text-[10px] text-gray-500">
        {isCaptain && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-amber-300/60 bg-amber-400/15 px-1 font-mono text-[9px] font-bold text-amber-200">
            C
          </span>
        )}
        {player.pos ?? player.grid ?? "-"}
      </span>
    </div>
  );
}

type ResolvedKitColor = {
  primary: string;
  number: string;
  border: string;
};

function getPlayerKitColors(
  lineup: ApiFootballLineup,
  position: string | null
): ResolvedKitColor {
  const source =
    position === "G"
      ? lineup.team.colors?.goalkeeper ?? lineup.team.colors?.player
      : lineup.team.colors?.player;

  return {
    primary: normalizeHexColor(source?.primary, "#22d3ee"),
    number: normalizeHexColor(source?.number, "#020617"),
    border: normalizeHexColor(source?.border, source?.primary ? `#${source.primary}` : "#ffffff"),
  };
}

function getTeamPrimaryKitColor(lineup: ApiFootballLineup | undefined, fallback: string) {
  return normalizeHexColor(lineup?.team.colors?.player?.primary, fallback);
}

function getTeamHeaderKitColors(
  lineup: ApiFootballLineup | undefined,
  accent: "cyan" | "magenta"
): ResolvedKitColor {
  const fallback = accent === "cyan"
    ? { primary: "#22d3ee", number: "#020617", border: "#67e8f9" }
    : { primary: "#e879f9", number: "#020617", border: "#f0abfc" };
  const source = lineup?.team.colors?.player;

  return {
    primary: normalizeHexColor(source?.primary, fallback.primary),
    number: normalizeHexColor(source?.number, fallback.number),
    border: normalizeHexColor(source?.border, fallback.border),
  };
}

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const hex = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : fallback;
}

function getCaptainPlayerIds(teamId: number, playerStats: ApiFootballPlayerStats[]) {
  const teamStats = playerStats.find((item) => item.team.id === teamId);
  const captainIds = new Set<number>();

  for (const player of teamStats?.players ?? []) {
    if (player.statistics.some((stat) => stat.games.captain)) {
      captainIds.add(player.player.id);
    }
  }

  return captainIds;
}

function isCaptainPlayer(playerId: number | null, captainIds: Set<number>) {
  return playerId !== null && captainIds.has(playerId);
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
                    const playerName = (
                      <p className="truncate text-xs font-semibold text-white transition-colors hover:text-cyan-300">
                        {player.name}
                      </p>
                    );

                    return (
                      <tr key={`${player.id}-${player.name}`}>
                        <td className="px-2 py-2">
                          {player.id ? (
                            <Link
                              href={`/${locale}/football/players/${player.id}?season=${season}`}
                              className="block min-w-0"
                            >
                              {playerName}
                            </Link>
                          ) : (
                            playerName
                          )}
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

function getFormationRowCount(
  players: {
    gridPosition: { row: number; column: number } | null;
  }[]
) {
  return players.reduce(
    (max, player) => Math.max(max, player.gridPosition?.row ?? 1),
    1
  );
}

function getFormationColumnCount(
  players: {
    gridPosition: { row: number; column: number } | null;
  }[],
  row: number
) {
  return players.reduce((max, player) => {
    if (player.gridPosition?.row !== row) return max;
    return Math.max(max, player.gridPosition.column);
  }, 1);
}

function getVerticalPitchTop(row: number, rowCount: number) {
  if (rowCount <= 1) return 50;
  return clamp(10 + ((row - 1) / (rowCount - 1)) * 80, 10, 90);
}

function getHorizontalPitchLeft(column: number, columnCount: number) {
  if (columnCount <= 1) return 50;
  return clamp(14 + ((column - 1) / (columnCount - 1)) * 72, 14, 86);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shortenPlayerName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  return `${parts[0][0]}. ${parts.at(-1)}`;
}

function formatFixtureDateTime(value: string, locale: string) {
  return `${formatDate(value, locale)} ${formatTime(value, locale)}`;
}

function formatUnixTimestamp(value: number | null, fallback: string, locale: string) {
  if (!value) return fallback;
  return formatFixtureDateTime(new Date(value * 1000).toISOString(), locale);
}

function formatStatValue(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  return String(value);
}
