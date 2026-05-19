import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Wifi, WifiOff, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

export default function AdminApiSyncPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        API Sync Status
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <CheckCircle size={24} className="text-green-400" />
          <div>
            <p className="text-sm font-semibold text-white">Match Data API</p>
            <p className="text-xs text-green-400">Connected</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <CheckCircle size={24} className="text-green-400" />
          <div>
            <p className="text-sm font-semibold text-white">AI Engine API</p>
            <p className="text-xs text-green-400">Connected</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <AlertTriangle size={24} className="text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-white">Notification API</p>
            <p className="text-xs text-amber-400">Degraded — latency high</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <WifiOff size={24} className="text-red-400" />
          <div>
            <p className="text-sm font-semibold text-white">Payment API</p>
            <p className="text-xs text-red-400">
              Disconnected — Last sync: 3h ago
            </p>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">
            Last Sync: 2026-05-12 14:30 UTC
          </h3>
          <Button size="sm" variant="outline">
            <RefreshCw size={14} /> Sync Now
          </Button>
        </div>
        <div className="space-y-2">
          {[
            { api: "Match Data", time: "14:30 UTC", status: "success", records: "120 matches" },
            { api: "AI Analysis", time: "14:28 UTC", status: "success", records: "30 insights" },
            { api: "Notification", time: "14:25 UTC", status: "degraded", records: "1,240 queued" },
            { api: "Payment", time: "11:15 UTC", status: "failed", records: "0 processed" },
          ].map((log, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-gray-800/50 last:border-0"
            >
              <span className="text-xs text-gray-300">{log.api}</span>
              <span className="text-xs text-gray-500">{log.time}</span>
              <Badge
                variant={
                  log.status === "success"
                    ? "green"
                    : log.status === "degraded"
                      ? "gold"
                      : "red"
                }
              >
                {log.status}
              </Badge>
              <span className="text-[10px] text-gray-600">{log.records}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
