import { Card } from "@/components/ui/Card";
import { useTranslations } from "next-intl";

export default function WalletPage() {
  const t = useTranslations("wallet");
  const earningHistory = [
    { desc: t("earningExactScore"), pts: 10, date: t("today") },
    { desc: t("earningDailyMission"), pts: 50, date: t("today") },
    { desc: t("earningCorrectResult"), pts: 5, date: t("yesterday") },
    { desc: t("earningStreakBonus"), pts: 10, date: t("yesterday") },
    { desc: t("earningAchievement"), pts: 200, date: t("may8") },
  ];
  const redemptionHistory = [
    { item: t("redemptionJersey"), cost: t("costPoints", { amount: 500 }), date: t("may5"), status: t("statusShipped") },
    { item: t("redemptionTheme"), cost: t("costCredits", { amount: 50 }), date: t("may1"), status: t("statusDelivered") },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">{t("title")}</h1>

      {/* Legal Disclaimer - Prominent */}
      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          <strong className="text-red-400">{t("importantLabel")}</strong>{" "}
          {t("legalPrefix")} <strong>{t("noCashValue")}</strong>.{" "}
          {t("legalSuffix")}
        </p>
      </div>

      {/* Dual Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free Points */}
        <Card className="p-5 border-green-500/20 bg-green-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟢</span>
            <h3 className="text-sm font-semibold text-green-400">
              {t("freePointsTitle")}
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-green-400 mb-3">
            2,840
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("freePointsDescription")}
          </p>
        </Card>

        {/* Premium Credits */}
        <Card className="p-5 border-amber-500/20 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟡</span>
            <h3 className="text-sm font-semibold text-amber-400">
              {t("premiumCreditsTitle")}
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400 mb-3">
            150
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            {t("premiumCreditsDescription")}
          </p>
        </Card>
      </div>

      {/* Earning History */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          {t("earningHistoryTitle")}
        </h3>
        <div className="space-y-2">
          {earningHistory.map((e, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
            >
              <div>
                <p className="text-xs text-gray-300">{e.desc}</p>
                <p className="text-[10px] text-gray-600">{e.date}</p>
              </div>
              <span className="text-xs font-mono font-bold text-green-400 shrink-0">
                +{e.pts}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Spending History */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          {t("redemptionHistoryTitle")}
        </h3>
        <div className="space-y-2">
          {redemptionHistory.map((e, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
            >
              <div>
                <p className="text-xs text-gray-300">{e.item}</p>
                <p className="text-[10px] text-gray-600">{e.date}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-gray-500">{e.cost}</span>
                <span className="text-[10px] text-cyan-400 ml-2">
                  {e.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
