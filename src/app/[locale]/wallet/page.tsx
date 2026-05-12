import { Card } from "@/components/ui/Card";
import { PointsBadge } from "@/components/shared/PointsBadge";

export default function WalletPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold font-display text-white">Wallet & Points</h1>

      {/* Legal Disclaimer - Prominent */}
      <div className="rounded-xl border-2 border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-gray-300 font-medium leading-relaxed">
          <strong className="text-red-400">IMPORTANT:</strong> Free Prediction
          Points and Premium Credits have <strong>no cash value</strong>. They
          cannot be withdrawn, transferred, or exchanged for real money.
          ScoreMatrix is a skill-based prediction platform, not a gambling
          service.
        </p>
      </div>

      {/* Dual Currency Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free Points */}
        <Card className="p-5 border-green-500/20 bg-green-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟢</span>
            <h3 className="text-sm font-semibold text-green-400">
              Free Prediction Points
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-green-400 mb-3">
            2,840
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Earned through accurate predictions, completing missions, and
            unlocking achievements. Redeem for merchandise and digital goods in
            the Rewards catalog.
          </p>
        </Card>

        {/* Premium Credits */}
        <Card className="p-5 border-amber-500/20 bg-amber-500/[0.03]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🟡</span>
            <h3 className="text-sm font-semibold text-amber-400">
              Premium Credits
            </h3>
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400 mb-3">
            150
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Optional purchase for exclusive cosmetic items, profile badges, and
            digital collectibles. Not required for core platform features.
          </p>
        </Card>
      </div>

      {/* Earning History */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Free Points — Earning History
        </h3>
        <div className="space-y-2">
          {[
            { desc: "Exact score — London United 2-1 Mersey City", pts: 10, date: "Today" },
            { desc: "Daily mission: Predict 3 matches", pts: 50, date: "Today" },
            { desc: "Correct result — Real Catalonia vs Atletico Madrid B", pts: 5, date: "Yesterday" },
            { desc: "Streak bonus — 5 consecutive correct", pts: 10, date: "Yesterday" },
            { desc: "Achievement: 100 Predictions", pts: 200, date: "May 8" },
          ].map((e, i) => (
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
          Redemption History
        </h3>
        <div className="space-y-2">
          {[
            { item: "ScoreMatrix Football Jersey", cost: "500 pts", date: "May 5", status: "Shipped" },
            { item: "Cyan Neon Theme Pack", cost: "50 credits", date: "May 1", status: "Delivered" },
          ].map((e, i) => (
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
