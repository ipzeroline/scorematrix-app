"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import type { ApiFootballFixture } from "@/lib/api-football";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
} from "@/lib/football-status";
import { buildFixtureSeoSlug } from "@/lib/football-slugs";
import {
  cn,
  formatDate,
  formatTime,
} from "@/lib/utils";

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
  const statusLabels = useMemo(() => buildFootballStatusLabels(t), [t]);
  const [league, setLeague] = useState("");
  const [search, setSearch] = useState("");
  const [payload, setPayload] = useState(initialPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFixtures() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/football/fixtures/live", {
        cache: "no-store",
      });
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
  const liveMatches = useMemo(
    () => apiMatches.filter((match) => getFixtureStatusGroup(match) === MatchStatus.LIVE),
    [apiMatches]
  );

  const filtered = liveMatches.filter((m) => {
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

  const leagues = [...new Set(liveMatches.map((m) => m.league.name))];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold font-display text-white">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-green-400/30 bg-green-400/10 text-green-300 shadow-[0_0_18px_rgba(16,185,129,0.16)]">
              <Activity
                size={20}
                strokeWidth={2.35}
                className="drop-shadow-[0_0_8px_rgba(16,185,129,0.75)]"
                aria-hidden="true"
              />
            </span>
            <span className="min-w-0 truncate">{t("livescore.title")}</span>
          </h1>
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
            <Card key={index} className="h-[132px] animate-pulse bg-white/[0.03] sm:h-[74px]" />
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
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg border border-gray-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_42%),linear-gradient(90deg,rgba(34,211,238,0.08),rgba(18,18,26,0.96)_52%,rgba(217,70,239,0.08))] px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-2.5">
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
                  <span className="shrink-0 rounded-md border border-cyan-500/20 bg-black/25 px-2 py-1 text-[10px] font-semibold text-cyan-300">
                    {leagueMatches.length} matches
                  </span>
                </div>
                <div className="space-y-2 sm:space-y-1">
                  {leagueMatches.map((match, index) => {
                    const detailHref = buildMatchDetailHref(match, locale);

                    return (
                      <Link key={match.id} href={detailHref} className="block">
                        <Card
                          hover
                          className={cn(
                            "overflow-hidden p-0 sm:grid sm:grid-cols-[220px_minmax(0,1fr)_104px] sm:gap-x-3 sm:p-3 lg:grid-cols-[220px_minmax(0,1fr)_116px]",
                            index % 2 === 0 ? "bg-[#12121a]" : "bg-cyan-500/[0.035]"
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 px-3 py-2.5 sm:col-span-3 sm:px-4 sm:py-3">
                            <div className="inline-flex items-center gap-2 rounded-md border border-cyan-500/15 bg-cyan-500/[0.07] px-2.5 py-1.5 font-mono text-sm font-bold text-cyan-200 sm:text-[13px]">
                              <span className="font-medium text-gray-300">
                                {formatDate(match.kickoffTime, locale)}
                              </span>
                              <span className="whitespace-nowrap">
                                {formatTime(match.kickoffTime, locale)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={match.status}
                                label={getFixtureStatusLabel(match, statusLabels)}
                                className="text-center sm:hidden"
                              />
                              <div className="hidden sm:block">
                                <StatusBadge
                                  status={match.status}
                                  label={getFixtureStatusLabel(match, statusLabels)}
                                  className="text-center"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="min-w-0 px-3 py-3 sm:col-span-2 sm:flex sm:flex-col sm:items-center sm:justify-center sm:px-0 sm:py-0">
                            <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] sm:gap-2.5 lg:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] lg:gap-3">
                              <TeamInline
                                name={match.home.name}
                                logo={match.home.logo}
                                align="right"
                                accent="cyan"
                              />
                              <div className="mx-auto flex min-h-9 w-[68px] shrink-0 flex-col items-center justify-center rounded-lg border border-white/10 bg-black/35 px-2 py-1 text-center font-mono text-base font-bold text-white shadow-[0_0_18px_rgba(34,211,238,0.08)] sm:min-h-10 sm:w-full sm:border-cyan-500/15 sm:bg-black/25 sm:px-2 sm:py-1.5 sm:text-[15px] sm:shadow-[0_0_14px_rgba(34,211,238,0.07)] lg:text-base">
                                <span className="leading-none">
                                  {match.score.home !== null
                                    ? `${match.score.home} - ${match.score.away}`
                                    : t("common.vs")}
                                </span>
                                {match.status === MatchStatus.LIVE && match.elapsed !== null && (
                                  <span className="mt-0.5 inline-flex items-center justify-center rounded-full border border-green-300/40 bg-green-400/15 px-1.5 py-0.5 text-[10px] font-bold leading-none text-green-200">
                                    {match.elapsed}&apos;
                                  </span>
                                )}
                              </div>
                              <TeamInline
                                name={match.away.name}
                                logo={match.away.logo}
                                accent="magenta"
                              />
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildMatchDetailHref(match: ApiFootballFixture, locale: string): string {
  return match.apiFixtureId
    ? `/${locale}/livescore/match/${match.apiFixtureId}`
    : `/${locale}/livescore/${buildFixtureSeoSlug(match)}`;
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
      className={cn(
        "flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-2",
        align === "right"
          ? "sm:flex-row-reverse sm:justify-start sm:text-left"
          : "sm:flex-row sm:justify-start sm:text-left"
      )}
    >
      <ApiTeamLogo name={name} logo={logo} size="sm" accent={accent} />
      <span className="line-clamp-2 min-w-0 max-w-[140px] break-words text-[13px] font-semibold leading-tight text-white sm:max-w-[168px] sm:text-[13px] lg:max-w-[220px] lg:text-sm">
        {name}
      </span>
    </div>
  );
}
