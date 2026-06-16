"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/Tabs";

type Props = {
  overviewTab: React.ReactNode;
  statsTab: React.ReactNode;
  lineupsTab: React.ReactNode;
  timelineTab: React.ReactNode;
  labels: {
    overview: string;
    stats: string;
    lineups: string;
    timeline: string;
  };
  eventCount?: number;
};

export default function MatchTabsClient({
  overviewTab,
  statsTab,
  lineupsTab,
  timelineTab,
  labels,
  eventCount,
}: Props) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: labels.overview },
    { key: "stats", label: labels.stats },
    { key: "lineups", label: labels.lineups },
    { key: "timeline", label: labels.timeline, count: eventCount },
  ];

  return (
    <div className="space-y-4">
      {/* Esports Tab Navigation HUD */}
      <div className="border border-border bg-surface rounded-xl p-1.5 shadow-md">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="border-none"
        />
      </div>

      {/* Grouped Tab Contents with micro slide animations */}
      <div className="space-y-4">
        {activeTab === "overview" && (
          <div className="space-y-4 animate-[slideUp_0.35s_ease-out]">
            {overviewTab}
          </div>
        )}
        {activeTab === "stats" && (
          <div className="space-y-4 animate-[slideUp_0.35s_ease-out]">
            {statsTab}
          </div>
        )}
        {activeTab === "lineups" && (
          <div className="space-y-4 animate-[slideUp_0.35s_ease-out]">
            {lineupsTab}
          </div>
        )}
        {activeTab === "timeline" && (
          <div className="space-y-4 animate-[slideUp_0.35s_ease-out]">
            {timelineTab}
          </div>
        )}
      </div>
    </div>
  );
}
