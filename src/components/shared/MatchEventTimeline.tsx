"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MatchEvent, Team } from "@/types";

interface MatchEventTimelineProps {
  events: MatchEvent[];
  homeTeam: Team;
  awayTeam: Team;
  className?: string;
}

const eventConfig: Record<
  MatchEvent["type"],
  { icon: string; label: string; side: "center" | "team" }
> = {
  goal: { icon: "⚽", label: "Goal", side: "team" },
  own_goal: { icon: "🥅", label: "Own Goal", side: "team" },
  card_yellow: { icon: "🟨", label: "Yellow Card", side: "center" },
  card_red: { icon: "🟥", label: "Red Card", side: "center" },
  substitution: { icon: "🔄", label: "Substitution", side: "center" },
  var: { icon: "📺", label: "VAR", side: "center" },
  penalty_scored: { icon: "✅", label: "Penalty Scored", side: "team" },
  penalty_missed: { icon: "❌", label: "Penalty Missed", side: "team" },
};

const sortedEvents = (events: MatchEvent[]): MatchEvent[] =>
  [...events].sort((a, b) => a.minute - b.minute || (a.minuteExtra ?? 0) - (b.minuteExtra ?? 0));

export function MatchEventTimeline({
  events,
  className,
}: MatchEventTimelineProps) {
  if (events.length === 0) {
    return (
      <Card className={cn("py-8", className)}>
        <div className="text-center text-gray-500 text-sm">
          No events yet
        </div>
      </Card>
    );
  }

  const sorted = sortedEvents(events);

  return (
    <Card className={cn("py-2", className)}>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold px-4 mb-3">
        Match Events
      </div>

      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-800 -translate-x-1/2" />

        <div className="space-y-0">
          {sorted.map((event, index) => {
            const config = eventConfig[event.type] ?? {
              icon: "📌",
              label: event.type,
              side: "center" as const,
            };
            const isHome = event.team === "home";
            const minuteStr =
              event.minuteExtra !== null
                ? `${event.minute}+${event.minuteExtra}'`
                : `${event.minute}'`;

            return (
              <div
                key={event.id}
                className={cn(
                  "relative flex items-center py-2 animate-slide-up",
                  config.side === "team" ? "" : ""
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "both",
                }}
              >
                {/* Home side event */}
                {isHome && config.side === "team" && (
                  <div className="flex-1 flex flex-col items-end pr-8">
                    <span className="text-xs font-medium text-white text-right">
                      {event.playerName}
                    </span>
                    {event.detail && (
                      <span className="text-[10px] text-gray-500 text-right">
                        {event.detail}
                      </span>
                    )}
                  </div>
                )}

                {/* Minute dot on the timeline */}
                <div className="absolute left-1/2 -translate-x-1/2 z-10">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs border-2",
                      event.type === "goal" || event.type === "penalty_scored"
                        ? "bg-green-500/20 border-green-500"
                        : event.type === "card_red"
                          ? "bg-red-500/20 border-red-500"
                          : event.type === "card_yellow"
                            ? "bg-amber-500/20 border-amber-500"
                            : "bg-gray-800 border-gray-600"
                    )}
                    title={`${minuteStr} - ${config.label}`}
                  >
                    {config.icon}
                  </div>

                  {/* Minute label */}
                  <div className="text-center mt-0.5">
                    <span
                      className={cn(
                        "text-[9px] font-mono font-bold",
                        event.type === "goal" || event.type === "penalty_scored"
                          ? "text-green-400"
                          : event.type === "card_red"
                            ? "text-red-400"
                            : "text-gray-500"
                      )}
                    >
                      {minuteStr}
                    </span>
                  </div>
                </div>

                {/* Away side event */}
                {!isHome && config.side === "team" && (
                  <div className="flex-1 flex flex-col items-start pl-8">
                    <span className="text-xs font-medium text-white text-left">
                      {event.playerName}
                    </span>
                    {event.detail && (
                      <span className="text-[10px] text-gray-500 text-left">
                        {event.detail}
                      </span>
                    )}
                  </div>
                )}

                {/* Center events (cards, subs) */}
                {config.side === "center" && (
                  <div className="flex-1 flex items-center justify-center px-6 gap-4">
                    {isHome ? (
                      <>
                        <div className="flex-1" />
                        <div className="flex flex-col items-end pr-2">
                          <span className="text-xs font-medium text-white text-right">
                            {event.playerName}
                          </span>
                          {event.detail && (
                            <span className="text-[10px] text-gray-500 text-right">
                              {event.detail}
                            </span>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-start pl-2">
                          <span className="text-xs font-medium text-white text-left">
                            {event.playerName}
                          </span>
                          {event.detail && (
                            <span className="text-[10px] text-gray-500 text-left">
                              {event.detail}
                            </span>
                          )}
                        </div>
                        <div className="flex-1" />
                      </>
                    )}
                  </div>
                )}

                {/* Fill empty space for non-team events */}
                {isHome && config.side === "team" && <div className="flex-1 pl-8" />}
                {!isHome && config.side === "team" && <div className="flex-1 pr-8" />}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
