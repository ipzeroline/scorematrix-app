import { getTranslations } from "next-intl/server";
import { CalendarDays, Clock3, Coins, Shield, Sparkles, Ticket, Trophy, Users } from "lucide-react";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { BadgeShowcase } from "@/components/shared/BadgeShowcase";
import { Card } from "@/components/ui/Card";
import { EventHowToPlay } from "@/components/shared/EventHowToPlay";
import { EventLeaderboard } from "@/components/shared/EventLeaderboard";
import { EventMatches } from "@/components/shared/EventMatches";
import { RewardsTable } from "@/components/shared/RewardsTable";
import { DEFAULT_EVENTS_RESPONSE, getEvents, mapApiEvent } from "@/lib/events-api";
import { THAILAND_TIME_ZONE_LABEL, formatDateTime } from "@/lib/utils";
import { EventDetailClient } from "./EventDetailClient";
import { EventDetailTabs } from "./EventDetailTabs";

type Props = {
  params: Promise<{ locale: string; eventId: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { locale, eventId } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  const response = await getEvents({ locale }).catch(() => DEFAULT_EVENTS_RESPONSE);
  const event = response.data.map(mapApiEvent).find((item) => item.id === eventId);

  if (!event) {
    notFound();
  }

  const descriptionBlocks = event.description
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
  const hasEntryCost = (event.entryFeePoints ?? 0) > 0 || (event.entryFeeCredits ?? 0) > 0;

  // ─── Overview tab content (existing detail content) ───
  const overviewContent = (
    <div className="space-y-6">
      {/* Info stats grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoStat
          icon={<CalendarDays size={16} className="text-cyan-300" />}
          label={t("startsAt")}
          value={formatDateTime(event.startDate, locale)}
        />
        <InfoStat
          icon={<Clock3 size={16} className="text-magenta-300" />}
          label={t("endsAt")}
          value={formatDateTime(event.endDate, locale)}
        />
        <InfoStat
          icon={<Ticket size={16} className="text-green-300" />}
          label={t("registrationStatus")}
          value={event.isRegistered ? t("registeredStatus") : t("notRegisteredStatus")}
        />
        <InfoStat
          icon={<Shield size={16} className="text-amber-300" />}
          label={t("capacity")}
          value={
            event.maxParticipants
              ? event.maxParticipants.toLocaleString()
              : t("unlimited")
          }
        />
      </section>

      {/* About + Event Window + Registration */}
      <Card className="overflow-hidden border-cyan-500/10 bg-[#101723] p-0">
        <div className="border-b border-cyan-500/10 bg-cyan-500/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-300" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-200">
              {t("overview")}
            </h2>
          </div>
        </div>
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
          <div>
            <h3 className="text-base font-semibold text-white">{t("aboutEvent")}</h3>
            <div className="mt-3 space-y-3 text-sm leading-7 text-gray-300">
              {descriptionBlocks.map((block, index) => (
                <p key={`${event.id}-block-${index}`} className="whitespace-pre-line">
                  {block}
                </p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-gray-800/80 bg-[#0d1118]">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-magenta-300" />
                <h3 className="text-sm font-semibold text-white">{t("eventWindow")}</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <DetailRow label={t("startsAt")} value={formatDateTime(event.startDate, locale)} />
                <DetailRow label={t("endsAt")} value={formatDateTime(event.endDate, locale)} />
                <DetailRow label={t("timezone")} value={THAILAND_TIME_ZONE_LABEL} />
              </div>
            </Card>

            <Card className="border-gray-800/80 bg-[#0d1118]">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-amber-300" />
                <h3 className="text-sm font-semibold text-white">{t("registration")}</h3>
              </div>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <DetailRow label={t("pointsFee")} value={formatPoints(event.entryFeePoints ?? 0, t)} />
                <DetailRow label={t("creditsFee")} value={formatCredits(event.entryFeeCredits ?? 0, t)} />
                <DetailRow
                  label={t("entryMode")}
                  value={hasEntryCost ? t("paidEntry") : t("freeToJoin")}
                />
              </div>
            </Card>
          </div>
        </div>
      </Card>

      {/* Rewards Section */}
      {event.rewards && event.rewards.length > 0 && (
        <RewardsTable rewards={event.rewards} badges={event.badges} />
      )}

      {/* Badge Showcase */}
      {event.badges && event.badges.length > 0 && (
        <BadgeShowcase badges={event.badges} />
      )}

      {/* Rules */}
      {event.rules && event.rules.length > 0 && (
        <Card className="border-gray-800/80 bg-[#101018] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            {t("rules")}
          </h2>
          <div className="mt-4 space-y-3">
            {event.rules.map((rule, index) => (
              <div
                key={`${event.id}-rule-${index}`}
                className="flex items-start gap-3 rounded-xl border border-gray-800/80 bg-black/15 px-4 py-3 text-sm text-gray-300"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8">
      {/* ─── Hero Banner ─── */}
      <section className="overflow-hidden rounded-2xl border border-cyan-500/20 bg-[#0c1118]">
        <div className="relative">
          {event.bannerUrl ? (
            <div
              className="h-56 w-full bg-cover bg-center md:h-72"
              style={{ backgroundImage: `linear-gradient(180deg, rgba(6,10,18,0.2) 0%, rgba(6,10,18,0.82) 100%), url(${event.bannerUrl})` }}
            />
          ) : (
            <div className="relative h-56 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_32%),radial-gradient(circle_at_80%_20%,_rgba(245,158,11,0.18),_transparent_26%),linear-gradient(135deg,_#091019_0%,_#101826_45%,_#190f22_100%)] md:h-72">
              <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(34,211,238,0.08)_35%,transparent_70%)]" />
              <div className="absolute -left-10 top-10 h-32 w-32 rounded-full border border-cyan-400/20 bg-cyan-400/10 blur-2xl" />
              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full border border-amber-400/15 bg-amber-400/10 blur-3xl" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1118] via-[#0c1118]/80 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" className="uppercase tracking-[0.18em]">
                {t(`tournamentTypes.${event.tournamentType}`)}
              </Badge>
              <Badge variant={getStatusVariant(event.status)}>
                {t(`statuses.${event.status}`)}
              </Badge>
              {event.isRegistered && (
                <Badge variant="green">{t("registeredStatus")}</Badge>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
                  {event.name}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
                  {descriptionBlocks[0] ?? event.description}
                </p>
              </div>

              <div className="grid min-w-full grid-cols-2 gap-3 sm:min-w-[340px] lg:w-[360px]">
                <HeroMetric
                  icon={<Users size={15} className="text-cyan-300" />}
                  label={t("participantsLabel")}
                  value={
                    event.maxParticipants
                      ? t("participantLimit", {
                          count: event.participantCount.toLocaleString(),
                          max: event.maxParticipants.toLocaleString(),
                        })
                      : t("participantCount", {
                          count: event.participantCount.toLocaleString(),
                        })
                  }
                />
                <HeroMetric
                  icon={<Coins size={15} className="text-amber-300" />}
                  label={t("entryFee")}
                  value={formatEntryFee(event, t)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Content + Sidebar ─── */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <EventDetailTabs
            event={event}
            overviewContent={overviewContent}
            howToPlayContent={<EventHowToPlay event={event} />}
            matchesContent={<EventMatches matches={event.matches ?? []} />}
            leaderboardContent={
              <EventLeaderboard
                entries={event.leaderboard ?? []}
                currentUserRank={
                  event.leaderboard?.find((e) => e.isCurrentUser)?.rank
                }
                currentUserPoints={
                  event.leaderboard?.find((e) => e.isCurrentUser)?.points
                }
                totalParticipants={event.participantCount}
              />
            }
          />
        </div>

        <div className="space-y-4">
          <EventDetailClient event={event} />
        </div>
      </div>
    </div>
  );
}

type EventTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;

function HeroMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-3 backdrop-blur">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gray-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function InfoStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-gray-800/80 bg-[#101018] p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
      <p className="mt-3 text-sm font-semibold text-white">{value}</p>
    </Card>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-800/80 pb-3 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-[0.14em] text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function formatEntryFee(
  event: {
    entryFeePoints?: number;
    entryFeeCredits?: number;
  },
  t: EventTranslator
) {
  const parts = [];
  const points = Number(event.entryFeePoints ?? 0);
  const credits = Number(event.entryFeeCredits ?? 0);

  if (points > 0) {
    parts.push(formatPoints(points, t));
  }
  if (credits > 0) {
    parts.push(formatCredits(credits, t));
  }

  return parts.length > 0 ? parts.join(" + ") : t("freeEntry");
}

function formatPoints(
  amount: number,
  t: EventTranslator
) {
  return amount > 0 ? t("pointsAmount", { amount: amount.toLocaleString() }) : t("free");
}

function formatCredits(
  amount: number,
  t: EventTranslator
) {
  return amount > 0 ? t("creditsAmount", { amount: amount.toLocaleString() }) : t("free");
}

function getStatusVariant(status: "upcoming" | "active" | "ended") {
  if (status === "active") return "green";
  if (status === "ended") return "default";
  return "cyan";
}
