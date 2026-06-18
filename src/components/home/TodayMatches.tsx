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
      <div className="today-matches-heading relative overflow-hidden rounded-lg border border-cyan-300/20 bg-[#081017] px-3 py-2.5 shadow-[0_12px_34px_rgba(0,0,0,0.24)]">
        <div className="today-matches-heading-scan absolute inset-0" />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-sky-300 to-lime-300" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
          <span className="today-matches-icon grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
            <CalendarDays
              size={17}
              strokeWidth={2.2}
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]"
              aria-hidden="true"
            />
          </span>
            <div className="min-w-0">
              <h2 className="truncate bg-gradient-to-r from-cyan-200 via-sky-100 to-white bg-clip-text text-base font-black leading-tight text-transparent drop-shadow-[0_0_12px_rgba(34,211,238,0.22)] md:text-lg">
                {t("dashboard.todayMatches")}
              </h2>
              <p className="truncate text-[11px] font-semibold text-cyan-100/70">
                {t("dashboard.matchCount", { count: matches.length })}
              </p>
            </div>
          </div>
          <span className="hidden items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100 sm:inline-flex">
            <Trophy size={14} aria-hidden="true" />
            {leagueGroups.length}
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <Card className="rounded-lg border-cyan-300/15 bg-[#0b111d] p-4 text-xs font-semibold text-gray-400">
          {t("livescore.noMatches")}
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-cyan-300/15 bg-[#070b12] shadow-[0_18px_44px_rgba(0,0,0,0.32)]">
          <div className="hidden grid-cols-[82px_minmax(190px,1fr)_92px_minmax(190px,1fr)_210px] items-center gap-3 border-b border-cyan-300/10 bg-[#0a101a] px-5 py-3 text-xs font-black uppercase tracking-wide text-white md:grid">
            <span className="pl-1">{labels.time}</span>
            <span className="pr-3 text-right">{labels.home}</span>
            <span className="text-center">{labels.vs}</span>
            <span className="pl-3 text-left">{labels.away}</span>
            <span className="pr-4 text-right">{labels.predict}</span>
          </div>

          {leagueGroups.map((group) => (
            <div key={group.name} className="border-b border-cyan-300/10 last:border-b-0">
              <div className="relative overflow-hidden border-b border-cyan-300/10 bg-[linear-gradient(90deg,rgba(8,37,44,0.78),rgba(15,14,27,0.92)_62%,rgba(72,18,74,0.38))] px-5 py-3">
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-cyan-300 via-fuchsia-400 to-amber-300" />
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.04] shadow-[0_0_20px_rgba(34,211,238,0.08)]">
                      <ApiLeagueLogo name={group.name} logo={group.logo} size="sm" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <h3 className="truncate text-sm font-black uppercase tracking-[0.08em] text-white md:text-[15px]">
                          {group.name}
                        </h3>
                      </div>
                      <div className="mt-1.5 h-px w-28 max-w-full rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-transparent" />
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg border border-cyan-300/20 bg-[#0b1624]/80 px-2.5 py-1.5 text-xs font-black text-cyan-100">
                    {group.matches.length} {labels.matches}
                  </span>
                </div>
              </div>

              {group.matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/${locale}/matches/detail/${match.id}`}
                  className="group block border-b border-white/[0.06] bg-[#07090d] transition-colors duration-150 last:border-b-0 hover:bg-[#111826]"
                >
                  <div className="hidden min-w-0 grid-cols-[82px_minmax(190px,1fr)_92px_minmax(190px,1fr)_210px] items-center gap-3 px-5 py-3 md:grid">
                    <div className="flex min-w-0 flex-col items-start justify-center gap-1 md:pl-1">
                      <span className="font-mono text-xs font-black tracking-wider text-cyan-200">{match.kickoffTime}</span>
                      <StatusBadge
                        status={match.status}
                        label={match.statusLabel}
                        className="w-fit text-[8px]"
                      />
                    </div>

                    <TeamCell name={match.homeTeam} logo={match.homeCrest} align="right" />

                    <div className="text-center">
                      <span className="inline-flex min-w-[58px] items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.055] px-2.5 py-1.5 font-mono text-xs font-black tracking-wider text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.06)]">
                        {formatScore(match, t("common.vs"))}
                      </span>
                      <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 md:block">
                        {match.statusShort ? `${match.statusShort} • ` : ""}{match.statusLabel}
                      </span>
                    </div>

                    <TeamCell name={match.awayTeam} logo={match.awayCrest} align="left" className="hidden md:flex" />

                    <div className="flex justify-end">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100 transition-colors group-hover:border-cyan-200/50 group-hover:bg-cyan-300/15">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>

                  <div className="border-l-4 border-l-cyan-500/20 px-3.5 py-4 md:hidden">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="whitespace-nowrap font-mono text-base font-black leading-none text-cyan-200">
                          {match.kickoffTime}
                        </div>
                        <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {match.statusShort ? `${match.statusShort} • ` : ""}{match.statusLabel}
                        </div>
                      </div>
                      <StatusBadge
                        status={match.status}
                        label={match.statusLabel}
                        className="shrink-0 text-[10px]"
                      />
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-center gap-2.5">
                      <MobileTeamCell name={match.homeTeam} logo={match.homeCrest} />
                      <div className="flex justify-center">
                        <span className="grid min-h-10 min-w-12 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/[0.055] px-2 font-mono text-xs font-black uppercase text-cyan-100">
                          {formatScore(match, t("common.vs"))}
                        </span>
                      </div>
                      <MobileTeamCell name={match.awayTeam} logo={match.awayCrest} />
                    </div>

                    <div className="mt-3 flex items-center justify-end border-t border-white/[0.06] pt-3">
                      <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
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
      <div className="mb-1.5 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} size="sm" />
      </div>
      <span className="block truncate text-center text-sm font-black leading-tight text-slate-100">
        {name}
      </span>
    </div>
  );
}

function getBoardLabels(locale: string) {
  if (locale === "th") {
    return {
      time: "เวลา",
      home: "เจ้าบ้าน",
      vs: "VS",
      away: "ทีมเยือน",
      predict: "ทายผล",
      matches: "คู่",
    };
  }

  return {
    time: "Time",
    home: "Home",
    vs: "VS",
    away: "Away",
    predict: "Predict",
    matches: "matches",
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
