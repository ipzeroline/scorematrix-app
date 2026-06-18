import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import { formatMatchDateTimeWithZone } from "@/lib/utils";
import type {
  ApiFootballAIInsightDetail,
  ApiFootballTeamFormProfile,
  ApiFootballFixture,
} from "@/lib/api-football";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InsightHeadToHeadRecord = {
  fixtureId: number;
  date: string;
  referee?: string | null;
  venue?: {
    name?: string | null;
    city?: string | null;
  } | null;
  status?: {
    short?: string | null;
    elapsed?: number | null;
  } | null;
  league?: {
    name?: string | null;
    country?: string | null;
    round?: string | null;
    season?: number | null;
  } | null;
  teams: {
    home: { name: string; winner?: boolean | null };
    away: { name: string; winner?: boolean | null };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score?: {
    halftime?:
      | string
      | {
          home?: number | null;
          away?: number | null;
        }
      | null;
    fulltime?:
      | string
      | {
          home?: number | null;
          away?: number | null;
        }
      | null;
  } | null;
};

export type ExtendedBiggest = NonNullable<ApiFootballTeamFormProfile["league"]>["biggest"] & {
  wins?: { home?: string | null; away?: string | null };
  loses?: { home?: string | null; away?: string | null };
};

export type ExtendedLineup = {
  formation?: string | null;
  played?: number | null;
};

export type ExtendedLeagueData = ApiFootballTeamFormProfile["league"] & {
  lineups?: ExtendedLineup[];
  cards?: {
    yellow?: Record<string, { total?: number | null; percentage?: string | null }>;
    red?: Record<string, { total?: number | null; percentage?: string | null }>;
  };
};

export type LocalizedDetailCopy = {
  back: string;
  liveNow: string;
  generatedAt: string;
  matchOverview: string;
  confidenceSummary: string;
  probabilityBreakdown: string;
  heatMeter: string;
  homeAdvantage: string;
  likelyScore: string;
  apiAdvice: string;
  winnerLean: string;
  winnerNote: string;
  winOrDraw: string;
  overUnder: string;
  drawOption: string;
  aiVerdict: string;
  verdictHome: string;
  verdictAway: string;
  verdictDraw: string;
  liveContext: string;
  predictedGoalsUnavailable: string;
  noCommunityVotes: string;
  liveLeads: string;
  liveLevel: string;
  matchupBoard: string;
  formDeepDive: string;
  formSnapshot: string;
  seasonPulse: string;
  minuteGoals: string;
  frequentLineups: string;
  biggestTrends: string;
  discipline: string;
  specialStats: string;
  headToHead: string;
  advancedStats: string;
  goalsForTiming: string;
  goalsAgainstTiming: string;
  underOver: string;
  cardsBreakdown: string;
  redCards: string;
  halftime: string;
  fulltime: string;
  country: string;
  referee: string;
  venue: string;
  round: string;
  status: string;
  injuryDesk: string;
  teamImpact: string;
  quickTake: string;
  mainPrediction: string;
  tabSummary: string;
  tabModel: string;
  tabForm: string;
  tabCommunity: string;
  noPrediction: string;
  noHistory: string;
  noComparison: string;
  noGeneratedTime: string;
  confidenceHigh: string;
  confidenceMid: string;
  confidenceLow: string;
  strengthGap: string;
  favoriteTeam: string;
  upsetRisk: string;
  noImpact: string;
  playersOut: string;
  cardsLabel: string;
  cleanSheets: string;
  failedToScore: string;
  penalties: string;
  biggestWin: string;
  biggestLoss: string;
  biggestGoalsFor: string;
  biggestGoalsAgainst: string;
  winStreak: string;
  drawStreak: string;
  lossStreak: string;
  played: string;
  wins: string;
  draws: string;
  losses: string;
  goalsFor: string;
  goalsAgainst: string;
  avgPerMatch: string;
  impactLow: string;
  impactMid: string;
  impactHigh: string;
  impactSevere: string;
  fixtureMeta: string;
  apiFixtureId: string;
  apiLeagueId: string;
  kickoff: string;
  liveFlag: string;
  formIndex: string;
  attack: string;
  defense: string;
  recentProfile: string;
  winnerId: string;
  season: string;
  standings: string;
  leaguePosition: string;
  rankLabel: string;
  pointsLabel: string;
  goalDiff: string;
  teamStatsSeason: string;
  seasonAverages: string;
  avgScored: string;
  avgConceded: string;
  possession: string;
  avgCards: string;
  topFormation: string;
  h2hSummaryTitle: string;
  totalMeetings: string;
  avgGoals: string;
  probabilitySource: string;
  sourceComparison: string;
  sourceApi: string;
  modelDiagnostics: string;
  diagnosticDescription: string;
  homeStrength: string;
  awayStrength: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

export const minuteBuckets = [
  "0-15",
  "16-30",
  "31-45",
  "46-60",
  "61-75",
  "76-90",
  "91-105",
  "106-120",
] as const;

export const comparisonLabels = {
  th: {
    form: "ฟอร์ม",
    att: "เกมรุก",
    def: "เกมรับ",
    poisson_distribution: "Poisson",
    h2h: "H2H",
    goals: "ประตู",
    total: "ภาพรวม",
  },
  en: {
    form: "Form",
    att: "Attack",
    def: "Defense",
    poisson_distribution: "Poisson",
    h2h: "H2H",
    goals: "Goals",
    total: "Total",
  },
} as const;

export const detailCopy: Record<string, LocalizedDetailCopy> = {
  th: {
    back: "กลับ AI Insight",
    liveNow: "กำลังแข่งขัน",
    generatedAt: "AI อัปเดต",
    matchOverview: "ภาพรวมแมตช์",
    confidenceSummary: "ระดับความมั่นใจ",
    probabilityBreakdown: "ความน่าจะเป็นผลการแข่งขัน",
    heatMeter: "เกมสูสีแค่ไหน",
    homeAdvantage: "เจ้าบ้านได้เปรียบ",
    likelyScore: "สกอร์ที่คาดว่า",
    apiAdvice: "คำแนะนำจากโมเดล",
    winnerLean: "ทีมที่โมเดลเอนเอียง",
    winnerNote: "หมายเหตุผู้ชนะ",
    winOrDraw: "ชนะหรือเสมอ",
    overUnder: "สูง/ต่ำ",
    drawOption: "เสมอ",
    aiVerdict: "AI มองว่า",
    verdictHome: "เจ้าบ้านน่าเชียร์กว่า",
    verdictAway: "ทีมเยือนน่าเชียร์กว่า",
    verdictDraw: "มีแนวโน้มออกเสมอ",
    liveContext: "สถานะสด",
    predictedGoalsUnavailable: "ไม่มีสกอร์คาดการณ์ที่ใช้ได้",
    noCommunityVotes: "ยังไม่มีเสียงโหวตจากผู้ใช้สำหรับคู่นี้",
    liveLeads: "นำอยู่",
    liveLevel: "สกอร์สด",
    matchupBoard: "Match-Up Comparison",
    formDeepDive: "ฟอร์มเชิงลึก",
    formSnapshot: "ฟอร์มล่าสุด",
    seasonPulse: "ภาพรวมฤดูกาล",
    minuteGoals: "ช่วงเวลาที่ยิงประตู",
    frequentLineups: "แผนที่ใช้บ่อย",
    biggestTrends: "สถิติน่าสนใจ",
    discipline: "วินัยเกมรับ",
    specialStats: "ตัวชี้วัดเพิ่มเติม",
    headToHead: "สถิติการพบกัน",
    advancedStats: "สถิติเพิ่มเติม",
    goalsForTiming: "ช่วงเวลาที่ยิงได้",
    goalsAgainstTiming: "ช่วงเวลาที่เสียประตู",
    underOver: "สถิติสูง/ต่ำ",
    cardsBreakdown: "ใบเหลือง/ใบแดงตามช่วงเวลา",
    redCards: "ใบแดง",
    halftime: "ครึ่งแรก",
    fulltime: "เต็มเวลา",
    country: "ประเทศ",
    referee: "กรรมการ",
    venue: "สนาม",
    round: "รอบ",
    status: "สถานะ",
    injuryDesk: "ผลกระทบตัวเจ็บ",
    teamImpact: "ผลกระทบทีม",
    quickTake: "สรุปเร็ว",
    mainPrediction: "บทสรุป AI",
    tabSummary: "สรุป",
    tabModel: "โมเดล",
    tabForm: "ฟอร์ม",
    tabCommunity: "ชุมชน",
    noPrediction: "ไม่มีข้อมูลพยากรณ์",
    noHistory: "ยังไม่มีประวัติพบกัน",
    noComparison: "ไม่มีข้อมูลเปรียบเทียบ",
    noGeneratedTime: "ไม่ระบุเวลาอัปเดต",
    confidenceHigh: "AI มั่นใจสูง มีแนวโน้มทีมเต็งชัดเจน",
    confidenceMid: "AI มั่นใจปานกลาง เกมยังเปิดกว้าง",
    confidenceLow: "AI มั่นใจต่ำ ความเสี่ยงพลิกล็อกสูง",
    strengthGap: "ช่องว่างความแข็งแกร่ง",
    favoriteTeam: "ทีมเต็ง",
    upsetRisk: "ความเสี่ยงพลิกล็อก",
    noImpact: "ไม่มีผลกระทบเด่นจากผู้เล่นบาดเจ็บ",
    playersOut: "ผู้เล่นบาดเจ็บ",
    cardsLabel: "ใบเหลือง",
    cleanSheets: "คลีนชีต",
    failedToScore: "ยิงไม่ออก",
    penalties: "จุดโทษ",
    biggestWin: "ชนะสูงสุด",
    biggestLoss: "แพ้สูงสุด",
    biggestGoalsFor: "ยิงมากสุด",
    biggestGoalsAgainst: "เสียมากสุด",
    winStreak: "ชนะติด",
    drawStreak: "เสมอติด",
    lossStreak: "แพ้ติด",
    played: "แข่ง",
    wins: "ชนะ",
    draws: "เสมอ",
    losses: "แพ้",
    goalsFor: "ยิง",
    goalsAgainst: "เสีย",
    avgPerMatch: "เฉลี่ย/นัด",
    impactLow: "ผลกระทบต่ำ",
    impactMid: "ผลกระทบปานกลาง",
    impactHigh: "ผลกระทบสูง",
    impactSevere: "ผลกระทบรุนแรง",
    fixtureMeta: "ข้อมูลแมตช์",
    apiFixtureId: "รหัสแมตช์ API",
    apiLeagueId: "รหัสลีก API",
    kickoff: "เวลาเริ่ม",
    liveFlag: "สถานะสด",
    formIndex: "ดัชนีฟอร์ม",
    attack: "เกมรุก",
    defense: "เกมรับ",
    recentProfile: "ฟอร์ม 5 นัดล่าสุด",
    winnerId: "รหัสทีมเต็ง",
    season: "ฤดูกาล",
    standings: "ตารางคะแนน",
    leaguePosition: "อันดับในลีก",
    rankLabel: "อันดับ",
    pointsLabel: "คะแนน",
    goalDiff: "ผลต่างประตู",
    teamStatsSeason: "สถิติฤดูกาล",
    seasonAverages: "ค่าเฉลี่ยทั้งฤดูกาล",
    avgScored: "ยิงเฉลี่ย",
    avgConceded: "เสียเฉลี่ย",
    possession: "ครองบอล",
    avgCards: "ใบเฉลี่ย",
    topFormation: "แผนที่ใช้บ่อย",
    h2hSummaryTitle: "สรุปการพบกัน",
    totalMeetings: "พบกันทั้งหมด",
    avgGoals: "ประตูเฉลี่ย",
    probabilitySource: "ที่มาความน่าจะเป็น",
    sourceComparison: "โมเดลเปรียบเทียบ",
    sourceApi: "พยากรณ์จาก API",
    modelDiagnostics: "สัญญาณความแข็งแกร่ง",
    diagnosticDescription: "เปรียบเทียบความแข็งแกร่งและช่องว่างของทั้งสองทีม",
    homeStrength: "ความแข็งแกร่งเจ้าบ้าน",
    awayStrength: "ความแข็งแกร่งทีมเยือน",
  },
  en: {
    back: "Back to AI Insight",
    liveNow: "Live now",
    generatedAt: "AI updated",
    matchOverview: "Match overview",
    confidenceSummary: "Confidence summary",
    probabilityBreakdown: "Outcome probabilities",
    heatMeter: "How close the match looks",
    homeAdvantage: "Home edge",
    likelyScore: "Projected score",
    apiAdvice: "Model advice",
    winnerLean: "Winner lean",
    winnerNote: "Winner note",
    winOrDraw: "Win or draw",
    overUnder: "Under / over",
    drawOption: "Draw",
    aiVerdict: "AI verdict",
    verdictHome: "Home side has the edge",
    verdictAway: "Away side has the edge",
    verdictDraw: "Draw looks most likely",
    liveContext: "Live context",
    predictedGoalsUnavailable: "No reliable projected score",
    noCommunityVotes: "No community votes yet for this match",
    liveLeads: "leads",
    liveLevel: "Live score",
    matchupBoard: "Match-Up Comparison",
    formDeepDive: "Form deep dive",
    formSnapshot: "Recent form",
    seasonPulse: "Season pulse",
    minuteGoals: "Goal timing",
    frequentLineups: "Frequent lineups",
    biggestTrends: "Biggest trends",
    discipline: "Discipline",
    specialStats: "Extra signals",
    headToHead: "Head-to-head",
    advancedStats: "Advanced stats",
    goalsForTiming: "Goals scored by minute",
    goalsAgainstTiming: "Goals conceded by minute",
    underOver: "Under / over",
    cardsBreakdown: "Yellow / red cards by minute",
    redCards: "Red cards",
    halftime: "Halftime",
    fulltime: "Fulltime",
    country: "Country",
    referee: "Referee",
    venue: "Venue",
    round: "Round",
    status: "Status",
    injuryDesk: "Injury impact",
    teamImpact: "Team impact",
    quickTake: "Quick take",
    mainPrediction: "AI summary",
    tabSummary: "Summary",
    tabModel: "Model",
    tabForm: "Form",
    tabCommunity: "Community",
    noPrediction: "No prediction data",
    noHistory: "No head-to-head history yet",
    noComparison: "No comparison data",
    noGeneratedTime: "Update time unavailable",
    confidenceHigh: "High AI confidence with a clear favorite profile",
    confidenceMid: "Moderate AI confidence with a balanced outlook",
    confidenceLow: "Low AI confidence with elevated upset risk",
    strengthGap: "Strength gap",
    favoriteTeam: "Favorite team",
    upsetRisk: "Upset risk",
    noImpact: "No notable injury impact reported",
    playersOut: "Players out",
    cardsLabel: "Yellow cards",
    cleanSheets: "Clean sheets",
    failedToScore: "Failed to score",
    penalties: "Penalties",
    biggestWin: "Biggest win",
    biggestLoss: "Biggest loss",
    biggestGoalsFor: "Most scored",
    biggestGoalsAgainst: "Most conceded",
    winStreak: "Win streak",
    drawStreak: "Draw streak",
    lossStreak: "Loss streak",
    played: "Played",
    wins: "Wins",
    draws: "Draws",
    losses: "Losses",
    goalsFor: "Goals for",
    goalsAgainst: "Goals against",
    avgPerMatch: "avg/match",
    impactLow: "Low impact",
    impactMid: "Medium impact",
    impactHigh: "High impact",
    impactSevere: "Severe impact",
    fixtureMeta: "Fixture metadata",
    apiFixtureId: "API fixture ID",
    apiLeagueId: "API league ID",
    kickoff: "Kickoff",
    liveFlag: "Live status",
    formIndex: "Form index",
    attack: "Attack",
    defense: "Defense",
    recentProfile: "Last five profile",
    winnerId: "Winner ID",
    season: "Season",
    standings: "Standings",
    leaguePosition: "League position",
    rankLabel: "Rank",
    pointsLabel: "Points",
    goalDiff: "Goal difference",
    teamStatsSeason: "Season stats",
    seasonAverages: "Full-season averages",
    avgScored: "Avg scored",
    avgConceded: "Avg conceded",
    possession: "Possession",
    avgCards: "Avg cards",
    topFormation: "Top formation",
    h2hSummaryTitle: "Head-to-head summary",
    totalMeetings: "Total meetings",
    avgGoals: "Avg goals",
    probabilitySource: "Probability source",
    sourceComparison: "Comparison model",
    sourceApi: "API prediction",
    modelDiagnostics: "Strength signals",
    diagnosticDescription: "Compare team strength and the model's projected gap",
    homeStrength: "Home strength",
    awayStrength: "Away strength",
  },
};

detailCopy.lo = detailCopy.en;
detailCopy.my = detailCopy.en;
detailCopy.km = detailCopy.en;
detailCopy.zh = detailCopy.en;

// ---------------------------------------------------------------------------
// Format functions
// ---------------------------------------------------------------------------

export function formatDateTime(value: string, locale: string) {
  return formatMatchDateTimeWithZone(value, localeMap[locale] ?? "th-TH");
}

export function formatPercent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}%` : "-";
}

export function formatSlashMetric(value: number | null | undefined, max: number) {
  return typeof value === "number" ? `${trimDecimal(value)}/${max}` : `-/${max}`;
}

export function formatHeatMeter(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}/100` : "-/100";
}

