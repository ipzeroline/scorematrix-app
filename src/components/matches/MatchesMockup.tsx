"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, CalendarDays, Filter, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MatchStatus } from "@/types/common";
import { matches } from "@/data/matches";
import { teams } from "@/data/teams";
import { leagues } from "@/data/leagues";
import { cn, formatTime } from "@/lib/utils";

const featuredMatches = matches
  .filter((match) => match.isFeatured || match.isMatchOfTheDay)
  .slice(0, 6);

const liveCount = matches.filter((match) => match.status === MatchStatus.LIVE).length;
const upcomingCount = matches.filter(
  (match) => match.status === MatchStatus.UPCOMING
).length;
const finishedCount = matches.filter(
  (match) => match.status === MatchStatus.FINISHED
).length;

function getTeam(id: string) {
  return teams.find((team) => team.id === id);
}

function getLeague(id: string) {
  return leagues.find((league) => league.id === id);
}

function FormDots({ form }: { form: string[] }) {
  return (
    <div className="flex items-center gap-1">
      {form.map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
            result === "W" && "bg-green-500/15 text-green-400",
            result === "D" && "bg-amber-500/15 text-amber-400",
            result === "L" && "bg-red-500/15 text-red-400"
          )}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

export function MatchesMockup() {
  const locale = useLocale();
  const t = useTranslations();
  const highlighted = featuredMatches[0];
  const highlightedHome = getTeam(highlighted.homeTeamId);
  const highlightedAway = getTeam(highlighted.awayTeamId);
  const highlightedLeague = getLeague(highlighted.leagueId);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[#12121a] to-purple-500/10 p-5 md:p-6"
        >
          <div className="absolute right-6 top-6 hidden h-28 w-28 rounded-full border border-cyan-500/20 md:block" />
          <div className="relative flex max-w-2xl flex-col gap-4">
            <Badge variant="cyan" size="md" className="w-fit">
              {t("matches.mockupBadge")}
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
              <Button size="sm" neon>
                <Activity size={14} />
                {t("matches.liveCenter")}
              </Button>
              <Link href={`/${locale}/predict`}>
                <Button size="sm" variant="outline">
                  {t("dashboard.startPredicting")}
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card className="grid grid-cols-3 gap-3 p-4 lg:grid-cols-1">
          {[
            { label: t("livescore.live"), value: liveCount, color: "text-green-400" },
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

      {highlightedHome && highlightedAway && highlightedLeague && (
        <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-cyan-400">
                  {t("matches.featured")}
                </p>
                <h2 className="mt-1 text-lg font-bold text-white">
                  {t("dashboard.aiMatchOfTheDay")}
                </h2>
              </div>
              <Badge variant="gold" size="sm">
                {highlightedLeague.flagEmoji} {highlightedLeague.country}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4">
              {[highlightedHome, highlightedAway].map((team) => (
                <div key={team.id} className="min-w-0 flex-1 text-center">
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/10 font-display text-sm font-bold text-cyan-300">
                    {team.shortName}
                  </div>
                  <p className="truncate text-sm font-semibold text-white">
                    {team.name}
                  </p>
                  <div className="mt-2 flex justify-center">
                    <FormDots form={team.form} />
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">{t("aiInsight.confidenceScore")}</span>
                <span className="font-mono font-bold text-cyan-400">87%</span>
              </div>
              <ProgressBar value={87} max={100} color="cyan" size="sm" />
            </div>

            <Link href={`/${locale}/predict/${highlighted.id}`}>
              <Button className="w-full" variant="gold" size="md">
                {t("prediction.predictScore")}
              </Button>
            </Link>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-white">
                  {t("matches.boardTitle")}
                </h2>
              </div>
              <div className="hidden items-center gap-2 rounded-lg border border-gray-800 bg-[#0a0a0f] px-3 py-1.5 text-xs text-gray-500 sm:flex">
                <Search size={13} />
                {t("livescore.searchTeams")}
              </div>
            </div>

            <div className="divide-y divide-gray-800/70">
              {featuredMatches.map((match) => {
                const home = getTeam(match.homeTeamId);
                const away = getTeam(match.awayTeamId);
                const league = getLeague(match.leagueId);
                if (!home || !away || !league) return null;

                return (
                  <Link
                    key={match.id}
                    href={`/${locale}/livescore/${match.id}`}
                    className="grid gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] md:grid-cols-[160px_minmax(0,1fr)_120px]"
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{league.flagEmoji}</span>
                      <span className="truncate">{league.name}</span>
                    </div>
                    <div className="grid grid-cols-[1fr_72px_1fr] items-center gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {home.name}
                        </p>
                        <p className="text-[10px] text-gray-600">{home.shortName}</p>
                      </div>
                      <div className="text-center">
                        <p className="font-mono text-sm font-bold text-white">
                          {match.homeScore !== null
                            ? `${match.homeScore} - ${match.awayScore}`
                            : t("common.vs")}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {match.status === MatchStatus.LIVE && match.minute
                            ? `${match.minute}'`
                            : formatTime(match.kickoffTime)}
                        </p>
                      </div>
                      <div className="min-w-0 text-right">
                        <p className="truncate text-sm font-semibold text-white">
                          {away.name}
                        </p>
                        <p className="text-[10px] text-gray-600">{away.shortName}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-start md:justify-end">
                      <StatusBadge status={match.status} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        </section>
      )}

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
