"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  LayoutList,
  Medal,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SpecialEvent } from "@/types/event";

type TabId = "overview" | "howtoplay" | "matches" | "leaderboard";

type Props = {
  event: SpecialEvent;
  overviewContent: React.ReactNode;
  howToPlayContent: React.ReactNode;
  matchesContent: React.ReactNode;
  leaderboardContent: React.ReactNode;
};

export function EventDetailTabs({
  event,
  overviewContent,
  howToPlayContent,
  matchesContent,
  leaderboardContent,
}: Props) {
  const t = useTranslations("events");
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "overview",
      label: t("tabs.overview"),
      icon: <BookOpen size={14} />,
    },
    {
      id: "howtoplay",
      label: t("tabs.howToPlay"),
      icon: <Sparkles size={14} />,
    },
    {
      id: "matches",
      label: t("tabs.matches"),
      icon: <LayoutList size={14} />,
      count: event.matches?.length ?? 0,
    },
    {
      id: "leaderboard",
      label: t("tabs.leaderboard"),
      icon: <Trophy size={14} />,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#080d17] p-1.5">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-colors sm:text-sm",
                activeTab === tab.id
                  ? "border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_12px_rgba(34,211,238,0.1)]"
                  : "border border-transparent text-gray-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-gray-300"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="rounded-full border border-cyan-400/15 bg-cyan-400/10 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && overviewContent}
        {activeTab === "howtoplay" && howToPlayContent}
        {activeTab === "matches" && matchesContent}
        {activeTab === "leaderboard" && leaderboardContent}
      </div>
    </div>
  );
}
