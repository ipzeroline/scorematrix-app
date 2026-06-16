"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Award,
  BadgeCheck,
  Gamepad2,
  Gift,
  Shirt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
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

const categoryIcons: Record<string, LucideIcon> = {
  Merchandise: Shirt,
  Voucher: Gamepad2,
  Cosmetic: Award,
  Digital: BadgeCheck,
};

const categoryIconClasses: Record<string, string> = {
  Merchandise: "text-cyan-200 bg-cyan-400/10 border-cyan-400/25",
  Voucher: "text-amber-200 bg-amber-400/10 border-amber-400/25",
  Cosmetic: "text-purple-200 bg-purple-400/10 border-purple-400/25",
  Digital: "text-green-200 bg-green-400/10 border-green-400/25",
};

export function RewardsPreview() {
  const locale = useLocale();
  const t = useTranslations();

  return (
    <Card className="rewards-preview-card relative flex h-full flex-col overflow-hidden border-pink-500/20 !bg-[#160d15]">
      <div className="rewards-preview-orb absolute -right-14 -top-16 h-36 w-36 rounded-full bg-pink-500/20 blur-3xl" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rewards-preview-icon grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-pink-400/35 bg-pink-500/10 text-pink-200">
            <Gift size={21} strokeWidth={2.35} aria-hidden="true" />
          </span>
          <h3 className="truncate text-lg font-bold text-white">
            {t("rewards.title")}
          </h3>
        </div>
        <Badge variant="magenta" size="sm" className="shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} strokeWidth={2.4} aria-hidden="true" />
            <span>{t("rewards.redeem")}</span>
          </span>
        </Badge>
      </div>

      <div className="relative grid grid-cols-2 gap-3 flex-1">
        {rewards.map((reward) => {
          const RewardIcon = categoryIcons[reward.category] ?? Gift;
          return (
          <div
            key={reward.id}
            className="reward-preview-item rounded-lg border border-pink-500/15 bg-[#0a0a0f]/85 overflow-hidden transition-colors cursor-pointer"
          >
            {/* Image placeholder */}
            <div className="reward-preview-image flex h-20 items-center justify-center">
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl border ${
                  categoryIconClasses[reward.category] || "border-pink-400/25 bg-pink-400/10 text-pink-200"
                }`}
              >
                <RewardIcon size={24} strokeWidth={2.2} aria-hidden="true" />
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
                  <span className="flex items-center gap-1">
                    <RewardIcon size={11} strokeWidth={2.35} aria-hidden="true" />
                    <span>{t(`rewards.${reward.category.toLowerCase()}`)}</span>
                  </span>
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
          );
        })}
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
