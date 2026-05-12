"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Activity, CalendarDays, Filter, Search, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import { cn } from "@/lib/utils";
import type { ApiFootballFixture } from "@/lib/api-football";

interface MatchesApiDemoProps {
  fixtures: ApiFootballFixture[];
}

export function MatchesApiDemo({ fixtures }: MatchesApiDemoProps) {
  const locale = useLocale();
  const t = useTranslations();
  const featuredMatches = fixtures.slice(0, 8);
  const highlighted = featuredMatches[0];
  const liveCount = fixtures.filter((match) => match.status === MatchStatus.LIVE).length;
  const upcomingCount = fixtures.filter(
    (match) => match.status === MatchStatus.UPCOMING
  ).length;
  const finishedCount = fixtures.filter(
    (match) => match.status === MatchStatus.FINISHED
  ).length;

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

      {highlighted && (
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
                {highlighted.league.country}
              </Badge>
            </div>

            <div className="flex items-center justify-between gap-4">
              {[highlighted.home, highlighted.away].map((team, index) => (
                <div key={team.id} className="min-w-0 flex-1 text-center">
                  <div className="mb-2 flex justify-center">
                    <ApiTeamLogo
                      name={team.name}
                      logo={team.logo}
                      size="lg"
                      accent={index === 0 ? "cyan" : "magenta"}
                    />
                  </div>
                  <p className="truncate text-sm font-semibold text-white">
                    {team.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-gray-400">{t("aiInsight.confidenceScore")}</span>
                <span className="font-mono font-bold text-cyan-400">82%</span>
              </div>
              <ProgressBar value={82} max={100} color="cyan" size="sm" />
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
              {featuredMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/${locale}/livescore/${match.id}`}
                  className="grid gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03] md:grid-cols-[160px_minmax(0,1fr)_120px]"
                >
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="truncate">{match.league.name}</span>
                  </div>
                  <div className="grid grid-cols-[1fr_72px_1fr] items-center gap-3">
                    <TeamInline name={match.home.name} logo={match.home.logo} />
                    <div className="text-center">
                      <p className="font-mono text-sm font-bold text-white">
                        {match.score.home !== null
                          ? `${match.score.home} - ${match.score.away}`
                          : t("common.vs")}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatMatchTime(match)}
                      </p>
                    </div>
                    <TeamInline name={match.away.name} logo={match.away.logo} align="right" />
                  </div>
                  <div className="flex items-center justify-start md:justify-end">
                    <StatusBadge status={match.status} />
                  </div>
                </Link>
              ))}
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
