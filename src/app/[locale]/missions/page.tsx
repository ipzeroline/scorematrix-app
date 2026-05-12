"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Tabs } from "@/components/ui/Tabs";
import { useState } from "react";
import { Zap, Star, Clock } from "lucide-react";

const DAILY_MISSIONS = [
  { id: "d1", title: "Predict 3 Matches", desc: "Submit predictions for 3 different matches today", category: "predict", progress: 2, target: 3, points: 50, xp: 100, completed: false, claimed: false },
  { id: "d2", title: "Perfect Accuracy", desc: "Get 1 exact score prediction correct", category: "accuracy", progress: 0, target: 1, points: 100, xp: 200, completed: false, claimed: false },
  { id: "d3", title: "Daily Login Streak", desc: "Log in for 7 consecutive days", category: "daily_login", progress: 5, target: 7, points: 30, xp: 50, completed: false, claimed: false },
  { id: "d4", title: "Share a Match", desc: "Share a match prediction with friends", category: "social", progress: 1, target: 1, points: 20, xp: 30, completed: true, claimed: false },
  { id: "d5", title: "Predict a Draw", desc: "Correctly predict a draw result", category: "predict", progress: 0, target: 1, points: 75, xp: 150, completed: false, claimed: false },
];

const WEEKLY_MISSIONS = [
  { id: "w1", title: "Predict 20 Matches", desc: "Submit 20 predictions this week", category: "predict", progress: 14, target: 20, points: 200, xp: 500, completed: false, claimed: false },
  { id: "w2", title: "Win Streak 5", desc: "Get 5 correct predictions in a row", category: "streak", progress: 3, target: 5, points: 300, xp: 750, completed: false, claimed: false },
  { id: "w3", title: "Accuracy Champion", desc: "Maintain 70%+ accuracy for the week", category: "accuracy", progress: 68, target: 70, points: 500, xp: 1000, completed: false, claimed: false },
];

const ACHIEVEMENTS = [
  { name: "Rookie", desc: "Submit first prediction", unlocked: true, icon: "🌟" },
  { name: "Hot Streak", desc: "5 consecutive correct", unlocked: true, icon: "🔥" },
  { name: "Centurion", desc: "100 predictions", unlocked: true, icon: "💯" },
  { name: "Sharpshooter", desc: "10 exact scores", unlocked: false, icon: "🎯" },
  { name: "Marathon", desc: "Predict 30 days straight", unlocked: false, icon: "🏃" },
  { name: "Prophet", desc: "Predict an upset correctly", unlocked: true, icon: "🔮" },
  { name: "Social Star", desc: "Invite 5 friends", unlocked: false, icon: "⭐" },
  { name: "Veteran", desc: "Level 25 reached", unlocked: false, icon: "👑" },
];

export default function MissionsPage() {
  const [tab, setTab] = useState("daily");
  const [showClaimed, setShowClaimed] = useState<Record<string, boolean>>({});

  const claim = (id: string) => {
    setShowClaimed((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            Missions
          </h1>
          <p className="text-sm text-gray-500">
            Complete missions to earn points and XP
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <Star size={16} className="text-purple-400" />
            <span className="text-sm text-purple-400 font-mono">
              Level 12 • 2,840 XP
            </span>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "daily", label: "Daily", count: DAILY_MISSIONS.length },
          { key: "weekly", label: "Weekly", count: WEEKLY_MISSIONS.length },
          { key: "achievements", label: "Achievements", count: ACHIEVEMENTS.length },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "daily" && (
        <div className="space-y-3">
          {DAILY_MISSIONS.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">
                      {m.title}
                    </h4>
                    {m.completed && !showClaimed[m.id] && (
                      <Badge variant="green">Ready</Badge>
                    )}
                    {showClaimed[m.id] && (
                      <Badge variant="green">Claimed</Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
                  <ProgressBar
                    value={m.progress}
                    max={m.target}
                    color="cyan"
                    size="sm"
                    showLabel
                  />
                </div>
                <div className="text-right shrink-0">
                  <PointsBadge
                    type="free"
                    amount={m.points}
                    size="sm"
                    showLabel
                  />
                  <p className="text-[10px] text-purple-400 mt-1">
                    +{m.xp} XP
                  </p>
                  {m.completed && !showClaimed[m.id] ? (
                    <Button
                      size="sm"
                      variant="gold"
                      className="mt-2"
                      onClick={() => claim(m.id)}
                    >
                      Claim
                    </Button>
                  ) : showClaimed[m.id] ? (
                    <p className="text-xs text-green-400 mt-2">✓ Claimed</p>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "weekly" && (
        <div className="space-y-3">
          {WEEKLY_MISSIONS.map((m) => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-2">{m.desc}</p>
                  <ProgressBar
                    value={m.progress}
                    max={m.target}
                    color="purple"
                    size="sm"
                    showLabel
                  />
                </div>
                <div className="text-right shrink-0">
                  <PointsBadge
                    type="free"
                    amount={m.points}
                    size="sm"
                    showLabel
                  />
                  <p className="text-[10px] text-purple-400 mt-1">
                    +{m.xp} XP
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "achievements" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a, i) => (
            <Card
              key={i}
              className={`p-4 text-center ${
                a.unlocked ? "" : "opacity-50"
              }`}
            >
              <div className="text-2xl mb-2">{a.icon}</div>
              <h4 className="text-xs font-semibold text-white mb-1">
                {a.name}
              </h4>
              <p className="text-[10px] text-gray-500">{a.desc}</p>
              {!a.unlocked && (
                <p className="text-[10px] text-gray-600 mt-2">🔒 Locked</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
