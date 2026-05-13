"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, CalendarDays, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import { cn } from "@/lib/utils";
import type { ApiFootballFixture } from "@/lib/api-football";

interface MatchesApiProps {
  fixtures: ApiFootballFixture[];
}

export function MatchesApi({ fixtures }: MatchesApiProps) {
  const locale = useLocale();
  const t = useTranslations();
  const liveCount = fixtures.filter((match) => match.status === MatchStatus.LIVE).length;
  const upcomingCount = fixtures.filter(
    (match) => match.status === MatchStatus.UPCOMING
  ).length;
  const finishedCount = fixtures.filter(
    (match) => match.status === MatchStatus.FINISHED
  ).length;
  const leagueGroups = groupFixturesByLeague(fixtures);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[#12121a] to-purple-500/10 p-5 md:p-6"
        >
          <div className="relative flex max-w-2xl flex-col gap-4">
            <Badge variant="cyan" size="md" className="w-fit">
              API-Football
            </Badge>
            <div>
              <h1 className="font-display text-2xl font-bold text-white md:text-4xl">
                {t("matches.title")}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 md:text-base">
                {t("matches.subtitle")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/${locale}/livescore`}>
                <Button size="sm" neon>
                  <Activity size={14} />
                  {t("matches.liveCenter")}
                </Button>
              </Link>
              <Link href={`/${locale}/predict`}>
                <Button size="sm" variant="outline">
                  {t("dashboard.startPredicting")}
                </Button>
              </Link>
              <Link href={`/${locale}/football/leagues`}>
                <Button size="sm" variant="outline">
                  {t("nav.leagues")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-3 gap-3 p-4 lg:grid-cols-1">
          {[
            { label: t("livescore.live"), value: liveCount, color: "text-red-400" },
            {
              label: t("livescore.upcoming"),
              value: upcomingCount,
              color: "text-cyan-400",
            },
            {
              label: t("livescore.finished"),
              value: finishedCount,
              color: "text-green-400",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3"
            >
              <p className={cn("font-mono text-2xl font-bold", item.color)}>
                {item.value}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </Card>
      </section>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              {t("matches.boardTitle")}
            </h2>
          </div>
          <Badge variant="cyan" size="sm">
            {t("dashboard.matchCount", { count: fixtures.length })}
          </Badge>
        </div>

        {fixtures.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            {t("livescore.noMatches")}
          </div>
        ) : (
          <div className="space-y-4 bg-[#08080d] p-3 sm:p-4">
            {leagueGroups.map(({ key, league, matches }) => {
              const leagueLive = matches.filter(
                (match) => match.status === MatchStatus.LIVE
              ).length;
              const leagueUpcoming = matches.filter(
                (match) => match.status === MatchStatus.UPCOMING
              ).length;
              const leagueFinished = matches.filter(
                (match) => match.status === MatchStatus.FINISHED
              ).length;

              return (
                <section
                  key={key}
                  className="overflow-hidden rounded-lg border border-gray-800 bg-[#101018] shadow-[0_0_28px_rgba(34,211,238,0.04)]"
                >
                  <div className="relative overflow-hidden border-b border-gray-800 bg-gradient-to-r from-cyan-500/10 via-[#141421] to-magenta-500/10 px-4 py-3">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Link
                        href={`/${locale}/football/leagues/${league.apiLeagueId ?? league.id}?season=${league.season ?? new Date().getFullYear()}`}
                        className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
                      >
                        <LeagueLogo name={league.name} logo={league.logo} />
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center gap-2">
                            <h3 className="truncate text-sm font-bold text-white">
                              {league.name}
                            </h3>
                            {leagueLive > 0 && (
                              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.9)]" />
                            )}
                          </div>
                          <p className="truncate text-[11px] text-gray-500">
                            {league.country}
                          </p>
                        </div>
                      </Link>

                      <div className="flex flex-wrap items-center gap-2">
                        <LeagueMetric label={t("matches.metricMatches")} value={matches.length} tone="gray" />
                        <LeagueMetric label={t("livescore.live")} value={leagueLive} tone="red" />
                        <LeagueMetric label={t("livescore.upcoming")} value={leagueUpcoming} tone="cyan" />
                        <LeagueMetric label={t("livescore.fullTime")} value={leagueFinished} tone="green" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-gray-800 bg-[#0a0a0f] text-left text-[10px] uppercase tracking-wider text-gray-500">
                          <th className="w-[92px] px-4 py-3 text-center font-semibold">{t("football.table.time")}</th>
                          <th className="px-3 py-3 text-right font-semibold">{t("football.table.home")}</th>
                          <th className="w-[96px] px-3 py-3 text-center font-semibold">{t("football.table.score")}</th>
                          <th className="px-3 py-3 font-semibold">{t("football.table.away")}</th>
                          <th className="w-[120px] px-4 py-3 text-right font-semibold">{t("football.table.status")}</th>
                          <th className="w-[120px] px-4 py-3 text-right font-semibold">{t("matchDetail.predict")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/70">
                        {matches.map((match) => (
                          <tr
                            key={match.id}
                            className="transition-colors hover:bg-white/[0.035]"
                          >
                            <td className="px-4 py-3 text-center">
                              <Link
                                href={`/${locale}/livescore/${match.id}`}
                                className="font-mono text-xs text-gray-400"
                              >
                                {formatMatchTime(match)}
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <Link href={`/${locale}/livescore/${match.id}`}>
                                <TeamInline
                                  name={match.home.name}
                                  logo={match.home.logo}
                                  align="right"
                                />
                              </Link>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <Link
                                href={`/${locale}/livescore/${match.id}`}
                                className="inline-flex min-w-16 justify-center rounded-md border border-gray-800 bg-black/20 px-2 py-1 font-mono text-sm font-bold text-white"
                              >
                                {match.score.home !== null
                                  ? `${match.score.home} - ${match.score.away}`
                                  : t("common.vs")}
                              </Link>
                            </td>
                            <td className="px-3 py-3">
                              <Link href={`/${locale}/livescore/${match.id}`}>
                                <TeamInline name={match.away.name} logo={match.away.logo} />
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/${locale}/livescore/${match.id}`}>
                                <StatusBadge status={match.status} />
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link href={`/${locale}/predict/${match.id}`}>
                                <Button size="sm" variant="gold">
                                  {t("prediction.predictScore")}
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: CalendarDays,
            title: t("matches.featureCards.scheduleTitle"),
            text: t("matches.featureCards.scheduleText"),
          },
          {
            icon: ShieldCheck,
            title: t("matches.featureCards.noGamblingTitle"),
            text: t("matches.featureCards.noGamblingText"),
          },
          {
            icon: Activity,
            title: t("matches.featureCards.liveTitle"),
            text: t("matches.featureCards.liveText"),
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-4">
              <Icon size={18} className="mb-3 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-xs leading-5 text-gray-500">{item.text}</p>
            </Card>
          );
        })}
      </section>
    </div>
  );
}

