"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { cn, formatDate, formatMatchTimeWithZone } from "@/lib/utils";
import { apiGetRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { useUserStore } from "@/stores/user-store";
import {
  Brain,
  CheckCheck,
  LogIn,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from "lucide-react";

type PredictableMatchResponse = {
  data?: PredictableMatchApiItem[];
};

type PredictableMatchApiItem = {
  provider_id?: number | string | null;
  league_id?: number | string | null;
  season?: number | string | null;
  status?: {
    short?: string | null;
    long?: string | null;
    elapsed?: number | null;
  } | null;
  teams?: {
    home?: {
      id?: number | string | null;
      name?: string | null;
      logo?: string | null;
    } | null;
    away?: {
      id?: number | string | null;
      name?: string | null;
      logo?: string | null;
    } | null;
  } | null;
  starts_at?: string | null;
  is_live?: boolean | null;
  is_terminal?: boolean | null;
  league?: {
    id?: number | string | null;
    name?: string | null;
    country_flag?: string | null;
    logo?: string | null;
  } | null;
};

type PredictableMatch = {
  id: string;
  leagueKey: string;
  season: string | null;
  kickoffTime: string;
  isLive: boolean;
  isTerminal: boolean;
  status: MatchStatus;
  statusLabel: string;
  league: {
    id: string | null;
    name: string;
    logo: string | null;
    countryFlag: string | null;
  };
  home: {
    id: string | null;
    name: string;
    logo: string | null;
  };
  away: {
    id: string | null;
    name: string;
    logo: string | null;
  };
};

type PredictionHistoryApiResponse = {
  data?: PredictionHistoryApiItem[];
};

type PredictionHistoryApiItem = {
  id?: string | number | null;
  matchId?: string | number | null;
  match_id?: string | number | null;
  predictedHomeScore?: number | null;
  predicted_home_score?: number | null;
  predictedAwayScore?: number | null;
  predicted_away_score?: number | null;
  actualHomeScore?: number | null;
  actual_home_score?: number | null;
  actualAwayScore?: number | null;
  actual_away_score?: number | null;
  pointsEarned?: number | null;
  points_earned?: number | null;
  status?: string | null;
  confidenceLevel?: string | null;
  confidence_level?: string | null;
  boostUsed?: boolean | null;
  boost_used?: boolean | null;
  firstScorerPlayerId?: string | number | null;
  first_scorer_player_id?: string | number | null;
  firstScorerPlayerName?: string | null;
  first_scorer_player_name?: string | null;
  firstScorer?: {
    name?: string | null;
  } | null;
  first_scorer?: {
    name?: string | null;
  } | null;
  createdAt?: string | null;
  created_at?: string | null;
  lockedAt?: string | null;
  locked_at?: string | null;
  halfTimeHome?: number | null;
  half_time_home?: number | null;
  halfTimeAway?: number | null;
  half_time_away?: number | null;
  totalGoals?: number | null;
  total_goals?: number | null;
  comboMultiplier?: number | null;
  combo_multiplier?: number | null;
  streakNumber?: number | null;
  streak_number?: number | null;
  pointsWagered?: number | null;
  points_wagered?: number | null;
  match?: {
    homeTeam?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    awayTeam?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    home?: {
      name?: string | null;
      logo?: string | null;
    } | null;
    away?: {
      name?: string | null;
      logo?: string | null;
    } | null;
  } | null;
};

type PredictionHistoryItem = {
  id: string;
  matchId: string;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  predicted: string;
  actual: string;
  points: number;
  result: "correct" | "incorrect" | "pending" | "partial";
  confidenceLevel: string | null;
  boostUsed: boolean;
  firstScorerPlayerId: string | null;
  firstScorerPlayerName: string | null;
  createdAt: string | null;
  lockedAt: string | null;
  halfTimeHome: number | null;
  halfTimeAway: number | null;
  totalGoals: number | null;
  comboMultiplier: number;
  streakNumber: number;
  pointsWagered: number;
};

type PlayerProfileResponse = {
  data?: {
    name?: unknown;
    player?: {
      name?: unknown;
    };
  };
  player?: {
    name?: unknown;
  };
  profile?: unknown;
  result?: unknown;
  name?: unknown;
};

export function PredictApi() {
  const t = useTranslations();
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const [tab, setTab] = useState("upcoming");
  const [matches, setMatches] = useState<PredictableMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [matchesRequestFailed, setMatchesRequestFailed] = useState(false);
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPrediction, setSelectedPrediction] =
    useState<PredictionHistoryItem | null>(null);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [playerName, setPlayerName] = useState<string | null>(null);

  const isLoggedIn = useUserStore((store) => store.isLoggedIn);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [scoringRules, setScoringRules] = useState<any | null>(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesRequestFailed, setRulesRequestFailed] = useState(false);

  const predictedMatchIds = useMemo(
    () => new Set(history.map((item) => item.matchId)),
    [history]
  );

  const handleSelectPrediction = (item: PredictionHistoryItem) => {
    setPlayerName(null);
    setLoadingPlayer(false);
    setSelectedPrediction(item);
  };

  const handleClosePrediction = () => {
    setSelectedPrediction(null);
    setPlayerName(null);
    setLoadingPlayer(false);
  };

  useEffect(() => {
    let cancelled = false;

    const loadMatches = async () => {
      setLoadingMatches(true);

      try {
        setMatchesRequestFailed(false);
        const response = await apiGetRaw<PredictableMatchResponse>(
          "https://api.scorematrix.live/api/v1/scorm/predictable-matches?excludePredicted=false",
          {
            locale,
            token: isLoggedIn ? undefined : null,
          }
        );

        if (!cancelled) {
          setMatches(normalizePredictableMatches(response.data));
        }
      } catch (error) {
        if (!cancelled) {
          if (!isAuthSessionExpiredError(error)) {
            console.error("Error loading predictable matches:", error);
          }
          setMatches([]);
          setMatchesRequestFailed(true);
        }
      } finally {
        if (!cancelled) {
          setLoadingMatches(false);
        }
      }
    };

    void loadMatches();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, locale]);

  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    const loadHistory = async () => {
      setLoadingHistory(true);

      try {
        const response = await apiGetRaw<PredictionHistoryApiResponse>(
          "/predictions",
          { locale }
        );

        if (!cancelled) {
          setHistory(normalizePredictionHistory(response.data, matches));
        }
      } catch (error) {
        if (!cancelled && !isAuthSessionExpiredError(error)) {
          console.error("Error loading prediction history:", error);
          setHistory([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn, locale, matches]);

  useEffect(() => {
    if (!selectedPrediction || !selectedPrediction.firstScorerPlayerId) return;
    if (selectedPrediction.firstScorerPlayerName) return;

    const firstScorerPlayerId = selectedPrediction.firstScorerPlayerId;
    const controller = new AbortController();

    const loadPlayerName = async () => {
      setLoadingPlayer(true);
      setPlayerName(null);

      try {
        const response = await fetch(
          `/api/football/players/${encodeURIComponent(firstScorerPlayerId)}`,
          {
            headers: { Accept: "application/json" },
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setPlayerName(null);
          return;
        }

        const payload = (await response.json()) as PlayerProfileResponse;
        setPlayerName(getPlayerNameFromProfilePayload(payload));
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setPlayerName(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingPlayer(false);
        }
      }
    };

    void loadPlayerName();

    return () => {
      controller.abort();
    };
  }, [selectedPrediction]);

  useEffect(() => {
    if (selectedPrediction) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPrediction]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-white">
              {t("prediction.title")}
            </h1>
          </div>
          <p className="text-sm text-gray-500">{t("prediction.checkBackLater")}</p>
        </div>
        {!isLoggedIn ? (
          <Link href={`/${locale}/auth/login?next=${encodeURIComponent(pathname)}`}>
            <Button variant="outline" size="sm" className="self-start sm:self-auto">
              <LogIn size={14} />
              {t("prediction.signIn")}
            </Button>
          </Link>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="self-start sm:self-auto"
          onClick={() => {
            setShowRulesModal(true);
            if (!scoringRules && !loadingRules) {
              void (async () => {
                setLoadingRules(true);
                setRulesRequestFailed(false);
                try {
                  const resp = await apiGetRaw<any>(
                    "https://api.scorematrix.live/api/v1/scorm/scoring-rules",
                    { locale }
                  );
                  // API returns an object with `data` key
                  setScoringRules(resp?.data ?? resp);
                } catch (error) {
                  console.error("Error loading scoring rules:", error);
                  setRulesRequestFailed(true);
                } finally {
                  setLoadingRules(false);
                }
              })();
            }
          }}
        >
          กติกา
        </Button>
      </div>

      <Tabs
        tabs={[
          {
            key: "upcoming",
            label: t("prediction.upcomingMatches"),
            count: matches.length,
          },
          {
            key: "history",
            label: t("prediction.predictionHistory"),
            count: isLoggedIn ? history.length : undefined,
          },
        ]}
        activeTab={tab}
        onChange={setTab}
      />

      {tab === "upcoming" ? (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            {isLoggedIn
              ? t("prediction.filterHelpLoggedIn")
              : t("prediction.filterHelpGuest")}
          </p>

          {loadingMatches ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={`predictable-match-skeleton-${index}`} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-40 rounded" />
                  <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-3">
                    <div className="space-y-2 text-center">
                      <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                      <Skeleton className="mx-auto h-3 w-24 rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="mx-auto h-5 w-16 rounded" />
                      <Skeleton className="mx-auto h-3 w-20 rounded" />
                    </div>
                    <div className="space-y-2 text-center">
                      <Skeleton className="mx-auto h-12 w-12 rounded-full" />
                      <Skeleton className="mx-auto h-3 w-24 rounded" />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : matchesRequestFailed ? (
            <EmptyState
              title={t("prediction.loadingUnavailableTitle")}
              description={t("prediction.loadingUnavailableDescription")}
            />
          ) : matches.length === 0 ? (
            <EmptyState
              title={t("prediction.noUpcomingMatches")}
              description={t("prediction.checkBackLater")}
            />
          ) : (
            matches.map((match) => {
              const hasPredicted = predictedMatchIds.has(match.id);

              return (
                <Card
                  key={match.id}
                  neon="cyan"
                  hover
                  className={cn(
                    hasPredicted &&
                      "border-emerald-500/35 bg-emerald-500/[0.04] shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_0_24px_rgba(16,185,129,0.08)]"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ApiLeagueLogo
                          name={match.league.name}
                          logo={match.league.logo}
                          size="sm"
                        />
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-bold text-white">
                            {match.league.name}
                          </h2>
                          <p className="truncate text-[11px] text-gray-500">
                            {match.season
                              ? t("prediction.seasonLabel", {
                                  season: match.season,
                                })
                              : t("prediction.kickoffLabel")}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        {hasPredicted ? (
                          <span className="mb-1 inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <CheckCheck size={11} />
                            {t("prediction.alreadyPredicted")}
                          </span>
                        ) : null}
                        <p className="whitespace-nowrap text-[11px] font-semibold text-gray-300">
                          {formatDate(match.kickoffTime, locale)}
                        </p>
                        <p className="whitespace-nowrap text-[11px] text-cyan-400">
                          {formatMatchTimeWithZone(match.kickoffTime, locale)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-[minmax(0,1fr)_88px_minmax(0,1fr)] items-center gap-3">
                      <TeamPick
                        name={match.home.name}
                        logo={match.home.logo}
                        accent="cyan"
                      />
                      <div className="min-w-[88px] text-center">
                        <p className="font-mono text-lg font-bold text-white">
                          {t("common.vs")}
                        </p>
                      </div>
                      <TeamPick
                        name={match.away.name}
                        logo={match.away.logo}
                        accent="magenta"
                      />
                    </div>

                    <div
                      className={cn(
                        "flex items-start justify-between gap-3 border-t pt-3 sm:items-center",
                        hasPredicted
                          ? "border-emerald-500/30"
                          : "border-gray-800/70"
                      )}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={match.status}
                          label={match.statusLabel}
                          className="px-2 py-0.5 text-[10px]"
                        />
                      </div>
                      {isLoggedIn && !hasPredicted ? (
                        <Link
                          className="self-end sm:self-auto"
                          href={buildPredictMatchHref(
                            locale,
                            match.id,
                            match.home.id,
                            match.away.id
                          )}
                        >
                          <Button size="sm" neon className="min-w-36">
                            {t("prediction.predictScore")}
                          </Button>
                        </Link>
                      ) : !isLoggedIn ? (
                        <Badge
                          variant="default"
                          className="self-end border-gray-700 text-gray-400 sm:self-auto"
                        >
                          {t("prediction.signInToPredict")}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {!isLoggedIn ? (
            <EmptyState
              title={t("prediction.predictionHistory")}
              description={t("prediction.filterHelpGuest")}
              action={
                <Link href={`/${locale}/auth/login?next=${encodeURIComponent(pathname)}`}>
                  <Button variant="outline" size="sm">
                    <LogIn size={14} />
                    {t("prediction.signIn")}
                  </Button>
                </Link>
              }
            />
          ) : loadingHistory ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card
                key={`history-skeleton-${index}`}
                className="relative overflow-hidden border-gray-900 bg-black/45 p-4"
              >
                <div className="absolute inset-0 animate-shimmer opacity-60" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <div className="grid grid-cols-[minmax(0,1fr)_72px_minmax(0,1fr)] items-center gap-3">
                    <div className="space-y-2 text-center">
                      <Skeleton className="mx-auto h-10 w-10 rounded-full" />
                      <Skeleton className="mx-auto h-3 w-20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="mx-auto h-6 w-14 rounded" />
                      <Skeleton className="mx-auto h-3 w-10 rounded" />
                    </div>
                    <div className="space-y-2 text-center">
                      <Skeleton className="mx-auto h-10 w-10 rounded-full" />
                      <Skeleton className="mx-auto h-3 w-20 rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                    <Skeleton className="h-14 rounded-xl" />
                  </div>
                </div>
              </Card>
            ))
          ) : history.length === 0 ? (
            <EmptyState
              title={t("prediction.noPredictions")}
              description={t("prediction.startPredictingHistory")}
            />
          ) : (
            history.map((item) => (
              <Card
                key={item.id}
                className="cursor-pointer bg-black/35 p-4 transition-all duration-300 hover:scale-[1.01] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                onClick={() => handleSelectPrediction(item)}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={toHistoryBadgeVariant(item.result)}>
                      {t(`prediction.${item.result}`)}
                    </Badge>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">
                        {t("prediction.pointsEarned")}
                      </p>
                      <p className="text-sm font-semibold text-green-400">
                        +{item.points} {t("common.points")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)_84px_minmax(0,1fr)] items-center gap-3">
                    <HistoryTeam
                      name={item.home}
                      logo={item.homeLogo}
                      accent="cyan"
                    />
                    <div className="text-center">
                      <div className="font-mono text-xl font-bold text-cyan-300">
                        {item.predicted}
                      </div>
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-gray-500">
                        {t("prediction.yourPrediction")}
                      </div>
                    </div>
                    <HistoryTeam
                      name={item.away}
                      logo={item.awayLogo}
                      accent="magenta"
                    />
                  </div>

                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <HistoryStatCard
                      label={t("prediction.yourPrediction")}
                      value={item.predicted}
                      valueClassName="text-cyan-300"
                    />
                    <HistoryStatCard
                      label={t("prediction.actualResult")}
                      value={item.actual}
                      valueClassName="text-white"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t border-gray-800/70 pt-2 text-[11px]">
                    <InlineMeta
                      label="Result"
                      value={t(`prediction.${item.result}`)}
                      valueClassName={historyTierTextClass(item.result)}
                    />
                    <InlineMeta
                      label="Confidence"
                      value={formatHistoryConfidence(item.confidenceLevel)}
                      valueClassName="text-violet-300"
                    />
                    <InlineMeta
                      label="Stake"
                      value={`${Number(item.pointsWagered ?? 0).toLocaleString()} pts`}
                      valueClassName="text-amber-300"
                    />
                    <InlineMeta
                      label="Boost"
                      value={item.boostUsed ? "ON" : "OFF"}
                      valueClassName={item.boostUsed ? "text-fuchsia-300" : "text-gray-300"}
                    />
                    <InlineMeta
                      label={t("prediction.submittedAt")}
                      value={formatHistoryTimestamp(item.createdAt, locale)}
                      valueClassName="text-gray-300"
                    />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoPanel
          icon={Trophy}
          title="การทายระยะยาว"
          items={[
            "แชมป์ลีก/ทัวร์นาเมนต์",
            "ทีมตกชั้น",
            "ดาวซัลโวสูงสุด",
            "ผู้เล่นยอดเยี่ยม",
            "4 ทีมสุดท้าย / รอบรองชนะเลิศ",
          ]}
        />
        <InfoPanel
          icon={Users}
          title="รูปแบบการแข่งขันในเว็บ"
          items={[
            "ลีกส่วนตัวกับเพื่อน",
            "ระบบคะแนนสะสม",
            "โบนัสสกอร์ตรง",
            "Streak Bonus",
            "Leaderboard รายสัปดาห์/รายเดือน/ตลอดกาล",
          ]}
        />
        <InfoPanel
          icon={Brain}
          title="ฟีเจอร์เสริม"
          items={[
            "Confidence Level",
            "ทายด้วย AI",
            "ประวัติการทายย้อนหลัง",
            "Badge / Achievement",
            "วิเคราะห์ความแม่นของตัวเอง",
          ]}
        />
      </section>

      {selectedPrediction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={handleClosePrediction}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#060913] shadow-2xl shadow-cyan-950/30">
            <button
              onClick={handleClosePrediction}
              className="absolute right-4 top-4 z-10 rounded-full border border-gray-800 bg-black/40 p-1.5 text-gray-500 transition-all duration-200 hover:border-cyan-500/50 hover:text-cyan-300"
              aria-label="Close prediction history modal"
            >
              <X size={14} />
            </button>

            <div className="overflow-y-auto p-6">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-gray-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                    Prediction Receipt
                  </span>
                  <p className="mt-2 text-xs text-gray-500">
                    {formatHistoryTimestamp(selectedPrediction.createdAt, locale)}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {selectedPrediction.home} vs {selectedPrediction.away}
                  </p>
                </div>
                <Badge
                  variant={toHistoryBadgeVariant(selectedPrediction.result)}
                  className="shrink-0 px-2.5 py-1 text-[11px]"
                >
                  {t(`prediction.${selectedPrediction.result}`)}
                </Badge>
              </div>

              <div className="space-y-5">
                <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr]">
                  <div className="rounded-2xl border border-gray-800/80 bg-black/40 p-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <HistoryTeam
                        name={selectedPrediction.home}
                        logo={selectedPrediction.homeLogo}
                        accent="cyan"
                      />

                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] px-4 py-3 text-center font-mono">
                        <div className="text-[10px] uppercase tracking-[0.16em] text-cyan-300/80">
                          {t("prediction.yourPrediction")}
                        </div>
                        <div className="mt-1 text-3xl font-black text-cyan-300">
                          {selectedPrediction.predicted}
                        </div>
                      </div>

                      <HistoryTeam
                        name={selectedPrediction.away}
                        logo={selectedPrediction.awayLogo}
                        accent="magenta"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <HistoryOutcomeCard
                        label={t("prediction.yourPrediction")}
                        value={selectedPrediction.predicted}
                        valueClassName="text-cyan-300"
                        toneClassName="border-cyan-500/15 bg-cyan-500/[0.05]"
                      />
                      <HistoryOutcomeCard
                        label={t("prediction.actualResult")}
                        value={selectedPrediction.actual}
                        valueClassName="text-white"
                        toneClassName="border-emerald-500/15 bg-emerald-500/[0.05]"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4">
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                      <HistorySummaryStat
                        label={t("prediction.pointsEarned")}
                        value={`+${selectedPrediction.points} PTS`}
                        valueClassName="text-emerald-300"
                      />
                      <HistorySummaryStat
                        label="Result"
                        value={t(`prediction.${selectedPrediction.result}`)}
                        valueClassName={historyTierTextClass(selectedPrediction.result)}
                      />
                      <HistorySummaryStat
                        label="Confidence"
                        value={formatHistoryConfidence(selectedPrediction.confidenceLevel)}
                        valueClassName="text-violet-300"
                      />
                      <HistorySummaryStat
                        label="Boost"
                        value={selectedPrediction.boostUsed ? "ON" : "OFF"}
                        valueClassName={
                          selectedPrediction.boostUsed
                            ? "text-fuchsia-300"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <HistoryModalSection
                    title="Prediction Setup"
                    tone="text-cyan-300"
                    className="border-cyan-500/10"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <HistoryModalMetric
                        label={t("predictionForm.payload.pointsWagered")}
                        value={`${Number(selectedPrediction.pointsWagered).toLocaleString()} PTS`}
                        valueClassName="text-cyan-300"
                      />
                      <HistoryModalMetric
                        label={t("prediction.combo")}
                        value={`x${selectedPrediction.comboMultiplier}`}
                        valueClassName="text-amber-300"
                      />
                      <HistoryModalMetric
                        label={t("prediction.streak")}
                        value={String(selectedPrediction.streakNumber)}
                        valueClassName="text-emerald-300"
                      />
                      <HistoryModalMetric
                        label="Boost"
                        value={selectedPrediction.boostUsed ? "ON" : "OFF"}
                        valueClassName={
                          selectedPrediction.boostUsed
                            ? "text-fuchsia-300"
                            : "text-gray-300"
                        }
                      />
                    </div>
                  </HistoryModalSection>

                  <HistoryModalSection
                    title="Extra Picks"
                    tone="text-fuchsia-300"
                    className="border-fuchsia-500/10"
                  >
                    <div className="grid gap-2 sm:grid-cols-2">
                      <HistoryModalMetric
                        label={t("predictionForm.summary.halfTime")}
                        value={
                          selectedPrediction.halfTimeHome !== null &&
                          selectedPrediction.halfTimeAway !== null
                            ? `${selectedPrediction.halfTimeHome} - ${selectedPrediction.halfTimeAway}`
                            : "-"
                        }
                      />
                      <HistoryModalMetric
                        label={t("predictionForm.deep.totalGoals")}
                        value={
                          selectedPrediction.totalGoals !== null
                            ? String(selectedPrediction.totalGoals)
                            : "-"
                        }
                        valueClassName="text-amber-300"
                      />
                      <HistoryModalMetric
                        label={t("predictionForm.deep.firstScorer")}
                        value={
                          selectedPrediction.firstScorerPlayerId
                            ? loadingPlayer
                              ? "Loading..."
                              : selectedPrediction.firstScorerPlayerName || playerName || "-"
                            : t("predictionForm.deep.noGoal")
                        }
                        valueClassName="text-cyan-300 sm:col-span-2"
                      />
                    </div>
                  </HistoryModalSection>
                </div>

                <HistoryModalSection
                  title="Timeline"
                  tone="text-gray-300"
                  className="border-gray-800/80"
                >
                  <div className="space-y-2">
                    <HistoryTimelineRow
                      label={t("prediction.submittedAt")}
                      value={formatHistoryTimestamp(selectedPrediction.createdAt, locale)}
                    />
                    <HistoryTimelineRow
                      label={t("prediction.lockedAt")}
                      value={formatHistoryTimestamp(selectedPrediction.lockedAt, locale)}
                    />
                  </div>
                </HistoryModalSection>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleClosePrediction}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <Modal
        open={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        title="กติกาการให้คะแนน"
        size="lg"
      >
        <div className="space-y-4">
          {loadingRules ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-48 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          ) : rulesRequestFailed ? (
            <div className="text-sm text-rose-300">ไม่สามารถโหลดกติกาได้</div>
          ) : scoringRules ? (
            <div className="space-y-4">
              {/* Result tiers */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Result Tiers</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.resultTiers || {}).map(
                    ([key, tier]: [string, any]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{tier.name}</div>
                            <div className="mt-1 text-xs text-gray-400 break-words whitespace-normal">{tier.description}</div>
                          </div>
                          <div className="text-right text-sm font-mono text-white min-w-[88px]">
                            <div>Base: {tier.basePoints}</div>
                            <div>Bonus: {tier.bonusPoints}</div>
                            <div className="font-semibold">Total: {tier.totalPoints}</div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Bonuses */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Bonuses</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.bonuses || {}).map(([key, bonus]: [string, any]) => (
                    <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{bonus.name}</div>
                        </div>
                        <div className="text-sm font-mono text-white min-w-[64px]">{bonus.points} pts</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence multipliers */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-white">Confidence Multipliers</h3>
                <div className="space-y-2">
                  {Object.entries(scoringRules.confidenceMultipliers || {}).map(
                    ([key, c]: [string, any]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                          </div>
                          <div className="text-sm font-mono text-white min-w-[48px]">x{c.multiplier}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Boost / Streak / Formula */}
              {scoringRules.boost ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{scoringRules.boost.name}</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.boost.description} (x{scoringRules.boost.multiplier})</div>
                </div>
              ) : null}

              {scoringRules.streak ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">{scoringRules.streak.name}</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.streak.description}</div>
                  {scoringRules.streak.bonusPerLevel ? (
                    <div className="mt-2 text-sm font-mono text-white">Bonus per level: {scoringRules.streak.bonusPerLevel}</div>
                  ) : null}
                  {scoringRules.streak.formula ? (
                    <div className="mt-1 text-xs text-gray-400">Formula: {scoringRules.streak.formula}</div>
                  ) : null}
                </div>
              ) : null}

              {scoringRules.formula ? (
                <div className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                  <div className="text-sm font-semibold text-white">Formula</div>
                  <div className="mt-1 text-xs text-gray-400">{scoringRules.formula.description}</div>
                  {scoringRules.formula.profit ? (
                    <div className="mt-2 text-sm font-mono text-white">{scoringRules.formula.profit}</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-gray-300">ไม่มีข้อมูล</div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function normalizePredictionHistory(
  data: PredictionHistoryApiItem[] | undefined,
  matches: PredictableMatch[]
) {
  if (!Array.isArray(data)) return [];

  return data
    .map((item, index) => {
      const matchId = toSegment(item.matchId ?? item.match_id);
      if (!matchId) return null;

      const match = matches.find((entry) => entry.id === matchId);
      const home =
        match?.home.name ??
        item.match?.homeTeam?.name?.trim() ??
        item.match?.home?.name?.trim() ??
        "Home Team";
      const away =
        match?.away.name ??
        item.match?.awayTeam?.name?.trim() ??
        item.match?.away?.name?.trim() ??
        "Away Team";
      const predictedHomeScore = toNullableNumber(
        item.predictedHomeScore ?? item.predicted_home_score
      );
      const predictedAwayScore = toNullableNumber(
        item.predictedAwayScore ?? item.predicted_away_score
      );
      const actualHomeScore = toNullableNumber(
        item.actualHomeScore ?? item.actual_home_score
      );
      const actualAwayScore = toNullableNumber(
        item.actualAwayScore ?? item.actual_away_score
      );

      return {
        id: toSegment(item.id) ?? `${matchId}-${index}`,
        matchId,
        home,
        away,
        homeLogo:
          match?.home.logo ??
          item.match?.homeTeam?.logo?.trim() ??
          item.match?.home?.logo?.trim() ??
          null,
        awayLogo:
          match?.away.logo ??
          item.match?.awayTeam?.logo?.trim() ??
          item.match?.away?.logo?.trim() ??
          null,
        predicted: `${predictedHomeScore ?? 0}-${predictedAwayScore ?? 0}`,
        actual:
          actualHomeScore !== null && actualAwayScore !== null
            ? `${actualHomeScore}-${actualAwayScore}`
            : "-",
        points: toNullableNumber(item.pointsEarned ?? item.points_earned) ?? 0,
        result: mapPredictionHistoryResult(item.status),
        confidenceLevel:
          toSegment(item.confidenceLevel ?? item.confidence_level) ?? null,
        boostUsed: Boolean(item.boostUsed ?? item.boost_used),
        firstScorerPlayerId:
          toSegment(item.firstScorerPlayerId ?? item.first_scorer_player_id) ??
          null,
        firstScorerPlayerName:
          toSegment(
            item.firstScorerPlayerName ??
              item.first_scorer_player_name ??
              item.firstScorer?.name ??
              item.first_scorer?.name
          ) ?? null,
        createdAt: toSegment(item.createdAt ?? item.created_at),
        lockedAt: toSegment(item.lockedAt ?? item.locked_at),
        halfTimeHome: toNullableNumber(item.halfTimeHome ?? item.half_time_home),
        halfTimeAway: toNullableNumber(item.halfTimeAway ?? item.half_time_away),
        totalGoals: toNullableNumber(item.totalGoals ?? item.total_goals),
        comboMultiplier:
          toNullableNumber(item.comboMultiplier ?? item.combo_multiplier) ?? 1,
        streakNumber:
          toNullableNumber(item.streakNumber ?? item.streak_number) ?? 0,
        pointsWagered:
          toNullableNumber(item.pointsWagered ?? item.points_wagered) ?? 0,
      } satisfies PredictionHistoryItem;
    })
    .filter((item): item is PredictionHistoryItem => item !== null);
}

function normalizePredictableMatches(
  data: PredictableMatchApiItem[] | undefined
): PredictableMatch[] {
  if (!Array.isArray(data)) return [];

  const matches: PredictableMatch[] = [];

  for (const item of data) {
    const matchId = toSegment(item.provider_id);
    const homeId = toSegment(item.teams?.home?.id);
    const awayId = toSegment(item.teams?.away?.id);
    const kickoffTime = item.starts_at?.trim();

    if (!matchId || !homeId || !awayId || !kickoffTime) {
      continue;
    }

    const status = mapPredictableMatchStatus(item);
    const leagueId = toSegment(item.league?.id ?? item.league_id);
    const season = toSegment(item.season);

    matches.push({
      id: matchId,
      leagueKey: `${leagueId ?? "league"}-${season ?? "season"}`,
      season,
      kickoffTime,
      isLive: item.is_live === true,
      isTerminal: item.is_terminal === true,
      status,
      statusLabel: buildPredictableStatusLabel(item),
      league: {
        id: leagueId,
        name: item.league?.name?.trim() || "League",
        logo: item.league?.logo?.trim() || null,
        countryFlag: item.league?.country_flag?.trim() || null,
      },
      home: {
        id: homeId,
        name: item.teams?.home?.name?.trim() || "Home Team",
        logo: item.teams?.home?.logo?.trim() || null,
      },
      away: {
        id: awayId,
        name: item.teams?.away?.name?.trim() || "Away Team",
        logo: item.teams?.away?.logo?.trim() || null,
      },
    });
  }

  return matches.sort((left, right) => {
    const leftTime = new Date(left.kickoffTime).getTime();
    const rightTime = new Date(right.kickoffTime).getTime();

    if (!Number.isFinite(leftTime) && !Number.isFinite(rightTime)) return 0;
    if (!Number.isFinite(leftTime)) return 1;
    if (!Number.isFinite(rightTime)) return -1;
    return leftTime - rightTime;
  });
}

function mapPredictableMatchStatus(item: PredictableMatchApiItem) {
  const shortStatus = String(item.status?.short ?? "").toUpperCase();

  if (item.is_live) return MatchStatus.LIVE;
  if (item.is_terminal) return MatchStatus.FINISHED;
  if (["PST", "POSTP", "SUSP"].includes(shortStatus)) {
    return MatchStatus.POSTPONED;
  }
  if (["CANC", "ABD", "AWD", "WO"].includes(shortStatus)) {
    return MatchStatus.CANCELLED;
  }

  return MatchStatus.UPCOMING;
}

function buildPredictableStatusLabel(item: PredictableMatchApiItem) {
  const longStatus = item.status?.long?.trim();
  const shortStatus = item.status?.short?.trim();
  return longStatus || shortStatus || "Upcoming";
}

function toSegment(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const segment = String(value).trim();
  return segment.length > 0 ? segment : null;
}

function toNullableNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function mapPredictionHistoryResult(status: string | null | undefined) {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "pending") return "pending";
  if (normalized === "correct" || normalized === "winner") return "correct";
  if (normalized === "partial") return "partial";
  return "incorrect";
}

function toHistoryBadgeVariant(result: PredictionHistoryItem["result"]) {
  switch (result) {
    case "correct":
      return "green";
    case "pending":
      return "cyan";
    case "partial":
      return "gold";
    default:
      return "red";
  }
}

function historyTierTextClass(result: PredictionHistoryItem["result"]) {
  switch (result) {
    case "correct":
      return "text-emerald-300";
    case "partial":
      return "text-amber-300";
    case "pending":
      return "text-cyan-300";
    default:
      return "text-rose-300";
  }
}

function formatHistoryConfidence(value: string | null) {
  switch (value) {
    case "bold":
      return "Bold";
    case "confident":
      return "Confident";
    case "safe":
      return "Safe";
    default:
      return "-";
  }
}

function formatHistoryTimestamp(value: string | null, locale: string) {
  if (!value) return "-";

  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale);
}

function getPlayerNameFromProfilePayload(payload: unknown): string | null {
  if (!isRecord(payload)) return null;

  const directName = toNonEmptyString(payload.name);
  if (directName) return directName;

  const playerName = isRecord(payload.player)
    ? toNonEmptyString(payload.player.name)
    : null;
  if (playerName) return playerName;

  return (
    getPlayerNameFromProfilePayload(payload.data) ??
    getPlayerNameFromProfilePayload(payload.profile) ??
    getPlayerNameFromProfilePayload(payload.result)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function InfoPanel({
  icon: Icon,
  title,
  items,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  items: string[];
}) {
  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={17} className="text-cyan-400" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-gray-400">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-green-400" />
            {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function TeamPick({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="mb-1 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} accent={accent} />
      </div>
      <p className="truncate text-xs text-white">{name}</p>
    </div>
  );
}

function HistoryTeam({
  name,
  logo,
  accent,
}: {
  name: string;
  logo: string | null;
  accent: "cyan" | "magenta";
}) {
  return (
    <div className="min-w-0 text-center">
      <div className="mb-2 flex justify-center">
        <ApiTeamLogo name={name} logo={logo} accent={accent} />
      </div>
      <p className="line-clamp-2 text-xs font-medium text-white">{name}</p>
    </div>
  );
}

function HistoryStatCard({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-black/30 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p className={`mt-1 font-mono text-sm font-semibold ${valueClassName ?? "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function InlineMeta({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-gray-800 bg-black/25 px-2.5 py-1">
      <span className="text-[10px] uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <span className={cn("font-mono text-[11px] font-semibold text-white", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

function HistoryOutcomeCard({
  label,
  value,
  valueClassName,
  toneClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  toneClassName?: string;
}) {
  return (
    <div className={cn("rounded-2xl border px-4 py-3", toneClassName)}>
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-xl font-black text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistorySummaryStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-black/20 px-4 py-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-lg font-black text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistoryModalSection({
  title,
  tone,
  className,
  children,
}: {
  title: string;
  tone?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-2xl border bg-black/30 p-4", className)}>
      <div className={cn("text-xs font-black uppercase tracking-[0.18em]", tone)}>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function HistoryModalMetric({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800/80 bg-black/25 px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 font-mono text-sm font-semibold text-white", valueClassName)}>
        {value}
      </p>
    </div>
  );
}

function HistoryTimelineRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-gray-800/80 bg-black/20 px-3 py-2.5">
      <span className="text-[11px] uppercase tracking-[0.14em] text-gray-500">
        {label}
      </span>
      <span className="text-right text-sm font-medium text-white">{value}</span>
    </div>
  );
}
