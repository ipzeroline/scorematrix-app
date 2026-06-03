import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type AccuracyStat = {
  count: number;
  percentage: number;
};

export type ConfidenceAccuracyStat = {
  total: number;
  correct: number;
  accuracy: number;
};

export type StatsTrendPoint = {
  date: string;
  accuracy: number;
  points: number;
  predictions: number;
};

export type StatsLeagueBreakdown = {
  leagueId: string;
  leagueName: string;
  accuracy: number;
  predictions: number;
  points: number;
  correctCount: number;
};

export type StatsAccuracyResponse = {
  overall: {
    total: number;
    correct: number;
    accuracy: number;
  };
  byResultType: {
    exact: AccuracyStat;
    goalDiff: AccuracyStat;
    result: AccuracyStat;
    wrong: AccuracyStat;
  };
  byConfidence: {
    safe: ConfidenceAccuracyStat;
    confident: ConfidenceAccuracyStat;
    bold: ConfidenceAccuracyStat;
  };
  trend: StatsTrendPoint[];
  leagueBreakdown: StatsLeagueBreakdown[];
};

type StatsAccuracyApiPayload =
  | StatsAccuracyResponse
  | {
      data?: unknown;
      stats?: unknown;
      accuracy?: unknown;
      payload?: unknown;
      result?: unknown;
    };

export const EMPTY_STATS_ACCURACY: StatsAccuracyResponse = {
  overall: {
    total: 0,
    correct: 0,
    accuracy: 0,
  },
  byResultType: {
    exact: { count: 0, percentage: 0 },
    goalDiff: { count: 0, percentage: 0 },
    result: { count: 0, percentage: 0 },
    wrong: { count: 0, percentage: 0 },
  },
  byConfidence: {
    safe: { total: 0, correct: 0, accuracy: 0 },
    confident: { total: 0, correct: 0, accuracy: 0 },
    bold: { total: 0, correct: 0, accuracy: 0 },
  },
  trend: [],
  leagueBreakdown: [],
};

export async function getStatsAccuracy(options?: ApiRequestOptions) {
  const response = await apiGetRaw<StatsAccuracyApiPayload>("/stats/accuracy", {
    cache: "no-store",
    ...options,
  });
  return normalizeStatsAccuracyResponse(response);
}

export function normalizeStatsAccuracyResponse(
  response: StatsAccuracyApiPayload
): StatsAccuracyResponse {
  return normalizeStatsAccuracyPayload(response) ?? EMPTY_STATS_ACCURACY;
}

function normalizeStatsAccuracyPayload(payload: unknown): StatsAccuracyResponse | null {
  if (!isRecord(payload)) return null;

  if ("overall" in payload) {
    const overall = isRecord(payload.overall) ? payload.overall : {};
    const byResultType = isRecord(payload.byResultType ?? payload.by_result_type)
      ? (payload.byResultType ?? payload.by_result_type)
      : {};
    const byConfidence = isRecord(payload.byConfidence ?? payload.by_confidence)
      ? (payload.byConfidence ?? payload.by_confidence)
      : {};

    return {
      overall: {
        total: toNumber(overall.total, 0),
        correct: toNumber(overall.correct, 0),
        accuracy: toNumber(overall.accuracy, 0),
      },
      byResultType: {
        exact: normalizeAccuracyStat(getRecordValue(byResultType, "exact")),
        goalDiff: normalizeAccuracyStat(
          getRecordValue(byResultType, "goalDiff") ?? getRecordValue(byResultType, "goal_diff")
        ),
        result: normalizeAccuracyStat(getRecordValue(byResultType, "result")),
        wrong: normalizeAccuracyStat(getRecordValue(byResultType, "wrong")),
      },
      byConfidence: {
        safe: normalizeConfidenceStat(getRecordValue(byConfidence, "safe")),
        confident: normalizeConfidenceStat(getRecordValue(byConfidence, "confident")),
        bold: normalizeConfidenceStat(getRecordValue(byConfidence, "bold")),
      },
      trend: normalizeTrend(payload.trend),
      leagueBreakdown: normalizeLeagueBreakdown(
        payload.leagueBreakdown ?? payload.league_breakdown
      ),
    };
  }

  return (
    normalizeStatsAccuracyPayload(payload.data) ??
    normalizeStatsAccuracyPayload(payload.stats) ??
    normalizeStatsAccuracyPayload(payload.accuracy) ??
    normalizeStatsAccuracyPayload(payload.payload) ??
    normalizeStatsAccuracyPayload(payload.result)
  );
}

function normalizeAccuracyStat(value: unknown): AccuracyStat {
  const item = isRecord(value) ? value : {};
  return {
    count: toNumber(item.count, 0),
    percentage: toNumber(item.percentage ?? item.percent, 0),
  };
}

function normalizeConfidenceStat(value: unknown): ConfidenceAccuracyStat {
  const item = isRecord(value) ? value : {};
  return {
    total: toNumber(item.total, 0),
    correct: toNumber(item.correct, 0),
    accuracy: toNumber(item.accuracy, 0),
  };
}

function normalizeTrend(value: unknown): StatsTrendPoint[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};
    return {
      date: toStringValue(record.date ?? record.day ?? record.period ?? String(index + 1)),
      accuracy: toNumber(record.accuracy, 0),
      points: toNumber(record.points, 0),
      predictions: toNumber(record.predictions ?? record.total, 0),
    };
  });
}

function normalizeLeagueBreakdown(value: unknown): StatsLeagueBreakdown[] {
  if (!Array.isArray(value)) return [];

  return value.map((item, index) => {
    const record = isRecord(item) ? item : {};
    const leagueId =
      record.leagueId ?? record.league_id ?? record.id ?? record.code ?? `league-${index + 1}`;

    return {
      leagueId: toStringValue(leagueId),
      leagueName: toStringValue(
        record.leagueName ?? record.league_name ?? record.name ?? record.league ?? leagueId
      ),
      accuracy: toNumber(record.accuracy, 0),
      predictions: toNumber(record.predictions ?? record.total, 0),
      points: toNumber(record.points, 0),
      correctCount: toNumber(record.correctCount ?? record.correct_count ?? record.correct, 0),
    };
  });
}

function getRecordValue(record: unknown, key: string) {
  return isRecord(record) ? record[key] : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toStringValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function toNumber(value: unknown, fallback: number) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}
