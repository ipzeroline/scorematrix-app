"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { MatchStatus } from "@/types/common";
import { Search } from "lucide-react";

const MOCK_MATCHES = [
  { id: "live-1", league: "English Premier", home: "London United", away: "Mersey City", homeScore: 2, awayScore: 1, status: MatchStatus.LIVE, minute: 67, time: "20:00" },
  { id: "live-2", league: "La Liga", home: "Real Catalonia", away: "Atletico Madrid B", homeScore: 0, awayScore: 0, status: MatchStatus.LIVE, minute: 34, time: "21:00" },
  { id: "live-3", league: "Bundesliga", home: "FC Bayern Stadt", away: "Dortmund 09", homeScore: 3, awayScore: 2, status: MatchStatus.LIVE, minute: 82, time: "19:30" },
  { id: "up-1", league: "Serie A", home: "AC Milano Nord", away: "AS Roma Sud", homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, minute: null, time: "22:00" },
  { id: "up-2", league: "Ligue 1", home: "Paris Saint-Germain B", away: "Olympique Lyon B", homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, minute: null, time: "23:00" },
  { id: "up-3", league: "J1 League", home: "Tokyo Samurai", away: "Osaka Dragons", homeScore: null, awayScore: null, status: MatchStatus.UPCOMING, minute: null, time: "11:00" },
  { id: "fin-1", league: "English Premier", home: "West Midland Albion", away: "East London Rovers", homeScore: 2, awayScore: 2, status: MatchStatus.FINISHED, minute: null, time: "Yesterday" },
  { id: "fin-2", league: "Bundesliga", home: "Bayer Nordrhein", away: "RB Leipzig City", homeScore: 1, awayScore: 0, status: MatchStatus.FINISHED, minute: null, time: "Yesterday" },
  { id: "fin-3", league: "K League 1", home: "FC Seoul United", away: "Busan Warriors", homeScore: 3, awayScore: 1, status: MatchStatus.FINISHED, minute: null, time: "Yesterday" },
  { id: "fin-4", league: "Thai League", home: "Bangkok United", away: "Chonburi Sharks", homeScore: 0, awayScore: 0, status: MatchStatus.FINISHED, minute: null, time: "Yesterday" },
  { id: "pos-1", league: "V.League 1", home: "Hanoi FC", away: "Da Nang United", homeScore: null, awayScore: null, status: MatchStatus.POSTPONED, minute: null, time: "TBD" },
];

export default function LivescorePage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [activeTab, setActiveTab] = useState("all");
  const [league, setLeague] = useState("");

  const tabs = [
    { key: "all", label: t("livescore.allMatches"), count: MOCK_MATCHES.length },
    { key: "live", label: t("livescore.live"), count: 3 },
    { key: "upcoming", label: t("livescore.upcoming"), count: 3 },
    { key: "finished", label: t("livescore.finished"), count: 4 },
  ];

  const filtered = MOCK_MATCHES.filter((m) => {
    if (activeTab !== "all" && m.status !== activeTab) return false;
    if (league && !m.league.includes(league)) return false;
    return true;
  });

  const leagues = [...new Set(MOCK_MATCHES.map((m) => m.league))];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-xl font-bold font-display text-white">
        {t("livescore.title")}
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex gap-3 flex-wrap">
        <Select
          options={[
            { value: "", label: t("livescore.allLeagues") },
            ...leagues.map((l) => ({ value: l, label: l })),
          ]}
          value={league}
          onChange={setLeague}
          placeholder={t("livescore.filterLeague")}
          className="min-w-[180px]"
        />
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            placeholder={t("livescore.searchTeams")}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={t("livescore.noMatches")}
          description={t("livescore.tryAdjustingFilters")}
        />
      ) : (
        <div className="space-y-4">
          {/* Group by league */}
          {[...new Set(filtered.map((m) => m.league))].map((leagueName) => {
            const leagueMatches = filtered.filter((m) => m.league === leagueName);
            return (
              <div key={leagueName}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {leagueName}
                </h3>
                <div className="space-y-1">
                  {leagueMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/${locale}/livescore/${match.id}`}
                      className="block"
                    >
                      <Card hover className="flex items-center gap-3 p-3">
                        <StatusBadge status={match.status} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-white truncate">
                              {match.home}
                            </span>
                            <span className="text-sm font-mono font-bold text-white mx-2 shrink-0">
                              {match.homeScore !== null
                                ? `${match.homeScore} - ${match.awayScore}`
                                : t("common.vs")}
                            </span>
                            <span className="text-sm text-white truncate">
                              {match.away}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0 w-12 text-right">
                          {match.minute != null
                            ? `${match.minute}'`
                            : match.time === "Yesterday"
                              ? t("common.yesterday")
                              : match.time}
                        </span>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
