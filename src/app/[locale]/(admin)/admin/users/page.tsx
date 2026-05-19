"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search } from "lucide-react";

const MOCK_USERS = [
  { id: "u1", username: "CyberFan99", email: "cyberfan@example.com", role: "admin", level: 12, freePoints: 2840, predictions: 342, joined: "2026-01-15" },
  { id: "u2", username: "NeonProphet", email: "neon@example.com", role: "user", level: 18, freePoints: 4520, predictions: 512, joined: "2025-11-20" },
  { id: "u3", username: "GoalHunter", email: "goal@example.com", role: "user", level: 8, freePoints: 1200, predictions: 156, joined: "2026-03-01" },
  { id: "u4", username: "MatrixMaster", email: "matrix@example.com", role: "user", level: 25, freePoints: 8900, predictions: 892, joined: "2025-08-10" },
  { id: "u5", username: "suspicious_acc_42", email: "spam@fake.com", role: "user", level: 1, freePoints: 50000, predictions: 2, joined: "2026-05-10" },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        User Management
      </h1>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Role</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Level</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Points</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Predictions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar fallback={user.username} size="sm" />
                      <div>
                        <p className="text-xs text-white">{user.username}</p>
                        <p className="text-[10px] text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "magenta" : "default"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-white">
                    {user.level}
                  </td>
                  <td className="px-4 py-3 text-right text-xs font-mono text-green-400">
                    {user.freePoints.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400">
                    {user.predictions}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {user.joined}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="ghost">Edit</Button>
                      {user.id === "u5" && (
                        <Button size="sm" variant="danger">Ban</Button>
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
