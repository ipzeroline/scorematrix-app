import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MatchStatus } from "@/types/common";

const ADMIN_MATCHES = [
  { id: "m1", home: "London United", away: "Mersey City", league: "English Premier", status: MatchStatus.LIVE, score: "2-1", featured: true },
  { id: "m2", home: "Real Catalonia", away: "Atletico Madrid B", league: "La Liga", status: MatchStatus.UPCOMING, score: "-", featured: true },
  { id: "m3", home: "FC Bayern Stadt", away: "Dortmund 09", league: "Bundesliga", status: MatchStatus.FINISHED, score: "3-2", featured: false },
  { id: "m4", home: "AC Milano Nord", away: "AS Roma Sud", league: "Serie A", status: MatchStatus.UPCOMING, score: "-", featured: false },
];

export default function AdminMatchesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-display text-white">
          Match Management
        </h1>
        <Button size="sm">Add Match</Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Match</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">League</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Score</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500">Featured</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_MATCHES.map((m) => (
                <tr key={m.id} className="border-b border-gray-800/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-xs text-white">
                    {m.home} vs {m.away}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{m.league}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        m.status === MatchStatus.LIVE
                          ? "red"
                          : m.status === MatchStatus.UPCOMING
                            ? "cyan"
                            : "default"
                      }
                    >
                      {m.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono text-white">
                    {m.score}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {m.featured ? (
                      <Badge variant="gold">Featured</Badge>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
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
