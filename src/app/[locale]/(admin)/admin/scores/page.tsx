"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { POINTS } from "@/lib/constants";

export default function AdminScoresPage() {
  const [scores] = useState(POINTS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          Score Configuration
        </h1>
        <Button size="sm">Save Changes</Button>
      </div>

      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Prediction Points
        </h3>
        {[
          { label: "Exact Score", key: "exactScore", value: scores.exactScore },
          { label: "Correct Result + Goal Diff", key: "correctResultAndGoalDiff", value: scores.correctResultAndGoalDiff },
          { label: "Correct Result Only", key: "correctResult", value: scores.correctResult },
          { label: "Wrong Result", key: "wrongResult", value: scores.wrongResult },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
          >
            <span className="text-sm text-gray-300">{item.label}</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm cursor-pointer">−</button>
              <span className="w-10 text-center text-sm font-mono text-white">
                {item.value}
              </span>
              <button className="w-8 h-8 rounded bg-gray-800 text-gray-400 hover:bg-gray-700 text-sm cursor-pointer">+</button>
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Bonus Settings
        </h3>
        <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
          <span className="text-sm text-gray-300">Streak Bonus (per level)</span>
          <span className="text-sm font-mono text-cyan-400">
            +{scores.streakBonusPerLevel} pts
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-800/50">
          <span className="text-sm text-gray-300">Combo Threshold</span>
          <span className="text-sm font-mono text-cyan-400">
            {scores.comboThreshold} streak
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-gray-300">Combo Multiplier</span>
          <span className="text-sm font-mono text-cyan-400">
            x{scores.comboMultiplier}
          </span>
        </div>
      </Card>
    </div>
  );
}
