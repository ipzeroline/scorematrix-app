"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Calendar, MapPinned, Rows3 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatMatchTimeWithZone } from "@/lib/utils";
import {
  worldCupGroups as mockWorldCupGroups,
  type WorldCupGroup,
} from "@/data/world-cup-2026";
import type { ApiFootballFixture } from "@/lib/api-football";

interface WorldFootballFeatureProps {
  wcGroups?: WorldCupGroup[];
  wcTodayMatches?: ApiFootballFixture[];
}

const hostCities = [
  "Toronto",
  "Vancouver",
  "Mexico City",
  "Monterrey",
  "Los Angeles",
  "Miami",
  "New York New Jersey",
  "Seattle",
];

export function WorldFootballFeature({
  wcGroups = mockWorldCupGroups,
  wcTodayMatches = [],
}: WorldFootballFeatureProps) {
  const locale = useLocale();
  const t = useTranslations("worldFootball");
  const tWc = useTranslations("worldCup2026");
  const [activeTab, setActiveTab] = useState<"matches" | "standings">("matches");
  const [selectedGroupId, setSelectedGroupId] = useState(wcGroups[0]?.id ?? "A");

  const selectedGroup = wcGroups.find((group) => group.id === selectedGroupId) ?? wcGroups[0];

  const formatScore = (
    score: { home: number | null; away: number | null },
    fallback: string = "VS"
  ) => {
    if (score.home === null || score.away === null) {
      return fallback;
    }
    return `${score.home} - ${score.away}`;
  };

  return (
    <section className="relative max-w-full overflow-hidden rounded-xl border border-gray-800 bg-[#0b0f16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_45%_90%,rgba(16,185,129,0.12),transparent_32%)]" />
      <div className="relative grid min-w-0 gap-3 p-3 md:grid-cols-[minmax(0,1fr)_320px] md:gap-4 md:p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="gold" size="sm" className="md:px-3 md:py-1 md:text-xs">
              {t("eyebrow")}
            </Badge>
            <Badge variant="cyan" size="sm" className="md:px-3 md:py-1 md:text-xs">
              {t("hostLine")}
            </Badge>
          </div>

          <h2
            className="min-w-0 max-w-full truncate font-display text-base font-bold leading-tight text-white sm:overflow-visible sm:whitespace-normal md:text-xl"
            style={{
              width: "min(100%, calc(100vw - 4.5rem))",
              overflowWrap: "anywhere",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {t("title")}
          </h2>
          <p
            className="mb-3 mt-1.5 hidden max-w-full truncate text-xs leading-5 text-gray-400 sm:block sm:overflow-visible sm:whitespace-normal md:max-w-2xl md:text-[13px]"
            style={{
              width: "min(100%, calc(100vw - 4.5rem))",
              overflowWrap: "anywhere",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {t("description")}
          </p>

          {/* Interactive World Cup Live Centre */}
          <div className="mb-3 w-full min-w-0 rounded-lg border border-gray-800/80 bg-black/30 p-2 shadow-[0_0_18px_rgba(34,211,238,0.035)] md:p-3">
            <div className="mb-2.5 flex border-b border-gray-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("matches")}
                className={`relative min-h-10 cursor-pointer border-b-2 px-3 pb-2 font-display text-sm font-bold transition-all ${
                  activeTab === "matches"
                    ? "text-cyan-400 border-cyan-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {t("tabMatches")}
                {wcTodayMatches.length > 0 && (
                  <span className="absolute top-1 right-0 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("standings")}
                className={`min-h-10 cursor-pointer border-b-2 px-3 pb-2 font-display text-sm font-bold transition-all ${
                  activeTab === "standings"
                    ? "text-cyan-400 border-cyan-400"
                    : "text-gray-400 border-transparent hover:text-white"
                }`}
              >
                {t("tabStandings")}
              </button>
            </div>

            {activeTab === "matches" ? (
              <div className="flex max-h-[232px] flex-col gap-2 overflow-y-auto pr-1 scrollbar-thin">
                {wcTodayMatches.length > 0 ? (
                  wcTodayMatches.map((match) => (
                    <Link
                      key={match.id}
                      href={`/${locale}/matches/detail/${match.id}`}
                      className="grid min-h-[68px] min-w-0 grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-center gap-2 rounded-lg border border-gray-800/60 bg-black/20 px-2.5 py-2 transition-colors duration-150 hover:border-cyan-500/35 hover:bg-black/40 sm:grid-cols-[minmax(0,1fr)_82px_minmax(0,1fr)]"
                    >
                      {/* Home team */}
                      <div className="flex min-w-0 items-center gap-2">
                        <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="xs" />
                        <span className="min-w-0 truncate text-sm font-bold text-gray-200">
                          {match.home.name}
                        </span>
                      </div>

                      {/* Score or time */}
                      <div className="flex min-w-0 shrink-0 flex-col items-center justify-center">
                        <span className="min-w-[62px] rounded-md border border-gray-800 bg-black/55 px-2 py-1 text-center font-mono text-sm font-black leading-none text-white">
                          {formatScore(match.score, formatMatchTimeWithZone(match.kickoffTime))}
                        </span>
                        <span className="mt-1 max-w-full truncate text-[10px] font-bold leading-none text-gray-500">
                          {formatDate(match.kickoffTime, locale)}
                        </span>
                        <span className="mt-1 flex max-w-full items-center justify-center overflow-hidden">
                          <StatusBadge
                            status={match.status}
                            label={match.statusShort ?? undefined}
                            className="border-none bg-transparent p-0 text-[11px] font-bold leading-none"
                          />
                        </span>
                      </div>

                      {/* Away team */}
                      <div className="flex min-w-0 items-center justify-end gap-2 text-right">
                        <span className="min-w-0 truncate text-sm font-bold text-gray-200">
                          {match.away.name}
                        </span>
                        <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="xs" />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                    <Calendar className="mb-2 h-7 w-7 text-gray-700" />
                    <p className="text-xs font-medium">{t("noMatches")}</p>
                    <Link
                      href={`/${locale}/world-cup-2026`}
                      className="mt-3 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      {t("ctaGroups")} <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {/* Group selector pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {wcGroups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`grid h-6 w-6 shrink-0 cursor-pointer place-items-center rounded border font-mono text-[10px] font-black transition-all ${
                        selectedGroupId === group.id
                          ? "border-cyan-400 bg-cyan-400 text-black shadow-[0_0_8px_rgba(34,211,238,0.25)]"
                          : "border-gray-800 bg-black/45 text-gray-400 hover:border-gray-700 hover:text-white"
                      }`}
                    >
                      {group.id}
                    </button>
                  ))}
                </div>

                {/* Standings table */}
                {selectedGroup && (
                  <div className="overflow-hidden rounded-lg border border-gray-800 bg-black/10">
                    <table className="w-full border-collapse text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-800 text-[10px] uppercase font-bold text-gray-500 bg-white/[0.01]">
                          <th className="w-8 px-2 py-1.5 text-center">#</th>
                          <th className="px-2 py-1.5">{tWc("team")}</th>
                          <th className="w-9 px-2 py-1.5 text-center">{tWc("played")}</th>
                          <th className="w-9 px-2 py-1.5 text-center">{tWc("goalDifference")}</th>
                          <th className="w-10 px-2 py-1.5 text-center font-bold text-cyan-400">{tWc("points")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedGroup.teams.slice(0, 4).map((team, idx) => (
                          <tr
                            key={team.name}
                            className="border-b border-gray-900/60 last:border-0 hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="px-2 py-1.5 text-center font-mono font-bold text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="px-2 py-1.5 font-medium">
                              {team.providerId ? (
                                <Link
                                  href={`/${locale}/football/teams/${team.providerId}`}
                                  className="flex items-center gap-2 text-gray-300 hover:text-white hover:underline transition-all"
                                >
                                  <ApiTeamLogo name={team.name} logo={team.logo} size="xs" />
                                  <span className="truncate max-w-[120px]">{team.name}</span>
                                </Link>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <ApiTeamLogo name={team.name} logo={team.logo} size="xs" />
                                  <span className="truncate max-w-[120px]">{team.name}</span>
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-1.5 text-center font-mono text-gray-400">
                              {team.played ?? 0}
                            </td>
                            <td className="px-2 py-1.5 text-center font-mono text-gray-400">
                              {team.goalDifference != null && team.goalDifference > 0
                                ? `+${team.goalDifference}`
                                : team.goalDifference ?? 0}
                            </td>
                            <td className="px-2 py-1.5 text-center font-mono font-bold text-cyan-300">
                              {team.points ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/${locale}/world-cup-2026`}
              className="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-sm font-bold text-cyan-100 transition-colors duration-150 hover:border-cyan-200/60 hover:bg-cyan-400/15 hover:text-white"
            >
              <Rows3 size={18} className="relative shrink-0" />
              <span className="relative min-w-0 truncate">{t("ctaGroups")}</span>
              <ArrowRight
                size={16}
                className="relative shrink-0 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Right Panel: Globe & Host Info Showcase */}
        <div className="relative min-h-[240px] overflow-hidden rounded-lg border border-gray-800 bg-[#070a10] md:min-h-[320px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(245,158,11,0.24),transparent_24%),radial-gradient(circle_at_22%_68%,rgba(239,68,68,0.18),transparent_25%),radial-gradient(circle_at_78%_66%,rgba(16,185,129,0.2),transparent_27%),linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,100%_100%,32px_32px,32px_32px]" />
          <div className="absolute left-1/2 top-[43%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/25 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.22),rgba(34,211,238,0.14)_26%,rgba(16,185,129,0.12)_52%,rgba(10,10,15,0.92)_76%)] shadow-[0_0_42px_rgba(34,211,238,0.2)] world-football-globe md:top-[45%] md:h-52 md:w-52 md:shadow-[0_0_58px_rgba(34,211,238,0.22)]" />
          <div className="absolute left-1/2 top-[43%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/22 world-football-orbit md:top-[45%] md:h-60 md:w-60" />
          <div className="absolute left-1/2 top-[43%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/18 world-football-orbit-slow md:top-[45%] md:h-72 md:w-72" />
          <div className="absolute inset-x-8 bottom-7 h-16 rounded-full bg-[radial-gradient(ellipse,rgba(34,211,238,0.22),transparent_70%)] blur-xl md:bottom-8 md:h-20" />
          <div className="world-cup-logo-aura absolute left-1/2 top-[43%] z-10 flex h-44 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-1.5 shadow-[0_0_34px_rgba(245,158,11,0.2)] md:top-[47%] md:h-64 md:w-48 md:p-2 md:shadow-[0_0_46px_rgba(245,158,11,0.22)]">
            <div className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_140deg,rgba(239,68,68,0.16),rgba(34,211,238,0.2),rgba(16,185,129,0.18),rgba(245,158,11,0.16),rgba(239,68,68,0.16))] opacity-80 blur-sm world-cup-logo-ring md:rounded-3xl" />
            <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] world-cup-logo-shine md:rounded-3xl" />
            <Image
              src="/brand/fifa-world-cup-2026.png"
              alt="FIFA World Cup 2026"
              fill
              priority
              sizes="(min-width: 768px) 256px, 144px"
              className="z-10 rounded-xl object-cover world-cup-logo-pop md:rounded-2xl"
            />
          </div>
          <div className="absolute left-[13%] top-[27%] h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)] world-cup-spark md:left-[15%] md:top-[24%] md:h-2 md:w-2" />
          <div className="absolute right-[13%] top-[33%] h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.9)] world-cup-spark-delay md:right-[16%] md:top-[34%] md:h-2 md:w-2" />
          <div className="absolute bottom-[27%] left-[22%] h-1.5 w-1.5 rounded-full bg-green-300 shadow-[0_0_14px_rgba(16,185,129,0.9)] world-cup-spark-slow md:bottom-[24%] md:left-[24%]" />
          <div className="absolute bottom-[34%] right-[23%] h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_14px_rgba(239,68,68,0.9)] world-cup-spark md:bottom-[31%] md:right-[26%]" />

          <div className="absolute left-3 top-3 rounded-lg border border-cyan-500/30 bg-black/50 px-2.5 py-1.5 backdrop-blur md:left-4 md:top-4 md:px-3 md:py-2">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 md:text-[10px]">
              {t("hosts")}
            </p>
            <p className="text-xs font-bold text-white md:text-sm">
              {t("hostCountries.canada")}
            </p>
          </div>
          <div className="absolute right-3 top-3 rounded-lg border border-amber-500/30 bg-black/50 px-2.5 py-1.5 text-right backdrop-blur md:right-4 md:top-4 md:px-3 md:py-2">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 md:text-[10px]">
              {t("hosts")}
            </p>
            <p className="text-xs font-bold text-white md:text-sm">
              {t("hostCountries.mexico")}
            </p>
          </div>
          <div className="absolute bottom-3 left-3 rounded-lg border border-green-500/30 bg-black/50 px-2.5 py-1.5 backdrop-blur md:bottom-4 md:left-4 md:px-3 md:py-2">
            <p className="text-[9px] uppercase tracking-wider text-gray-500 md:text-[10px]">
              {t("hosts")}
            </p>
            <p className="text-xs font-bold text-white md:text-sm">
              {t("hostCountries.usa")}
            </p>
          </div>

          <div className="absolute bottom-3 right-3 max-w-[132px] rounded-lg border border-gray-700 bg-black/50 p-2 backdrop-blur md:bottom-4 md:right-4 md:max-w-[150px]">
            <div className="mb-1.5 flex items-center gap-1 text-[9px] uppercase tracking-wider text-cyan-300 md:mb-2 md:text-[10px]">
              <MapPinned size={11} />
              {t("cityPulse")}
            </div>
            <div className="flex flex-wrap gap-1">
              {hostCities.map((city) => (
                <span
                  key={city}
                  className="rounded border border-gray-700 bg-white/[0.04] px-1.5 py-0.5 text-[8px] leading-tight text-gray-400 md:text-[9px]"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
