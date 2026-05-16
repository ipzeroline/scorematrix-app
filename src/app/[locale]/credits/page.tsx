"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { cn } from "@/lib/utils";
import { CREDIT_PACKAGES } from "@/data/credit-packages";
import type { CreditPackage } from "@/types/credits";
import { Check, X, Shield, Zap, Star, TrendingUp, Users, Headphones, Brain, FileText } from "lucide-react";

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

export default function CreditsPage() {
  const t = useTranslations("credits");
  const tc = useTranslations("common");
  const { locale } = useParams<{ locale: string }>();
  const [selected, setSelected] = useState<string>("pro");
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const pkg = CREDIT_PACKAGES.find((p) => p.id === selected)!;

  const handlePurchase = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{t("subtitle")}</p>
        </div>
        <PointsBadge type="premium" amount={150} size="lg" showLabel />
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          <strong className="text-red-400">{tc("important")}:</strong>{" "}
          {t("disclaimer")}
        </p>
      </div>

      {/* Package Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CREDIT_PACKAGES.map((p) => (
          <PackageCard
            key={p.id}
            pkg={p}
            isSelected={selected === p.id}
            onClick={() => setSelected(p.id)}
            t={t}
          />
        ))}
      </div>

      {/* Selected Package Detail & CTA */}
      <Card className={cn("p-5", TIER_BG[selected], TIER_BORDER[selected])}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border", TIER_BADGE[selected])}>
                {pkg.name}
              </span>
              {pkg.popular && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {t("mostPopular")}
                </span>
              )}
              {pkg.savingsLabel && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                  {t(pkg.savingsLabel)}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              {pkg.priceTHB === 0 ? (
                <span className="text-3xl font-bold text-white font-display">{t("free")}</span>
              ) : (
                <>
                  <span className="text-3xl font-bold text-white font-mono">
                    {formatBaht(pkg.priceTHB)}
                  </span>
                  <span className="text-xs text-gray-500">{t("oneTime")}</span>
                </>
              )}
            </div>
            {pkg.totalCredits > 0 && (
              <p className="text-sm text-gray-300 mt-2">
                {pkg.baseCredits} {tc("credits")}
                {pkg.bonusCredits > 0 && (
                  <span className="text-amber-400 ml-1">
                    +{pkg.bonusCredits} {t("bonusCredits", { percent: pkg.bonusPercent })}
                  </span>
                )}
                {" = "}
                <span className="text-white font-bold">{pkg.totalCredits} {tc("credits")}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-4 py-2 rounded-lg text-xs font-medium border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors"
            >
              {t("features.comparison")}
            </button>
            {pkg.priceTHB > 0 ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-cyan-500 text-black hover:bg-cyan-400 transition-colors"
              >
                {t("selectPackage")}
              </button>
            ) : (
              <Link
                href={`/${locale}/predict`}
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                {t("startPredicting")}
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Feature Comparison Table */}
      {showComparison && (
        <Card className="p-4 overflow-x-auto">
          <h3 className="text-sm font-semibold text-white mb-4">{t("features.comparison")}</h3>
          <table className="w-full min-w-[700px] text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-2 px-2 text-gray-400 font-medium w-[200px]">
                  {t("features.title")}
                </th>
                {CREDIT_PACKAGES.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "text-center py-2 px-2 font-bold",
                      p.id === selected ? "text-white" : "text-gray-500"
                    )}
                  >
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] border",
                      TIER_BADGE[p.tier]
                    )}>
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CREDIT_PACKAGES[0].features.map((feature) => (
                <tr key={feature.key} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="py-2.5 px-2 text-gray-300">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-4 flex justify-center">
                        {FEATURE_ICONS[feature.key]}
                      </span>
                      <span>{t(`features.${feature.key}`)}</span>
                    </div>
                  </td>
                  {CREDIT_PACKAGES.map((p) => {
                    const f = p.features.find((ff) => ff.key === feature.key)!;
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
                          <span className="text-gray-700">{t("features.notIncluded")}</span>
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

      {/* Package Perks Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {pkg.features
          .filter((f) => f.included)
          .map((f) => (
            <Card key={f.key} hover={false} className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                <span className="text-cyan-400">
                  {FEATURE_ICONS[f.key] ?? <Check size={14} />}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-white">{t(`features.${f.key}`)}</p>
                {f.value && (
                  <p className="text-[10px] text-cyan-400 font-mono">
                    {f.value === "unlimited" ? t("features.unlimited") : f.value}
                    {["streakShield", "predictionBoost", "aiInsightDaily"].includes(f.key) && t("perMonth")}
                  </p>
                )}
              </div>
            </Card>
          ))}
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-[#12121a] border-b border-gray-800 p-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{t("checkout.title")}</h2>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Order Summary */}
              <div className="rounded-xl bg-white/[0.03] border border-gray-800 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("checkout.package")}</span>
                  <span className="text-white font-bold">{pkg.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">{t("checkout.baseCredits")}</span>
                  <span className="text-white font-mono">{pkg.baseCredits}</span>
                </div>
                {pkg.bonusCredits > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      {t("checkout.bonus", { percent: pkg.bonusPercent })}
                    </span>
                    <span className="text-amber-400 font-mono">+{pkg.bonusCredits}</span>
                  </div>
                )}
                <div className="border-t border-gray-800 pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-white">{t("checkout.total")}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-white font-mono">
                      {formatBaht(pkg.priceTHB)}
                    </span>
                    <p className="text-[10px] text-gray-500">
                      {pkg.totalCredits} {tc("credits")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <p className="text-sm font-semibold text-white mb-3">{t("checkout.paymentMethod")}</p>
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

              {/* Security Notice */}
              <div className="flex items-center gap-2 text-[10px] text-gray-600 justify-center">
                <Shield size={12} />
                {t("checkout.secureCheckout")} · {t("checkout.encrypted")}
              </div>

              <p className="text-[10px] text-gray-600 text-center">
                {t("checkout.noAutoRenew")}
              </p>

              {/* Actions */}
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
                  {processing ? t("checkout.processing") : t("checkout.confirmPurchase")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-gray-800 rounded-2xl w-full max-w-sm text-center p-6 shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <Check size={32} className="text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("checkout.successTitle")}</h2>
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
    </div>
  );
}

function PackageCard({
  pkg,
  isSelected,
  onClick,
  t,
}: {
  pkg: CreditPackage;
  isSelected: boolean;
  onClick: () => void;
  t: ReturnType<typeof useTranslations<"credits">>;
}) {
  return (
    <button onClick={onClick} className="text-left w-full">
      <Card
        hover
        className={cn(
          "h-full p-4 relative transition-all",
          TIER_BG[pkg.tier],
          TIER_BORDER[pkg.tier],
          isSelected && "border-white/20 ring-1 ring-white/10"
        )}
      >
        {/* Popular / Savings Badge */}
        <div className="flex items-center gap-1 mb-2 min-h-[20px]">
          {pkg.popular && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {t("mostPopular")}
            </span>
          )}
          {pkg.savingsLabel && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              {t(pkg.savingsLabel)}
            </span>
          )}
        </div>

        {/* Tier Badge */}
        <span
          className={cn(
            "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mb-3",
            TIER_BADGE[pkg.tier]
          )}
        >
          {pkg.name}
        </span>

        {/* Price */}
        <div className="mb-1">
          {pkg.priceTHB === 0 ? (
            <span className="text-2xl font-bold text-white font-display">{t("free")}</span>
          ) : (
            <span className="text-2xl font-bold text-white font-mono">
              ฿{pkg.priceTHB.toLocaleString()}
            </span>
          )}
        </div>

        {/* Credits */}
        {pkg.totalCredits > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            {pkg.baseCredits} credits
            {pkg.bonusCredits > 0 && (
              <span className="text-amber-400 ml-1">+{pkg.bonusCredits}</span>
            )}
          </p>
        )}

        {/* Bonus Badge */}
        {pkg.bonusPercent > 0 && (
          <div className="text-[10px] font-bold text-amber-400 mb-2">
            {t("bonusCredits", { percent: pkg.bonusPercent })}
          </div>
        )}

        {/* Total */}
        {pkg.totalCredits > 0 && (
          <div className="pt-2 border-t border-gray-800/50">
            <p className="text-[10px] text-gray-500">{t("totalCredits", { count: pkg.totalCredits })}</p>
          </div>
        )}
      </Card>
    </button>
  );
}
