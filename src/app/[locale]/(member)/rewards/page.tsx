"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Badge } from "@/components/ui/Badge";
import {
  DEFAULT_REWARDS_RESPONSE,
  getRewards,
  mapApiReward,
  type RewardViewItem,
} from "@/lib/rewards-api";
import { RewardCategory } from "@/types/common";

export default function RewardsPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState("all");
  const [rewards, setRewards] = useState<RewardViewItem[]>(() =>
    DEFAULT_REWARDS_RESPONSE.data.map(mapApiReward)
  );

  useEffect(() => {
    let isActive = true;

    getRewards({ locale })
      .then((response) => {
        if (isActive) {
          setRewards(response.data.map(mapApiReward).filter((reward) => reward.isActive));
        }
      })
      .catch(() => {
        if (isActive) {
          setRewards(DEFAULT_REWARDS_RESPONSE.data.map(mapApiReward));
        }
      });

    return () => {
      isActive = false;
    };
  }, [locale]);

  const filtered = useMemo(
    () => (tab === "all" ? rewards : rewards.filter((r) => r.category === tab)),
    [rewards, tab]
  );

  const tabs = [
    { key: "all", label: t("rewards.all"), count: rewards.length },
    {
      key: RewardCategory.MERCHANDISE,
      label: t("rewards.merchandise"),
      count: rewards.filter((reward) => reward.category === RewardCategory.MERCHANDISE)
        .length,
    },
    {
      key: RewardCategory.DIGITAL,
      label: t("rewards.digital"),
      count: rewards.filter((reward) => reward.category === RewardCategory.DIGITAL)
        .length,
    },
    {
      key: RewardCategory.COSMETIC,
      label: t("rewards.cosmetic"),
      count: rewards.filter((reward) => reward.category === RewardCategory.COSMETIC)
        .length,
    },
    {
      key: RewardCategory.VOUCHER,
      label: t("rewards.voucher"),
      count: rewards.filter((reward) => reward.category === RewardCategory.VOUCHER)
        .length,
    },
  ];

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
        tabs={tabs}
        activeTab={tab}
        onChange={setTab}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filtered.map((reward) => (
          <Link key={reward.id} href={`/${locale}/rewards/${reward.id}`}>
            <Card hover className="h-full flex flex-col p-4">
              <div className="text-center">
                <div className="mb-2 flex h-12 items-center justify-center">
                  {reward.imageUrl ? (
                    <span
                      role="img"
                      aria-label={reward.name}
                      className="h-12 w-12 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${reward.imageUrl})` }}
                    />
                  ) : (
                    <span className="text-3xl">{reward.image}</span>
                  )}
                </div>
                <div className="mb-2 flex justify-center gap-1">
                  {reward.isLimited && (
                    <Badge variant="gold" size="sm">
                      {t("rewards.limited")}
                    </Badge>
                  )}
                  {!reward.canAfford && (
                    <Badge variant="red" size="sm">
                      {t("rewards.insufficientPoints")}
                    </Badge>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-white mb-1 line-clamp-1">
                  {reward.name}
                </h4>
                <p className="text-[10px] text-gray-500 line-clamp-2 mb-3">
                  {reward.description}
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
