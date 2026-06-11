import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  Flag,
  MapPin,
  Shield,
  Shirt,
  Timer,
  Trophy,
} from "lucide-react";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getApiFootballPlayerProfile } from "@/lib/api-football";

type Props = {
  params: Promise<{ locale: string; playerId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FootballPlayerPage({ params, searchParams }: Props) {
  const { locale, playerId } = await params;
  const query = await searchParams;
  const t = await getTranslations({ locale });
  const player = Number.parseInt(playerId, 10);
  const requestedSeason = firstQueryValue(query.season);
  const profile = await getApiFootballPlayerProfile(player).catch(() => null);

  if (!profile) {
    return <Unavailable title={t("football.playerUnavailable")} />;
  }

  const availableSeasons = getAvailableSeasons(profile);
  const fallbackSeason = availableSeasons[0] ?? new Date().getFullYear();
  const selectedSeason = Number.parseInt(requestedSeason ?? String(fallbackSeason), 10);
  const selectedStats = profile.statistics.filter(
    (item) => item.league.season === selectedSeason
  );
  const selectedTeamFromSeason = profile.teams.find((item) =>
    item.seasons.includes(selectedSeason)
  );
  const selectedTeam =
    selectedTeamFromSeason ??
    (selectedStats[0]
      ? {
          team: selectedStats[0].team,
          seasons: [selectedSeason],
        }
      : profile.teams[0]);
  const seasonSummary = summarizeSeason(selectedStats);
  const maxMinutes = Math.max(seasonSummary.appearances * 90, 90);

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <HistoryBackButton label={t("common.back")} fallbackHref={`/${locale}/football/leagues`} />

      <Card neon="cyan" className="overflow-hidden p-0">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_40%),radial-gradient(circle_at_top_right,rgba(217,70,239,0.16),transparent_35%),linear-gradient(135deg,#111827_0%,#0a0f1f_48%,#080b12_100%)]" />
          <div className="relative flex flex-col gap-6 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-cyan-500/20 bg-white/95 shadow-[0_0_30px_rgba(34,211,238,0.15)]">
                {profile.player.photo ? (
                  <Image
                    src={profile.player.photo}
                    alt={profile.player.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-slate-200 text-3xl font-black text-slate-700">
                    {initialsFor(profile.player.name)}
                  </div>
                )}
              </div>
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="cyan">{t("football.playerOverview")}</Badge>
                  <Badge variant="gold">{t("football.season", { season: selectedSeason })}</Badge>
                  {profile.player.injured ? (
                    <Badge variant="red">{t("football.injured")}</Badge>
                  ) : null}
                </div>

                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {profile.player.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    {profile.player.firstname || profile.player.lastname
                      ? [profile.player.firstname, profile.player.lastname].filter(Boolean).join(" ")
                      : t("football.fullNameUnavailable")}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  <span>{profile.player.nationality ?? t("football.nationalityUnavailable")}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{t("football.ageYears", { age: profile.player.age ?? "N/A" })}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{profile.player.position ?? t("football.unavailableValue")}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <HeroHighlight
                label={t("football.currentTeam")}
                value={selectedTeam?.team.name ?? t("football.unavailableValue")}
                ornament={
                  <ApiTeamLogo
                    name={selectedTeam?.team.name ?? profile.player.name}
                    logo={selectedTeam?.team.logo}
                    size="sm"
                    accent="cyan"
                  />
                }
              />
              <HeroHighlight
                label={t("football.competitions")}
                value={String(selectedStats.length)}
                ornament={<Trophy size={16} className="text-amber-400" />}
              />
              <HeroHighlight
                label={t("football.totalMinutes")}
                value={formatNumber(seasonSummary.minutes, locale)}
                ornament={<Timer size={16} className="text-green-400" />}
              />
              <HeroHighlight
                label={t("football.averageRating")}
                value={seasonSummary.averageRating ?? "-"}
                ornament={<Shield size={16} className="text-fuchsia-400" />}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {availableSeasons.map((season) => {
          const href = `/${locale}/football/players/${playerId}?season=${season}`;
          const isActive = season === selectedSeason;

          return (
            <Link key={season} href={href}>
              <Badge
                variant={isActive ? "cyan" : "default"}
                size="md"
                className={isActive ? "shadow-[0_0_18px_rgba(34,211,238,0.12)]" : ""}
              >
                {t("football.season", { season })}
              </Badge>
            </Link>
          );
        })}
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
                {t("football.seasonSnapshot")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t("football.activeInSeason", { season: selectedSeason })}
              </p>
            </div>
            {selectedTeam ? (
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                <ApiTeamLogo
                  name={selectedTeam.team.name}
                  logo={selectedTeam.team.logo}
                  size="xs"
                  accent="gray"
                />
                <span className="text-xs font-semibold text-white">{selectedTeam.team.name}</span>
              </div>
            ) : null}
          </div>

          {selectedStats.length > 0 ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label={t("football.appearances")}
                  value={formatNumber(seasonSummary.appearances, locale)}
                  accent="cyan"
                />
                <MetricCard
                  label={t("football.lineups")}
                  value={formatNumber(seasonSummary.lineups, locale)}
                  accent="green"
                />
                <MetricCard
                  label={t("football.goalsConceded")}
                  value={formatNumber(seasonSummary.goalsConceded, locale)}
                  accent="red"
                />
                <MetricCard
                  label={t("football.saves")}
                  value={formatNumber(seasonSummary.saves, locale)}
                  accent="gold"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <StatRail
                  label={t("football.lineups")}
                  value={seasonSummary.lineups}
                  max={Math.max(seasonSummary.appearances, 1)}
                  tone="green"
                  note={`${formatNumber(seasonSummary.lineups, locale)}/${formatNumber(
                    seasonSummary.appearances,
                    locale
                  )}`}
                />
                <StatRail
                  label={t("football.totalMinutes")}
                  value={seasonSummary.minutes}
                  max={maxMinutes}
                  tone="cyan"
                  note={`${formatNumber(seasonSummary.minutes, locale)}/${formatNumber(
                    maxMinutes,
                    locale
                  )}`}
                />
                <StatRail
                  label={t("football.passAccuracy")}
                  value={seasonSummary.passAccuracy ?? 0}
                  max={100}
                  tone="gold"
                  note={
                    seasonSummary.passAccuracy !== null
                      ? `${seasonSummary.passAccuracy}%`
                      : t("football.unavailableValue")
                  }
                />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-gray-400">
              {t("football.seasonNoData")}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
            {t("football.personalDetails")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <DetailStat
              icon={Shirt}
              label={t("football.jerseyNumber")}
              value={formatNullableNumber(profile.player.number, locale)}
            />
            <DetailStat
              icon={Shield}
              label={t("football.primaryPosition")}
              value={profile.player.position ?? t("football.unavailableValue")}
            />
            <DetailStat
              icon={CalendarDays}
              label={t("football.birthDate")}
              value={formatDate(profile.player.birth.date, locale)}
            />
            <DetailStat
              icon={MapPin}
              label={t("football.birthPlace")}
              value={joinParts([
                profile.player.birth.place,
                profile.player.birth.country,
              ])}
            />
            <DetailStat
              icon={Flag}
              label={t("football.country")}
              value={profile.player.nationality ?? t("football.nationalityUnavailable")}
            />
            <DetailStat
              icon={Timer}
              label={t("football.heightLabel")}
              value={profile.player.height ?? t("football.unavailableValue")}
            />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <MiniInfo
              label={t("football.weightLabel")}
              value={profile.player.weight ?? t("football.unavailableValue")}
            />
            <MiniInfo label={t("football.fullName")} value={profile.player.name || t("football.fullNameUnavailable")} />
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
            {t("football.playerProfileStats")}
          </h2>

          {selectedStats.length > 0 ? (
            <div className="space-y-3">
              {selectedStats.map((stat, index) => (
                <div
                  key={`${stat.league.id}-${stat.team.id}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <ApiLeagueLogo name={stat.league.name} logo={stat.league.logo} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {stat.league.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span>{stat.league.country || t("football.countryUnavailable")}</span>
                          <span className="h-1 w-1 rounded-full bg-white/20" />
                          <span>{stat.team.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="cyan">{t("football.table.appearancesShort")}: {stat.games.appearences ?? "-"}</Badge>
                      <Badge variant="green">{t("football.table.minutesShort")}: {stat.games.minutes ?? "-"}</Badge>
                      {stat.games.rating ? (
                        <Badge variant="gold">{t("football.table.ratingShort")}: {stat.games.rating}</Badge>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniInfo label={t("football.primaryPosition")} value={stat.games.position ?? t("football.unavailableValue")} />
                    <MiniInfo label={t("football.goalsAssists")} value={`${stat.goals.total ?? 0}/${stat.goals.assists ?? 0}`} />
                    <MiniInfo label={t("football.goalsConceded")} value={formatNullableNumber(stat.goals.conceded, locale)} />
                    <MiniInfo label={t("football.saves")} value={formatNullableNumber(stat.goals.saves, locale)} />
                    <MiniInfo label={t("football.passAccuracy")} value={formatAccuracy(stat.passes.accuracy)} />
                    <MiniInfo label={t("football.substituteIn")} value={formatNullableNumber(stat.substitutes.in, locale)} />
                    <MiniInfo label={t("football.bench")} value={formatNullableNumber(stat.substitutes.bench, locale)} />
                    <MiniInfo label={t("football.cardsRecord")} value={`${stat.cards.yellow ?? 0}/${stat.cards.red ?? 0}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-gray-400">
              {t("football.seasonNoData")}
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
            {t("football.careerJourney")}
          </h2>

          {profile.teams.length > 0 ? (
            <div className="space-y-3">
              {profile.teams.map((entry, index) => (
                <div
                  key={`${entry.team.id}-${index}`}
                  className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start gap-3">
                    <ApiTeamLogo
                      name={entry.team.name}
                      logo={entry.team.logo}
                      size="sm"
                      accent={entry.seasons.includes(selectedSeason) ? "cyan" : "gray"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-white">{entry.team.name}</p>
                        {entry.seasons.includes(selectedSeason) ? (
                          <Badge variant="cyan">{t("football.activeInSeason", { season: selectedSeason })}</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {entry.seasons.length > 0
                          ? entry.seasons.slice().sort((a, b) => b - a).join(" • ")
                          : t("football.unavailableValue")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-gray-400">
              {t("football.careerNoData")}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getAvailableSeasons(profile: NonNullable<Awaited<ReturnType<typeof getApiFootballPlayerProfile>>>) {
  return Array.from(
    new Set([
      ...profile.statistics.map((item) => item.league.season),
      ...profile.teams.flatMap((item) => item.seasons),
    ])
  )
    .filter((season) => Number.isFinite(season))
    .sort((a, b) => b - a);
}

function summarizeSeason(
  stats: NonNullable<Awaited<ReturnType<typeof getApiFootballPlayerProfile>>>["statistics"]
): {
  appearances: number;
  lineups: number;
  minutes: number;
  goalsConceded: number;
  saves: number;
  averageRating: string | null;
  passAccuracy: number | null;
} {
  const ratings = stats
    .map((item) => {
      const value = item.games.rating ? Number(item.games.rating) : Number.NaN;
      return Number.isFinite(value) ? value : null;
    })
    .filter((value): value is number => value !== null);
  const passAccuracies = stats
    .map((item) => {
      const value =
        typeof item.passes.accuracy === "number"
          ? item.passes.accuracy
          : item.passes.accuracy
            ? Number(item.passes.accuracy)
            : Number.NaN;
      return Number.isFinite(value) ? value : null;
    })
    .filter((value): value is number => value !== null);

  return {
    appearances: sumNumbers(stats.map((item) => item.games.appearences)),
    lineups: sumNumbers(stats.map((item) => item.games.lineups)),
    minutes: sumNumbers(stats.map((item) => item.games.minutes)),
    goalsConceded: sumNumbers(stats.map((item) => item.goals.conceded)),
    saves: sumNumbers(stats.map((item) => item.goals.saves)),
    averageRating:
      ratings.length > 0
        ? (ratings.reduce((total, value) => total + value, 0) / ratings.length).toFixed(2)
        : null,
    passAccuracy:
      passAccuracies.length > 0
        ? Math.round(
            passAccuracies.reduce((total, value) => total + value, 0) / passAccuracies.length
          )
        : null,
  };
}

function sumNumbers(values: Array<number | null>): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

function formatNumber(value: number, locale: string) {
  return value.toLocaleString(locale);
}

function formatNullableNumber(value: number | null, locale: string) {
  return typeof value === "number" ? value.toLocaleString(locale) : "N/A";
}

function formatDate(value: string | null, locale: string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatAccuracy(value: number | string | null) {
  if (value === null || value === undefined || value === "") return "N/A";
  return typeof value === "number" ? `${value}%` : `${value}%`;
}

function joinParts(values: Array<string | null>) {
  const joined = values.filter(Boolean).join(", ");
  return joined || "N/A";
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "SM";
}

function HeroHighlight({
  label,
  value,
  ornament,
}: {
  label: string;
  value: string;
  ornament: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
        <span>{label}</span>
        <span>{ornament}</span>
      </div>
      <p className="truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "cyan" | "green" | "gold" | "red";
}) {
  const accents = {
    cyan: "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-300",
    green: "border-green-500/20 bg-green-500/[0.08] text-green-300",
    gold: "border-amber-500/20 bg-amber-500/[0.08] text-amber-300",
    red: "border-red-500/20 bg-red-500/[0.08] text-red-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${accents[accent]}`}>
      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function StatRail({
  label,
  value,
  max,
  tone,
  note,
}: {
  label: string;
  value: number;
  max: number;
  tone: "cyan" | "green" | "gold";
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1220] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-white">{label}</p>
        <span className="text-[11px] text-gray-500">{note}</span>
      </div>
      <ProgressBar value={value} max={max} color={tone} size="sm" />
    </div>
  );
}

function DetailStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
        <Icon size={14} className="text-cyan-400" />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
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