export function formatMultiplier(value: number | null | undefined) {
  return typeof value === "number" ? `x${value.toFixed(2)}` : "-";
}

export function formatBoolean(value: boolean | null | undefined, locale: string) {
  if (value === null || value === undefined) return "-";
  if (locale === "th") return value ? "ใช่" : "ไม่";
  return value ? "Yes" : "No";
}

export function formatScore(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "-";
}

export function formatScorePrediction(
  value: ApiFootballAIInsightDetail["apiPredictedGoals"]
) {
  if (!value) return null;
  const home = normalizePredictedGoalValue(value.home);
  const away = normalizePredictedGoalValue(value.away);
  if (home === null && away === null) return null;
  return `${home ?? "?"} : ${away ?? "?"}`;
}

export function formatNumber(value: number | null | undefined, locale: string) {
  if (typeof value !== "number") return "-";
  return value.toLocaleString(localeMap[locale] ?? "en-US");
}

export function formatInteger(value: number) {
  return Number.isFinite(value) ? String(Math.round(value)) : "-";
}

export function formatNullableNumber(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "-";
}

export function formatSignedNumber(value: number | null | undefined) {
  if (typeof value !== "number") return "-";
  return value > 0 ? `+${value}` : String(value);
}

export function formatDecimal(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatPossession(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return `${Math.round(value)}%`;
  const trimmed = value.trim();
  if (!trimmed) return "-";
  return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
}

export function formatProbabilitySource(value: string, details: LocalizedDetailCopy) {
  if (value === "comparison_model") return details.sourceComparison;
  if (value === "api_prediction") return details.sourceApi;
  return value;
}

export function formatVenue(
  venue:
    | {
        name?: string | null;
        city?: string | null;
      }
    | null
    | undefined
) {
  if (!venue) return "-";
  if (venue.name && venue.city) return `${venue.name}, ${venue.city}`;
  return venue.name || venue.city || "-";
}

export function formatMinuteStat(
  value: { total?: number | null; percentage?: string | null } | undefined
) {
  const total = value?.total ?? 0;
  const percentage = value?.percentage;
  if (!percentage) return String(total);
  return `${total} (${percentage})`;
}

export function formatHeadToHeadFulltime(
  value:
    | string
    | {
        home?: number | null;
        away?: number | null;
      }
    | null
    | undefined
) {
  if (!value) return null;
  if (typeof value === "string") return value;
  const home = typeof value.home === "number" ? value.home : "-";
  const away = typeof value.away === "number" ? value.away : "-";
  return `${home}:${away}`;
}

export function formatScoreline(
  value:
    | { home?: string | null; away?: string | null }
    | string
    | null
    | undefined
) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.home || value.away || "-";
}

