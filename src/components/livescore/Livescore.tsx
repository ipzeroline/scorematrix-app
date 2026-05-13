"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { RefreshCw, Search } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import type { ApiFootballFixture } from "@/lib/api-football";

export interface FixturesPayload {
  source: "api-football" | "mock";
  fetchedAt: string;
  count: number;
  fixtures: ApiFootballFixture[];
  rateLimit: {
    requestsRemaining: string | null;
    requestsLimit: string | null;
  };
  warning?: string;
}

interface LivescoreProps {
  initialPayload: FixturesPayload;
  locale: string;
}

export function Livescore({ initialPayload, locale }: LivescoreProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("all");
  const [league, setLeague] = useState("");
  const [search, setSearch] = useState("");
  const [payload, setPayload] = useState(initialPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function loadFixtures() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/football/fixtures?date=${today}&limit=50`);
      const data = (await response.json()) as FixturesPayload;

      if (!response.ok) {
        throw new Error(data.warning ?? "Unable to load fixtures");
      }

      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load fixtures");
    } finally {
      setIsLoading(false);
    }
  }

  const apiMatches = payload.fixtures;

  const tabs = [
    { key: "all", label: t("livescore.allMatches"), count: apiMatches.length },
    {
      key: "live",
      label: t("livescore.live"),
      count: apiMatches.filter((m) => m.status === MatchStatus.LIVE).length,
    },
    {
      key: "upcoming",
      label: t("livescore.upcoming"),
      count: apiMatches.filter((m) => m.status === MatchStatus.UPCOMING).length,
    },
    {
      key: "finished",
      label: t("livescore.finished"),
      count: apiMatches.filter((m) => m.status === MatchStatus.FINISHED).length,
    },
  ];

  const filtered = apiMatches.filter((m) => {
    if (activeTab !== "all" && m.status !== activeTab) return false;
    if (league && m.league.name !== league) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.home.name.toLowerCase().includes(q) ||
        m.away.name.toLowerCase().includes(q) ||
        m.league.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const leagues = [...new Set(apiMatches.map((m) => m.league.name))];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            {t("livescore.title")}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <Badge variant={payload.source === "api-football" ? "green" : "gold"}>
              {payload.source === "api-football" ? "API-Football" : "Fallback"}
            </Badge>
            <span>Synced {new Date(payload.fetchedAt).toLocaleTimeString()}</span>
            {payload.rateLimit.requestsRemaining && (
              <span>{payload.rateLimit.requestsRemaining} requests left</span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={loadFixtures}
          disabled={isLoading}
          className="w-fit"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Sync
        </Button>
      </div>

      {payload.warning && (
        <Card className="border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
          {payload.warning}
        </Card>
      )}

      {error && (
        <Card className="border-red-500/20 bg-red-500/5 p-3 text-xs text-red-300">
          {error}
        </Card>
      )}

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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Card key={index} className="h-[58px] animate-pulse bg-white/[0.03]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("livescore.noMatches")}
          description={t("livescore.tryAdjustingFilters")}
        />
      ) : (
        <div className="space-y-4">
          {[...new Set(filtered.map((m) => m.league.name))].map((leagueName) => {
            const leagueMatches = filtered.filter((m) => m.league.name === leagueName);
            const leagueInfo = leagueMatches[0]?.league;
            return (
              <div key={leagueName}>
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-gradient-to-r from-cyan-500/10 via-[#101018] to-magenta-500/10 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <ApiLeagueLogo
                      name={leagueName}
                      logo={leagueInfo?.logo}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-xs font-semibold uppercase tracking-wider text-white">
                        {leagueName}
                      </h3>
                      <span className="block truncate text-[10px] text-gray-500">
                        {leagueInfo?.country}
                      </span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-cyan-500/20 bg-black/20 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                    {leagueMatches.length} matches
                  </span>
                </div>
                <div className="space-y-1">
                  {leagueMatches.map((match) => (
                    <div key={match.id} className="relative">
                    <Link href={`/${locale}/livescore/${match.id}`} className="block">
                      <Card
                        hover
                        className="grid grid-cols-[64px_minmax(0,1fr)_48px] items-center gap-2 p-3 pb-12 sm:grid-cols-[84px_minmax(0,1fr)_56px] sm:gap-3 sm:pb-3 sm:pr-28"
                      >
                        <StatusBadge status={match.status} />
                        <div className="flex-1 min-w-0">
                          <div className="grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_76px_minmax(0,1fr)] sm:gap-3">
                            <TeamInline
                              name={match.home.name}
                              logo={match.home.logo}
                              align="right"
                              accent="cyan"
                            />
                            <span className="text-sm font-mono font-bold text-white mx-2 shrink-0">
                              {match.score.home !== null
                                ? `${match.score.home} - ${match.score.away}`
                                : t("common.vs")}
                            </span>
                            <TeamInline
                              name={match.away.name}
                              logo={match.away.logo}
                              accent="magenta"
                            />
                          </div>
                          <p className="mt-1 truncate text-[10px] text-gray-600">
                            {match.venue || match.league.round}
                          </p>
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0 w-12 text-right">
                          {formatFixtureTime(match)}
                        </span>
                      </Card>
                    </Link>
                    <Link
                      href={`/${locale}/predict/${match.id}`}
                      className="absolute bottom-2 right-2 sm:bottom-1/2 sm:translate-y-1/2"
                    >
                      <Button size="sm" variant="gold">
                        {t("prediction.predictScore")}
                      </Button>
                    </Link>
                    </div>
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

function formatFixtureTime(match: ApiFootballFixture): string {
  if (match.elapsed != null && match.status === MatchStatus.LIVE) {
    return `${match.elapsed}'`;
  }

  if (match.status === MatchStatus.FINISHED) {
    return match.statusShort || "FT";
  }

  return new Date(match.kickoffTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TeamInline({
  name,
  logo,
  align = "left",
  accent,
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
  accent: "cyan" | "magenta";
}) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 ${
        align === "right" ? "justify-end text-right" : ""
      }`}
    >
      {align === "left" && <ApiTeamLogo name={name} logo={logo} size="sm" accent={accent} />}
      <span className="truncate text-sm text-white">{name}</span>
      {align === "right" && <ApiTeamLogo name={name} logo={logo} size="sm" accent={accent} />}
    </div>
  );
}
