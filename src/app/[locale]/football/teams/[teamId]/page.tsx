import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  CalendarDays,
  Flag,
  MapPin,
  Shield,
  Shirt,
  Users,
} from "lucide-react";
import { HistoryBackButton } from "@/components/shared/HistoryBackButton";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getApiFootballTeamProfile } from "@/lib/api-football";

type Props = {
  params: Promise<{ locale: string; teamId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FootballTeamPage({ params, searchParams }: Props) {
  const { locale, teamId } = await params;
  const t = await getTranslations({ locale });
  const query = await searchParams;
  const team = Number.parseInt(teamId, 10);
  const league = query.league ? Number.parseInt(firstQueryValue(query.league) ?? "", 10) : undefined;
  const season = query.season ? Number.parseInt(firstQueryValue(query.season) ?? "", 10) : undefined;
  const { profile, stats } = await getApiFootballTeamProfile(team, league, season);

  if (!profile) {
    return <Unavailable title={t("football.teamUnavailable")} />;
  }

  const selectedLeague =
    profile.leagues.find((item) => {
      const sameLeague = typeof league === "number" ? item.id === league : true;
      const sameSeason = typeof season === "number" ? item.season === season : true;
      return sameLeague && sameSeason;
    }) ??
    profile.leagues.find((item) => (typeof season === "number" ? item.season === season : false)) ??
    profile.leagues[0] ??
    null;
  const selectedStats = selectedLeague?.statistics ?? stats;
  const squadPlayers = profile.squad?.players ?? [];
  const groupedPlayers = groupPlayersByPosition(squadPlayers);
  const totalPlayers = squadPlayers.length;
  const primaryLineup = selectedStats?.lineups?.slice().sort((a, b) => (b.played ?? 0) - (a.played ?? 0))[0] ?? null;

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <HistoryBackButton label={t("common.back")} fallbackHref={`/${locale}/football/leagues`} />

      <Card neon="cyan" className="overflow-hidden p-0">
        {profile.venue.image ? (
          <div className="relative h-52 w-full overflow-hidden border-b border-gray-800">
            <Image
              src={profile.venue.image}
              alt={`${profile.team.name} venue`}
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,20,0.18)_0%,rgba(5,10,20,0.92)_100%)]" />
          </div>
        ) : null}

        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.12),transparent_30%),linear-gradient(135deg,#0b1020_0%,#111827_55%,#090d16_100%)]" />
          <div className="relative flex flex-col gap-6 p-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <ApiTeamLogo
                name={profile.team.name}
                logo={profile.team.logo}
                size="lg"
                accent="cyan"
              />
              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={profile.team.national ? "gold" : "cyan"}>
                    {profile.team.national ? t("football.nationalTeam") : t("football.club")}
                  </Badge>
                  {season ? (
                    <Badge variant="magenta">{t("football.season", { season })}</Badge>
                  ) : null}
                  {selectedLeague?.name ? (
                    <Badge variant="green">{selectedLeague.name}</Badge>
                  ) : null}
                </div>

                <div>
                  <h1 className="truncate text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {profile.team.name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-400">
                    {profile.team.country || t("football.countryUnavailable")}
                    {profile.team.founded ? ` • ${t("football.founded", { year: profile.team.founded })}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                  <span>{profile.venue.city ?? t("football.unavailableValue")}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{profile.venue.name ?? t("football.unavailableValue")}</span>
                  <span className="h-1 w-1 rounded-full bg-cyan-400/70" />
                  <span>{formatNullableNumber(profile.venue.capacity, locale)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
              <HeroStat
                label={t("football.totalPlayers")}
                value={formatNumber(totalPlayers, locale)}
                icon={<Users size={16} className="text-cyan-300" />}
              />
              <HeroStat
                label={t("football.activeLeagues")}
                value={formatNumber(profile.leagues.length, locale)}
                icon={<Shield size={16} className="text-green-300" />}
              />
              <HeroStat
                label={t("football.homeVenue")}
                value={profile.venue.city ?? t("football.unavailableValue")}
                icon={<MapPin size={16} className="text-amber-300" />}
              />
            </div>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Info icon={Shield} label={t("football.code")} value={profile.team.code || t("football.unavailableValue")} />
        <Info icon={Flag} label={t("football.country")} value={profile.team.country || t("football.unavailableValue")} />
        <Info
          icon={CalendarDays}
          label={t("football.foundedYear")}
          value={profile.team.founded ? String(profile.team.founded) : t("football.unavailableValue")}
        />
        <Info
          icon={Shirt}
          label={t("football.teamType")}
          value={profile.team.national ? t("football.nationalTeam") : t("football.club")}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
            {t("football.teamProfile")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label={t("football.name")} value={profile.team.name} />
            <Detail label={t("football.code")} value={profile.team.code || t("football.unavailableValue")} />
            <Detail label={t("football.country")} value={profile.team.country || t("football.unavailableValue")} />
            <Detail
              label={t("football.foundedYear")}
              value={profile.team.founded ? String(profile.team.founded) : t("football.unavailableValue")}
            />
            <Detail
              label={t("football.teamType")}
              value={profile.team.national ? t("football.nationalTeam") : t("football.club")}
            />
            <Detail
              label={t("football.totalPlayers")}
              value={formatNumber(totalPlayers, locale)}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">
            {t("football.venueDetails")}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail label={t("matchDetail.venue")} value={profile.venue.name ?? t("football.unavailableValue")} />
            <Detail label={t("football.address")} value={profile.venue.address ?? t("football.unavailableValue")} wide />
            <Detail label={t("football.city")} value={profile.venue.city ?? t("football.unavailableValue")} />
            <Detail label={t("football.capacity")} value={formatNullableNumber(profile.venue.capacity, locale)} />
            <Detail label={t("football.surface")} value={profile.venue.surface ?? t("football.unavailableValue")} />
          </div>
        </Card>
      </section>

      {selectedStats ? (
        <FormListCard
          title={t("football.currentForm")}
          value={selectedStats.form}
          emptyLabel={t("football.unavailableValue")}
          resultLabels={{
            W: t("football.formResults.W"),
            D: t("football.formResults.D"),
            L: t("football.formResults.L"),
          }}
        />
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-fuchsia-300">
                {t("football.competitions")}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{t("football.teamLeaguesOverview")}</p>
            </div>
            <Badge variant="magenta">{formatNumber(profile.leagues.length, locale)}</Badge>
          </div>

          {profile.leagues.length > 0 ? (
            <div className="space-y-3">
              {profile.leagues.map((item, index) => {
                const active =
                  (typeof season === "number" ? item.season === season : false) ||
                  (typeof league === "number" ? item.id === league : false);

                return (
                  <div
                    key={`${item.id}-${item.season ?? index}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <ApiLeagueLogo name={item.name} logo={item.logo} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                          {active ? <Badge variant="cyan">{t("football.currentSelection")}</Badge> : null}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.country || t("football.countryUnavailable")}
                          {item.season ? ` • ${t("football.season", { season: item.season })}` : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyPanel label={t("football.teamLeaguesUnavailable")} />
          )}
        </Card>

        {selectedStats ? (
          <Card className="p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
              {t("football.teamSeasonStats")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <StatBar label={t("football.wins")} value={selectedStats.fixtures.wins.total} max={selectedStats.fixtures.played.total} color="green" />
              <StatBar label={t("football.draws")} value={selectedStats.fixtures.draws.total} max={selectedStats.fixtures.played.total} color="gold" />
              <StatBar label={t("football.losses")} value={selectedStats.fixtures.loses.total} max={selectedStats.fixtures.played.total} color="red" />
              <StatBar label={t("football.cleanSheets")} value={selectedStats.clean_sheet.total} max={selectedStats.fixtures.played.total} color="cyan" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MiniStat label={t("football.played")} value={selectedStats.fixtures.played.total} />
              <MiniStat label={t("football.goalsFor")} value={selectedStats.goals.for.total.total} />
              <MiniStat label={t("football.goalsAgainst")} value={selectedStats.goals.against.total.total} />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricBox label={t("football.scoringAverage")} value={selectedStats.goals.for.average.total} />
              <MetricBox label={t("football.concededAverage")} value={selectedStats.goals.against.average.total} />
              <MetricBox
                label={t("football.bestWinStreak")}
                value={formatNullableNumber(selectedStats.biggest?.streak?.wins ?? null, locale)}
              />
              <MetricBox
                label={t("football.primaryFormation")}
                value={primaryLineup?.formation ?? t("football.unavailableValue")}
              />
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.22em] text-green-300">
              {t("football.teamSeasonStats")}
            </h2>
            <EmptyPanel label={t("football.teamStatsHint")} />
          </Card>
        )}
      </section>

      <Card className="p-4">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">
              {t("football.squadTitle")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {profile.squad?.hydratedAt
                ? t("football.squadUpdatedAt", {
                    date: formatDate(profile.squad.hydratedAt, locale),
                  })
                : t("football.squadOverview")}
            </p>
          </div>
          <Badge variant="cyan">
            {t("football.teamCount", { count: totalPlayers || 0 })}
          </Badge>
        </div>

        {totalPlayers > 0 ? (
          <div className="space-y-5">
            {POSITION_ORDER.map((positionKey) => {
              const players = groupedPlayers[positionKey];
              if (players.length === 0) return null;

              return (
                <section key={positionKey} className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {t(`football.positionGroups.${positionKey}`)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {t("football.playersInGroup", { count: players.length })}
                      </p>
                    </div>
                    <div className="w-28">
                      <ProgressBar value={players.length} max={Math.max(totalPlayers, 1)} color="cyan" size="sm" />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {players.map((player) => (
                      <Link
                        key={player.id || player.name}
                        href={`/${locale}/football/players/${player.id}${season ? `?season=${season}` : ""}`}
                        className="group"
                      >
                        <Card hover className="h-full p-4 transition-transform duration-200 group-hover:-translate-y-0.5">
                          <div className="flex items-start gap-3">
                            <PlayerPhoto name={player.name} photo={player.photo} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-white">
                                    {player.name}
                                  </p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {player.position ?? t("football.unavailableValue")}
                                  </p>
                                </div>
                                <Badge variant="default">
                                  #{player.number ?? "-"}
                                </Badge>
                              </div>

                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <MiniInfo label={t("football.age")} value={formatNullableNumber(player.age, locale)} />
                                <MiniInfo label={t("football.jerseyNumber")} value={formatNullableNumber(player.number, locale)} />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptyPanel label={t("football.squadUnavailable")} />
        )}
      </Card>
    </div>
  );
}

const POSITION_ORDER = ["goalkeeper", "defender", "midfielder", "attacker", "other"] as const;

type PositionKey = (typeof POSITION_ORDER)[number];

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function groupPlayersByPosition(
  players: {
    id: number;
    name: string;
    age: number | null;
    number: number | null;
    position: string | null;
    photo: string | null;
  }[]
): Record<PositionKey, typeof players> {
  return players.reduce<Record<PositionKey, typeof players>>(
    (groups, player) => {
      const key = normalizePosition(player.position);
      groups[key].push(player);
      return groups;
    },
    {
      goalkeeper: [],
      defender: [],
      midfielder: [],
      attacker: [],
      other: [],
    }
  );
}

function normalizePosition(position: string | null): PositionKey {
  switch ((position ?? "").toLowerCase()) {
    case "goalkeeper":
      return "goalkeeper";
    case "defender":
      return "defender";
    case "midfielder":
      return "midfielder";
    case "attacker":
    case "forward":
      return "attacker";
    default:
      return "other";
  }
}

function formatNumber(value: number, locale: string) {
  return value.toLocaleString(locale);
}

function formatNullableNumber(value: number | null, locale: string) {
  return typeof value === "number" ? value.toLocaleString(locale) : "N/A";
}

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function HeroStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-500">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="truncate text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function PlayerPhoto({ name, photo }: { name: string; photo: string | null }) {
  return (
    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/90">
      {photo ? (
        <Image src={photo} alt={name} fill className="object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-xs font-black text-slate-700">
          {name.slice(0, 2).toUpperCase()}
        </div>
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

function Detail({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
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

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0f18] p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a0f18] p-3">
      <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function FormListCard({
  title,
  value,
  emptyLabel,
  resultLabels,
}: {
  title: string;
  value: string | null;
  emptyLabel: string;
  resultLabels: Record<string, string>;
}) {
  const items = value ? value.split("").filter(Boolean) : [];

  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_45%),linear-gradient(135deg,#09111d,#0d1524)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">{title}</p>
          <p className="mt-1 text-xs text-gray-400">
            W = {resultLabels.W}, D = {resultLabels.D}, L = {resultLabels.L}
          </p>
        </div>
        <Badge variant="cyan">{items.length}</Badge>
      </div>
      {items.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
            >
              <span className={formTokenClass(item)}>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm font-bold text-white">{emptyLabel}</p>
      )}
    </div>
  );
}

function formTokenClass(value: string) {
  const base =
    "inline-flex h-8 min-w-8 items-center justify-center rounded-full border px-2 text-xs font-black";

  switch (value.toUpperCase()) {
    case "W":
      return `${base} border-green-500/30 bg-green-500/15 text-green-300`;
    case "D":
      return `${base} border-amber-500/30 bg-amber-500/15 text-amber-300`;
    case "L":
      return `${base} border-red-500/30 bg-red-500/15 text-red-300`;
    default:
      return `${base} border-white/10 bg-white/5 text-white`;
  }
}

function EmptyPanel({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-gray-400">
      {label}
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
