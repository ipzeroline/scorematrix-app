"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Globe2, MapPinned, Rows3, Trophy } from "lucide-react";
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

const worldCupKickoff = new Date("2026-06-11T13:00:00-06:00").getTime();

export function WorldFootballFeature() {
  const locale = useLocale();
  const t = useTranslations("worldFootball");
  const [now, setNow] = useState<number | null>(null);
  const countdownParts = useMemo(
    () => (now === null ? getPendingCountdownParts() : getCountdownParts(worldCupKickoff - now)),
    [now]
  );

  useEffect(() => {
    const update = () => setNow(Date.now());
    const initial = window.setTimeout(update, 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-xl border border-gray-800 bg-[#0b0f16] md:rounded-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.12),transparent_28%),radial-gradient(circle_at_45%_90%,rgba(16,185,129,0.12),transparent_32%)]" />
      <div className="relative grid gap-4 p-4 md:grid-cols-[minmax(0,1fr)_390px] md:gap-6 md:p-6 lg:p-7">
        <div className="flex min-w-0 flex-col justify-center">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="gold" size="sm" className="md:px-3 md:py-1 md:text-xs">
              {t("eyebrow")}
            </Badge>
            <Badge variant="cyan" size="sm" className="md:px-3 md:py-1 md:text-xs">
              {t("hostLine")}
            </Badge>
          </div>

          <h2 className="font-display text-xl font-bold leading-tight text-white md:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 md:mt-3 md:text-base">
            {t("description")}
          </p>

          <div className="world-cup-countdown relative mt-4 overflow-hidden rounded-xl border border-amber-400/30 bg-[#100d08] p-3 shadow-[0_0_34px_rgba(245,158,11,0.12)] md:mt-5 md:p-4">
            <div className="world-cup-countdown-scan absolute inset-0" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
            <div className="relative flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-300">
                    {t("countdownLabel")}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {t("kickoffLine")}
                  </p>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 font-mono text-[10px] font-bold text-cyan-200">
                  {t("openingMatch")}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {countdownParts.map((part) => (
                  <div
                    key={part.key}
                    className="world-cup-countdown-tile rounded-lg border border-white/10 bg-black/35 p-2 text-center"
                  >
                    <p className="font-mono text-2xl font-black leading-none text-white text-glow-cyan md:text-3xl">
                      {part.value}
                    </p>
                    <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-500">
                      {t(`countdown.${part.key}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 md:mt-5 md:gap-3">
            {statItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.key}
                  className="rounded-lg border border-gray-800 bg-black/20 p-2 md:p-3"
                >
                  <Icon size={14} className={item.tone} />
                  <p className="mt-1 font-mono text-xl font-bold leading-none text-white md:mt-2 md:text-2xl">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-wider text-gray-500 md:text-[10px]">
                    {t(`stats.${item.key}`)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
            <Link href={`/${locale}/world-cup-2026`}>
              <Button
                size="md"
                variant="gold"
                neon
                className="group relative overflow-hidden border border-amber-300/35 bg-amber-400 px-4 text-sm font-bold text-black shadow-[0_0_18px_rgba(245,158,11,0.22)] hover:bg-amber-300 hover:shadow-[0_0_24px_rgba(245,158,11,0.32)]"
              >
                <span className="absolute inset-y-0 left-0 w-10 -translate-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-32" />
                <Rows3 size={16} className="relative" />
                <span className="relative">{t("ctaGroups")}</span>
                <ArrowRight
                  size={16}
                  className="relative transition-transform duration-300 group-hover:translate-x-1"
                />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative min-h-[310px] overflow-hidden rounded-xl border border-gray-800 bg-[#070a10] md:min-h-[430px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_22%,rgba(245,158,11,0.24),transparent_24%),radial-gradient(circle_at_22%_68%,rgba(239,68,68,0.18),transparent_25%),radial-gradient(circle_at_78%_66%,rgba(16,185,129,0.2),transparent_27%),linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] bg-[size:100%_100%,100%_100%,100%_100%,32px_32px,32px_32px]" />
          <div className="absolute left-1/2 top-[43%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/25 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.22),rgba(34,211,238,0.14)_26%,rgba(16,185,129,0.12)_52%,rgba(10,10,15,0.92)_76%)] shadow-[0_0_50px_rgba(34,211,238,0.22)] world-football-globe md:top-[45%] md:h-64 md:w-64 md:shadow-[0_0_70px_rgba(34,211,238,0.24)]" />
          <div className="absolute left-1/2 top-[43%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-300/22 world-football-orbit md:top-[45%] md:h-72 md:w-72" />
          <div className="absolute left-1/2 top-[43%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/18 world-football-orbit-slow md:top-[45%] md:h-[23rem] md:w-[23rem]" />
          <div className="absolute inset-x-8 bottom-7 h-16 rounded-full bg-[radial-gradient(ellipse,rgba(34,211,238,0.22),transparent_70%)] blur-xl md:bottom-8 md:h-20" />
          <div className="world-cup-logo-aura absolute left-1/2 top-[43%] z-10 flex h-52 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-white/10 bg-black/20 p-1.5 shadow-[0_0_38px_rgba(245,158,11,0.22)] md:top-[47%] md:h-[22rem] md:w-64 md:rounded-3xl md:p-2 md:shadow-[0_0_55px_rgba(245,158,11,0.24)]">
            <div className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_140deg,rgba(239,68,68,0.16),rgba(34,211,238,0.2),rgba(16,185,129,0.18),rgba(245,158,11,0.16),rgba(239,68,68,0.16))] opacity-80 blur-sm world-cup-logo-ring md:rounded-3xl" />
            <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] world-cup-logo-shine md:rounded-3xl" />
            <Image
              src="/brand/fifa-world-cup-2026.png"
              alt="FIFA World Cup 2026"
              fill
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

function getCountdownParts(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    { key: "days", value: days.toString().padStart(2, "0") },
    { key: "hours", value: hours.toString().padStart(2, "0") },
    { key: "minutes", value: minutes.toString().padStart(2, "0") },
    { key: "seconds", value: seconds.toString().padStart(2, "0") },
  ];
}

function getPendingCountdownParts() {
  return [
    { key: "days", value: "--" },
    { key: "hours", value: "--" },
    { key: "minutes", value: "--" },
    { key: "seconds", value: "--" },
  ];
}
