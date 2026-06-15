"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ChevronRight, Shield, Trophy } from "lucide-react";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { THAILAND_TIME_ZONE, THAILAND_TIME_ZONE_ABBR, cn } from "@/lib/utils";
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
              {selectedGroup.teams.map((team) => {
                const pos = team.rank ?? 99;
                const qualified = pos <= 2;
                return (
                  <tr
                    key={team.providerId ?? team.code}
                    className={cn(
                      "border-b border-gray-800/70 last:border-b-0 transition-colors hover:bg-white/2",
                      qualified && "bg-cyan-500/3"
                    )}
                  >
                    <td className="px-3 py-3 md:px-4">
                      <span
                        className={cn(
                          "inline-grid h-6 w-6 place-items-center rounded font-mono text-xs font-black",
                          pos === 1
                            ? "bg-amber-400/20 text-amber-300"
                            : pos === 2
                              ? "bg-cyan-500/20 text-cyan-300"
                              : "bg-gray-800/60 text-gray-500"
                        )}
                      >
                        {pos}
                      </span>
                    </td>
                    <td className="px-3 py-3 md:px-4">
                      <TeamLink
                        team={team}
                        locale={locale}
                        className="group/team flex items-center gap-3 rounded-md outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                      >
                        <TeamFlag team={team} flagAlt={copy.flagAlt} />
                        <div className="min-w-0">
                          <p className="min-w-0 truncate text-sm font-semibold text-white transition-colors group-hover/team:text-cyan-300">
                            {team.name}
                          </p>
                          {qualified && (
                            <p className="text-[10px] font-bold text-amber-300">
                              ✓ {pos === 1 ? copy.winner : copy.runnerUp}
                            </p>
                          )}
                        </div>
                      </TeamLink>
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
                    <td
                      className={cn(
                        "px-3 py-3 text-center font-mono text-sm font-black md:px-4",
                        qualified ? "text-amber-300" : "text-gray-400"
                      )}
                    >
                      {team.points ?? 0}
                    </td>
                  </tr>
                );
              })}
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
              key={fixtureKey(fixture, index)}
              className="rounded-lg border border-gray-800 bg-white/[0.03] p-3"
            >
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-gray-500">
                <span>
                  {copy.match} {index + 1}
                </span>
                <ChevronRight size={13} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <FixtureTeam team={fixture.home} flagAlt={copy.flagAlt} locale={locale} />
                <span className="font-mono text-[10px] font-bold text-gray-500">
                  {formatFixtureScore(fixture, copy.vs)}
                </span>
                <FixtureTeam
                  team={fixture.away}
                  flagAlt={copy.flagAlt}
                  locale={locale}
                  align="right"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-2">
          {selectedGroup.teams.slice(0, 3).map((team, index) => {
            const ranking = [
              { id: "winner", label: copy.winner, icon: Trophy },
              { id: "runner-up", label: copy.runnerUp, icon: Shield },
              { id: "third", label: copy.third, icon: Shield },
            ][index];
            if (!ranking) return null;

            const { id, label, icon: Icon } = ranking;
            return (
              <div
                key={id}
                className="flex items-center justify-between rounded-lg border border-gray-800 bg-black/25 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-xs text-gray-400">
                  <Icon size={14} className="text-cyan-300" />
                  {label}
                </span>
                <TeamLink
                  team={team}
                  locale={locale}
                  className="group/team font-mono text-xs font-bold text-white outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                >
                  <span className="inline-flex items-center gap-2">
                    <TeamFlag team={team} flagAlt={copy.flagAlt} size="sm" />
                    {team.code}
                  </span>
                </TeamLink>
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
          {fixtures.map((fixture, index) => (
            <article
              key={fixtureKey(fixture, index)}
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
                <ScheduleTeam team={fixture.home} flagAlt={copy.flagAlt} locale={locale} />
                <span className="text-center font-mono text-xs font-black text-gray-500">
                  {formatFixtureScore(fixture, copy.vs)}
                </span>
                <ScheduleTeam
                  team={fixture.away}
                  flagAlt={copy.flagAlt}
                  locale={locale}
                  align="right"
                />
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

function fixtureKey(fixture: WorldCupMatch, index: number) {
  if (fixture.apiFixtureId !== null && fixture.apiFixtureId !== undefined) {
    return `fixture-${fixture.apiFixtureId}`;
  }

  return [
    "fixture",
    fixture.kickoffUtc,
    fixture.homeCode,
    fixture.awayCode,
    index,
  ].join("-");
}

function TeamLink({
  team,
  locale,
  className,
  children,
}: {
  team: WorldCupTeam;
  locale: string;
  className: string;
  children: React.ReactNode;
}) {
  if (team.providerId == null) {
    return <span className={className}>{children}</span>;
  }

  return (
    <Link
      href={`/${locale}/football/teams/${team.providerId}?league=1&season=2026`}
      className={className}
    >
      {children}
    </Link>
  );
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
  locale,
  align = "left",
}: {
  team: WorldCupTeam;
  flagAlt: string;
  locale: string;
  align?: "left" | "right";
}) {
  return (
    <TeamLink
      team={team}
      locale={locale}
      className={cn(
        "group/team flex min-w-0 flex-1 items-center gap-2 rounded outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70",
        align === "right" && "justify-end text-right"
      )}
    >
      {align === "left" && <TeamFlag team={team} flagAlt={flagAlt} size="sm" />}
      <span className="truncate text-xs font-semibold text-white transition-colors group-hover/team:text-cyan-300">
        {team.name}
      </span>
      {align === "right" && <TeamFlag team={team} flagAlt={flagAlt} size="sm" />}
    </TeamLink>
  );
}

function ScheduleTeam({
  team,
  flagAlt,
  locale,
  align = "left",
}: {
  team: WorldCupTeam;
  flagAlt: string;
  locale: string;
  align?: "left" | "right";
}) {
  return (
    <TeamLink
      team={team}
      locale={locale}
      className={cn(
        "group/team flex min-w-0 items-center gap-2 rounded outline-none transition-colors hover:text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/70",
        align === "right" && "justify-end text-right"
      )}
    >
      {align === "left" && <TeamFlag team={team} flagAlt={flagAlt} />}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white transition-colors group-hover/team:text-cyan-300">
          {team.name}
        </p>
        <p className="font-mono text-[10px] font-black text-cyan-300">
          {team.code}
        </p>
      </div>
      {align === "right" && <TeamFlag team={team} flagAlt={flagAlt} />}
    </TeamLink>
  );
}

function formatMatchDate(kickoffUtc: string, locale: string) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: THAILAND_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(kickoffUtc));
}

function formatMatchTime(kickoffUtc: string, locale: string) {
  const time = new Intl.DateTimeFormat(getIntlLocale(locale), {
    timeZone: THAILAND_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(kickoffUtc));
  return `${time} ${THAILAND_TIME_ZONE_ABBR}`;
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
