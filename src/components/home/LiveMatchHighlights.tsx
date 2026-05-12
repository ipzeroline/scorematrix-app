"use client";

import { useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MatchStatus } from "@/types";

interface LiveMatch {
  id: string;
  homeTeam: string;
  homeCrest: string;
  awayTeam: string;
  awayCrest: string;
  homeScore: number;
  awayScore: number;
  minute: number;
  league: string;
}

const liveMatches: LiveMatch[] = [
  {
    id: "live-1",
    homeTeam: "London United",
    homeCrest: "",
    awayTeam: "Mersey City",
    awayCrest: "",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    league: "Premier",
  },
  {
    id: "live-2",
    homeTeam: "Real Catalonia",
    homeCrest: "",
    awayTeam: "Atletico Madrid B",
    awayCrest: "",
    homeScore: 1,
    awayScore: 1,
    minute: 34,
    league: "La Liga",
  },
  {
    id: "live-3",
    homeTeam: "FC Bayern Stadt",
    homeCrest: "",
    awayTeam: "Dortmund 09",
    awayCrest: "",
    homeScore: 3,
    awayScore: 0,
    minute: 52,
    league: "Bundesliga",
  },
  {
    id: "live-4",
    homeTeam: "AC Milano Rosso",
    homeCrest: "",
    awayTeam: "Juventus Torino",
    awayCrest: "",
    homeScore: 0,
    awayScore: 0,
    minute: 15,
    league: "Serie A",
  },
  {
    id: "live-5",
    homeTeam: "Paris Saint-Germain B",
    homeCrest: "",
    awayTeam: "Olympique Lyon",
    awayCrest: "",
    homeScore: 2,
    awayScore: 2,
    minute: 78,
    league: "Ligue 1",
  },
];

export function LiveMatchHighlights() {
  const t = useTranslations();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 300;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 300);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h2 className="text-xl font-bold font-display text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {t("dashboard.liveNow")}
        </h2>
        <span className="text-sm text-gray-400">
          {t("dashboard.matchCount", { count: liveMatches.length })}
        </span>
      </div>

      {/* Horizontal scroll wrapper */}
      <div className="relative">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a2e]/90 border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center justify-center"
            aria-label={t("common.scrollLeft")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#1a1a2e]/90 border border-gray-700 text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors flex items-center justify-center"
            aria-label={t("common.scrollRight")}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {liveMatches.map((match) => (
            <Card
              key={match.id}
              neon="cyan"
              hover
              className="flex-shrink-0 w-64"
            >
              {/* League badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {match.league}
                </span>
                <StatusBadge status={MatchStatus.LIVE} />
              </div>

              {/* Teams and score */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                    {match.homeTeam.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-300 text-center truncate w-full">
                    {match.homeTeam}
                  </span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-2xl font-bold font-mono text-white">
                    {match.homeScore} - {match.awayScore}
                  </span>
                  <span className="text-xs text-red-400 font-mono">
                    {match.minute}&apos;
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                    {match.awayTeam.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-300 text-center truncate w-full">
                    {match.awayTeam}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
