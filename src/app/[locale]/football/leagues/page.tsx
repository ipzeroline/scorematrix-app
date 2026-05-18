import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Trophy } from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getApiFootballLeagues } from "@/lib/api-football";
import { buildLeagueSeoSlug } from "@/lib/football-slugs";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FootballLeaguesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const leagues = await getApiFootballLeagues({ current: true });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{t("football.leaguesTitle")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("football.leaguesDescription")}
          </p>
        </div>
        <Badge variant="cyan" size="md">
          {t("football.leagueCount", { count: leagues.length })}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {leagues.map((item) => {
          const currentSeason =
            item.seasons.find((season) => season.current) ?? item.seasons.at(-1);

          return (
            <Link
              key={`${item.league.id}-${currentSeason?.year ?? "season"}`}
              href={`/${locale}/football/leagues/${buildLeagueSeoSlug({
                apiLeagueId: item.league.id,
                name: item.league.name,
              })}?season=${currentSeason?.year ?? new Date().getFullYear()}`}
            >
              <Card hover className="flex h-full items-center gap-3 p-4">
                <ApiLeagueLogo name={item.league.name} logo={item.league.logo} />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-bold text-white">
                    {item.league.name}
                  </h2>
                  <p className="truncate text-xs text-gray-500">
                    {item.country.name} - {item.league.type}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-600">
                    <Trophy size={12} />
                    {t("football.season", { season: currentSeason?.year ?? "N/A" })}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