export function formatTotalAndAverage(
  total: number | null | undefined,
  average: number | string | null | undefined,
  details: LocalizedDetailCopy
) {
  const totalLabel = typeof total === "number" ? String(total) : "-";
  const avgLabel =
    typeof average === "number"
      ? trimDecimal(average)
      : typeof average === "string"
        ? average
        : "-";

  return `${totalLabel} · ${avgLabel} ${details.avgPerMatch}`;
}

export function formatTopLevelGoals(
  value:
    | {
        total?: number | null;
        average?: number | null;
      }
    | undefined,
  details: LocalizedDetailCopy
) {
  return formatTotalAndAverage(value?.total, value?.average, details);
}

export function trimDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function normalizePredictedGoalValue(value: number | string | null | undefined) {
  if (typeof value === "number") return value >= 0 ? trimDecimal(value) : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return trimDecimal(parsed);
  }
  return null;
}

export function sumMinuteTotals(
  minuteMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined
) {
  if (!minuteMap) return null;
  return minuteBuckets.reduce((sum, bucket) => sum + (minuteMap[bucket]?.total ?? 0), 0);
}

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

// ---------------------------------------------------------------------------
// Status helpers
// ---------------------------------------------------------------------------

export function isLiveStatus(short: string, elapsed: number | null) {
  if (typeof elapsed === "number" && elapsed > 0) return true;
  return !["NS", "FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"].includes(short);
}

