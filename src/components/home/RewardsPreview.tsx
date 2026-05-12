"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsBadge } from "@/components/shared/PointsBadge";

interface RewardItem {
  id: string;
  nameKey: string;
  descriptionKey: string;
  image: string;
  pointsCost: number;
  creditCost: number;
  isPremiumOnly: boolean;
  isFreeOnly: boolean;
  stock: number;
  category: string;
}

const rewards: RewardItem[] = [
  {
    id: "rw-1",
    nameKey: "jersey.name",
    descriptionKey: "jersey.description",
    image: "",
    pointsCost: 0,
    creditCost: 500,
    isPremiumOnly: true,
    isFreeOnly: false,
    stock: 42,
    category: "Merchandise",
  },
  {
    id: "rw-2",
    nameKey: "steam.name",
    descriptionKey: "steam.description",
    image: "",
    pointsCost: 2500,
    creditCost: 0,
    isPremiumOnly: false,
    isFreeOnly: true,
    stock: 150,
    category: "Voucher",
  },
  {
    id: "rw-3",
    nameKey: "badge.name",
    descriptionKey: "badge.description",
    image: "",
    pointsCost: 5000,
    creditCost: 200,
    isPremiumOnly: false,
    isFreeOnly: false,
    stock: 88,
    category: "Cosmetic",
  },
  {
    id: "rw-4",
    nameKey: "scarf.name",
    descriptionKey: "scarf.description",
    image: "",
    pointsCost: 1500,
    creditCost: 100,
    isPremiumOnly: false,
    isFreeOnly: false,
    stock: 25,
    category: "Merchandise",
  },
];

const categoryColors: Record<string, "cyan" | "magenta" | "green" | "gold" | "red" | "purple"> = {
  Merchandise: "cyan",
  Voucher: "gold",
  Cosmetic: "purple",
  Digital: "green",
};

export function RewardsPreview() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold font-display text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t("rewards.title")}
        </h3>
        <Badge variant="default" size="sm">
          {t("rewards.redeem")}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="rounded-lg border border-gray-800 bg-[#0a0a0f] overflow-hidden hover:border-gray-600 transition-colors cursor-pointer"
          >
            {/* Image placeholder */}
            <div className="h-20 bg-gray-800 flex items-center justify-center">
              <span className="text-2xl text-gray-600">
                {reward.category === "Merchandise"
                  ? "👕"
                  : reward.category === "Voucher"
                  ? "🎮"
                  : reward.category === "Cosmetic"
                  ? "🏅"
                  : "🎁"}
              </span>
            </div>

            <div className="p-2.5">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h4 className="text-xs font-semibold text-white truncate">
                  {t(`dashboard.rewardItems.${reward.nameKey}`)}
                </h4>
                <Badge
                  variant={categoryColors[reward.category] || "default"}
                  size="sm"
                >
                  {t(`rewards.${reward.category.toLowerCase()}`)}
                </Badge>
              </div>

              <p className="text-[10px] text-gray-500 mb-2 line-clamp-2">
                {t(`dashboard.rewardItems.${reward.descriptionKey}`)}
              </p>

              <div className="flex items-center justify-between">
                {reward.isPremiumOnly ? (
                  <PointsBadge
                    type="premium"
                    amount={reward.creditCost}
                    size="sm"
                  />
                ) : reward.isFreeOnly ? (
                  <PointsBadge
                    type="free"
                    amount={reward.pointsCost}
                    size="sm"
                  />
                ) : (
                  <div className="flex items-center gap-1">
                    <PointsBadge
                      type="free"
                      amount={reward.pointsCost}
                      size="sm"
                    />
                    <span className="text-[10px] text-gray-600">
                      {t("common.or")}
                    </span>
                    <PointsBadge
                      type="premium"
                      amount={reward.creditCost}
                      size="sm"
                    />
                  </div>
                )}
                <span
                  className={`text-[10px] font-mono ${
                    reward.stock <= 30 ? "text-red-400" : "text-gray-500"
                  }`}
                >
                  {t("dashboard.stockLeft", { count: reward.stock })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href={`/${locale}/rewards`}
        className="mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors text-center block"
      >
        {t("dashboard.viewAllRewards")} &rarr;
      </Link>
    </Card>
  );
}
