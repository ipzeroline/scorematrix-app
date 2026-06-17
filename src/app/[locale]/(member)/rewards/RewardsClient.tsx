"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  Box,
  ChevronRight,
  Coins,
  Gamepad2,
  Gem,
  Gift,
  PackageCheck,
  ShieldCheck,
  Shirt,
  Sparkles,
  Ticket,
  Trophy,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { Badge } from "@/components/ui/Badge";
import {
  DEFAULT_REWARDS_RESPONSE,
  getRewards,
  mapApiReward,
  type RewardViewItem,
} from "@/lib/rewards-api";
import { RewardCategory } from "@/types/common";
import { cn } from "@/lib/utils";

type RewardTabKey = "all" | RewardCategory;

const categoryIcons = {
  all: Trophy,
  [RewardCategory.MERCHANDISE]: Shirt,
  [RewardCategory.DIGITAL]: Gamepad2,
  [RewardCategory.COSMETIC]: Sparkles,
  [RewardCategory.VOUCHER]: Ticket,
} satisfies Record<RewardTabKey, typeof Trophy>;

const categoryTone = {
  all: "cyan",
  [RewardCategory.MERCHANDISE]: "cyan",
  [RewardCategory.DIGITAL]: "purple",
  [RewardCategory.COSMETIC]: "magenta",
  [RewardCategory.VOUCHER]: "gold",
} satisfies Record<RewardTabKey, "cyan" | "purple" | "magenta" | "gold">;

