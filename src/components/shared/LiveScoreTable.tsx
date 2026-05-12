"use client";

import { cn, formatTime } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Match, Team, League, MatchStatus } from "@/types";

interface LiveScoreTableProps {
  matches: Match[];
  teams: Team[];
  leagues: League[];
  filters?: {
    leagueId?: string;
    status?: MatchStatus;
  };
  onMatchClick?: (matchId: string) => void;
  className?: string;
}

function getTeam(id: string, teams: Team[]): Team | undefined {
  return teams.find((t) => t.id === id);
}

function getLeague(id: string, leagues: League[]): League | undefined {
  return leagues.find((l) => l.id === id);
}

function sortMatches(matches: Match[]): Match[] {
  const statusOrder: Record<string, number> = {
    [MatchStatus.LIVE]: 0,
    [MatchStatus.UPCOMING]: 1,
    [MatchStatus.FINISHED]: 2,
    [MatchStatus.POSTPONED]: 3,
    [MatchStatus.CANCELLED]: 4,
  };

  return [...matches].sort((a, b) => {
    const statusDiff =
      (statusOrder[a.status] ?? 5) - (statusOrder[b.status] ?? 5);
    if (statusDiff !== 0) return statusDiff;
    return (
      new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
    );
  });
}

function groupByLeague(matches: Match[]): Map<string, Match[]> {
  const groups = new Map<string, Match[]>();
  for (const match of matches) {
    const existing = groups.get(match.leagueId) || [];
    existing.push(match);
    groups.set(match.leagueId, existing);
  }
  return groups;
}

export function LiveScoreTable({
  matches,
  teams,
  leagues,
  filters,
  onMatchClick,
  className,
}: LiveScoreTableProps) {
  let filtered = matches;

  if (filters?.leagueId) {
    filtered = filtered.filter((m) => m.leagueId === filters.leagueId);
  }
  if (filters?.status) {
    filtered = filtered.filter((m) => m.status === filters.status);
  }

  const sorted = sortMatches(filtered);
  const grouped = groupByLeague(sorted);

  if (sorted.length === 0) {
    return (
      <Card className={cn("py-12", className)}>
        <div className="text-center text-gray-500 text-sm">
          No matches found
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from(grouped.entries()).map(([leagueId, leagueMatches]) => {
        const league = getLeague(leagueId, leagues);
        return (
          <div key={leagueId}>
            {/* League Header */}
            <div className="flex items-center gap-2 mb-2 px-1">
              {league && (
                <span className="text-base">{league.flagEmoji}</span>
              )}
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                {league?.name ?? leagueId}
              </span>
              <span className="text-[10px] text-gray-600">
                ({leagueMatches.length})
              </span>
            </div>

            {/* Match Rows */}
            <Card className="p-0 overflow-hidden">
              <div className="divide-y divide-gray-800/50">
                {leagueMatches.map((match) => {
                  const homeTeam = getTeam(match.homeTeamId, teams);
                  const awayTeam = getTeam(match.awayTeamId, teams);
                  const isLive = match.status === MatchStatus.LIVE;
                  const hasScore =
                    match.homeScore !== null && match.awayScore !== null;

                  return (
                    <div
                      key={match.id}
                      onClick={() => onMatchClick?.(match.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 hover:bg-[#1a1a2e] transition-colors cursor-pointer",
                        isLive && "bg-red-500/5"
                      )}
                    >
                      {/* Time / Status */}
                      <div className="w-14 shrink-0 text-center">
                        {isLive ? (
                          <div className="flex items-center justify-center gap-1">
                            <StatusBadge status={MatchStatus.LIVE} />
                          </div>
                        ) : hasScore ? (
                          <StatusBadge status={MatchStatus.FINISHED} />
                        ) : (
                          <span className="text-xs font-mono text-gray-400">
                            {formatTime(match.kickoffTime)}
                          </span>
                        )}
                      </div>

                      {/* Home Team */}
                      <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
                        <span className="text-sm text-white truncate font-medium">
                          {homeTeam?.shortName ?? match.homeTeamId}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[9px] font-bold text-cyan-400 shrink-0">
                          {homeTeam?.shortName
                            ?.split(/\s+/)
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() ?? "H"}
                        </div>
                      </div>

                      {/* Score / Minute */}
                      <div className="shrink-0 text-center w-16">
                        {hasScore ? (
                          <span
                            className={cn(
                              "text-lg font-bold font-mono tabular-nums",
                              isLive
                                ? "text-glow-cyan text-white"
                                : "text-white"
                            )}
                          >
                            {match.homeScore} - {match.awayScore}
                          </span>
                        ) : isLive ? (
                          <span className="text-xs text-red-400 font-mono">
                            {match.minute}&apos;
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 font-mono">
                            vs
                          </span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center text-[9px] font-bold text-magenta-400 shrink-0">
                          {awayTeam?.shortName
                            ?.split(/\s+/)
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() ?? "A"}
                        </div>
                        <span className="text-sm text-white truncate font-medium">
                          {awayTeam?.shortName ?? match.awayTeamId}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
