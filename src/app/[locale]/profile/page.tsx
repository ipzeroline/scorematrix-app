"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserStore } from "@/stores/user-store";
import { useShallow } from "zustand/react/shallow";
import { Target, Zap, Star, TrendingUp, BarChart3 } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const { locale } = useParams<{ locale: string }>();
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      displayName: s.displayName,
      freePoints: s.freePoints,
      premiumCredits: s.premiumCredits,
      level: s.level,
      xp: s.xp,
      accuracy: s.accuracy,
      totalPredictions: s.totalPredictions,
      bestStreak: s.bestStreak,
      achievementsUnlocked: s.achievementsUnlocked,
    }))
  );

  const xpForLevel = user.level * 1000;
  const xpProgress = user.xp - (user.level - 1) * 1000;
  const xpTarget = 1000;
  const topPercent = user.level >= 15 ? 1 : user.level >= 12 ? 5 : user.level >= 8 ? 15 : 30;

  const stats = [
    { label: t("predictions"), value: user.totalPredictions.toString(), icon: Target, className: "text-cyan-400" },
    { label: t("accuracy"), value: `${user.accuracy}%`, icon: TrendingUp, className: "text-green-400" },
    { label: t("bestStreak"), value: user.bestStreak.toString(), icon: Zap, className: "text-amber-400" },
    { label: t("achievements"), value: `${user.achievementsUnlocked}/25`, icon: Star, className: "text-purple-400" },
  ];

  const recentPredictions = [
    { match: "London United vs Mersey City", predicted: "2-1", actual: "2-1", points: 10, status: "CORRECT", label: t("statusCorrect") },
    { match: "Real Catalonia vs Atletico Madrid B", predicted: "1-1", actual: "1-0", points: 0, status: "INCORRECT", label: t("statusIncorrect") },
    { match: "FC Bayern Stadt vs Dortmund 09", predicted: "3-1", actual: "3-2", points: 5, status: "PARTIAL", label: t("statusPartial") },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="flex flex-col sm:flex-row items-center gap-4 p-6">
        <Avatar fallback={user.username.slice(0, 2).toUpperCase()} size="xl" className="ring-2 ring-cyan-500/30" />
        <div className="text-center sm:text-left flex-1">
          <h1 className="text-xl font-bold font-display text-white">{user.displayName}</h1>
          <p className="text-sm text-gray-500">{t("memberSince", { date: "Jan 2026" })}</p>
          <div className="flex gap-2 mt-2 justify-center sm:justify-start">
            <Badge variant="purple">{t("level", { level: user.level })}</Badge>
            <Badge variant="cyan">{t("topPercent", { percent: topPercent })}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <PointsBadge type="free" amount={user.freePoints} size="lg" showLabel />
          <PointsBadge type="premium" amount={user.premiumCredits} size="lg" showLabel />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="text-center p-4">
            <s.icon size={20} className={`mx-auto mb-2 ${s.className}`} />
            <div className="text-lg font-bold font-mono text-white">{s.value}</div>
            <div className="text-[10px] text-gray-500">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* XP Progress */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-white">{t("level", { level: user.level })}</h3>
          <span className="text-xs text-purple-400 font-mono">{xpProgress.toLocaleString()} / {xpTarget.toLocaleString()} XP</span>
        </div>
        <ProgressBar value={xpProgress} max={xpTarget} color="purple" size="md" />
        <p className="text-[10px] text-gray-600 mt-1">
          {t("xpToLevel", { xp: xpTarget - xpProgress, level: user.level + 1 })}
        </p>
      </Card>

      {/* View Full Stats */}
      <Link
        href={`/${locale}/stats`}
        className="flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-sm font-medium"
      >
        <BarChart3 size={16} />
        View Full Statistics
      </Link>

      {/* Recent Predictions */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">{t("recentPredictions")}</h3>
        <div className="space-y-2">
          {recentPredictions.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0">
              <div className="min-w-0">
                <p className="text-xs text-white truncate">{p.match}</p>
                <p className="text-[10px] text-gray-500">
                  {t("predictionLine", { predicted: p.predicted, actual: p.actual })}
                </p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className={`text-xs font-mono font-bold ${
                  p.status === "CORRECT" ? "text-green-400" : p.status === "PARTIAL" ? "text-amber-400" : "text-red-400"
                }`}>
                  {p.label}
                </span>
                <span className="text-xs text-green-400 ml-2">
                  {t("pointsShort", { points: p.points })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
