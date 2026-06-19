"use client";

import { BadgeCheck, Coins, Medal, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { EventReward, EventBadge } from "@/types/event";

type Props = {
  rewards: EventReward[];
  badges: EventBadge[];
};

export function RewardsTable({ rewards, badges }: Props) {
  const t = useTranslations("events");

  if (!rewards || rewards.length === 0) {
    return null;
  }

  const totalPoints = rewards.reduce((sum, r) => {
    const count = Array.isArray(r.rank) ? r.rank[1] - r.rank[0] + 1 : 1;
    return sum + r.freePoints * count;
  }, 0);
  const totalCredits = rewards.reduce((sum, r) => {
    const count = Array.isArray(r.rank) ? r.rank[1] - r.rank[0] + 1 : 1;
    return sum + (r.premiumCredits ?? 0) * count;
  }, 0);

  const getBadgeInfo = (badgeId?: string) => {
    if (!badgeId) return null;
    return badges.find((b) => b.id === badgeId) ?? null;
  };

  const rankIcon = (rank: number | [number, number]) => {
    if (Array.isArray(rank)) return null;
    if (rank === 1)
      return <Medal size={16} className="text-amber-300 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />;
    if (rank === 2)
      return <Medal size={16} className="text-gray-300 drop-shadow-[0_0_6px_rgba(156,163,175,0.4)]" />;
    if (rank === 3)
      return <Medal size={16} className="text-amber-700 drop-shadow-[0_0_6px_rgba(180,83,9,0.4)]" />;
    return null;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-400/15 bg-[#0f1119]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-400/10 bg-amber-400/[0.04] px-5 py-4">
        <div className="flex items-center gap-2">
          <Medal size={16} className="text-amber-300" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-200">
            {t("rewardsTitle")}
          </h2>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck size={13} className="text-green-300" />
            {t("totalRewardPool", {
              points: totalPoints.toLocaleString(),
              credits: totalCredits.toLocaleString(),
            })}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-xs uppercase tracking-[0.1em] text-gray-500">
              <th className="px-5 py-3 text-left font-semibold">{t("rankColumn")}</th>
              <th className="px-5 py-3 text-left font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-green-300" />
                  {t("pointsColumn")}
                </span>
              </th>
              <th className="px-5 py-3 text-left font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <Coins size={12} className="text-amber-300" />
                  {t("creditsColumn")}
                </span>
              </th>
              <th className="px-5 py-3 text-left font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  <BadgeCheck size={12} className="text-purple-300" />
                  {t("badgeColumn")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rewards.map((reward, index) => {
              const badge = getBadgeInfo(reward.badge);
              const rankLabel = Array.isArray(reward.rank)
                ? `${t("rankShort") ?? "R"}${reward.rank[0]}-${reward.rank[1]}`
                : `#${reward.rank}`;
              const isTop3 = !Array.isArray(reward.rank) && reward.rank <= 3;

              return (
                <tr
                  key={`reward-${index}`}
                  className={
                    isTop3
                      ? "bg-amber-400/[0.03] transition-colors hover:bg-amber-400/[0.06]"
                      : "transition-colors hover:bg-white/[0.02]"
                  }
                >
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-2 font-semibold text-white">
                      {rankIcon(reward.rank)}
                      {rankLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1 font-mono font-semibold text-green-300">
                      {reward.freePoints.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    {reward.premiumCredits && reward.premiumCredits > 0 ? (
                      <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-300">
                        {reward.premiumCredits.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-gray-600">{t("noReward")}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {badge ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-400/10 px-2.5 py-1 text-xs font-semibold text-purple-200">
                        <BadgeCheck size={12} />
                        {badge.name}
                      </span>
                    ) : (
                      <span className="text-gray-600">{t("noReward")}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom note */}
      <div className="border-t border-white/5 px-5 py-3">
        <p className="text-xs text-gray-500">{t("rewardsNote")}</p>
      </div>
    </div>
  );
}
