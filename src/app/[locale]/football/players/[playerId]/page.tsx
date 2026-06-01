import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getApiFootballPlayerProfile } from "@/lib/api-football";

type Props = {
  params: Promise<{ locale: string; playerId: string }>;
  searchParams: Promise<{ season?: string }>;
};

export default async function FootballPlayerPage({ params, searchParams }: Props) {
  const { locale, playerId } = await params;
  const t = await getTranslations({ locale });
  const { season: seasonParam } = await searchParams;
  const player = Number.parseInt(playerId, 10);
  const fallbackSeason = Number.parseInt(
    seasonParam ?? String(new Date().getFullYear()),
    10
  );
  const profile = await getApiFootballPlayerProfile(player).catch(() => null);
  const season = profile?.statistics[0]?.league.season ?? fallbackSeason;

  if (!profile) {
    return (
      <div className="mx-auto max-w-4xl pb-8">
        <Card className="p-6 text-center text-sm text-gray-500">
          {t("football.playerUnavailable")}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-8">
      <Card neon="cyan" className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-800 bg-white">
            {profile.player.photo && (
              <Image
                src={profile.player.photo}
                alt={profile.player.name}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold text-white">
              {profile.player.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {profile.player.nationality ?? t("football.nationalityUnavailable")} - {t("football.ageYears", { age: profile.player.age ?? "N/A" })}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="cyan">{t("football.height", { value: profile.player.height ?? "N/A" })}</Badge>
              <Badge variant="magenta">{t("football.weight", { value: profile.player.weight ?? "N/A" })}</Badge>
              {profile.player.injured && <Badge variant="red">{t("football.injured")}</Badge>}
            </div>
          </div>
        </div>
        <Badge variant="gold" size="md">
          {t("football.season", { season })}
        </Badge>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-gray-800 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{t("football.playerProfileStats")}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider text-gray-500">
                <th className="px-3 py-2 text-left">{t("football.table.competition")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.team")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.appearancesShort")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.minutesShort")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.positionShort")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.ratingShort")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.goalsAssistsShort")}</th>
                <th className="px-3 py-2 text-center">{t("football.table.cards")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {profile.statistics.map((stat, index) => (
                <tr key={`${stat.league.id}-${stat.team.id}-${index}`}>
                  <td className="px-3 py-2">
                    <p className="truncate text-xs font-semibold text-white">
                      {stat.league.name}
                    </p>
                    <p className="text-[10px] text-gray-600">{stat.league.country}</p>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400">
                    {stat.team.name}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                    {stat.games.appearences ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                    {stat.games.minutes ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-400">
                    {stat.games.position ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-cyan-300">
                    {stat.games.rating ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                    {stat.goals.total ?? 0}/{stat.goals.assists ?? 0}
                  </td>
                  <td className="px-3 py-2 text-center font-mono text-xs text-gray-400">
                    {stat.cards.yellow ?? 0}/{stat.cards.red ?? 0}
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
