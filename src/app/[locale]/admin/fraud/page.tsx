import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShieldAlert, AlertTriangle, CheckCircle } from "lucide-react";

const ALERTS = [
  {
    id: "f1",
    user: "suspicious_acc_42",
    riskScore: 92,
    reason: "2 predictions, 50,000 points — likely bot/exploit",
    date: "2026-05-10",
    status: "pending",
  },
  {
    id: "f2",
    user: "rapid_predictor_88",
    riskScore: 78,
    reason: "100 predictions in 5 minutes — automated submission",
    date: "2026-05-09",
    status: "investigating",
  },
  {
    id: "f3",
    user: "multi_acc_farm_01",
    riskScore: 85,
    reason: "Multiple accounts from same IP — suspected multi-accounting",
    date: "2026-05-08",
    status: "confirmed",
  },
];

export default function FraudMonitoringPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldAlert size={20} className="text-red-400" />
        <h1 className="text-xl font-bold font-display text-white">
          Fraud Monitoring
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Alerts", value: "3", color: "red" },
          { label: "Under Investigation", value: "1", color: "gold" },
          { label: "Confirmed Cases", value: "1", color: "magenta" },
        ].map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className={`text-3xl font-bold font-mono text-${s.color}-400`}>
              {s.value}
            </p>
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ALERTS.map((alert) => (
                <tr key={alert.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{alert.user}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={alert.riskScore > 80 ? "red" : "gold"}
                      size="sm"
                    >
                      {alert.riskScore}%
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{alert.reason}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{alert.date}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        alert.status === "confirmed"
                          ? "red"
                          : alert.status === "investigating"
                            ? "gold"
                            : "default"
                      }
                    >
                      {alert.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="danger">Ban User</Button>
                      <Button size="sm" variant="green">Clear</Button>
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
