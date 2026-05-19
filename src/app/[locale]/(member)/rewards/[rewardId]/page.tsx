"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Modal } from "@/components/ui/Modal";
import { RewardCategory } from "@/types/common";

export default function RewardDetailPage() {
  const { rewardId } = useParams<{ rewardId: string; locale: string }>();
  const [showConfirm, setShowConfirm] = useState(false);
  const [redeemed, setRedeemed] = useState(false);

  const reward = {
    id: rewardId as string,
    name: "ScoreMatrix Football Jersey",
    description: "Official team jersey with ScoreMatrix branding and cyberpunk design elements.",
    longDescription: "Premium quality football jersey made from breathable fabric. Features the iconic ScoreMatrix logo with neon cyan accents on a dark background. Available in sizes S-3XL. Machine washable. Ships worldwide.",
    category: RewardCategory.MERCHANDISE,
    pointsCost: 500,
    creditCost: 0,
    isFreeOnly: true,
    isPremiumOnly: false,
    stock: 25,
    image: "👕",
    requiresShipping: true,
    shippingInfo: {
      estimatedDays: 14,
      regions: ["Asia", "Europe", "North America", "South America", "Oceania"],
      trackingAvailable: true,
    },
  };

  const userPoints = 2840;
  const canRedeem = reward.isFreeOnly
    ? userPoints >= reward.pointsCost
    : userPoints >= (reward.creditCost || 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Reward Detail
      </h1>

      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{reward.image}</div>
          <h2 className="text-lg font-bold font-display text-white mb-1">
            {reward.name}
          </h2>
          <Badge variant="cyan" size="sm">
            {reward.category}
          </Badge>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4">
          {reward.longDescription}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-lg bg-[#0a0a0f] p-3 text-center">
            {reward.isFreeOnly ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Cost</p>
                <PointsBadge type="free" amount={reward.pointsCost} size="lg" showLabel />
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-1">Cost</p>
                <PointsBadge type="premium" amount={reward.creditCost} size="lg" showLabel />
              </>
            )}
          </div>
          <div className="rounded-lg bg-[#0a0a0f] p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Your Balance</p>
            <PointsBadge
              type={reward.isFreeOnly ? "free" : "premium"}
              amount={reward.isFreeOnly ? userPoints : 150}
              size="lg"
              showLabel
            />
          </div>
        </div>

        {reward.requiresShipping && reward.shippingInfo && (
          <div className="rounded-lg bg-cyan-500/5 border border-cyan-500/10 p-3 mb-4">
            <p className="text-xs text-cyan-400 font-semibold mb-1">
              Shipping Info
            </p>
            <p className="text-xs text-gray-400">
              Estimated delivery: {reward.shippingInfo.estimatedDays} days
            </p>
            <p className="text-xs text-gray-500">
              Regions: {reward.shippingInfo.regions.join(", ")}
            </p>
            <p className="text-xs text-gray-500">
              Tracking: {reward.shippingInfo.trackingAvailable ? "Available" : "Not available"}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          {redeemed ? (
            <div className="flex-1 rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-center">
              <p className="text-green-400 font-semibold text-sm">
                Redemption Successful!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Your reward will be processed shortly.
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
              {canRedeem ? "Redeem Now" : "Insufficient Points"}
            </Button>
          )}
        </div>

        {!canRedeem && (
          <p className="text-xs text-red-400 mt-2 text-center">
            You need {reward.isFreeOnly ? `${reward.pointsCost - userPoints} more points` : `more credits`} to redeem this item.
          </p>
        )}
      </Card>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Redemption"
      >
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="text-3xl mb-2">{reward.image}</div>
            <p className="text-sm text-white font-semibold">{reward.name}</p>
            <div className="mt-2">
              <PointsBadge
                type={reward.isFreeOnly ? "free" : "premium"}
                amount={reward.isFreeOnly ? reward.pointsCost : reward.creditCost}
                size="md"
                showLabel
              />
              <span className="text-gray-600 mx-2">will be deducted</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              variant="gold"
              onClick={() => {
                setShowConfirm(false);
                setRedeemed(true);
              }}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
