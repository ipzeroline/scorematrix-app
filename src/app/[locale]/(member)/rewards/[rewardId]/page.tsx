"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Modal } from "@/components/ui/Modal";
import {
  DEFAULT_REWARDS_RESPONSE,
  getReward,
  mapApiReward,
  type RewardViewItem,
  redeemReward,
} from "@/lib/rewards-api";
import { useUserStore } from "@/stores/user-store";
import { useNotificationStore } from "@/stores/notification-store";

type RewardDetailState = {
  key: string | null;
  reward: RewardViewItem | null;
  loadFailed: boolean;
};

export default function RewardDetailPage() {
  const t = useTranslations();
  const { rewardId, locale } = useParams<{ rewardId: string; locale: string }>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const spendFreePoints = useUserStore((s) => s.spendFreePoints);
  const spendCredits = useUserStore((s) => s.spendCredits);
  const addToast = useNotificationStore((s) => s.addToast);
  const requestKey = `${locale}:${rewardId}`;
  const [detailState, setDetailState] = useState<RewardDetailState>({
    key: null,
    reward: null,
    loadFailed: false,
  });

  useEffect(() => {
    let isActive = true;

    getReward(rewardId, { locale })
      .then((response) => {
        if (isActive) {
          setDetailState({
            key: requestKey,
            reward: mapApiReward(response),
            loadFailed: false,
          });
        }
      })
      .catch(() => {
        if (isActive) {
          const fallbackReward = DEFAULT_REWARDS_RESPONSE.data.find(
            (item) => String(item.id) === rewardId
          );
          setDetailState({
            key: requestKey,
            reward: fallbackReward ? mapApiReward(fallbackReward) : null,
            loadFailed: true,
          });
        }
      });

    return () => {
      isActive = false;
    };
  }, [locale, requestKey, rewardId]);

  const isLoading = detailState.key !== requestKey;
  const reward = isLoading ? null : detailState.reward;
  const userPoints = reward?.userBalance.freePoints ?? 0;
  const canRedeem = Boolean(reward?.canAfford && reward.stock > 0 && reward.isActive);
  const pointsShortfall = useMemo(() => {
    if (!reward) return 0;
    return Math.max(reward.pointsCost - userPoints, 0);
  }, [reward, userPoints]);

  const handleRedeem = async () => {
    if (!reward || isRedeeming) return;
    setIsRedeeming(true);
    setShowConfirm(false);

    try {
      await redeemReward(reward.id, undefined, { locale });

      let success = false;
      if (reward.isFreeOnly) {
        success = spendFreePoints(reward.pointsCost);
      } else {
        success = spendCredits(reward.creditCost);
      }

      if (success) {
        setRedeemed(true);
        addToast({
          type: "success",
          title: t("common.success"),
          message: t("rewards.redemptionSuccess") || "Redemption successful!",
        });
      } else {
        addToast({
          type: "error",
          title: t("common.error"),
          message: t("rewards.insufficientPoints") || "Insufficient points!",
        });
      }
    } catch (err: any) {
      console.error("Redemption error:", err);
      let success = false;
      if (reward.isFreeOnly) {
        success = spendFreePoints(reward.pointsCost);
      } else {
        success = spendCredits(reward.creditCost);
      }
      if (success) {
        setRedeemed(true);
        addToast({
          type: "success",
          title: t("common.success"),
          message: t("rewards.redemptionSuccess") || "Redemption successful!",
        });
      } else {
        addToast({
          type: "error",
          title: t("common.error"),
          message: err?.message || "Failed to redeem reward.",
        });
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-gray-800" />
        <Card className="space-y-5 p-6">
          <div className="mx-auto h-16 w-16 animate-pulse rounded-2xl bg-gray-800" />
          <div className="mx-auto h-5 w-56 animate-pulse rounded bg-gray-800" />
          <div className="h-20 animate-pulse rounded-lg bg-gray-800/80" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 animate-pulse rounded-lg bg-gray-800/80" />
            <div className="h-20 animate-pulse rounded-lg bg-gray-800/80" />
          </div>
        </Card>
      </div>
    );
  }

  if (!reward) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-display text-xl font-bold text-white">{t("rewards.detail")}</h1>
        <Card className="p-6 text-center">
          <p className="text-sm font-semibold text-white">{t("rewards.notFound")}</p>
          <p className="mt-1 text-xs text-gray-500">
            {t("rewards.unavailable")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-xl font-bold text-white">
        {t("rewards.detail")}
      </h1>

      <Card className="p-6">
        {detailState.loadFailed && (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-200">
            {t("rewards.cachedData")}
          </div>
        )}

        <div className="mb-6 text-center">
          <div className="mb-3 flex h-20 items-center justify-center">
            {reward.imageUrl ? (
              <span
                role="img"
                aria-label={reward.name}
                className="h-20 w-20 rounded-2xl bg-cover bg-center"
                style={{ backgroundImage: `url(${reward.imageUrl})` }}
              />
            ) : (
              <span className="text-5xl">{reward.image}</span>
            )}
          </div>
          <div className="mb-2 flex justify-center gap-2">
            {reward.isLimited && <Badge variant="gold" size="sm">{t("rewards.limited")}</Badge>}
            {!reward.canAfford && (
              <Badge variant="red" size="sm">{t("rewards.insufficientPoints")}</Badge>
            )}
            {reward.stock <= 0 && <Badge variant="red" size="sm">{t("rewards.outOfStock")}</Badge>}
          </div>
          <h2 className="font-display mb-1 text-lg font-bold text-white">
            {reward.name}
          </h2>
          <Badge variant="cyan" size="sm">
            {reward.category}
          </Badge>
        </div>

        <p className="mb-4 text-sm leading-relaxed text-gray-400">
          {reward.longDescription}
        </p>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-[#0a0a0f] p-3 text-center">
            {reward.isFreeOnly ? (
              <>
                <p className="mb-1 text-xs text-gray-500">{t("rewards.cost")}</p>
                <PointsBadge type="free" amount={reward.pointsCost} size="lg" showLabel />
              </>
            ) : (
              <>
                <p className="mb-1 text-xs text-gray-500">{t("rewards.cost")}</p>
                <PointsBadge type="premium" amount={reward.creditCost} size="lg" showLabel />
              </>
            )}
          </div>
          <div className="rounded-lg bg-[#0a0a0f] p-3 text-center">
            <p className="mb-1 text-xs text-gray-500">{t("rewards.yourBalance")}</p>
            <PointsBadge
              type={reward.isFreeOnly ? "free" : "premium"}
              amount={reward.isFreeOnly ? userPoints : 0}
              size="lg"
              showLabel
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            <p className="text-xs text-gray-500">{t("rewards.stock")}</p>
            <p className="mt-1 text-sm font-semibold text-white">{reward.stock.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
            <p className="text-xs text-gray-500">{t("rewards.redeemed")}</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {reward.redemptionCount.toLocaleString()}
            </p>
          </div>
        </div>

        {reward.requiresShipping && (
          <div className="mb-4 rounded-lg border border-cyan-500/10 bg-cyan-500/5 p-3">
            <p className="mb-1 text-xs font-semibold text-cyan-400">
              {t("rewards.shippingInfo")}
            </p>
            <p className="text-xs text-gray-400">
              {t("rewards.requiresShipping")}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {redeemed ? (
            <div className="flex-1 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
              <p className="text-green-400 font-semibold text-sm">
                {t("rewards.redemptionSuccess")}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {t("rewards.processingSoon")}
              </p>
            </div>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              neon
              disabled={!canRedeem}
              onClick={() => setShowConfirm(true)}
            >
              {canRedeem ? t("rewards.redeemNow") : t("rewards.insufficientPoints")}
            </Button>
          )}
        </div>

        {!canRedeem && (
          <p className="mt-2 text-center text-xs text-red-400">
            {reward.stock <= 0
              ? t("rewards.outOfStockDetail")
              : reward.isActive
                ? t("rewards.pointsShortfall", { points: pointsShortfall.toLocaleString() })
                : t("rewards.unavailableShort")}
          </p>
        )}
      </Card>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("rewards.confirmRedemption")}
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="mb-2 text-3xl">{reward.image}</div>
            <p className="text-sm text-white font-semibold">{reward.name}</p>
            <div className="mt-2">
              <PointsBadge
                type={reward.isFreeOnly ? "free" : "premium"}
                amount={reward.isFreeOnly ? reward.pointsCost : reward.creditCost}
                size="md"
                showLabel
              />
              <span className="text-gray-600 mx-2">{t("rewards.willBeDeducted")}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              className="flex-1"
              variant="gold"
              disabled={isRedeeming}
              onClick={handleRedeem}
            >
              {isRedeeming ? t("common.loading") : t("common.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
