"use client";

import { Clock, Target, Users, Zap } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

const BADGE_STYLE: Record<string, string> = {
  upcoming: "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  live: "border-green-400/20 bg-green-400/10 text-green-300",
  finished: "border-gray-400/20 bg-gray-400/10 text-gray-400",
  predicted: "border-amber-400/20 bg-amber-400/10 text-amber-300",
};

type EventMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  status: "upcoming" | "live" | "finished" | "predicted";
  predictedScore?: string;
  actualScore?: string;
};

type Props = {
  matches: EventMatch[];
};

export function EventMatches({ matches }: Props) {
  const t = useTranslations("events");
  const { locale } = useParams<{ locale: string }>();
  const format = useFormatter();

  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0a0f18] p-10 text-center">
        <Target size={32} className="mx-auto mb-3 text-gray-600" />
        <p className="text-sm font-semibold text-gray-400">
          {t("matches.empty")}
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return format.dateTime(d, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const predictedCount = matches.filter((m) => m.status === "predicted").length;
  const totalCount = matches.length;

  return (
    <div className="space-y-4">
      {/* Progress banner */}
      <div className="rounded-2xl border border-cyan-400/15 bg-[#0a0f18] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <Target size={18} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t("matches.title")}</h2>
              <p className="mt-1 text-sm text-gray-400">
                {t("matches.progress", { done: predictedCount, total: totalCount })}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="hidden w-32 sm:block">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all"
                style={{ width: `${totalCount > 0 ? (predictedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] font-bold text-gray-500">
              {totalCount > 0 ? Math.round((predictedCount / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="space-y-2">
        {matches.map((match) => (
          <a
            key={match.id}
            href={
              match.status === "finished"
                ? `/${locale}/livescore/${match.id}`
                : `/${locale}/predict/${match.id}`
            }
            className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0d1118] p-4 transition-colors hover:border-cyan-400/15 hover:bg-[#111820]"
          >
            {/* Status icon */}
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${BADGE_STYLE[match.status]}`}>
              {match.status === "live" ? (
                <Zap size={14} className="text-green-300" />
              ) : match.status === "finished" ? (
                <Clock size={14} className="text-gray-400" />
              ) : match.status === "predicted" ? (
                <Target size={14} className="text-amber-300" />
              ) : (
                <Target size={14} className="text-cyan-300" />
              )}
            </div>

            {/* Teams */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <span className="truncate">{match.homeTeam}</span>
                {match.actualScore ? (
                  <span className="shrink-0 font-mono text-cyan-300">{match.actualScore}</span>
                ) : match.predictedScore ? (
                  <span className="shrink-0 font-mono text-amber-300/70">{match.predictedScore}</span>
                ) : (
                  <span className="shrink-0 text-xs text-gray-600">vs</span>
                )}
                <span className="truncate">{match.awayTeam}</span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{formatDate(match.date)}</p>
            </div>

            {/* Status badge */}
            <span
              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${BADGE_STYLE[match.status]}`}
            >
              {match.status === "predicted"
                ? t("matches.predicted")
                : match.status === "live"
                  ? t("matches.live")
                  : match.status === "finished"
                    ? t("matches.finished")
                    : t("matches.upcoming")}
            </span>
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex justify-center">
        <a
          href="/predict"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-cyan-400"
        >
          <Users size={16} />
          {t("matches.viewAllPredicts")}
        </a>
      </div>
    </div>
  );
}
