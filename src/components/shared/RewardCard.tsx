"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PointsBadge } from "@/components/shared/PointsBadge";
import {
  Reward,
  RewardCategory,
} from "@/types";

const categoryConfig: Record<
  RewardCategory,
  { label: string; icon: string; color: string }
> = {
  [RewardCategory.MERCHANDISE]: {
    label: "Merchandise",
    icon: "👕",
    color: "bg-cyan-500/20 border-cyan-500/30",
  },
  [RewardCategory.DIGITAL]: {
    label: "Digital",
    icon: "🎮",
    color: "bg-purple-500/20 border-purple-500/30",
  },
  [RewardCategory.COSMETIC]: {
    label: "Cosmetic",
    icon: "✨",
    color: "bg-magenta-500/20 border-magenta-500/30",
  },
  [RewardCategory.VOUCHER]: {
    label: "Voucher",
    icon: "🎟️",
    color: "bg-amber-500/20 border-amber-500/30",
  },
};

interface RewardCardProps {
  reward: Reward;
  onRedeem?: (rewardId: string) => void;
  className?: string;
}

export function RewardCard({ reward, onRedeem, className }: RewardCardProps) {
  const cat = categoryConfig[reward.category];
  const outOfStock = reward.stock === 0;

  return (
    <Card
      hover={!outOfStock}
      className={cn(
        "animate-slide-up flex flex-col h-full relative overflow-hidden",
        outOfStock && "opacity-50",
        className
      )}
    >
      {/* Image Placeholder */}
      <div
        className={cn(
          "w-full h-32 rounded-lg border flex items-center justify-center mb-3 relative",
          cat.color
        )}
      >
        <span className="text-4xl">{cat.icon}</span>

        {/* Category Badge */}
        <Badge
          variant={
            reward.category === RewardCategory.MERCHANDISE
              ? "cyan"
              : reward.category === RewardCategory.DIGITAL
                ? "purple"
                : reward.category === RewardCategory.COSMETIC
                  ? "magenta"
                  : "gold"
          }
          size="sm"
          className="absolute top-2 left-2"
        >
          {cat.label}
        </Badge>

        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Name & Description */}
      <h3 className="text-sm font-display font-bold text-white mb-1 truncate">
        {reward.name}
      </h3>
      <p className="text-xs text-gray-400 mb-3 line-clamp-2 flex-1">
        {reward.description}
      </p>

      {/* Cost */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {!reward.isPremiumOnly && reward.pointsCost > 0 && (
          <PointsBadge type="free" amount={reward.pointsCost} size="sm" />
        )}
        {!reward.isFreeOnly && reward.creditCost > 0 && (
          <PointsBadge type="premium" amount={reward.creditCost} size="sm" />
        )}
      </div>

      {/* Stock + Redeem */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className={cn(
            "text-[10px] font-mono",
            outOfStock
              ? "text-red-400"
              : reward.stock <= 5
                ? "text-amber-400"
                : "text-gray-500"
          )}
        >
          {outOfStock
            ? "Sold out"
            : reward.stock <= 5
              ? `Only ${reward.stock} left`
              : `${reward.stock} in stock`}
        </span>

        <Button
          variant="primary"
          size="sm"
          disabled={outOfStock}
          onClick={() => onRedeem?.(reward.id)}
        >
          Redeem
        </Button>
      </div>
    </Card>
  );
}
