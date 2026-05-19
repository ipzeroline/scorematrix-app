"use client";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function AdminLanguagesPage() {
  const [keys] = useState([
    { key: "common.appName", en: "ScoreMatrix", th: "สกอร์เมทริกซ์", zh: "得分矩阵", ja: "スコアマトリックス", ko: "스코어매트릭스", vi: "ScoreMatrix" },
    { key: "nav.home", en: "Home", th: "หน้าแรก", zh: "首页", ja: "ホーム", ko: "홈", vi: "Trang chủ" },
    { key: "common.noGambling", en: "No cash withdrawal. No real money gambling.", th: "ไม่มีการถอนเงิน ไม่มีการพนันด้วยเงินจริง", zh: "不提供现金提现。不涉及真实货币赌博。", ja: "現金引き出し不可。リアルマネーギャンブルではありません。", ko: "현금 인출 없음. 실제 돈 도박이 아닙니다.", vi: "Không rút tiền mặt. Không đánh bạc bằng tiền thật." },
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold font-display text-white">
        Language Management
      </h1>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Key</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">EN</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">TH</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ZH</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((row) => (
                <tr key={row.key} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-xs font-mono text-cyan-400">
                    {row.key}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-300">{row.en}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{row.th}</td>
                  <td className="px-4 py-3 text-xs text-gray-300">{row.zh}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
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
