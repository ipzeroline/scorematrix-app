import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import {
  PredictMatchForm,
  type PredictMatch,
  type PredictPlayer,
} from "@/components/predict/PredictMatchForm";
import {
  ApiFootballError,
  type ApiFootballLineup,
  type ApiFootballPlayerStats,
  getApiFootballFixtureDetails,
} from "@/lib/api-football";
import { leagues } from "@/data/leagues";
import { matches } from "@/data/matches";
import { players } from "@/data/players";
import { teams } from "@/data/teams";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { formatMatchDateTimeWithZone } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

export default async function PredictMatchPage({ params }: Props) {
  const { locale, matchId } = await params;
  const t = await getTranslations({ locale });
  const apiFixtureId = parseApiFixtureId(matchId);

  if (!apiFixtureId) {
    const localMatch = buildLocalPredictMatch(matchId);

    if (localMatch) {
      return <PredictMatchForm locale={locale} match={localMatch} />;
    }

    return (
      <PredictErrorShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <h1 className="text-lg font-bold text-white">
          {t("matchDetail.unavailableTitle")}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {t("matchDetail.noApiFixtureId")}
        </p>
      </PredictErrorShell>
    );
  }

  try {
    const details = await getApiFootballFixtureDetails(apiFixtureId);
    const match = buildPredictMatch(details);

    return <PredictMatchForm locale={locale} match={match} />;
  } catch (error) {
    const message =
      error instanceof ApiFootballError
        ? error.message
        : t("matchDetail.loadError");

    return (
      <PredictErrorShell locale={locale} backLabel={t("matchDetail.backToMatches")}>
        <h1 className="text-lg font-bold text-white">
          {t("matchDetail.unavailableTitle")}
        </h1>
        <p className="mt-2 text-sm text-amber-300">{message}</p>
      </PredictErrorShell>
    );
  }
}

function PredictErrorShell({
  locale,
  backLabel,
  children,
}: {
  locale: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <Link
        href={`/${locale}/matches`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      <Card className="border-amber-500/20 bg-amber-500/5 p-6 text-center">
        {children}
      </Card>
    </div>
  );
}

function buildPredictMatch(
  details: Awaited<ReturnType<typeof getApiFootballFixtureDetails>>
): PredictMatch {
  const { fixture, lineups, playerStats } = details;
  const homeLineup = findTeamLineup(lineups, fixture.home.apiTeamId, 0);
  const awayLineup = findTeamLineup(lineups, fixture.away.apiTeamId, 1);
  const homeStats = findTeamPlayerStats(playerStats, fixture.home.apiTeamId, 0);
  const awayStats = findTeamPlayerStats(playerStats, fixture.away.apiTeamId, 1);

  return {
    home: {
      name: fixture.home.name,
      logo: fixture.home.logo,
      players: buildPredictPlayers(homeLineup, homeStats),
    },
    away: {
      name: fixture.away.name,
      logo: fixture.away.logo,
      players: buildPredictPlayers(awayLineup, awayStats),
    },
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    round: fixture.league.round,
    time: formatFixtureTime(fixture.kickoffTime),
    kickoffTime: fixture.kickoffTime,
    venue: fixture.venue,
  };
}

function findTeamLineup(
  lineups: ApiFootballLineup[],
  teamId: number | null,
  fallbackIndex: number
) {
  return lineups.find((lineup) => lineup.team.id === teamId) ?? lineups[fallbackIndex];
}

function findTeamPlayerStats(
  playerStats: ApiFootballPlayerStats[],
  teamId: number | null,
  fallbackIndex: number
) {
  return playerStats.find((stats) => stats.team.id === teamId) ?? playerStats[fallbackIndex];
}

function buildPredictPlayers(
  lineup?: ApiFootballLineup,
  playerStats?: ApiFootballPlayerStats
): PredictPlayer[] {
  const lineupPlayers =
    lineup?.startXI.concat(lineup.substitutes).map(({ player }) => ({
      id: player.id,
      name: player.name,
      number: player.number,
    })) ?? [];

  const statPlayers =
    playerStats?.players.map(({ player, statistics }) => ({
      id: player.id,
      name: player.name,
      number: statistics[0]?.games.number ?? null,
    })) ?? [];

  const merged = [...lineupPlayers, ...statPlayers];
  const seen = new Set<string>();

  return merged
    .filter((player) => {
      const key = String(player.id ?? player.name);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 22);
}

function parseApiFixtureId(matchId: string): number | null {
  return extractApiFixtureId(matchId);
}

function formatFixtureTime(value: string) {
  return formatMatchDateTimeWithZone(value);
}

function buildLocalPredictMatch(matchId: string): PredictMatch | null {
  const fixture = matches.find((match) => match.id === matchId);

  if (!fixture) {
    return null;
  }

  const league = leagues.find((item) => item.id === fixture.leagueId);
  const home = teams.find((team) => team.id === fixture.homeTeamId);
  const away = teams.find((team) => team.id === fixture.awayTeamId);

  if (!home || !away) {
    return null;
  }

  return {
    home: {
      name: home.name,
      logo: home.crest,
      players: buildLocalPredictPlayers(home.id),
    },
    away: {
      name: away.name,
      logo: away.crest,
      players: buildLocalPredictPlayers(away.id),
    },
    league: league?.name ?? "Demo League",
    leagueLogo: league?.logo ?? null,
    round: fixture.round,
    time: formatFixtureTime(fixture.kickoffTime),
    kickoffTime: fixture.kickoffTime,
    venue: fixture.venue,
  };
}

function buildLocalPredictPlayers(teamId: string): PredictPlayer[] {
  return players
    .filter((player) => player.teamId === teamId)
    .map((player) => ({
      id: parseLocalPlayerId(player.playerId),
      name: player.name,
      number: player.number,
    }));
}

function parseLocalPlayerId(playerId: string) {
  const value = Number.parseInt(playerId.replace(/\D/g, ""), 10);
  return Number.isNaN(value) ? null : value;
}
