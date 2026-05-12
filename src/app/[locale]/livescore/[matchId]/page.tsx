"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { MatchStatus } from "@/types/common";

export default function MatchDetailPage() {
  const { matchId, locale } = useParams<{ matchId: string; locale: string }>();
  const [tab, setTab] = useState("overview");

  const match = {
    home: "London United",
    away: "Mersey City",
    homeScore: 2,
    awayScore: 1,
    status: MatchStatus.LIVE,
    minute: 67,
    venue: "Wembley Stadium, London",
    round: "Round 34",
    league: "English Premier",
  };

  const events = [
    { type: "goal", team: "home", player: "Alex Morgan", minute: 12, detail: "Penalty" },
    { type: "goal", team: "away", player: "James Wilson", minute: 28, detail: "Free kick" },
    { type: "card_yellow", team: "home", player: "David Chen", minute: 35 },
    { type: "goal", team: "home", player: "Marcus Lee", minute: 54, detail: "Header" },
    { type: "card_red", team: "away", player: "Tom Harris", minute: 61 },
    { type: "substitution", team: "home", player: "Chris Park → John Kim", minute: 70 },
  ];

  const eventIcons: Record<string, string> = {
    goal: "⚽",
    card_yellow: "🟨",
    card_red: "🟥",
    substitution: "🔄",
    penalty_scored: "✅",
    var: "📺",
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "events", label: "Events" },
    { key: "lineups", label: "Lineups" },
    { key: "stats", label: "Stats" },
    { key: "ai", label: "AI Insight" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Match Header */}
      <Card className="p-6 text-center neon-cyan">
        <p className="text-xs text-gray-500 mb-1">
          {match.league} — {match.round}
        </p>
        <div className="flex items-center justify-center gap-6 my-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 mx-auto mb-2 flex items-center justify-center text-cyan-400 font-bold text-sm">
              LU
            </div>
            <p className="text-sm font-semibold text-white">{match.home}</p>
          </div>
          <div className="text-center">
            <StatusBadge status={match.status} />
            <div className="text-4xl font-bold font-mono text-white my-2">
              {match.homeScore} - {match.awayScore}
            </div>
            {match.status === MatchStatus.LIVE && (
              <p className="text-sm text-red-400 font-mono">{match.minute}&apos;</p>
            )}
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-magenta-500/20 mx-auto mb-2 flex items-center justify-center text-magenta-400 font-bold text-sm">
              MC
            </div>
            <p className="text-sm font-semibold text-white">{match.away}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          {match.venue}
        </p>
      </Card>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {tab === "overview" && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            Match Overview
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed">
            An exciting match at {match.venue}. {match.home} leads{" "}
            {match.homeScore}-{match.awayScore} after {match.minute} minutes with
            goals from Alex Morgan (12&apos; pen) and Marcus Lee (54&apos;).
            {match.away}&apos;s James Wilson equalized with a free kick at
            28&apos;, but a red card to Tom Harris at 61&apos; has left the
            visitors with 10 men.
          </p>
        </Card>
      )}

      {tab === "events" && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-4">
            Match Events
          </h3>
          <div className="space-y-0">
            {events.map((event, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 py-2 border-l-2 pl-4 ${
                  event.team === "home"
                    ? "border-cyan-500/30"
                    : "border-magenta-500/30"
                } ${i > 0 ? "mt-1" : ""}`}
              >
                <span className="text-sm">
                  {eventIcons[event.type] || "•"}
                </span>
                <span className="text-xs font-mono text-gray-500 w-8">
                  {event.minute}&apos;
                </span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white">{event.player}</span>
                  {event.detail && (
                    <span className="text-[10px] text-gray-500 ml-1">
                      ({event.detail})
                    </span>
                  )}
                </div>
                <Badge
                  variant={event.team === "home" ? "cyan" : "magenta"}
                  size="sm"
                >
                  {event.team === "home" ? "HOME" : "AWAY"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "lineups" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-2">
              {match.home} — 4-3-3
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {["GK: David James (#1)", "DEF: Alex Smith (#2), Mark Brown (#4), Tom Wilson (#5), Chris Lee (#3)", "MID: Marcus Lee (#8), John Kim (#6), Park Ji-Sung (#10)", "FWD: Alex Morgan (#9), Wayne Cole (#7), Ryan Park (#11)"].map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-magenta-400 mb-2">
              {match.away} — 4-4-2
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {["GK: Peter Chen (#1)", "DEF: Mike Jones (#2), Tom Harris (#5), Sam White (#4), Dan Kim (#3)", "MID: James Wilson (#8), Harry Lee (#6), Frank Brown (#10), Ollie Green (#7)", "FWD: Steve Park (#9), Nick Cole (#11)"].map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "stats" && (
        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            Match Statistics
          </h3>
          {[
            { label: "Possession", home: 54, away: 46 },
            { label: "Shots", home: 12, away: 8 },
            { label: "Shots on Target", home: 5, away: 3 },
            { label: "Corners", home: 6, away: 4 },
            { label: "Fouls", home: 8, away: 12 },
            { label: "Yellow Cards", home: 1, away: 2 },
            { label: "Red Cards", home: 0, away: 1 },
            { label: "Offsides", home: 2, away: 1 },
            { label: "Pass Accuracy", home: 84, away: 78 },
          ].map((stat) => (
            <div key={stat.label} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{stat.home}</span>
                <span className="font-medium text-gray-300">
                  {stat.label}
                </span>
                <span>{stat.away}</span>
              </div>
              <div className="flex gap-1">
                <ProgressBar
                  value={stat.home}
                  max={stat.home + stat.away}
                  color="cyan"
                  size="sm"
                  className="flex-1"
                />
                <ProgressBar
                  value={stat.away}
                  max={stat.home + stat.away}
                  color="magenta"
                  size="sm"
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === "ai" && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-white mb-3">
            AI Insight
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-cyan-400">
                72%
              </div>
              <p className="text-xs text-gray-500">Confidence</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-amber-400">
                7.5
              </div>
              <p className="text-xs text-gray-500">Heat Meter</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold font-mono text-magenta-400">
                LOW
              </div>
              <p className="text-xs text-gray-500">Upset Risk</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-cyan-400">Home Win: 55%</span>
              <span className="text-gray-500">Draw: 25%</span>
              <span className="text-magenta-400">Away Win: 20%</span>
            </div>
            <ProgressBar value={55} max={100} color="cyan" size="sm" />
          </div>
        </Card>
      )}
    </div>
  );
}
