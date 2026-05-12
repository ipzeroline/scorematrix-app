"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const BANNERS = [
  { id: "b1", title: "Welcome to ScoreMatrix", position: "hero", status: "active", clicks: 12500, impressions: 45000 },
  { id: "b2", title: "Season 3 Begins", position: "hero", status: "scheduled", clicks: 0, impressions: 0 },
  { id: "b3", title: "Rewards Promo", position: "sidebar", status: "active", clicks: 3200, impressions: 28000 },
];

export default function AdminBannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          Banner Management
        </h1>
        <Button size="sm">Add Banner</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Clicks</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Impressions</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {BANNERS.map((banner) => (
                <tr key={banner.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">{banner.title}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{banner.position}</td>
                  <td className="px-4 py-3">
                    <Badge variant={banner.status === "active" ? "green" : "gold"}>
                      {banner.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {banner.clicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {banner.impressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost">Edit</Button>
                      <Button size="sm" variant={banner.status === "active" ? "outline" : "primary"}>
                        {banner.status === "active" ? "Pause" : "Activate"}
                      </Button>
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
