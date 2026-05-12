"use client";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Trophy, Target, Zap, Star, TrendingUp } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="flex flex-col sm:flex-row items-center gap-4 p-6">
        <Avatar fallback="CF" size="xl" className="ring-2 ring-cyan-500/30" />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl font-bold font-display text-white">
            CyberFan99
          </h1>
          <p className="text-sm text-gray-500">Member since Jan 2026</p>
          <div className="flex gap-2 mt-2 justify-center sm:justify-start">
            <Badge variant="purple">Level 12</Badge>
            <Badge variant="cyan">Top 5%</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <PointsBadge type="free" amount={2840} size="lg" showLabel />
          <PointsBadge type="premium" amount={150} size="lg" showLabel />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Predictions", value: "342", icon: Target, color: "cyan" },
          { label: "Accuracy", value: "68%", icon: TrendingUp, color: "green" },
          { label: "Best Streak", value: "12", icon: Zap, color: "gold" },
          { label: "Achievements", value: "18/25", icon: Star, color: "purple" },
        ].map((s) => (
          <Card key={s.label} className="text-center p-4">
            <s.icon size={20} className={`mx-auto mb-2 text-${s.color}-400`} />
            <div className="text-lg font-bold font-mono text-white">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* XP Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-white">Level 12</h3>
          <span className="text-xs text-purple-400 font-mono">2,840 / 3,000 XP</span>
        </div>
        <ProgressBar value={2840} max={3000} color="purple" size="md" />
        <p className="text-[10px] text-gray-600 mt-1">160 XP to Level 13</p>
      </Card>

      {/* Recent Predictions */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Recent Predictions
        </h3>
        <div className="space-y-2">
          {[
            {
              match: "London United vs Mersey City",
              predicted: "2-1",
              actual: "2-1",
              points: 10,
              status: "CORRECT",
            },
            {
              match: "Real Catalonia vs Atletico Madrid B",
              predicted: "1-1",
              actual: "1-0",
              points: 0,
              status: "INCORRECT",
            },
            {
              match: "FC Bayern Stadt vs Dortmund 09",
              predicted: "3-1",
              actual: "3-2",
              points: 5,
              status: "PARTIAL",
            },
          ].map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-xs text-white truncate">{p.match}</p>
                <p className="text-[10px] text-gray-500">
                  Pred: {p.predicted} → Actual: {p.actual}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span
                  className={`text-xs font-mono font-bold ${
                    p.status === "CORRECT"
                      ? "text-green-400"
                      : p.status === "PARTIAL"
                        ? "text-amber-400"
                        : "text-red-400"
                  }`}
                >
                  {p.status}
                </span>
                <span className="text-xs text-green-400 ml-2">
                  +{p.points}pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