export function isFinishedStatus(short: string) {
  return ["FT", "AET", "PEN"].includes(short);
}

export function isHoldStatus(short: string) {
  return ["PST", "CANC", "ABD", "AWD", "WO"].includes(short);
}

// ---------------------------------------------------------------------------
// Data guards
// ---------------------------------------------------------------------------

export function hasStandings(standings: ApiFootballAIInsightDetail["standings"]) {
  if (!standings) return false;
  return (
    typeof standings.home?.rank === "number" ||
    typeof standings.away?.rank === "number"
  );
}

export function hasTeamStatsData(teamStats: ApiFootballAIInsightDetail["teamStats"]) {
  if (!teamStats) return false;
  const check = (s: typeof teamStats.home) =>
    !!s &&
    (
      (typeof s.avgGoalsFor === "number" && s.avgGoalsFor > 0) ||
      (typeof s.avgGoalsAgainst === "number" && s.avgGoalsAgainst > 0) ||
      (typeof s.cleanSheets === "number" && s.cleanSheets > 0) ||
      (typeof s.failedToScore === "number" && s.failedToScore > 0) ||
      (typeof s.penaltyScored === "number" && s.penaltyScored > 0) ||
      (typeof s.avgBallPossession === "number" && s.avgBallPossession > 0) ||
      (typeof s.cardsAvg === "number" && s.cardsAvg > 0)
    );
  return check(teamStats.home) || check(teamStats.away);
}

