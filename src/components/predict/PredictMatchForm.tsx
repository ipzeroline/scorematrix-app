"use client";

import { memo, useCallback, useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Brain,
  CalendarClock,
  CheckCircle2,
  Medal,
  Sparkles,
  Timer,
  Search,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { ApiTeamLogo } from "@/components/shared/ApiTeamLogo";
import { ApiLeagueLogo } from "@/components/shared/ApiLeagueLogo";
import { useNotificationStore } from "@/stores/notification-store";
import { cn, formatDate, formatDateTime, formatMatchTimeWithZone } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { apiPostRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { dispatchMemberWalletRefresh } from "@/lib/member-refresh-event";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { useUserStore } from "@/stores/user-store";
import type { ScoringRules } from "@/types/scoring-rules";

type ConfidenceLevel = "safe" | "confident" | "bold";

const DEFAULT_SCORING_RULES: Required<
  Pick<ScoringRules, "resultTiers" | "bonuses" | "confidenceMultipliers" | "boost" | "streak" | "formula">
> = {
  resultTiers: {
    exact: {
      name: "exact",
      description: "Exact final score",
      basePoints: 10,
      bonusPoints: 20,
      totalPoints: 30,
    },
    goalDiff: {
      name: "goalDiff",
      description: "Correct side and goal difference",
      basePoints: 10,
      bonusPoints: 10,
      totalPoints: 20,
    },
    result: {
      name: "result",
      description: "Correct side",
      basePoints: 10,
      bonusPoints: 0,
      totalPoints: 10,
    },
  },
  bonuses: {
    firstScorer: { name: "First goalscorer", points: 15 },
    totalGoals: { name: "Total goals", points: 10 },
    halfTimeScore: { name: "Half-time score", points: 10 },
  },
  confidenceMultipliers: {
    safe: { name: "Safe", multiplier: 1 },
    confident: { name: "Confident", multiplier: 1.5 },
    bold: { name: "Bold", multiplier: 2 },
  },
  boost: { name: "Boost", description: "Boost multiplier", multiplier: 2 },
  streak: { name: "Streak Bonus", description: "Streak bonus", bonusPerLevel: 2, formula: "streak_number x 2" },
  formula: {
    description: "points_earned = stake + profit",
    profit: "profit = round((base_points + total_bonus) x confidence x boost) + streak_bonus",
  },
};

export interface PredictPlayer {
  id: number | null;
  name: string;
  number: number | null;
}

export interface PredictH2HFixture {
  id: string;
  kickoffTime: string;
  league: {
    name: string;
  };
  home: {
    name: string;
    logo: string | null;
  };
  away: {
    name: string;
    logo: string | null;
  };
  score: {
    home: number | null;
    away: number | null;
  };
}

export interface PredictMatch {
  matchId: string;
  home: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  away: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  league: string;
  leagueLogo: string | null;
  round: string;
  time: string;
  kickoffTime: string;
  venue: string;
  h2h?: PredictH2HFixture[];
  hasAiInsight?: boolean;
}

export function PredictMatchForm({
  locale,
  match,
  scoringRules,
}: {
  locale: string;
  match: PredictMatch;
  scoringRules?: ScoringRules | null;
}) {
  const t = useTranslations("predictionForm");
  const router = useRouter();
  const addToast = useNotificationStore((s) => s.addToast);

  // Back navigation: return to the page the user came from, or fall back to the
  // match detail page (livescore) for this provider id when there's no history.
  const providerId = String(extractApiFixtureId(String(match.matchId)) ?? match.matchId).trim();
  const matchDetailHref = `/${locale}/livescore/match/${providerId}`;
  const matchPageHref = `/${locale}/matches/detail/${providerId}`;
  const aiInsightHref = `/${locale}/ai-insight/${providerId}`;
  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(matchDetailHref);
    }
  };

  const freePoints = useUserStore((s) => s.freePoints);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Core prediction states
  const [homeScore, setHomeScore] = useState<number | null>(0);
  const [awayScore, setAwayScore] = useState<number | null>(0);
  const [firstScorerPlayerId, setFirstScorerPlayerId] = useState<string | null>(null);
  const [halfHomeScore, setHalfHomeScore] = useState<number | null>(null);
  const [halfAwayScore, setHalfAwayScore] = useState<number | null>(null);
  const [pointsWagered, setPointsWagered] = useState(10);
  const [confidence, setConfidence] = useState<ConfidenceLevel>("safe");
  const [useBoost, setUseBoost] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmTab, setConfirmTab] = useState("summary");
  const [submitted, setSubmitted] = useState(false);

  // Dynamic squad player states
  const [homePlayers, setHomePlayers] = useState<PredictPlayer[]>(match.home.players);
  const [awayPlayers, setAwayPlayers] = useState<PredictPlayer[]>(match.away.players);
  const [loadingHome, setLoadingHome] = useState(false);
  const [loadingAway, setLoadingAway] = useState(false);

  const fetchSquadPlayers = useCallback(async (teamId: string | number) => {
    try {
      const numericId = typeof teamId === "string" ? parseInt(teamId.replace(/\D/g, ""), 10) : teamId;
      if (!numericId || isNaN(numericId)) return null;

      const res = await fetch(`/api/football/teams/${numericId}/squad`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch squad");
      const json = await res.json();
      
      let playersFlat: unknown[] = [];
      if (json && Array.isArray(json)) {
        playersFlat = json;
      } else if (json && Array.isArray(json.players)) {
        playersFlat = json.players;
      } else if (json && json.data && Array.isArray(json.data.players)) {
        playersFlat = json.data.players;
      } else if (json && json.data && Array.isArray(json.data)) {
        playersFlat = json.data;
      }

      if (playersFlat.length > 0) {
        return playersFlat.map((entry) => {
          const player = isRecord(entry) ? entry : {};
          const item = isRecord(player.player) ? player.player : player;
          return {
            id: toNullableNumber(item.id ?? item.apiPlayerId),
            name: typeof item.name === "string" ? item.name : "",
            number: toNullableNumber(item.number ?? player.number),
          };
        }).filter((player) => player.name);
      }
      return null;
    } catch (error) {
      console.error("Error loading squad players:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadSquads = async () => {
      const homeId = match.home.id;
      const awayId = match.away.id;

      if (homeId) {
        setLoadingHome(true);
        fetchSquadPlayers(homeId).then((playersList) => {
          if (playersList && playersList.length > 0) {
            setHomePlayers(playersList);
          }
          setLoadingHome(false);
        });
      }

      if (awayId) {
        setLoadingAway(true);
        fetchSquadPlayers(awayId).then((playersList) => {
          if (playersList && playersList.length > 0) {
            setAwayPlayers(playersList);
          }
          setLoadingAway(false);
        });
      }
    };

    loadSquads();
  }, [fetchSquadPlayers, match.home.id, match.away.id]);

  // UX display state: Summary Tab (Ticket vs JSON payload)


  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const kickoff = new Date(match.kickoffTime).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((kickoff - now) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [match.kickoffTime]);

  const totalGoals =
    homeScore !== null && awayScore !== null
      ? homeScore + awayScore
      : homeScore ?? awayScore;

  const getCountdownInfo = () => {
    if (timeLeft === null) {
      return {
        compact: "--",
        isLocked: false,
        parts: [
          { label: "h", value: "--" },
          { label: "m", value: "--" },
          { label: "s", value: "--" },
        ],
      };
    }

    if (timeLeft <= 0) {
      return {
        compact: "LOCKED",
        isLocked: true,
        parts: [
          { label: "h", value: "00" },
          { label: "m", value: "00" },
          { label: "s", value: "00" },
        ],
      };
    }

    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;

    return {
      compact: `${hours}h ${minutes}m`,
      isLocked: false,
      parts: [
        { label: "h", value: String(hours).padStart(2, "0") },
        { label: "m", value: String(minutes).padStart(2, "0") },
        { label: "s", value: String(seconds).padStart(2, "0") },
      ],
    };
  };

  const countdownInfo = getCountdownInfo();
  const isLocked = countdownInfo.isLocked;

  const canSubmit =
    !isLocked && homeScore !== null && awayScore !== null && pointsWagered > 0;
  
  const confidenceOptions = [
    { value: "safe", label: t("confidence.safe") },
    { value: "confident", label: t("confidence.confident") },
    { value: "bold", label: t("confidence.bold") },
  ];
  const activeScoringRules = mergeScoringRules(scoringRules);
  const exactTier = activeScoringRules.resultTiers.exact;
  const goalDiffTier = activeScoringRules.resultTiers.goalDiff;
  const resultTier = activeScoringRules.resultTiers.result;
  const firstScorerBonus = activeScoringRules.bonuses.firstScorer?.points ?? 0;
  const totalGoalsBonus = activeScoringRules.bonuses.totalGoals?.points ?? 0;
  const halfTimeScoreBonus = activeScoringRules.bonuses.halfTimeScore?.points ?? 0;
  const basePoints = exactTier.basePoints ?? goalDiffTier.basePoints ?? resultTier.basePoints ?? 0;
  const confidenceMultiplier = getConfidenceMultiplier(confidence, activeScoringRules);
  const boostMultiplier = useBoost ? activeScoringRules.boost.multiplier ?? 1 : 1;
  const streakPreview = 3;
  const streakPointsPreview = streakPreview * (activeScoringRules.streak.bonusPerLevel ?? 0);
  const effectivePointsWagered = Math.round(pointsWagered * confidenceMultiplier);
  const selectedBonusPoints =
    (firstScorerPlayerId ? firstScorerBonus : 0) +
    (totalGoals !== null ? totalGoalsBonus : 0) +
    (halfHomeScore !== null && halfAwayScore !== null ? halfTimeScoreBonus : 0);
  const exactPointsPreview = Math.round(
    pointsWagered +
      ((exactTier.totalPoints ?? (basePoints + (exactTier.bonusPoints ?? 0))) + selectedBonusPoints) *
        confidenceMultiplier *
        boostMultiplier +
      streakPointsPreview
  );
  const goalDiffPointsPreview = Math.round(
    pointsWagered +
      ((goalDiffTier.totalPoints ?? (basePoints + (goalDiffTier.bonusPoints ?? 0))) + selectedBonusPoints) *
        confidenceMultiplier *
        boostMultiplier +
      streakPointsPreview
  );
  const resultPointsPreview = Math.round(
    pointsWagered +
      ((resultTier.totalPoints ?? (basePoints + (resultTier.bonusPoints ?? 0))) + selectedBonusPoints) *
        confidenceMultiplier *
        boostMultiplier +
      streakPointsPreview
  );
  const wrongPointsPreview = 0;
  const selectedFirstScorer = findPlayerById({ home: { players: homePlayers }, away: { players: awayPlayers } }, firstScorerPlayerId);
  const selectedConfidenceLabel =
    confidenceOptions.find((option) => option.value === confidence)?.label ?? confidence;
  const predictedOutcomeLabel =
    homeScore === null || awayScore === null
      ? "-"
      : homeScore > awayScore
        ? t("outcome.homeWin", { team: match.home.name })
        : awayScore > homeScore
          ? t("outcome.awayWin", { team: match.away.name })
          : t("outcome.draw");
  const fullScoreValue =
    homeScore !== null && awayScore !== null
      ? `${match.home.name} ${homeScore} - ${awayScore} ${match.away.name}`
      : locale === "th"
        ? "ยังไม่เลือกสกอร์"
        : "No score selected";
  const fullScoreHelper =
    homeScore !== null && awayScore !== null
      ? `${predictedOutcomeLabel} • ${locale === "th" ? "รวม" : "Total"} ${totalGoals ?? 0} ${
          locale === "th" ? "ประตู" : "goals"
        }`
      : locale === "th"
        ? "เลือกสกอร์ของทั้งสองทีมก่อนส่งคำทาย"
        : "Pick both teams' final score before submitting.";
  const firstScorerValue = selectedFirstScorer?.name ?? (locale === "th" ? "ยังไม่เลือก" : "Not selected");
  const firstScorerHelper = selectedFirstScorer
    ? `${selectedFirstScorer.number ? `#${selectedFirstScorer.number} • ` : ""}${
        locale === "th" ? "ผู้เล่นที่เลือกให้ยิงประตูแรก" : "Selected first goalscorer"
      }`
    : locale === "th"
      ? "เลือกได้จากรายชื่อนักเตะ หรือปล่อยว่างถ้าไม่ต้องการทาย"
      : "Choose a player or leave this empty.";
  const confidenceHelper = `${locale === "th" ? "แต้มที่ใช้จริง" : "Effective stake"} ${effectivePointsWagered.toLocaleString()} ${
    locale === "th" ? "แต้ม" : "pts"
  }`;
  
  const payload = {
    matchId: /^\d+$/.test(String(match.matchId)) ? Number(match.matchId) : match.matchId,
    predictedHomeScore: homeScore,
    predictedAwayScore: awayScore,
    firstScorerPlayerId: firstScorerPlayerId && /^\d+$/.test(String(firstScorerPlayerId)) ? Number(firstScorerPlayerId) : null,
    totalGoals,
    halfTimeHome: halfHomeScore,
    halfTimeAway: halfAwayScore,
    confidenceLevel: confidence,
    useBoost,
    pointsWagered: effectivePointsWagered,
  };
  const aiSuggestionPreview = buildAiPredictionSuggestion({
    match,
    homePlayers,
    awayPlayers,
  });

  const confirmSubmit = async () => {
    setShowConfirm(false);

    try {
      await apiPostRaw("/predictions", payload);
      dispatchMemberWalletRefresh();

      addToast({
        type: "success",
        title: locale === "th" ? "ทายสำเร็จ" : "Prediction submitted",
        message:
          locale === "th"
            ? "คำทายของคุณได้รับการบันทึกเรียบร้อยแล้ว"
            : "Your prediction has been successfully recorded",
      });

      setSubmitted(true);
      setTimeout(() => router.push(`/${locale}/predict`), 1600);
    } catch (error) {
      if (isAuthSessionExpiredError(error)) return;
      const apiError = error as { status?: number; code?: string; message?: string };
      const status = apiError.status ?? 0;
      const code = apiError.code ?? "";

      let title: string;
      let message: string;

      if (status === 404 && code === "NOT_FOUND") {
        title = locale === "th" ? "ไม่พบแมตช์" : "Match not found";
        message = locale === "th"
          ? "ไม่พบข้อมูลการแข่งขันนี้ในระบบ"
          : "This match was not found in the system";
      } else if (status === 409 && code === "MATCH_LOCKED") {
        title = locale === "th" ? "เริ่มแข่งแล้ว" : "Match locked";
        message = locale === "th"
          ? "การแข่งขันเริ่มแล้ว ไม่สามารถส่งคำทายได้"
          : "The match has already started, predictions are locked";
      } else if (status === 409 && code === "DUPLICATE_PREDICTION") {
        title = locale === "th" ? "ทายซ้ำ" : "Duplicate prediction";
        message = locale === "th"
          ? "คุณได้ส่งคำทายสำหรับแมตช์นี้ไปแล้ว"
          : "You have already submitted a prediction for this match";
      } else {
        title = locale === "th" ? "ส่งคำทายไม่สำเร็จ" : "Prediction failed";
        message = apiError.message || (locale === "th"
          ? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"
          : "An error occurred, please try again");
      }

      addToast({
        type: "error",
        title,
        message,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 md:px-6 space-y-6 pb-8">
      {/* Back navigation */}
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-base font-medium text-gray-400 transition-colors hover:text-cyan-300 cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t("common.back")}
      </button>

      {/* Top Header Section */}
      <div className="flex flex-col gap-4 border-b border-gray-800/40 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Badge variant="cyan" size="md">
            {t("badge")}
          </Badge>
          <h1 className="mt-2 text-3xl font-extrabold text-white tracking-tight bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent md:text-4xl">{t("title")}</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-gray-400 sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        
        {/* Countdown capsule */}
        <div
          className={cn(
            "predict-lock-countdown group relative w-full shrink-0 overflow-hidden rounded-xl border px-3.5 py-2.5 shadow-[0_0_35px_rgba(245,158,11,0.18)] transition-all sm:w-auto sm:px-4 sm:py-3",
            isLocked
              ? "border-red-500/40 bg-gradient-to-b from-[#1c0c0c] to-[#0f0505] shadow-[0_0_30px_rgba(239,68,68,0.2)] text-red-300"
              : "border-amber-500/40 bg-gradient-to-b from-[#1c130b] to-[#0e0a05] text-amber-200"
          )}
        >
          <div className="absolute inset-0 opacity-50 predict-countdown-scan" />
          <div className="relative flex items-center justify-between sm:justify-start gap-4">
            <span
              className={cn(
                "flex h-11 w-11 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-xl border bg-black/60 shadow-[inset_0_0_12px_rgba(255,255,255,0.05)]",
                isLocked 
                  ? "border-red-500/35 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" 
                  : "border-amber-500/35 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]"
              )}
            >
              <Timer size={20} className={cn(!isLocked && "animate-pulse")} />
            </span>
            <div className="min-w-0 flex items-center justify-center">
              {isLocked ? (
                <span className="px-3 py-2 text-sm font-black uppercase tracking-wider text-red-400 bg-black/60 border border-red-500/30 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse sm:text-base">
                  {t("locked")}
                </span>
              ) : (
                <div className="flex items-center gap-1 sm:gap-2 font-mono">
                  {countdownInfo.parts.map((part, index) => (
                    <div key={part.label} className="flex items-center gap-1 sm:gap-1.5">
                      {index > 0 && (
                        <span className="text-[14px] sm:text-lg font-black text-amber-400/90 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] animate-pulse">
                          :
                        </span>
                      )}
                        <span className="flex h-10 min-w-[38px] items-center justify-center rounded-lg border border-amber-500/40 bg-black/75 text-center text-base font-black tracking-tight text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2),inset_0_0_8px_rgba(245,158,11,0.15)] sm:h-12 sm:min-w-[48px] sm:text-lg">
                        {part.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <FlowStep
          number="01"
          title={t("basic.fullScore")}
          value={fullScoreValue}
          description={fullScoreHelper}
          active={homeScore !== null && awayScore !== null}
          tone="cyan"
        />
        <FlowStep
          number="02"
          title={t("deep.firstScorer")}
          value={firstScorerValue}
          description={firstScorerHelper}
          active={Boolean(selectedFirstScorer)}
          tone="magenta"
        />
        <FlowStep
          number="03"
          title={t("confidence.title")}
          value={selectedConfidenceLabel}
          description={confidenceHelper}
          active
          tone="gold"
        />
      </div>

      {/* Unified Scoreboard Console Header */}
      <Card neon="cyan" className="relative overflow-hidden p-0 border border-cyan-500/25 bg-[#07080b] shadow-[0_0_40px_rgba(6,182,212,0.05)]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_80%_25%,rgba(217,70,239,0.1),transparent_30%)]" />
        
        <div className="relative mt-[2px] flex flex-col items-center p-5 sm:p-6">
          {/* League badge glass capsule */}
          <div className="mx-auto mb-4 flex w-fit items-center gap-3 rounded-xl border border-cyan-500/20 bg-black/45 px-3.5 py-1.5 shadow-[0_0_20px_rgba(34,211,238,0.08)] max-w-full">
            <ApiLeagueLogo name={match.league} logo={match.leagueLogo} size="md" />
            <div className="text-left min-w-0">
              <p className="truncate text-sm font-extrabold text-white sm:text-base">{match.league}</p>
              <p className="truncate text-xs font-bold uppercase tracking-wider text-gray-500">
                {match.round} • {match.venue}
              </p>
            </div>
          </div>

          {/* Epic Unified Interactive Scoreboard Display Grid */}
          <div className="mx-auto my-2 grid w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 select-none sm:gap-6">
            {/* Home Team header Block */}
            <div className="min-w-0 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-end sm:gap-3">
              <p className="line-clamp-2 text-center text-sm font-black text-white sm:text-right md:text-lg">
                {match.home.name}
              </p>
              <div className="predict-team-float shrink-0">
                <div className="hidden sm:block">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="lg" accent="cyan" />
                </div>
                <div className="block sm:hidden">
                  <ApiTeamLogo name={match.home.name} logo={match.home.logo} size="md" accent="cyan" />
                </div>
              </div>
            </div>
            
            {/* Centered VS Block */}
            <div className="flex min-w-[96px] shrink-0 flex-col items-center justify-center rounded-xl border border-cyan-500/20 bg-black/60 px-3 py-2.5 shadow-2xl sm:min-w-[126px] sm:px-4">
              <span className="font-mono text-2xl font-black tracking-wider text-white sm:text-3xl">
                {homeScore ?? "-"}<span className="px-1 text-gray-600">:</span>{awayScore ?? "-"}
              </span>
              <span suppressHydrationWarning className="mt-1 whitespace-nowrap text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {formatDate(match.kickoffTime, locale)}
              </span>
              <span suppressHydrationWarning className="whitespace-nowrap font-mono text-xs font-extrabold uppercase tracking-wider text-gray-400">
                {formatMatchTimeWithZone(match.kickoffTime, locale)}
              </span>
            </div>
            
            {/* Away Team Header Block */}
            <div className="min-w-0 flex flex-col items-center gap-1.5 sm:flex-row sm:justify-start sm:gap-3">
              <div className="predict-team-float shrink-0">
                <div className="hidden sm:block">
                  <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="lg" accent="magenta" />
                </div>
                <div className="block sm:hidden">
                  <ApiTeamLogo name={match.away.name} logo={match.away.logo} size="md" accent="magenta" />
                </div>
              </div>
              <p className="line-clamp-2 text-center text-sm font-black text-white sm:text-left md:text-lg">
                {match.away.name}
              </p>
            </div>
          </div>

          <div className="mt-5 grid w-full gap-2 border-t border-gray-800/70 pt-4 sm:grid-cols-3">
            <HeroMetric label={t("basic.result")} value={predictedOutcomeLabel} tone="text-cyan-200" />
            <HeroMetric
              label={t("payload.pointsWagered")}
              value={`${effectivePointsWagered.toLocaleString()} ${locale === "th" ? "แต้ม" : "pts"}`}
              tone="text-amber-200"
            />
            <HeroMetric label={t("summary.halfTime")} value={`${halfHomeScore ?? "-"} : ${halfAwayScore ?? "-"}`} tone="text-fuchsia-200" />
          </div>
        </div>
      </Card>

      {/* SCORE PREDICTOR CONSOLE */}
      <div className="space-y-6">
        <Card className="relative overflow-hidden border border-gray-800 bg-[#07080b] p-4 sm:p-5">
          {/* Esports accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-magenta-500" />
          <div className="relative mt-[2px]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">
                  {t("basic.title")}
                </p>
                <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  {t("basic.selectScores")}
                </h2>
              </div>
              <Badge variant={isLocked ? "red" : "green"}>
                {isLocked ? t("locked") : t("locksIn", { time: countdownInfo.compact })}
              </Badge>
            </div>
            <ScorePredictorConsole
              homeTeamName={match.home.name}
              homeLogo={match.home.logo}
              awayTeamName={match.away.name}
              awayLogo={match.away.logo}
              homeScore={homeScore}
              awayScore={awayScore}
              setHomeScore={setHomeScore}
              setAwayScore={setAwayScore}
              isLocked={isLocked}
            />
          </div>
        </Card>
      </div>
      {/* Main Grid: Form Inputs + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left Column (Prediction inputs) */}
        <div className="space-y-6 min-w-0">
          
          {/* Section 1: Scorer & Stats HUD (Deep Prediction) */}
          <PredictionSection
            icon={Sparkles}
            title={t("deep.title")}
            subtitle={t("deep.subtitle")}
          >
            <div className="grid gap-5">
              {/* Tactical pitch player picker */}
              <PlayerPicker
                label={t("deep.firstScorer")}
                home={match.home}
                away={match.away}
                value={firstScorerPlayerId}
                onChange={setFirstScorerPlayerId}
                locale={locale}
                homePlayers={homePlayers}
                awayPlayers={awayPlayers}
                loadingHome={loadingHome && homePlayers.length === 0}
                loadingAway={loadingAway && awayPlayers.length === 0}
              />
              
              {/* Futuristic Statistics Console (Halftime & Total Goals Redesigned) */}
              <div className="grid gap-5 grid-cols-1 bg-black/35 p-4 sm:p-5 rounded-xl border border-gray-900 shadow-inner">
                {/* 1st Half Scorecard Section */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-3 border-b border-gray-800/40 pb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-950 font-mono text-xs font-black text-cyan-400">1ST</span>
                    <p className="text-sm font-black uppercase tracking-wider text-gray-300">{t("deep.halfTimeScore")}</p>
                  </div>
                  
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {/* Home Halftime Pods */}
                    <div className="bg-[#05070b] p-3 rounded-lg border border-gray-950">
                      <p className="mb-2 truncate font-mono text-xs font-bold uppercase tracking-wide text-gray-400">
                        {match.home.name} {locale === "th" ? "(ครึ่งแรก)" : "(Half-time)"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {[0, 1, 2, 3, "4+"].map((val) => {
                          const isSelected = val === "4+" ? (halfHomeScore ?? 0) >= 4 : halfHomeScore === val;
                          return (
                            <button
                              type="button"
                              key={`ht-home-${val}`}
                              onClick={() => {
                                if (isLocked) return;
                                setHalfHomeScore(val === "4+" ? 4 : (val as number));
                              }}
                              disabled={isLocked}
                              className={cn(
                                "h-9 flex-1 rounded px-2.5 py-1 font-mono text-sm font-bold transition-all cursor-pointer",
                                isSelected
                                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200 shadow-[0_0_8px_rgba(34,211,238,0.2)]"
                                  : "bg-[#12121a] border border-gray-900 text-gray-500 hover:border-cyan-400/20 hover:text-white"
                              )}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Away Halftime Pods */}
                    <div className="bg-[#05070b] p-3 rounded-lg border border-gray-950">
                      <p className="mb-2 truncate font-mono text-xs font-bold uppercase tracking-wide text-gray-400">
                        {match.away.name} {locale === "th" ? "(ครึ่งแรก)" : "(Half-time)"}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {[0, 1, 2, 3, "4+"].map((val) => {
                          const isSelected = val === "4+" ? (halfAwayScore ?? 0) >= 4 : halfAwayScore === val;
                          return (
                            <button
                              type="button"
                              key={`ht-away-${val}`}
                              onClick={() => {
                                if (isLocked) return;
                                setHalfAwayScore(val === "4+" ? 4 : (val as number));
                              }}
                              disabled={isLocked}
                              className={cn(
                                "h-9 flex-1 rounded px-2.5 py-1 font-mono text-sm font-bold transition-all cursor-pointer",
                                isSelected
                                  ? "bg-magenta-500/20 border border-magenta-400 text-magenta-200 shadow-[0_0_8px_rgba(217,70,239,0.2)]"
                                  : "bg-[#12121a] border border-gray-900 text-gray-500 hover:border-magenta-400/20 hover:text-white"
                              )}
                            >
                              {val}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clear halftime score helper */}
                  {(halfHomeScore !== null || halfAwayScore !== null) && (
                    <button
                      type="button"
                      onClick={() => {
                        setHalfHomeScore(null);
                        setHalfAwayScore(null);
                      }}
                      className="mt-2.5 cursor-pointer self-start text-xs font-black text-gray-500 hover:text-red-400"
                    >
                      ✕ CLEAR HALFTIME
                    </button>
                  )}
                </div>

                {/* Total Goals Section */}
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-3 border-b border-gray-800/40 pb-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-950 text-sm text-amber-400">⚽</span>
                    <p className="text-sm font-black uppercase tracking-wider text-gray-300">{t("deep.totalGoals")}</p>
                  </div>
                  <div className="flex flex-col bg-[#05070b] p-4 rounded-lg border border-gray-950 w-full space-y-3 select-none">
                    {/* Glowing Bead Horizontal Selector */}
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wider text-amber-500/80 animate-pulse">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                        {locale === "th" ? "คำนวณอัตโนมัติจากผลสกอร์" : "AUTO-CALCULATED FROM SCORE"}
                      </span>
                      <span className="rounded border border-amber-500/15 bg-amber-950/20 px-2 py-1 font-mono text-base font-black text-amber-300">
                        {totalGoals ?? "-"} {locale === "th" ? "ประตู" : "goals"}
                      </span>
                    </div>
                    {/* Quick values beads */}
                    <div className="flex flex-wrap gap-1.5">
                      {[0, 1, 2, 3, 4, 5, 6, 7, "8+"].map((val) => {
                        const isSelected = val === "8+" ? (totalGoals ?? 0) >= 8 : totalGoals === val;
                        return (
                          <button
                            type="button"
                            key={`total-${val}`}
                            disabled={true}
                            className={cn(
                              "h-9 min-w-9 flex-1 rounded-lg font-mono text-sm font-bold transition-all select-none",
                              isSelected
                                ? "bg-amber-400 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.35)] scale-105 border border-amber-300"
                                : "bg-[#12121a]/40 border border-gray-900/60 text-gray-600"
                            )}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PredictionSection>

          <Card className="relative overflow-hidden border border-amber-500/20 bg-gradient-to-br from-[#140f06] to-[#07080b] p-4 sm:p-5">
            <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-400/5 blur-2xl" />
            <div className="relative grid gap-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-end">
              <div className="min-w-0">
                <label
                  htmlFor="pointsWagered"
                  className="block text-sm font-black uppercase tracking-wider text-amber-300"
                >
                  {t("payload.pointsWagered")}
                </label>
                <p className="mt-1 text-sm leading-relaxed text-gray-400">
                  {locale === "th"
                    ? "กำหนด stake สำหรับคำทายนี้ แล้วตรวจสูตรรวม points_earned ด้านล่าง"
                    : "Set the stake for this prediction, then review the points_earned formula below."}
                </p>
              </div>
              <div className="min-w-0">
                <div className="flex items-center rounded-xl border border-amber-500/30 bg-black/45 px-3 py-2 shadow-[inset_0_0_14px_rgba(245,158,11,0.06)] focus-within:border-amber-300/70">
                  <input
                    id="pointsWagered"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    value={pointsWagered}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setPointsWagered(Number.isFinite(nextValue) ? Math.max(0, Math.floor(nextValue)) : 0);
                    }}
                    disabled={isLocked}
                    className="min-w-0 flex-1 bg-transparent font-mono text-2xl font-black text-white outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="shrink-0 text-sm font-bold uppercase text-amber-300">
                    {locale === "th" ? "แต้ม" : "pts"}
                  </span>
                </div>
                <p className="mt-1.5 text-right text-xs font-semibold text-gray-400">
                  {t("side.balance")}: {mounted ? freePoints.toLocaleString() : "..."} {locale === "th" ? "แต้ม" : "pts"}
                </p>
              </div>
            </div>
            <div className="relative mt-4 space-y-3 rounded-xl border border-amber-500/15 bg-black/30 p-3">
              <div className="rounded-lg border border-amber-500/15 bg-black/35 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {t("formula.payloadPreview")}
                </p>
                <p className="mt-1 text-right font-mono text-sm font-bold text-amber-200">
                  {pointsWagered.toLocaleString()} x {confidenceMultiplier.toFixed(1)} ={" "}
                  {effectivePointsWagered.toLocaleString()}{" "}
                  {locale === "th" ? "แต้ม" : "pts"}
                </p>
              </div>

              <div className="rounded-lg border border-cyan-500/15 bg-[#071018] px-3 py-2.5">
                <p className="text-xs font-black uppercase tracking-wider text-cyan-300">
                  {t("formula.pointsEarnedTitle")}
                </p>
                <p className="mt-1 break-words font-mono text-sm font-bold text-cyan-100">
                  {activeScoringRules.formula.description ?? t("formula.pointsEarnedExpression")}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-5">
                  <FormulaValue
                    label={t("formula.stake")}
                    value={`${pointsWagered.toLocaleString()} ${locale === "th" ? "แต้ม" : "pts"}`}
                    tone="text-amber-300"
                  />
                  <FormulaValue
                    label={locale === "th" ? "bonus" : "bonus"}
                    value={`+${selectedBonusPoints.toLocaleString()}`}
                    tone="text-green-300"
                  />
                  <FormulaValue
                    label={t("formula.confidence")}
                    value={`x${confidenceMultiplier.toFixed(1)}`}
                    tone="text-cyan-300"
                  />
                  <FormulaValue
                    label={t("formula.boost")}
                    value={`x${boostMultiplier.toFixed(1)}`}
                    tone={useBoost ? "text-fuchsia-300" : "text-gray-300"}
                  />
                  <FormulaValue
                    label={t("formula.streak")}
                    value={`${streakPreview} x ${activeScoringRules.streak.bonusPerLevel ?? 0} = ${streakPointsPreview}`}
                    tone="text-green-300"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {activeScoringRules.streak.formula ?? t("formula.streakNote")}
                </p>
              </div>

              <div className="rounded-lg border border-gray-800/80 bg-black/25 px-3 py-2.5">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-wider text-white">
                    {t("formula.resultTierTitle")}
                  </p>
                  <span className="font-mono text-xs text-gray-400">
                    base = {basePoints}
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <TierRow
                    label={exactTier.name ?? t("formula.tiers.exact")}
                    description={exactTier.description ?? t("formula.tiers.exactDesc")}
                    bonus={`+${exactTier.bonusPoints ?? 0}`}
                    tone="text-amber-300"
                  />
                  <TierRow
                    label={goalDiffTier.name ?? t("formula.tiers.goalDiff")}
                    description={goalDiffTier.description ?? t("formula.tiers.goalDiffDesc")}
                    bonus={`+${goalDiffTier.bonusPoints ?? 0}`}
                    tone="text-green-300"
                  />
                  <TierRow
                    label={resultTier.name ?? t("formula.tiers.result")}
                    description={resultTier.description ?? t("formula.tiers.resultDesc")}
                    bonus={`+${resultTier.bonusPoints ?? 0}`}
                    tone="text-cyan-300"
                  />
                  <TierRow
                    label={t("formula.tiers.wrong")}
                    description={t("formula.tiers.wrongDesc")}
                    bonus="0"
                    tone="text-red-300"
                  />
                </div>
                <p className="mt-2 text-xs text-red-300/80">
                  {t("formula.wrongNote")}
                </p>
                <div className="mt-3 border-t border-gray-800/70 pt-3">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-gray-400">
                    {locale === "th" ? "โบนัสเพิ่มเติมจาก API" : "Additional bonuses from API"}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <TierRow
                      label={activeScoringRules.bonuses.firstScorer?.name ?? t("deep.firstScorer")}
                      description={selectedFirstScorer ? selectedFirstScorer.name : locale === "th" ? "ได้รับเมื่อทายถูก" : "Earned if correct"}
                      bonus={`+${firstScorerBonus}`}
                      tone="text-fuchsia-300"
                    />
                    <TierRow
                      label={activeScoringRules.bonuses.totalGoals?.name ?? t("deep.totalGoals")}
                      description={totalGoals !== null ? `${totalGoals} ${locale === "th" ? "ประตู" : "goals"}` : locale === "th" ? "คำนวณจากสกอร์รวม" : "Calculated from final score"}
                      bonus={`+${totalGoalsBonus}`}
                      tone="text-amber-300"
                    />
                    <TierRow
                      label={activeScoringRules.bonuses.halfTimeScore?.name ?? t("summary.halfTime")}
                      description={`${halfHomeScore ?? "-"} : ${halfAwayScore ?? "-"}`}
                      bonus={`+${halfTimeScoreBonus}`}
                      tone="text-cyan-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Confidence Tactical Cards */}
          <PredictionSection
            icon={Medal}
            title={t("confidence.title")}
            subtitle={t("confidence.subtitle")}
          >
            <div className="space-y-4">
              <ConfidenceCards
                options={confidenceOptions}
                value={confidence}
                onChange={(value) => setConfidence(value as ConfidenceLevel)}
              />
              
              <BoostToggle 
                checked={useBoost} 
                onChange={setUseBoost} 
                label={t("boost.label")} 
                description={t("boost.description")} 
              />
            </div>
          </PredictionSection>
        </div>

        {/* Right Column (Sidebar Ticket & Actions) */}
        <aside className="space-y-4 min-w-0">
          <MatchResearchLinks
            matchHref={matchPageHref}
            aiInsightHref={aiInsightHref}
            hasAiInsight={Boolean(match.hasAiInsight)}
            labels={{
              title: t("matchLinks.title"),
              description: t("matchLinks.description"),
              match: t("matchLinks.match"),
              aiInsight: t("matchLinks.aiInsight"),
            }}
          />

          {/* Physical Football Ticket summary */}
          <Card className="overflow-hidden p-0 border border-cyan-500/20 bg-gradient-to-b from-[#101721] to-[#090b11] shadow-[0_0_30px_rgba(34,211,238,0.06)]">
            <div className="border-b border-cyan-500/10 bg-black/30 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-cyan-400">{t("summary.title")}</h2>
                <p className="mt-1 text-xs text-gray-400">{t("summary.description")}</p>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="relative overflow-hidden rounded-xl border border-dashed border-cyan-500/25 bg-black/45 p-4 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(34,211,238,0.06),transparent_60%)]" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{t("basic.fullScore")}</p>
                <p className="mt-1 font-mono text-5xl font-extrabold tracking-tight text-white">
                  {homeScore ?? "-"} <span className="text-gray-700 font-normal">:</span> {awayScore ?? "-"}
                </p>
                <p className="mt-2 truncate text-sm font-semibold text-gray-300">
                  {match.home.name} <span className="text-xs text-gray-600">vs</span> {match.away.name}
                </p>
              </div>
              
              <div className="grid gap-2">
                <SlipMetric label={t("basic.result")} value={predictedOutcomeLabel} tone="text-cyan-200" />
                <SlipMetric
                  label={t("deep.firstScorer")}
                  value={selectedFirstScorer ? selectedFirstScorer.name : "-"}
                />
                <SlipMetric
                  label={t("deep.totalGoals")}
                  value={`${formatNullableNumber(payload.totalGoals)} ${locale === "th" ? "ประตู" : "goals"}`}
                />
                <SlipMetric
                  label={t("summary.halfTime")}
                  value={`${formatNullableNumber(payload.halfTimeHome)} : ${formatNullableNumber(payload.halfTimeAway)}`}
                />
                <SlipMetric
                  label={t("payload.pointsWagered")}
                  value={`${payload.pointsWagered.toLocaleString()} ${locale === "th" ? "แต้ม" : "pts"}`}
                  tone="text-amber-200"
                />
                <SlipMetric label={t("confidence.title")} value={selectedConfidenceLabel} tone="text-fuchsia-200" />
                <SlipMetric label={t("payload.useBoost")} value={payload.useBoost ? t("common.yes") : t("common.no")} />
              </div>

              {/* Soccer Digital Ticket Barcode */}
              <div className="pt-4 border-t border-dashed border-gray-800 flex flex-col items-center justify-center opacity-70">
                <div className="w-full h-8 bg-[repeating-linear-gradient(90deg,theme(colors.gray.600)_0_2px,transparent_2px_5px,theme(colors.gray.600)_5px_6px,transparent_6px_8px)]" />
                <p className="mt-1 font-mono text-xs uppercase tracking-widest text-cyan-500/50">SCM-PRD-TICKET</p>
              </div>
            </div>
          </Card>

          {/* AI Helper tool */}
          <Card className="relative overflow-hidden p-4 border border-cyan-500/20 bg-gradient-to-br from-[#0c1622] to-[#060b11]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                <Brain size={15} className="animate-pulse" />
              </span>
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-300">{t("ai.title")}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              {locale === "th" ? aiSuggestionPreview.reasonTh : aiSuggestionPreview.reasonEn}
            </p>
            <Button
              className="mt-3.5 w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-400 hover:text-black cursor-pointer shadow-md transition-all active:scale-[0.98]"
              size="sm"
              onClick={() => {
                const aiSuggestion = aiSuggestionPreview;

                setHomeScore(aiSuggestion.homeScore);
                setAwayScore(aiSuggestion.awayScore);
                setHalfHomeScore(aiSuggestion.halfHomeScore);
                setHalfAwayScore(aiSuggestion.halfAwayScore);
                setFirstScorerPlayerId(aiSuggestion.firstScorerPlayerId);
                setConfidence(aiSuggestion.confidence);
                setUseBoost(false);
                
                addToast({
                  type: "success",
                  title: locale === "th" ? "กรอกผลด้วย AI แล้ว" : "Filled with AI",
                  message: locale === "th" 
                    ? aiSuggestion.reasonTh
                    : aiSuggestion.reasonEn,
                });
              }}
            >
              <Sparkles size={13} className="mr-1" />
              {t("ai.use")}
            </Button>
          </Card>

          {/* Form Actions */}
          {submitted ? (
            <Card className="border-green-500/30 p-5 text-center bg-green-950/10 animate-slide-up">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-green-400" />
              <p className="font-semibold text-green-400">{t("submitted.title")}</p>
              <p className="text-sm text-gray-400">{t("submitted.description")}</p>
            </Card>
          ) : (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit}
              className="w-full cursor-pointer h-12 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
              size="lg"
              neon
            >
              {t("submit")}
            </Button>
          )}
        </aside>
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t("confirm.title")}
        size="lg"
      >
        <div className="space-y-5">
          {/* Match Scoreboard Card */}
          <div className="rounded-xl border border-gray-800 bg-gradient-to-b from-[#0a0a0f] to-[#06080c] px-5 py-4 text-center shadow-[0_0_30px_rgba(34,211,238,0.06)]">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500 sm:text-sm">
              {t("confirm.youPredict")}
            </p>

            {/* Teams vs Score */}
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {/* Home team */}
              <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
                <ApiTeamLogo
                  name={match.home.name}
                  logo={match.home.logo}
                  size="md"
                  accent="cyan"
                />
                <span className="max-w-full truncate text-sm font-bold text-white">
                  {match.home.name}
                </span>
              </div>

              {/* Score */}
              <div className="shrink-0">
                <p className="font-mono text-2xl font-black tracking-tight text-white sm:text-3xl">
                  <span className="text-cyan-400">{homeScore ?? "-"}</span>
                  <span className="text-gray-600 mx-0.5">:</span>
                  <span className="text-magenta-400">{awayScore ?? "-"}</span>
                </p>
              </div>

              {/* Away team */}
              <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
                <ApiTeamLogo
                  name={match.away.name}
                  logo={match.away.logo}
                  size="md"
                  accent="magenta"
                />
                <span className="max-w-full truncate text-sm font-bold text-white">
                  {match.away.name}
                </span>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-gray-500 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Timer size={11} className="text-cyan-400/70" />
                {match.league} - {match.round}
              </span>
              <span suppressHydrationWarning className="inline-flex items-center gap-1.5">
                <CalendarClock size={11} className="text-amber-400/70" />
                {formatDateTime(match.kickoffTime, locale)}
              </span>
            </div>
          </div>

          <Tabs
            tabs={[
              {
                key: "summary",
                label: locale === "th" ? "สรุปก่อนส่ง" : "Submission summary",
              },
              {
                key: "outcomes",
                label: locale === "th" ? "คะแนนที่เป็นไปได้" : "Possible outcomes",
              },
            ]}
            activeTab={confirmTab}
            onChange={setConfirmTab}
          />

          {confirmTab === "summary" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-800 bg-[#0a0a0f] p-4">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-gray-800/70 pb-2">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">
                    {locale === "th" ? "สรุปก่อนส่ง" : "Submission summary"}
                  </p>
                  <Badge variant={useBoost ? "gold" : "default"}>
                    {useBoost ? t("boost.label") : t("common.no")}
                  </Badge>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <ConfirmMetric
                    label={t("basic.fullScore")}
                    value={`${homeScore ?? "-"} : ${awayScore ?? "-"}`}
                    tone="text-white"
                  />
                  <ConfirmMetric
                    label={t("confidence.title")}
                    value={
                      confidenceOptions.find((option) => option.value === confidence)
                        ?.label ?? confidence
                    }
                    tone="text-cyan-300"
                  />
                  <ConfirmMetric
                    label={t("payload.pointsWagered")}
                    value={`${effectivePointsWagered.toLocaleString()} ${locale === "th" ? "แต้ม" : "pts"}`}
                    tone="text-amber-300"
                  />
                  <ConfirmMetric
                    label={locale === "th" ? "บูสต์" : "Boost"}
                    value={
                      useBoost
                        ? locale === "th"
                          ? "ใช้บูสต์"
                          : "Boost enabled"
                        : locale === "th"
                          ? "ไม่ใช้บูสต์"
                          : "No boost"
                    }
                    tone={useBoost ? "text-fuchsia-300" : "text-gray-300"}
                  />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <ConfirmDetailCard label={t("deep.firstScorer")}>
                  {selectedFirstScorer ? (
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 font-mono text-xs font-black text-cyan-300">
                        {selectedFirstScorer.number ?? "?"}
                      </span>
                      <span className="truncate">{selectedFirstScorer.name}</span>
                    </span>
                  ) : (
                    "—"
                  )}
                </ConfirmDetailCard>
                <ConfirmDetailCard label={t("deep.totalGoals")}>
                  {totalGoals !== null
                    ? `${totalGoals} ${locale === "th" ? "ประตู" : "goals"}`
                    : "-"}
                </ConfirmDetailCard>
                <ConfirmDetailCard label={t("summary.halfTime")}>
                  {halfHomeScore !== null ? halfHomeScore : "-"} :{" "}
                  {halfAwayScore !== null ? halfAwayScore : "-"}
                </ConfirmDetailCard>
                <ConfirmDetailCard label={t("formula.streak")}>
                  {streakPreview} x {activeScoringRules.streak.bonusPerLevel ?? 0} = {streakPointsPreview}
                </ConfirmDetailCard>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[0.16em] text-amber-300/90">
                  <AlertTriangle size={13} className="shrink-0" />
                  {t("confirm.lockNotice")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-100/80">
                  {t("formula.wrongNote")}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-cyan-500/20 bg-[#071018] p-4">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-cyan-500/10 pb-2">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                  {locale === "th" ? "คะแนนที่เป็นไปได้" : "Possible outcomes"}
                </p>
                <span className="font-mono text-xs text-gray-500">
                  base {basePoints} / boost x{boostMultiplier.toFixed(1)}
                </span>
              </div>
              <div className="space-y-2">
                <OutcomeRow
                  label={exactTier.name ?? t("formula.tiers.exact")}
                  description={exactTier.description ?? t("formula.tiers.exactDesc")}
                  points={exactPointsPreview}
                  tone="text-amber-300"
                />
                <OutcomeRow
                  label={goalDiffTier.name ?? t("formula.tiers.goalDiff")}
                  description={goalDiffTier.description ?? t("formula.tiers.goalDiffDesc")}
                  points={goalDiffPointsPreview}
                  tone="text-green-300"
                />
                <OutcomeRow
                  label={resultTier.name ?? t("formula.tiers.result")}
                  description={resultTier.description ?? t("formula.tiers.resultDesc")}
                  points={resultPointsPreview}
                  tone="text-cyan-300"
                />
                <OutcomeRow
                  label={t("formula.tiers.wrong")}
                  description={t("formula.tiers.wrongDesc")}
                  points={wrongPointsPreview}
                  tone="text-red-300"
                />
              </div>
              <p className="mt-3 text-xs leading-relaxed text-gray-500">
                {activeScoringRules.formula.profit ?? t("formula.pointsEarnedExpression")}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1 cursor-pointer h-11" onClick={() => setShowConfirm(false)}>
              {t("common.cancel")}
            </Button>
            <Button className="flex-1 cursor-pointer h-11 shadow-[0_0_20px_rgba(34,211,238,0.2)]" onClick={confirmSubmit} neon>
              {t("common.confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function FlowStep({
  number,
  title,
  value,
  description,
  active,
  tone,
}: {
  number: string;
  title: string;
  value: string;
  description: string;
  active: boolean;
  tone: "cyan" | "magenta" | "gold";
}) {
  const activeTone =
    tone === "cyan"
      ? "border-cyan-400/45 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
      : tone === "magenta"
        ? "border-magenta-400/45 bg-magenta-500/10 text-magenta-200 shadow-[0_0_18px_rgba(217,70,239,0.08)]"
        : "border-amber-400/45 bg-amber-500/10 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.08)]";

  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 transition-all",
        active
          ? activeTone
          : "border-gray-800 bg-[#0b0d13] text-gray-400"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-black/45 font-mono text-sm font-black",
            active ? "border-current" : "border-gray-800 text-gray-500"
          )}
        >
          {number}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wider text-gray-500">{title}</p>
          <p className="mt-1 line-clamp-2 text-base font-black leading-snug text-white">
            {value}
          </p>
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-400">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-800/80 bg-black/35 px-3 py-2">
      <p className="truncate text-xs font-black uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className={cn("mt-1 truncate text-base font-black text-white", tone)}>
        {value}
      </p>
    </div>
  );
}

function SlipMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-gray-800/80 bg-black/30 px-3 py-2.5">
      <span className="min-w-0 truncate text-sm font-semibold text-gray-400">
        {label}
      </span>
      <span className={cn("max-w-[55%] truncate text-right text-sm font-extrabold text-white", tone)}>
        {value}
      </span>
    </div>
  );
}

// ----------------------------------------------------
// SCORE PREDICTOR CONSOLE
// ----------------------------------------------------
function ScorePredictorConsole({
  homeTeamName,
  homeLogo,
  awayTeamName,
  awayLogo,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  isLocked,
}: {
  homeTeamName: string;
  homeLogo: string | null;
  awayTeamName: string;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  setHomeScore: (val: number | null) => void;
  setAwayScore: (val: number | null) => void;
  isLocked: boolean;
}) {
  const quickSelects = [1, 2, 3, 4, 5];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Home Giant Stepper */}
      <div className="bg-gradient-to-b from-[#0f1922] via-[#0b0e14] to-[#07090d] p-5 rounded-2xl border border-cyan-500/15 flex flex-col items-center shadow-[0_0_25px_rgba(6,182,212,0.03)] hover:border-cyan-500/30 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <ApiTeamLogo name={homeTeamName} logo={homeLogo} size="sm" accent="cyan" />
          <p className="truncate font-mono text-sm font-black uppercase tracking-widest text-cyan-400">{homeTeamName}</p>
        </div>
        <div className="flex items-center w-full max-w-xs gap-3 mb-5">
          <button
            type="button"
            onClick={() => !isLocked && setHomeScore(Math.max(0, (homeScore ?? 0) - 1))}
            disabled={isLocked || homeScore === null || homeScore === 0}
            className="h-14 flex-1 rounded-xl bg-black/80 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all text-2xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
          >
            -
          </button>
          <div className="w-20 h-14 bg-black/90 border-2 border-cyan-500/20 rounded-xl flex items-center justify-center shadow-[inset_0_0_12px_rgba(34,211,238,0.08)]">
            <span className="font-mono text-3xl font-black text-white text-center w-full">{homeScore ?? "-"}</span>
          </div>
          <button
            type="button"
            onClick={() => !isLocked && setHomeScore(Math.min(20, (homeScore ?? 0) + 1))}
            disabled={isLocked}
            className="h-14 flex-1 rounded-xl bg-black/80 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_12px_rgba(34,211,238,0.2)] transition-all text-2xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
          >
            +
          </button>
        </div>
        {/* Quick Select Buttons */}
        <div className="flex w-full max-w-xs gap-2">
          {quickSelects.map((num) => (
            <button
              key={`home-quick-${num}`}
              type="button"
              onClick={() => !isLocked && setHomeScore(num)}
              disabled={isLocked}
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-extrabold transition-all cursor-pointer active:scale-95 disabled:opacity-20",
                homeScore === num
                  ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.15)] font-black"
                  : "bg-black/60 border-gray-900 text-gray-500 hover:border-cyan-500/30 hover:text-cyan-400"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Away Giant Stepper */}
      <div className="bg-gradient-to-b from-[#1c0f22] via-[#0f0b14] to-[#0d070f] p-5 rounded-2xl border border-magenta-500/15 flex flex-col items-center shadow-[0_0_25px_rgba(217,70,239,0.03)] hover:border-magenta-500/30 transition-all duration-300">
        <div className="flex items-center gap-2 mb-4">
          <p className="truncate font-mono text-sm font-black uppercase tracking-widest text-magenta-400">{awayTeamName}</p>
          <ApiTeamLogo name={awayTeamName} logo={awayLogo} size="sm" accent="magenta" />
        </div>
        <div className="flex items-center w-full max-w-xs gap-3 mb-5">
          <button
            type="button"
            onClick={() => !isLocked && setAwayScore(Math.max(0, (awayScore ?? 0) - 1))}
            disabled={isLocked || awayScore === null || awayScore === 0}
            className="h-14 flex-1 rounded-xl bg-black/80 border border-magenta-500/30 text-magenta-400 hover:border-magenta hover:bg-magenta/10 hover:shadow-[0_0_12px_rgba(217,70,239,0.2)] transition-all text-2xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
          >
            -
          </button>
          <div className="w-20 h-14 bg-black/90 border-2 border-magenta-500/20 rounded-xl flex items-center justify-center shadow-[inset_0_0_12px_rgba(217,70,239,0.08)]">
            <span className="font-mono text-3xl font-black text-white text-center w-full">{awayScore ?? "-"}</span>
          </div>
          <button
            type="button"
            onClick={() => !isLocked && setAwayScore(Math.min(20, (awayScore ?? 0) + 1))}
            disabled={isLocked}
            className="h-14 flex-1 rounded-xl bg-black/80 border border-magenta-500/30 text-magenta-400 hover:border-magenta hover:bg-magenta/10 hover:shadow-[0_0_12px_rgba(217,70,239,0.2)] transition-all text-2xl font-black flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-20 disabled:pointer-events-none"
          >
            +
          </button>
        </div>
        {/* Quick Select Buttons */}
        <div className="flex w-full max-w-xs gap-2">
          {quickSelects.map((num) => (
            <button
              key={`away-quick-${num}`}
              type="button"
              onClick={() => !isLocked && setAwayScore(num)}
              disabled={isLocked}
              className={cn(
                "flex h-11 flex-1 items-center justify-center rounded-lg border text-sm font-extrabold transition-all cursor-pointer active:scale-95 disabled:opacity-20",
                awayScore === num
                  ? "bg-magenta-500/20 border-magenta text-magenta-200 shadow-[0_0_10px_rgba(217,70,239,0.15)] font-black"
                  : "bg-black/60 border-gray-900 text-gray-500 hover:border-magenta-500/30 hover:text-magenta"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchResearchLinks({
  matchHref,
  aiInsightHref,
  hasAiInsight,
  labels,
}: {
  matchHref: string;
  aiInsightHref: string;
  hasAiInsight: boolean;
  labels: {
    title: string;
    description: string;
    match: string;
    aiInsight: string;
  };
}) {
  return (
    <Card className="overflow-hidden border border-cyan-500/20 bg-gradient-to-b from-[#101721] to-[#090b11] p-4 shadow-[0_0_30px_rgba(34,211,238,0.06)]">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-500/10 text-cyan-200">
          <CalendarClock size={18} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-black text-white">{labels.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">{labels.description}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <Link
          href={matchHref}
          className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-4 py-3 text-sm font-black text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)] transition hover:bg-cyan-300 hover:text-black"
        >
          <CalendarClock size={16} />
          {labels.match}
        </Link>
        {hasAiInsight ? (
          <Link
            href={aiInsightHref}
            className="flex items-center justify-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/15 px-4 py-3 text-sm font-black text-fuchsia-100 shadow-[0_0_18px_rgba(217,70,239,0.10)] transition hover:bg-fuchsia-300 hover:text-black"
          >
            <Brain size={16} />
            {labels.aiInsight}
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

function buildAiPredictionSuggestion({
  match,
  homePlayers,
  awayPlayers,
}: {
  match: PredictMatch;
  homePlayers: PredictPlayer[];
  awayPlayers: PredictPlayer[];
}) {
  const finishedH2H = (match.h2h ?? []).filter(
    (fixture) => fixture.score.home !== null && fixture.score.away !== null
  );

  if (finishedH2H.length === 0) {
    return buildFallbackAiSuggestion(match, homePlayers, awayPlayers);
  }

  const normalized = finishedH2H
    .map((fixture) => normalizeH2HFixtureForMatch(match, fixture))
    .filter((fixture): fixture is { homeGoals: number; awayGoals: number } => fixture !== null);

  if (normalized.length === 0) {
    return buildFallbackAiSuggestion(match, homePlayers, awayPlayers);
  }

  const totals = normalized.reduce<{
    homeGoals: number;
    awayGoals: number;
    homeWins: number;
    awayWins: number;
    draws: number;
  }>(
    (acc, fixture) => {
      acc.homeGoals += fixture.homeGoals;
      acc.awayGoals += fixture.awayGoals;
      if (fixture.homeGoals > fixture.awayGoals) acc.homeWins += 1;
      else if (fixture.homeGoals < fixture.awayGoals) acc.awayWins += 1;
      else acc.draws += 1;
      return acc;
    },
    { homeGoals: 0, awayGoals: 0, homeWins: 0, awayWins: 0, draws: 0 }
  );

  const sampleSize = normalized.length;
  const avgHomeGoals = totals.homeGoals / sampleSize;
  const avgAwayGoals = totals.awayGoals / sampleSize;
  const homeWinRate = totals.homeWins / sampleSize;
  const awayWinRate = totals.awayWins / sampleSize;
  const homeEdge = avgHomeGoals - avgAwayGoals + (homeWinRate - awayWinRate) * 1.25;

  let homeScore = clampPredictionScore(avgHomeGoals);
  let awayScore = clampPredictionScore(avgAwayGoals);

  if (Math.abs(homeEdge) < 0.35) {
    const drawGoals = clampPredictionScore((avgHomeGoals + avgAwayGoals) / 2);
    homeScore = drawGoals;
    awayScore = drawGoals;
  } else if (homeEdge > 0) {
    if (homeScore <= awayScore) {
      homeScore = Math.min(4, awayScore + 1);
    }
  } else if (awayScore <= homeScore) {
    awayScore = Math.min(4, homeScore + 1);
  }

  if (homeEdge > 0.9) {
    homeScore = Math.min(4, Math.max(homeScore, awayScore + 1));
  }
  if (homeEdge < -0.9) {
    awayScore = Math.min(4, Math.max(awayScore, homeScore + 1));
  }

  const totalGoals = homeScore + awayScore;
  const halfHomeScore = Math.min(homeScore, Math.floor(homeScore / 2) + (homeScore > awayScore ? 1 : 0));
  const halfAwayScore = Math.min(awayScore, Math.floor(awayScore / 2) + (awayScore > homeScore ? 1 : 0));

  const favoredPlayers = homeScore > awayScore ? homePlayers : awayScore > homeScore ? awayPlayers : homePlayers;
  const firstScorerPlayerId = totalGoals > 0 ? toPlayerSelectionValue(favoredPlayers[0]) : null;

  const confidence = resolveAiConfidence({
    sampleSize,
    homeEdge,
    drawShare: totals.draws / sampleSize,
  });

  return {
    homeScore,
    awayScore,
    halfHomeScore,
    halfAwayScore,
    firstScorerPlayerId,
    confidence,
    reasonTh: `AI แนะนำ ${match.home.name} ${homeScore}-${awayScore} ${match.away.name} จาก H2H ${sampleSize} นัดล่าสุด เฉลี่ย ${avgHomeGoals.toFixed(1)}-${avgAwayGoals.toFixed(1)}`,
    reasonEn: `AI suggests ${match.home.name} ${homeScore}-${awayScore} ${match.away.name} from the last ${sampleSize} H2H matches, averaging ${avgHomeGoals.toFixed(1)}-${avgAwayGoals.toFixed(1)}.`,
  };
}

function buildFallbackAiSuggestion(
  match: PredictMatch,
  homePlayers: PredictPlayer[],
  awayPlayers: PredictPlayer[]
) {
  const homeScore = 1;
  const awayScore = 1;

  return {
    homeScore,
    awayScore,
    halfHomeScore: 0,
    halfAwayScore: 0,
    firstScorerPlayerId: toPlayerSelectionValue(homePlayers[0] ?? awayPlayers[0] ?? null),
    confidence: "safe" as ConfidenceLevel,
    reasonTh: `ข้อมูลย้อนหลังยังไม่พอสำหรับ ${match.home.name} vs ${match.away.name} จึงแนะนำแบบระมัดระวังที่ ${homeScore}-${awayScore}`,
    reasonEn: `There is not enough historical data for ${match.home.name} vs ${match.away.name}, so the conservative suggestion is ${homeScore}-${awayScore}.`,
  };
}

function normalizeH2HFixtureForMatch(
  match: PredictMatch,
  fixture: PredictH2HFixture
) {
  const fixtureHomeGoals = fixture.score.home;
  const fixtureAwayGoals = fixture.score.away;
  if (fixtureHomeGoals === null || fixtureAwayGoals === null) return null;

  const currentHome = match.home.name.trim().toLowerCase();
  const currentAway = match.away.name.trim().toLowerCase();
  const fixtureHome = fixture.home.name.trim().toLowerCase();
  const fixtureAway = fixture.away.name.trim().toLowerCase();

  if (fixtureHome === currentHome && fixtureAway === currentAway) {
    return { homeGoals: fixtureHomeGoals, awayGoals: fixtureAwayGoals };
  }

  if (fixtureHome === currentAway && fixtureAway === currentHome) {
    return { homeGoals: fixtureAwayGoals, awayGoals: fixtureHomeGoals };
  }

  return null;
}

function clampPredictionScore(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(0, Math.min(4, Math.round(value)));
}

function toPlayerSelectionValue(player: PredictPlayer | null | undefined) {
  if (!player) return null;
  return player.id !== null ? String(player.id) : player.name;
}

function resolveAiConfidence({
  sampleSize,
  homeEdge,
  drawShare,
}: {
  sampleSize: number;
  homeEdge: number;
  drawShare: number;
}) {
  const strength = Math.abs(homeEdge);

  if (sampleSize >= 4 && strength >= 1.2 && drawShare < 0.4) {
    return "bold" as ConfidenceLevel;
  }

  if (sampleSize >= 2 && strength >= 0.55) {
    return "confident" as ConfidenceLevel;
  }

  return "safe" as ConfidenceLevel;
}

// ----------------------------------------------------
// Confidence Selector cards
// ----------------------------------------------------
function ConfidenceCards({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const cardDetails: Record<string, { desc: string; tone: "cyan" | "gold" | "magenta"; badge: string }> = {
    safe: {
      desc: "เสี่ยงต่ำ แต้มคูณปกติ เหมาะกับคู่แข่งสายสูสีที่เดาทางยาก",
      tone: "cyan",
      badge: "x1.0",
    },
    confident: {
      desc: "มั่นใจปานกลาง โบนัสแต้มคูณ 1.5 หากทายผลถูกเป๊ะ",
      tone: "gold",
      badge: "x1.5",
    },
    bold: {
      desc: "เสี่ยงสูงจัดเต็ม ดับเบิ้ลแต้มคูณ 2.0 ลุ้นรางวัลใหญ่สะใจ",
      tone: "magenta",
      badge: "x2.0",
    },
  };

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
      {options.map((option) => {
        const isSelected = value === option.value;
        const details = cardDetails[option.value];
        
        return (
          <button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex flex-col p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden",
              isSelected
                ? details.tone === "cyan"
                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_18px_rgba(34,211,238,0.12)]"
                  : details.tone === "gold"
                    ? "border-amber-400 bg-amber-950/20 shadow-[0_0_18px_rgba(245,158,11,0.12)]"
                    : "border-magenta-400 bg-magenta-950/20 shadow-[0_0_18px_rgba(217,70,239,0.12)]"
                : "border-gray-800 bg-[#08080d] hover:border-gray-700"
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1 w-full">
              <span className={cn(
                "text-sm font-extrabold tracking-wide sm:text-base",
                isSelected
                  ? details.tone === "cyan" ? "text-cyan-300" : details.tone === "gold" ? "text-amber-300" : "text-magenta-300"
                  : "text-gray-300"
              )}>
                {option.label}
              </span>
              <span className={cn(
                "rounded px-2 py-0.5 text-xs font-black uppercase tracking-wider",
                isSelected
                  ? details.tone === "cyan" 
                    ? "bg-cyan-400 text-black" 
                    : details.tone === "gold" 
                      ? "bg-amber-400 text-black" 
                      : "bg-magenta-400 text-black"
                  : "bg-gray-800 text-gray-400"
              )}>
                {details.badge}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-gray-400">
              {details.desc}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ----------------------------------------------------
// Boost Toggle Button
// ----------------------------------------------------
function BoostToggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-all cursor-pointer",
        checked
          ? "border-amber-300/50 bg-amber-400/10 shadow-[0_0_16px_rgba(245,158,11,0.08)]"
          : "border-gray-800 bg-[#08080d] hover:border-gray-700"
      )}
    >
      <span className="min-w-0">
        <span className="block text-base font-bold tracking-wide text-white">{label}</span>
        <span className="mt-1 block text-sm font-medium leading-relaxed text-gray-400">{description}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200",
          checked ? "border-amber-300 bg-amber-400" : "border-gray-700 bg-gray-950"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white transition-transform duration-200 shadow-sm",
            checked ? "translate-x-5" : "translate-x-0.5"
          )}
        />
      </span>
    </button>
  );
}

function mergeScoringRules(rules?: ScoringRules | null) {
  return {
    resultTiers: {
      exact: { ...DEFAULT_SCORING_RULES.resultTiers.exact, ...rules?.resultTiers?.exact },
      goalDiff: { ...DEFAULT_SCORING_RULES.resultTiers.goalDiff, ...rules?.resultTiers?.goalDiff },
      result: { ...DEFAULT_SCORING_RULES.resultTiers.result, ...rules?.resultTiers?.result },
    },
    bonuses: {
      ...DEFAULT_SCORING_RULES.bonuses,
      ...rules?.bonuses,
    },
    confidenceMultipliers: {
      safe: {
        ...DEFAULT_SCORING_RULES.confidenceMultipliers.safe,
        ...rules?.confidenceMultipliers?.safe,
      },
      confident: {
        ...DEFAULT_SCORING_RULES.confidenceMultipliers.confident,
        ...rules?.confidenceMultipliers?.confident,
      },
      bold: {
        ...DEFAULT_SCORING_RULES.confidenceMultipliers.bold,
        ...rules?.confidenceMultipliers?.bold,
      },
    },
    boost: { ...DEFAULT_SCORING_RULES.boost, ...rules?.boost },
    streak: { ...DEFAULT_SCORING_RULES.streak, ...rules?.streak },
    formula: { ...DEFAULT_SCORING_RULES.formula, ...rules?.formula },
  };
}

function getConfidenceMultiplier(
  confidence: ConfidenceLevel,
  rules: ReturnType<typeof mergeScoringRules>
) {
  return rules.confidenceMultipliers[confidence].multiplier ?? 1;
}

function PredictionSection({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 border border-gray-800 bg-[#12121a]/85 backdrop-blur-md">
      <div className="mb-4 flex items-start gap-3 border-b border-gray-800/40 pb-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-500/25 bg-cyan-950/20 text-cyan-400">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-wide text-white">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-normal text-gray-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}

// ----------------------------------------------------
// Player picker component
// ----------------------------------------------------
function PlayerPickerComponent({
  label,
  home,
  away,
  value,
  onChange,
  locale,
  homePlayers,
  awayPlayers,
  loadingHome,
  loadingAway,
}: {
  label: string;
  home: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  away: {
    id: number | string | null;
    name: string;
    logo: string | null;
    players: PredictPlayer[];
    colors?: {
      primary: string | null;
      number: string | null;
      border: string | null;
    } | null;
  };
  value: string | null;
  onChange: (value: string | null) => void;
  locale: string;
  homePlayers: PredictPlayer[];
  awayPlayers: PredictPlayer[];
  loadingHome: boolean;
  loadingAway: boolean;
}) {
  const selectedPlayer = findPlayerById({ home: { players: homePlayers }, away: { players: awayPlayers } }, value);

  // Team Selection State (Home by default, or Away if away player is selected)
  const isSelectedPlayerAway = awayPlayers.some(p => String(p.id ?? p.name) === value);
  const [selectedTeam, setSelectedTeam] = useState<"home" | "away">(isSelectedPlayerAway ? "away" : "home");

  // Position classifications and search filters
  const [homeSearch, setHomeSearch] = useState("");
  const [awaySearch, setAwaySearch] = useState("");

  const searchPlaceholder = locale === "th" ? "ค้นหาชื่อผู้เล่น..." : "Search player name...";

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-base font-bold tracking-wide text-white">{label}</p>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="truncate rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300 transition-all hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 cursor-pointer"
          >
            {selectedPlayer?.name ?? value} ✕
          </button>
        )}
      </div>

      {/* Futuristic Tactical Pitch HUD Display */}
      <div className="relative w-full h-32 bg-[#0c1e18] border border-emerald-950/40 rounded-xl overflow-hidden mb-4 select-none">
        {/* Pitch grass grid lines */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_50%,rgba(16,185,129,0.2)_50%),linear-gradient(rgba(16,185,129,0.2)_50%,transparent_50%)] bg-[size:20px_20px]" />
        {/* Pitch white lines */}
        <div className="absolute inset-2 border border-white/5 rounded-lg pointer-events-none" />
        <div className="absolute inset-y-2 left-1/2 w-px bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/5 rounded-full pointer-events-none" />
        <div className="absolute top-1/2 left-2 -translate-y-1/2 w-4 h-12 border-y border-r border-white/5 pointer-none" />
        <div className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-12 border-y border-l border-white/5 pointer-none" />
        
        {/* Selected Scorer Pitch Overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-3">
          {selectedPlayer ? (
            <div className="flex flex-col items-center animate-slide-up text-center">
              {(() => {
                const isHome = homePlayers.some(p => String(p.id ?? p.name) === value);
                const kitColors = isHome ? home.colors : away.colors;
                const style = kitColors && kitColors.primary ? {
                  backgroundColor: `#${kitColors.primary}`,
                  color: kitColors.number ? `#${kitColors.number}` : "#000000",
                  borderColor: kitColors.border ? `#${kitColors.border}` : `#${kitColors.primary}`,
                  borderWidth: "2px",
                  borderStyle: "solid"
                } : {};
                
                return (
                  <span 
                    style={style}
                    className={cn(
                      "mb-1.5 flex h-9 w-9 items-center justify-center rounded-full font-mono text-sm font-black shadow-lg animate-pulse",
                      !kitColors?.primary && (isHome ? "bg-cyan-400 text-black animate-pulse" : "bg-magenta-400 text-black animate-pulse")
                    )}
                  >
                    {selectedPlayer.number ?? "?"}
                  </span>
                );
              })()}
              <p className="text-xs font-black uppercase tracking-widest text-emerald-400">TACTICAL GOALSCORER SELECTED</p>
              <p className="text-sm font-black text-white sm:text-base">{selectedPlayer.name}</p>
            </div>
          ) : (
            <div className="text-center opacity-40">
              <HelpCircle className="mx-auto mb-1 text-gray-500" size={18} />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">NO SCORER ASSIGNED</p>
              <p className="text-xs font-medium text-gray-500 sm:text-sm">Click on any player in the squads below to predict first scorer</p>
            </div>
          )}
        </div>
      </div>

      {/* Team Tabs Selector */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-black/40 border border-gray-900 mb-3.5">
        <button
          type="button"
          onClick={() => setSelectedTeam("home")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-w-0",
            selectedTeam === "home"
              ? "bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.08)]"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          )}
        >
          <ApiTeamLogo name={home.name} logo={home.logo} size="sm" accent="cyan" />
          <span className="truncate max-w-full">{home.name}</span>
        </button>
        
        <button
          type="button"
          onClick={() => setSelectedTeam("away")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1 rounded-lg py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer min-w-0",
            selectedTeam === "away"
              ? "bg-magenta/10 border border-magenta/30 text-magenta shadow-[0_0_15px_rgba(217,70,239,0.08)]"
              : "text-gray-500 hover:text-gray-300 border border-transparent"
          )}
        >
          <ApiTeamLogo name={away.name} logo={away.logo} size="sm" accent="magenta" />
          <span className="truncate max-w-full">{away.name}</span>
        </button>
      </div>

      {/* Roster Column */}
      <div className="w-full">
        <div className={selectedTeam === "home" ? "block" : "hidden"} aria-hidden={selectedTeam !== "home"}>
          <PlayerColumn 
            team={{ ...home, players: homePlayers }} 
            value={value} 
            onChange={onChange} 
            tone="cyan" 
            searchQuery={homeSearch}
            onSearchChange={setHomeSearch}
            searchPlaceholder={searchPlaceholder}
            loading={loadingHome}
          />
        </div>
        <div className={selectedTeam === "away" ? "block" : "hidden"} aria-hidden={selectedTeam !== "away"}>
          <PlayerColumn 
            team={{ ...away, players: awayPlayers }} 
            value={value} 
            onChange={onChange} 
            tone="magenta" 
            searchQuery={awaySearch}
            onSearchChange={setAwaySearch}
            searchPlaceholder={searchPlaceholder}
            loading={loadingAway}
          />
        </div>
      </div>
    </div>
  );
}

