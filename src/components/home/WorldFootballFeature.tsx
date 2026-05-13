"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Globe2, MapPinned, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

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

const statItems = [
  { key: "teams", value: "48", icon: Trophy, tone: "text-amber-300" },
  { key: "cities", value: "16", icon: MapPinned, tone: "text-cyan-300" },
  { key: "countries", value: "3", icon: Globe2, tone: "text-green-300" },
];

export function WorldFootballFeature() {
  const locale = useLocale();
  const t = useTranslations("worldFootball");

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#0b0f16]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_45%_90%,rgba(16,185,129,0.12),transparent_32%)]" />
      <div className="relative grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_390px] md:p-6 lg:p-7">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="gold" size="md">
              {t("eyebrow")}
            </Badge>
            <Badge variant="cyan" size="md">
              {t("hostLine")}
            </Badge>
          </div>

          <h2 className="font-display text-2xl font-bold leading-tight text-white md:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 md:text-base">
            {t("description")}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-gray-800 bg-black/20 p-3"
                >
                  <Icon size={16} className={item.tone} />
                  <p className="mt-2 font-mono text-2xl font-bold text-white">
                    {item.value}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">
                    {t(`stats.${item.key}`)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/${locale}/matches`}>
              <Button size="sm" neon>
                <CalendarDays size={14} />
                {t("ctaMatches")}
              </Button>
            </Link>
            <Link href={`/${locale}/football/leagues`}>
              <Button size="sm" variant="outline">
                <Globe2 size={14} />
                {t("ctaLeagues")}
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative min-h-[430px] overflow-hidden rounded-xl border border-gray-800 bg-[#070a10]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(245,158,11,0.24),transparent_24%),radial-gradient(circle_at_22%_68%,rgba(239,68,68,0.18),transparent_25%),radial-gradient(circle_at_78%_66%,rgba(16,185,129,0.2),transparent_27%),linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,100%_100%,32px_32px,32px_32px]" />
          <div className="absolute left-1/2 top-[45%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/25 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.22),rgba(34,211,238,0.14)_26%,rgba(16,185,129,0.12)_52%,rgba(10,10,15,0.92)_76%)] shadow-[0_0_70px_rgba(34,211,238,0.24)] world-football-globe" />
          <div className="absolute left-1/2 top-[45%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/22 world-football-orbit" />
          <div className="absolute left-1/2 top-[45%] h-[23rem] w-[23rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/18 world-football-orbit-slow" />
          <div className="absolute inset-x-8 bottom-8 h-20 rounded-full bg-[radial-gradient(ellipse,rgba(34,211,238,0.22),transparent_70%)] blur-xl" />
          <div className="world-cup-logo-aura absolute left-1/2 top-[47%] z-10 flex h-[22rem] w-64 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-white/10 bg-black/20 p-2 shadow-[0_0_55px_rgba(245,158,11,0.24)]">
            <div className="absolute -inset-1 rounded-3xl bg-[conic-gradient(from_140deg,rgba(239,68,68,0.16),rgba(34,211,238,0.2),rgba(16,185,129,0.18),rgba(245,158,11,0.16),rgba(239,68,68,0.16))] opacity-80 blur-sm world-cup-logo-ring" />
            <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] world-cup-logo-shine" />
            <img
              src="/brand/fifa-world-cup-2026.png"
              alt="FIFA World Cup 2026"
              className="relative z-10 h-full w-full rounded-2xl object-cover world-cup-logo-pop"
            />
          </div>
          <div className="absolute left-[15%] top-[24%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.9)] world-cup-spark" />
          <div className="absolute right-[16%] top-[34%] h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.9)] world-cup-spark-delay" />
          <div className="absolute bottom-[24%] left-[24%] h-1.5 w-1.5 rounded-full bg-green-300 shadow-[0_0_14px_rgba(16,185,129,0.9)] world-cup-spark-slow" />
          <div className="absolute bottom-[31%] right-[26%] h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_14px_rgba(239,68,68,0.9)] world-cup-spark" />

          <div className="absolute left-4 top-4 rounded-lg border border-cyan-500/30 bg-black/50 px-3 py-2 backdrop-blur">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              {t("hosts")}
            </p>
            <p className="text-sm font-bold text-white">Canada</p>
          </div>
          <div className="absolute right-4 top-4 rounded-lg border border-amber-500/30 bg-black/50 px-3 py-2 text-right backdrop-blur">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              {t("hosts")}
            </p>
            <p className="text-sm font-bold text-white">Mexico</p>
          </div>
          <div className="absolute bottom-4 left-4 rounded-lg border border-green-500/30 bg-black/50 px-3 py-2 backdrop-blur">
            <p className="text-[10px] uppercase tracking-wider text-gray-500">
              {t("hosts")}
            </p>
            <p className="text-sm font-bold text-white">USA</p>
          </div>

          <div className="absolute bottom-4 right-4 max-w-[150px] rounded-lg border border-gray-700 bg-black/50 p-2 backdrop-blur">
            <div className="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wider text-cyan-300">
              <MapPinned size={11} />
              {t("cityPulse")}
            </div>
            <div className="flex flex-wrap gap-1">
              {hostCities.map((city) => (
                <span
                  key={city}
                  className="rounded border border-gray-700 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-gray-400"
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