export default function RewardsPage() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const [tab, setTab] = useState<RewardTabKey>("all");
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

  const redeemableCount = rewards.filter(
    (reward) => reward.canAfford && reward.stock > 0
  ).length;
  const totalStock = rewards.reduce((sum, reward) => sum + Math.max(reward.stock, 0), 0);
  const pointBalance = rewards.reduce(
    (max, reward) => Math.max(max, reward.userBalance.freePoints),
    0
  );
  const featuredReward =
    rewards.find((reward) => reward.canAfford && reward.stock > 0) ??
    rewards.find((reward) => reward.stock > 0) ??
    rewards[0];

  const tabs: Array<{
    key: RewardTabKey;
    label: string;
    count: number;
    icon: typeof Trophy;
  }> = [
    { key: "all", label: t("rewards.all"), count: rewards.length, icon: categoryIcons.all },
    {
      key: RewardCategory.MERCHANDISE,
      label: t("rewards.merchandise"),
      count: rewards.filter((reward) => reward.category === RewardCategory.MERCHANDISE)
        .length,
      icon: categoryIcons[RewardCategory.MERCHANDISE],
    },
    {
      key: RewardCategory.DIGITAL,
      label: t("rewards.digital"),
      count: rewards.filter((reward) => reward.category === RewardCategory.DIGITAL)
        .length,
      icon: categoryIcons[RewardCategory.DIGITAL],
    },
    {
      key: RewardCategory.COSMETIC,
      label: t("rewards.cosmetic"),
      count: rewards.filter((reward) => reward.category === RewardCategory.COSMETIC)
        .length,
      icon: categoryIcons[RewardCategory.COSMETIC],
    },
    {
      key: RewardCategory.VOUCHER,
      label: t("rewards.voucher"),
      count: rewards.filter((reward) => reward.category === RewardCategory.VOUCHER)
        .length,
      icon: categoryIcons[RewardCategory.VOUCHER],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-fuchsia-400/20 bg-[#080912] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(217,70,239,0.13),transparent_34%),linear-gradient(315deg,rgba(34,211,238,0.12),transparent_32%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.05fr_0.95fr] xl:items-stretch">
          <div className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="magenta" size="md" className="uppercase tracking-wider">
                  {t("rewards.vault")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <ShieldCheck size={14} />
                  {t("rewards.skillNotice")}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("rewards.title")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t("rewards.subtitle")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-300/10 text-red-200">
                  <ShieldCheck size={22} />
                </span>
                <p className="text-sm font-medium leading-6 text-gray-300 sm:text-base">
                  <strong className="text-red-300">{t("common.important")}:</strong>{" "}
                  {t("rewards.disclaimerFull")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroMetric
              icon={Gift}
              label={t("rewards.availableRewards")}
              value={rewards.length.toLocaleString()}
              helper={t("rewards.catalog")}
              tone="text-fuchsia-300"
              className="sm:col-span-2"
            />
            <HeroMetric
              icon={BadgeCheck}
              label={t("rewards.redeemableNow")}
              value={redeemableCount.toLocaleString()}
              helper={t("rewards.redeem")}
              tone="text-emerald-300"
            />
            <HeroMetric
              icon={PackageCheck}
              label={t("rewards.totalStock")}
              value={totalStock.toLocaleString()}
              helper={t("rewards.inStock")}
              tone="text-cyan-300"
            />
            <HeroMetric
              icon={Coins}
              label={t("rewards.pointBalance")}
              value={pointBalance.toLocaleString()}
              helper={t("rewards.freePointsCost")}
              tone="text-amber-300"
            />
            <HeroMetric
              icon={Gem}
              label={t("rewards.limited")}
              value={rewards.filter((reward) => reward.isLimited).length.toLocaleString()}
              helper={t("rewards.rewardPool")}
              tone="text-purple-300"
            />
          </div>
        </div>
      </section>

      {featuredReward && (
        <FeaturedReward reward={featuredReward} locale={locale} t={t} />
      )}

      <RewardTabs tabs={tabs} activeTab={tab} onChange={setTab} />

      <section className="space-y-4">
        <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-[#0a101a] p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-fuchsia-200">
              <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.7)]" />
              {filtered.length.toLocaleString()} {t("rewards.availableRewards")}
            </div>
            <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
              {tabs.find((item) => item.key === tab)?.label ?? t("rewards.catalog")}
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-gray-400 sm:text-right">
            {t("rewards.browseHint")}
          </p>
        </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((reward) => (
          <RewardVaultCard key={reward.id} reward={reward} locale={locale} t={t} />
        ))}
      </div>
      </section>
    </div>
  );
}

function FeaturedReward({
  reward,
  locale,
  t,
}: {
  reward: RewardViewItem;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = categoryIcons[reward.category];
  return (
    <Link href={`/${locale}/rewards/${reward.id}`} className="block">
      <Card hover className="overflow-hidden border-cyan-400/20 bg-[#09111d] p-4 sm:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-8 xl:gap-10">
          <div className="shrink-0 lg:w-56 xl:w-64">
            <RewardVisual reward={reward} size="lg" />
          </div>
          <div className="min-w-0 flex-1 lg:py-3">
            <div className="mb-3 flex flex-wrap items-center gap-2.5">
              <Badge variant={categoryTone[reward.category]} size="md">
                <Icon size={13} className="mr-1.5" />
                {t(`rewards.${reward.category}`)}
              </Badge>
              {reward.isLimited && <Badge variant="gold" size="md">{t("rewards.limited")}</Badge>}
              {reward.canAfford && reward.stock > 0 ? (
                <Badge variant="green" size="md">{t("rewards.redeemableNow")}</Badge>
              ) : (
                <Badge variant="red" size="md">{t("rewards.insufficientPoints")}</Badge>
              )}
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              {t("rewards.featured")}
            </p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl xl:text-4xl">
              {reward.name}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
              {reward.description}
            </p>
          </div>
          <div className="grid shrink-0 gap-3 rounded-2xl border border-white/10 bg-black/24 p-4 lg:w-64 xl:w-72">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                {t("rewards.cost")}
              </p>
              <RewardCost reward={reward} />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-800 pt-3">
              <span className="text-sm font-bold text-gray-400">{t("rewards.stock")}</span>
              <span className={cn("font-mono text-lg font-black", stockTone(reward.stock))}>
                {reward.stock.toLocaleString()}
              </span>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-black text-black">
              {t("rewards.openDetail")}
              <ChevronRight size={17} />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function RewardVaultCard({
  reward,
  locale,
  t,
}: {
  reward: RewardViewItem;
  locale: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const Icon = categoryIcons[reward.category];
  const outOfStock = reward.stock <= 0;

  return (
    <Link href={`/${locale}/rewards/${reward.id}`} className="block h-full">
      <Card
        hover={!outOfStock}
        className={cn(
          "group relative flex min-h-[330px] flex-col overflow-hidden border-white/10 bg-[#0b111d] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] transition sm:p-5",
          reward.canAfford && !outOfStock && "border-emerald-300/25",
          outOfStock && "opacity-65"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-fuchsia-400/70 via-cyan-300/60 to-amber-300/50" />
        <div className="mb-4 flex items-start justify-between gap-3">
          <RewardVisual reward={reward} />
          <div className="flex flex-col items-end gap-2">
            <Badge variant={categoryTone[reward.category]} size="md">
              <Icon size={13} className="mr-1.5" />
              {t(`rewards.${reward.category}`)}
            </Badge>
            {reward.isLimited && (
              <Badge variant="gold" size="md">{t("rewards.limited")}</Badge>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-black leading-tight text-white">
            {reward.name}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-400">
            {reward.description}
          </p>
        </div>

        <div className="mt-5 space-y-4 border-t border-gray-800/70 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <RewardCost reward={reward} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StatusPill
              label={t("rewards.stock")}
              value={
                outOfStock
                  ? t("rewards.outOfStock")
                  : reward.stock < 20
                  ? t("rewards.lowStock")
                  : t("rewards.inStock")
              }
              tone={outOfStock ? "red" : reward.stock < 20 ? "gold" : "green"}
            />
            <StatusPill
              label={t("rewards.redeemed")}
              value={reward.redemptionCount.toLocaleString()}
              tone="cyan"
            />
          </div>

          <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/24 px-3">
            <span
              className={cn(
                "text-sm font-black",
                reward.canAfford && !outOfStock ? "text-emerald-300" : "text-red-300"
              )}
            >
              {outOfStock
                ? t("rewards.outOfStock")
                : reward.canAfford
                ? t("rewards.redeemNow")
                : t("rewards.insufficientPoints")}
            </span>
            <ChevronRight size={18} className="text-cyan-200 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function RewardVisual({
  reward,
  size = "md",
}: {
  reward: RewardViewItem;
  size?: "md" | "lg";
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-center shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]",
        size === "lg" ? "h-36 w-full text-6xl sm:h-40 lg:h-44" : "h-20 w-20 text-4xl"
      )}
    >
      {reward.imageUrl ? (
        <span
          role="img"
          aria-label={reward.name}
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${reward.imageUrl})` }}
        />
      ) : (
        reward.image || <Box size={size === "lg" ? 56 : 36} />
      )}
    </span>
  );
}

function RewardCost({ reward }: { reward: RewardViewItem }) {
  return (
    <>
      {reward.isFreeOnly && (
        <PointsBadge type="free" amount={reward.pointsCost} size="sm" showLabel />
      )}
      {reward.isPremiumOnly && (
        <PointsBadge type="premium" amount={reward.creditCost} size="sm" showLabel />
      )}
    </>
  );
}

function RewardTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{
    key: RewardTabKey;
    label: string;
    count: number;
    icon: typeof Trophy;
  }>;
  activeTab: RewardTabKey;
  onChange: (key: RewardTabKey) => void;
}) {
  return (
    <div className="sticky top-[76px] z-20 rounded-2xl border border-white/10 bg-[#070b13]/92 p-2 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = item.key === activeTab;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                "group flex min-h-[64px] items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition",
                active
                  ? "border-fuchsia-300/40 bg-fuchsia-300/12 text-white shadow-[0_0_24px_rgba(217,70,239,0.13)]"
                  : "border-transparent bg-white/[0.03] text-gray-400 hover:border-white/10 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl border",
                    active
                      ? "border-fuchsia-300/30 bg-fuchsia-300/10 text-fuchsia-200"
                      : "border-white/10 bg-black/20 text-gray-500 group-hover:text-fuchsia-200"
                  )}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-black sm:text-lg">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    {item.count.toLocaleString()}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  helper,
  tone,
  className,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  helper: string;
  tone: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-black/28 p-4",
        className
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/50 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-gray-400">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black leading-none text-white sm:text-4xl">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            {helper}
          </p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
          <Icon size={22} className={tone} />
        </span>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "green" | "gold" | "red";
}) {
  const toneClass = {
    cyan: "text-cyan-300",
    green: "text-emerald-300",
    gold: "text-amber-300",
    red: "text-red-300",
  }[tone];

  return (
    <div className="rounded-xl border border-white/10 bg-black/22 p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 text-sm font-black", toneClass)}>{value}</p>
    </div>
  );
}

function stockTone(stock: number) {
  if (stock <= 0) return "text-red-300";
  if (stock < 20) return "text-amber-300";
  return "text-emerald-300";
}
