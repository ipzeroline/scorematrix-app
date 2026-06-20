import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  Brain,
  Clock,
  ClipboardList,
  History,
  ListChecks,
  ListPlus,
  MapPin,
  Medal,
  MonitorCheck,
  Radio,
  ShieldCheck,
  Table2,
  Trophy,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/site";
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
import MatchTabsClient from "./MatchTabsClient";

const getFixtureDetailsCached = cache((apiFixtureId: number) =>
  getApiFootballFixtureDetails(apiFixtureId)
);

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
  showJsonBox?: boolean;
};

const SEO_TEMPLATES = {
  th: {
    title: (home: string, away: string, league: string) => `วิเคราะห์บอลสด ${home} vs ${away} - ${league} | ผลบอลสด รายชื่อ สถิติ H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `ติดตามรายงานการแข่งขันฟุตบอลสดระหว่าง ${home} พบกับ ${away} ในศึก ${league} ${score ? `ผลการแข่งขันปัจจุบัน: ${score}` : ""} อัปเดตรายชื่อผู้เล่น สถิติการครองบอล การยิงประตู ประวัติการพบกัน H2H และตารางคะแนนล่าสุดที่ ScoreMatrix`,
  },
  en: {
    title: (home: string, away: string, league: string) => `Live Score ${home} vs ${away} - ${league} | Lineups, Stats & H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `Live coverage of ${home} vs ${away} in ${league}. ${score ? `Current Score: ${score}.` : ""} Real-time lineups, match events, team stats, head-to-head records (H2H), and standings at ScoreMatrix.`,
  },
  lo: {
    title: (home: string, away: string, league: string) => `ຜົນບານສົດ ${home} vs ${away} - ${league} | ລາຍຊື່, ສະຖິຕິ & H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `ຕິດຕາມການແຂ່ງຂັນບານສົດລະຫວ່າງ ${home} ພົບກັບ ${away} ໃນເສິກ ${league} ${score ? `ຜົນການແຂ່ງຂັນ: ${score}` : ""} ອັບເດດລາຍຊື່ຜູ້ຫຼິ້ນ ສະຖິຕິ H2H ແລະ ຕາຕະລາງຄະແນນລ້າສຸດທີ່ ScoreMatrix`,
  },
  my: {
    title: (home: string, away: string, league: string) => `တိုက်ရိုက်ရလဒ် ${home} vs ${away} - ${league} | လူစာရင်း၊ စာရင်းအင်းနှင့် H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `${league} တွင် ${home} နှင့် ${away} တို့၏ တိုက်ရိုက်ပွဲစဉ်။ ${score ? `လက်ရှိရလဒ်: ${score}။` : ""} လူစာရင်း၊ စာရင်းအင်း၊ H2H နှင့် ရမှတ်ဇယားများကို ScoreMatrix တွင် ကြည့်ရှုပါ။`,
  },
  km: {
    title: (home: string, away: string, league: string) => `លទ្ធផលបាល់ទាត់បន្តផ្ទាល់ ${home} vs ${away} - ${league} | បញ្ជីឈ្មោះ, ស្ថិតិ និង H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `ការផ្សាយបន្តផ្ទាល់រវាង ${home} និង ${away} ក្នុង ${league}។ ${score ? `លទ្ធផលបច្ចុប្បន្ន: ${score}។` : ""} ស្ថិតិ, បញ្ជីឈ្មោះកីឡាករ, ប្រវត្តិជួបគ្នា H2H និងតារាងពិន្ទុនៅ ScoreMatrix។`,
  },
  zh: {
    title: (home: string, away: string, league: string) => `比分直播 ${home} vs ${away} - ${league} | 阵容、统计数据和历史战绩 H2H`,
    description: (home: string, away: string, league: string, score: string) => 
      `${league} 联赛中 ${home} 对阵 ${away} 的实时比分直播。${score ? `当前比分: ${score}。` : ""}实时阵容、比赛事件、球队数据统计、交战历史记录（H2H）以及最新积分榜，尽在 ScoreMatrix。`,
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, matchId } = await params;
  const apiFixtureId = parseApiFixtureId(matchId);

  if (!apiFixtureId) {
    return {
      title: "Match Details | ScoreMatrix",
    };
  }

  try {
    const details = await getFixtureDetailsCached(apiFixtureId);
    const { fixture } = details;
    const home = fixture.home.name;
    const away = fixture.away.name;
    const league = fixture.league.name;
    const score = hasCompleteScore(fixture.score)
      ? `${fixture.score.home}-${fixture.score.away}`
      : "";

    const templates = SEO_TEMPLATES[locale as keyof typeof SEO_TEMPLATES] ?? SEO_TEMPLATES.en;
    const title = templates.title(home, away, league);
    const description = templates.description(home, away, league, score);

    const pathname = `/${locale}/livescore/${matchId}`;
    const canonical = `${SITE_URL}${pathname}`;
    const languages = Object.fromEntries(
      ["th", "en", "lo", "my", "km", "zh"].map((code) => [code, `${SITE_URL}/${code}/livescore/${matchId}`])
    );

    return {
      title,
      description,
      alternates: {
        canonical,
        languages: {
          ...languages,
          "x-default": `${SITE_URL}/th/livescore/${matchId}`,
        },
      },
      openGraph: {
        title,
        description,
        url: canonical,
        siteName: SITE_NAME,
        locale,
        type: "website",
        images: [
          ...(fixture.home.logo ? [{
            url: fixture.home.logo,
            width: 120,
            height: 120,
            alt: `${home} Logo`,
          }] : []),
          ...(fixture.away.logo ? [{
            url: fixture.away.logo,
            width: 120,
            height: 120,
            alt: `${away} Logo`,
          }] : []),
        ],
      },
    };
  } catch {
    return {
      title: "Match Details | ScoreMatrix",
    };
  }
}

function mapStatusToSchemaOrg(status: MatchStatus): string {
  switch (status) {
    case MatchStatus.LIVE:
      return "https://schema.org/EventActive";
    case MatchStatus.FINISHED:
      return "https://schema.org/EventCompleted";
    case MatchStatus.POSTPONED:
      return "https://schema.org/EventPostponed";
    case MatchStatus.CANCELLED:
      return "https://schema.org/EventCancelled";
    case MatchStatus.UPCOMING:
    default:
      return "https://schema.org/EventScheduled";
  }
}

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
            {t("matchDetail.noFixtureId")}
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
        rawPayload: unknown;
      }
    | undefined;
  let loadErrorMessage: string | undefined;

  try {
    const details = await getFixtureDetailsCached(apiFixtureId);
    const { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown, rawPayload } = details;
    const season = fixture.league.season ?? new Date().getFullYear();

    matchDetails = { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown, season, fetchedAt: details.fetchedAt, rawPayload };
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

  const { fixture, events, lineups, statistics, playerStats, teamStatistics, teamSquads, headToHead, standings, scoreBreakdown, season, fetchedAt, rawPayload } = matchDetails;
  const homeLineup = lineups.find((lineup) => lineup.team.id === fixture.home.apiTeamId) ?? lineups[0];
  const awayLineup = lineups.find((lineup) => lineup.team.id === fixture.away.apiTeamId) ?? lineups[1];
  const hasPlayerStats = playerStats.some((teamStats) => (teamStats.players?.length ?? 0) > 0);
  const matchResult = getMatchResultState(fixture);

  return (
    <MatchDetailShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
      <Card className="relative overflow-hidden border border-cyan-300/15 bg-[#070b12] p-0 text-center shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(236,72,153,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_32%)]" />
        <h1 className="sr-only">
          {fixture.home.name} vs {fixture.away.name} - {fixture.league.name} ({fixture.league.round}) {t("matchDetail.matchInfo")}
        </h1>
        <div className="relative p-3 sm:p-5">
          <Link
            id="link-league-detail"
            href={`/${locale}/football/leagues/${fixture.league.apiLeagueId ?? fixture.league.id}`}
            className="mx-auto mb-4 inline-flex max-w-full items-center gap-2.5 rounded-full border border-cyan-300/20 bg-black/35 px-3.5 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] transition-all duration-150 hover:border-primary/45 hover:bg-cyan-300/10"
          >
            <ApiLeagueLogo
              name={fixture.league.name}
              logo={fixture.league.logo}
              size="sm"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black tracking-wide text-white uppercase">
                {fixture.league.name}
              </span>
              <span className="block truncate font-mono text-[11px] font-bold tracking-widest text-primary uppercase">
                {fixture.league.round}
              </span>
            </span>
          </Link>
        
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 py-2 sm:gap-5 sm:py-4">
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
            resultState={matchResult.home}
            winnerLabel={t("matchDetail.winnerLabel")}
          />
          
          <div className="min-w-0 text-center flex flex-col justify-center items-center px-1">
            <div className="mb-2">
              <StatusBadge
                status={fixture.status}
                label={fixture.statusShort || undefined}
              />
            </div>
            
            <div className="relative inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/45 px-3 py-2 shadow-[0_0_36px_rgba(34,211,238,0.12),inset_0_1px_0_rgba(255,255,255,0.05)] sm:px-6 sm:py-3">
              <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r bg-cyan-300" />
              <span className="absolute right-0 top-1/4 bottom-1/4 w-[3px] rounded-l bg-rose-400" />
              <span className={cn(
                "font-display text-[28px] font-black leading-none tracking-wider sm:text-5xl tabular-nums",
                hasCompleteScore(fixture.score) ? "text-white" : "text-text-secondary"
              )}>
                {hasCompleteScore(fixture.score)
                  ? `${fixture.score.home} - ${fixture.score.away}`
                  : t("common.vs")}
              </span>
            </div>

            {matchResult.summary && (
              <div
                className={cn(
                  "mt-3 inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-center text-xs font-black shadow-[0_0_20px_rgba(250,204,21,0.12)]",
                  matchResult.summary.kind === "winner"
                    ? "border-amber-300/35 bg-amber-300/10 text-amber-100"
                    : "border-white/15 bg-white/[0.04] text-gray-200"
                )}
              >
                {matchResult.summary.kind === "winner" && (
                  <Trophy size={14} className="shrink-0 text-amber-300" aria-hidden="true" />
                )}
                <span className="min-w-0 truncate">
                  {matchResult.summary.kind === "winner"
                    ? t("matchDetail.winnerSummary", {
                        team: matchResult.summary.team,
                        score: matchResult.summary.score,
                      })
                    : t("matchDetail.drawSummary", {
                        score: matchResult.summary.score,
                      })}
                </span>
              </div>
            )}
            
            {(hasCompleteScore(scoreBreakdown.halftime) || hasCompleteScore(scoreBreakdown.penalty)) && (
              <div className="mt-2.5 flex flex-col gap-0.5 text-[11px] font-bold text-text-muted font-mono tracking-widest uppercase">
                {hasCompleteScore(scoreBreakdown.halftime) && (
                  <span>HT {scoreBreakdown.halftime.home} : {scoreBreakdown.halftime.away}</span>
                )}
                {hasCompleteScore(scoreBreakdown.penalty) && (
                  <span className="text-warning font-black">PEN {scoreBreakdown.penalty.home} : {scoreBreakdown.penalty.away}</span>
                )}
              </div>
            )}
            
            <div className="mt-3 flex max-w-[180px] items-center justify-center gap-1.5 font-mono text-[11px] font-bold leading-tight text-gray-400 tracking-wide sm:max-w-none">
              <Clock size={12} className="text-primary shrink-0" />
              <span>{formatFixtureDateTime(fixture.kickoffTime, locale)}</span>
            </div>
            
            {fixture.status === MatchStatus.LIVE && fixture.elapsed !== null && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 font-mono text-[11px] font-black text-success shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-[livePulse_1.5s_infinite]" />
                <span>{fixture.elapsed}{fixture.statusExtra ? `+${fixture.statusExtra}` : ""}&apos;</span>
              </div>
            )}
            
            {fixture.status === MatchStatus.LIVE && (
              <div className="mt-2.5">
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
            resultState={matchResult.away}
            winnerLabel={t("matchDetail.winnerLabel")}
          />
        </div>
        
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            id="btn-ai-insight-match"
            href={`/${locale}/ai-insight/${fixture.apiFixtureId ?? fixture.id}`}
            className="w-full sm:w-auto"
          >
            <Button variant="primary" size="md" className="w-full sm:w-auto font-display font-extrabold uppercase tracking-widest transition-all duration-150">
              <Brain size={16} className="mr-2 inline-block align-[-2px]" aria-hidden="true" />
              {t("predictionForm.matchLinks.aiInsight")}
            </Button>
          </Link>
          {fixture.status === MatchStatus.UPCOMING && isLoggedIn && new Date(fixture.kickoffTime) > new Date() && (
            <Link
              id="btn-predict-match"
              href={buildPredictMatchHref(
                locale,
                buildFixtureSeoSlug(fixture),
                fixture.home.apiTeamId ?? fixture.home.id,
                fixture.away.apiTeamId ?? fixture.away.id
              )}
              className="w-full sm:w-auto"
            >
              <Button variant="gold" size="md" className="w-full sm:w-auto font-display font-extrabold uppercase tracking-widest transition-all duration-150 hover:bg-gold-dim">
                {t("prediction.predictScore")}
              </Button>
            </Link>
          )}
        </div>
        </div>
      </Card>

      <MatchTabsClient
        eventCount={events.length}
        labels={{
          overview: t("matchDetail.overview"),
          stats: t("matchDetail.stats"),
          lineups: t("matchDetail.lineups"),
          timeline: t("matchDetail.events"),
        }}
        overviewTab={
          <>
            <MatchContextPanel
              fixture={fixture}
              fetchedAt={fetchedAt}
              locale={locale}
              labels={{
                title: t("matchDetail.matchInfo"),
                referee: t("matchDetail.referee"),
                venue: t("matchDetail.venue"),
                firstPeriod: t("matchDetail.firstPeriod"),
                secondPeriod: t("matchDetail.secondPeriod"),
                lastUpdated: t("matchDetail.lastUpdated"),
                unavailable: t("matchDetail.unavailable"),
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
              eventLabels={buildEventLabels(t)}
              labels={{
                title: t("matchDetail.firstScorer"),
                empty: t("matchDetail.noEventData"),
                highlight: t("matchDetail.goalHighlight"),
                minute: t("matchDetail.goalMinute"),
                assist: t("matchDetail.goalAssist"),
                type: t("matchDetail.goalType"),
                detail: t("matchDetail.goalDetail"),
                comments: t("matchDetail.goalComments"),
              }}
            />

            <div className="grid gap-4 lg:grid-cols-2">
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
                locale={locale}
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
                  lastUpdated: t("matchDetail.lastUpdated"),
                }}
              />
            </div>
          </>
        }
        statsTab={
          <>
            <TeamStatsPanel
              statistics={statistics}
              title={t("matchDetail.teamStatistics")}
              emptyLabel={t("matchDetail.noTeamStatistics")}
              labels={buildTeamStatLabels(t)}
            />

            {teamStatistics && (
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
                  failedToScore: t("matchDetail.failedToScore"),
                  avgGoalsFor: t("matchDetail.avgGoalsFor"),
                  avgGoalsAgainst: t("matchDetail.avgGoalsAgainst"),
                  penaltyScored: t("matchDetail.penaltyScored"),
                  penaltyMissed: t("matchDetail.penaltyMissed"),
                  biggestStreak: t("matchDetail.biggestStreak"),
                  formations: t("matchDetail.formations"),
                  yellowCardBuckets: t("matchDetail.yellowCardBuckets"),
                  redCardBuckets: t("matchDetail.redCardBuckets"),
                  streakWins: t("matchDetail.streakWins"),
                  streakDraws: t("matchDetail.streakDraws"),
                  streakLosses: t("matchDetail.streakLosses"),
                }}
              />
            )}
          </>
        }
        lineupsTab={
          <>
            <LineupsPanel
              lineups={lineups}
              locale={locale}
              season={season}
              labels={{
                empty: t("matchDetail.noLineupData"),
                coach: t("matchDetail.coach"),
                unavailable: t("matchDetail.unavailable"),
                startingXI: t("matchDetail.startingXI"),
                substitutes: t("matchDetail.substitutes"),
                formationPitch: t("matchDetail.formationPitch"),
                noGridData: t("matchDetail.noGridData"),
                captain: t("matchDetail.captain"),
              }}
              playerStats={playerStats}
            />

            {hasPlayerStats ? (
              <FixturePlayerStatsPanel
                playerStats={playerStats}
                locale={locale}
                season={season}
                labels={{
                  title: t("football.squadTitle"),
                  unavailable: t("football.unavailableValue"),
                  jerseyNumber: t("football.jerseyNumber"),
                  minutes: t("football.totalMinutes"),
                  rating: t("football.averageRating"),
                  goalsAssists: t("football.goalsAssists"),
                  shots: t("matchDetail.shots"),
                  passAccuracy: t("football.passAccuracy"),
                  cards: t("football.cardsRecord"),
                  substitute: t("matchDetail.substitutes"),
                }}
              />
            ) : teamSquads && (
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
            )}
          </>
        }
        timelineTab={
          <EventsPanel
            events={events}
            title={t("matchDetail.matchEvents")}
            emptyLabel={t("matchDetail.noEventData")}
            relatedLabel={t("matchDetail.relatedPlayer")}
            labels={buildEventLabels(t)}
          />
        }
      />

      {showJsonBox && (
        <div className="mt-4">
          <JsonBox
            title={`GET /fixtures/${apiFixtureId}`}
            value={{
              rawPayload,
              normalized: {
                fetchedAt,
                fixture,
                events,
                lineups,
                statistics,
                playerStats,
                teamStatistics,
                teamSquads,
                headToHead,
                standings,
                scoreBreakdown,
              },
            }}
          />
        </div>
      )}

      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SportsEvent",
                "@id": `${SITE_URL}/${locale}/matches/detail/${matchId}#event`,
                "name": `${fixture.home.name} vs ${fixture.away.name}`,
                "description": `${fixture.home.name} vs ${fixture.away.name} in ${fixture.league.name}. Status: ${fixture.statusLong}.`,
                "startDate": fixture.kickoffTime,
                "sport": "https://en.wikipedia.org/wiki/Association_football",
                "eventStatus": mapStatusToSchemaOrg(fixture.status),
                "homeTeam": {
                  "@type": "SportsTeam",
                  "name": fixture.home.name,
                  "logo": fixture.home.logo,
                },
                "awayTeam": {
                  "@type": "SportsTeam",
                  "name": fixture.away.name,
                  "logo": fixture.away.logo,
                },
                "location": {
                  "@type": "Place",
                  "name": fixture.venue || "TBD",
                },
                "superEvent": {
                  "@type": "SportsEvent",
                  "name": fixture.league.name,
                  "sport": "https://en.wikipedia.org/wiki/Association_football",
                },
                ...(hasCompleteScore(fixture.score) ? {
                  "result": {
                    "@type": "Score",
                    "value": `${fixture.score.home}-${fixture.score.away}`
                  }
                } : {})
              },
              {
                "@type": "BreadcrumbList",
                "@id": `${SITE_URL}/${locale}/matches/detail/${matchId}#breadcrumb`,
                "itemListElement": [
                  {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": `${SITE_URL}/${locale}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Matches",
                    "item": `${SITE_URL}/${locale}/matches`
                  },
                  {
                    "@type": "ListItem",
                    "position": 3,
                    "name": fixture.league.name,
                    "item": `${SITE_URL}/${locale}/football/leagues/${fixture.league.apiLeagueId ?? fixture.league.id}`
                  },
                  {
                    "@type": "ListItem",
                    "position": 4,
                    "name": `${fixture.home.name} vs ${fixture.away.name}`,
                    "item": `${SITE_URL}/${locale}/matches/detail/${matchId}`
                  }
                ]
              }
            ]
          })
        }}
      />
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
  eventLabels,
  labels,
}: {
  event: ApiFootballEvent | null;
  eventLabels: EventLabels;
  labels: {
    title: string;
    empty: string;
    highlight: string;
    minute: string;
    assist: string;
    type: string;
    detail: string;
    comments: string;
  };
}) {
  return (
    <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
      <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-success">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
          <ShieldCheck size={16} className="shrink-0 text-success" aria-hidden="true" />
          <span className="min-w-0 truncate">{labels.title}</span>
        </h2>
      </div>
      {!event ? (
        <div className="p-4">
          <EmptyDetail label={labels.empty} />
        </div>
      ) : (
        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <div className="overflow-hidden rounded-xl border border-success/20 bg-success/5 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[9px] font-extrabold uppercase tracking-[0.24em] text-success">
                  {labels.highlight}
                </p>
                <h3 className="mt-2 font-display truncate text-2xl font-black text-white sm:text-3xl tracking-wide">
                  {event.player.name ?? event.team.name}
                </h3>
                <div className="mt-4 flex min-w-0 items-center gap-3">
                  <ApiTeamLogo name={event.team.name} logo={event.team.logo} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{event.team.name}</p>
                    <p className="truncate text-xs text-gray-400 font-medium">
                      {translateEventDetail(event.detail, eventLabels)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-center">
                <p className="font-mono text-[9px] uppercase tracking-widest text-success">{labels.minute}</p>
                <p className="mt-1 font-mono text-2xl font-black text-success">
                  {event.time.elapsed}{event.time.extra ? `+${event.time.extra}` : ""}&apos;
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <FirstScorerMeta label={labels.assist} value={event.assist.name ?? "-"} />
              <FirstScorerMeta label={labels.type} value={translateEventType(event.type, eventLabels)} />
            </div>
          </div>
          <div className="grid gap-3">
            <FirstScorerMeta label={labels.detail} value={translateEventDetail(event.detail, eventLabels)} />
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
    <div className="rounded-xl border border-border bg-elevated/40 px-3 py-3">
      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-semibold text-text-secondary", multiline ? "break-words" : "truncate")}>
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
    referee: string;
    venue: string;
    firstPeriod: string;
    secondPeriod: string;
    lastUpdated: string;
    unavailable: string;
  };
}) {
  const items = [
    {
      icon: User,
      label: labels.referee,
      value: fixture.referee ?? labels.unavailable,
      tone: "text-purple-400",
    },
    {
      icon: MapPin,
      label: labels.venue,
      value: fixture.venue || labels.unavailable,
      tone: "text-magenta",
    },
    {
      icon: Clock,
      label: labels.firstPeriod,
      value: formatUnixTimestamp(fixture.periods.first, labels.unavailable, locale),
      tone: "text-primary",
      visible: Boolean(fixture.periods.first),
    },
    {
      icon: Clock,
      label: labels.secondPeriod,
      value: formatUnixTimestamp(fixture.periods.second, labels.unavailable, locale),
      tone: "text-text-muted",
      visible: Boolean(fixture.periods.second),
    },
    {
      icon: Radio,
      label: labels.lastUpdated,
      value: formatFixtureDateTime(fetchedAt, locale),
      tone: "text-success",
    },
  ].filter((item) => item.visible !== false);

  return (
    <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
      <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-primary">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
          <Radio size={16} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 truncate">{labels.title}</span>
        </h2>
      </div>
      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ icon: Icon, label, value, tone }) => (
          <div key={label} className="min-w-0 bg-surface px-4 py-3.5 hover:bg-elevated transition-colors duration-150">
            <div className="mb-1.5 flex items-center gap-2">
              <Icon size={14} className={cn("shrink-0 rounded-full", tone)} aria-hidden="true" />
              <span className="min-w-0 truncate text-[9px] font-extrabold uppercase tracking-wider text-gray-500 font-display">
                {label}
              </span>
            </div>
            <p className="break-words text-xs font-bold text-white font-mono">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
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
    <div className="mx-auto w-full max-w-6xl space-y-5 px-4 pb-12 sm:px-0">
      <Link
        id="btn-back-to-matches"
        href={`/${locale}/matches`}
        className="group inline-flex items-center gap-2 rounded-lg border border-border bg-elevated/40 px-3.5 py-2 text-xs font-bold tracking-wider text-text-secondary uppercase transition-all duration-150 hover:border-primary/40 hover:bg-elevated/80 hover:text-white"
      >
        <ArrowLeft size={14} className="transition-transform duration-150 group-hover:-translate-x-1" />
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

type HeroTeamResultState = "winner" | "loser" | "draw" | null;

function getMatchResultState(fixture: ApiFootballFixture): {
  home: HeroTeamResultState;
  away: HeroTeamResultState;
  summary:
    | { kind: "winner"; team: string; score: string }
    | { kind: "draw"; score: string }
    | null;
} {
  if (fixture.status !== MatchStatus.FINISHED || !hasCompleteScore(fixture.score)) {
    return { home: null, away: null, summary: null };
  }

  const scoreHome = fixture.score.home ?? 0;
  const scoreAway = fixture.score.away ?? 0;
  const score = `${scoreHome}-${scoreAway}`;
  const homeWon =
    fixture.home.winner === true ||
    (fixture.home.winner === null &&
      fixture.away.winner === null &&
      scoreHome > scoreAway);
  const awayWon =
    fixture.away.winner === true ||
    (fixture.home.winner === null &&
      fixture.away.winner === null &&
      scoreAway > scoreHome);

  if (homeWon) {
    return {
      home: "winner",
      away: "loser",
      summary: { kind: "winner", team: fixture.home.name, score },
    };
  }

  if (awayWon) {
    return {
      home: "loser",
      away: "winner",
      summary: { kind: "winner", team: fixture.away.name, score },
    };
  }

  return {
    home: "draw",
    away: "draw",
    summary: { kind: "draw", score },
  };
}

function TeamHeader({
  name,
  logo,
  href,
  accent,
  lineup,
  align = "left",
  resultState = null,
  winnerLabel,
}: {
  name: string;
  logo: string | null;
  href?: string;
  accent: "cyan" | "magenta";
  lineup?: ApiFootballLineup;
  align?: "left" | "right";
  resultState?: HeroTeamResultState;
  winnerLabel?: string;
}) {
  const isWinner = resultState === "winner";
  const isLoser = resultState === "loser";
  const content = (
    <div
      className={cn(
        "group flex min-w-0 flex-col items-center gap-2.5 transition-all duration-150 sm:gap-3.5",
        align === "right" ? "sm:flex-row-reverse sm:text-right" : "sm:flex-row sm:text-left",
        isLoser && "opacity-70"
      )}
    >
      {/* Esports Crest */}
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-20 sm:w-20">
        {/* Hexagonal cyber crest */}
        <div
          className={cn(
            "relative flex h-full w-full items-center justify-center border bg-surface p-2 transition-all duration-150 group-hover:scale-105",
            isWinner
              ? "border-amber-300/70 text-amber-200 shadow-[0_0_30px_rgba(250,204,21,0.32)]"
              : accent === "cyan"
                ? "border-primary/30 text-primary group-hover:border-primary"
                : "border-magenta/30 text-magenta group-hover:border-magenta"
          )}
          style={{
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
          }}
        >
          {isWinner && (
            <span className="absolute -top-1 left-1/2 z-20 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-amber-200/50 bg-amber-300 text-black shadow-[0_0_18px_rgba(250,204,21,0.4)]">
              <Trophy size={13} strokeWidth={2.6} aria-hidden="true" />
            </span>
          )}
          {/* Logo container */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-elevated/40 p-1 border border-border sm:h-12 sm:w-12">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={name}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="font-mono text-xs font-black text-white">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {isWinner && winnerLabel ? (
          <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-amber-300/35 bg-amber-300/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-amber-200">
            <Trophy size={10} aria-hidden="true" />
            {winnerLabel}
          </span>
        ) : null}
        <h2 className={cn(
          "font-display max-w-full truncate text-[13px] font-extrabold tracking-wider uppercase sm:text-base md:text-lg",
          isWinner ? "text-amber-100 drop-shadow-[0_0_12px_rgba(250,204,21,0.35)]" : "text-gray-300 group-hover:text-primary"
        )}>
          {name}
        </h2>
        {lineup?.formation ? (
          <span className="mt-1 inline-block rounded-md border border-border bg-elevated/40 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-text-muted uppercase">
            {lineup.formation}
          </span>
        ) : (
          <span className="mt-1 inline-block rounded-md border border-border bg-elevated/40 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-text-muted uppercase opacity-0 sm:opacity-100">
            ROSTER
          </span>
        )}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link id={`link-team-${accent}`} href={href} className="min-w-0 block">
      {content}
    </Link>
  );
}

function PersonAvatar({
  name,
  photo,
  size,
  fallback,
}: {
  name: string;
  photo: string | null;
  size: "xs" | "sm";
  fallback?: string;
}) {
  const dimension = size === "xs" ? "h-5 w-5" : "h-7 w-7";
  const textSize = size === "xs" ? "text-[9px]" : "text-[10px]";

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border border-border bg-[#0a0a0f]",
        dimension
      )}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className={cn("font-mono font-bold text-gray-400", textSize)}>
          {fallback ?? name.slice(0, 1).toUpperCase()}
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
    <Card className="border border-border bg-surface p-5 shadow-xl">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <ClipboardList size={16} className="shrink-0 text-warning" aria-hidden="true" />
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
                className={`grid grid-cols-[42px_38px_minmax(0,1fr)] items-center gap-2 rounded-xl border px-2.5 py-2.5 sm:grid-cols-[52px_44px_minmax(0,1fr)_136px] sm:gap-3 sm:px-3 ${style.rowClass}`}
              >
                <span className="font-mono text-xs text-primary">
                  {event.time.elapsed}
                  {event.time.extra ? `+${event.time.extra}` : ""}&apos;
                </span>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-[15px] font-black shadow-[0_0_18px_rgba(255,255,255,0.06)] sm:h-10 sm:w-10 ${style.iconClass}`}
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
      icon: <CardEventIcon tone="red" />,
      rowClass: "border-danger/20 bg-danger/10 hover:border-danger/40 hover:bg-danger/20 transition-all duration-150",
      iconClass: "border-danger/35 bg-danger/10 text-danger",
      badgeClass: "border-danger/25 bg-danger/10 text-danger",
    };
  }

  if (normalized.includes("yellow card")) {
    return {
      label: labels.yellowCard,
      icon: <CardEventIcon tone="yellow" />,
      rowClass: "border-warning/20 bg-warning/10 hover:border-warning/40 hover:bg-warning/20 transition-all duration-150",
      iconClass: "border-warning/35 bg-warning/10 text-warning",
      badgeClass: "border-warning/25 bg-warning/10 text-warning",
    };
  }

  if (type === "Goal") {
    return {
      label: labels.goal,
      icon: <GoalEventIcon />,
      rowClass:
        "border-success/45 bg-[linear-gradient(90deg,rgba(34,197,94,0.18),rgba(250,204,21,0.08),rgba(34,197,94,0.06))] shadow-[0_0_28px_rgba(34,197,94,0.18),inset_3px_0_0_rgba(34,197,94,0.95)] hover:border-success/70 hover:bg-success/20 transition-all duration-150",
      iconClass: "border-success/55 bg-success/15 text-success shadow-[0_0_24px_rgba(34,197,94,0.28)]",
      badgeClass: "border-success/45 bg-success/20 text-success shadow-[0_0_16px_rgba(34,197,94,0.18)]",
    };
  }

  if (normalized.includes("substitution")) {
    return {
      label: labels.substitution,
      icon: <ArrowLeftRight size={18} strokeWidth={2.5} aria-hidden="true" />,
      rowClass: "border-primary/20 bg-primary/10 hover:border-primary/40 hover:bg-primary/20 transition-all duration-150",
      iconClass: "border-primary/40 bg-primary/15 text-primary",
      badgeClass: "border-primary/25 bg-primary/10 text-primary",
    };
  }

  if (type.toLowerCase() === "var" || normalized.includes("var")) {
    return {
      label: labels.var,
      icon: <MonitorCheck size={18} strokeWidth={2.5} aria-hidden="true" />,
      rowClass: "border-purple-400/20 bg-purple-400/10 hover:border-purple-400/40 hover:bg-purple-400/20 transition-all duration-150",
      iconClass: "border-purple-400/40 bg-purple-400/15 text-purple-300",
      badgeClass: "border-purple-400/25 bg-purple-400/10 text-purple-300",
    };
  }

  return {
    label: translateEventType(type, labels),
    icon: "•",
    rowClass: "border-border bg-surface hover:border-border/80 hover:bg-elevated/40 transition-all duration-150",
    iconClass: "border-border bg-elevated text-text-secondary font-bold",
    badgeClass: "border-border bg-elevated text-text-secondary",
  };
}

function GoalEventIcon() {
  return (
    <span className="relative grid h-8 w-8 place-items-center" aria-hidden="true">
      <span className="absolute inset-0 rounded-full border border-success/50 bg-success/10 animate-[livePulse_1.6s_infinite]" />
      <span className="relative text-[24px] leading-none drop-shadow-[0_0_8px_rgba(34,197,94,0.75)]">
        ⚽
      </span>
    </span>
  );
}

function CardEventIcon({ tone }: { tone: "yellow" | "red" }) {
  return (
    <span
      className={cn(
        "block h-6 w-4 rotate-6 rounded-[3px] border shadow-[0_0_14px_currentColor]",
        tone === "yellow"
          ? "border-yellow-200 bg-yellow-300 text-yellow-300"
          : "border-red-200 bg-red-500 text-red-500"
      )}
      aria-hidden="true"
    />
  );
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
  if (normalized.includes("var")) return labels.var;
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
  const rows = buildTeamStatRows(homeStats, awayStats);

  return (
    <Card className="overflow-hidden border border-cyan-300/12 bg-[#0b0f18] p-0 shadow-xl">
      <div className="border-b border-white/10 bg-[#0f1320] px-3 py-4 sm:px-4">
        <div className="flex items-center gap-2 text-left">
          <Table2 size={18} className="shrink-0 text-cyan-300" aria-hidden="true" />
          <span className="min-w-0 truncate text-base font-black text-white font-display sm:text-sm sm:uppercase sm:tracking-wider">{title}</span>
        </div>
        {homeStats && awayStats ? (
          <div className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 rounded-2xl border border-white/10 bg-black/22 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] sm:px-3">
            <TeamMiniLabel team={homeStats.team} tone="cyan" align="left" />
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 px-2 text-center font-mono text-xs font-black uppercase tracking-wider text-white sm:h-11 sm:min-w-11">
              vs
            </span>
            <TeamMiniLabel team={awayStats.team} tone="magenta" align="right" />
          </div>
        ) : null}
      </div>
      {!homeStats || !awayStats || rows.length === 0 ? (
        <div className="p-4">
          <EmptyDetail label={emptyLabel} />
        </div>
      ) : (
        <div className="grid gap-3 p-3 sm:p-4 xl:grid-cols-2">
          {rows.map((row) => {
            const visual = getStatVisual(rowDominance(row.homePercent, row.awayPercent));

            return (
              <div
                key={row.type}
                className="rounded-xl border border-white/10 bg-[#10131d] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-all duration-150 hover:border-cyan-300/20 hover:bg-[#121827]"
              >
                <div className="mb-3 grid grid-cols-[64px_minmax(0,1fr)_64px] items-center gap-2 sm:grid-cols-[76px_minmax(0,1fr)_76px]">
                  <span className="truncate font-mono text-base font-black text-cyan-200 sm:text-lg">
                    {row.homeDisplay}
                  </span>
                  <span className="min-w-0 truncate px-1 text-center text-[12px] font-black uppercase tracking-wide text-gray-100 font-display sm:text-[13px]">
                    {translateTeamStat(row.type, labels)}
                  </span>
                  <span className="truncate text-right font-mono text-base font-black text-rose-300 sm:text-lg">
                    {row.awayDisplay}
                  </span>
                </div>
                <div className="h-3.5 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
                  <div className="flex h-full w-full gap-0.5 p-0.5">
                    <div
                      className={cn("h-full rounded-l-full", visual.home)}
                      style={{ width: `${row.homePercent}%` }}
                    />
                    <div
                      className={cn("h-full rounded-r-full", visual.away)}
                      style={{ width: `${row.awayPercent}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between font-mono text-xs font-black tracking-wide">
                  <span className="text-cyan-200/80">{row.homePercent}%</span>
                  <span className="text-rose-200/80">{row.awayPercent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function TeamMiniLabel({
  team,
  tone,
  align = "left",
}: {
  team: ApiFootballTeamStatistics["team"];
  tone: "cyan" | "magenta";
  align?: "left" | "right";
}) {
  const logo = <ApiTeamLogo name={team.name} logo={team.logo} size="sm" accent={tone} />;
  const name = (
    <span className="min-w-0 max-w-full truncate text-sm font-bold text-gray-100 sm:text-base">
      {team.name}
    </span>
  );

  return (
    <span
      className={cn(
        "flex min-w-0 items-center gap-2 px-1 py-1",
        align === "right" ? "justify-end text-right" : "justify-start text-left"
      )}
    >
      {align === "left" ? (
        <>
          {logo}
          {name}
        </>
      ) : (
        <>
          {name}
          {logo}
        </>
      )}
    </span>
  );
}

function rowDominance(homePercent: number, awayPercent: number) {
  if (homePercent === awayPercent) return "balanced";
  return homePercent > awayPercent ? "home" : "away";
}

function getStatVisual(dominance: "home" | "away" | "balanced") {
  if (dominance === "home") {
    return {
      home: "bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(34,211,238,0.28)]",
      away: "bg-gradient-to-r from-rose-500/70 to-fuchsia-400/70",
    };
  }

  if (dominance === "away") {
    return {
      home: "bg-gradient-to-r from-cyan-500/70 to-sky-300/70",
      away: "bg-gradient-to-r from-rose-400 to-fuchsia-300 shadow-[0_0_12px_rgba(244,63,94,0.28)]",
    };
  }

  return {
    home: "bg-gradient-to-r from-cyan-400 to-sky-300",
    away: "bg-gradient-to-r from-rose-400 to-fuchsia-300",
  };
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
    failedToScore: string;
    avgGoalsFor: string;
    avgGoalsAgainst: string;
    penaltyScored: string;
    penaltyMissed: string;
    biggestStreak: string;
    formations: string;
    yellowCardBuckets: string;
    redCardBuckets: string;
    streakWins: string;
    streakDraws: string;
    streakLosses: string;
  };
}) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-success">
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
            [labels.failedToScore, stats.failed_to_score.total],
            [labels.avgGoalsFor, stats.goals.for.average.total],
            [labels.avgGoalsAgainst, stats.goals.against.average.total],
            [labels.penaltyScored, formatPenaltyStat(stats.penalty?.scored)],
            [labels.penaltyMissed, formatPenaltyStat(stats.penalty?.missed)],
          ] as const;
          const streak = stats.biggest?.streak;
          const lineups = stats.lineups ?? [];

          return (
            <Card key={stats.team?.id ?? index} className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
              <div className={cn("flex items-center gap-3 border-b border-border p-4", index === 0 ? "bg-primary/10" : "bg-magenta/10")}>
                <ApiTeamLogo
                  name={stats.team?.name ?? labels.title}
                  logo={stats.team?.logo ?? null}
                  size="sm"
                  accent={index === 0 ? "cyan" : "magenta"}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{stats.team?.name}</p>
                  <p className="text-xs text-text-muted">{stats.form || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
                {metrics.map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-elevated/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
                    <p className="mt-1 font-mono text-lg font-bold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-2 border-t border-border p-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-elevated/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{labels.biggestStreak}</p>
                  <p className="mt-1 font-mono text-sm font-bold text-white">
                    {labels.streakWins} {streak?.wins ?? 0} / {labels.streakDraws} {streak?.draws ?? 0} / {labels.streakLosses} {streak?.loses ?? 0}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-elevated/40 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{labels.formations}</p>
                  <p className="mt-1 break-words font-mono text-sm font-bold text-white">
                    {lineups.length > 0
                      ? lineups.map((lineup) => `${lineup.formation ?? "-"} (${lineup.played ?? 0})`).join(", ")
                      : "-"}
                  </p>
                </div>
                <CardBucket title={labels.yellowCardBuckets} bucket={stats.cards?.yellow} />
                <CardBucket title={labels.redCardBuckets} bucket={stats.cards?.red} />
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function formatPenaltyStat(value: { total: number | null; percentage: string | null } | undefined) {
  if (!value) return "-";
  return `${value.total ?? 0} (${value.percentage ?? "0%"})`;
}

function CardBucket({
  title,
  bucket,
}: {
  title: string;
  bucket: Record<string, { total: number | null; percentage: string | null }> | undefined;
}) {
  const entries = Object.entries(bucket ?? {})
    .filter(([, value]) => value.total !== null)
    .sort(([left], [right]) => getBucketStartMinute(left) - getBucketStartMinute(right));

  return (
    <div className="rounded-lg border border-border bg-elevated/40 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{title}</p>
        {entries.length > 0 ? (
          <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5 font-mono text-[10px] font-black text-white">
            {entries.reduce((sum, [, value]) => sum + (value.total ?? 0), 0)}
          </span>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <p className="mt-1 font-mono text-sm font-bold text-white">-</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map(([minute, value]) => (
            <div
              key={minute}
              className="rounded-md border border-white/10 bg-black/25 px-2.5 py-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-black text-white">{minute}</span>
                <span className="font-mono text-sm font-black text-cyan-200">{value.total}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: value.percentage ?? "0%" }}
                />
              </div>
              <p className="mt-1 text-right font-mono text-[10px] font-bold text-gray-400">
                {value.percentage ?? "-"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getBucketStartMinute(bucket: string) {
  const parsed = Number.parseInt(bucket.split("-")[0] ?? "", 10);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

function FixturePlayerStatsPanel({
  playerStats,
  locale,
  season,
  labels,
}: {
  playerStats: ApiFootballPlayerStats[];
  locale: string;
  season: number;
  labels: {
    title: string;
    unavailable: string;
    jerseyNumber: string;
    minutes: string;
    rating: string;
    goalsAssists: string;
    shots: string;
    passAccuracy: string;
    cards: string;
    substitute: string;
  };
}) {
  const teams = playerStats.filter((teamStats) => (teamStats.players?.length ?? 0) > 0);

  if (teams.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
        {labels.title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {teams.map((teamStats, index) => (
          <Card
            key={teamStats.team.id || teamStats.team.name || index}
            className="overflow-hidden border border-cyan-300/12 bg-[#090d16] p-0 shadow-[0_18px_60px_rgba(0,0,0,0.34)]"
          >
            <div className={cn("flex items-center justify-between gap-3 border-b border-white/10 p-4", index === 0 ? "bg-cyan-400/10" : "bg-rose-500/10")}>
              <div className="flex min-w-0 items-center gap-3">
                <ApiTeamLogo
                  name={teamStats.team.name}
                  logo={teamStats.team.logo}
                  size="sm"
                  accent={index === 0 ? "cyan" : "magenta"}
                />
                <p className="truncate text-sm font-bold text-white">{teamStats.team.name}</p>
              </div>
              <Badge variant={index === 0 ? "cyan" : "magenta"}>{teamStats.players.length}</Badge>
            </div>
            <div className="divide-y divide-border">
              {teamStats.players.map((entry) => (
                <FixturePlayerStatsRow
                  key={entry.player.id || entry.player.name}
                  entry={entry}
                  locale={locale}
                  season={season}
                  labels={labels}
                />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

function FixturePlayerStatsRow({
  entry,
  locale,
  season,
  labels,
}: {
  entry: ApiFootballPlayerStats["players"][number];
  locale: string;
  season: number;
  labels: {
    unavailable: string;
    jerseyNumber: string;
    minutes: string;
    rating: string;
    goalsAssists: string;
    shots: string;
    passAccuracy: string;
    cards: string;
    substitute: string;
  };
}) {
  const stat = entry.statistics[0];
  const number = stat?.games.number ?? null;
  const position = stat?.games.position ?? labels.unavailable;
  const playerName = (
    <span className="block truncate text-sm font-bold text-white">
      {entry.player.name}
    </span>
  );
  const statItems = [
    [labels.minutes, formatPlayerStatValue(stat?.games?.minutes)],
    [labels.rating, formatPlayerStatValue(stat?.games?.rating)],
    [labels.goalsAssists, `${formatPlayerStatValue(stat?.goals?.total)}/${formatPlayerStatValue(stat?.goals?.assists)}`],
    [labels.shots, `${formatPlayerStatValue(stat?.shots?.on)}/${formatPlayerStatValue(stat?.shots?.total)}`],
    [labels.passAccuracy, formatPlayerStatValue(stat?.passes?.accuracy)],
    [labels.cards, `${formatPlayerStatValue(stat?.cards?.yellow)}/${formatPlayerStatValue(stat?.cards?.red)}`],
  ] as const;

  return (
    <div className="grid gap-3 px-4 py-3 transition-colors hover:bg-cyan-300/[0.05]">
      <div className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3">
        <span className="relative">
          <PersonAvatar
            name={entry.player.name}
            photo={entry.player.photo}
            size="sm"
            fallback={number != null ? String(number) : undefined}
          />
          <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-black bg-[#0a0a0f] px-1 font-mono text-[9px] font-black text-cyan-300">
            {number ?? "-"}
          </span>
        </span>
        <div className="min-w-0">
          {entry.player.id ? (
            <Link
              href={`/${locale}/football/players/${entry.player.id}?season=${season}`}
              className="block min-w-0 transition-colors hover:text-primary"
            >
              {playerName}
            </Link>
          ) : (
            playerName
          )}
          <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
            {labels.jerseyNumber}: {number ?? "-"} · {position}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {stat?.games.captain ? (
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-warning/25 bg-warning/10 px-1.5 font-mono text-[10px] font-black text-warning">
              C
            </span>
          ) : null}
          {stat?.games.substitute ? (
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 font-mono text-[10px] font-black text-cyan-200">
              {labels.substitute}
            </span>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {statItems.map(([label, value]) => (
          <div key={label} className="rounded-md border border-white/10 bg-black/25 px-2.5 py-2">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-1 font-mono text-sm font-black text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatPlayerStatValue(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
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
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-primary">
        {labels.title}
      </h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {[squads.home, squads.away].map((squad, index) => {
          if (!squad) return null;

          return (
            <Card key={squad.teamId ?? index} className="overflow-hidden border border-cyan-300/12 bg-[#090d16] p-0 shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
              <div className={cn("flex items-center justify-between gap-3 border-b border-white/10 p-4", index === 0 ? "bg-cyan-400/10" : "bg-rose-500/10")}>
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
              <div className="divide-y divide-border">
                {squad.players.map((player) => (
                  <Link
                    key={player.id || player.name}
                    href={`/${locale}/football/players/${player.id}?season=${season}`}
                    className="grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-cyan-300/[0.05]"
                  >
                    <span className="relative">
                      <PersonAvatar
                        name={player.name}
                        photo={player.photo}
                        size="sm"
                        fallback={player.number != null ? String(player.number) : undefined}
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border border-black bg-[#0a0a0f] px-1 font-mono text-[9px] font-black",
                          index === 0 ? "text-cyan-300" : "text-rose-300"
                        )}
                      >
                        {player.number ?? "-"}
                      </span>
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{player.name}</p>
                      <p className="mt-0.5 truncate text-xs font-medium text-gray-500">
                        {player.position ?? labels.unavailable}
                      </p>
                    </div>
                    <p className="shrink-0 text-right text-xs font-medium text-gray-600">
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
  const playerPhotos = buildPlayerPhotoMap(playerStats);

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
            <Card key={lineup.team.id} className="overflow-hidden border border-cyan-300/12 bg-[#090d16] p-0 shadow-[0_18px_60px_rgba(0,0,0,0.34)]">
              <div
                className={cn(
                  "flex items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-4",
                  index === 0
                    ? "bg-cyan-400/10"
                    : "bg-rose-500/10"
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
                      <p className="truncate text-xs font-medium text-gray-400">
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
                  playerPhotos={playerPhotos}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="min-w-0">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-300">
                      <ListChecks size={14} className="shrink-0 text-cyan-300" aria-hidden="true" />
                      <span className="min-w-0 truncate">{labels.startingXI}</span>
                    </h3>
                    <div className="grid gap-2">
                      {startingXI.map(({ player }) => (
                        <PlayerRow
                          key={`${player.id}-${player.number}`}
                          player={player}
                          photo={getPlayerPhoto(playerPhotos, player.id)}
                          locale={locale}
                          season={season}
                          isCaptain={isCaptainPlayer(player.id, captainIds)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-300">
                      <ListPlus size={14} className="shrink-0 text-green-300" aria-hidden="true" />
                      <span className="min-w-0 truncate">{labels.substitutes}</span>
                    </h3>
                    <div className="space-y-2">
                      {substitutes.map(({ player }) => (
                        <PlayerRow
                          key={`${player.id}-${player.number}`}
                          player={player}
                          photo={getPlayerPhoto(playerPhotos, player.id)}
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
  playerPhotos,
}: {
  lineup: ApiFootballLineup;
  title: string;
  emptyLabel: string;
  captainIds: Set<number>;
  captainLabel: string;
  playerPhotos: Map<number, string>;
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
      <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-border bg-bg/50 bg-[linear-gradient(rgba(30,31,41,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(30,31,41,0.25)_1px,transparent_1px)] bg-[size:16px_16px] sm:min-h-[360px]">
        {/* Concentric rings / HUD radar markings */}
        <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-transparent pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-transparent pointer-events-none flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
        </div>
        
        {/* Tactical penalty area boundaries */}
        <div className="absolute inset-x-12 top-0 h-16 rounded-b-xl border-x border-b border-border pointer-events-none" />
        <div className="absolute inset-x-12 bottom-0 h-16 rounded-t-xl border-x border-t border-border pointer-events-none" />

        {players.length === 0 ? (
          <div className="absolute inset-4 flex items-center justify-center rounded-lg border border-dashed border-border bg-surface px-4 text-center text-xs text-gray-500">
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
            const photo = getPlayerPhoto(playerPhotos, player.id);

            return (
              <div
                key={`${player.id}-${player.number}-${player.grid}`}
                className="absolute w-[58px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-[72px]"
                style={{ top: `${top}%`, left: `${left}%` }}
                title={`${player.number ?? "-"} ${player.name}${isCaptain ? ` (${captainLabel})` : ""}`}
              >
                <PitchPlayerAvatar
                  name={player.name}
                  number={player.number}
                  photo={photo}
                  accent={kit.primary}
                  isCaptain={isCaptain}
                  captainLabel={captainLabel}
                />
                <p className="mt-1.5 truncate rounded border border-border bg-surface/90 px-1 py-0.5 font-mono text-[8px] font-bold text-gray-300 sm:text-[9px] shadow-sm">
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

function PitchPlayerAvatar({
  name,
  number,
  photo,
  accent,
  isCaptain,
  captainLabel,
}: {
  name: string;
  number: number | null;
  photo: string | null;
  accent: string;
  isCaptain: boolean;
  captainLabel: string;
}) {
  return (
    <div className="relative mx-auto h-10 w-10 group/player sm:h-12 sm:w-12">
      <div className="absolute -inset-1 rounded-full opacity-40 blur-md" style={{ backgroundColor: accent }} />
      <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/15 bg-[#080d16] shadow-md transition-transform duration-150 group-hover/player:scale-110">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-mono text-xs font-black text-white">
            {number ?? "-"}
          </span>
        )}
      </div>
      <span className="absolute -bottom-1 left-1/2 flex h-4 min-w-5 -translate-x-1/2 items-center justify-center rounded-full border border-black/50 bg-white px-1 font-mono text-[9px] font-black text-black shadow">
        {number ?? "-"}
      </span>
      {isCaptain && (
        <span
          aria-label={captainLabel}
          title={captainLabel}
          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border border-warning bg-warning px-1 font-mono text-[8px] font-black text-black shadow-sm"
        >
          C
        </span>
      )}
    </div>
  );
}

function PlayerRow({
  player,
  photo,
  locale,
  season,
  compact = false,
  isCaptain = false,
}: {
  player: ApiFootballLineup["startXI"][number]["player"];
  photo: string | null;
  locale: string;
  season: number;
  compact?: boolean;
  isCaptain?: boolean;
}) {
  const name = (
    <span className={cn("truncate font-bold text-white", compact ? "text-sm" : "text-sm")}>
      {player.name}
    </span>
  );

  return (
    <div className="grid grid-cols-[42px_minmax(0,1fr)_44px] items-center gap-2 rounded-lg border border-white/10 bg-[#0f1320] px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:border-cyan-300/25 hover:bg-[#121827] sm:grid-cols-[46px_minmax(0,1fr)_48px]">
      <PersonAvatar
        name={player.name}
        photo={photo}
        size={compact ? "sm" : "sm"}
        fallback={player.number != null ? String(player.number) : undefined}
      />
      <div className="min-w-0">
        {player.id ? (
          <Link
            href={`/${locale}/football/players/${player.id}?season=${season}`}
            className="block min-w-0 transition-colors hover:text-primary"
          >
            {name}
          </Link>
        ) : (
          name
        )}
        <span className="mt-0.5 block truncate font-mono text-[11px] font-semibold text-gray-500">
          #{player.number ?? "-"}
        </span>
      </div>
      <span className="flex items-center justify-end gap-1 text-right text-[10px] text-gray-500">
        {isCaptain && (
          <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full border border-warning/20 bg-warning/10 px-1 font-mono text-[9px] font-bold text-warning">
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

function normalizeHexColor(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const hex = value.trim().replace(/^#/, "");
  return /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : fallback;
}

function buildPlayerPhotoMap(playerStats: ApiFootballPlayerStats[]) {
  const photos = new Map<number, string>();

  for (const teamStats of playerStats) {
    for (const item of teamStats.players ?? []) {
      if (item.player.id && item.player.photo) {
        photos.set(item.player.id, item.player.photo);
      }
    }
  }

  return photos;
}

function getPlayerPhoto(photos: Map<number, string>, playerId: number | null) {
  return playerId ? photos.get(playerId) ?? null : null;
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
  const hasHT = hasCompleteScore(scoreBreakdown.halftime);
  const hasFT = hasCompleteScore(scoreBreakdown.fulltime);
  const hasET = hasCompleteScore(scoreBreakdown.extratime);
  const hasPEN = hasCompleteScore(scoreBreakdown.penalty);

  if (isUpcoming || (!hasHT && !hasFT && !hasET && !hasPEN)) return null;

  const periods: { label: string; home: number | null; away: number | null; accent: string; textAccent: string }[] = [];

  if (hasHT) periods.push({ label: "HT", home: scoreBreakdown.halftime.home, away: scoreBreakdown.halftime.away, accent: "border-primary/25 bg-primary/5", textAccent: "text-primary border-primary/30" });
  if (hasFT) periods.push({ label: "FT", home: scoreBreakdown.fulltime.home, away: scoreBreakdown.fulltime.away, accent: "border-success/25 bg-success/5", textAccent: "text-success border-success/30" });
  if (hasET) periods.push({ label: "ET", home: scoreBreakdown.extratime.home, away: scoreBreakdown.extratime.away, accent: "border-warning/25 bg-warning/5", textAccent: "text-warning border-warning/30" });
  if (hasPEN) periods.push({ label: "PEN", home: scoreBreakdown.penalty.home, away: scoreBreakdown.penalty.away, accent: "border-magenta/25 bg-magenta/5", textAccent: "text-magenta border-magenta/30" });

  return (
    <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
      <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-primary">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
          <Clock size={16} className="shrink-0 text-primary" aria-hidden="true" />
          <span>{title}</span>
          <span className="ml-auto font-mono text-[9px] font-bold text-gray-500 uppercase tracking-widest">{status}</span>
        </h2>
      </div>
      <div className="p-4">
        <div className="mb-3 hidden grid-cols-[1fr_72px_1fr] items-center gap-3 sm:grid text-xs font-bold text-gray-500 font-display uppercase tracking-wider">
          <span className="truncate text-cyan-400">{homeName}</span>
          <span className="w-18 text-center">ROUND</span>
          <span className="truncate text-right text-magenta">{awayName}</span>
        </div>
        <div className="space-y-2">
          {periods.map(({ label, home, away, accent, textAccent }) => (
            <div
              key={label}
              className={cn("grid grid-cols-[1fr_72px_1fr] items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-all duration-150", accent)}
            >
              <span className="font-mono text-xl font-black text-primary sm:text-2xl">
                {home ?? "-"}
              </span>
              <span className={cn("text-center font-mono text-[10px] font-extrabold uppercase tracking-widest rounded-md border bg-bg/60 py-1 px-2", textAccent)}>
                {label}
              </span>
              <span className="text-right font-mono text-xl font-black text-magenta sm:text-2xl">
                {away ?? "-"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function hasCompleteScore(score: { home: number | null; away: number | null }) {
  return score.home !== null && score.away !== null;
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
      <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
        <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-primary">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
            <History size={16} className="shrink-0 text-primary" aria-hidden="true" />
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
    <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
      <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-primary">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
          <History size={16} className="shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0 truncate">{title}</span>
          <span className="ml-auto shrink-0 rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold text-primary">
            {fixtures.length}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-bg/50">
        {[
          { label: labels.win, value: wins, color: "text-success", bg: "bg-success/5 hover:bg-success/10 transition-colors duration-150" },
          { label: labels.draw, value: draws, color: "text-warning", bg: "bg-warning/5 hover:bg-warning/10 transition-colors duration-150" },
          { label: labels.loss, value: losses, color: "text-danger", bg: "bg-danger/5 hover:bg-danger/10 transition-colors duration-150" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={cn("flex flex-col items-center py-3 duration-150", bg)}>
            <span className={cn("font-display text-2xl font-black tracking-tight", color)}>{value}</span>
            <span className="font-display text-[9px] font-extrabold uppercase tracking-widest text-text-muted mt-0.5">{label}</span>
          </div>
        ))}
      </div>

      <div className="divide-y divide-border">
        {fixtures.map((match) => {
          const isHomeTeamHome = homeTeamId !== null && match.home.id === homeTeamId;
          const hg = match.goals.home, ag = match.goals.away;
          const htH = match.score.halftime.home, htA = match.score.halftime.away;
          const hasHT = htH !== null && htA !== null;

          let resultChar = "D";
          let resultStyle = "border-warning/20 bg-warning/10 text-warning";
          if (hg !== null && ag !== null && hg !== ag) {
            const weWon = isHomeTeamHome ? hg > ag : ag > hg;
            resultChar = weWon ? "W" : "L";
            resultStyle = weWon
              ? "border-success/20 bg-success/10 text-success"
              : "border-danger/20 bg-danger/10 text-danger";
          }

          const dateStr = match.date
            ? new Date(match.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
            : "";

          return (
            <div key={match.fixtureId} className="px-4 py-3 hover:bg-elevated/40 transition-colors duration-150">
              <div className="mb-2 flex items-center justify-between gap-1.5">
                <span className="font-mono text-[9px] font-bold text-gray-600">{dateStr}</span>
                <span className="min-w-0 truncate text-center font-mono text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                  {match.league.name}{match.league.season ? ` ${match.league.season}` : ""}
                </span>
                {homeTeamId !== null && (
                  <span className={cn("shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] font-black leading-none", resultStyle)}>
                    {resultChar}
                  </span>
                )}
              </div>
              {/* Teams + score */}
              <div className="grid grid-cols-[1fr_56px_1fr] items-center gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="xs" />
                  <span className={cn("truncate text-xs font-semibold", match.home.winner ? "text-white" : "text-gray-400")}>
                    {match.home.name}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="font-mono text-sm font-black text-white">
                    {hg !== null && ag !== null ? `${hg} - ${ag}` : "- -"}
                  </span>
                  {hasHT && (
                    <span className="font-mono text-[8px] text-gray-600 mt-0.5">{htH}:{htA} HT</span>
                  )}
                </div>
                <div className="flex min-w-0 items-center justify-end gap-2">
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
  locale,
  title,
  emptyLabel,
  labels,
}: {
  standings: { home: ApiFootballFixtureTeamStanding | null; away: ApiFootballFixtureTeamStanding | null } | null;
  homeTeam: ApiFootballFixture["home"];
  awayTeam: ApiFootballFixture["away"];
  locale: string;
  title: string;
  emptyLabel: string;
  labels: { points: string; rank: string; played: string; wdl: string; goals: string; gd: string; recentForm: string; split: string; home: string; away: string; lastUpdated: string };
}) {
  const home = standings?.home;
  const away = standings?.away;

  if (!home && !away) {
    return (
      <Card className="overflow-hidden p-0 border border-border bg-surface shadow-xl">
        <div className="border-b border-border bg-elevated/40 px-4 py-3 border-l-2 border-warning">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white font-display uppercase tracking-wider">
            <Medal size={16} className="shrink-0 text-warning" aria-hidden="true" />
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
    <Card className="overflow-hidden border border-cyan-300/12 bg-[#0b0f18] p-0 shadow-xl">
      <div className="border-b border-white/10 bg-[#0f1320] px-3 py-4 sm:px-4">
        <h2 className="flex items-center gap-2 text-base font-black text-white font-display">
          <Medal size={20} className="shrink-0 text-amber-300" aria-hidden="true" />
          <span className="min-w-0 truncate">{title}</span>
          {hs.group && (
            <span className="ml-auto shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider text-gray-300">
              {hs.group}
            </span>
          )}
        </h2>
      </div>

      <div className="space-y-4 p-3 sm:p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_44px_minmax(0,1fr)] items-center gap-2 rounded-2xl border border-white/10 bg-black/22 px-2 py-2 sm:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)] sm:px-3">
          <StandingTeamSummary
            team={homeTeam}
            standing={hs}
            tone="cyan"
            align="left"
          />
          <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 px-2 text-center font-mono text-xs font-black uppercase tracking-wider text-white sm:h-11 sm:min-w-11">
            vs
          </span>
          <StandingTeamSummary
            team={awayTeam}
            standing={as_}
            tone="magenta"
            align="right"
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#10131d] p-3.5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-lg font-black text-cyan-200">{hs.points}</span>
            <span className="text-center text-sm font-black uppercase tracking-wide text-gray-100">{labels.points}</span>
            <span className="font-mono text-lg font-black text-rose-300">{as_.points}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-3.5 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(34,211,238,0.28)]"
                style={{ width: `${(hs.points / maxPts) * 100}%` }}
              />
            </div>
            <div className="relative h-3.5 overflow-hidden rounded-full border border-white/10 bg-slate-900/80">
              <div
                className="absolute right-0 h-full rounded-full bg-gradient-to-r from-rose-400 to-fuchsia-300 shadow-[0_0_12px_rgba(244,63,94,0.28)]"
                style={{ width: `${(as_.points / maxPts) * 100}%` }}
              />
            </div>
          </div>
          <div className="mt-2 flex justify-between font-mono text-xs font-black text-gray-400">
            <span>#{hs.rank}</span>
            <span>#{as_.rank}</span>
          </div>
        </div>

        <div className="grid gap-2">
          {cmpRows.map(({ label, hVal, aVal }) => (
            <div
              key={label}
              className="grid min-h-14 grid-cols-[minmax(0,1fr)_92px_minmax(0,1fr)] items-center rounded-xl border border-white/10 bg-[#10131d] px-3 py-2.5 transition-colors hover:border-cyan-300/20 hover:bg-[#121827] sm:grid-cols-[minmax(0,1fr)_120px_minmax(0,1fr)]"
            >
              <span className="truncate font-mono text-base font-black text-cyan-200">{hVal}</span>
              <span className="min-w-0 truncate px-2 text-center text-xs font-black uppercase tracking-wide text-gray-300 sm:text-sm">{label}</span>
              <span className="truncate text-right font-mono text-base font-black text-rose-300">{aVal}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormPillRow form={hs.form} label={labels.recentForm} align="left" />
          <FormPillRow form={as_.form} label={labels.recentForm} align="right" />
        </div>

        {(hs.update || as_.update) && (
          <div className="grid gap-2 rounded-xl border border-white/10 bg-[#10131d] px-3 py-3 sm:grid-cols-2">
            <div className="min-w-0">
              <p className="truncate text-[10px] font-black uppercase tracking-wider text-gray-500">{homeTeam.name} · {labels.lastUpdated}</p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-cyan-200">{formatOptionalDateTime(hs.update, locale)}</p>
            </div>
            <div className="min-w-0 sm:text-right">
              <p className="truncate text-[10px] font-black uppercase tracking-wider text-gray-500">{awayTeam.name} · {labels.lastUpdated}</p>
              <p className="mt-1 truncate font-mono text-xs font-bold text-rose-300">{formatOptionalDateTime(as_.update, locale)}</p>
            </div>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10131d]">
          <div className="grid grid-cols-[minmax(0,1fr)_78px_minmax(0,1fr)] border-b border-white/10 bg-white/[0.03] px-3 py-3 sm:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)]">
            <span className="truncate text-sm font-black uppercase tracking-wide text-cyan-200">{homeTeam.name}</span>
            <span className="text-center text-xs font-black uppercase tracking-wide text-gray-300">{labels.split}</span>
            <span className="truncate text-right text-sm font-black uppercase tracking-wide text-rose-300">{awayTeam.name}</span>
          </div>
          {[
            { label: labels.home, h: hs.home, a: as_.home },
            { label: labels.away, h: hs.away, a: as_.away },
          ].map(({ label, h, a }) => (
            <div key={label} className="grid grid-cols-[minmax(0,1fr)_78px_minmax(0,1fr)] items-center border-b border-white/10 px-3 py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_100px_minmax(0,1fr)]">
              <span className="truncate font-mono text-xs font-bold text-gray-300 sm:text-sm">
                {h.win}W {h.draw}D {h.lose}L <span className="text-gray-500">({h.goals.for}:{h.goals.against})</span>
              </span>
              <span className="text-center text-xs font-black uppercase tracking-wide text-gray-300">{label}</span>
              <span className="truncate text-right font-mono text-xs font-bold text-gray-300 sm:text-sm">
                {a.win}W {a.draw}D {a.lose}L <span className="text-gray-500">({a.goals.for}:{a.goals.against})</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function StandingTeamSummary({
  team,
  standing,
  tone,
  align,
}: {
  team: ApiFootballFixture["home"];
  standing: ApiFootballFixtureTeamStanding;
  tone: "cyan" | "magenta";
  align: "left" | "right";
}) {
  const logo = <ApiTeamLogo name={team.name} logo={team.logo} size="sm" accent={tone} />;
  const content = (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <p className="truncate text-sm font-black text-white sm:text-base">{team.name}</p>
      {standing.description && (
        <p className={cn("truncate text-xs font-bold", tone === "cyan" ? "text-cyan-300" : "text-rose-300")}>
          {standing.description}
        </p>
      )}
    </div>
  );

  return (
    <div className={cn("flex min-w-0 items-center gap-2", align === "right" ? "justify-end" : "justify-start")}>
      {align === "left" ? (
        <>
          {logo}
          {content}
        </>
      ) : (
        <>
          {content}
          {logo}
        </>
      )}
    </div>
  );
}

function FormPillRow({ form, label, align }: { form: string | null; label: string; align: "left" | "right" }) {
  if (!form) return null;
  const chars = form.split("").slice(0, 5);

  return (
    <div className={cn("flex flex-col gap-2", align === "right" && "items-end")}>
      <span className="text-xs font-black uppercase tracking-wide text-gray-300">{label}</span>
      <div className="flex gap-1">
        {chars.map((char, i) => (
          <span
            key={i}
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-lg border font-mono text-sm font-black",
              char === "W" && "bg-success/10 text-success border border-success/20",
              char === "D" && "bg-warning/10 text-warning border border-warning/20",
              char === "L" && "bg-danger/10 text-danger border border-danger/20"
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
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-text-muted">
      {label}
    </div>
  );
}

function parseApiFixtureId(matchId: string): number | null {
  return extractApiFixtureId(matchId);
}

function buildTeamStatRows(
  homeStats?: ApiFootballTeamStatistics,
  awayStats?: ApiFootballTeamStatistics
) {
  if (!homeStats || !awayStats) return [];

  const rows = new Map<
    string,
    {
      type: string;
      homeRaw: string | number | null;
      awayRaw: string | number | null;
    }
  >();

  for (const stat of homeStats.statistics) {
    const key = normalizeTeamStatKey(stat.type);
    rows.set(key, {
      type: stat.type,
      homeRaw: stat.value,
      awayRaw: null,
    });
  }

  for (const stat of awayStats.statistics) {
    const key = normalizeTeamStatKey(stat.type);
    const existing = rows.get(key);

    if (existing) {
      existing.awayRaw = stat.value;
    } else {
      rows.set(key, {
        type: stat.type,
        homeRaw: null,
        awayRaw: stat.value,
      });
    }
  }

  return Array.from(rows.values()).map((row) => {
    const homeNumber = parseStatNumber(row.homeRaw);
    const awayNumber = parseStatNumber(row.awayRaw);
    const hasBothNumbers = homeNumber !== null && awayNumber !== null;
    const total = hasBothNumbers ? homeNumber + awayNumber : 0;
    const homePercent =
      hasBothNumbers && total > 0 ? Math.round((homeNumber / total) * 100) : 50;
    const awayPercent =
      hasBothNumbers && total > 0 ? 100 - homePercent : 50;

    return {
      type: row.type,
      homeRaw: row.homeRaw,
      awayRaw: row.awayRaw,
      homeNumber,
      awayNumber,
      homeDisplay: formatStatValue(row.homeRaw),
      awayDisplay: formatStatValue(row.awayRaw),
      homePercent: clamp(homePercent, 4, 96),
      awayPercent: clamp(awayPercent, 4, 96),
    };
  });
}

function normalizeTeamStatKey(type: string) {
  return type.toLowerCase().replace(/[\s_-]+/g, " ").trim();
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

function formatOptionalDateTime(value: string | null | undefined, locale: string) {
  if (!value) return "-";
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return "-";
  return formatFixtureDateTime(value, locale);
}

function formatUnixTimestamp(value: number | null, fallback: string, locale: string) {
  if (!value) return fallback;
  return formatFixtureDateTime(new Date(value * 1000).toISOString(), locale);
}

function formatStatValue(value: string | number | null) {
  if (value === null || value === undefined) return "-";
  return String(value);
}
