import { MatchStatus } from "@/types/common";

const LIVE_STATUS_SHORTS = new Set([
  "1H",
  "HT",
  "2H",
  "ET",
  "BT",
  "P",
  "SUSP",
  "INT",
  "LIVE",
]);
const UPCOMING_STATUS_SHORTS = new Set(["NS", "TBD", "UPCOMING"]);
const FINISHED_STATUS_SHORTS = new Set(["FT", "AET", "PEN", "AWD", "WO", "FINISHED"]);
const POSTPONED_STATUS_SHORTS = new Set(["PST", "POSTPONED"]);
const CANCELLED_STATUS_SHORTS = new Set(["CANC", "ABD", "CANCELLED"]);

type FixtureStatusSource = {
  status: MatchStatus | string;
  statusShort?: string | null;
};

export type FootballStatusLabels = {
  statusByGroup: Record<string, string>;
  statusShort: Record<string, string>;
};

export function buildFootballStatusLabels(
  t: (key: string) => string
): FootballStatusLabels {
  return {
    statusByGroup: {
      [MatchStatus.LIVE]: t("status.live"),
      [MatchStatus.UPCOMING]: t("status.upcoming"),
      [MatchStatus.FINISHED]: t("status.finished"),
      [MatchStatus.POSTPONED]: t("status.postponed"),
      [MatchStatus.CANCELLED]: t("status.cancelled"),
    },
    statusShort: {
      NS: t("statusShort.NS"),
      TBD: t("statusShort.TBD"),
      "1H": t("statusShort.1H"),
      HT: t("statusShort.HT"),
      "2H": t("statusShort.2H"),
      ET: t("statusShort.ET"),
      BT: t("statusShort.BT"),
      P: t("statusShort.P"),
      SUSP: t("statusShort.SUSP"),
      INT: t("statusShort.INT"),
      LIVE: t("statusShort.LIVE"),
      FT: t("statusShort.FT"),
      AET: t("statusShort.AET"),
      PEN: t("statusShort.PEN"),
      AWD: t("statusShort.AWD"),
      WO: t("statusShort.WO"),
      PST: t("statusShort.PST"),
      CANC: t("statusShort.CANC"),
      ABD: t("statusShort.ABD"),
    },
  };
}

export function getFixtureStatusGroup(match: FixtureStatusSource) {
  const statusShort = String(match.statusShort ?? "").trim().toUpperCase();
  const rawStatus = String(match.status ?? "").trim().toUpperCase();

  if (LIVE_STATUS_SHORTS.has(statusShort) || LIVE_STATUS_SHORTS.has(rawStatus)) {
    return MatchStatus.LIVE;
  }
  if (UPCOMING_STATUS_SHORTS.has(statusShort) || UPCOMING_STATUS_SHORTS.has(rawStatus)) {
    return MatchStatus.UPCOMING;
  }
  if (FINISHED_STATUS_SHORTS.has(statusShort) || FINISHED_STATUS_SHORTS.has(rawStatus)) {
    return MatchStatus.FINISHED;
  }
  if (POSTPONED_STATUS_SHORTS.has(statusShort) || POSTPONED_STATUS_SHORTS.has(rawStatus)) {
    return MatchStatus.POSTPONED;
  }
  if (CANCELLED_STATUS_SHORTS.has(statusShort) || CANCELLED_STATUS_SHORTS.has(rawStatus)) {
    return MatchStatus.CANCELLED;
  }

  return match.status;
}

export function getFixtureStatusLabel(
  match: FixtureStatusSource,
  labels: FootballStatusLabels
) {
  const statusShort = String(match.statusShort ?? "").trim().toUpperCase();
  const detail = labels.statusShort[statusShort];

  if (detail) {
    return detail;
  }

  return labels.statusByGroup[getFixtureStatusGroup(match)] ?? statusShort;
}

export function shouldHideStaleNotStartedFixture(match: {
  kickoffTime: string;
  statusShort?: string | null;
}) {
  const statusShort = String(match.statusShort ?? "").trim().toUpperCase();

  if (statusShort !== "NS") {
    return false;
  }

  const kickoff = new Date(match.kickoffTime).getTime();
  return Number.isFinite(kickoff) && kickoff <= Date.now();
}
