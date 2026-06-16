"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, memo } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { MatchStatus } from "@/types/common";
import { buildPredictMatchHref } from "@/lib/predict-route";
import { cn, formatTime } from "@/lib/utils";
import { apiGetRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { useUserStore } from "@/stores/user-store";
import {
  Brain,
  CheckCheck,
  ChevronRight,
  ExternalLink,
  LogIn,
  ShieldCheck,
  Sparkles,
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
  scoring?: ScoringApiBreakdown | null;
  score_breakdown?: ScoringApiBreakdown | null;
  breakdown?: ScoringApiBreakdown | null;
  scoringBreakdown?: ScoringApiBreakdown | null;
  resultType?: string | null;
  result_type?: string | null;
  predictedResult?: string | null;
  predicted_result?: string | null;
  actualResult?: string | null;
  actual_result_label?: string | null;
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
  result: "correct" | "incorrect" | "pending" | "partial" | "void";
  resultType: string | null;
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
  scoring: ScoringApiBreakdown | null;
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

type ScoringRules = {
  resultTiers?: Record<
    string,
    {
      name?: string;
      description?: string;
      basePoints?: number;
      bonusPoints?: number;
      totalPoints?: number;
    }
  >;
  bonuses?: Record<string, { name?: string; points?: number }>;
  confidenceMultipliers?: Record<string, { name?: string; multiplier?: number }>;
  boost?: { name?: string; description?: string; multiplier?: number };
  streak?: { name?: string; description?: string; bonusPerLevel?: number; formula?: string };
  formula?: { description?: string; profit?: string };
};

type ScoringApiBreakdown = {
  stake?: number | null;
  base_points?: number | null;
  bonuses?: {
    result_tier?: { type?: string | null; points?: number | null } | null;
    first_scorer?: {
      earned?: boolean | null;
      predicted?: { player_id?: number | null } | null;
      actual?: { player_id?: number | null; player_name?: string | null } | null;
      points?: number | null;
    } | null;
    total_goals?: {
      earned?: boolean | null;
      predicted?: number | null;
      actual?: number | null;
      points?: number | null;
    } | null;
    half_time?: {
      earned?: boolean | null;
      predicted_home?: number | null;
      predicted_away?: number | null;
      points?: number | null;
    } | null;
  } | null;
  subtotal_before_multipliers?: number | null;
  multipliers?: {
    confidence?: { level?: string | null; multiplier?: number | null } | null;
    boost?: { used?: boolean | null; multiplier?: number | null } | null;
    streak?: { streak_number?: number | null; bonus_per_level?: number | null; total?: number | null } | null;
  } | null;
  ranking_points?: number | null;
  profit?: number | null;
  total?: number | null;
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
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const effectiveIsLoggedIn = mounted ? isLoggedIn : false;

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [scoringRules, setScoringRules] = useState<ScoringRules | null>(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesRequestFailed, setRulesRequestFailed] = useState(false);

  const predictedMatchIds = useMemo(
    () => new Set(history.map((item) => item.matchId)),
    [history]
  );
  const groupedMatches = useMemo(
    () => groupPredictableMatchesByLeague(matches),
    [matches]
  );

  const stats = useMemo(() => {
    const total = history.length;
    const correct = history.filter((item) => item.result === "correct").length;
    const points = history.reduce((sum, item) => sum + item.points, 0);
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, points, accuracy };
  }, [history]);

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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-8 px-4 sm:px-0">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          neon="cyan"
          className="relative overflow-hidden border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-[#0c0d12] to-purple-500/10 p-6 md:p-8"
        >
          {/* Futuristic grid background decoration */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,26,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,26,0.5)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex max-w-2xl flex-col gap-5">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-cyan-400">
                <Sparkles size={11} className="animate-pulse" />
                {t("prediction.title")} HUB
              </div>
              <h1 className="font-display text-3xl font-black text-white md:text-5xl tracking-tight mt-3">
                {t("prediction.title")}
              </h1>
              <p className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-gray-400">
                ทายสกอร์การแข่งขันล่วงหน้าเพื่อรับแต้ม แข่งขันชิงความเป็นหนึ่งบนลีดเดอร์บอร์ด และปลดล็อกรางวัลสุดพิเศษ!
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button
                size="sm"
                neon
                onClick={() => {
                  setShowRulesModal(true);
                  if (!scoringRules && !loadingRules) {
                    void (async () => {
                      setLoadingRules(true);
                      setRulesRequestFailed(false);
                      try {
                        const resp = await apiGetRaw<{ data?: ScoringRules } & ScoringRules>(
                          "https://api.scorematrix.live/api/v1/scorm/scoring-rules",
                          { locale }
                        );
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
                className="cursor-pointer font-bold tracking-wide"
              >
                กติกาการให้คะแนน
              </Button>
            </div>
          </div>
        </Card>

        <Card className="grid gap-2 border-cyan-300/10 bg-[#090b10] p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:grid-cols-2 lg:grid-cols-1">
          {[
            {
              label: "การทายทั้งหมด",
              value: effectiveIsLoggedIn ? stats.total : 0,
              color: "text-cyan-400",
              indicatorBg: "bg-cyan-500",
              glowColor: "shadow-[0_0_8px_rgba(56,189,248,0.5)]",
              icon: Users,
            },
            {
              label: "ทายถูกต้อง",
              value: effectiveIsLoggedIn ? stats.correct : 0,
              color: "text-green-400",
              indicatorBg: "bg-green-500",
              glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              icon: CheckCheck,
            },
            {
              label: "ความแม่นยำ",
              value: effectiveIsLoggedIn ? `${stats.accuracy}%` : "0%",
              color: "text-amber-400",
              indicatorBg: "bg-amber-500",
              glowColor: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
              icon: ShieldCheck,
            },
            {
              label: "แต้มสะสมจากทายผล",
              value: effectiveIsLoggedIn ? stats.points.toLocaleString() : "0",
              color: "text-emerald-400",
              indicatorBg: "bg-emerald-500",
              glowColor: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
              icon: Trophy,
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className={cn(
                  "group relative flex min-h-[86px] items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0c111a] p-4 transition-colors hover:border-cyan-300/25",
                  index === 3 && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.03]", item.color)}>
                    <Icon size={19} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-black leading-6 text-white">
                      {item.label}
                    </p>
                    <span className={cn("mt-1 block h-1 w-10 rounded-full", item.indicatorBg, item.glowColor)} />
                  </div>
                </div>
                <p className={cn("shrink-0 font-mono text-3xl font-black leading-none", item.color)}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </Card>
      </section>

      <Card className="relative overflow-hidden border-cyan-300/15 bg-[#07080b] p-0 shadow-[0_18px_70px_rgba(0,0,0,0.32)]">
        {/* Esports accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500" />

        {/* Card Header containing Tabs */}
        <div className="mt-[2px] flex flex-col border-b border-cyan-300/10 bg-gradient-to-r from-[#0d111a] via-[#07080b] to-[#0d111a] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
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
                count: effectiveIsLoggedIn ? history.length : undefined,
              },
            ]}
            activeTab={tab}
            onChange={setTab}
            className="border-b-0 bg-transparent py-0 h-auto"
          />
          <div className="flex items-center gap-2 py-2 sm:py-0 self-end sm:self-auto">
            {tab === "upcoming" ? (
              <Badge variant="cyan" size="sm" className="font-bold tracking-wide">
                คู่แข่งทั้งหมด {matches.length} คู่
              </Badge>
            ) : (
              effectiveIsLoggedIn && (
                <Badge variant="green" size="sm" className="font-bold tracking-wide">
                  ทายแล้ว {history.length} คู่
                </Badge>
              )
            )}
          </div>
        </div>

        <div className="bg-[#050508] p-3 sm:p-4">
          {tab === "upcoming" ? (
            <div className="space-y-3">
              <p className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.03] px-4 py-3 text-sm font-semibold text-gray-300">
                {effectiveIsLoggedIn
                  ? t("prediction.filterHelpLoggedIn")
                  : t("prediction.filterHelpGuest")}
              </p>

              {loadingMatches ? (
                <div className="space-y-3 animate-pulse">
                  <div className="rounded-xl border border-gray-800 bg-[#0c0d12] divide-y divide-gray-800/50">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid min-h-12 grid-cols-[82px_minmax(160px,1fr)_64px_minmax(160px,1fr)_160px] items-center gap-3 px-5 py-2.5"
                      >
                        <Skeleton className="h-4 w-12 rounded" />
                        <div className="flex items-center gap-2 justify-end">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-12 mx-auto rounded" />
                        <div className="flex items-center gap-2 justify-start">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                        <Skeleton className="h-7 w-16 justify-self-end rounded" />
                      </div>
                    ))}
                  </div>
                </div>
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
                <div className="overflow-hidden rounded-2xl border border-cyan-300/15 bg-[#07080b] shadow-[0_14px_44px_rgba(0,0,0,0.24)]">
                  {/* Desktop Table Header */}
                  <div className="hidden md:grid grid-cols-[82px_minmax(160px,1fr)_64px_minmax(160px,1fr)_160px] items-center gap-3 border-b border-cyan-300/10 bg-[#0d111a] px-5 py-3 text-xs font-black uppercase tracking-wide text-gray-300">
                    <div className="pl-1">{t("football.table.time")}</div>
                    <div className="text-right pr-3">{t("football.table.home")}</div>
                    <div className="text-center">VS</div>
                    <div className="text-left pl-3">{t("football.table.away")}</div>
                    <div className="text-right pr-4">ทายผล</div>
                  </div>
                  <div>
                    {groupedMatches.map((group) => (
                      <div key={group.key}>
                        <div className="relative overflow-hidden border-b border-cyan-300/10 bg-gradient-to-r from-cyan-300/[0.14] via-[#0b1018] to-fuchsia-400/[0.08] px-4 py-3.5 sm:px-5">
                          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-cyan-300 via-fuchsia-400 to-amber-300" />
                          <div className="absolute right-0 top-0 h-full w-40 bg-[linear-gradient(135deg,transparent_0%,rgba(34,211,238,0.08)_42%,transparent_43%,transparent_58%,rgba(217,70,239,0.08)_59%,transparent_100%)]" />
                          <div className="relative flex min-w-0 items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="relative">
                                <span className="absolute -inset-1 rounded-xl border border-cyan-300/20 bg-cyan-300/[0.06] shadow-[0_0_22px_rgba(34,211,238,0.12)]" />
                                <span className="relative block">
                                  <ApiLeagueLogo
                                    name={group.league.name}
                                    logo={group.league.logo}
                                    size="sm"
                                  />
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-2">
                                  <Trophy
                                    size={14}
                                    className="shrink-0 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.35)]"
                                  />
                                  <p className="min-w-0 truncate text-base font-black uppercase tracking-widest text-white">
                                    {group.league.name}
                                  </p>
                                </div>
                                <div className="mt-1 h-0.5 w-20 rounded-full bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-transparent" />
                              </div>
                            </div>
                            <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-cyan-300/20 bg-black/25 px-2.5 font-mono text-xs font-black text-cyan-100 shadow-[inset_0_0_18px_rgba(34,211,238,0.08)]">
                              <span>{group.matches.length}</span>
                              <span className="font-sans text-[10px] uppercase tracking-wide text-cyan-200/75">
                                คู่
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-white/[0.06]">
                          {group.matches.map((match, index) => {
                            const hasPredicted = predictedMatchIds.has(match.id);
                            const predictMatchHref = buildPredictMatchHref(
                              locale,
                              match.id,
                              match.home.id ?? "",
                              match.away.id ?? ""
                            );

                            return (
                              <PredictMatchRow
                                key={match.id}
                                match={match}
                                index={index}
                                locale={locale}
                                t={t}
                                isLoggedIn={effectiveIsLoggedIn}
                                hasPredicted={hasPredicted}
                                predictMatchHref={predictMatchHref}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {!effectiveIsLoggedIn ? (
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
                <div className="space-y-3 animate-pulse">
                  <div className="rounded-xl border border-gray-800 bg-[#0c0d12] divide-y divide-gray-800/50">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="grid min-h-12 grid-cols-[130px_140px_1fr_120px_1fr_120px] items-center gap-2 px-5 py-2.5"
                      >
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-4.5 w-24 rounded" />
                        <div className="flex items-center gap-2 justify-end">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-7 w-12 mx-auto rounded" />
                        <div className="flex items-center gap-2 justify-start">
                          <Skeleton className="h-6 w-6 rounded-full" />
                          <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                        <Skeleton className="h-7 w-12 justify-self-end rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : history.length === 0 ? (
                <EmptyState
                  title={t("prediction.noPredictions")}
                  description={t("prediction.startPredictingHistory")}
                />
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-800/70 bg-[#07080b]">
                  {/* Desktop Table Header */}
                  <div className="hidden md:grid grid-cols-[130px_140px_1fr_120px_1fr_120px] items-center gap-2 px-5 py-2.5 bg-[#0d0e14] border-b border-gray-800/80 text-[10px] uppercase font-extrabold tracking-widest text-gray-500">
                    <div className="pl-1">เวลาส่งทาย / สถานะ</div>
                    <div>แมตช์ที่ทาย</div>
                    <div className="text-right pr-5">{t("football.table.home")}</div>
                    <div className="text-center">ทาย / ผลจริง</div>
                    <div className="text-left pl-5">{t("football.table.away")}</div>
                    <div className="text-right pr-4">แต้มที่ได้รับ</div>
                  </div>
                  <div className="divide-y divide-gray-800/30">
                    {history.map((item, index) => (
                      <HistoryMatchRow
                        key={item.id}
                        item={item}
                        index={index}
                        locale={locale}
                        t={t}
                        onClick={() => handleSelectPrediction(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

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
                {selectedPrediction.result === "void" && (
                  <div className="flex items-start gap-3 rounded-2xl border border-gray-700/60 bg-gray-900/60 px-4 py-3">
                    <span className="mt-0.5 shrink-0 text-base">⚠️</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-300">การแข่งขันนี้ถูกโมฆะ</p>
                      <p className="mt-0.5 text-xs text-gray-500">แมตช์นี้ถูกเลื่อนหรือยกเลิก — คะแนนที่ได้รับเท่ากับ 0</p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-[1.25fr_0.95fr]">
                  <div className="rounded-2xl border border-gray-800/80 bg-black/40 p-4">
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <HistoryTeam
                        name={selectedPrediction.home}
                        logo={selectedPrediction.homeLogo}
                        accent="cyan"
                      />

                      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/6 px-4 py-3 text-center font-mono">
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
                        toneClassName="border-cyan-500/15 bg-cyan-500/5"
                      />
                      <HistoryOutcomeCard
                        label={t("prediction.actualResult")}
                        value={selectedPrediction.actual}
                        valueClassName="text-white"
                        toneClassName="border-emerald-500/15 bg-emerald-500/5"
                      />
                    </div>
                  </div>

                  <div className={cn(
                    "rounded-2xl border p-4",
                    selectedPrediction.result === "void"
                      ? "border-gray-700/40 bg-gray-900/30"
                      : "border-emerald-500/20 bg-emerald-500/5"
                  )}>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                      <HistorySummaryStat
                        label={t("prediction.pointsEarned")}
                        value={`+${selectedPrediction.points} PTS`}
                        valueClassName={selectedPrediction.result === "void" ? "text-gray-400" : "text-emerald-300"}
                      />
                      <HistorySummaryStat
                        label="Result"
                        value={t(`prediction.${selectedPrediction.result}`)}
                        valueClassName={historyTierTextClass(selectedPrediction.result)}
                      />
                      {selectedPrediction.resultType && selectedPrediction.result !== "void" && (
                        <HistorySummaryStat
                          label="Result Type"
                          value={formatResultType(selectedPrediction.resultType)}
                          valueClassName="text-amber-300"
                        />
                      )}
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

                {selectedPrediction.scoring ? (
                  <ScoringBreakdownSection
                    scoring={selectedPrediction.scoring}
                    firstScorerPlayerName={
                      loadingPlayer
                        ? "Loading..."
                        : selectedPrediction.firstScorerPlayerName || playerName || null
                    }
                  />
                ) : (
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
                          valueClassName="text-cyan-300"
                          className="sm:col-span-2"
                        />
                      </div>
                    </HistoryModalSection>
                  </div>
                )}

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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleClosePrediction}
                  >
                    Close
                  </Button>
                  <Link
                    href={`/${locale}/matches/detail/${selectedPrediction.matchId}`}
                    onClick={handleClosePrediction}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition-colors hover:border-cyan-400/60 hover:bg-cyan-500/20"
                  >
                    ดูรายละเอียด
                    <ExternalLink size={13} />
                  </Link>
                </div>
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
                    ([key, tier]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{tier.name}</div>
                            <div className="mt-1 text-xs text-gray-400 wrap-break-word whitespace-normal">{tier.description}</div>
                          </div>
                          <div className="text-right text-sm font-mono text-white min-w-22">
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
                  {Object.entries(scoringRules.bonuses || {}).map(([key, bonus]) => (
                    <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white truncate">{bonus.name}</div>
                        </div>
                        <div className="text-sm font-mono text-white min-w-16">{bonus.points} pts</div>
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
                    ([key, c]) => (
                      <div key={key} className="rounded-lg border border-gray-800/60 bg-black/30 p-3">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{c.name}</div>
                          </div>
                          <div className="text-sm font-mono text-white min-w-12">x{c.multiplier}</div>
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
        resultType: toSegment(item.resultType ?? item.result_type) ?? null,
        scoring: (isRecord(item.scoringBreakdown) ? item.scoringBreakdown :
          isRecord(item.scoring) ? item.scoring :
          isRecord(item.score_breakdown) ? item.score_breakdown :
          isRecord(item.breakdown) ? item.breakdown :
          null) as ScoringApiBreakdown | null,
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

function groupPredictableMatchesByLeague(matches: PredictableMatch[]) {
  const groups = new Map<
    string,
    {
      key: string;
      league: PredictableMatch["league"];
      matches: PredictableMatch[];
    }
  >();

  for (const match of matches) {
    const key = match.leagueKey || match.league.name;
    const current =
      groups.get(key) ??
      {
        key,
        league: match.league,
        matches: [],
      };

    current.matches.push(match);
    groups.set(key, current);
  }

  return Array.from(groups.values());
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
  if (normalized === "void") return "void";
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
    case "void":
      return "default";
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
    case "void":
      return "text-gray-400";
    default:
      return "text-rose-300";
  }
}

function formatResultType(value: string | null) {
  switch (value) {
    case "exact":    return "Exact Score";
    case "goalDiff":
    case "goal_diff": return "Goal Difference";
    case "result":   return "Correct Result";
    case "wrong":    return "Wrong";
    default:         return value ?? "-";
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

const PredictMatchRow = memo(function PredictMatchRow({
  match,
  index,
  locale,
  t,
  isLoggedIn,
  hasPredicted,
  predictMatchHref,
}: {
  match: PredictableMatch;
  index: number;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  isLoggedIn: boolean;
  hasPredicted: boolean;
  predictMatchHref: string;
}) {
  const router = useRouter();
  const matchTime = formatTime(match.kickoffTime, locale);
  const statusGroup = match.status;
  const statusLabel = match.statusLabel;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => router.push(predictMatchHref)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          router.push(predictMatchHref);
        }
      }}
      className="group relative cursor-pointer transition-all duration-200 outline-none"
    >
      {/* Desktop Grid Row */}
      <div
        className={cn(
          "hidden min-h-[62px] grid-cols-[82px_minmax(160px,1fr)_64px_minmax(160px,1fr)_160px] items-center gap-3 border-l-2 px-5 py-2 transition-all duration-200 md:grid",
          hasPredicted
            ? "border-l-emerald-400 bg-gradient-to-r from-emerald-400/[0.08] via-[#0b1118] to-[#090b10]"
            : "border-l-cyan-400/30 group-hover:border-l-cyan-300",
          index % 2 === 0 ? "bg-[#0b0f16]" : "bg-[#080b10]",
          "hover:bg-[#101827] group-focus-visible:bg-[#101827]"
        )}
      >
        {/* Column 1: Time / Status */}
        <div className="flex flex-col items-start justify-center gap-1 pl-1">
          <span className="whitespace-nowrap text-xs font-black leading-none tracking-wide text-cyan-200">
            {matchTime}
          </span>
          <div>
            <span className={cn(
              "rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-gray-300",
              statusGroup === MatchStatus.LIVE && "bg-green-500/10 text-green-400 border-green-500/20",
              statusGroup === MatchStatus.POSTPONED && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              statusGroup === MatchStatus.CANCELLED && "bg-red-500/10 text-red-400 border-red-500/20"
            )}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Column 2: Home Team */}
        <div className="flex min-w-0 items-center justify-end gap-2 pr-2 text-right">
          <span className="truncate text-sm font-extrabold tracking-wide text-gray-300 transition-colors group-hover:text-cyan-300">
            {match.home.name}
          </span>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.home.name}
              logo={match.home.logo}
              size="xs"
              accent="cyan"
            />
          </div>
        </div>

        {/* Column 3: VS Pill */}
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="flex min-w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/[0.07] px-2.5 py-1 text-[11px] font-black tracking-wider text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.08)]">
            <span className="px-1 text-[11px] font-black uppercase text-cyan-200">
              VS
            </span>
          </div>
        </div>

        {/* Column 4: Away Team */}
        <div className="flex min-w-0 items-center justify-start gap-2 pl-2 text-left">
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={match.away.name}
              logo={match.away.logo}
              size="xs"
              accent="magenta"
            />
          </div>
          <span className="truncate text-sm font-extrabold tracking-wide text-gray-300 transition-colors group-hover:text-magenta-300">
            {match.away.name}
          </span>
        </div>

        {/* Column 5: Actions */}
        <div className="flex items-center justify-end gap-2 pr-1">
          {isLoggedIn ? (
            hasPredicted ? (
              <span className="inline-flex h-8 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 text-[10px] font-black uppercase tracking-wide text-emerald-300">
                <CheckCheck size={13} className="mr-1.5" />
                {t("prediction.alreadyPredicted")}
              </span>
            ) : (
              <Link
                href={predictMatchHref}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-8 items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-3 text-[10px] font-black uppercase tracking-wide text-black shadow-md shadow-amber-500/15 transition-all duration-200 hover:scale-[1.02] hover:from-amber-300 hover:to-yellow-200"
              >
                {t("prediction.predictScore")}
              </Link>
            )
          ) : (
            <Badge
              variant="default"
              className="whitespace-nowrap border-cyan-300/20 bg-cyan-300/[0.04] px-2.5 py-1 text-[11px] font-bold text-gray-300"
            >
              {t("prediction.signInToPredict")}
            </Badge>
          )}
          <ChevronRight
            size={18}
            className="text-gray-600 transition-all duration-200 group-hover:translate-x-1 group-hover:text-cyan-300"
          />
        </div>
      </div>

      {/* Mobile Row Layout */}
      <div
        className={cn(
          "border-b border-gray-900/60 border-l-4 px-3.5 py-4 transition-all duration-200 md:hidden",
          hasPredicted
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.03] to-transparent"
            : "border-l-cyan-500/20",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]"
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="whitespace-nowrap text-base font-black leading-none text-cyan-200">
              {matchTime}
            </div>
          </div>
          <span className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-gray-300">
            {statusLabel}
          </span>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-2.5">
          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
              <ApiTeamLogo
                name={match.home.name}
                logo={match.home.logo}
                size="sm"
                accent="cyan"
              />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-300">
              {match.home.name}
            </span>
          </div>

          <div className="flex justify-center">
            <div className="grid h-10 w-12 place-items-center rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-xs font-black text-cyan-300">
              VS
            </div>
          </div>

          <div className="min-w-0">
            <div className="mb-1.5 flex justify-center">
              <ApiTeamLogo
                name={match.away.name}
                logo={match.away.logo}
                size="sm"
                accent="magenta"
              />
            </div>
            <span className="block truncate text-center text-sm font-black leading-tight text-gray-300">
              {match.away.name}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <span className="truncate text-xs font-semibold text-gray-500">
            {match.season ? t("prediction.seasonLabel", { season: match.season }) : t("prediction.kickoffLabel")}
          </span>
          <div className="shrink-0">
            {isLoggedIn ? (
              hasPredicted ? (
                <span className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-black text-emerald-400">
                  <CheckCheck size={13} className="mr-1" />
                  {t("prediction.alreadyPredicted")}
                </span>
              ) : (
                <Link
                  href={predictMatchHref}
                  onClick={(event) => event.stopPropagation()}
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 px-3 text-xs font-black uppercase tracking-wide text-black transition-colors"
                >
                  {t("prediction.predictScore")}
                </Link>
              )
            ) : (
              <Link
                href={`/${locale}/auth/login?next=${encodeURIComponent(predictMatchHref)}`}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-cyan-300/15 bg-cyan-300/[0.05] px-3 text-xs font-black text-gray-300"
              >
                {t("prediction.signIn")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
});

const HistoryMatchRow = memo(function HistoryMatchRow({
  item,
  index,
  locale,
  t,
  onClick,
}: {
  item: PredictionHistoryItem;
  index: number;
  locale: string;
  t: ReturnType<typeof useTranslations>;
  onClick: () => void;
}) {
  const statusLabel = t(`prediction.${item.result}`);
  const resultClass = historyTierTextClass(item.result);
  const matchTime = formatHistoryTimestamp(item.createdAt, locale);

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className="group relative cursor-pointer transition-all duration-200 outline-none"
    >
      {/* Desktop Grid Row */}
      <div
        className={cn(
          "hidden md:grid grid-cols-[130px_140px_1fr_120px_1fr_120px] items-center gap-2 px-5 py-2.5 transition-all duration-200 border-l-2",
          item.result === "correct"
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-transparent"
            : item.result === "incorrect"
            ? "border-l-rose-500/30 group-hover:border-l-rose-500"
            : "border-l-cyan-500/20 group-hover:border-l-cyan-400",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]",
          "hover:bg-[#121622] group-focus-visible:bg-[#121622]"
        )}
      >
        {/* Column 1: Time / Status */}
        <div className="flex flex-col justify-center items-start pl-1">
          <span className="font-mono text-[10px] text-gray-400">
            {matchTime}
          </span>
          <div className="mt-0.5">
            <span className={cn(
              "text-[8px] font-bold uppercase tracking-widest px-1 py-0.2 rounded border",
              item.result === "correct" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
              item.result === "incorrect" && "bg-rose-500/10 text-rose-400 border-rose-500/20",
              item.result === "pending" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
              item.result === "partial" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
              item.result === "void" && "bg-gray-500/10 text-gray-400 border-gray-500/20"
            )}>
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Column 2: Tournament (League) */}
        <div className="flex flex-col justify-center min-w-0 pr-2">
          <span className="truncate text-[11px] font-extrabold text-gray-300 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">
            {item.home} vs {item.away}
          </span>
          <span className="truncate text-[9px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wide">
            {t("prediction.yourPrediction")}
          </span>
        </div>

        {/* Column 3: Home Team */}
        <div className="flex items-center justify-end gap-2 text-right min-w-0 pr-1">
          <span className="truncate text-xs font-extrabold text-gray-200 group-hover:text-cyan-200 transition-colors tracking-wide">
            {item.home}
          </span>
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={item.home}
              logo={item.homeLogo}
              size="xs"
              accent="cyan"
            />
          </div>
        </div>

        {/* Column 4: Prediction & Actual Scores */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold">
            <span className="text-cyan-300 font-extrabold">{item.predicted}</span>
            <span className="text-gray-650">/</span>
            <span className="text-white">{item.actual}</span>
          </div>
          <span className="text-[8px] text-gray-500 font-semibold uppercase mt-0.5 tracking-wider">
            {t("prediction.predicted")} / {t("prediction.actualResult")}
          </span>
        </div>

        {/* Column 5: Away Team */}
        <div className="flex items-center justify-start gap-2 text-left min-w-0 pl-1">
          <div className="shrink-0 transition-transform duration-300 group-hover:scale-105">
            <ApiTeamLogo
              name={item.away}
              logo={item.awayLogo}
              size="xs"
              accent="magenta"
            />
          </div>
          <span className="truncate text-xs font-extrabold text-gray-200 group-hover:text-magenta-200 transition-colors tracking-wide">
            {item.away}
          </span>
        </div>

        {/* Column 6: Reward / Detail */}
        <div className="flex items-center justify-end gap-2 pr-1">
          <div className="text-right">
            <span className={cn("font-mono text-xs font-bold", item.points > 0 ? "text-green-400" : "text-gray-500")}>
              {item.points > 0 ? `+${item.points}` : "0"} PTS
            </span>
          </div>
          <ChevronRight
            size={15}
            className="text-gray-650 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all duration-200"
          />
        </div>
      </div>

      {/* Mobile Row Layout */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 md:hidden px-3.5 py-2.5 transition-all duration-200 border-l-2 border-b border-gray-900/60",
          item.result === "correct"
            ? "border-l-emerald-500 bg-gradient-to-r from-emerald-500/[0.03] to-transparent"
            : item.result === "incorrect"
            ? "border-l-rose-500/30"
            : "border-l-cyan-500/20",
          index % 2 === 0 ? "bg-[#0c0d12]" : "bg-[#090a0e]"
        )}
      >
        {/* Left column */}
        <div className="flex flex-col justify-center gap-0.5 min-w-[50px] shrink-0">
          <span className="font-mono text-[10px] text-gray-400">
            {matchTime}
          </span>
          <span className={cn("text-[8px] font-bold uppercase", resultClass)}>
            {statusLabel}
          </span>
        </div>

        {/* Center column */}
        <div className="flex items-center justify-center gap-2 flex-1 min-w-0 px-1">
          <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0 text-right">
            <span className="text-xs font-bold text-gray-200 truncate">
              {item.home}
            </span>
            <div className="shrink-0">
              <ApiTeamLogo
                name={item.home}
                logo={item.homeLogo}
                size="xs"
                accent="cyan"
              />
            </div>
          </div>

          <div className="shrink-0 text-center flex flex-col items-center">
            <span className="font-mono text-[10px] font-bold text-cyan-300">{item.predicted}</span>
            <span className="font-mono text-[9px] text-gray-500">({item.actual})</span>
          </div>

          <div className="flex items-center justify-start gap-1.5 flex-1 min-w-0 text-left">
            <div className="shrink-0">
              <ApiTeamLogo
                name={item.away}
                logo={item.awayLogo}
                size="xs"
                accent="magenta"
              />
            </div>
            <span className="text-xs font-bold text-gray-300 truncate">
              {item.away}
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex items-center justify-end gap-1 shrink-0 pl-1">
          <span className={cn("font-mono text-[10px] font-bold", item.points > 0 ? "text-green-400" : "text-gray-500")}>
            +{item.points}
          </span>
          <ChevronRight size={14} className="text-gray-500" />
        </div>
      </div>
    </article>
  );
});

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
  className,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-800/80 bg-black/25 px-3 py-2.5", className)}>
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

// ----------------------------------------------------
// Scoring Breakdown Section (prediction history modal)
// ----------------------------------------------------
function ScoringBreakdownSection({
  scoring,
  firstScorerPlayerName,
}: {
  scoring: ScoringApiBreakdown;
  firstScorerPlayerName: string | null;
}) {
  const stake = scoring.stake ?? 0;
  const basePoints = scoring.base_points ?? 0;
  const subtotal = scoring.subtotal_before_multipliers ?? 0;
  const rankingPoints = scoring.ranking_points ?? 0;
  const profit = scoring.profit ?? 0;
  const total = scoring.total ?? 0;

  const bonuses = scoring.bonuses ?? {};
  const multipliers = scoring.multipliers ?? {};

  const confidenceLevel = multipliers.confidence?.level ?? "-";
  const confidenceMultiplier = multipliers.confidence?.multiplier ?? 1;
  const boostUsed = multipliers.boost?.used ?? false;
  const boostMultiplier = multipliers.boost?.multiplier ?? 1;
  const streakNumber = multipliers.streak?.streak_number ?? 0;
  const streakBonusPerLevel = multipliers.streak?.bonus_per_level ?? 2;
  const streakTotal = multipliers.streak?.total ?? 0;

  const tierMeta = (type: string | null | undefined): { label: string; sublabel: string; tone: "gold" | "green" | "cyan" | "red" } => {
    switch (type) {
      case "exact":
        return { label: "ถูกสกอร์เป๊ะ!", sublabel: "Exact Score", tone: "gold" };
      case "goal_diff":
      case "goalDiff":
        return { label: "ผลต่างประตูถูก", sublabel: "Goal Difference", tone: "green" };
      case "result":
        return { label: "ผลแพ้ชนะถูก", sublabel: "Correct Result", tone: "cyan" };
      default:
        return { label: "ผิดทั้งหมด", sublabel: "Wrong", tone: "red" };
    }
  };

  const tier = tierMeta(bonuses.result_tier?.type);
  const tierEarned = bonuses.result_tier?.type !== "wrong" && bonuses.result_tier?.type != null;

  return (
    <div className="rounded-2xl border border-gray-800/80 bg-black/30 p-4 space-y-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Score Breakdown</p>

      {/* Result Tier — prominent hero row */}
      {bonuses.result_tier && (
        <div className={cn(
          "rounded-xl border px-4 py-3 flex items-center justify-between gap-3",
          tier.tone === "gold"  && "border-amber-400/30 bg-amber-400/8",
          tier.tone === "green" && "border-emerald-400/30 bg-emerald-400/8",
          tier.tone === "cyan"  && "border-cyan-400/30 bg-cyan-400/8",
          tier.tone === "red"   && "border-gray-700/60 bg-black/20",
        )}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black",
              tier.tone === "gold"  && "bg-amber-400 text-black",
              tier.tone === "green" && "bg-emerald-400 text-black",
              tier.tone === "cyan"  && "bg-cyan-400 text-black",
              tier.tone === "red"   && "bg-gray-700 text-gray-400",
            )}>
              {tierEarned ? "✓" : "✗"}
            </span>
            <div className="min-w-0">
              <p className={cn(
                "text-sm font-black",
                tier.tone === "gold"  && "text-amber-300",
                tier.tone === "green" && "text-emerald-300",
                tier.tone === "cyan"  && "text-cyan-300",
                tier.tone === "red"   && "text-gray-400",
              )}>
                {tier.label}
              </p>
              <p className="text-[10px] text-gray-500">{tier.sublabel}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className={cn(
              "font-mono text-lg font-black",
              tier.tone === "gold"  && "text-amber-300",
              tier.tone === "green" && "text-emerald-300",
              tier.tone === "cyan"  && "text-cyan-300",
              tier.tone === "red"   && "text-gray-500",
            )}>
              +{bonuses.result_tier.points ?? 0}
            </p>
            <p className="text-[9px] text-gray-500">bonus pts</p>
          </div>
        </div>
      )}

      {/* Stake & Base Points */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-amber-400/70">Stake</p>
          <p className="font-mono text-xl font-black text-amber-300">{stake}</p>
          <p className="text-[9px] text-gray-500">pts wagered</p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wider text-cyan-400/70">Base Points</p>
          <p className="font-mono text-xl font-black text-cyan-300">+{basePoints}</p>
          <p className="text-[9px] text-gray-500">result score</p>
        </div>
      </div>

      {/* Other Bonuses */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 mb-2">Extra Bonuses</p>
        <div className="space-y-1.5">
          {bonuses.first_scorer && (
            <BonusRow
              label="First Scorer"
              earned={bonuses.first_scorer.earned ?? false}
              detail={
                bonuses.first_scorer.actual?.player_name
                  ? `actual: ${bonuses.first_scorer.actual.player_name}`
                  : bonuses.first_scorer.actual?.player_id
                    ? `actual id: #${bonuses.first_scorer.actual.player_id}`
                    : firstScorerPlayerName
                      ? `pred: ${firstScorerPlayerName}`
                      : bonuses.first_scorer.predicted?.player_id
                        ? `pred id: #${bonuses.first_scorer.predicted.player_id}`
                        : "—"
              }
              points={bonuses.first_scorer.points ?? 0}
            />
          )}
          {bonuses.total_goals && (
            <BonusRow
              label="Total Goals"
              earned={bonuses.total_goals.earned ?? false}
              detail={`pred ${bonuses.total_goals.predicted ?? "-"} → actual ${bonuses.total_goals.actual ?? "-"}`}
              points={bonuses.total_goals.points ?? 0}
            />
          )}
          {bonuses.half_time && (
            <BonusRow
              label="Half Time"
              earned={bonuses.half_time.earned ?? false}
              detail={`pred ${bonuses.half_time.predicted_home ?? "-"}-${bonuses.half_time.predicted_away ?? "-"}`}
              points={bonuses.half_time.points ?? 0}
            />
          )}
        </div>
      </div>

      {/* Subtotal */}
      <div className="flex items-center justify-between rounded-xl border border-gray-700/40 bg-black/25 px-3 py-2">
        <span className="text-[11px] text-gray-400">Subtotal (ก่อนคูณ)</span>
        <span className="font-mono text-sm font-black text-white">{subtotal} pts</span>
      </div>

      {/* Multipliers */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-500 mb-2">Multipliers</p>
        <div className="space-y-1.5">
          <MultiplierRow
            label={`Confidence: ${confidenceLevel}`}
            value={`×${confidenceMultiplier.toFixed(1)}`}
            tone="text-violet-300"
          />
          <MultiplierRow
            label={`Boost: ${boostUsed ? "ON" : "off"}`}
            value={`×${boostMultiplier.toFixed(1)}`}
            tone={boostUsed ? "text-fuchsia-300" : "text-gray-400"}
          />
          <MultiplierRow
            label={`Streak #${streakNumber} (×${streakBonusPerLevel}/level)`}
            value={`+${streakTotal}`}
            tone="text-emerald-300"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-1.5 border-t border-gray-800/60 pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Ranking Points</span>
          <span className="font-mono font-bold text-white">{rankingPoints}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Profit</span>
          <span className={cn("font-mono font-bold", profit >= 0 ? "text-emerald-300" : "text-rose-300")}>
            {profit >= 0 ? "+" : ""}{profit}
          </span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-3 py-2.5 mt-1">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-300">TOTAL</span>
          <span className="font-mono text-xl font-black text-emerald-300">{total} PTS</span>
        </div>
      </div>
    </div>
  );
}

function BonusRow({
  label,
  earned,
  detail,
  points,
}: {
  label: string;
  earned: boolean;
  detail: string;
  points: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
        earned ? "border-emerald-500/25 bg-emerald-500/4" : "border-gray-800/60 bg-black/20"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black",
            earned ? "bg-emerald-500 text-black" : "bg-gray-700 text-gray-400"
          )}
        >
          {earned ? "✓" : "✗"}
        </span>
        <div className="min-w-0">
          <p className={cn("text-[11px] font-bold", earned ? "text-white" : "text-gray-400")}>
            {label}
          </p>
          <p className="text-[10px] text-gray-500 truncate">{detail}</p>
        </div>
      </div>
      <span
        className={cn(
          "font-mono text-sm font-black shrink-0",
          earned ? "text-emerald-300" : "text-gray-500"
        )}
      >
        +{points}
      </span>
    </div>
  );
}

function MultiplierRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-800/60 bg-black/20 px-3 py-2">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className={cn("font-mono text-sm font-black text-white", tone)}>{value}</span>
    </div>
  );
}
