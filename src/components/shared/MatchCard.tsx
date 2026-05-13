import { cn, formatTime, countdown } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Match, Team, League, MatchStatus } from "@/types";

type MatchCardVariant = "default" | "live" | "featured" | "compact";

interface MatchCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  variant?: MatchCardVariant;
  onClick?: () => void;
  className?: string;
}

function TeamCrest({
  team,
  size = "md",
}: {
  team: Team;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-6 h-6 text-[8px]",
    md: "w-10 h-10 text-xs",
    lg: "w-14 h-14 text-sm",
  };

  const initials = team.shortName
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  const colors = [
    "bg-cyan-500/20 border-cyan-500/30 text-cyan-400",
    "bg-magenta-500/20 border-magenta-500/30 text-magenta-400",
    "bg-purple-500/20 border-purple-500/30 text-purple-400",
    "bg-amber-500/20 border-amber-500/30 text-amber-400",
    "bg-green-500/20 border-green-500/30 text-green-400",
    "bg-red-500/20 border-red-500/30 text-red-400",
  ];

  const colorIndex =
    team.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
    colors.length;

  return (
    <div
      className={cn(
        "rounded-full border flex items-center justify-center font-bold font-display",
        colors[colorIndex],
        sizeClasses[size]
      )}
      title={team.name}
    >
      {initials}
    </div>
  );
}

function ScoreDisplay({
  homeScore,
  awayScore,
  isLive,
}: {
  homeScore: number | null;
  awayScore: number | null;
  isLive: boolean;
}) {
  if (homeScore === null || awayScore === null) {
    return (
      <span className="text-lg font-mono font-bold text-gray-600">vs</span>
    );
  }

  return (
    <span
      className={cn(
        "text-2xl font-bold font-mono text-white tabular-nums",
        isLive && "text-glow-cyan"
      )}
    >
      {homeScore} - {awayScore}
    </span>
  );
}

export function MatchCard({
  match,
  homeTeam,
  awayTeam,
  league,
  variant = "default",
  onClick,
  className,
}: MatchCardProps) {
  const isLive = match.status === MatchStatus.LIVE;
  const isFinished = match.status === MatchStatus.FINISHED;
  const isUpcoming = match.status === MatchStatus.UPCOMING;
  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";

  if (isCompact) {
    return (
      <Card
        hover
        neon="cyan"
        className={cn("px-3 py-2 cursor-pointer", className)}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          {/* Time / Status */}
          <div className="w-12 text-center shrink-0">
            {isLive ? (
              <StatusBadge status={MatchStatus.LIVE} />
            ) : (
              <span className="text-xs text-gray-500 font-mono">
                {formatTime(match.kickoffTime)}
              </span>
            )}
          </div>

          {/* Teams */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <TeamCrest team={homeTeam} size="sm" />
            <span className="text-sm text-white truncate font-medium">
              {homeTeam.shortName}
            </span>
            <span className="text-xs text-gray-500 font-mono shrink-0">
              {homeScoreStr(
                match.homeScore,
                isFinished || isLive,
                match.awayScore
              )}
            </span>
            <span className="text-[10px] text-gray-600">-</span>
            <span className="text-xs text-gray-500 font-mono shrink-0">
              {homeScoreStr(
                match.awayScore,
                isFinished || isLive,
                match.homeScore
              )}
            </span>
            <span className="text-sm text-white truncate font-medium">
              {awayTeam.shortName}
            </span>
            <TeamCrest team={awayTeam} size="sm" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hover={!isFeatured}
      neon={isFeatured ? "cyan" : isLive ? "cyan" : undefined}
      className={cn(
        "cursor-pointer animate-slide-up",
        isFeatured && "border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]",
        className
      )}
      onClick={onClick}
    >
      {/* League Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{league.flagEmoji}</span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
            {league.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {match.isMatchOfTheDay && (
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wide">
              Match of the Day
            </span>
          )}
          {isLive ? (
            <StatusBadge status={MatchStatus.LIVE} />
          ) : isFinished ? (
            <StatusBadge status={MatchStatus.FINISHED} />
          ) : isUpcoming ? (
            <StatusBadge status={match.status} />
          ) : null}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamCrest team={homeTeam} size="lg" />
          <span className="text-sm font-medium text-white text-center leading-tight">
            {homeTeam.shortName}
          </span>
        </div>

        {/* Center: Score / Time */}
        <div className="flex flex-col items-center gap-1 shrink-0 px-2">
          {isLive || isFinished ? (
            <>
              <ScoreDisplay
                homeScore={match.homeScore}
                awayScore={match.awayScore}
                isLive={isLive}
              />
              {isLive && match.minute !== null && (
                <span className="flex items-center gap-1 text-xs text-green-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-live-pulse" />
                  {match.minute}&apos;
                </span>
              )}
              {isFinished && (
                <span className="text-[10px] text-gray-500 font-mono">FT</span>
              )}
            </>
          ) : (
            <>
              <span className="text-lg font-mono font-bold text-white">
                {formatTime(match.kickoffTime)}
              </span>
              <span className="text-[10px] text-gray-500">
                {countdown(match.kickoffTime)}
              </span>
            </>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <TeamCrest team={awayTeam} size="lg" />
          <span className="text-sm font-medium text-white text-center leading-tight">
            {awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Venue */}
      {!isCompact && (
        <div className="mt-3 pt-3 border-t border-gray-800/50 flex items-center justify-between">
          <span className="text-[10px] text-gray-600 truncate">
            {match.venue} &middot; {match.round}
          </span>
          {isFeatured && (
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider animate-neon-pulse">
              Featured Match
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

function homeScoreStr(
  score: number | null,
  showScore: boolean,
  otherScore: number | null
): string {
  if (!showScore || score === null) return "-";
  if (otherScore !== null && score > otherScore) return `${score}`;
  return `${score}`;
}
