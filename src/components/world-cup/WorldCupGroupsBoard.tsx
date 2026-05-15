"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronRight, Shield, Trophy } from "lucide-react";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type {
  WorldCupGroup,
  WorldCupMatch,
  WorldCupTeam,
} from "@/data/world-cup-2026";

type Copy = {
  allGroups: string;
  groupLabel: string;
  groupSpotlights: Record<string, string>;
  standings: string;
  team: string;
  teamsCount: string;
  matches: string;
  match: string;
  vs: string;
  flagAlt: string;
  played: string;
  wins: string;
  draws: string;
  losses: string;
  goalDifference: string;
  points: string;
  fifaRank: string;
  nextFixtures: string;
  groupStageSchedule: string;
  matchday: string;
  timeZone: string;
  winner: string;
  runnerUp: string;
  third: string;
  sourceNote: string;
};

type Props = {
  groups: WorldCupGroup[];
  copy: Copy;
  locale: string;
};

export function WorldCupGroupsBoard({ groups, copy, locale }: Props) {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "A");
  const selectedGroup = useMemo(
    () => groups.find((group) => group.id === selectedGroupId) ?? groups[0],
    [groups, selectedGroupId]
  );

  if (!selectedGroup) return null;

  const fixtures = selectedGroup.matches.map((match) =>
    hydrateMatch(match, selectedGroup.teams)
  );

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#0a0d13] lg:col-start-1">
        <div className="border-b border-gray-800 bg-white/[0.02] p-3 md:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge variant="cyan" size="md">
                {copy.allGroups}
              </Badge>
              <h2 className="mt-2 font-display text-2xl font-bold text-white">
                {copy.groupLabel} {selectedGroup.id}
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                {copy.groupSpotlights[selectedGroup.id] ?? selectedGroup.spotlight}
              </p>
            </div>
            <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-right">
              <p className="text-[10px] uppercase tracking-wider text-amber-300">
                {copy.standings}
              </p>
              <p className="font-mono text-lg font-black text-white">
                {copy.teamsCount}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroupId(group.id)}
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-lg border font-mono text-sm font-black transition-all",
                  selectedGroup.id === group.id
                    ? "border-cyan-300 bg-cyan-400 text-black shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                    : "border-gray-700 bg-black/25 text-gray-400 hover:border-cyan-500/60 hover:text-white"
                )}
                aria-label={`${copy.groupLabel} ${group.id}`}
              >
                {group.id}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-3 py-3 font-semibold md:px-4">#</th>
                <th className="px-3 py-3 font-semibold md:px-4">{copy.team}</th>
                <th className="px-2 py-3 text-center font-semibold">{copy.played}</th>
                <th className="px-2 py-3 text-center font-semibold">{copy.wins}</th>
                <th className="px-2 py-3 text-center font-semibold">{copy.draws}</th>
                <th className="px-2 py-3 text-center font-semibold">{copy.losses}</th>
                <th className="px-2 py-3 text-center font-semibold">{copy.goalDifference}</th>
                <th className="px-3 py-3 text-center font-semibold md:px-4">{copy.points}</th>
              </tr>
            </thead>
            <tbody>
              {selectedGroup.teams.map((team, index) => (
                <tr
                  key={team.code}
                  className="border-b border-gray-800/70 last:border-b-0 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-3 font-mono text-sm text-gray-500 md:px-4">
                    {index + 1}
                  </td>
                  <td className="px-3 py-3 md:px-4">
                    <div className="flex items-center gap-3">
                      <TeamFlag team={team} flagAlt={copy.flagAlt} />
                      <div className="min-w-0">
                        <p className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold text-white">
                          <span className="truncate">{team.name}</span>
                          <span className="font-mono text-[10px] font-black text-cyan-300">
                            {team.code}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          {copy.fifaRank} #{team.rank}
                        </p>
                      </div>
                    </div>
                  </td>
                  {[
                    team.played ?? 0,
                    team.wins ?? 0,
                    team.draws ?? 0,
                    team.losses ?? 0,
                    team.goalDifference ?? 0,
                  ].map((value, valueIndex) => (
                    <td
                      key={`${team.code}-${valueIndex}`}
                      className="px-2 py-3 text-center font-mono text-sm text-gray-400"
                    >
                      {value}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center font-mono text-sm font-black text-white md:px-4">
                    {team.points ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-xl border border-gray-800 bg-[#080b11] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
              {copy.nextFixtures}
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              {copy.groupLabel} {selectedGroup.id}
            </h3>
          </div>
          <CalendarDays className="text-amber-300" size={22} />
        </div>

        <div className="mt-4 space-y-2">
          {fixtures.slice(0, 3).map((fixture, index) => (
            <div
              key={`${fixture.home.code}-${fixture.away.code}`}
              className="rounded-lg border border-gray-800 bg-white/[0.03] p-3"
            >
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500">
                <span>
                  {copy.match} {index + 1}
                </span>
                <ChevronRight size={13} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <FixtureTeam team={fixture.home} flagAlt={copy.flagAlt} />
                <span className="font-mono text-[10px] font-bold text-gray-500">
                  {formatFixtureScore(fixture, copy.vs)}
                </span>
                <FixtureTeam team={fixture.away} flagAlt={copy.flagAlt} align="right" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          {[
            { label: copy.winner, team: selectedGroup.teams[0], icon: Trophy },
            { label: copy.runnerUp, team: selectedGroup.teams[1], icon: Shield },
            { label: copy.third, team: selectedGroup.teams[2], icon: Shield },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/25 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon size={14} className="text-cyan-300" />
                  {item.label}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  <span className="inline-flex items-center gap-2">
                    <TeamFlag team={item.team} flagAlt={copy.flagAlt} size="sm" />
                    {item.team.code}
                  </span>
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">{copy.sourceNote}</p>
      </aside>

      <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#080b11] lg:col-span-2">
        <div className="border-b border-gray-800 bg-white/[0.02] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300">
                {copy.timeZone}
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white">
                {copy.groupStageSchedule}
              </h2>
            </div>
            <Badge variant="gold" size="md">
              {copy.groupLabel} {selectedGroup.id}
            </Badge>
          </div>
        </div>

        <div className="divide-y divide-gray-800/80">
          {fixtures.map((fixture) => (
            <article
              key={`${fixture.kickoffUtc}-${fixture.home.code}-${fixture.away.code}`}
              className="grid gap-3 p-4 transition-colors hover:bg-white/[0.02] md:grid-cols-[170px_minmax(0,1fr)_180px] md:items-center"
            >
              <div>
                <p className="text-[10px] uppercase tracking-wider text-cyan-300">
                  {copy.matchday} {fixture.matchday}
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {formatMatchDate(fixture.kickoffUtc, locale)}
                </p>
                <p className="font-mono text-xs text-amber-300">
                  {formatMatchTime(fixture.kickoffUtc, locale)}
                </p>
              </div>

              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_34px_minmax(0,1fr)] items-center gap-2">
                <ScheduleTeam team={fixture.home} flagAlt={copy.flagAlt} />
                <span className="text-center font-mono text-xs font-black text-gray-500">
                  {formatFixtureScore(fixture, copy.vs)}
                </span>
                <ScheduleTeam team={fixture.away} flagAlt={copy.flagAlt} align="right" />
              </div>

              <p className="text-sm text-gray-400 md:text-right">
                {fixture.venue}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function hydrateMatch(match: WorldCupMatch, teams: WorldCupTeam[]) {
  const home = teams.find((team) => team.code === match.homeCode);
  const away = teams.find((team) => team.code === match.awayCode);

  if (!home || !away) {
    throw new Error(`Missing team for fixture ${match.homeCode}-${match.awayCode}`);
  }

  return { ...match, home, away };
}

function TeamFlag({
  team,
  flagAlt,
  size = "md",
}: {
  team: WorldCupTeam;
  flagAlt: string;
  size?: "sm" | "md";
}) {
  if (team.logo) {
    return <ApiTeamLogo name={team.name} logo={team.logo} size={size === "sm" ? "sm" : "md"} />;
  }

  return (
    <span
      className={cn(
        "relative shrink-0 overflow-hidden rounded-sm border border-white/20 bg-gray-900 shadow-[0_0_10px_rgba(0,0,0,0.25)]",
        size === "sm" ? "h-3.5 w-5" : "h-6 w-8"
      )}
    >
      <Image
        src={`/api/football/flags/w40/${team.flagCode}.png`}
        alt={`${team.name} ${flagAlt}`}
        fill
        sizes={size === "sm" ? "20px" : "32px"}
        className="object-cover"
      />
    </span>
  );
}

function formatFixtureScore(fixture: WorldCupMatch & { home: WorldCupTeam; away: WorldCupTeam }, vsLabel: string) {
  if (typeof fixture.homeScore === "number" && typeof fixture.awayScore === "number") {
    return `${fixture.homeScore}-${fixture.awayScore}`;
  }

  return vsLabel;
}

function FixtureTeam({
  team,
  flagAlt,
  align = "left",
}: {
  team: WorldCupTeam;
  flagAlt: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2",
        align === "right" && "justify-end text-right"
      )}
    >
      {align === "left" && <TeamFlag team={team} flagAlt={flagAlt} size="sm" />}
      <span className="truncate text-xs font-semibold text-white">
        {team.name}
      </span>
      {align === "right" && <TeamFlag team={team} flagAlt={flagAlt} size="sm" />}
    </div>
  );
}

function ScheduleTeam({
  team,
  flagAlt,
  align = "left",
}: {
  team: WorldCupTeam;
  flagAlt: string;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" && "justify-end text-right"
      )}
    >
      {align === "left" && <TeamFlag team={team} flagAlt={flagAlt} />}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{team.name}</p>
        <p className="font-mono text-[10px] font-black text-cyan-300">
          {team.code}
        </p>
      </div>
      {align === "right" && <TeamFlag team={team} flagAlt={flagAlt} />}
    </div>
  );
}

function formatMatchDate(kickoffUtc: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: "Asia/Bangkok",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(kickoffUtc));
}

function formatMatchTime(kickoffUtc: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(kickoffUtc));
}

function getIntlLocale(locale: string) {
  const localeMap: Record<string, string> = {
    th: "th-TH",
    en: "en-US",
    lo: "lo-LA",
    my: "my-MM",
    km: "km-KH",
    zh: "zh-CN",
  };

  return localeMap[locale] ?? "en-US";
}
