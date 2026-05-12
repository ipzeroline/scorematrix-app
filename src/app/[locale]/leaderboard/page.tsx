"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { ProgressBar } from "@/components/ui/ProgressBar";

const MOCK_ENTRIES = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  userId: `user-${i}`,
  username: [
    "NeonProphet", "CyberFan99", "GoalHunter", "MatrixMaster", "PixelScout",
    "DataStriker", "SwiftPredict", "AceAnalyst", "ShadowScorer", "ZenithZero",
    "FluxForward", "GridGuru", "PrimePlaya", "KickSeeker", "CodeCaptain",
    "ByteKicker", "TurboTackle", "PhantomPass", "VortexVision", "RapidResult",
  ][i] || `Player${i + 1}`,
  avatar: null,
  points: Math.round(5000 - i * 200 + Math.random() * 100),
  accuracy: Math.round(85 - i * 1.5 + Math.random() * 5),
  streak: Math.max(0, 12 - Math.floor(i / 2) + Math.floor(Math.random() * 4)),
  level: Math.max(1, 25 - i + Math.floor(Math.random() * 3)),
}));

export default function LeaderboardPage() {
  const [tab, setTab] = useState("weekly");

  const tabs = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "seasonal", label: "Seasonal" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Leaderboard
      </h1>

      <Tabs tabs={tabs} activeTab={tab} onChange={setTab} />

      {/* Current User Position */}
      <Card className="p-4 border-cyan-500/30 neon-cyan flex items-center gap-4">
        <span className="text-sm font-bold font-mono text-cyan-400">#2</span>
        <Avatar fallback="CF" size="md" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">CyberFan99 (You)</p>
          <p className="text-[10px] text-gray-500">Level 12</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-mono text-green-400">4,820 pts</p>
          <p className="text-[10px] text-gray-500">68% accuracy</p>
        </div>
      </Card>

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">
                  Player
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                  Points
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                  Accuracy
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">
                  Streak
                </th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ENTRIES.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`border-b border-gray-800/50 transition-colors ${
                    entry.rank === 2
                      ? "bg-cyan-500/5"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold font-mono ${
                        entry.rank === 1
                          ? "text-amber-400"
                          : entry.rank === 2
                            ? "text-gray-300"
                            : entry.rank === 3
                              ? "text-amber-600"
                              : "text-gray-500"
                      }`}
                    >
                      {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar fallback={entry.username} size="sm" />
                      <span className="text-sm text-white">
                        {entry.username}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-green-400">
                      {entry.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs text-gray-400 w-8">
                        {entry.accuracy}%
                      </span>
                      <div className="w-16 hidden sm:block">
                        <ProgressBar
                          value={entry.accuracy}
                          max={100}
                          color="cyan"
                          size="sm"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-mono text-amber-400">
                      {entry.streak}🔥
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
