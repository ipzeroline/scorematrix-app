import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PointsBadge } from "@/components/shared/PointsBadge";

const ADMIN_REWARDS = [
  { id: "r1", name: "Football Jersey", category: "Merchandise", pointsCost: 500, creditCost: 0, stock: 25, isPremium: false },
  { id: "r2", name: "Steam $10", category: "Voucher", pointsCost: 1000, creditCost: 0, stock: 50, isPremium: false },
  { id: "r3", name: "Golden Badge", category: "Cosmetic", pointsCost: 0, creditCost: 100, stock: 999, isPremium: true },
  { id: "r4", name: "Neon Username", category: "Cosmetic", pointsCost: 0, creditCost: 75, stock: 999, isPremium: true },
];

export default function AdminRewardsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          Reward Management
        </h1>
        <Button size="sm">Add Reward</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Cost</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Stock</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Type</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_REWARDS.map((r) => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{r.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.category}</td>
                  <td className="px-4 py-3">
                    {r.isPremium ? (
                      <PointsBadge type="premium" amount={r.creditCost} size="sm" />
                    ) : (
                      <PointsBadge type="free" amount={r.pointsCost} size="sm" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-gray-400">
                    {r.stock}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={r.isPremium ? "gold" : "green"}>
                      {r.isPremium ? "Premium" : "Free"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost">Edit</Button>
                      <Button size="sm" variant="outline">Delete</Button>
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