// ---------------------------------------------------------------------------
// Tone / description helpers
// ---------------------------------------------------------------------------

export function getConfidenceTone(score: number | null | undefined) {
  if (typeof score !== "number") return "red" as const;
  if (score >= 70) return "green" as const;
  if (score >= 50) return "gold" as const;
  return "red" as const;
}

export function getHeatTone(value: number | null | undefined) {
  if (typeof value !== "number") return "gold" as const;
  if (value < 40) return "green" as const;
  if (value < 70) return "gold" as const;
  return "red" as const;
}

export function getHeatDescription(
  value: number | null | undefined,
  copy: ReturnType<typeof getAIInsightPageCopy>
) {
  if (typeof value !== "number") return copy.labels.heat;
  if (value < 40) return copy.labels.heatLow;
  if (value < 70) return copy.labels.heatMid;
  return copy.labels.heatHigh;
}

export function getConfidenceDescription(
  score: number | null | undefined,
  details: LocalizedDetailCopy
) {
  if (typeof score !== "number") return details.noPrediction;
  if (score >= 70) return details.confidenceHigh;
  if (score >= 50) return details.confidenceMid;
  return details.confidenceLow;
}

export function getAIVerdict(
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail,
  details: LocalizedDetailCopy
) {
  const home = insight.homeWinProbability ?? -1;
  const draw = insight.drawProbability ?? -1;
  const away = insight.awayWinProbability ?? -1;
  const highest = Math.max(home, draw, away);
  const apiWinnerName = insight.apiWinner?.name;
  const liveLeader = getLiveLeader(fixture, details);

  if (highest === draw && home !== draw && away !== draw) {
    return {
      title: details.verdictDraw,
      detail: `${fixture.home.name} ${formatPercent(home)} • ${details.drawOption} ${formatPercent(draw)} • ${fixture.away.name} ${formatPercent(away)}`,
      liveNote: liveLeader,
    };
  }

  if (highest === away || apiWinnerName === fixture.away.name) {
    return {
      title: details.verdictAway,
      detail: `${fixture.away.name} ${formatPercent(away)} • ${fixture.home.name} ${formatPercent(home)} • ${details.drawOption} ${formatPercent(draw)}`,
      liveNote: liveLeader,
    };
  }

  if (highest === draw && apiWinnerName) {
    return {
      title:
        apiWinnerName === fixture.home.name ? details.verdictHome : details.verdictAway,
      detail: `${apiWinnerName} • ${fixture.home.name} ${formatPercent(home)} • ${details.drawOption} ${formatPercent(draw)} • ${fixture.away.name} ${formatPercent(away)}`,
      liveNote: liveLeader,
    };
  }

  return {
    title: details.verdictHome,
    detail: `${fixture.home.name} ${formatPercent(home)} • ${details.drawOption} ${formatPercent(draw)} • ${fixture.away.name} ${formatPercent(away)}`,
    liveNote: liveLeader,
  };
}