function groupFixturesByLeague(fixtures: ApiFootballFixture[]) {
  const groups = new Map<
    string,
    {
      key: string;
      league: ApiFootballFixture["league"];
      matches: ApiFootballFixture[];
    }
  >();

  for (const fixture of fixtures) {
    const key = `${fixture.league.apiLeagueId ?? fixture.league.id}-${fixture.league.season ?? "season"}`;
    const existing = groups.get(key);

    if (existing) {
      existing.matches.push(fixture);
    } else {
      groups.set(key, {
        key,
        league: fixture.league,
        matches: [fixture],
      });
    }
  }

  return Array.from(groups.values());
}

function LeagueLogo({ name, logo }: { name: string; logo: string | null }) {
  return (
    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white p-1 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
      {logo ? (
        <Image
          src={logo}
          alt={`${name} logo`}
          width={34}
          height={34}
          className="object-contain"
        />
      ) : (
        <span className="text-xs font-bold text-gray-700">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
  );
}

function LeagueMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "gray" | "red" | "cyan" | "green";
}) {
  return (
    <div
      className={cn(
        "rounded-md border bg-black/20 px-2.5 py-1 text-[10px]",
        tone === "gray" && "border-gray-700 text-gray-400",
        tone === "red" && "border-red-500/30 text-red-300",
        tone === "cyan" && "border-cyan-500/30 text-cyan-300",
        tone === "green" && "border-green-500/30 text-green-300"
      )}
    >
      <span className="font-mono font-bold">{value}</span>
      <span className="ml-1 text-gray-500">{label}</span>
    </div>
  );
}

function TeamInline({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo: string | null;
  align?: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2",
        align === "right" && "justify-end text-right"
      )}
    >
      {align === "left" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
      <p className="truncate text-sm font-semibold text-white">{name}</p>
      {align === "right" && <ApiTeamLogo name={name} logo={logo} size="sm" />}
    </div>
  );
}

function formatMatchTime(match: ApiFootballFixture) {
  if (match.status === MatchStatus.LIVE && match.elapsed != null) {
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
