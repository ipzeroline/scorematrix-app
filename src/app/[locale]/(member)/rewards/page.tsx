"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { RewardCategory } from "@/types/common";

const REWARDS = [
  {
    id: "r1", name: "ScoreMatrix Football Jersey", desc: "Official team jersey with ScoreMatrix branding", category: RewardCategory.MERCHANDISE,
    pointsCost: 500, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 25, image: "👕",
  },
  {
    id: "r2", name: "Steam Gift Card $10", desc: "Digital Steam wallet code", category: RewardCategory.VOUCHER,
    pointsCost: 1000, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 50, image: "🎮",
  },
  {
    id: "r3", name: "Golden Profile Badge", desc: "Exclusive gold-animated profile badge", category: RewardCategory.COSMETIC,
    pointsCost: 0, creditCost: 100, isFreeOnly: false, isPremiumOnly: true, stock: 999, image: "✨",
  },
  {
    id: "r4", name: "ScoreMatrix Scarf", desc: "Limited edition winter scarf", category: RewardCategory.MERCHANDISE,
    pointsCost: 300, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 15, image: "🧣",
  },
  {
    id: "r5", name: "Wallpaper Pack: Cyberpunk", desc: "HD cyberpunk-themed wallpapers", category: RewardCategory.DIGITAL,
    pointsCost: 50, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 999, image: "🖼️",
  },
  {
    id: "r6", name: "Neon Username Effect", desc: "Animated neon text effect for your username", category: RewardCategory.COSMETIC,
    pointsCost: 0, creditCost: 75, isFreeOnly: false, isPremiumOnly: true, stock: 999, image: "💫",
  },
  {
    id: "r7", name: "ScoreMatrix Mug", desc: "Ceramic mug with heat-reactive design", category: RewardCategory.MERCHANDISE,
    pointsCost: 200, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 40, image: "☕",
  },
  {
    id: "r8", name: "Google Play Gift Card $5", desc: "Digital Google Play code", category: RewardCategory.VOUCHER,
    pointsCost: 500, creditCost: 0, isFreeOnly: true, isPremiumOnly: false, stock: 30, image: "📱",
  },
];

export default function RewardsPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState("all");

  const filtered = tab === "all" ? REWARDS : REWARDS.filter((r) => r.category === tab);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        {t("rewards.title")}
      </h1>

      {/* Anti-gambling disclaimer */}
      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          <strong className="text-red-400">{t("common.important")}:</strong>{" "}
          {t("rewards.disclaimerFull")}
        </p>
      </div>

      <Tabs
        tabs={[
          { key: "all", label: t("rewards.all"), count: REWARDS.length },
          { key: RewardCategory.MERCHANDISE, label: t("rewards.merchandise") },
          { key: RewardCategory.DIGITAL, label: t("rewards.digital") },
          { key: RewardCategory.COSMETIC, label: t("rewards.cosmetic") },
          { key: RewardCategory.VOUCHER, label: t("rewards.voucher") },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((reward) => (
          <Link key={reward.id} href={`/${locale}/rewards/${reward.id}`}>
            <Card hover className="h-full flex flex-col p-4">
              <div className="text-center">
                <div className="text-3xl mb-2">{reward.image}</div>
                <h4 className="text-xs font-semibold text-white mb-1 line-clamp-1">
                  {reward.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">
                  {reward.desc}
                </p>
              </div>
              <div className="mt-auto space-y-1.5">
                <div className="flex justify-center gap-1">
                  {reward.isFreeOnly && (
                    <PointsBadge type="free" amount={reward.pointsCost} size="sm" showLabel />
                  )}
                  {reward.isPremiumOnly && (
                    <PointsBadge type="premium" amount={reward.creditCost} size="sm" showLabel />
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] ${reward.stock < 20 ? "text-red-400" : "text-gray-600"}`}>
                    {t("dashboard.stockLeft", { count: reward.stock })}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