export function getLiveLeader(fixture: ApiFootballFixture, details: LocalizedDetailCopy) {
  if (!isLiveStatus(fixture.statusShort.toUpperCase(), fixture.elapsed)) return null;
  const home = fixture.score.home ?? 0;
  const away = fixture.score.away ?? 0;
  if (home === away) {
    return `${details.liveLevel} ${fixture.home.name} ${home}-${away} ${fixture.away.name}`;
  }
  const leader = home > away ? fixture.home.name : fixture.away.name;
  return `${leader} ${details.liveLeads} ${home}-${away}`;
}

export function getStatusLabel(
  fixture: ApiFootballFixture,
  copy: ReturnType<typeof getAIInsightPageCopy>,
  details: LocalizedDetailCopy
) {
  const short = fixture.statusShort.toUpperCase();
  const longLabel = fixture.statusLong?.trim();
  if (isLiveStatus(short, fixture.elapsed)) {
    if (longLabel) {
      return fixture.elapsed !== null ? `${longLabel} ${fixture.elapsed}'` : longLabel;
    }
    return fixture.elapsed !== null ? `${details.liveNow} ${fixture.elapsed}'` : details.liveNow;
  }
  if (longLabel) return longLabel;
  if (isFinishedStatus(short)) return copy.labels.finished;
  if (short === "PST") return copy.labels.postponed;
  if (short === "CANC") return copy.labels.cancelled;
  return copy.labels.upcoming;
}

