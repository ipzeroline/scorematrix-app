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
  Medal,
  Radio,
  ShieldCheck,
  Table2,
  Timer,
  TrendingUp,
  User,
} from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ApiFootballError,
  type ApiFootballEvent,
  type ApiFootballFixture,
  type ApiFootballH2HFixture,
  type ApiFootballFixtureTeamStanding,
  type ApiFootballScoreBreakdown,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  type ApiFootballTeamStatistics,
  getApiFootballFixtureDetails,
} from "@/lib/api-football";
import { buildFixtureSeoSlug, extractApiFixtureId } from "@/lib/football-slugs";
import { LiveMatchRefresher } from "./LiveMatchRefresher";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { hasAuthSession } from "@/lib/auth-session-server";
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
  const isLoggedIn = await hasAuthSession();

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
        teamStatistics: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["teamStatistics"];
        teamSquads: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["teamSquads"];
        headToHead: ApiFootballH2HFixture[];
        standings: { home: ApiFootballFixtureTeamStanding | null; away: ApiFootballFixtureTeamStanding | null } | null;
        scoreBreakdown: ApiFootballScoreBreakdown;
        season: number;
        fetchedAt: string;
      }
    | undefined;
  let loadErrorMessage: string | undefined;

  try {
    const details = await getApiFootballFixtureDetails(apiFixtureId);
    const { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown } = details;
    const season = fixture.league.season ?? new Date().getFullYear();

    matchDetails = { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown, season, fetchedAt: details.fetchedAt };
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

  const { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown, season, fetchedAt } = matchDetails;
  const homeLineup = lineups.find((lineup) => lineup.team.id === fixture.home.apiTeamId) ?? lineups[0];
  const awayLineup = lineups.find((lineup) => lineup.team.id === fixture.away.apiTeamId) ?? lineups[1];

  return (
    <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
      <Card neon="cyan" className="overflow-hidden p-3 text-center sm:p-4">
        <Link
          href={`/${locale}/football/leagues/${fixture.league.apiLeagueId ?? fixture.league.id}`}
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
            {hasScore(scoreBreakdown.halftime) && (
              <p className="mt-1 font-mono text-[11px] text-gray-500">
                HT {scoreBreakdown.halftime.home} : {scoreBreakdown.halftime.away}
              </p>
            )}
            {hasScore(scoreBreakdown.penalty) && (
              <p className="mt-0.5 font-mono text-[11px] font-semibold text-amber-300">
                PEN {scoreBreakdown.penalty.home} : {scoreBreakdown.penalty.away}
              </p>
            )}
            <p className="mt-1.5 break-words font-mono text-[11px] leading-tight text-gray-400 sm:text-[11px]">
              {formatFixtureDateTime(fixture.kickoffTime, locale)}
            </p>
            {fixture.status === MatchStatus.LIVE && fixture.elapsed !== null && (
              <p className="mt-1 font-mono text-[13px] font-bold text-green-300 sm:text-xs">
                {fixture.elapsed}
                {fixture.statusExtra ? `+${fixture.statusExtra}` : ""}&apos;
              </p>
            )}
            {fixture.status === MatchStatus.LIVE && (
              <div className="mt-2">
                <LiveMatchRefresher label={t("matchDetail.liveAutoRefresh")} />
              </div>
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
        {fixture.status === MatchStatus.UPCOMING && isLoggedIn && (
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

      <PeriodScorePanel
        scoreBreakdown={scoreBreakdown}
        status={fixture.statusShort}
        homeName={fixture.home.name}
        awayName={fixture.away.name}
        title={t("matchDetail.scorePeriod")}
        isUpcoming={fixture.status === MatchStatus.UPCOMING}
      />

      <FirstScorerPanel
        event={getFirstGoalEvent(events)}
        labels={{
          title: t("matchDetail.firstScorer"),
          empty: t("matchDetail.noEventData"),
          highlight: t("matchDetail.goalHighlight"),
          minute: t("matchDetail.goalMinute"),
          assist: t("matchDetail.goalAssist"),
          type: t("matchDetail.goalType"),
          detail: t("matchDetail.goalDetail"),
          related: t("matchDetail.relatedPlayer"),
          comments: t("matchDetail.goalComments"),
        }}
      />

      {showJsonBox && (
        <JsonBox
          title={`GET /soccer/fixtures/${apiFixtureId}`}
          value={{
            fetchedAt,
            fixture,
            events,
            lineups,
            statistics,
            playerStats,
            teamStatistics,
            teamSquads,
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

      {teamStatistics ? (
        <TeamSeasonStatisticsPanel
          statistics={teamStatistics}
          labels={{
            title: t("football.teamSeasonStats"),
            played: t("football.played"),
            wins: t("football.wins"),
            draws: t("football.draws"),
            losses: t("football.losses"),
            goalsFor: t("football.goalsFor"),
            goalsAgainst: t("football.goalsAgainst"),
            cleanSheets: t("football.cleanSheets"),
          }}
        />
      ) : null}

      {teamSquads ? (
        <TeamSquadsPanel
          squads={teamSquads}
          locale={locale}
          season={season}
          labels={{
            title: t("football.squadTitle"),
            age: t("football.age"),
            unavailable: t("matchDetail.unavailable"),
          }}
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <H2HPanel
          fixtures={headToHead}
          homeTeamId={fixture.home.apiTeamId}
          title={t("matchDetail.h2h")}
          emptyLabel={t("matchDetail.noH2hData")}
          labels={{
            win: t("matchDetail.h2hWin"),
            draw: t("matchDetail.h2hDraw"),
            loss: t("matchDetail.h2hLoss"),
          }}
        />
        <StandingPanel
          standings={standings}
          homeTeam={fixture.home}
          awayTeam={fixture.away}
          title={t("matchDetail.leagueStanding")}
          emptyLabel={t("matchDetail.noStandingData")}
          labels={{
            rank: t("matchDetail.standingRank"),
            points: t("matchDetail.standingPoints"),
            played: t("matchDetail.standingPlayed"),
            wdl: t("matchDetail.standingWDL"),
            goals: t("matchDetail.standingGoals"),
            gd: t("matchDetail.standingGD"),
            recentForm: t("matchDetail.recentForm"),
            split: t("matchDetail.standingSplit"),
            home: t("matchDetail.standingHome"),
            away: t("matchDetail.standingAway"),
          }}
        />
      </section>
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

function FirstScorerPanel({
  event,
  labels,
}: {
  event: ApiFootballEvent | null;
  labels: {
    title: string;
    empty: string;
    highlight: string;
    minute: string;
    assist: string;
    type: string;
    detail: string;
    related: string;
    comments: string;
  };
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 bg-linear-to-r from-green-500/10 via-white/2 to-cyan-500/10 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <ShieldCheck size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{labels.title}</span>
        </h2>
      </div>
      {!event ? (
        <div className="p-4">
          <EmptyDetail label={labels.empty} />
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <div className="overflow-hidden rounded-2xl border border-green-400/20 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.18),transparent_52%),linear-gradient(135deg,#0a0d13,#111827)] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-green-300">
                  {labels.highlight}
                </p>
                <h3 className="mt-2 truncate text-2xl font-black text-white sm:text-3xl">
                  {event.player.name ?? event.team.name}
                </h3>
                <div className="mt-3 flex min-w-0 items-center gap-3">
                  <ApiTeamLogo name={event.team.name} logo={event.team.logo} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{event.team.name}</p>
                    <p className="truncate text-xs text-gray-400">
                      {translateEventDetail(event.detail, buildEventFallbackLabels())}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-green-400/25 bg-green-500/10 px-4 py-3 text-center shadow-[0_0_24px_rgba(34,197,94,0.18)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-green-200">{labels.minute}</p>
                <p className="mt-1 font-mono text-2xl font-black text-green-300">
                  {event.time.elapsed}{event.time.extra ? `+${event.time.extra}` : ""}&apos;
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FirstScorerMeta label={labels.assist} value={event.assist.name ?? "-"} />
              <FirstScorerMeta label={labels.type} value={event.type} />
            </div>
          </div>
          <div className="grid gap-3">
            <FirstScorerMeta label={labels.detail} value={event.detail || "-"} />
            <FirstScorerMeta label={labels.related} value={event.assist.name ?? "-"} />
            <FirstScorerMeta label={labels.comments} value={event.comments ?? "-"} multiline />
          </div>
        </div>
      )}
    </Card>
  );
}

function FirstScorerMeta({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#12121a] px-3 py-3">
      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-semibold text-white", multiline ? "break-words" : "truncate")}>
        {value}
      </p>
    </div>
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

function PersonAvatar({
  name,
  photo,
  size,
}: {
  name: string;
  photo: string | null;
  size: "xs" | "sm";
}) {
  const dimension = size === "xs" ? "h-5 w-5" : "h-7 w-7";
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-[#0a0a0f]",
        dimension
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-mono font-bold text-gray-400", textSize)}>
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}
    </span>
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
                  <div className="mb-1 flex min-w-0 items-center gap-2">
                    <ApiTeamLogo
                      name={event.team.name}
                      logo={event.team.logo}
                      size="xs"
                    />
                    <span className="truncate text-[10px] text-gray-500">
                      {event.team.name}
                    </span>
                  </div>
                  <p className="truncate text-xs font-semibold text-white">
                    {event.player.name ?? event.team.name}
                  </p>
                  <p className="truncate text-[10px] text-gray-500">
                    {detailLabel}
                    {event.assist.name ? ` · ${relatedLabel}: ${event.assist.name}` : ""}
                    {event.comments ? ` · ${event.comments}` : ""}
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

function getFirstGoalEvent(events: ApiFootballEvent[]) {
  return (
    [...events]
      .filter((event) => event.type === "Goal")
      .sort(
        (left, right) =>
          left.time.elapsed - right.time.elapsed ||
          (left.time.extra ?? 0) - (right.time.extra ?? 0)
      )[0] ?? null
  );
}

function buildEventFallbackLabels(): EventLabels {
  return {
    goal: "Goal",
    substitution: "Substitution",
    yellowCard: "Yellow card",
    redCard: "Red card",
    card: "Card",
    var: "VAR",
    unknown: "Unknown",
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
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 via-white/[0.02] to-magenta-500/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <Table2 size={16} className="shrink-0 text-magenta-300" aria-hidden="true" />
          <span className="min-w-0 truncate text-sm font-semibold text-white">{title}</span>
        </div>
        {homeStats && awayStats ? (
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <TeamMiniLabel team={homeStats.team} tone="cyan" />
            <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 font-mono text-[10px] font-bold uppercase tracking-widest text-gray-400">
              vs
            </span>
            <TeamMiniLabel team={awayStats.team} tone="magenta" />
          </div>
        ) : null}
      </div>
      {!homeStats || !awayStats ? (
        <div className="p-4">
          <EmptyDetail label={emptyLabel} />
        </div>
      ) : (
        <div className="space-y-3 p-4">
          {homeStats.statistics.map((stat, index) => {
            const awayValue = awayStats.statistics[index]?.value ?? "-";
            const homeNumber = parseStatNumber(stat.value);
            const awayNumber = parseStatNumber(awayValue);
            const total =
              homeNumber !== null && awayNumber !== null ? homeNumber + awayNumber : null;
            const homePercent =
              total && total > 0 && homeNumber !== null ? Math.round((homeNumber / total) * 100) : 50;
            const awayPercent =
              total && total > 0 && awayNumber !== null ? 100 - homePercent : 50;

            return (
              <div key={stat.type} className="rounded-xl border border-gray-800 bg-[#0a0d13] p-3">
                <div className="mb-2 grid grid-cols-[64px_minmax(0,1fr)_64px] items-center gap-2 text-xs">
                  <span className="truncate font-mono text-sm font-bold text-cyan-300">
                    {formatStatValue(stat.value)}
                  </span>
                  <span className="truncate px-1 text-center text-[11px] font-semibold text-gray-400">
                    {translateTeamStat(stat.type, labels)}
                  </span>
                  <span className="truncate text-right font-mono text-sm font-bold text-magenta-300">
                    {formatStatValue(awayValue)}
                  </span>
                </div>
                <div className="overflow-hidden rounded-full border border-gray-800 bg-black/30">
                  <div className="flex h-2.5 w-full">
                    <div
                      className="h-full bg-cyan-400"
                      style={{ width: `${homePercent}%` }}
                    />
                    <div
                      className="h-full bg-magenta-400"
                      style={{ width: `${awayPercent}%` }}
                    />
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[10px] text-gray-500">
                  <span>{homePercent}%</span>
                  <span>{awayPercent}%</span>
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

function TeamSeasonStatisticsPanel({
  statistics,
  labels,
}: {
  statistics: NonNullable<
    Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["teamStatistics"]
  >;
  labels: {
    title: string;
    played: string;
    wins: string;
    draws: string;
    losses: string;
    goalsFor: string;
    goalsAgainst: string;
    cleanSheets: string;
  };
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
        {labels.title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {[statistics.home, statistics.away].map((stats, index) => {
          if (!stats) return null;

          const metrics = [
            [labels.played, stats.fixtures.played.total],
            [labels.wins, stats.fixtures.wins.total],
            [labels.draws, stats.fixtures.draws.total],
            [labels.losses, stats.fixtures.loses.total],
            [labels.goalsFor, stats.goals.for.total.total],
            [labels.goalsAgainst, stats.goals.against.total.total],
            [labels.cleanSheets, stats.clean_sheet.total],
          ] as const;

          return (
            <Card key={stats.team?.id ?? index} className="overflow-hidden p-0">
              <div className={cn("flex items-center gap-3 border-b border-gray-800 p-4", index === 0 ? "bg-cyan-500/10" : "bg-magenta/10")}>
                <ApiTeamLogo
                  name={stats.team?.name ?? labels.title}
                  logo={stats.team?.logo ?? null}
                  size="sm"
                  accent={index === 0 ? "cyan" : "magenta"}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{stats.team?.name}</p>
                  <p className="text-xs text-gray-500">{stats.form || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-gray-800 bg-black/25 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function TeamSquadsPanel({
  squads,
  locale,
  season,
  labels,
}: {
  squads: NonNullable<Awaited<ReturnType<typeof getApiFootballFixtureDetails>>["teamSquads"]>;
  locale: string;
  season: number;
  labels: {
    title: string;
    age: string;
    unavailable: string;
  };
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
        {labels.title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {[squads.home, squads.away].map((squad, index) => {
          if (!squad) return null;

          return (
            <Card key={squad.teamId ?? index} className="overflow-hidden p-0">
              <div className={cn("flex items-center justify-between gap-3 border-b border-gray-800 p-4", index === 0 ? "bg-cyan-500/10" : "bg-magenta/10")}>
                <div className="flex min-w-0 items-center gap-3">
                  <ApiTeamLogo
                    name={squad.team?.name ?? labels.title}
                    logo={squad.team?.logo ?? null}
                    size="sm"
                    accent={index === 0 ? "cyan" : "magenta"}
                  />
                  <p className="truncate text-sm font-bold text-white">{squad.team?.name}</p>
                </div>
                <Badge variant={index === 0 ? "cyan" : "magenta"}>{squad.players.length}</Badge>
              </div>
              <div className="max-h-[430px] divide-y divide-gray-800 overflow-y-auto">
                {squad.players.map((player) => (
                  <Link
                    key={player.id || player.name}
                    href={`/${locale}/football/players/${player.id}?season=${season}`}
                    className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-bold",
                        index === 0
                          ? "border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
                          : "border-magenta/25 bg-magenta/10 text-magenta"
                      )}
                    >
                      {player.number ?? "-"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-white">{player.name}</p>
                      <p className="mt-0.5 truncate text-[10px] text-gray-500">
                        {player.position ?? labels.unavailable}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-[10px] text-gray-600">
                      {labels.age}: {player.age ?? "-"}
                    </p>
                  </Link>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
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
                    <div className="mt-1 flex min-w-0 items-center gap-2">
                      <PersonAvatar
                        name={lineup.coach.name ?? labels.unavailable}
                        photo={lineup.coach.photo}
                        size="xs"
                      />
                      <p className="truncate text-[10px] text-gray-500">
                        {labels.coach}: {lineup.coach.name ?? labels.unavailable}
                      </p>
                    </div>
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

/* ─────────────── Period Score Panel ─────────────── */

function PeriodScorePanel({
  scoreBreakdown,
  status,
  homeName,
  awayName,
  title,
  isUpcoming,
}: {
  scoreBreakdown: ApiFootballScoreBreakdown;
  status: string;
  homeName: string;
  awayName: string;
  title: string;
  isUpcoming: boolean;
}) {
  const hasHT = hasScore(scoreBreakdown.halftime);
  const hasFT = hasScore(scoreBreakdown.fulltime);
  const hasET = hasScore(scoreBreakdown.extratime);
  const hasPEN = hasScore(scoreBreakdown.penalty);

  if (isUpcoming || (!hasHT && !hasFT && !hasET && !hasPEN)) return null;

  const periods: { label: string; home: number | null; away: number | null; accent: string; textAccent: string }[] = [];

  if (hasHT) periods.push({ label: "HT", home: scoreBreakdown.halftime.home, away: scoreBreakdown.halftime.away, accent: "border-cyan-500/20 bg-cyan-500/5", textAccent: "text-cyan-300" });
  if (hasFT) periods.push({ label: "FT", home: scoreBreakdown.fulltime.home, away: scoreBreakdown.fulltime.away, accent: "border-green-500/20 bg-green-500/5", textAccent: "text-green-300" });
  if (hasET) periods.push({ label: "ET", home: scoreBreakdown.extratime.home, away: scoreBreakdown.extratime.away, accent: "border-amber-500/20 bg-amber-500/5", textAccent: "text-amber-300" });
  if (hasPEN) periods.push({ label: "PEN", home: scoreBreakdown.penalty.home, away: scoreBreakdown.penalty.away, accent: "border-magenta-500/20 bg-magenta-500/5", textAccent: "text-pink-300" });

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 bg-white/2 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Clock size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
          <span>{title}</span>
          <span className="ml-auto font-mono text-[10px] font-normal text-gray-500 uppercase tracking-wider">{status}</span>
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-3 hidden grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:grid">
          <span className="truncate text-xs font-semibold text-cyan-200">{homeName}</span>
          <span className="w-16" />
          <span className="truncate text-right text-xs font-semibold text-pink-200">{awayName}</span>
        </div>
        <div className="space-y-2">
          {periods.map(({ label, home, away, accent, textAccent }) => (
            <div
              key={label}
              className={cn("grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-2 rounded-xl border px-3 py-2.5", accent)}
            >
              <span className="font-mono text-lg font-black text-cyan-200 sm:text-xl">
                {home ?? "-"}
              </span>
              <span className={cn("text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em]", textAccent)}>
                {label}
              </span>
              <span className="text-right font-mono text-lg font-black text-pink-200 sm:text-xl">
                {away ?? "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function hasScore(score: { home: number | null; away: number | null }) {
  return score.home !== null || score.away !== null;
}

/* ─────────────── H2H Panel ─────────────── */

function H2HPanel({
  fixtures,
  homeTeamId,
  title,
  emptyLabel,
  labels,
}: {
  fixtures: ApiFootballH2HFixture[];
  homeTeamId: number | null;
  title: string;
  emptyLabel: string;
  labels: { win: string; draw: string; loss: string };
}) {
  if (fixtures.length === 0) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-800 bg-white/2 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <History size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
            <span className="min-w-0 truncate">{title}</span>
          </h2>
        </div>
        <div className="p-4"><EmptyDetail label={emptyLabel} /></div>
      </Card>
    );
  }

  let wins = 0, draws = 0, losses = 0;
  for (const m of fixtures) {
    const isHomeTeamHome = homeTeamId !== null && m.home.id === homeTeamId;
    const hg = m.goals.home, ag = m.goals.away;
    if (hg === null || ag === null) continue;
    if (hg === ag) { draws++; continue; }
    const weWon = isHomeTeamHome ? hg > ag : ag > hg;
    if (weWon) wins++;
    else losses++;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-gray-800 bg-linear-to-r from-cyan-500/5 via-white/1 to-transparent px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <History size={16} className="shrink-0 text-cyan-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{title}</span>
          <span className="ml-auto shrink-0 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-cyan-300">
            {fixtures.length}
          </span>
        </h2>
      </div>

      {/* W/D/L summary */}
      <div className="grid grid-cols-3 divide-x divide-gray-800 border-b border-gray-800">
        {[
          { label: labels.win, value: wins, color: "text-green-300", bg: "bg-green-500/8" },
          { label: labels.draw, value: draws, color: "text-amber-300", bg: "bg-amber-500/8" },
          { label: labels.loss, value: losses, color: "text-red-300", bg: "bg-red-500/8" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("flex flex-col items-center py-2.5", bg)}>
            <span className={cn("font-mono text-2xl font-black", color)}>{value}</span>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Match rows */}
      <div className="divide-y divide-gray-800/60">
        {fixtures.map((match) => {
          const isHomeTeamHome = homeTeamId !== null && match.home.id === homeTeamId;
          const hg = match.goals.home, ag = match.goals.away;
          const htH = match.score.halftime.home, htA = match.score.halftime.away;
          const hasHT = htH !== null && htA !== null;

          let resultChar = "D";
          let resultStyle = "border-amber-500/30 bg-amber-500/10 text-amber-300";
          if (hg !== null && ag !== null && hg !== ag) {
            const weWon = isHomeTeamHome ? hg > ag : ag > hg;
            resultChar = weWon ? "W" : "L";
            resultStyle = weWon
              ? "border-green-500/30 bg-green-500/10 text-green-300"
              : "border-red-500/30 bg-red-500/10 text-red-300";
          }

          const dateStr = match.date
            ? new Date(match.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
            : "";

          return (
            <div key={match.fixtureId} className="px-3 py-2.5">
              {/* Meta row */}
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-gray-600">{dateStr}</span>
                <span className="min-w-0 truncate text-center font-mono text-[10px] text-gray-600">
                  {match.league.name}{match.league.season ? ` ${match.league.season}` : ""}
                </span>
                {homeTeamId !== null && (
                  <span className={cn("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] font-black", resultStyle)}>
                    {resultChar}
                  </span>
                )}
              </div>
              {/* Teams + score */}
              <div className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-1.5">
                <div className="flex min-w-0 items-center gap-1.5">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="xs" />
                  <span className={cn("truncate text-xs font-semibold", match.home.winner ? "text-white" : "text-gray-400")}>
                    {match.home.name}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-mono text-sm font-black text-white">
                    {hg !== null && ag !== null ? `${hg} - ${ag}` : "- -"}
                  </span>
                  {hasHT && (
                    <span className="font-mono text-[9px] text-gray-600">{htH} : {htA} HT</span>
                  )}
                </div>
                <div className="flex min-w-0 items-center justify-end gap-1.5">
                  <span className={cn("truncate text-right text-xs font-semibold", match.away.winner ? "text-white" : "text-gray-400")}>
                    {match.away.name}
                  </span>
                  <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="xs" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ─────────────── Standings Panel ─────────────── */

function StandingPanel({
  standings,
  homeTeam,
  awayTeam,
  title,
  emptyLabel,
  labels,
}: {
  standings: { home: ApiFootballFixtureTeamStanding | null; away: ApiFootballFixtureTeamStanding | null } | null;
  homeTeam: ApiFootballFixture["home"];
  awayTeam: ApiFootballFixture["away"];
  title: string;
  emptyLabel: string;
  labels: { points: string; rank: string; played: string; wdl: string; goals: string; gd: string; recentForm: string; split: string; home: string; away: string };
}) {
  const home = standings?.home;
  const away = standings?.away;

  if (!home && !away) {
    return (
      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-800 bg-white/2 px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Medal size={16} className="shrink-0 text-amber-300" aria-hidden="true" />
            <span className="min-w-0 truncate">{title}</span>
          </h2>
        </div>
        <div className="p-4"><EmptyDetail label={emptyLabel} /></div>
      </Card>
    );
  }

  const hs = home ?? away!;
  const as_ = away ?? home!;
  const maxPts = Math.max(hs.points, as_.points, 1);

  const cmpRows: { label: string; hVal: string | number; aVal: string | number }[] = [
    { label: labels.rank, hVal: `#${hs.rank}`, aVal: `#${as_.rank}` },
    { label: labels.points, hVal: hs.points, aVal: as_.points },
    { label: labels.played, hVal: hs.all.played, aVal: as_.all.played },
    { label: labels.wdl, hVal: `${hs.all.win} / ${hs.all.draw} / ${hs.all.lose}`, aVal: `${as_.all.win} / ${as_.all.draw} / ${as_.all.lose}` },
    { label: labels.goals, hVal: `${hs.all.goals.for} : ${hs.all.goals.against}`, aVal: `${as_.all.goals.for} : ${as_.all.goals.against}` },
    { label: labels.gd, hVal: hs.goalsDiff > 0 ? `+${hs.goalsDiff}` : hs.goalsDiff, aVal: as_.goalsDiff > 0 ? `+${as_.goalsDiff}` : as_.goalsDiff },
  ];
  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="border-b border-gray-800 bg-linear-to-r from-amber-500/5 via-white/1 to-transparent px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Medal size={16} className="shrink-0 text-amber-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{title}</span>
          {hs.group && (
            <span className="ml-auto shrink-0 font-mono text-[10px] text-gray-500">{hs.group}</span>
          )}
        </h2>
      </div>

      <div className="space-y-4 p-4">
        {/* Team header row */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <ApiTeamLogo name={homeTeam.name} logo={homeTeam.logo} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-white">{homeTeam.name}</p>
              {hs.description && (
                <p className="truncate font-mono text-[9px] text-cyan-400">{hs.description}</p>
              )}
            </div>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-gray-600">vs</span>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-bold text-white">{awayTeam.name}</p>
              {as_.description && (
                <p className="truncate font-mono text-[9px] text-pink-400">{as_.description}</p>
              )}
            </div>
            <ApiTeamLogo name={awayTeam.name} logo={awayTeam.logo} size="sm" />
          </div>
        </div>

        {/* Points visual bar */}
        <div className="rounded-xl border border-gray-800 bg-[#0a0a0f] px-4 py-3">
          <p className="mb-2 text-center font-mono text-[10px] font-semibold uppercase tracking-wider text-gray-500">Points</p>
          <div className="mb-1 flex items-center gap-2">
            <span className="w-8 shrink-0 text-right font-mono text-sm font-black text-cyan-300">{hs.points}</span>
            <div className="relative flex h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-linear-to-r from-cyan-500 to-cyan-400"
                style={{ width: `${(hs.points / maxPts) * 100}%` }}
              />
            </div>
            <div
              className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-800"
            >
              <div
                className="absolute right-0 h-full rounded-full bg-linear-to-l from-pink-500 to-pink-400"
                style={{ width: `${(as_.points / maxPts) * 100}%` }}
              />
            </div>
            <span className="w-8 shrink-0 font-mono text-sm font-black text-pink-300">{as_.points}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-[9px] text-gray-600">Rank #{hs.rank}</span>
            <span className="font-mono text-[9px] text-gray-600">Rank #{as_.rank}</span>
          </div>
        </div>

        {/* Comparison rows */}
        <div className="overflow-hidden rounded-xl border border-gray-800">
          {cmpRows.map(({ label, hVal, aVal }) => (
            <div
              key={label}
              className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center border-b border-gray-800/60 bg-[#0a0a0f] px-3 py-2 last:border-0"
            >
              <span className="font-mono text-xs font-bold text-cyan-200">{hVal}</span>
              <span className="text-center font-mono text-[9px] font-semibold uppercase tracking-wider text-gray-600">{label}</span>
              <span className="text-right font-mono text-xs font-bold text-pink-200">{aVal}</span>
            </div>
          ))}
        </div>

        {/* Form pills */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <FormPillRow form={hs.form} label={labels.recentForm} align="left" />
          <FormPillRow form={as_.form} label={labels.recentForm} align="right" />
        </div>

        {/* Home / Away split */}
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <div className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] border-b border-gray-800 bg-white/2 px-3 py-1.5">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-cyan-500">{homeTeam.name}</span>
            <span className="text-center font-mono text-[9px] font-semibold uppercase tracking-wider text-gray-600">{labels.split}</span>
            <span className="text-right font-mono text-[9px] font-semibold uppercase tracking-wider text-pink-500">{awayTeam.name}</span>
          </div>
          {[
            { label: labels.home, h: hs.home, a: as_.home },
            { label: labels.away, h: hs.away, a: as_.away },
          ].map(({ label, h, a }) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center border-b border-gray-800/50 bg-[#0a0a0f] px-3 py-2 last:border-0">
              <span className="font-mono text-[10px] text-gray-300">
                {h.win}W {h.draw}D {h.lose}L
                <span className="ml-1 text-gray-600">({h.goals.for}:{h.goals.against})</span>
              </span>
              <span className="text-center font-mono text-[9px] font-semibold uppercase text-gray-600">{label}</span>
              <span className="text-right font-mono text-[10px] text-gray-300">
                {a.win}W {a.draw}D {a.lose}L
                <span className="ml-1 text-gray-600">({a.goals.for}:{a.goals.against})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function FormPillRow({ form, label, align }: { form: string | null; label: string; align: "left" | "right" }) {
  if (!form) return null;
  const chars = form.split("").slice(0, 5);

  return (
    <div className={cn("flex flex-col gap-1", align === "right" && "items-end")}>
      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-gray-600">{label}</span>
      <div className="flex gap-0.5">
        {chars.map((char, i) => (
          <span
            key={i}
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded font-mono text-[10px] font-black shadow-sm",
              char === "W" && "bg-green-500/20 text-green-300 ring-1 ring-green-500/20",
              char === "D" && "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/20",
              char === "L" && "bg-red-500/20 text-red-300 ring-1 ring-red-500/20"
            )}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
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
