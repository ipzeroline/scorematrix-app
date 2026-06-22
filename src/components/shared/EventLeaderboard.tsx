"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Medal,
  Search,
  Trophy,
  Users,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";
import {
  normalizeEventLeaderboardResponse,
  type EventLeaderboardResponse,
} from "@/lib/events-api";
import type { EventLeaderboardEntry, SpecialEvent } from "@/types/event";

type Props = {
  eventId: string;
  entries: EventLeaderboardEntry[];
  currentUserRank?: number;
  currentUserPoints?: number;
  totalParticipants?: number;
  pagination?: SpecialEvent["leaderboardPagination"];
};

export function EventLeaderboard({
  eventId,
  entries,
  currentUserRank,
  currentUserPoints,
  totalParticipants,
  pagination,
}: Props) {
  const t = useTranslations("events");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<EventLeaderboardResponse>({
    entries,
    userEntry:
      currentUserRank !== undefined && currentUserPoints !== undefined
        ? { rank: currentUserRank, totalPoints: currentUserPoints }
        : null,
    pagination: pagination ?? {
      page: 1,
      limit: entries.length || 10,
      total: entries.length,
      totalPages: 1,
    },
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeEntries = leaderboard.entries;
  const activePagination = leaderboard.pagination;
  const page = activePagination?.page ?? 1;
  const totalPages = Math.max(activePagination?.totalPages ?? 1, 1);
  const totalRows = activePagination?.total ?? activeEntries.length;
  const limit = activePagination?.limit ?? 10;
  const visibleUserRank = leaderboard.userEntry?.rank ?? currentUserRank;
  const visibleUserPoints = leaderboard.userEntry?.totalPoints ?? currentUserPoints;
  const searchLabel = useMemo(() => activeSearch.trim(), [activeSearch]);

  const loadLeaderboard = (nextPage: number, nextSearch = activeSearch) => {
    startTransition(async () => {
      try {
        const params = new URLSearchParams({
          page: String(nextPage),
          limit: String(limit),
        });
        if (nextSearch.trim()) params.set("search", nextSearch.trim());

        const response = await fetch(
          `/api/data/events/${encodeURIComponent(eventId)}/leaderboard?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              "Accept-Language": locale,
              "X-App-Locale": locale,
              "X-Locale": locale,
            },
            cache: "no-store",
          }
        );
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(payload?.message || t("leaderboard.loadFailed"));
        }

        setLeaderboard(normalizeEventLeaderboardResponse(payload));
        setActiveSearch(nextSearch.trim());
        setError(null);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : t("leaderboard.loadFailed")
        );
      }
    });
  };

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loadLeaderboard(1, query);
  };

  const clearSearch = () => {
    setQuery("");
    loadLeaderboard(1, "");
  };

  const rankIcon = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/12 shadow-[0_0_18px_rgba(245,158,11,0.16)]">
          <Trophy size={14} className="text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300/25 bg-gray-300/7">
          <Medal size={14} className="text-gray-300" />
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-700/25 bg-amber-700/7">
          <Medal size={14} className="text-amber-600" />
        </div>
      );
    }
    return (
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/5 bg-white/[0.03] text-xs font-bold text-gray-500">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-purple-400/15 bg-[#0a0f18] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10">
              <Trophy size={18} className="text-purple-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t("leaderboard.title")}</h2>
              {totalParticipants ? (
                <p className="mt-0.5 text-sm text-gray-400">
                  {t("leaderboard.participants", {
                    count: totalParticipants.toLocaleString(),
                  })}
                </p>
              ) : null}
            </div>
          </div>

          <form
            onSubmit={submitSearch}
            className="flex w-full flex-col gap-2 sm:flex-row lg:w-[420px]"
          >
            <label className="relative flex-1">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("leaderboard.searchPlaceholder")}
                className="h-11 w-full rounded-xl border border-white/10 bg-black/25 pl-10 pr-3 text-sm font-semibold text-white outline-none transition-colors placeholder:text-gray-500 focus:border-cyan-400/40 focus:bg-cyan-400/[0.04]"
              />
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/12 px-4 text-sm font-bold text-cyan-100 transition-colors hover:bg-cyan-400/18 disabled:cursor-wait disabled:opacity-70"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {t("leaderboard.search")}
            </button>
            {searchLabel ? (
              <button
                type="button"
                onClick={clearSearch}
                disabled={isPending}
                className="h-11 rounded-xl border border-white/10 px-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-70"
              >
                {t("leaderboard.clearSearch")}
              </button>
            ) : null}
          </form>
        </div>

        {error ? (
          <p className="mt-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-200">
            {error}
          </p>
        ) : null}
      </div>

      {activeEntries.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0a0f18] p-10 text-center">
          <Users size={32} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm font-semibold text-gray-400">
            {searchLabel
              ? t("leaderboard.noSearchResults", { search: searchLabel })
              : t("leaderboard.empty")}
          </p>
        </div>
      ) : (
        <>
          {activeEntries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              <PodiumCard entry={activeEntries[1]} place="2nd" />
              <PodiumCard entry={activeEntries[0]} place="1st" featured />
              <PodiumCard entry={activeEntries[2]} place="3rd" />
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1118]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.015] text-xs uppercase tracking-[0.1em] text-gray-500">
                    <th className="w-16 px-4 py-3 text-left font-semibold">#</th>
                    <th className="px-4 py-3 text-left font-semibold">{t("leaderboard.player")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.points")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.accuracy")}</th>
                    <th className="px-4 py-3 text-right font-semibold">{t("leaderboard.predictions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeEntries.map((entry) => (
                    <tr
                      key={`${entry.rank}-${entry.username}`}
                      className={
                        entry.isCurrentUser
                          ? "bg-cyan-400/5 transition-colors hover:bg-cyan-400/[0.07]"
                          : "transition-colors hover:bg-white/[0.02]"
                      }
                    >
                      <td className="px-4 py-3">{rankIcon(entry.rank)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={entry.avatarUrl}
                            fallback={entry.username}
                            level={entry.level}
                            size="lg"
                          />
                          <div className="min-w-0">
                            <div
                              className={`truncate font-semibold ${
                                entry.isCurrentUser ? "text-cyan-300" : "text-white"
                              }`}
                            >
                              {entry.username}
                              {entry.isCurrentUser && (
                                <span className="ml-2 text-[10px] text-cyan-400">(คุณ)</span>
                              )}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-bold text-gray-500">
                              {typeof entry.level === "number" ? (
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5">
                                  LV {entry.level}
                                </span>
                              ) : null}
                              {typeof entry.xp === "number" ? (
                                <span className="font-mono">{entry.xp.toLocaleString()} XP</span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-base font-black text-amber-200">
                          {(entry.totalPoints ?? entry.points).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="ml-auto flex w-24 flex-col items-end gap-1">
                          <span className="font-mono font-semibold text-gray-200">
                            {entry.accuracy}%
                          </span>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-300"
                              style={{
                                width: `${Math.min(Math.max(entry.accuracy, 0), 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono text-gray-400">{entry.predictions}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0a0f18] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold text-gray-400">
          {t("leaderboard.pageStatus", {
            page,
            total: totalPages,
            count: totalRows.toLocaleString(),
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadLeaderboard(Math.max(page - 1, 1))}
            disabled={isPending || page <= 1}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            {t("previousPage")}
          </button>
          <button
            type="button"
            onClick={() => loadLeaderboard(Math.min(page + 1, totalPages))}
            disabled={isPending || page >= totalPages}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("nextPage")}
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {visibleUserRank !== undefined && visibleUserPoints !== undefined && (
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">{t("leaderboard.yourRank")}</span>
              <span className="font-mono text-lg font-bold text-white">
                #{visibleUserRank}
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-amber-200">
              {t("leaderboard.yourPoints", {
                points: visibleUserPoints.toLocaleString(),
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function PodiumCard({
  entry,
  place,
  featured = false,
}: {
  entry?: EventLeaderboardEntry;
  place: string;
  featured?: boolean;
}) {
  return (
    <div
      className={
        featured
          ? "-mt-2 rounded-2xl border border-amber-400/20 bg-[#0d1118] p-4 text-center ring-1 ring-amber-400/10"
          : "rounded-2xl border border-gray-300/10 bg-[#0d1118] p-4 pt-8 text-center"
      }
    >
      <Avatar
        src={entry?.avatarUrl}
        fallback={entry?.username}
        level={entry?.level}
        size={featured ? "xl" : "lg"}
        className="mx-auto mb-2"
      />
      <p className="truncate text-sm font-bold text-white">{entry?.username ?? "—"}</p>
      <p className={featured ? "mt-1 text-xs font-bold text-amber-300" : "mt-1 text-xs text-gray-500"}>
        {featured ? "🥇 " : ""}
        {place}
      </p>
      <p className={featured ? "mt-1 font-mono text-lg font-bold text-amber-200" : "mt-1 font-mono text-sm font-bold text-amber-200"}>
        {entry?.points?.toLocaleString() ?? 0}
      </p>
    </div>
  );
}