const PlayerPicker = memo(PlayerPickerComponent);

function PlayerColumn({
  team,
  value,
  onChange,
  tone,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  loading,
}: {
  team: { name: string; logo: string | null; players: PredictPlayer[] };
  value: string | null;
  onChange: (value: string) => void;
  tone: "cyan" | "magenta";
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  loading?: boolean;
}) {
  // Categorize player position dynamically based on squad numbers or indexing
  const getPlayerPosition = (player: PredictPlayer, index: number) => {
    if (player.number) {
      if (player.number === 1) return { key: "GK", label: "GKP" };
      if (player.number >= 2 && player.number <= 5) return { key: "DF", label: "DEF" };
      if (player.number >= 6 && player.number <= 8) return { key: "MF", label: "MID" };
      return { key: "FW", label: "FWD" };
    }
    if (index === 0) return { key: "GK", label: "GKP" };
    if (index >= 1 && index <= 4) return { key: "DF", label: "DEF" };
    if (index >= 5 && index <= 8) return { key: "MF", label: "MID" };
    return { key: "FW", label: "FWD" };
  };

  // Filter roster by name search
  const filteredPlayers = team.players.filter((p) => {
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  return (
    <div className="rounded-xl border border-gray-800 bg-[#08080d]/80 p-3 flex flex-col min-w-0">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ApiTeamLogo
            name={team.name}
            logo={team.logo}
            size="sm"
            accent={tone}
          />
          <p className="truncate text-sm font-bold text-white">{team.name}</p>
        </div>
        <span className="shrink-0 font-mono text-xs font-semibold text-gray-500">
          {filteredPlayers.length} / {team.players.length}
        </span>
      </div>

      {/* Roster Search bar */}
      <div className="relative mb-2">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            "h-10 w-full rounded-lg border bg-black/45 pl-8 pr-7 text-sm text-gray-300 outline-none transition-all placeholder-gray-600",
            tone === "cyan" 
              ? "border-gray-800/80 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/40" 
              : "border-gray-800/80 focus:border-magenta-500/40 focus:ring-1 focus:ring-magenta-500/40"
          )}
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-sm text-gray-500 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Scrollable list of players */}
      <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className={cn(
                "group flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all w-full relative overflow-hidden bg-black/45 shadow-[inset_0_0_8px_rgba(255,255,255,0.02)]",
                tone === "cyan" ? "border-cyan-950/40" : "border-magenta-950/40"
              )}
            >
              {/* Shimmer absolute layer */}
              <div className="absolute inset-0 animate-shimmer opacity-80" />
              
              {/* Left Side: Jersey and Name skeleton */}
              <div className="flex items-center gap-2.5 min-w-0 relative z-10">
                <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                <div className="h-3.5 w-24 bg-gray-800/80 rounded relative overflow-hidden">
                  <div className="absolute inset-0 animate-shimmer opacity-60" />
                </div>
              </div>
              
              {/* Right Side: Position skeleton */}
              <div className="h-4.5 w-10 bg-gray-900/95 rounded border border-gray-900 relative overflow-hidden z-10 shrink-0">
                <div className="absolute inset-0 animate-shimmer opacity-55" />
              </div>
            </div>
          ))
        ) : filteredPlayers.length === 0 ? (
          <p className="col-span-1 py-6 text-center text-sm font-medium italic text-gray-500">
            No players found
          </p>
        ) : (
          filteredPlayers.map((player, index) => {
            const isSelected = value === String(player.id ?? player.name);
            const pos = getPlayerPosition(player, index);
            return (
              <button
                key={`${player.id ?? player.name}-${index}`}
                onClick={() => onChange(String(player.id ?? player.name))}
                className={cn(
                  "group flex items-center justify-between rounded-lg border px-3 py-2 transition-all cursor-pointer hover:bg-white/[0.02] active:scale-[0.98] w-full gap-3",
                  isSelected
                    ? tone === "cyan"
                      ? "border-cyan-400 bg-cyan-500/10 text-cyan-100 shadow-[0_0_12px_rgba(34,211,238,0.12)]"
                      : "border-magenta bg-magenta/10 text-white shadow-[0_0_12px_rgba(217,70,239,0.12)]"
                    : "border-gray-900 bg-black/35 text-gray-400 hover:border-gray-700"
                )}
              >
                {/* Left Side: Number and Name */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-black transition-all",
                      isSelected
                        ? tone === "cyan"
                          ? "bg-cyan-400 text-black"
                          : "bg-magenta text-black"
                        : tone === "cyan"
                          ? "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20"
                          : "bg-magenta/20 text-magenta border border-magenta/25"
                    )}
                  >
                    {player.number ?? index + 1}
                  </span>
                  <span className={cn(
                    "truncate text-sm font-bold leading-tight transition-colors",
                    isSelected ? "text-white" : "text-gray-300 group-hover:text-white"
                  )}>
                    {player.name}
                  </span>
                </div>
                
                {/* Right Side: Position */}
                <span className={cn(
                  "shrink-0 rounded border px-2 py-0.5 font-mono text-xs font-black uppercase tracking-wider transition-all",
                  isSelected
                    ? tone === "cyan"
                      ? "bg-cyan-400/20 border-cyan-400 text-cyan-200"
                      : "bg-magenta/20 border-magenta text-white"
                    : tone === "cyan"
                      ? "bg-black/40 border-gray-900 text-gray-500 group-hover:text-cyan-400/80 group-hover:border-cyan-500/10"
                      : "bg-black/40 border-gray-900 text-gray-500 group-hover:text-magenta group-hover:border-magenta/20"
                )}>
                  {pos.label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function FormulaValue({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800/80 bg-black/30 px-2.5 py-2">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className={cn("mt-1 font-mono text-sm font-black text-white", tone)}>
        {value}
      </p>
    </div>
  );
}

function ConfirmMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800/80 bg-black/30 px-3 py-2.5">
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className={cn("mt-1 font-mono text-base font-black text-white", tone)}>
        {value}
      </p>
    </div>
  );
}

function ConfirmDetailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-[#0a0a0f] px-3.5 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>
        <div className="min-w-0 text-right text-sm font-semibold text-white">
          {children}
        </div>
      </div>
    </div>
  );
}

function OutcomeRow({
  label,
  description,
  points,
  tone,
}: {
  label: string;
  description: string;
  points: number;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800/80 bg-black/30 px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("text-sm font-black uppercase tracking-wide text-white", tone)}>
            {label}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-gray-500">
            {description}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-wider text-gray-500">points</p>
          <p className={cn("font-mono text-base font-black text-white", tone)}>
            {points.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

function TierRow({
  label,
  description,
  bonus,
  tone,
}: {
  label: string;
  description: string;
  bonus: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-800/80 bg-black/30 px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className={cn("text-sm font-black uppercase tracking-wide text-white", tone)}>
          {label}
        </p>
        <span className={cn("font-mono text-sm font-black", tone)}>{bonus}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function findPlayerById(
  match: {
    home: { players: PredictPlayer[] };
    away: { players: PredictPlayer[] };
  },
  playerId: string | null
) {
  if (!playerId) return null;
  return [...match.home.players, ...match.away.players].find(
    (player) => String(player.id ?? player.name) === playerId
  );
}

function formatNullableNumber(value: number | null) {
  return value === null ? "-" : String(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toNullableNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}
