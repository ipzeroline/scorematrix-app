"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, ChevronRight, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import type { ApiFootballFixture } from "@/lib/api-football";
import {
  buildFootballStatusLabels,
  getFixtureStatusGroup,
  getFixtureStatusLabel,
} from "@/lib/football-status";
import { formatDate, formatTime } from "@/lib/utils";
import { MatchStatus } from "@/types/common";

interface TodayMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  kickoffDate?: string;
  kickoffTime: string;
  league: string;
  leagueLogo: string | null;
  leagueEmoji: string;
  status: MatchStatus | string;
  statusShort?: string | null;
  statusLabel?: string;
  score: {
    home: number | null;
    away: number | null;
  };
}

interface TodayMatchesProps {
  fixtures?: ApiFootballFixture[];
}

export function TodayMatches({ fixtures = [] }: TodayMatchesProps) {
  const locale = useLocale();
  const t = useTranslations();
  const statusLabels = buildFootballStatusLabels(t);
  const apiMatches = fixtures.map((fixture) => ({
    ...mapFixtureToTodayMatch(fixture, locale),
    status: getFixtureStatusGroup(fixture),
    statusShort: fixture.statusShort,
    statusLabel: getFixtureStatusLabel(fixture, statusLabels),
  }));
  const matches = apiMatches;
  const leagueGroups = groupMatchesByLeague(matches);
  const labels = getBoardLabels(locale);

  return (
    <div className="flex flex-col gap-3">
      {/* Section heading */}
      <div className="today-matches-heading relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0d14]/95 px-3 py-2 shadow-[0_10px_26px_rgba(0,0,0,0.22)]">
        <div className="today-matches-heading-scan absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-300 via-sky-300 to-lime-300" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="today-matches-icon grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/[0.08] text-cyan-200">
              <CalendarDays
                size={15}
                strokeWidth={2.2}
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.55)]"
                aria-hidden="true"
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black leading-tight text-cyan-100 md:text-base">
                {t("dashboard.todayMatches")}
              </h2>
              <p className="truncate text-[11px] font-semibold text-cyan-100/70">
                {t("dashboard.matchCount", { count: matches.length })}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-md border border-cyan-300/25 bg-cyan-300/[0.08] px-2 py-1 text-[11px] font-black text-cyan-100 sm:inline-flex">
            <Trophy size={13} aria-hidden="true" />
            {leagueGroups.length}
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="rounded-lg border-cyan-300/15 bg-[#0b111d] p-4 text-xs font-semibold text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : (
        <div className="space-y-2">
          {leagueGroups.map((group) => (
            <div key={group.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3 px-1 py-1">
                <div className="flex min-w-0 items-center gap-2.5">
                  <ApiLeagueLogo name={group.name} logo={group.logo} size="xl" />
                  <span className="truncate text-[13px] font-black uppercase tracking-[0.11em] text-cyan-100/85 sm:text-sm">
                    {group.name}
                  </span>
                </div>
                <span className="shrink-0 rounded-md border border-cyan-300/20 bg-cyan-300/[0.06] px-2 py-1 text-[10px] font-black text-cyan-100/80">
                  {group.matches.length} {labels.matches}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[#070b12] shadow-[0_16px_38px_rgba(0,0,0,0.28)]">
                <div className="hidden min-w-0 grid-cols-[104px_minmax(220px,1fr)_104px_minmax(220px,1fr)_44px] items-center gap-3 border-b border-cyan-300/10 bg-[#0d111a] px-4 py-3 text-xs font-black uppercase tracking-wide text-gray-300 md:grid">
                  <div>
                    {t("matches.dateFilter")} / {t("football.table.time")}
                  </div>
                  <div className="text-right">{t("football.table.home")}</div>
                  <div className="text-center">VS</div>
                  <div className="text-left">{t("football.table.away")}</div>
                  <div className="text-center">{labels.action}</div>
                </div>
                {group.matches.map((match) => (
                  <Link
                    key={match.id}
                    href={`/${locale}/matches/detail/${match.id}`}
                    className="group block border-b border-white/[0.06] bg-[linear-gradient(90deg,rgba(8,37,44,0.68),rgba(7,11,18,0.98)_48%,rgba(32,8,38,0.72))] transition-colors duration-150 last:border-b-0 hover:bg-[#111826]"
                  >
                    <div className="hidden min-w-0 grid-cols-[104px_minmax(220px,1fr)_104px_minmax(220px,1fr)_44px] items-center gap-3 px-4 py-3 md:grid">
                      <div className="flex min-w-0 flex-col items-start justify-center gap-1">
                        {match.kickoffDate ? (
                          <span className="whitespace-nowrap text-[10px] font-bold leading-none text-slate-500">
                            {match.kickoffDate}
                          </span>
                        ) : null}
                        <span className="whitespace-nowrap font-mono text-base font-black leading-none tracking-wider text-cyan-100">
                          {match.kickoffTime}
                        </span>
                        <StatusBadge
                          status={match.status}
                          label={match.statusLabel}
                          className="w-fit text-[8px]"
                        />
                      </div>

                      <TeamCell name={match.homeTeam} logo={match.homeCrest} align="right" />

                      <div className="text-center">
                        <span className="inline-flex min-w-[72px] items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/[0.065] px-3 py-2 font-mono text-base font-black tracking-wider text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.06)]">
                          {formatScore(match, t("common.vs"))}
                        </span>
                        <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {match.statusShort ? `${match.statusShort} • ` : ""}{match.statusLabel}
                        </span>
                      </div>

                      <TeamCell name={match.awayTeam} logo={match.awayCrest} align="left" />

                      <div className="flex justify-end">
                        <span
                          className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition-colors group-hover:border-cyan-200/50 group-hover:bg-cyan-300/15"
                          aria-label={labels.detail}
                        >
                          <ChevronRight size={15} />
                        </span>
                      </div>
                    </div>

                    <div className="border-l-2 border-l-cyan-400/45 px-3 py-3 md:hidden">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          {match.kickoffDate ? (
                            <div className="mb-1 truncate text-xs font-bold leading-none text-slate-500">
                              {match.kickoffDate}
                            </div>
                          ) : null}
                          <div className="whitespace-nowrap font-mono text-sm font-black leading-none text-cyan-100">
                            {match.kickoffTime}
                          </div>
                          <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {match.statusShort ? `${match.statusShort} • ` : ""}{match.statusLabel}
                          </div>
                        </div>
                        <StatusBadge
                          status={match.status}
                          label={match.statusLabel}
                          className="shrink-0 text-[9px]"
                        />
                      </div>

                      <div className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)_78px] items-center gap-2">
                        <MobileTeamCell name={match.homeTeam} logo={match.homeCrest} />
                        <div className="flex justify-center">
                          <span className="grid min-h-9 min-w-[52px] place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.065] px-2 font-mono text-xs font-black uppercase text-cyan-50">
                            {formatScore(match, t("common.vs"))}
                          </span>
                        </div>
                        <MobileTeamCell name={match.awayTeam} logo={match.awayCrest} />
                        <span className="inline-flex min-h-8 items-center justify-center gap-1 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2 text-[11px] font-black text-cyan-100">
                          {labels.detail}
                          <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function mapFixtureToTodayMatch(fixture: ApiFootballFixture, locale: string): TodayMatch {
  return {
    id: String(fixture.apiFixtureId ?? fixture.id),
    homeTeam: fixture.home.name,
    homeCrest: fixture.home.logo ?? "",
    awayTeam: fixture.away.name,
    awayCrest: fixture.away.logo ?? "",
    kickoffDate: formatDate(fixture.kickoffTime, locale),
    kickoffTime: formatKickoff(fixture.kickoffTime),
    league: fixture.league.name,
    leagueLogo: fixture.league.logo,
    leagueEmoji: "",
    status: fixture.status,
    statusShort: fixture.statusShort,
    score: fixture.score,
  };
}

function groupMatchesByLeague(matches: TodayMatch[]) {
  const groups = new Map<string, { name: string; logo: string | null; matches: TodayMatch[] }>();

  for (const match of matches) {
    if (!groups.has(match.league)) {
      groups.set(match.league, {
        name: match.league,
        logo: match.leagueLogo,
        matches: [],
      });
    }
    groups.get(match.league)?.matches.push(match);
  }

  return [...groups.values()];
}

function TeamCell({
  name,
  logo,
  align,
  className = "",
}: {
  name: string;
  logo: string;
  align: "left" | "right";
  className?: string;
}) {
  const isRight = align === "right";

  return (
    <div className={`min-w-0 items-center gap-2 ${isRight ? "justify-end text-right" : "justify-start text-left"} flex ${className}`}>
      {isRight ? (
        <>
          <span className="truncate text-sm font-black tracking-wide text-slate-200 transition-colors group-hover:text-white">
            {name}
          </span>
          <ApiTeamLogo name={name} logo={logo} size="xs" />
        </>
      ) : (
        <>
          <ApiTeamLogo name={name} logo={logo} size="xs" />
          <span className="truncate text-sm font-black tracking-wide text-slate-200 transition-colors group-hover:text-white">
            {name}
          </span>
        </>
      )}
    </div>
  );
}

function MobileTeamCell({ name, logo }: { name: string; logo: string }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} size="xs" />
      </div>
      <span className="block truncate text-center text-xs font-black leading-tight text-slate-100">
        {name}
      </span>
    </div>
  );
}

function getBoardLabels(locale: string) {
  if (locale === "th") {
    return {
      time: "เวลา",
      vs: "VS",
      detail: "รายละเอียด",
      matches: "คู่",
      action: "ดู",
    };
  }

  return {
    time: "Time",
    vs: "VS",
    detail: "Details",
    matches: "matches",
    action: "View",
  };
}

function formatKickoff(value: string): string {
  return formatTime(value);
}

function formatScore(match: TodayMatch, fallback: string) {
  if (match.score.home === null || match.score.away === null) {
    return fallback;
  }

  return `${match.score.home} - ${match.score.away}`;
}
