"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import {
  Brain,
  Check,
  ChevronRight,
  Coins,
  CreditCard,
  FileText,
  Headphones,
  LockKeyhole,
  PackageCheck,
  Shield,
  Star,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CREDIT_PACKAGES } from "@/data/credit-packages";
import {
  DEFAULT_CREDIT_PACKAGES_RESPONSE,
  getCreditPackages,
  type CreditPackageApiItem,
} from "@/lib/credits-api";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/stores/user-store";
import { dispatchMemberWalletRefresh } from "@/lib/member-refresh-event";
import type { CreditFeature, CreditPackage, FirstPurchaseBonus } from "@/types/credits";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  aiInsightDaily: <Brain size={14} />,
  deepPrediction: <FileText size={14} />,
  confidenceBoost: <TrendingUp size={14} />,
  proStats: <Zap size={14} />,
  privateLeagues: <Users size={14} />,
  maxLeagueMembers: <Users size={14} />,
  streakShield: <Shield size={14} />,
  predictionBoost: <Star size={14} />,
  prioritySupport: <Headphones size={14} />,
};

const TIER_BORDER: Record<string, string> = {
  free: "border-gray-700/30 hover:border-gray-600/40",
  starter: "border-gray-500/20 hover:border-gray-400/40",
  fan: "border-emerald-500/20 hover:border-emerald-400/40",
  pro: "border-cyan-500/30 hover:border-cyan-400/50 ring-1 ring-cyan-500/20",
  elite: "border-violet-500/20 hover:border-violet-400/40",
  legend: "border-amber-500/20 hover:border-amber-400/40",
};

const TIER_BG: Record<string, string> = {
  free: "bg-transparent",
  starter: "bg-gray-500/5",
  fan: "bg-emerald-500/5",
  pro: "bg-cyan-500/[0.06]",
  elite: "bg-violet-500/5",
  legend: "bg-amber-500/5",
};

