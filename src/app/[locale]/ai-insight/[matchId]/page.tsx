import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BrainCircuit,
  Clock3,
  Flame,
  Gauge,
  Goal,
  Home,
  HeartPulse,
  Shield,
  Sparkles,
  Swords,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar, type ProgressBarColor } from "@/components/ui/ProgressBar";
import AIInsightDetailTabs from "./AIInsightDetailTabs";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import {
  ApiFootballError,
  type ApiFootballAIInsightDetail,
  type ApiFootballAIInsightStanding,
  type ApiFootballAIInsightTeamStats,
  type ApiFootballFixture,
  type ApiFootballTeamFormProfile,
  getApiFootballAIInsightDetail,
} from "@/lib/api-football";
import { extractApiFixtureId } from "@/lib/football-slugs";
import { cn, formatMatchDateTimeWithZone } from "@/lib/utils";

type Props = {
  params: Promise<{ locale: string; matchId: string }>;
};

type DetailContext = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
};

type InsightHeadToHeadRecord = {
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

type ExtendedBiggest = NonNullable<ApiFootballTeamFormProfile["league"]>["biggest"] & {
  wins?: { home?: string | null; away?: string | null };
  loses?: { home?: string | null; away?: string | null };
};

type ExtendedLineup = {
  formation?: string | null;
  played?: number | null;
};

type ExtendedLeagueData = ApiFootballTeamFormProfile["league"] & {
  lineups?: ExtendedLineup[];
  cards?: {
    yellow?: Record<string, { total?: number | null; percentage?: string | null }>;
    red?: Record<string, { total?: number | null; percentage?: string | null }>;
  };
};

type LocalizedDetailCopy = {
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

const localeMap: Record<string, string> = {
  th: "th-TH",
  en: "en-US",
  lo: "lo-LA",
  my: "my-MM",
  km: "km-KH",
  zh: "zh-CN",
};

const minuteBuckets = [
  "0-15",
  "16-30",
  "31-45",
  "46-60",
  "61-75",
  "76-90",
  "91-105",
  "106-120",
] as const;

const comparisonLabels = {
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

const detailCopy: Record<string, LocalizedDetailCopy> = {
  th: {
    back: "กลับ AI Insight",
    liveNow: "กำลังแข่งขัน",
    generatedAt: "AI อัปเดต",
    matchOverview: "ภาพรวมแมตช์",
    confidenceSummary: "ระดับความมั่นใจ",
    probabilityBreakdown: "ความน่าจะเป็นผลการแข่งขัน",
    heatMeter: "เกมสูสีแค่ไหน",
    homeAdvantage: "เจ้าบ้านได้เปรียบ",
    likelyScore: "สกอร์ที่คาด",
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

export default async function AIInsightDetailPage({ params }: Props) {
  const { locale, matchId } = await params;
  const copy = getAIInsightPageCopy(locale);
  const details = detailCopy[locale] ?? detailCopy.th;
  const comparisonCopy =
    comparisonLabels[locale as keyof typeof comparisonLabels] ?? comparisonLabels.en;
  const context = await getDetailContext(matchId);

  if (!context) notFound();

  const { fixture, insight } = context;
  const confidenceTone = getConfidenceTone(insight.confidenceScore);
  const heatTone = getHeatTone(insight.heatMeter);
  const generatedAtLabel = insight.generatedAt
    ? formatDateTime(insight.generatedAt, locale)
    : details.noGeneratedTime;
  const headToHead =
    (insight as ApiFootballAIInsightDetail & { headToHead?: InsightHeadToHeadRecord[] })
      .headToHead ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-3 sm:px-4 md:px-6">
      <Link
        href={`/${locale}/ai-insight`}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition-colors hover:text-cyan-300"
      >
        <ArrowLeft size={16} />
        {details.back}
      </Link>

      <section className="overflow-hidden rounded-[28px] border border-cyan-500/15 bg-[#080b14] shadow-[0_0_0_1px_rgba(8,145,178,0.06),0_24px_90px_rgba(2,8,23,0.85)]">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,#0d1322_0%,#0a101d_48%,#090d18_100%)] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan" size="md" className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles size={13} />
                {copy.title}
              </span>
            </Badge>
            {insight.upsetAlert ? (
              <Badge variant="gold" size="md">
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  {copy.labels.upsetAlert}
                </span>
              </Badge>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            {fixture.league.logo ? (
              <Image
                src={fixture.league.logo}
                alt={fixture.league.name}
                width={24}
                height={24}
                className="h-6 w-6 rounded-full border border-white/10 object-contain bg-white/5 p-0.5"
              />
            ) : null}
            <span className="font-medium text-gray-200">{fixture.league.name}</span>
            <span>{fixture.league.country}</span>
            {fixture.league.round ? <span>{fixture.league.round}</span> : null}
          </div>

          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 rounded-[24px] border border-white/10 bg-black/20 p-3 sm:gap-4 sm:p-4">
            <TeamHero
              name={fixture.home.name}
              logo={fixture.home.logo}
              alignment="left"
              favorite={insight.favoriteTeam === "home"}
              favoriteLabel={details.favoriteTeam}
            />
            <div className="flex min-w-[96px] flex-col items-center justify-center gap-1.5 px-1 text-center sm:min-w-[128px] sm:gap-2">
              <div className="font-mono text-[28px] font-black tracking-[0.1em] text-white sm:text-4xl sm:tracking-[0.18em]">
                {formatScore(fixture.score.home)}:{formatScore(fixture.score.away)}
              </div>
              <div className="flex flex-col items-center justify-center gap-1.5 text-[10px] text-gray-400 sm:flex-row sm:flex-wrap sm:gap-2 sm:text-[11px]">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Clock3 size={12} className="text-cyan-300" />
                  {formatDateTime(fixture.kickoffTime, locale)}
                </span>
                <HeroStatusBadge fixture={fixture} copy={copy} details={details} />
              </div>
            </div>
            <TeamHero
              name={fixture.away.name}
              logo={fixture.away.logo}
              alignment="right"
              favorite={insight.favoriteTeam === "away"}
              favoriteLabel={details.favoriteTeam}
            />
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-4">
          <SimpleStatCard
            icon={Gauge}
            label={copy.labels.confidence}
            value={formatPercent(insight.confidenceScore)}
            note={getConfidenceDescription(insight.confidenceScore, details)}
            tone={confidenceTone}
          />
          <SimpleStatCard
            icon={Flame}
            label={details.heatMeter}
            value={formatHeatMeter(insight.heatMeter)}
            note={getHeatDescription(insight.heatMeter, copy)}
            tone={heatTone}
          />
          <SimpleStatCard
            icon={AlertTriangle}
            label={details.upsetRisk}
            value={formatPercent(insight.upsetRisk)}
            note={insight.upsetAlert ? copy.labels.upsetAlert : details.confidenceHigh}
            tone={insight.upsetAlert ? "magenta" : "green"}
          />
          <SimpleStatCard
            icon={Home}
            label={details.homeAdvantage}
            value={formatMultiplier(insight.homeAdvantageFactor)}
            note={fixture.home.name}
            tone="blue"
          />
        </div>

        <div className="border-t border-white/10 px-4 pb-4 sm:px-5 sm:pb-5">
          <StrengthSummary insight={insight} fixture={fixture} details={details} />
        </div>
      </section>

      {insight.upsetAlert && insight.upsetDescription ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4 text-sm text-amber-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold text-amber-200">{copy.labels.upsetAlert}</p>
            <p className="mt-1 text-amber-50/80">
              {typeof insight.upsetRisk === "number" ? `${Math.round(insight.upsetRisk)}% • ` : ""}
              {insight.upsetDescription}
            </p>
          </div>
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,10,18,0.96))] p-5">
          <SectionHeading
            icon={Target}
            title={details.quickTake}
            description={details.mainPrediction}
            accent="cyan"
          />
          <AIVerdictCard
            fixture={fixture}
            insight={insight}
            details={details}
          />
          <div className="mt-5 space-y-4">
            <ProbabilityRow label={fixture.home.name} value={insight.homeWinProbability} color="cyan" />
            <ProbabilityRow label={copy.labels.draw} value={insight.drawProbability} color="purple" />
            <ProbabilityRow label={fixture.away.name} value={insight.awayWinProbability} color="magenta" />
          </div>
          {insight.probabilitySource ? (
            <p className="mt-3 text-xs text-gray-500">
              {details.probabilitySource}:{" "}
              <span className="text-gray-300">
                {formatProbabilitySource(insight.probabilitySource, details)}
              </span>
            </p>
          ) : null}
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PredictionInfo label={details.winnerLean} value={insight.apiWinner?.name} />
            <PredictionInfo label={details.likelyScore} value={formatScorePrediction(insight.apiPredictedGoals)} />
          </div>
        </Card>

        <div className="space-y-5">
          <KeyFactorsPanel factors={insight.keyFactors} copy={copy} />
          <ApiPredictionCard insight={insight} details={details} locale={locale} />
        </div>
      </section>

      <AIInsightDetailTabs
        labels={{
          summary: details.tabSummary,
          model: details.tabModel,
          form: details.tabForm,
          community: details.tabCommunity,
        }}
        summary={
          <div className="space-y-5">
            {hasStandings(insight.standings) ? (
              <StandingsCard
                standings={insight.standings ?? null}
                homeName={fixture.home.name}
                awayName={fixture.away.name}
                details={details}
              />
            ) : null}
            {hasTeamStatsData(insight.teamStats) ? (
              <TeamStatsCard
                teamStats={insight.teamStats ?? null}
                homeName={fixture.home.name}
                awayName={fixture.away.name}
                details={details}
              />
            ) : null}
            <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
              <FixtureMetaCard fixture={fixture} details={details} locale={locale} />
              <FormIndexOverview
                insight={insight}
                fixture={fixture}
                details={details}
              />
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
              <KeyFactorsPanel factors={insight.keyFactors} copy={copy} />
              <InjuryImpactCard
                injuryImpact={insight.injuryImpact}
                homeName={fixture.home.name}
                awayName={fixture.away.name}
                copy={copy}
                details={details}
              />
            </div>
          </div>
        }
        model={
          <div className="space-y-5">
            <ModelStrengthCard insight={insight} fixture={fixture} details={details} />
            <HeadToHeadCard
              history={headToHead}
              summary={insight.h2hSummary ?? null}
              homeName={fixture.home.name}
              awayName={fixture.away.name}
              details={details}
              locale={locale}
            />
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
              <ApiPredictionCard insight={insight} details={details} locale={locale} />
              <ComparisonPanel
                comparison={insight.comparison}
                labels={comparisonCopy}
                details={details}
                homeName={fixture.home.name}
                awayName={fixture.away.name}
              />
            </div>
          </div>
        }
        form={
          <div className="space-y-5">
            <section className="grid items-start gap-5 xl:grid-cols-[1.25fr_0.75fr]">
              <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(12,17,31,0.96),rgba(7,10,18,0.98))] p-5">
                <SectionHeading
                  icon={TrendingUp}
                  title={details.formDeepDive}
                  description={details.formSnapshot}
                  accent="green"
                />
                <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
                  <TeamFormCard
                    name={fixture.home.name}
                    profile={insight.formComparison.homeLastFive}
                    tone="cyan"
                    details={details}
                  />
                  <TeamFormCard
                    name={fixture.away.name}
                    profile={insight.formComparison.awayLastFive}
                    tone="magenta"
                    details={details}
                  />
                </div>
                <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
                  <GoalTimingCard
                    title={`${fixture.home.name} · ${details.minuteGoals}`}
                    profile={insight.formComparison.homeLastFive}
                    color="cyan"
                  />
                  <GoalTimingCard
                    title={`${fixture.away.name} · ${details.minuteGoals}`}
                    profile={insight.formComparison.awayLastFive}
                    color="magenta"
                  />
                </div>
                <div className="mt-5">
                  <TimingBreakdownSection
                    title={details.goalsAgainstTiming}
                    homeName={fixture.home.name}
                    awayName={fixture.away.name}
                    homeMap={
                      insight.formComparison.homeLastFive?.goals?.against?.minute ??
                      insight.formComparison.homeLastFive?.league?.goals?.against?.minute
                    }
                    awayMap={
                      insight.formComparison.awayLastFive?.goals?.against?.minute ??
                      insight.formComparison.awayLastFive?.league?.goals?.against?.minute
                    }
                  />
                </div>
              </Card>

              <div className="space-y-5">
                <SupplementalStatsCard
                  title={details.frequentLineups}
                  icon={Swords}
                  tone="cyan"
                  rows={[
                    {
                      label: fixture.home.name,
                      content: getProfileLineups(insight.formComparison.homeLastFive)?.map((lineup) => (
                        <TagPill
                          key={`${fixture.home.name}-${lineup.formation}-${lineup.played ?? 0}`}
                          tone="cyan"
                        >
                          {lineup.formation} x{lineup.played ?? 0}
                        </TagPill>
                      )),
                    },
                    {
                      label: fixture.away.name,
                      content: getProfileLineups(insight.formComparison.awayLastFive)?.map((lineup) => (
                        <TagPill
                          key={`${fixture.away.name}-${lineup.formation}-${lineup.played ?? 0}`}
                          tone="magenta"
                        >
                          {lineup.formation} x{lineup.played ?? 0}
                        </TagPill>
                      )),
                    },
                  ]}
                  empty={details.noPrediction}
                />
                <TrendCard
                  title={details.biggestTrends}
                  icon={Trophy}
                  details={details}
                  homeName={fixture.home.name}
                  awayName={fixture.away.name}
                  homeProfile={insight.formComparison.homeLastFive}
                  awayProfile={insight.formComparison.awayLastFive}
                />
                <DisciplineCard
                  title={details.specialStats}
                  details={details}
                  homeName={fixture.home.name}
                  awayName={fixture.away.name}
                  homeProfile={insight.formComparison.homeLastFive}
                  awayProfile={insight.formComparison.awayLastFive}
                />
                <AdvancedStatsCard
                  details={details}
                  homeName={fixture.home.name}
                  awayName={fixture.away.name}
                  homeProfile={insight.formComparison.homeLastFive}
                  awayProfile={insight.formComparison.awayLastFive}
                />
              </div>
            </section>
          </div>
        }
        community={
          <div className="w-full">
            <CommunityCard
              insight={insight}
              copy={copy}
              fixture={fixture}
              locale={locale}
            />
          </div>
        }
      />

      <div className="rounded-2xl border border-white/8 bg-[#09101b] px-4 py-3 text-center text-xs text-gray-500">
        {details.generatedAt}: {generatedAtLabel}
      </div>
    </div>
  );
}

async function getDetailContext(matchId: string): Promise<DetailContext | null> {
  const fixtureId = extractApiFixtureId(matchId);
  if (!fixtureId) return null;

  try {
    const insight = await getApiFootballAIInsightDetail(fixtureId);

    return {
      fixture: insight.fixture,
      insight,
    };
  } catch (error) {
    if (error instanceof ApiFootballError && error.status === 404) return null;
    throw error;
  }
}

function TeamHero({
  name,
  logo,
  alignment,
  favorite = false,
  favoriteLabel,
}: {
  name: string;
  logo: string | null;
  alignment: "left" | "right";
  favorite?: boolean;
  favoriteLabel: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 text-center sm:flex-row sm:gap-3",
        alignment === "right" && "sm:flex-row-reverse sm:text-right"
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/6 p-2 sm:h-14 sm:w-14">
        {logo ? (
          <Image
            src={logo}
            alt={name}
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        ) : (
          <Shield size={24} className="text-gray-500" />
        )}
      </div>
      <div className={cn("min-w-0", alignment === "right" && "sm:text-right")}>
        <p className="line-clamp-2 text-sm font-bold leading-tight text-white sm:text-lg">
          {name}
        </p>
        {favorite ? (
          <span className="mt-1 inline-flex items-center rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            {`★ ${favoriteLabel}`}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SimpleStatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: "green" | "gold" | "red" | "blue" | "magenta";
}) {
  const accent = {
    green: "text-green-300 border-green-400/15 bg-green-400/6",
    gold: "text-amber-300 border-amber-400/15 bg-amber-400/6",
    red: "text-red-300 border-red-400/15 bg-red-400/6",
    blue: "text-cyan-300 border-cyan-400/15 bg-cyan-400/6",
    magenta: "text-magenta border-magenta/15 bg-magenta/6",
  } as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1220] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
        </div>
        <div className={cn("rounded-xl border p-2", accent[tone])}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-400">{note}</p>
    </div>
  );
}

function StrengthSummary({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  const hasProbabilities =
    typeof insight.homeWinProbability === "number" &&
    typeof insight.drawProbability === "number" &&
    typeof insight.awayWinProbability === "number";

  if (!hasProbabilities) return null;

  const homeProbability = clampPercent(insight.homeWinProbability ?? 0);
  const drawProbability = clampPercent(insight.drawProbability ?? 0);
  const awayProbability = clampPercent(insight.awayWinProbability ?? 0);
  const favorite = insight.apiWinner?.name;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-gray-500">{details.matchupBoard}</p>
          <p className="mt-1 text-sm text-gray-300">{details.probabilityBreakdown}</p>
        </div>
        {favorite ? (
          <Badge variant="cyan">{`${details.favoriteTeam}: ${favorite}`}</Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        <StrengthTeamRow label={fixture.home.name} value={homeProbability} color="cyan" />
        <StrengthTeamRow label={details.drawOption} value={drawProbability} color="purple" />
        <StrengthTeamRow label={fixture.away.name} value={awayProbability} color="magenta" />
      </div>
    </div>
  );
}

function FixtureMetaCard({
  fixture,
  details,
  locale,
}: {
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
  locale: string;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Clock3}
        title={details.fixtureMeta}
        description={details.matchOverview}
        accent="cyan"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <PredictionInfo label={details.apiFixtureId} value={String(fixture.apiFixtureId ?? "-")} />
        <PredictionInfo label={details.apiLeagueId} value={String(fixture.league.apiLeagueId ?? "-")} />
        <PredictionInfo label={details.season} value={String(fixture.league.season ?? "-")} />
        <PredictionInfo label={details.kickoff} value={formatDateTime(fixture.kickoffTime, locale)} />
        <PredictionInfo
          label={details.liveFlag}
          value={formatBoolean(isLiveStatus(fixture.statusShort.toUpperCase(), fixture.elapsed), locale)}
        />
        <PredictionInfo label={details.status} value={fixture.statusLong || fixture.statusShort} />
        <PredictionInfo label={details.round} value={fixture.league.round || "-"} />
        <PredictionInfo label={details.venue} value={fixture.venue || "-"} />
        <PredictionInfo label={details.referee} value={fixture.referee || "-"} />
      </div>
    </Card>
  );
}

function FormIndexOverview({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,19,32,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={TrendingUp}
        title={details.formIndex}
        description={details.recentProfile}
        accent="green"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <RecentProfileOverview
          name={fixture.home.name}
          formIndex={insight.formComparison.homeFormIndex}
          profile={insight.formComparison.homeLastFive}
          details={details}
          tone="cyan"
        />
        <RecentProfileOverview
          name={fixture.away.name}
          formIndex={insight.formComparison.awayFormIndex}
          profile={insight.formComparison.awayLastFive}
          details={details}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function RecentProfileOverview({
  name,
  formIndex,
  profile,
  details,
  tone,
}: {
  name: string;
  formIndex: number | null;
  profile: ApiFootballTeamFormProfile | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.formIndex} value={formatNullableNumber(formIndex)} />
        <InfoRow label={details.played} value={formatNullableNumber(profile?.played)} />
        <InfoRow label={details.formSnapshot} value={profile?.form ?? "-"} />
        <InfoRow label={details.attack} value={formatPercent(profile?.att)} />
        <InfoRow label={details.defense} value={formatPercent(profile?.def)} />
        <InfoRow
          label={details.goalsFor}
          value={formatTopLevelGoals(profile?.goals?.for, details)}
        />
        <InfoRow
          label={details.goalsAgainst}
          value={formatTopLevelGoals(profile?.goals?.against, details)}
        />
      </div>
    </div>
  );
}

function StrengthTeamRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "purple" | "magenta";
}) {
  const tone = {
    cyan: "bg-cyan-400",
    purple: "bg-purple-400",
    magenta: "bg-magenta",
  }[color];
  const textTone = {
    cyan: "text-cyan-300",
    purple: "text-purple-300",
    magenta: "text-magenta",
  }[color];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={cn("truncate text-sm font-medium", textTone)}>{label}</span>
        <span className="font-mono text-sm text-white">{formatPercent(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/8">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function AIVerdictCard({
  fixture,
  insight,
  details,
}: {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
}) {
  const verdict = getAIVerdict(fixture, insight, details);

  return (
    <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/8 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{details.aiVerdict}</p>
      <p className="mt-2 text-lg font-bold text-white">{verdict.title}</p>
      <p className="mt-1 text-sm text-gray-300">{verdict.detail}</p>
      {verdict.liveNote ? (
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-cyan-100">
          <span className="mr-2 text-cyan-300">{details.liveContext}</span>
          {verdict.liveNote}
        </div>
      ) : null}
    </div>
  );
}

function ProbabilityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: ProgressBarColor;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-gray-200">{label}</span>
        <span className="font-mono text-sm text-white">{formatPercent(value)}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="lg" className="w-full" />
    </div>
  );
}

function ApiPredictionCard({
  insight,
  details,
  locale,
}: {
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  locale: string;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(14,20,34,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={BrainCircuit}
        title={details.apiAdvice}
        description={details.matchOverview}
        accent="gold"
      />
      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-amber-400/15 bg-amber-400/8 p-4">
          <p className="text-sm leading-6 text-amber-50/90">
            {insight.apiAdvice || details.noPrediction}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <PredictionInfo label={details.winnerLean} value={insight.apiWinner?.name} />
          <PredictionInfo label={details.winnerId} value={stringValue(insight.apiWinner?.id)} />
          <PredictionInfo label={details.winnerNote} value={insight.apiWinner?.comment} />
          <PredictionInfo
            label={details.winOrDraw}
            value={formatBoolean(insight.apiWinOrDraw, locale)}
          />
          <PredictionInfo label={details.overUnder} value={insight.apiUnderOver} />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.28em] text-gray-500">{details.likelyScore}</p>
            <Goal size={14} className="text-cyan-300" />
          </div>
          <p className="mt-2 font-mono text-3xl font-black text-white">
            {formatScorePrediction(insight.apiPredictedGoals) ?? "-"}
          </p>
          {!formatScorePrediction(insight.apiPredictedGoals) ? (
            <p className="mt-2 text-sm text-gray-500">{details.predictedGoalsUnavailable}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function CommunityCard({
  insight,
  copy,
  fixture,
  locale,
}: {
  insight: ApiFootballAIInsightDetail;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  fixture: ApiFootballFixture;
  locale: string;
}) {
  const sentiment = insight.communitySentiment;
  if (!sentiment) return null;

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,17,32,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Users}
        title={copy.labels.community}
        description={`${formatNumber(sentiment.totalVotes, locale)} ${copy.labels.votes}`}
        accent="purple"
      />
      {sentiment.totalVotes > 0 ? (
        <div className="mt-4 space-y-4">
          <ProbabilityRow label={fixture.home.name} value={sentiment.homePercentage} color="cyan" />
          <ProbabilityRow label={copy.labels.draw} value={sentiment.drawPercentage} color="purple" />
          <ProbabilityRow label={fixture.away.name} value={sentiment.awayPercentage} color="magenta" />
        </div>
      ) : (
        <div className="mt-4">
          <EmptyState label={(detailCopy[locale] ?? detailCopy.en).noCommunityVotes} />
        </div>
      )}
    </Card>
  );
}

function ComparisonPanel({
  comparison,
  labels,
  details,
  homeName,
  awayName,
}: {
  comparison: ApiFootballAIInsightDetail["comparison"];
  labels: Record<string, string>;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
}) {
  const rows = Object.entries(comparison);

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={BarChart3}
        title={details.sourceComparison}
        description={details.matchOverview}
        accent="purple"
      />
      <div className="mt-5 space-y-4">
        {rows.length === 0 ? (
          <EmptyState label={details.noComparison} />
        ) : (
          rows.map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-white/4 p-4">
              <div className="mb-3 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-white">{labels[key] ?? key}</span>
                <span className="font-mono text-gray-400">
                  {formatPercent(value.home)} / {formatPercent(value.away)}
                </span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <TeamShare label={homeName} value={value.home} color="cyan" />
                <TeamShare label={awayName} value={value.away} color="magenta" />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function ModelStrengthCard({
  insight,
  fixture,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  fixture: ApiFootballFixture;
  details: LocalizedDetailCopy;
}) {
  const favorite =
    insight.favoriteTeam === "home"
      ? fixture.home.name
      : insight.favoriteTeam === "away"
        ? fixture.away.name
        : insight.favoriteTeam;

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={BrainCircuit}
        title={details.modelDiagnostics}
        description={details.diagnosticDescription}
        accent="cyan"
      />
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PredictionInfo label={details.favoriteTeam} value={favorite} />
        <PredictionInfo label={details.strengthGap} value={formatNullableNumber(insight.strengthGap)} />
        <PredictionInfo label={details.homeAdvantage} value={formatMultiplier(insight.homeAdvantageFactor)} />
      </div>
      <div className="mt-5 space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <StrengthTeamRow
          label={`${fixture.home.name} · ${details.homeStrength}`}
          value={clampPercent(insight.homeStrength ?? 0)}
          color="cyan"
        />
        <StrengthTeamRow
          label={`${fixture.away.name} · ${details.awayStrength}`}
          value={clampPercent(insight.awayStrength ?? 0)}
          color="magenta"
        />
      </div>
    </Card>
  );
}

function KeyFactorsPanel({
  factors,
  copy,
}: {
  factors: string[];
  copy: ReturnType<typeof getAIInsightPageCopy>;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,19,32,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Sparkles}
        title={copy.labels.keyFactors}
        description={copy.sections.matchInsights}
        accent="cyan"
      />
      <div className="mt-5 space-y-3">
        {factors.length === 0 ? (
          <EmptyState label={copy.empty.description} />
        ) : (
          factors.map((factor) => (
            <div
              key={factor}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300"
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan-300" />
              <span className="leading-6">{factor}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function TeamFormCard({
  name,
  profile,
  tone,
  details,
}: {
  name: string;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
  details: LocalizedDetailCopy;
}) {
  if (!profile) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <EmptyState label={details.noPrediction} />
      </div>
    );
  }

  const league = profile.league;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";
  const form = String(profile.form || league?.form || "")
    .split("")
    .filter((value): value is "W" | "D" | "L" => value === "W" || value === "D" || value === "L");

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className={cn("text-lg font-bold", accent)}>{name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">
            {details.seasonPulse}
          </p>
        </div>
        <span className="font-mono text-sm text-gray-400">
          {formatInteger(profile.played ?? league?.fixtures?.played?.total ?? 0)}
        </span>
      </div>

      {form.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {form.map((result, index) => (
            <span
              key={`${name}-${result}-${index}`}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black",
                result === "W" && "bg-green-500/18 text-green-300",
                result === "D" && "bg-amber-500/18 text-amber-300",
                result === "L" && "bg-red-500/18 text-red-300"
              )}
            >
              {result}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatChip label={details.formSnapshot} value={profile.form ?? league?.form ?? "-"} />
        <StatChip label={details.attack} value={formatPercent(profile.att)} />
        <StatChip label={details.defense} value={formatPercent(profile.def)} />
        <StatChip label={details.played} value={league?.fixtures?.played?.total} />
        <StatChip label={details.wins} value={league?.fixtures?.wins?.total} />
        <StatChip label={details.draws} value={league?.fixtures?.draws?.total} />
        <StatChip label={details.losses} value={league?.fixtures?.loses?.total} />
        <StatChip
          label={details.goalsFor}
          value={formatTotalAndAverage(
            league?.goals?.for?.total?.total,
            league?.goals?.for?.average?.total,
            details
          )}
        />
        <StatChip
          label={details.goalsAgainst}
          value={formatTotalAndAverage(
            league?.goals?.against?.total?.total,
            league?.goals?.against?.average?.total,
            details
          )}
        />
      </div>
    </div>
  );
}

function GoalTimingCard({
  title,
  profile,
  color,
}: {
  title: string;
  profile: ApiFootballTeamFormProfile | null;
  color: "cyan" | "magenta";
}) {
  const minuteMap = profile?.goals?.for?.minute ?? profile?.league?.goals?.for?.minute;
  const buckets = minuteBuckets.map((bucket) => ({
    bucket,
    total: minuteMap?.[bucket]?.total ?? 0,
    percentage: minuteMap?.[bucket]?.percentage ?? null,
  }));
  const maxTotal = Math.max(1, ...buckets.map((item) => item.total));
  const barClass = color === "cyan" ? "bg-cyan-400" : "bg-magenta";

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="mb-4 flex items-center gap-2">
        <Goal size={15} className={color === "cyan" ? "text-cyan-300" : "text-magenta"} />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="flex h-44 items-end gap-2">
        {buckets.map((item) => (
          <div key={item.bucket} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-mono text-gray-500">{item.total}</span>
            <div className="flex h-28 w-full items-end rounded-full bg-white/6 p-1">
              <div
                className={cn("w-full rounded-full transition-all duration-500", barClass)}
                style={{ height: `${Math.max(8, Math.round((item.total / maxTotal) * 100))}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500">{item.bucket}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InjuryImpactCard({
  injuryImpact,
  homeName,
  awayName,
  copy,
  details,
}: {
  injuryImpact: ApiFootballAIInsightDetail["injuryImpact"];
  homeName: string;
  awayName: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  details: LocalizedDetailCopy;
}) {
  if (!injuryImpact) {
    return (
      <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
        <SectionHeading
          icon={HeartPulse}
          title={details.injuryDesk}
          description={copy.labels.injuryImpact}
          accent="gold"
        />
        <div className="mt-4">
          <EmptyState label={details.noImpact} />
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={HeartPulse}
        title={details.injuryDesk}
        description={copy.labels.injuryImpact}
        accent="gold"
      />
      <div className="mt-4 grid gap-4">
        <InjuryTeamCard
          name={homeName}
          impact={injuryImpact.homeImpact}
          injuries={injuryImpact.homeInjuries}
          details={details}
          tone="cyan"
        />
        <InjuryTeamCard
          name={awayName}
          impact={injuryImpact.awayImpact}
          injuries={injuryImpact.awayInjuries}
          details={details}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function InjuryTeamCard({
  name,
  impact,
  injuries,
  details,
  tone,
}: {
  name: string;
  impact: number | null;
  injuries: string[];
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const toneClasses =
    tone === "cyan"
      ? "border-cyan-400/15 bg-cyan-400/6 text-cyan-200"
      : "border-magenta/15 bg-magenta/6 text-magenta";

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">{name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">
            {details.teamImpact}
          </p>
        </div>
        <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", toneClasses)}>
          {formatSlashMetric(impact, 10)}
        </span>
      </div>
      <p className="mt-3 text-sm text-gray-300">{getImpactDescription(impact, details)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {injuries.length > 0 ? (
          injuries.map((injury) => (
            <TagPill key={`${name}-${injury}`} tone={tone}>
              {injury}
            </TagPill>
          ))
        ) : (
          <TagPill tone="neutral">{details.noImpact}</TagPill>
        )}
      </div>
    </div>
  );
}

function HeadToHeadCard({
  history,
  summary,
  homeName,
  awayName,
  details,
  locale,
}: {
  history: InsightHeadToHeadRecord[];
  summary: ApiFootballAIInsightDetail["h2hSummary"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
  locale: string;
}) {
  const hasSummary = !!summary && summary.totalMatches > 0;

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Swords}
        title={details.headToHead}
        description={details.matchOverview}
        accent="purple"
      />
      {hasSummary ? (
        <H2HSummaryBoard
          summary={summary}
          homeName={homeName}
          awayName={awayName}
          details={details}
        />
      ) : null}
      <div className="mt-4 space-y-3">
        {history.length === 0 ? (
          hasSummary ? null : <EmptyState label={details.noHistory} />
        ) : (
          history.map((match) => (
            <div
              key={match.fixtureId}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                <span>{formatDateTime(match.date, locale)}</span>
                <span>
                  {match.league?.name}
                  {match.league?.season ? ` · ${match.league.season}` : ""}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0 text-sm text-gray-300">
                  <p className="truncate font-medium text-white">{match.teams.home.name}</p>
                  <p className="truncate">{match.teams.away.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-2xl font-black text-white">
                    {formatScore(match.goals.home)}:{formatScore(match.goals.away)}
                  </p>
                  {formatHeadToHeadFulltime(match.score?.fulltime) ? (
                    <p className="text-xs text-gray-500">
                      {details.fulltime}: {formatHeadToHeadFulltime(match.score?.fulltime)}
                    </p>
                  ) : null}
                  {formatHeadToHeadFulltime(match.score?.halftime) ? (
                    <p className="text-xs text-gray-500">
                      {details.halftime}: {formatHeadToHeadFulltime(match.score?.halftime)}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
                <InfoRow label={details.round} value={match.league?.round || "-"} />
                <InfoRow label={details.country} value={match.league?.country || "-"} />
                <div className="flex items-start justify-between gap-4">
                  <span className="text-gray-500">{details.status}</span>
                  <StatusPill status={match.status?.short || "-"} />
                </div>
                <InfoRow
                  label={details.venue}
                  value={formatVenue(match.venue)}
                />
                <InfoRow label={details.referee} value={match.referee || "-"} />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

function StandingsCard({
  standings,
  homeName,
  awayName,
  details,
}: {
  standings: ApiFootballAIInsightDetail["standings"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Trophy}
        title={details.standings}
        description={details.leaguePosition}
        accent="gold"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <StandingColumn name={homeName} standing={standings?.home ?? null} details={details} tone="cyan" />
        <StandingColumn name={awayName} standing={standings?.away ?? null} details={details} tone="magenta" />
      </div>
    </Card>
  );
}

function StandingColumn({
  name,
  standing,
  details,
  tone,
}: {
  name: string;
  standing: ApiFootballAIInsightStanding | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  if (!standing) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
        <div className="mt-3">
          <EmptyState label={details.noPrediction} />
        </div>
      </div>
    );
  }

  const form = String(standing.form ?? "")
    .split("")
    .filter((value): value is "W" | "D" | "L" => value === "W" || value === "D" || value === "L");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className={cn("truncate text-sm font-bold", accent)}>{name}</h3>
          {standing.description ? (
            <p className="mt-1 text-xs text-gray-500">{standing.description}</p>
          ) : null}
        </div>
        {typeof standing.rank === "number" ? (
          <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-sm font-black text-white">
            #{standing.rank}
          </span>
        ) : null}
      </div>

      {form.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {form.map((result, index) => (
            <span
              key={`${name}-${result}-${index}`}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black",
                result === "W" && "bg-green-500/18 text-green-300",
                result === "D" && "bg-amber-500/18 text-amber-300",
                result === "L" && "bg-red-500/18 text-red-300"
              )}
            >
              {result}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatChip label={details.pointsLabel} value={formatNullableNumber(standing.points)} />
        <StatChip label={details.played} value={formatNullableNumber(standing.played)} />
        <StatChip label={details.goalDiff} value={formatSignedNumber(standing.goalDiff)} />
        <StatChip
          label={`${details.wins}/${details.draws}/${details.losses}`}
          value={`${formatNullableNumber(standing.win)}/${formatNullableNumber(
            standing.draw
          )}/${formatNullableNumber(standing.lose)}`}
        />
        <StatChip label={details.goalsFor} value={formatNullableNumber(standing.goalsFor)} />
        <StatChip label={details.goalsAgainst} value={formatNullableNumber(standing.goalsAgainst)} />
      </div>
    </div>
  );
}

function TeamStatsCard({
  teamStats,
  homeName,
  awayName,
  details,
}: {
  teamStats: ApiFootballAIInsightDetail["teamStats"];
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={BarChart3}
        title={details.teamStatsSeason}
        description={details.seasonAverages}
        accent="cyan"
      />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TeamStatsColumn name={homeName} stats={teamStats?.home ?? null} details={details} tone="cyan" />
        <TeamStatsColumn name={awayName} stats={teamStats?.away ?? null} details={details} tone="magenta" />
      </div>
    </Card>
  );
}

function TeamStatsColumn({
  name,
  stats,
  details,
  tone,
}: {
  name: string;
  stats: ApiFootballAIInsightTeamStats | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  if (!stats) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
        <div className="mt-3">
          <EmptyState label={details.noPrediction} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className={cn("truncate text-sm font-bold", accent)}>{name}</h3>
        {stats.formations ? (
          <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 font-mono text-xs text-gray-200">
            {stats.formations}
          </span>
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatChip label={details.avgScored} value={formatDecimal(stats.avgGoalsFor)} />
        <StatChip label={details.avgConceded} value={formatDecimal(stats.avgGoalsAgainst)} />
        <StatChip label={details.possession} value={formatPossession(stats.avgBallPossession)} />
        <StatChip label={details.cleanSheets} value={formatNullableNumber(stats.cleanSheets)} />
        <StatChip label={details.failedToScore} value={formatNullableNumber(stats.failedToScore)} />
        <StatChip label={details.penalties} value={formatNullableNumber(stats.penaltyScored)} />
        <StatChip label={details.avgCards} value={formatDecimal(stats.cardsAvg)} />
      </div>
    </div>
  );
}

function H2HSummaryBoard({
  summary,
  homeName,
  awayName,
  details,
}: {
  summary: NonNullable<ApiFootballAIInsightDetail["h2hSummary"]>;
  homeName: string;
  awayName: string;
  details: LocalizedDetailCopy;
}) {
  const total = summary.totalMatches || 1;
  const segments = [
    { label: homeName, value: summary.homeWins, className: "bg-cyan-400" },
    { label: details.drawOption, value: summary.draws, className: "bg-amber-400" },
    { label: awayName, value: summary.awayWins, className: "bg-magenta" },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="uppercase tracking-[0.24em] text-gray-500">{details.h2hSummaryTitle}</span>
        <div className="flex items-center gap-3 text-gray-400">
          <span>
            {details.totalMeetings}: <span className="font-mono text-white">{summary.totalMatches}</span>
          </span>
          <span>
            {details.avgGoals}: <span className="font-mono text-white">{formatDecimal(summary.avgGoals)}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/8">
        {segments.map((segment) => (
          <div
            key={segment.label}
            className={segment.className}
            style={{ width: `${Math.round((segment.value / total) * 100)}%` }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <div>
          <p className="font-mono text-lg font-black text-cyan-300">{summary.homeWins}</p>
          <p className="truncate text-gray-500">{homeName}</p>
        </div>
        <div>
          <p className="font-mono text-lg font-black text-amber-300">{summary.draws}</p>
          <p className="text-gray-500">{details.drawOption}</p>
        </div>
        <div>
          <p className="font-mono text-lg font-black text-magenta">{summary.awayWins}</p>
          <p className="truncate text-gray-500">{awayName}</p>
        </div>
      </div>

      {summary.recentForm.length > 0 ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {summary.recentForm.map((result, index) => {
            const upper = String(result).toUpperCase();
            return (
              <span
                key={`h2h-form-${index}`}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-black",
                  upper === "H" && "bg-cyan-500/18 text-cyan-300",
                  upper === "D" && "bg-amber-500/18 text-amber-300",
                  upper === "A" && "bg-magenta/18 text-magenta"
                )}
              >
                {upper}
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function SupplementalStatsCard({
  title,
  icon: Icon,
  tone,
  rows,
  empty,
}: {
  title: string;
  icon: LucideIcon;
  tone: "cyan" | "magenta";
  rows: Array<{ label: string; content: React.ReactNode[] | undefined }>;
  empty: string;
}) {
  const iconClass = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Icon size={15} className={iconClass} />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{row.label}</p>
            <div className="flex flex-wrap gap-2">
              {row.content && row.content.length > 0 ? row.content : <TagPill tone="neutral">{empty}</TagPill>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TrendCard({
  title,
  icon: Icon,
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  title: string;
  icon: LucideIcon;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-amber-300" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        <TrendColumn name={homeName} details={details} profile={homeProfile} tone="cyan" />
        <TrendColumn name={awayName} details={details} profile={awayProfile} tone="magenta" />
      </div>
    </Card>
  );
}

function TrendColumn({
  name,
  details,
  profile,
  tone,
}: {
  name: string;
  details: LocalizedDetailCopy;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
}) {
  const biggest =
    (profile?.biggest as ExtendedBiggest | undefined) ??
    (profile?.league?.biggest as ExtendedBiggest | undefined);
  const streak = biggest?.streak;
  const goals = biggest?.goals;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.biggestWin} value={formatScoreline(biggest?.wins)} />
        <InfoRow label={details.biggestLoss} value={formatScoreline(biggest?.loses)} />
        <InfoRow label={details.biggestGoalsFor} value={formatNullableNumber(goals?.for?.home ?? goals?.for?.away)} />
        <InfoRow label={details.biggestGoalsAgainst} value={formatNullableNumber(goals?.against?.home ?? goals?.against?.away)} />
        <InfoRow label={details.winStreak} value={formatNullableNumber(streak?.wins)} />
        <InfoRow label={details.drawStreak} value={formatNullableNumber(streak?.draws)} />
        <InfoRow label={details.lossStreak} value={formatNullableNumber(streak?.loses)} />
      </div>
    </div>
  );
}

function DisciplineCard({
  title,
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  title: string;
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <Shield size={15} className="text-green-300" />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <div className="mt-4 space-y-4">
        <DisciplineColumn
          name={homeName}
          details={details}
          profile={homeProfile}
          tone="cyan"
        />
        <DisciplineColumn
          name={awayName}
          details={details}
          profile={awayProfile}
          tone="magenta"
        />
      </div>
    </Card>
  );
}

function AdvancedStatsCard({
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(10,16,28,0.96),rgba(7,10,18,0.98))] p-5">
      <div className="flex items-center gap-2">
        <BarChart3 size={15} className="text-cyan-300" />
        <h2 className="text-sm font-semibold text-white">{details.advancedStats}</h2>
      </div>
      <div className="mt-4 space-y-5">
        <UnderOverSection
          name={homeName}
          profile={homeProfile}
          details={details}
          tone="cyan"
        />
        <UnderOverSection
          name={awayName}
          profile={awayProfile}
          details={details}
          tone="magenta"
        />
        <CardsBreakdownSection
          details={details}
          homeName={homeName}
          awayName={awayName}
          homeProfile={homeProfile}
          awayProfile={awayProfile}
        />
      </div>
    </Card>
  );
}

function UnderOverSection({
  name,
  profile,
  details,
  tone,
}: {
  name: string;
  profile: ApiFootballTeamFormProfile | null;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const goalsForUnderOver = profile?.goals?.for?.under_over ?? profile?.league?.goals?.for?.under_over;
  const goalsAgainstUnderOver =
    profile?.goals?.against?.under_over ?? profile?.league?.goals?.against?.under_over;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";
  const ranges = ["0.5", "1.5", "2.5", "3.5", "4.5"] as const;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-gray-500">{details.underOver}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.goalsFor}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {ranges.map((range) => (
              <InfoRow
                key={`${name}-for-${range}`}
                label={range}
                value={`${formatNullableNumber(goalsForUnderOver?.[range]?.over)} / ${formatNullableNumber(
                  goalsForUnderOver?.[range]?.under
                )}`}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.goalsAgainst}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {ranges.map((range) => (
              <InfoRow
                key={`${name}-against-${range}`}
                label={range}
                value={`${formatNullableNumber(goalsAgainstUnderOver?.[range]?.over)} / ${formatNullableNumber(
                  goalsAgainstUnderOver?.[range]?.under
                )}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimingBreakdownSection({
  title,
  homeName,
  awayName,
  homeMap,
  awayMap,
}: {
  title: string;
  homeName: string;
  awayName: string;
  homeMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  awayMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <MinuteList name={homeName} minuteMap={homeMap} tone="cyan" />
        <MinuteList name={awayName} minuteMap={awayMap} tone="magenta" />
      </div>
    </div>
  );
}

function CardsBreakdownSection({
  details,
  homeName,
  awayName,
  homeProfile,
  awayProfile,
}: {
  details: LocalizedDetailCopy;
  homeName: string;
  awayName: string;
  homeProfile: ApiFootballTeamFormProfile | null;
  awayProfile: ApiFootballTeamFormProfile | null;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{details.cardsBreakdown}</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <CardsList
          name={homeName}
          yellowMap={getProfileCards(homeProfile)?.yellow}
          redMap={getProfileCards(homeProfile)?.red}
          details={details}
          tone="cyan"
        />
        <CardsList
          name={awayName}
          yellowMap={getProfileCards(awayProfile)?.yellow}
          redMap={getProfileCards(awayProfile)?.red}
          details={details}
          tone="magenta"
        />
      </div>
    </div>
  );
}

function MinuteList({
  name,
  minuteMap,
  tone,
}: {
  name: string;
  minuteMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <h4 className={cn("text-sm font-bold", accent)}>{name}</h4>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        {minuteBuckets.map((bucket) => (
          <InfoRow
            key={`${name}-${bucket}`}
            label={bucket}
            value={formatMinuteStat(minuteMap?.[bucket])}
          />
        ))}
      </div>
    </div>
  );
}

function CardsList({
  name,
  yellowMap,
  redMap,
  details,
  tone,
}: {
  name: string;
  yellowMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  redMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined;
  details: LocalizedDetailCopy;
  tone: "cyan" | "magenta";
}) {
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <h4 className={cn("text-sm font-bold", accent)}>{name}</h4>
      <div className="mt-3 space-y-3">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.cardsLabel}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {minuteBuckets.map((bucket) => (
              <InfoRow
                key={`${name}-yellow-${bucket}`}
                label={bucket}
                value={formatMinuteStat(yellowMap?.[bucket])}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.24em] text-gray-500">{details.redCards}</p>
          <div className="grid gap-2 text-sm text-gray-300">
            {minuteBuckets.map((bucket) => (
              <InfoRow
                key={`${name}-red-${bucket}`}
                label={bucket}
                value={formatMinuteStat(redMap?.[bucket])}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function DisciplineColumn({
  name,
  details,
  profile,
  tone,
}: {
  name: string;
  details: LocalizedDetailCopy;
  profile: ApiFootballTeamFormProfile | null;
  tone: "cyan" | "magenta";
}) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  const cards = getProfileCards(profile);
  const yellowCards = sumMinuteTotals(cards?.yellow);
  const cleanSheets = profile?.clean_sheet?.total ?? league?.clean_sheet?.total;
  const failedToScore = profile?.failed_to_score?.total ?? league?.failed_to_score?.total;
  const penalties = profile?.penalty ?? league?.penalty;
  const accent = tone === "cyan" ? "text-cyan-300" : "text-magenta";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className={cn("text-sm font-bold", accent)}>{name}</h3>
      <div className="mt-3 grid gap-2 text-sm text-gray-300">
        <InfoRow label={details.cardsLabel} value={formatNullableNumber(yellowCards)} />
        <InfoRow label={details.cleanSheets} value={formatNullableNumber(cleanSheets)} />
        <InfoRow label={details.failedToScore} value={formatNullableNumber(failedToScore)} />
        <InfoRow
          label={details.penalties}
          value={`${formatNullableNumber(penalties?.scored?.total)} / ${formatNullableNumber(
            penalties?.total
          )}`}
        />
      </div>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "cyan" | "purple" | "gold" | "green";
}) {
  const accentClass = {
    cyan: "text-cyan-300",
    purple: "text-purple-300",
    gold: "text-amber-300",
    green: "text-green-300",
  } as const;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Icon size={15} className={accentClass[accent]} />
        <h2 className="text-sm font-semibold text-white">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
    </div>
  );
}

function PredictionInfo({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-white">{value || "-"}</p>
    </div>
  );
}

function TeamShare({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: ProgressBarColor;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-xs">
        <span className="uppercase tracking-[0.24em] text-gray-500">{label}</span>
        <span className="font-mono text-gray-200">{formatPercent(value)}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="md" />
    </div>
  );
}

function StatChip({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value ?? "-"}</p>
    </div>
  );
}

function TagPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "cyan" | "magenta" | "neutral";
}) {
  const classes = {
    cyan: "border-cyan-400/15 bg-cyan-400/8 text-cyan-200",
    magenta: "border-magenta/15 bg-magenta/8 text-magenta",
    neutral: "border-white/10 bg-white/6 text-gray-300",
  } as const;

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-xs font-medium", classes[tone])}>
      {children}
    </span>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/4 px-4 py-5 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "FT" || normalized === "AET" || normalized === "PEN"
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : normalized === "NS"
        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
        : normalized === "PST" || normalized === "CANC"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
          : "border-red-400/20 bg-red-400/10 text-red-300";

  return (
    <span className={cn("rounded-full border px-2.5 py-1 text-[11px] font-semibold", tone)}>
      {status}
    </span>
  );
}

function HeroStatusBadge({
  fixture,
  copy,
  details,
}: {
  fixture: ApiFootballFixture;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  details: LocalizedDetailCopy;
}) {
  const short = fixture.statusShort.toUpperCase();
  const live = isLiveStatus(short, fixture.elapsed);
  const finished = isFinishedStatus(short);
  const hold = isHoldStatus(short);
  const className = live
    ? "border-red-400/20 bg-red-400/10 text-red-300"
    : finished
      ? "border-green-400/20 bg-green-400/10 text-green-300"
      : hold
        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
        : "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold sm:text-[11px]", className)}>
      {getStatusLabel(fixture, copy, details)}
    </span>
  );
}

function formatDateTime(value: string, locale: string) {
  return formatMatchDateTimeWithZone(value, localeMap[locale] ?? "th-TH");
}

function formatPercent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}%` : "-";
}

function formatSlashMetric(value: number | null | undefined, max: number) {
  return typeof value === "number" ? `${trimDecimal(value)}/${max}` : `-/${max}`;
}

function formatHeatMeter(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}/100` : "-/100";
}

function formatMultiplier(value: number | null | undefined) {
  return typeof value === "number" ? `x${value.toFixed(2)}` : "-";
}

function formatBoolean(value: boolean | null | undefined, locale: string) {
  if (value === null || value === undefined) return "-";
  if (locale === "th") return value ? "ใช่" : "ไม่";
  return value ? "Yes" : "No";
}

function formatScore(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "-";
}

function formatScorePrediction(
  value: ApiFootballAIInsightDetail["apiPredictedGoals"]
) {
  if (!value) return null;
  const home = normalizePredictedGoalValue(value.home);
  const away = normalizePredictedGoalValue(value.away);
  if (home === null || away === null) return null;
  return `${home} : ${away}`;
}

function formatNumber(value: number | null | undefined, locale: string) {
  if (typeof value !== "number") return "-";
  return value.toLocaleString(localeMap[locale] ?? "en-US");
}

function formatInteger(value: number) {
  return Number.isFinite(value) ? String(Math.round(value)) : "-";
}

function formatNullableNumber(value: number | null | undefined) {
  return typeof value === "number" ? String(value) : "-";
}

function formatSignedNumber(value: number | null | undefined) {
  if (typeof value !== "number") return "-";
  return value > 0 ? `+${value}` : String(value);
}

function formatDecimal(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPossession(value: number | string | null | undefined) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "number") return `${Math.round(value)}%`;
  const trimmed = value.trim();
  if (!trimmed) return "-";
  return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
}

function formatProbabilitySource(value: string, details: LocalizedDetailCopy) {
  if (value === "comparison_model") return details.sourceComparison;
  if (value === "api_prediction") return details.sourceApi;
  return value;
}

function hasStandings(standings: ApiFootballAIInsightDetail["standings"]) {
  if (!standings) return false;
  return (
    typeof standings.home?.rank === "number" ||
    typeof standings.away?.rank === "number"
  );
}

function hasTeamStatsData(teamStats: ApiFootballAIInsightDetail["teamStats"]) {
  return !!teamStats && (!!teamStats.home || !!teamStats.away);
}

function stringValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "-" : String(value);
}

function formatTotalAndAverage(
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

function formatTopLevelGoals(
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

function trimDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getConfidenceTone(score: number | null | undefined) {
  if (typeof score !== "number") return "red" as const;
  if (score >= 70) return "green" as const;
  if (score >= 50) return "gold" as const;
  return "red" as const;
}

function getHeatTone(value: number | null | undefined) {
  if (typeof value !== "number") return "gold" as const;
  if (value < 40) return "green" as const;
  if (value < 70) return "gold" as const;
  return "red" as const;
}

function getHeatDescription(
  value: number | null | undefined,
  copy: ReturnType<typeof getAIInsightPageCopy>
) {
  if (typeof value !== "number") return copy.labels.heat;
  if (value < 40) return copy.labels.heatLow;
  if (value < 70) return copy.labels.heatMid;
  return copy.labels.heatHigh;
}

function getConfidenceDescription(
  score: number | null | undefined,
  details: LocalizedDetailCopy
) {
  if (typeof score !== "number") return details.noPrediction;
  if (score >= 70) return details.confidenceHigh;
  if (score >= 50) return details.confidenceMid;
  return details.confidenceLow;
}

function getAIVerdict(
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

function normalizePredictedGoalValue(value: number | string | null | undefined) {
  if (typeof value === "number") return value >= 0 ? trimDecimal(value) : null;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return trimDecimal(parsed);
  }
  return null;
}

function getLiveLeader(fixture: ApiFootballFixture, details: LocalizedDetailCopy) {
  if (!isLiveStatus(fixture.statusShort.toUpperCase(), fixture.elapsed)) return null;
  const home = fixture.score.home ?? 0;
  const away = fixture.score.away ?? 0;
  if (home === away) {
    return `${details.liveLevel} ${fixture.home.name} ${home}-${away} ${fixture.away.name}`;
  }
  const leader = home > away ? fixture.home.name : fixture.away.name;
  return `${leader} ${details.liveLeads} ${home}-${away}`;
}

function getStatusLabel(
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

function getImpactDescription(
  value: number | null | undefined,
  details: LocalizedDetailCopy
) {
  if (typeof value !== "number" || value === 0) return details.noImpact;
  if (value <= 3) return details.impactLow;
  if (value <= 7) return details.impactMid;
  if (value <= 9) return details.impactHigh;
  return details.impactSevere;
}

function sumMinuteTotals(
  minuteMap: Record<string, { total?: number | null; percentage?: string | null }> | undefined
) {
  if (!minuteMap) return null;
  return minuteBuckets.reduce((sum, bucket) => sum + (minuteMap[bucket]?.total ?? 0), 0);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isLiveStatus(short: string, elapsed: number | null) {
  if (typeof elapsed === "number" && elapsed > 0) return true;
  return !["NS", "FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"].includes(short);
}

function isFinishedStatus(short: string) {
  return ["FT", "AET", "PEN"].includes(short);
}

function isHoldStatus(short: string) {
  return ["PST", "CANC", "ABD", "AWD", "WO"].includes(short);
}

function getProfileLineups(profile: ApiFootballTeamFormProfile | null) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  const lineups = profile?.lineups ?? league?.lineups;
  return lineups?.filter(
    (lineup): lineup is Required<Pick<ExtendedLineup, "formation">> & ExtendedLineup =>
      Boolean(lineup?.formation)
  );
}

function getProfileCards(profile: ApiFootballTeamFormProfile | null) {
  const league = profile?.league as ExtendedLeagueData | undefined;
  return profile?.cards ?? league?.cards;
}

function formatScoreline(
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

function formatHeadToHeadFulltime(
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

function formatVenue(
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

function formatMinuteStat(
  value: { total?: number | null; percentage?: string | null } | undefined
) {
  const total = value?.total ?? 0;
  const percentage = value?.percentage;
  if (!percentage) return String(total);
  return `${total} (${percentage})`;
}