export function getImpactDescription(
  value: number | null | undefined,
  details: LocalizedDetailCopy
) {
  if (typeof value !== "number" || value === 0) return details.noImpact;
  if (value <= 3) return details.impactLow;
  if (value <= 7) return details.impactMid;
  if (value <= 9) return details.impactHigh;
  return details.impactSevere;
}

// ---------------------------------------------------------------------------
// Profile resolvers
// ---------------------------------------------------------------------------

export function getProfileLineups(profile: ApiFootballTeamFormProfile | null) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  const lineups = profile?.lineups?.length ? profile.lineups : league?.lineups;
  return lineups?.filter(
    (lineup): lineup is Required<Pick<ExtendedLineup, "formation">> & ExtendedLineup =>
      Boolean(lineup?.formation)
  );
}

export function getProfileCards(profile: ApiFootballTeamFormProfile | null) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  return profile?.cards ?? league?.cards;
}

export function resolveMinuteMap(
  profile: ApiFootballTeamFormProfile | null | undefined,
  direction: "for" | "against"
) {
  const top = profile?.goals?.[direction]?.minute;
  if (top && Object.values(top).some((v) => v?.total != null)) return top;
  return profile?.league?.goals?.[direction]?.minute;
}

export function resolveUnderOver(
  profile: ApiFootballTeamFormProfile | null | undefined,
  direction: "for" | "against"
) {
  const top = profile?.goals?.[direction]?.under_over;
  if (top && Object.values(top).some((v) => v?.over != null || v?.under != null)) return top;
  return profile?.league?.goals?.[direction]?.under_over;
}
