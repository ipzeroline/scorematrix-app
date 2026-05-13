import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Building2, MapPin, Shield } from "lucide-react";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getApiFootballTeamProfile } from "@/lib/api-football";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
  searchParams: Promise<{ league?: string; season?: string }>;
};

export default async function FootballTeamPage({ params, searchParams }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations({ locale });
  const query = await searchParams;
  const team = Number.parseInt(teamId, 10);
  const league = query.league ? Number.parseInt(query.league, 10) : undefined;
  const season = query.season ? Number.parseInt(query.season, 10) : undefined;
  const { profile, stats } = await getApiFootballTeamProfile(team, league, season);

  if (!profile) {
    return <Unavailable title={t("football.teamUnavailable")} />;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-8">
      <Card neon="cyan" className="overflow-hidden p-0">
        {profile.venue.image && (
          <div className="relative h-48 w-full overflow-hidden border-b border-gray-800">
            <Image
              src={profile.venue.image}
              alt={`${profile.team.name} venue`}
              fill
              className="object-cover opacity-55"
            />
          </div>
        )}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <ApiTeamLogo name={profile.team.name} logo={profile.team.logo} size="lg" accent="cyan" />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-white">
                {profile.team.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {profile.team.country} {profile.team.founded ? `- ${t("football.founded", { year: profile.team.founded })}` : ""}
              </p>
            </div>
          </div>
          <Badge variant={profile.team.national ? "gold" : "cyan"} size="md">
            {profile.team.national ? t("football.nationalTeam") : t("football.club")}
          </Badge>
        </div>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Info icon={Shield} label={t("football.code")} value={profile.team.code ?? "N/A"} />
        <Info icon={Building2} label={t("matchDetail.venue")} value={profile.venue.name ?? "N/A"} />
        <Info icon={MapPin} label={t("football.city")} value={profile.venue.city ?? "N/A"} />
      </section>

      {stats ? (
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-white">{t("football.teamSeasonStats")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <StatBar label={t("football.wins")} value={stats.fixtures.wins.total} max={stats.fixtures.played.total} color="green" />
            <StatBar label={t("football.draws")} value={stats.fixtures.draws.total} max={stats.fixtures.played.total} color="gold" />
            <StatBar label={t("football.losses")} value={stats.fixtures.loses.total} max={stats.fixtures.played.total} color="red" />
            <StatBar label={t("football.cleanSheets")} value={stats.clean_sheet.total} max={stats.fixtures.played.total} color="cyan" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MiniStat label={t("football.played")} value={stats.fixtures.played.total} />
            <MiniStat label={t("football.goalsFor")} value={stats.goals.for.total.total} />
            <MiniStat label={t("football.goalsAgainst")} value={stats.goals.against.total.total} />
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center text-sm text-gray-500">
          {t("football.teamStatsHint")}
        </Card>
      )}
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <Icon size={18} className="text-cyan-400" />
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-white">{value}</p>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      </div>
    </Card>
  );
}

function StatBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: "cyan" | "green" | "gold" | "red";
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="font-mono text-white">{value}/{max}</span>
      </div>
      <ProgressBar value={value} max={max || 1} color={color} size="sm" />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] p-3">
      <p className="font-mono text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
    </div>
  );
}

function Unavailable({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-4xl pb-8">
      <Card className="p-6 text-center text-sm text-gray-500">{title}</Card>
    </div>
  );
}