const TIER_BADGE: Record<string, string> = {
  free: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  starter: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  fan: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pro: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  elite: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  legend: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const PAYMENT_METHODS = [
  { id: "promptpay", icon: "📱", labelKey: "promptpay" },
  { id: "truemoney", icon: "💳", labelKey: "truemoney" },
  { id: "rabbit", icon: "🐰", labelKey: "rabbit" },
  { id: "creditCard", icon: "🏦", labelKey: "creditCard" },
];

const STYLE_PACKAGES = CREDIT_PACKAGES.filter((pkg) => pkg.id !== "free");

function pickPackageTemplate(apiPackage: CreditPackageApiItem, index: number) {
  const featured = apiPackage.isFeatured
    ? STYLE_PACKAGES.find((pkg) => pkg.tier === "pro")
    : undefined;

  return featured ?? STYLE_PACKAGES[index % STYLE_PACKAGES.length];
}

function mapApiPackage(apiPackage: CreditPackageApiItem, index: number): CreditPackage {
  const template = pickPackageTemplate(apiPackage, index);
  const bonusPercent =
    apiPackage.baseCredits > 0
      ? Math.round((apiPackage.bonusCredits / apiPackage.baseCredits) * 100)
      : 0;

  return {
    ...template,
    id: apiPackage.id,
    name: apiPackage.name,
    priceTHB: apiPackage.amountThb,
    baseCredits: apiPackage.baseCredits,
    bonusPercent,
    bonusCredits: apiPackage.bonusCredits,
    totalCredits: apiPackage.totalCredits,
    popular: apiPackage.isFeatured,
    savingsLabel: undefined,
  };
}

export default function CreditsPage() {
  const t = useTranslations("credits");
  const tc = useTranslations("common");
  const { locale } = useParams<{ locale: string }>();
  const { isLoggedIn, addCredits } = useUserStore(
    useShallow((s) => ({
      isLoggedIn: s.isLoggedIn,
      addCredits: s.addCredits,
    }))
  );
  const [packages, setPackages] = useState<CreditPackage[]>(
    DEFAULT_CREDIT_PACKAGES_RESPONSE.packages.map(mapApiPackage)
  );
  const [firstPurchaseBonus, setFirstPurchaseBonus] =
    useState<FirstPurchaseBonus | null>(
      DEFAULT_CREDIT_PACKAGES_RESPONSE.firstPurchaseBonus ?? null
    );
  const [selected, setSelected] = useState(
    DEFAULT_CREDIT_PACKAGES_RESPONSE.packages.find((pkg) => pkg.isFeatured)
      ?.id ??
      DEFAULT_CREDIT_PACKAGES_RESPONSE.packages[0]?.id ??
      ""
  );
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);

  // Keep the displayed balance in sync with the latest server state when
  // landing here directly (the global Header owns the wallet store).
  useEffect(() => {
    if (isLoggedIn) dispatchMemberWalletRefresh();
  }, [isLoggedIn]);

  useEffect(() => {
    let active = true;

    getCreditPackages({ locale })
      .then((response) => {
        if (!active) return;
        const apiPackages = response.packages.map(mapApiPackage);
        setPackages(apiPackages);
        setFirstPurchaseBonus(response.firstPurchaseBonus ?? null);
        setSelected((current) => {
          if (apiPackages.some((pkg) => pkg.id === current)) return current;
          return apiPackages.find((pkg) => pkg.popular)?.id ?? apiPackages[0]?.id ?? "";
        });
      })
      .catch(() => {
        if (!active) return;
        const apiPackages =
          DEFAULT_CREDIT_PACKAGES_RESPONSE.packages.map(mapApiPackage);
        setPackages(apiPackages);
        setFirstPurchaseBonus(
          DEFAULT_CREDIT_PACKAGES_RESPONSE.firstPurchaseBonus ?? null
        );
        setSelected((current) => {
          if (apiPackages.some((pkg) => pkg.id === current)) return current;
          return apiPackages.find((pkg) => pkg.popular)?.id ?? apiPackages[0]?.id ?? "";
        });
      })
      .finally(() => {
        if (active) setLoadingPackages(false);
      });

    return () => {
      active = false;
    };
  }, [locale]);

  const pkg = packages.find((p) => p.id === selected) ?? packages[0];
  const comparisonFeatures = packages[0]?.features ?? [];
  const featuredPackage = packages.find((p) => p.popular) ?? packages[0];
  const maxTotalCredits = Math.max(...packages.map((p) => p.totalCredits), 0);
  const maxBonusCredits = Math.max(...packages.map((p) => p.bonusCredits), 0);
  const packageCount = packages.length;

  const handlePurchase = () => {
    if (!pkg) return;
    setProcessing(true);
    setTimeout(() => {
      addCredits(pkg.totalCredits);
      dispatchMemberWalletRefresh();
      setProcessing(false);
      setShowCheckout(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const formatBaht = (n: number) => `฿${n.toLocaleString()}`;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8 sm:space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#070b13] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-6 lg:p-7">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.13),transparent_34%),linear-gradient(315deg,rgba(245,158,11,0.12),transparent_30%),linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[auto,auto,34px_34px,34px_34px]" />
        <div className="relative grid gap-5 xl:grid-cols-[1.08fr_0.92fr] xl:items-stretch">
          <div className="flex min-h-[300px] flex-col justify-between rounded-2xl border border-white/10 bg-black/24 p-4 sm:p-5">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge variant="cyan" size="md" className="uppercase tracking-wider">
                  {t("commandCenter")}
                </Badge>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-200">
                  <Shield size={14} />
                  {t("skillNotice")}
                </span>
              </div>
              <h1 className="font-display text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                {t("title")}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
                {t("subtitle")}
              </p>
            </div>

            <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/[0.06] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-red-300/25 bg-red-300/10 text-red-200">
                  <LockKeyhole size={22} />
                </span>
                <p className="text-sm font-medium leading-6 text-gray-300 sm:text-base">
                  <strong className="text-red-300">{tc("important")}:</strong>{" "}
                  {t("disclaimer")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <HeroMetric
              icon={Coins}
              label={t("availablePackages")}
              value={packageCount.toLocaleString()}
              helper={t("packageArena")}
              tone="text-cyan-300"
              className="sm:col-span-2"
            />
            <HeroMetric
              icon={CreditCard}
              label={t("topPack")}
              value={maxTotalCredits.toLocaleString()}
              helper={tc("credits")}
              tone="text-emerald-300"
            />
            <HeroMetric
              icon={Zap}
              label={t("maxBonus")}
              value={`+${maxBonusCredits.toLocaleString()}`}
              helper={t("bonusCredits", {
                percent: featuredPackage?.bonusPercent ?? 0,
              })}
              tone="text-amber-300"
            />
            <HeroMetric
              icon={PackageCheck}
              label={t("selectedPack")}
              value={pkg?.totalCredits.toLocaleString() ?? "0"}
              helper={pkg?.name ?? t("selectPackage")}
              tone="text-fuchsia-300"
            />
            <HeroMetric
              icon={Shield}
              label={t("checkout.secureCheckout")}
              value="256"
              helper={t("checkout.encrypted")}
              tone="text-purple-300"
            />
          </div>
        </div>
      </section>

      {firstPurchaseBonus && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 shadow-[0_16px_48px_rgba(245,158,11,0.08)] sm:p-5">
          <p className="flex items-start gap-3 text-sm font-bold leading-6 text-amber-100 sm:text-base">
            <Star size={20} className="mt-0.5 shrink-0 text-amber-300" />
            <span>
            {t("firstPurchaseBonus", {
              credits: firstPurchaseBonus.bonusCredits,
              amount: firstPurchaseBonus.minAmountThb.toLocaleString(),
            })}
            </span>
          </p>
        </div>
      )}

      <section className="space-y-4">
        <SectionHeader
          eyebrow={`${packages.length.toLocaleString()} ${t("availablePackages")}`}
          title={t("packageArena")}
          intro={t("packageHint")}
        />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {loadingPackages &&
          Array.from({ length: 5 }).map((_, index) => (
            <Card
              key={index}
              className="h-40 animate-pulse border-gray-800 bg-white/[0.03]"
            />
          ))}
        {!loadingPackages &&
          packages.map((p) => (
            <PackageCard
              key={p.id}
              pkg={p}
              isSelected={selected === p.id}
              onClick={() => setSelected(p.id)}
              t={t}
              tc={tc}
            />
          ))}
      </div>
      </section>

      {pkg && (
        <Card className={cn("overflow-hidden border-cyan-400/20 bg-[#09111d] p-4 sm:p-5", TIER_BG[pkg.tier])}>
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="min-w-0">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
                    TIER_BADGE[pkg.tier]
                  )}
                >
                  {pkg.name}
                </span>
                {pkg.popular && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    {t("mostPopular")}
                  </span>
                )}
              </div>
              <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
                {t("selectedPack")}
              </h2>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <span className="font-mono text-4xl font-black leading-none text-white sm:text-5xl">
                  {formatBaht(pkg.priceTHB)}
                </span>
                <span className="mb-1 text-sm font-bold text-gray-500">{t("oneTime")}</span>
              </div>
              <p className="mt-3 text-base leading-7 text-gray-300">
                {pkg.baseCredits.toLocaleString()} {tc("credits")}
                {pkg.bonusCredits > 0 && (
                  <span className="ml-1 font-bold text-amber-300">
                    +{pkg.bonusCredits.toLocaleString()}{" "}
                    {t("bonusCredits", { percent: pkg.bonusPercent })}
                  </span>
                )}
                {" = "}
                <span className="text-white font-bold">
                  {pkg.totalCredits.toLocaleString()} {tc("credits")}
                </span>
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-72 lg:grid-cols-1">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="min-h-12 rounded-xl border border-gray-700 px-4 text-sm font-bold text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
              >
                {t("features.comparison")}
              </button>
              {/* TODO: re-enable real purchase flow once credit purchases are ready
              <button
                onClick={() => setShowCheckout(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
              >
                {t("selectPackage")}
              </button>
              */}
              <button
                onClick={() => setShowComingSoon(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 text-base font-black text-black transition-colors hover:bg-cyan-400"
              >
                {t("selectPackage")}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {showComparison && packages.length > 0 && (
        <Card className="overflow-x-auto border-white/10 bg-[#0b111d] p-4 sm:p-5">
          <h3 className="mb-4 text-xl font-black text-white">
            {t("features.comparison")}
          </h3>
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-2 text-gray-400 font-medium w-[200px]">
                  {t("features.title")}
                </th>
                {packages.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "text-center py-2 px-2 font-bold",
                      p.id === selected ? "text-white" : "text-gray-500"
                    )}
                  >
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] border",
                        TIER_BADGE[p.tier]
                      )}
                    >
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((feature) => (
                <tr
                  key={feature.key}
                  className="border-b border-gray-800/50 hover:bg-white/[0.02]"
                >
                  <td className="py-2.5 px-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-4 flex justify-center">
                        {FEATURE_ICONS[feature.key]}
                      </span>
                      <span>{t(`features.${feature.key}`)}</span>
                    </div>
                  </td>
                  {packages.map((p) => {
                    const f =
                      p.features.find((ff) => ff.key === feature.key) ??
                      ({ ...feature, included: false } satisfies CreditFeature);
                    const isCurrent = p.id === selected;
                    return (
                      <td key={p.id} className="text-center py-2.5 px-2">
                        {f.included ? (
                          <div className="flex flex-col items-center gap-0.5">
                            {f.value ? (
                              <span
                                className={cn(
                                  "text-xs font-mono font-bold",
                                  isCurrent ? "text-white" : "text-gray-400",
                                  f.highlighted && "text-cyan-400"
                                )}
                              >
                                {f.value === "unlimited"
                                  ? t("features.unlimited")
                                  : f.value}
                              </span>
                            ) : (
                              <Check
                                size={14}
                                className={cn(
                                  isCurrent ? "text-green-400" : "text-gray-500"
                                )}
                              />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-700">
                            {t("features.notIncluded")}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {pkg && (
        <section className="space-y-4">
          <SectionHeader
            eyebrow={pkg.name}
            title={t("features.title")}
            intro={t("featureHint")}
          />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pkg.features
            .filter((f) => f.included)
            .map((f) => (
              <Card
                key={f.key}
                hover={false}
                className="flex items-center gap-3 border-white/10 bg-[#0b111d] p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
                  <span className="text-cyan-400">
                    {FEATURE_ICONS[f.key] ?? <Check size={14} />}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-black leading-tight text-white">
                    {t(`features.${f.key}`)}
                  </p>
                  {f.value && (
                    <p className="mt-1 font-mono text-xs font-bold text-cyan-300">
                      {f.value === "unlimited" ? t("features.unlimited") : f.value}
                      {["streakShield", "predictionBoost", "aiInsightDaily"].includes(
                        f.key
                      ) && t("perMonth")}
                    </p>
                  )}
                </div>
              </Card>
            ))}
        </div>
        </section>
      )}

      {showCheckout && pkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#12121a] border-b border-gray-800 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">
                  {t("checkout.title")}
                </h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              <div className="rounded-xl bg-white/[0.03] border border-gray-800 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("checkout.package")}</span>
                  <span className="text-white font-bold">{pkg.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">
                    {t("checkout.baseCredits")}
                  </span>
                  <span className="text-white font-mono">
                    {pkg.baseCredits.toLocaleString()}
                  </span>
                </div>
                {pkg.bonusCredits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t("checkout.bonus", { percent: pkg.bonusPercent })}
                    </span>
                    <span className="text-amber-400 font-mono">
                      +{pkg.bonusCredits.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-800 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-white">
                    {t("checkout.total")}
                  </span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white font-mono">
                      {formatBaht(pkg.priceTHB)}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {pkg.totalCredits.toLocaleString()} {tc("credits")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-white mb-3">
                  {t("checkout.paymentMethod")}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                        paymentMethod === pm.id
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white"
                          : "border-gray-800 text-gray-400 hover:text-white hover:border-gray-700"
                      )}
                    >
                      <span className="text-lg">{pm.icon}</span>
                      {t(`checkout.${pm.labelKey}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-gray-600 justify-center">
                <Shield size={12} />
                {t("checkout.secureCheckout")} · {t("checkout.encrypted")}
              </div>

              <p className="text-[10px] text-gray-600 text-center">
                {t("checkout.noAutoRenew")}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white transition-colors"
                >
                  {t("checkout.cancelPurchase")}
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={processing}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black transition-all",
                    processing ? "opacity-60 cursor-not-allowed" : "hover:bg-cyan-400"
                  )}
                >
                  {processing
                    ? t("checkout.processing")
                    : t("checkout.confirmPurchase")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSuccess && pkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-sm text-center p-6 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("checkout.successTitle")}
            </h2>
            <p className="text-sm text-gray-400">
              {t("checkout.successMessage", { credits: pkg.totalCredits })}
            </p>
            <div className="flex gap-3 pt-2">
              <Link
                href={`/${locale}/wallet`}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-700 text-gray-300 hover:text-white transition-colors"
                onClick={handleCloseSuccess}
              >
                {t("checkout.goToWallet")}
              </Link>
              <Link
                href={`/${locale}/predict`}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
                onClick={handleCloseSuccess}
              >
                {t("checkout.goPredict")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {showComingSoon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-sm text-center p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setShowComingSoon(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              aria-label={tc("close")}
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto">
              <Zap size={32} className="text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("comingSoonTitle")}
            </h2>
            <p className="text-sm text-gray-400">{t("comingSoonMessage")}</p>
            <button
              onClick={() => setShowComingSoon(false)}
              className="w-full py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
            >
              {tc("close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageCard({
  pkg,
  isSelected,
  onClick,
  t,
  tc,
}: {
  pkg: CreditPackage;
  isSelected: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslations<"credits">>;
  tc: ReturnType<typeof useTranslations<"common">>;
}) {
  return (
    <button onClick={onClick} className="text-left w-full">
      <Card
        hover
        className={cn(
          "relative flex min-h-[250px] flex-col overflow-hidden border-white/10 bg-[#0b111d] p-4 transition-all sm:p-5",
          TIER_BG[pkg.tier],
          TIER_BORDER[pkg.tier],
          isSelected && "border-cyan-300/50 ring-2 ring-cyan-300/20"
        )}
      >
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-1",
            isSelected
              ? "bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-amber-300"
              : "bg-gradient-to-r from-cyan-400/30 via-purple-400/20 to-transparent"
          )}
        />
        <div className="mb-3 flex min-h-[28px] items-center justify-between gap-2">
          {pkg.popular && (
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">
              {t("mostPopular")}
            </span>
          )}
          {isSelected && (
            <span className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400 text-black">
              <Check size={16} />
            </span>
          )}
        </div>

        <span
          className={cn(
            "mb-4 inline-block w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
            TIER_BADGE[pkg.tier]
          )}
        >
          {pkg.name}
        </span>

        <div>
          <span className="font-mono text-3xl font-black leading-none text-white">
            ฿{pkg.priceTHB.toLocaleString()}
          </span>
          <p className="mt-1 text-xs font-bold text-gray-500">{t("oneTime")}</p>
        </div>

        <p className="mt-4 text-sm leading-6 text-gray-300">
          <span className="font-bold text-white">
            {pkg.baseCredits.toLocaleString()} {tc("credits")}
          </span>
          {pkg.bonusCredits > 0 && (
            <span className="ml-1 font-bold text-amber-300">
              +{pkg.bonusCredits.toLocaleString()}
            </span>
          )}
        </p>

        {pkg.bonusPercent > 0 && (
          <div className="mt-2 w-fit rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-xs font-black text-amber-300">
            {t("bonusCredits", { percent: pkg.bonusPercent })}
          </div>
        )}

        <div className="mt-auto border-t border-gray-800/70 pt-4">
          <p className="text-sm font-black text-cyan-200">
            {t("totalCredits", { count: pkg.totalCredits })}
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">
            {isSelected ? t("selectedPack") : t("tapToSelect")}
          </p>
        </div>
      </Card>
    </button>
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
  icon: typeof Star;
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
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
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

function SectionHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a101a] p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-200">
        <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
        {eyebrow}
      </div>
      <h2 className="font-display text-2xl font-black text-white sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-base leading-7 text-gray-400">
        {intro}
      </p>
    </div>
  );
}
