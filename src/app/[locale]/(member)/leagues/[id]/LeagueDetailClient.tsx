"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ClipboardList,
  Coins,
  Copy,
  Crown,
  LockKeyhole,
  UserMinus,
  ShieldCheck,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  approveLeagueJoinRequest,
  getLeague,
  getLeagueJoinRequests,
  kickLeagueMember,
  rejectLeagueJoinRequest,
  type LeagueDetail,
  type LeagueJoinRequest,
} from "@/lib/leagues-api";
import { ApiClientError, isAuthSessionExpiredError } from "@/lib/api-client";
import { useNotificationStore } from "@/stores/notification-store";

const LEAGUE_LOGO_OVERRIDE_KEY = "scorematrix:league-logo:";

export default function LeagueDetailPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const t = useTranslations("leagues");
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(() => Date.now());
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [joinRequests, setJoinRequests] = useState<LeagueJoinRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [processingRequestKey, setProcessingRequestKey] = useState<string | null>(
    null
  );
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);
  const logoOverrideUrl = readStoredLeagueLogoOverride(id);
  const addToast = useNotificationStore((state) => state.addToast);

  const copyInviteCode = async (inviteCode: string) => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedInvite(true);
      window.setTimeout(() => setCopiedInvite(false), 1600);
    } catch {
      setCopiedInvite(false);
    }
  };

  useEffect(() => {
    let active = true;

    getLeague(id, { locale })
      .then((response) => {
        if (!active) return;
        setLeague(response);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        setLeague(null);
        setLoadFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, locale, refreshKey]);

  useEffect(() => {
    if (!league?.isOwner) {
      return;
    }

    let active = true;

    getLeagueJoinRequests(id, { locale })
      .then((requests) => {
        if (!active) return;
        setJoinRequests(requests.filter((request) => request.status === "pending"));
      })
      .catch((error) => {
        if (!active || isAuthSessionExpiredError(error)) return;
        setJoinRequests([]);
      })
      .finally(() => {
        if (active) setRequestsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, league?.isOwner, locale, refreshKey]);

  const handleApproveRequest = async (request: LeagueJoinRequest) => {
    setProcessingRequestKey(`approve:${request.id}`);

    try {
      await approveLeagueJoinRequest(id, request.id, request.userId, { locale });
      setJoinRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      setRefreshKey((current) => current + 1);
      addToast({ type: "success", title: t("requestApproved") });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("requestActionError");
      addToast({ type: "error", title: t("requestActionError"), message });
    } finally {
      setProcessingRequestKey(null);
    }
  };

  const handleRejectRequest = async (request: LeagueJoinRequest) => {
    setProcessingRequestKey(`reject:${request.id}`);

    try {
      await rejectLeagueJoinRequest(id, request.id, request.userId, { locale });
      setJoinRequests((current) =>
        current.filter((item) => item.id !== request.id)
      );
      addToast({ type: "success", title: t("requestRejected") });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("requestActionError");
      addToast({ type: "error", title: t("requestActionError"), message });
    } finally {
      setProcessingRequestKey(null);
    }
  };

  const handleKickMember = async (userId: string) => {
    if (!window.confirm(t("confirmKick"))) return;

    setKickingUserId(userId);

    try {
      await kickLeagueMember(id, userId, { locale });
      setRefreshKey((current) => current + 1);
      addToast({
        type: "success",
        title: t("memberKicked"),
        message: t("cooldownNotice"),
      });
    } catch (error) {
      const message =
        error instanceof ApiClientError ? error.message : t("kickError");
      addToast({ type: "error", title: t("kickError"), message });
    } finally {
      setKickingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (loadFailed || !league) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 pb-8">
        <BackLink locale={locale} label={t("backToLeagues")} />
        <Card className="p-10 text-center">
          <Trophy className="mx-auto text-gray-600" size={36} />
          <h1 className="mt-4 text-lg font-semibold text-white">
            {t("detailUnavailable")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("loadError")}</p>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setLoading(true);
              setRefreshKey((value) => value + 1);
            }}
          >
            {t("retry")}
          </Button>
        </Card>
      </div>
    );
  }

  const capacityPercent = Math.min(
    Math.round((league.memberCount / league.maxMembers) * 100),
    100
  );
  const createdAt = new Date(league.createdAt).toLocaleDateString(locale, {
    dateStyle: "medium",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-8">
      <BackLink locale={locale} label={t("backToLeagues")} />

      <Card
        neon="cyan"
        className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-[#12121a] to-purple-500/[0.05] p-5 sm:p-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <LeagueLogo
              name={league.name}
              logoUrl={logoOverrideUrl ?? league.logoUrl}
              cacheKey={refreshKey}
            />
            <div className="min-w-0 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={league.isPrivate ? "purple" : "green"}>
                  {league.isPrivate ? t("locked") : t("public")}
                </Badge>
                {league.myRank && (
                  <Badge variant="gold">
                    {t("yourRank")} #{league.myRank}
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
                {league.name}
              </h1>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                {league.description || t("noDescription")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric icon={Users} label={t("members")} value={`${league.memberCount}/${league.maxMembers}`} tone="text-cyan-300" />
          <Metric icon={Coins} label={t("entryFee")} value={league.entryFeeCredits === 0 ? t("free") : `${league.entryFeeCredits.toLocaleString()} Premium Credits`} tone="text-amber-300" />
          <Metric icon={Crown} label={t("yourRank")} value={league.myRank ? `#${league.myRank}` : "-"} tone="text-amber-300" />
          <Metric icon={CalendarDays} label={t("createdAt")} value={createdAt} tone="text-purple-300" />
        </div>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
            <span>{t("capacity")}</span>
            <span>{capacityPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-cyan-400"
              style={{ width: `${capacityPercent}%` }}
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-4">
            <div>
              <h2 className="text-sm font-semibold text-white">{t("standings")}</h2>
              <p className="mt-1 text-xs text-gray-500">{t("standingsDescription")}</p>
            </div>
            <Badge variant="cyan">{league.standings.length} {t("members")}</Badge>
          </div>

          {league.standings.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-500">
              {t("noStandings")}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {league.standings.map((standing) => (
                <div
                  key={standing.rank}
                className="grid grid-cols-[44px_1fr_auto_auto_auto] items-center gap-3 px-4 py-3"
                >
                  <Rank rank={standing.rank} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {t("rankedMember", { rank: standing.rank })}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {t("accuracy")}: {standing.accuracy}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-cyan-300">
                      {standing.points.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-600">{t("points")}</p>
                  </div>
                  <Target size={15} className="text-gray-600" />
                  {league.isOwner && standing.userId !== league.owner.id ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      loading={kickingUserId === standing.userId}
                      onClick={() => handleKickMember(standing.userId)}
                      className="min-h-8 px-2 text-xs"
                    >
                      <UserMinus size={13} />
                      {t("kick")}
                    </Button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              {league.isPrivate ? (
                <LockKeyhole size={16} className="text-purple-300" />
              ) : (
                <ShieldCheck size={16} className="text-green-300" />
              )}
              <h2 className="text-sm font-semibold text-white">
                {t("leagueAccess")}
              </h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-gray-500">
              {league.isPrivate ? t("privateLeagueDescription") : t("publicLeagueDescription")}
            </p>
            {league.inviteCode && (
              <div className="mt-4 rounded-lg border border-purple-500/20 bg-purple-500/10 p-3">
                <p className="text-[10px] uppercase tracking-wider text-purple-300">
                  {t("inviteCode")}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate font-mono text-sm font-semibold text-white">
                    {league.inviteCode}
                  </p>
                  <button
                    type="button"
                    onClick={() => copyInviteCode(league.inviteCode ?? "")}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-purple-300/20 text-purple-100 transition-colors hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-cyan-100"
                    title={t("inviteCode")}
                    aria-label={t("inviteCode")}
                  >
                    {copiedInvite ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {league.isOwner ? (
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ClipboardList size={16} className="text-amber-300" />
                  <h2 className="text-sm font-semibold text-white">
                    {t("pendingRequests")}
                  </h2>
                </div>
                <Badge variant="gold" size="sm">
                  {joinRequests.length}
                </Badge>
              </div>
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {t("pendingRequestsDescription")}
              </p>

              {requestsLoading ? (
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              ) : joinRequests.length === 0 ? (
                <p className="mt-4 rounded-lg border border-gray-800 bg-black/20 p-3 text-xs text-gray-500">
                  {t("noPendingRequests")}
                </p>
              ) : (
                <div className="mt-4 space-y-2">
                  {joinRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-lg border border-gray-800 bg-black/20 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {request.displayName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {request.requestedAt
                              ? formatRequestDate(request.requestedAt, locale)
                              : t("pendingApproval")}
                          </p>
                        </div>
                        <Badge variant="gold" size="sm">
                          {t("pendingApproval")}
                        </Badge>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <Button
                          type="button"
                          size="sm"
                          loading={processingRequestKey === `approve:${request.id}`}
                          onClick={() => handleApproveRequest(request)}
                          className="min-h-9 text-sm font-black"
                        >
                          <Check size={14} />
                          {t("approve")}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          loading={processingRequestKey === `reject:${request.id}`}
                          onClick={() => handleRejectRequest(request)}
                          className="min-h-9 text-sm font-black"
                        >
                          {t("reject")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function LeagueLogo({
  name,
  logoUrl,
  cacheKey,
}: {
  name: string;
  logoUrl: string | null;
  cacheKey?: number;
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={withCacheKey(logoUrl, cacheKey)}
        alt=""
        className="h-20 w-20 shrink-0 rounded-2xl border border-cyan-500/20 bg-black/30 object-cover"
      />
    );
  }

  return (
    <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
      <span className="font-mono text-xl font-black">{initials || "L"}</span>
    </div>
  );
}

function withCacheKey(url: string, cacheKey?: number) {
  if (!cacheKey || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}v=${cacheKey}`;
}

function formatRequestDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function readStoredLeagueLogoOverride(leagueId: string) {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(`${LEAGUE_LOGO_OVERRIDE_KEY}${leagueId}`);
  } catch {
    return null;
  }
}

function BackLink({ locale, label }: { locale: string; label: string }) {
  return (
    <Link
      href={`/${locale}/leagues`}
      className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-cyan-300"
    >
      <ArrowLeft size={15} />
      {label}
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f]/80 p-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon size={14} className={tone} />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Rank({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
      : rank === 2
        ? "border-gray-400/30 bg-gray-400/10 text-gray-300"
        : rank === 3
          ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
          : "border-gray-800 bg-gray-900 text-gray-500";

  return (
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold ${tone}`}>
      #{rank}
    </div>
  );
}
