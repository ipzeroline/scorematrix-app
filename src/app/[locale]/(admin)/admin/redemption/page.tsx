"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { PointsBadge } from "@/components/shared/PointsBadge";
import { RedemptionStatus } from "@/types/common";

const REDEMPTIONS = [
  { id: "rd1", user: "CyberFan99", reward: "Football Jersey", cost: { type: "free" as const, amount: 500 }, status: RedemptionStatus.PENDING, date: "2026-05-12", shipping: null },
  { id: "rd2", user: "NeonProphet", reward: "Golden Badge", cost: { type: "premium" as const, amount: 100 }, status: RedemptionStatus.APPROVED, date: "2026-05-11", shipping: null },
  { id: "rd3", user: "GoalHunter", reward: "Scarf", cost: { type: "free" as const, amount: 300 }, status: RedemptionStatus.SHIPPED, date: "2026-05-08", shipping: "TRK-2026-001" },
  { id: "rd4", user: "MatrixMaster", reward: "Steam $10", cost: { type: "free" as const, amount: 1000 }, status: RedemptionStatus.DELIVERED, date: "2026-05-01", shipping: null },
];

const statusVariant: Record<RedemptionStatus, "default" | "gold" | "cyan" | "green"> = {
  [RedemptionStatus.PENDING]: "gold",
  [RedemptionStatus.APPROVED]: "cyan",
  [RedemptionStatus.SHIPPED]: "cyan",
  [RedemptionStatus.DELIVERED]: "green",
  [RedemptionStatus.CANCELLED]: "default",
};

export default function AdminRedemptionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Redemption Audit
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending", count: 1, color: "gold" },
          { label: "Approved", count: 1, color: "cyan" },
          { label: "Shipped", count: 1, color: "purple" },
          { label: "Delivered", count: 1, color: "green" },
        ].map((s) => (
          <Card key={s.label} className="p-3 text-center">
            <p className={`text-xl font-bold font-mono text-${s.color}-400`}>{s.count}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reward</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {REDEMPTIONS.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar fallback={r.user} size="sm" />
                      <span className="text-xs text-white">{r.user}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">{r.reward}</td>
                  <td className="px-4 py-3">
                    <PointsBadge type={r.cost.type} amount={r.cost.amount} size="sm" />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[r.status]}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{r.date}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      {r.status === RedemptionStatus.PENDING && (
                        <>
                          <Button size="sm" variant="primary">Approve</Button>
                          <Button size="sm" variant="danger">Reject</Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
