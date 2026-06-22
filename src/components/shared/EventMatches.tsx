"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import {
  getVisibleEventMatches,
  parseEventMatchDate,
} from "@/lib/event-match-visibility";
import { apiGetRaw, isAuthSessionExpiredError } from "@/lib/api-client";
import { Modal } from "@/components/ui/Modal";

type EventMatch = {
  id: string;
  homeTeam: string | { name?: string | null; logo?: string | null };
  awayTeam: string | { name?: string | null; logo?: string | null };
  homeLogo?: string | null;
  awayLogo?: string | null;
  date: string;
  status: "upcoming" | "live" | "finished" | "predicted";
  predictedScore?: string;
  actualScore?: string;
  isPredicted?: boolean;
};

type Props = {
  matches: EventMatch[];
};

type PredictableMatchesResponse = {
  data?: PredictableMatchApiItem[];
};

type PredictionHistoryApiResponse = {
  data?: Record<string, unknown>[];
};

type PredictableMatchApiItem = {
  provider_id?: number | string | null;
  hasPredicted?: boolean | null;
  has_predicted?: boolean | null;
  alreadyPredicted?: boolean | null;
  already_predicted?: boolean | null;
  userPrediction?: unknown;
  user_prediction?: unknown;
  prediction?: unknown;
};

type PredictionReceiptResult = "correct" | "incorrect" | "partial" | "pending" | "void";

