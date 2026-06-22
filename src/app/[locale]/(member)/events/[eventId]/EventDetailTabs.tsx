"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  BookOpen,
  LayoutList,
  Lock,
  Sparkles,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEventStore } from "@/stores/event-store";
import type { SpecialEvent } from "@/types/event";

type TabId = "overview" | "howtoplay" | "matches" | "leaderboard";

type Props = {
  event: SpecialEvent;
  matchCount?: number;
  overviewContent: React.ReactNode;
  howToPlayContent: React.ReactNode;
  matchesContent: React.ReactNode;
  leaderboardContent: React.ReactNode;
};

export function EventDetailTabs({
  event,
  matchCount,
  overviewContent,
  howToPlayContent,
  matchesContent,
  leaderboardContent,
}: Props) {
  const t = useTranslations("events");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const registeredInStore = useEventStore((state) => state.isRegistered(event.id));
  const canAccessCompetitionData = Boolean(event.isRegistered) || registeredInStore;

  const tabs: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    count?: number;
    locked?: boolean;
  }[] = [
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
      count: matchCount ?? event.matches?.length ?? 0,
      locked: !canAccessCompetitionData,
    },
    {
      id: "leaderboard",
      label: t("tabs.leaderboard"),
      icon: <Trophy size={14} />,
      locked: !canAccessCompetitionData,
    },
  ];

  const activeTabConfig = tabs.find((tab) => tab.id === activeTab);
  const activeTabLocked = activeTabConfig?.locked === true;

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
              {tab.locked && <Lock size={12} className="text-amber-300" />}
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
        {activeTabLocked ? (
          <LockedEventContent />
        ) : (
          <>
            {activeTab === "overview" && overviewContent}
            {activeTab === "howtoplay" && howToPlayContent}
            {activeTab === "matches" && matchesContent}
            {activeTab === "leaderboard" && leaderboardContent}
          </>
        )}
      </div>
    </div>
  );
}

function LockedEventContent() {
  const t = useTranslations("events");

  return (
    <div className="rounded-2xl border border-amber-400/15 bg-[#0d1118] p-6 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10">
        <Lock size={24} className="text-amber-300" />
      </div>
      <h3 className="mt-4 text-lg font-black text-white">{t("lockedAccess.title")}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-400">
        {t("lockedAccess.description")}
      </p>

      <div className="mx-auto mt-5 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
        {[
          t("lockedAccess.visibleOverview"),
          t("lockedAccess.visibleRewards"),
          t("lockedAccess.visibleRules"),
        ].map((item) => (
          <div
            key={item}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-gray-300"
          >
            {item}
          </div>
        ))}
      </div>

      <p className="mt-5 text-xs font-semibold text-cyan-300">
        {t("lockedAccess.unlockHint")}
      </p>
    </div>
  );
}
