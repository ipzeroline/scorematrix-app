import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Users, Target, Gift, ShieldAlert, Wifi, TrendingUp } from "lucide-react";

const STATS = [
  { label: "Total Users", value: "12,450", change: "+12%", icon: Users, color: "cyan" },
  { label: "Total Predictions", value: "148,230", change: "+18%", icon: Target, color: "magenta" },
  { label: "Pending Redemptions", value: "23", change: "-5%", icon: Gift, color: "gold" },
  { label: "Fraud Alerts", value: "3", change: "+2", icon: ShieldAlert, color: "red" },
  { label: "API Status", value: "Connected", change: "OK", icon: Wifi, color: "green" },
  { label: "Active Today", value: "1,892", change: "+8%", icon: TrendingUp, color: "purple" },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STATS.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <stat.icon size={18} className={`text-${stat.color}-400`} />
              <span
                className={`text-xs font-mono ${
                  stat.change.startsWith("+") ? "text-green-400" : stat.change === "OK" ? "text-green-400" : "text-red-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold font-mono text-white">
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
          Recent Activity
        </h3>
        <div className="space-y-2">
          {[
            { action: "New user registered", user: "NeonProphet", time: "2 min ago" },
            { action: "Redemption requested", user: "CyberFan99", time: "5 min ago" },
            { action: "Fraud alert triggered", user: "suspicious_acc_42", time: "12 min ago", alert: true },
            { action: "Match data synced", user: "System", time: "15 min ago" },
            { action: "Reward stock updated", user: "Admin", time: "1 hour ago" },
          ].map((log, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-300">{log.action}</span>
                <span className="text-[10px] text-gray-600">by {log.user}</span>
              </div>
              <div className="flex items-center gap-2">
                {log.alert && (
                  <Badge variant="red" size="sm">Alert</Badge>
                )}
                <span className="text-[10px] text-gray-600">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