export function EventMatches({ matches }: Props) {
  const t = useTranslations("events");
  const predictionT = useTranslations("prediction");
  const predictionFormT = useTranslations("predictionForm");
  const { locale } = useParams<{ locale: string }>();
  const format = useFormatter();
  const [now] = useState(() => Date.now());
  const [selectedMatch, setSelectedMatch] = useState<EventMatch | null>(null);
  const [predictionByMatchId, setPredictionByMatchId] = useState(
    () => new Map<string, PredictableMatchApiItem>()
  );
  const [predictionDetailByMatchId, setPredictionDetailByMatchId] = useState(
    () => new Map<string, Record<string, unknown>>()
  );
  const hydratedMatches = useMemo(
    () =>
      matches.map((match) => {
        const prediction = predictionByMatchId.get(String(match.id));
        if (!prediction) return match;

        return {
          ...match,
          status: match.status === "live" ? "live" : "predicted",
          isPredicted: true,
          predictedScore:
            match.predictedScore ??
            readPredictionScore(
              prediction.userPrediction,
              prediction.user_prediction,
              prediction.prediction
            ),
        } satisfies EventMatch;
      }),
    [matches, predictionByMatchId]
  );
  const upcomingMatches = getVisibleEventMatches(hydratedMatches, now);

  useEffect(() => {
    let active = true;

    const hydratePredictionStatus = async () => {
      try {
        const response = await apiGetRaw<PredictableMatchesResponse>(
          "/predictable-matches?excludePredicted=false",
          { locale }
        );
        if (!active || !Array.isArray(response.data)) return;

        const nextPredictionByMatchId = new Map<string, PredictableMatchApiItem>();
        for (const item of response.data) {
          const id = item.provider_id == null ? null : String(item.provider_id);
          if (!id || !hasPredicted(item)) continue;
          nextPredictionByMatchId.set(id, item);
        }

        setPredictionByMatchId(nextPredictionByMatchId);
      } catch (error) {
        if (!isAuthSessionExpiredError(error)) {
          console.warn("[events] unable to hydrate match prediction status", error);
        }
      }
    };

    void hydratePredictionStatus();

    return () => {
      active = false;
    };
  }, [locale]);

  useEffect(() => {
    if (!selectedMatch || predictionDetailByMatchId.has(String(selectedMatch.id))) return;

    let active = true;

    const loadPredictionDetail = async () => {
      try {
        const response = await apiGetRaw<PredictionHistoryApiResponse>(
          "/predictions?page=1&limit=50",
          { locale }
        );
        if (!active || !Array.isArray(response.data)) return;

        const nextDetails = new Map(predictionDetailByMatchId);
        for (const item of response.data) {
          const matchId = readString(
            item.fixtureId,
            item.fixture_id,
            item.matchId,
            item.match_id
          );
          if (!matchId) continue;
          nextDetails.set(matchId, item);
        }
        setPredictionDetailByMatchId(nextDetails);
      } catch (error) {
        if (!isAuthSessionExpiredError(error)) {
          console.warn("[events] unable to load prediction receipt detail", error);
        }
      }
    };

    void loadPredictionDetail();

    return () => {
      active = false;
    };
  }, [locale, predictionDetailByMatchId, selectedMatch]);

  if (!hydratedMatches || hydratedMatches.length === 0 || upcomingMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0a0f18] p-10 text-center">
        <Target size={32} className="mx-auto mb-3 text-gray-600" />
        <p className="text-sm font-semibold text-gray-400">
          {hydratedMatches?.length ? t("matches.noUpcoming") : t("matches.empty")}
        </p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = parseEventMatchDate(dateStr);
    if (!d) return "-";

    return format.dateTime(d, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const predictedCount = upcomingMatches.filter((m) => isPredictedMatch(m)).length;
  const totalCount = upcomingMatches.length;
  const selectedPrediction = selectedMatch
    ? predictionDetailByMatchId.get(String(selectedMatch.id)) ??
      predictionByMatchId.get(String(selectedMatch.id))
    : undefined;

  return (
    <div className="space-y-4">
      {/* Progress banner */}
      <div className="rounded-2xl border border-cyan-400/15 bg-[#0a0f18] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
              <Target size={18} className="text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{t("matches.title")}</h2>
              <p className="mt-1 text-sm text-gray-400">
                {t("matches.upcomingProgress", { done: predictedCount, total: totalCount })}
              </p>
            </div>
          </div>
          {/* Progress bar */}
          <div className="hidden w-32 sm:block">
            <div className="h-2 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-green-400 transition-all"
                style={{ width: `${totalCount > 0 ? (predictedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] font-bold text-gray-500">
              {totalCount > 0 ? Math.round((predictedCount / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Match list */}
      <div className="grid gap-3">
        {upcomingMatches.map((match) => (
          <div
            key={match.id}
            className={
              isPredictedMatch(match)
                ? "rounded-2xl border border-amber-300/25 bg-amber-300/[0.055] p-4 shadow-[0_0_22px_rgba(245,158,11,0.08)] transition-colors hover:border-amber-300/35 hover:bg-amber-300/[0.075]"
                : "rounded-2xl border border-white/8 bg-[#0d1118] p-4 transition-colors hover:border-cyan-400/20 hover:bg-[#111820]"
            }
          >
            <div className="space-y-4 lg:space-y-0">
              <div className="flex min-h-8 flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-3 lg:hidden">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Clock size={14} className="text-cyan-300" />
                  <span>{formatDate(match.date)}</span>
                </div>
                {match.predictedScore ? (
                  <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-mono text-xs font-bold text-amber-200">
                    {t("matches.yourPrediction")}: {match.predictedScore}
                  </span>
                ) : null}
              </div>

              <div className="grid gap-4 lg:grid-cols-[150px_minmax(0,1fr)_72px_minmax(0,1fr)_180px] lg:items-center">
                <div className="hidden min-w-0 lg:block">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Clock size={14} className="text-cyan-300" />
                    <span>{formatDate(match.date)}</span>
                  </div>
                  {match.predictedScore ? (
                    <div className="mt-2 truncate rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 font-mono text-[11px] font-bold text-amber-200">
                      {match.predictedScore}
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-3 lg:contents">
                  <TeamBadge
                    name={getTeamName(match.homeTeam)}
                    logo={getTeamLogo(match.homeTeam, match.homeLogo)}
                    align="right"
                  />

                  <div className="grid h-11 w-16 place-items-center justify-self-center rounded-xl border border-white/10 bg-black/25 text-xs font-black text-gray-500">
                    vs
                  </div>

                  <TeamBadge
                    name={getTeamName(match.awayTeam)}
                    logo={getTeamLogo(match.awayTeam, match.awayLogo)}
                  />
                </div>

                <div className="flex items-center justify-stretch lg:justify-center">
                  {isPredictedMatch(match) ? (
                    <button
                      type="button"
                      onClick={() => setSelectedMatch(match)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/35 bg-amber-300/10 px-5 text-sm font-black text-amber-100 shadow-[0_0_22px_rgba(245,158,11,0.12)] transition-colors hover:border-amber-300/55 hover:bg-amber-300/15 lg:w-36"
                    >
                      <CheckCircle2 size={17} className="text-amber-300" />
                      {t("matches.predicted")}
                    </button>
                  ) : (
                    <div className="w-full lg:w-36">
                      <Link
                        href={`/${locale}/predict/${match.id}`}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 text-sm font-black text-black transition-colors hover:bg-cyan-400"
                      >
                        <Target size={16} />
                        {t("matches.predictNow")}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <PredictionReceiptModal
        match={selectedMatch}
        prediction={selectedPrediction}
        formatDate={formatDate}
        onClose={() => setSelectedMatch(null)}
        labels={{
          receipt: t("matches.receipt"),
          yourPrediction: t("matches.yourPrediction"),
          predicted: t("matches.predicted"),
          match: t("matches.match"),
          status: t("matches.status"),
          actualResult: t("matches.actualResult"),
          points: t("matches.points"),
          confidence: t("matches.confidence"),
          boost: t("matches.boost"),
          halfTime: t("matches.halfTime"),
          totalGoals: t("matches.totalGoals"),
          firstScorer: t("matches.firstScorer"),
          extraPicks: t("matches.extraPicks"),
          result: predictionT("actualResult"),
          resultType: t("matches.resultType"),
          pointsWagered: predictionFormT("payload.pointsWagered"),
          combo: predictionT("combo"),
          streak: predictionT("streak"),
          submittedAt: predictionT("submittedAt"),
          lockedAt: predictionT("lockedAt"),
          timeline: t("matches.timeline"),
          summary: t("matches.summary"),
          on: t("matches.on"),
          off: t("matches.off"),
          close: t("matches.close"),
          resultLabels: {
            correct: predictionT("correct"),
            incorrect: predictionT("incorrect"),
            partial: predictionT("partial"),
            pending: predictionT("pending"),
            void: predictionT("void"),
          },
        }}
      />
    </div>
  );
}

function getTeamName(team: EventMatch["homeTeam"]) {
  if (typeof team === "string") return team || "-";
  return team?.name || "-";
}

function getTeamLogo(team: EventMatch["homeTeam"], logo?: string | null) {
  if (logo) return logo;
  if (typeof team !== "string") return team.logo || null;
  return null;
}

function TeamBadge({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo?: string | null;
  align?: "left" | "right";
}) {
  const logoNode = (
    <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="h-7 w-7 object-contain" loading="lazy" />
      ) : (
        <span className="text-xs font-black text-gray-500">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
  const nameNode = (
    <span className="min-w-0 truncate text-sm font-black text-white">{name}</span>
  );

  return (
    <div
      className={
        align === "right"
          ? "flex min-w-0 items-center justify-end gap-2 text-right"
          : "flex min-w-0 items-center justify-start gap-2"
      }
    >
      {align === "right" ? nameNode : logoNode}
      {align === "right" ? logoNode : nameNode}
    </div>
  );
}

function PredictionReceiptModal({
  match,
  prediction,
  formatDate,
  onClose,
  labels,
}: {
  match: EventMatch | null;
  prediction?: unknown;
  formatDate: (dateStr: string) => string;
  onClose: () => void;
  labels: {
    receipt: string;
    yourPrediction: string;
    predicted: string;
    match: string;
    status: string;
    actualResult: string;
    points: string;
    confidence: string;
    boost: string;
    halfTime: string;
    totalGoals: string;
    firstScorer: string;
    extraPicks: string;
    result: string;
    resultType: string;
    pointsWagered: string;
    combo: string;
    streak: string;
    submittedAt: string;
    lockedAt: string;
    timeline: string;
    summary: string;
    on: string;
    off: string;
    close: string;
    resultLabels: Record<PredictionReceiptResult, string>;
  };
}) {
  if (!match) return null;

  const receipt = getPredictionReceipt(match, prediction);
  const homeName = getTeamName(match.homeTeam);
  const awayName = getTeamName(match.awayTeam);

  return (
    <Modal
      open={Boolean(match)}
      onClose={onClose}
      className="w-[94vw] max-w-[980px] border-cyan-500/25 bg-[#060913] p-0 shadow-2xl shadow-cyan-950/30 xl:max-w-[1040px]"
    >
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-5 grid gap-3 border-b border-white/10 pb-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">
              {labels.receipt}
            </p>
            <p className="mt-2 text-xs font-semibold text-gray-500">{formatDate(match.date)}</p>
            <h3 className="mt-2 text-xl font-black leading-snug text-white sm:text-2xl">
              {homeName} vs {awayName}
            </h3>
          </div>
          <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-black ${getReceiptResultClass(receipt.result)}`}>
            <CheckCircle2 size={15} className="text-amber-300" />
            {labels.resultLabels[receipt.result]}
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(360px,1.05fr)_minmax(320px,0.95fr)] lg:items-start">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-4 lg:p-5">
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-5 text-center shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200/80">
                {labels.yourPrediction}
              </p>
              <p className="mt-2 font-mono text-5xl font-black leading-none text-cyan-300">
                {receipt.predictedScore}
              </p>
            </div>

            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_54px_minmax(0,1fr)] items-center gap-3">
              <ReceiptTeam
                name={homeName}
                logo={getTeamLogo(match.homeTeam, match.homeLogo)}
                align="right"
              />
              <div className="grid h-12 w-12 place-items-center justify-self-center rounded-2xl border border-white/10 bg-black/30 text-xs font-black text-gray-500">
                VS
              </div>
              <ReceiptTeam
                name={awayName}
                logo={getTeamLogo(match.awayTeam, match.awayLogo)}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <ReceiptMetric
                label={labels.yourPrediction}
                value={receipt.predictedScore}
                valueClassName="font-mono text-cyan-300"
              />
              <ReceiptMetric
                label={labels.actualResult}
                value={receipt.actualScore}
                valueClassName="font-mono text-white"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
                    {labels.summary}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-gray-300">
                    {labels.yourPrediction}:{" "}
                    <span className="font-mono text-white">{receipt.predictedScore}</span>
                    {" | "}
                    {labels.actualResult}:{" "}
                    <span className="font-mono text-white">{receipt.actualScore}</span>
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-gray-400">
                    {labels.result}:{" "}
                    <span className={getReceiptResultTextClass(receipt.result)}>
                      {labels.resultLabels[receipt.result]}
                    </span>
                  </p>
                </div>
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 text-center">
                  <span className="text-xs font-black text-emerald-200">{labels.points}</span>
                  <span className="font-mono text-2xl font-black text-emerald-300">
                    {receipt.points.replace("+", "")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              <ReceiptMetric
                label={labels.result}
                value={labels.resultLabels[receipt.result]}
                valueClassName={getReceiptResultTextClass(receipt.result)}
              />
              <ReceiptMetric label={labels.resultType} value={receipt.resultType} />
              <ReceiptMetric
                label={labels.points}
                value={receipt.points}
                valueClassName="text-emerald-300"
              />
              <ReceiptMetric label={labels.confidence} value={receipt.confidence} />
              <ReceiptMetric label={labels.boost} value={receipt.boost ? labels.on : labels.off} />
            </div>

            <div className="rounded-3xl border border-cyan-400/15 bg-cyan-400/[0.03] p-4">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-cyan-300">
                {labels.status}
              </p>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
                <ReceiptMetric label={labels.pointsWagered} value={receipt.pointsWagered} />
                <ReceiptMetric label={labels.combo} value={receipt.comboMultiplier} />
                <ReceiptMetric label={labels.streak} value={receipt.streakNumber} />
              </div>
            </div>

            <div className="rounded-3xl border border-fuchsia-400/15 bg-fuchsia-400/[0.03] p-4">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                {labels.extraPicks}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <ReceiptMetric label={labels.halfTime} value={receipt.halfTime} />
                <ReceiptMetric label={labels.totalGoals} value={receipt.totalGoals} />
                <ReceiptMetric label={labels.firstScorer} value={receipt.firstScorer} />
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <p className="mb-3 text-[11px] font-black uppercase tracking-[0.2em] text-gray-300">
                {labels.timeline}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <ReceiptMetric label={labels.submittedAt} value={receipt.createdAt} />
                <ReceiptMetric label={labels.lockedAt} value={receipt.lockedAt} />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-gray-200 transition-colors hover:border-cyan-400/40 hover:text-cyan-200 sm:w-auto"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ReceiptTeam({
  name,
  logo,
  align = "left",
}: {
  name: string;
  logo?: string | null;
  align?: "left" | "right";
}) {
  return (
    <div
      className={
        align === "right"
          ? "flex min-w-0 flex-col items-center gap-2 text-center md:items-end md:text-right"
          : "flex min-w-0 flex-col items-center gap-2 text-center md:items-start md:text-left"
      }
    >
      <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-8 w-8 object-contain" loading="lazy" />
        ) : (
          <span className="text-xs font-black text-gray-500">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
      </span>
      <span className="max-w-full text-center text-xs font-black leading-snug text-white sm:text-sm md:text-inherit">
        {name}
      </span>
    </div>
  );
}

function ReceiptMetric({
  label,
  value,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-[11px] font-bold text-gray-500">{label}</p>
      <p className={`mt-1.5 overflow-hidden text-ellipsis text-base font-black leading-snug ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function getPredictionReceipt(match: EventMatch, prediction?: unknown) {
  const predictionSource = readRecord(prediction);
  const predictionRecord = readFirstRecord(
    predictionSource?.userPrediction,
    predictionSource?.user_prediction,
    predictionSource?.prediction,
    prediction
  );
  const predictedScore =
    match.predictedScore ??
    readPredictionScore(
      predictionRecord,
      predictionSource?.userPrediction,
      predictionSource?.user_prediction,
      predictionSource?.prediction
    ) ??
    "-";
  const actualScore =
    match.actualScore ??
    readScore(
      predictionRecord?.actualScore,
      predictionRecord?.actual_score,
      predictionRecord?.actualResult,
      predictionRecord?.actual_result,
      predictionRecord
    ) ??
    "-";
  const points = readNumber(
    predictionRecord?.pointsEarned,
    predictionRecord?.points_earned,
    predictionRecord?.points,
    predictionRecord?.score,
    predictionRecord?.earnedPoints,
    predictionRecord?.earned_points
  );
  const result = mapPredictionReceiptResult(
    readString(
      predictionRecord?.status,
      predictionRecord?.result,
      predictionRecord?.outcome,
      predictionRecord?.predictionStatus,
      predictionRecord?.prediction_status
    )
  );
  const resultType = readString(
    predictionRecord?.resultType,
    predictionRecord?.result_type,
    predictionRecord?.scoreResultType,
    predictionRecord?.score_result_type
  );
  const createdAt = readString(
    predictionRecord?.createdAt,
    predictionRecord?.created_at,
    predictionRecord?.submittedAt,
    predictionRecord?.submitted_at
  );
  const lockedAt = readString(
    predictionRecord?.lockedAt,
    predictionRecord?.locked_at
  );
  const pointsWagered = readNumber(
    predictionRecord?.pointsWagered,
    predictionRecord?.points_wagered,
    predictionRecord?.wageredPoints,
    predictionRecord?.wagered_points
  );
  const comboMultiplier = readNumber(
    predictionRecord?.comboMultiplier,
    predictionRecord?.combo_multiplier
  );
  const streakNumber = readNumber(
    predictionRecord?.streakNumber,
    predictionRecord?.streak_number
  );
  const halfTime = readRecord(predictionRecord?.halfTime);
  const halfTimeSnake = readRecord(predictionRecord?.half_time);
  const halfTimeHome = readNumber(
    predictionRecord?.halfTimeHome,
    predictionRecord?.half_time_home,
    halfTime?.home,
    halfTimeSnake?.home
  );
  const halfTimeAway = readNumber(
    predictionRecord?.halfTimeAway,
    predictionRecord?.half_time_away,
    halfTime?.away,
    halfTimeSnake?.away
  );
  const totalGoals = readNumber(
    predictionRecord?.totalGoals,
    predictionRecord?.total_goals
  );
  const firstScorerRecord = readRecord(predictionRecord?.firstScorer);
  const firstScorerSnakeRecord = readRecord(predictionRecord?.first_scorer);
  const firstScorer = readString(
    predictionRecord?.firstScorerPlayerName,
    predictionRecord?.first_scorer_player_name,
    firstScorerRecord?.name,
    firstScorerSnakeRecord?.name,
    predictionRecord?.firstScorer,
    predictionRecord?.first_scorer
  );

  return {
    predictedScore,
    actualScore,
    points: points === null ? "-" : `+${points}`,
    result,
    resultType: formatReceiptResultType(resultType, result),
    confidence:
      formatReceiptConfidence(
        readString(predictionRecord?.confidenceLevel, predictionRecord?.confidence_level)
      ),
    boost: readBoolean(predictionRecord?.boostUsed, predictionRecord?.boost_used) ?? false,
    pointsWagered: pointsWagered === null ? "-" : String(pointsWagered),
    comboMultiplier: comboMultiplier === null ? "x1" : `x${comboMultiplier}`,
    streakNumber: streakNumber === null ? "0" : String(streakNumber),
    halfTime:
      halfTimeHome !== null && halfTimeAway !== null
        ? `${halfTimeHome}-${halfTimeAway}`
        : "-",
    totalGoals: totalGoals === null ? "-" : String(totalGoals),
    firstScorer: firstScorer ?? "-",
    createdAt: formatReceiptDate(createdAt),
    lockedAt: formatReceiptDate(lockedAt),
  };
}

function mapPredictionReceiptResult(status: string | null | undefined): PredictionReceiptResult {
  const normalized = String(status ?? "").trim().toLowerCase();

  if (normalized === "pending") return "pending";
  if (["won", "correct", "winner", "win"].includes(normalized)) return "correct";
  if (["partial", "partially_correct"].includes(normalized)) return "partial";
  if (["void", "cancelled", "canceled"].includes(normalized)) return "void";
  if (!normalized) return "pending";
  return "incorrect";
}

function formatReceiptResultType(
  value: string | null,
  result: PredictionReceiptResult
) {
  const normalized = value?.trim();
  if (!normalized) {
    if (result === "correct") return "ถูกต้อง";
    if (result === "partial") return "ถูกบางส่วน";
    if (result === "pending") return "รอดำเนินการ";
    if (result === "void") return "โมฆะ";
    return "ผิดทั้งหมด";
  }

  switch (normalized) {
    case "exact":
      return "สกอร์ตรง";
    case "goalDiff":
    case "goal_diff":
      return "ผลต่างประตูถูก";
    case "result":
      return "ผลแพ้ชนะถูก";
    case "wrong":
      return "ผิดทั้งหมด";
    default:
      return normalized.replaceAll("_", " ");
  }
}

function formatReceiptConfidence(value: string | null) {
  switch (value) {
    case "safe":
      return "ปลอดภัย";
    case "confident":
      return "มั่นใจ";
    case "bold":
      return "กล้าเสี่ยง";
    default:
      return value ?? "-";
  }
}

function formatReceiptDate(value: string | null) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("th-TH");
}

function getReceiptResultClass(result: PredictionReceiptResult) {
  switch (result) {
    case "correct":
      return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
    case "partial":
      return "border-amber-300/30 bg-amber-300/10 text-amber-100";
    case "pending":
      return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
    case "void":
      return "border-gray-400/30 bg-gray-400/10 text-gray-200";
    default:
      return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }
}

function getReceiptResultTextClass(result: PredictionReceiptResult) {
  switch (result) {
    case "correct":
      return "text-emerald-300";
    case "partial":
      return "text-amber-300";
    case "pending":
      return "text-cyan-300";
    case "void":
      return "text-gray-300";
    default:
      return "text-rose-300";
  }
}

function isPredictedMatch(match: EventMatch) {
  return match.status === "predicted" || match.isPredicted === true || Boolean(match.predictedScore);
}

function hasPredicted(item: PredictableMatchApiItem) {
  return (
    item.hasPredicted === true ||
    item.has_predicted === true ||
    item.alreadyPredicted === true ||
    item.already_predicted === true ||
    item.userPrediction !== null && item.userPrediction !== undefined ||
    item.user_prediction !== null && item.user_prediction !== undefined ||
    item.prediction !== null && item.prediction !== undefined
  );
}

function readPredictionScore(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    const firstArrayRecord = readFirstArrayRecord(value);
    if (firstArrayRecord) {
      const score = readPredictionScore(firstArrayRecord);
      if (score) return score;
    }
    if (typeof value !== "object" || value === null) continue;

    const record = value as Record<string, unknown>;
    const textScore = readString(
      record.predictedScore,
      record.predicted_score,
      record.scorePrediction,
      record.score_prediction,
      record.predictionScore,
      record.prediction_score
    );
    if (textScore) return textScore;

    const home = readNumber(
      record.home,
      record.homeScore,
      record.home_score,
      record.homeTeamScore,
      record.home_team_score,
      record.predictedHomeScore,
      record.predicted_home_score,
      record.predictionHomeScore,
      record.prediction_home_score
    );
    const away = readNumber(
      record.away,
      record.awayScore,
      record.away_score,
      record.awayTeamScore,
      record.away_team_score,
      record.predictedAwayScore,
      record.predicted_away_score,
      record.predictionAwayScore,
      record.prediction_away_score
    );

    if (home !== null && away !== null) return `${home}-${away}`;
  }

  return undefined;
}

function readScore(...values: unknown[]): string | undefined {
  for (const value of values) {
    const text = readString(value);
    if (text) return text;

    const firstArrayRecord = readFirstArrayRecord(value);
    if (firstArrayRecord) {
      const score = readScore(firstArrayRecord);
      if (score) return score;
    }

    const record = readRecord(value);
    const home = readNumber(
      record?.home,
      record?.homeScore,
      record?.home_score,
      record?.homeTeamScore,
      record?.home_team_score,
      record?.actualHomeScore,
      record?.actual_home_score
    );
    const away = readNumber(
      record?.away,
      record?.awayScore,
      record?.away_score,
      record?.awayTeamScore,
      record?.away_team_score,
      record?.actualAwayScore,
      record?.actual_away_score
    );
    if (home !== null && away !== null) return `${home}-${away}`;
  }

  return undefined;
}

function readFirstRecord(...values: unknown[]) {
  for (const value of values) {
    const record = readRecord(value);
    if (record) return record;

    const first = readFirstArrayRecord(value);
    if (first) return first;
  }

  return undefined;
}

function readFirstArrayRecord(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.map(readRecord).find(Boolean);
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }

  return null;
}

function readBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number" && Number.isFinite(value)) return value !== 0;
    if (typeof value === "string" && value.trim()) {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes", "on"].includes(normalized)) return true;
      if (["false", "0", "no", "off"].includes(normalized)) return false;
    }
  }

  return null;
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return null;
}
