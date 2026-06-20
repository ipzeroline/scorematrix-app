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
  finalResult: string;
  finalWin: string;
  finalDraw: string;
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
  lo: {
    form: "ຟອມ",
    att: "ເກມບຸກ",
    def: "ເກມຮັບ",
    poisson_distribution: "Poisson",
    h2h: "H2H",
    goals: "ປະຕູ",
    total: "ພາບລວມ",
  },
  my: {
    form: "ဖောင်",
    att: "တိုက်စစ်",
    def: "ခံစစ်",
    poisson_distribution: "Poisson",
    h2h: "H2H",
    goals: "ဂိုး",
    total: "စုစုပေါင်း",
  },
  km: {
    form: "ទម្រង់",
    att: "ប្រយុទ្ធ",
    def: "ការពារ",
    poisson_distribution: "Poisson",
    h2h: "H2H",
    goals: "គ្រាប់បាល់",
    total: "សរុប",
  },
  zh: {
    form: "状态",
    att: "进攻",
    def: "防守",
    poisson_distribution: "Poisson",
    h2h: "交锋",
    goals: "进球",
    total: "总览",
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
    heatMeter: "ความมันส์ของเกม",
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
    finalResult: "สรุปผลการแข่งขัน",
    finalWin: "ชนะ",
    finalDraw: "จบเสมอ",
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
    apiFixtureId: "รหัสแมตช์",
    apiLeagueId: "รหัสลีก",
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
    sourceApi: "พยากรณ์จากโมเดล",
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
    heatMeter: "Match excitement",
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
    finalResult: "Final result",
    finalWin: "beat",
    finalDraw: "finished level with",
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
    apiFixtureId: "fixture ID",
    apiLeagueId: "league ID",
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
    sourceApi: "Model prediction",
    modelDiagnostics: "Strength signals",
    diagnosticDescription: "Compare team strength and the model's projected gap",
    homeStrength: "Home strength",
    awayStrength: "Away strength",
  },
  lo: {
    back: "ກັບໄປ AI Insight",
    liveNow: "ກໍາລັງແຂ່ງ",
    generatedAt: "AI ອັບເດດ",
    matchOverview: "ພາບລວມແມຕຊ໌",
    confidenceSummary: "ສະຫຼຸບຄວາມໝັ້ນໃຈ",
    probabilityBreakdown: "ຄວາມນ່າຈະເປັນຜົນແຂ່ງ",
    heatMeter: "ຄວາມສູສີຂອງແມຕຊ໌",
    homeAdvantage: "ຂໍ້ໄດ້ປຽບເຈົ້າບ້ານ",
    likelyScore: "ສະກໍຄາດການ",
    apiAdvice: "ຄໍາແນະນໍາຈາກໂມເດວ",
    winnerLean: "ຝັ່ງທີ່ໂມເດວເອນອຽງ",
    winnerNote: "ໝາຍເຫດຜູ້ຊະນະ",
    winOrDraw: "ຊະນະ ຫຼື ສະເໝີ",
    overUnder: "ສູງ/ຕ່ໍາ",
    drawOption: "ສະເໝີ",
    aiVerdict: "AI ມອງວ່າ",
    verdictHome: "ເຈົ້າບ້ານໄດ້ປຽບກວ່າ",
    verdictAway: "ທີມເຢືອນໄດ້ປຽບກວ່າ",
    verdictDraw: "ໂອກາດສະເໝີສູງ",
    finalResult: "ສະຫຼຸບຜົນແຂ່ງຂັນ",
    finalWin: "ຊະນະ",
    finalDraw: "ຈົບສະເໝີກັບ",
    liveContext: "ບໍລິບົດສົດ",
    predictedGoalsUnavailable: "ບໍ່ມີສະກໍຄາດການທີ່ເຊື່ອຖືໄດ້",
    noCommunityVotes: "ຍັງບໍ່ມີໂຫວດຊຸມຊົນສໍາລັບແມຕຊ໌ນີ້",
    liveLeads: "ນໍາຢູ່",
    liveLevel: "ສະກໍສົດ",
    matchupBoard: "ການປຽບທຽບຄູ່ແຂ່ງ",
    formDeepDive: "ວິເຄາະຟອມເຊິ່ງລຶກ",
    formSnapshot: "ຟອມລ່າສຸດ",
    seasonPulse: "ພາບລວມລະດູການ",
    minuteGoals: "ເວລາທໍາປະຕູ",
    frequentLineups: "ແຜນທີ່ໃຊ້ເລື້ອຍ",
    biggestTrends: "ແນວໂນ້ມສໍາຄັນ",
    discipline: "ວິໄນເກມ",
    specialStats: "ສັນຍານເພີ່ມເຕີມ",
    headToHead: "ສະຖິຕິພົບກັນ",
    advancedStats: "ສະຖິຕິຂັ້ນສູງ",
    goalsForTiming: "ເວລາຍິງໄດ້",
    goalsAgainstTiming: "ເວລາເສຍປະຕູ",
    underOver: "ສະຖິຕິສູງ/ຕ່ໍາ",
    cardsBreakdown: "ໃບເຫຼືອງ/ໃບແດງຕາມເວລາ",
    redCards: "ໃບແດງ",
    halftime: "ເຄິ່ງທໍາອິດ",
    fulltime: "ເຕັມເວລາ",
    country: "ປະເທດ",
    referee: "ກໍາມະການ",
    venue: "ສະໜາມ",
    round: "ຮອບ",
    status: "ສະຖານະ",
    injuryDesk: "ຜົນກະທົບຜູ້ຫຼິ້ນເຈັບ",
    teamImpact: "ຜົນກະທົບຕໍ່ທີມ",
    quickTake: "ສະຫຼຸບໄວ",
    mainPrediction: "ສະຫຼຸບຈາກ AI",
    tabSummary: "ສະຫຼຸບ",
    tabModel: "ໂມເດວ",
    tabForm: "ຟອມ",
    tabCommunity: "ຊຸມຊົນ",
    noPrediction: "ບໍ່ມີຂໍ້ມູນພະຍາກອນ",
    noHistory: "ຍັງບໍ່ມີປະຫວັດພົບກັນ",
    noComparison: "ບໍ່ມີຂໍ້ມູນປຽບທຽບ",
    noGeneratedTime: "ບໍ່ລະບຸເວລາອັບເດດ",
    confidenceHigh: "AI ໝັ້ນໃຈສູງ ມີທີມເຕັງຊັດເຈນ",
    confidenceMid: "AI ໝັ້ນໃຈປານກາງ ເກມຍັງເປີດກວ້າງ",
    confidenceLow: "AI ໝັ້ນໃຈຕໍ່າ ຄວາມສ່ຽງພິກລັອກສູງ",
    strengthGap: "ຊ່ອງຫ່າງຄວາມແຂງແກ່ງ",
    favoriteTeam: "ທີມເຕັງ",
    upsetRisk: "ຄວາມສ່ຽງພິກລັອກ",
    noImpact: "ບໍ່ມີຜົນກະທົບເດັ່ນຈາກຜູ້ຫຼິ້ນເຈັບ",
    playersOut: "ຜູ້ຫຼິ້ນເຈັບ",
    cardsLabel: "ໃບເຫຼືອງ",
    cleanSheets: "ຄລີນຊີດ",
    failedToScore: "ຍິງບໍ່ໄດ້",
    penalties: "ຈຸດໂທດ",
    biggestWin: "ຊະນະສູງສຸດ",
    biggestLoss: "ແພ້ສູງສຸດ",
    biggestGoalsFor: "ຍິງສູງສຸດ",
    biggestGoalsAgainst: "ເສຍສູງສຸດ",
    winStreak: "ຊະນະຕິດ",
    drawStreak: "ສະເໝີຕິດ",
    lossStreak: "ແພ້ຕິດ",
    played: "ແຂ່ງ",
    wins: "ຊະນະ",
    draws: "ສະເໝີ",
    losses: "ແພ້",
    goalsFor: "ຍິງໄດ້",
    goalsAgainst: "ເສຍ",
    avgPerMatch: "ສະເລ່ຍ/ນັດ",
    impactLow: "ຜົນກະທົບຕໍ່າ",
    impactMid: "ຜົນກະທົບປານກາງ",
    impactHigh: "ຜົນກະທົບສູງ",
    impactSevere: "ຜົນກະທົບຮຸນແຮງ",
    fixtureMeta: "ຂໍ້ມູນແມຕຊ໌",
    apiFixtureId: "ລະຫັດແມຕຊ໌",
    apiLeagueId: "ລະຫັດລີກ",
    kickoff: "ເວລາເລີ່ມ",
    liveFlag: "ສະຖານະສົດ",
    formIndex: "ດັດຊະນີຟອມ",
    attack: "ເກມບຸກ",
    defense: "ເກມຮັບ",
    recentProfile: "ຟອມ 5 ນັດຫຼ້າສຸດ",
    winnerId: "ລະຫັດທີມເຕັງ",
    season: "ລະດູການ",
    standings: "ຕາຕະລາງຄະແນນ",
    leaguePosition: "ອັນດັບໃນລີກ",
    rankLabel: "ອັນດັບ",
    pointsLabel: "ຄະແນນ",
    goalDiff: "ຜົນຕ່າງປະຕູ",
    teamStatsSeason: "ສະຖິຕິລະດູການ",
    seasonAverages: "ຄ່າສະເລ່ຍທັງລະດູ",
    avgScored: "ຍິງສະເລ່ຍ",
    avgConceded: "ເສຍສະເລ່ຍ",
    possession: "ຄອງບານ",
    avgCards: "ໃບສະເລ່ຍ",
    topFormation: "ແຜນຍອດນິຍົມ",
    h2hSummaryTitle: "ສະຫຼຸບການພົບກັນ",
    totalMeetings: "ພົບກັນທັງໝົດ",
    avgGoals: "ປະຕູສະເລ່ຍ",
    probabilitySource: "ແຫຼ່ງຄວາມນ່າຈະເປັນ",
    sourceComparison: "ໂມເດວປຽບທຽບ",
    sourceApi: "ພະຍາກອນຈາກໂມເດວ",
    modelDiagnostics: "ສັນຍານຄວາມແຂງແກ່ງ",
    diagnosticDescription: "ປຽບທຽບຄວາມແຂງແກ່ງແລະຊ່ອງຫ່າງທີ່ໂມເດວຄາດ",
    homeStrength: "ຄວາມແຂງແກ່ງເຈົ້າບ້ານ",
    awayStrength: "ຄວາມແຂງແກ່ງທີມເຢືອນ",
  },
  my: {
    back: "AI Insight သို့ ပြန်သွား",
    liveNow: "တိုက်ရိုက်ကစားနေသည်",
    generatedAt: "AI အပ်ဒိတ်",
    matchOverview: "ပွဲအကျဉ်းချုပ်",
    confidenceSummary: "ယုံကြည်မှုအကျဉ်းချုပ်",
    probabilityBreakdown: "ရလဒ်ဖြစ်နိုင်ခြေ",
    heatMeter: "ပွဲနီးစပ်မှု",
    homeAdvantage: "အိမ်ကွင်းအားသာချက်",
    likelyScore: "ခန့်မှန်းစကိုး",
    apiAdvice: "မော်ဒယ်အကြံပြုချက်",
    winnerLean: "မော်ဒယ်ဘက်လိုက်သည့်အသင်း",
    winnerNote: "အနိုင်ရနိုင်မှုမှတ်ချက်",
    winOrDraw: "နိုင် သို့မဟုတ် သရေ",
    overUnder: "အောက်/အပေါ်",
    drawOption: "သရေ",
    aiVerdict: "AI သုံးသပ်ချက်",
    verdictHome: "အိမ်ရှင်ဘက်က အသာစီးရှိသည်",
    verdictAway: "ဧည့်အသင်းဘက်က အသာစီးရှိသည်",
    verdictDraw: "သရေဖြစ်နိုင်ခြေ မြင့်သည်",
    finalResult: "ပွဲပြီးရလဒ်",
    finalWin: "အနိုင်ရခဲ့သည်",
    finalDraw: "သရေကျခဲ့သည်",
    liveContext: "တိုက်ရိုက်အခြေအနေ",
    predictedGoalsUnavailable: "ယုံကြည်ရသော ခန့်မှန်းစကိုးမရှိပါ",
    noCommunityVotes: "ဤပွဲအတွက် ကွန်မြူနิตี้မဲ မရှိသေးပါ",
    liveLeads: "ဦးဆောင်နေသည်",
    liveLevel: "တိုက်ရိုက်စကိုး",
    matchupBoard: "ပြိုင်ဘက်နှိုင်းယှဉ်ချက်",
    formDeepDive: "ဖောင်အသေးစိတ်",
    formSnapshot: "နောက်ဆုံးဖောင်",
    seasonPulse: "ရာသီအခြေအနေ",
    minuteGoals: "ဂိုးသွင်းချိန်",
    frequentLineups: "အသုံးများသောဖွဲ့စည်းပုံ",
    biggestTrends: "အရေးကြီးလမ်းကြောင်းများ",
    discipline: "စည်းကမ်း",
    specialStats: "ထပ်ဆောင်းအချက်ပြများ",
    headToHead: "ထိပ်တိုက်တွေ့ဆုံမှု",
    advancedStats: "အဆင့်မြင့်စာရင်းအင်း",
    goalsForTiming: "ဂိုးသွင်းချိန်",
    goalsAgainstTiming: "ဂိုးပေးချိန်",
    underOver: "အောက်/အပေါ်စာရင်း",
    cardsBreakdown: "အဝါ/အနီကတ် အချိန်အလိုက်",
    redCards: "အနီကတ်",
    halftime: "ပထမပိုင်း",
    fulltime: "ပွဲပြီး",
    country: "နိုင်ငံ",
    referee: "ဒိုင်လူကြီး",
    venue: "ကွင်း",
    round: "အဆင့်",
    status: "အခြေအနေ",
    injuryDesk: "ဒဏ်ရာသက်ရောက်မှု",
    teamImpact: "အသင်းသက်ရောက်မှု",
    quickTake: "အမြန်သုံးသပ်ချက်",
    mainPrediction: "AI အကျဉ်းချုပ်",
    tabSummary: "အကျဉ်းချုပ်",
    tabModel: "မော်ဒယ်",
    tabForm: "ဖောင်",
    tabCommunity: "ကွန်မြူနิตี้",
    noPrediction: "ခန့်မှန်းဒေတာမရှိပါ",
    noHistory: "ထိပ်တိုက်တွေ့ဆုံမှု မှတ်တမ်းမရှိသေးပါ",
    noComparison: "နှိုင်းယှဉ်ဒေတာမရှိပါ",
    noGeneratedTime: "အပ်ဒိတ်ချိန်မရှိပါ",
    confidenceHigh: "AI ယုံကြည်မှုမြင့်ပြီး ရေပန်းစားအသင်းရှင်းလင်းသည်",
    confidenceMid: "AI ယုံကြည်မှုအလယ်အလတ်ဖြစ်ပြီး ပွဲဖွင့်နေသေးသည်",
    confidenceLow: "AI ယုံကြည်မှုနိမ့်ပြီး upset အန္တရာယ်မြင့်သည်",
    strengthGap: "အားကွာဟချက်",
    favoriteTeam: "ရေပန်းစားအသင်း",
    upsetRisk: "Upset အန္တရာယ်",
    noImpact: "ဒဏ်ရာရသူများမှ ထင်ရှားသောသက်ရောက်မှုမရှိပါ",
    playersOut: "ဒဏ်ရာရကစားသမား",
    cardsLabel: "အဝါကတ်",
    cleanSheets: "Clean sheet",
    failedToScore: "ဂိုးမသွင်းနိုင်",
    penalties: "ပင်နယ်တီ",
    biggestWin: "အကြီးဆုံးနိုင်ပွဲ",
    biggestLoss: "အကြီးဆုံးရှုံးပွဲ",
    biggestGoalsFor: "အများဆုံးသွင်းဂိုး",
    biggestGoalsAgainst: "အများဆုံးပေးဂိုး",
    winStreak: "ဆက်တိုက်နိုင်",
    drawStreak: "ဆက်တိုက်သရေ",
    lossStreak: "ဆက်တိုက်ရှုံး",
    played: "ကစားပြီး",
    wins: "နိုင်",
    draws: "သရေ",
    losses: "ရှုံး",
    goalsFor: "သွင်းဂိုး",
    goalsAgainst: "ပေးဂိုး",
    avgPerMatch: "ပွဲစဉ်ပျမ်းမျှ",
    impactLow: "သက်ရောက်မှုနည်း",
    impactMid: "သက်ရောက်မှုအလယ်အလတ်",
    impactHigh: "သက်ရောက်မှုမြင့်",
    impactSevere: "သက်ရောက်မှုပြင်း",
    fixtureMeta: "ပွဲဒေတာ",
    apiFixtureId: "ပွဲ ID",
    apiLeagueId: "လိဂ် ID",
    kickoff: "စတင်ချိန်",
    liveFlag: "တိုက်ရိုက်အခြေအနေ",
    formIndex: "ဖောင်ညွှန်းကိန်း",
    attack: "တိုက်စစ်",
    defense: "ခံစစ်",
    recentProfile: "နောက်ဆုံး 5 ပွဲဖောင်",
    winnerId: "ရေပန်းစားအသင်း ID",
    season: "ရာသီ",
    standings: "အမှတ်ပေးဇယား",
    leaguePosition: "လိဂ်အဆင့်",
    rankLabel: "အဆင့်",
    pointsLabel: "အမှတ်",
    goalDiff: "ဂိုးကွာခြားချက်",
    teamStatsSeason: "ရာသီစာရင်းအင်း",
    seasonAverages: "ရာသီပျမ်းမျှ",
    avgScored: "သွင်းဂိုးပျမ်းမျှ",
    avgConceded: "ပေးဂိုးပျမ်းမျှ",
    possession: "ဘောလုံးပိုင်ဆိုင်မှု",
    avgCards: "ကတ်ပျမ်းမျှ",
    topFormation: "အသုံးများသောဖွဲ့စည်းပုံ",
    h2hSummaryTitle: "ထိပ်တိုက်အကျဉ်းချုပ်",
    totalMeetings: "တွေ့ဆုံမှုစုစုပေါင်း",
    avgGoals: "ဂိုးပျမ်းမျှ",
    probabilitySource: "ဖြစ်နိုင်ခြေရင်းမြစ်",
    sourceComparison: "နှိုင်းယှဉ်မော်ဒယ်",
    sourceApi: "မော်ဒယ်ခန့်မှန်းချက်",
    modelDiagnostics: "အားသာချက်အချက်ပြများ",
    diagnosticDescription: "အသင်းအင်အားနှင့် မော်ဒယ်ခန့်မှန်းကွာဟချက်ကို နှိုင်းယှဉ်သည်",
    homeStrength: "အိမ်ရှင်အား",
    awayStrength: "ဧည့်အသင်းအား",
  },
  km: {
    back: "ត្រឡប់ទៅ AI Insight",
    liveNow: "កំពុងប្រកួត",
    generatedAt: "AI បានធ្វើបច្ចុប្បន្នភាព",
    matchOverview: "ទិដ្ឋភាពការប្រកួត",
    confidenceSummary: "សង្ខេបទំនុកចិត្ត",
    probabilityBreakdown: "ប្រូបាបលទ្ធផល",
    heatMeter: "កម្រិតប្រកៀកនៃការប្រកួត",
    homeAdvantage: "អត្ថប្រយោជន៍ម្ចាស់ផ្ទះ",
    likelyScore: "ពិន្ទុព្យាករ",
    apiAdvice: "ការណែនាំពីម៉ូឌែល",
    winnerLean: "ក្រុមដែលម៉ូឌែលលំអៀង",
    winnerNote: "កំណត់ចំណាំអ្នកឈ្នះ",
    winOrDraw: "ឈ្នះ ឬ ស្មើ",
    overUnder: "ក្រោម/លើ",
    drawOption: "ស្មើ",
    aiVerdict: "AI មើលថា",
    verdictHome: "ម្ចាស់ផ្ទះមានប្រៀប",
    verdictAway: "ក្រុមភ្ញៀវមានប្រៀប",
    verdictDraw: "ស្មើមើលទៅមានសក្តានុពល",
    finalResult: "លទ្ធផលចុងក្រោយ",
    finalWin: "បានឈ្នះ",
    finalDraw: "បញ្ចប់ស្មើជាមួយ",
    liveContext: "បរិបទផ្ទាល់",
    predictedGoalsUnavailable: "មិនមានពិន្ទុព្យាករដែលអាចទុកចិត្តបាន",
    noCommunityVotes: "មិនទាន់មានសម្លេងសហគមន៍សម្រាប់ការប្រកួតនេះ",
    liveLeads: "កំពុងនាំមុខ",
    liveLevel: "ពិន្ទុផ្ទាល់",
    matchupBoard: "តារាងប្រៀបធៀបគូប្រកួត",
    formDeepDive: "វិភាគទម្រង់ស៊ីជម្រៅ",
    formSnapshot: "ទម្រង់ថ្មីៗ",
    seasonPulse: "ស្ថានភាពរដូវកាល",
    minuteGoals: "ពេលវេលាស៊ុតបញ្ចូលទី",
    frequentLineups: "ជម្រើសក្រុមប្រើញឹកញាប់",
    biggestTrends: "និន្នាការសំខាន់",
    discipline: "វិន័យ",
    specialStats: "សញ្ញាបន្ថែម",
    headToHead: "ប្រវត្តិប៉ះគ្នា",
    advancedStats: "ស្ថិតិកម្រិតខ្ពស់",
    goalsForTiming: "ពេលវេលាស៊ុតបាន",
    goalsAgainstTiming: "ពេលវេលារបូតគ្រាប់",
    underOver: "ស្ថិតិក្រោម/លើ",
    cardsBreakdown: "កាតលឿង/កាតក្រហមតាមពេលវេលា",
    redCards: "កាតក្រហម",
    halftime: "វគ្គទីមួយ",
    fulltime: "ពេញម៉ោង",
    country: "ប្រទេស",
    referee: "អាជ្ញាកណ្តាល",
    venue: "ទីលាន",
    round: "ជុំ",
    status: "ស្ថានភាព",
    injuryDesk: "ឥទ្ធិពលរបួស",
    teamImpact: "ឥទ្ធិពលលើក្រុម",
    quickTake: "សង្ខេបរហ័ស",
    mainPrediction: "សង្ខេប AI",
    tabSummary: "សង្ខេប",
    tabModel: "ម៉ូឌែល",
    tabForm: "ទម្រង់",
    tabCommunity: "សហគមន៍",
    noPrediction: "មិនមានទិន្នន័យព្យាករ",
    noHistory: "មិនទាន់មានប្រវត្តិប៉ះគ្នា",
    noComparison: "មិនមានទិន្នន័យប្រៀបធៀប",
    noGeneratedTime: "មិនមានពេលអាប់ដេត",
    confidenceHigh: "AI មានទំនុកចិត្តខ្ពស់ និងមានក្រុមអាចឈ្នះច្បាស់",
    confidenceMid: "AI មានទំនុកចិត្តមធ្យម ការប្រកួតនៅបើកចំហ",
    confidenceLow: "AI មានទំនុកចិត្តទាប ហានិភ័យพลិកលទ្ធផលខ្ពស់",
    strengthGap: "គម្លាតកម្លាំង",
    favoriteTeam: "ក្រុមពេញនិយម",
    upsetRisk: "ហានិភ័យพลិកលទ្ធផល",
    noImpact: "មិនមានឥទ្ធិពលរបួសច្បាស់",
    playersOut: "កីឡាកររបួស",
    cardsLabel: "កាតលឿង",
    cleanSheets: "មិនរបូតគ្រាប់",
    failedToScore: "ស៊ុតមិនបាន",
    penalties: "ប៉េណាល់ទី",
    biggestWin: "ឈ្នះធំបំផុត",
    biggestLoss: "ចាញ់ធំបំផុត",
    biggestGoalsFor: "ស៊ុតបានច្រើនបំផុត",
    biggestGoalsAgainst: "របូតច្រើនបំផុត",
    winStreak: "ឈ្នះជាប់គ្នា",
    drawStreak: "ស្មើជាប់គ្នា",
    lossStreak: "ចាញ់ជាប់គ្នា",
    played: "ប្រកួត",
    wins: "ឈ្នះ",
    draws: "ស្មើ",
    losses: "ចាញ់",
    goalsFor: "ស៊ុតបាន",
    goalsAgainst: "របូត",
    avgPerMatch: "មធ្យម/ប្រកួត",
    impactLow: "ឥទ្ធិពលទាប",
    impactMid: "ឥទ្ធិពលមធ្យម",
    impactHigh: "ឥទ្ធិពលខ្ពស់",
    impactSevere: "ឥទ្ធិពលធ្ងន់",
    fixtureMeta: "ទិន្នន័យការប្រកួត",
    apiFixtureId: "លេខសម្គាល់ប្រកួត",
    apiLeagueId: "លេខសម្គាល់លីគ",
    kickoff: "ម៉ោងចាប់ផ្តើម",
    liveFlag: "ស្ថានភាពផ្ទាល់",
    formIndex: "សន្ទស្សន៍ទម្រង់",
    attack: "ប្រយុទ្ធ",
    defense: "ការពារ",
    recentProfile: "ទម្រង់ 5 ប្រកួតចុងក្រោយ",
    winnerId: "លេខសម្គាល់ក្រុមពេញនិយម",
    season: "រដូវកាល",
    standings: "តារាងពិន្ទុ",
    leaguePosition: "ចំណាត់ថ្នាក់លីគ",
    rankLabel: "ចំណាត់ថ្នាក់",
    pointsLabel: "ពិន្ទុ",
    goalDiff: "គ្រាប់បាល់ខុសគ្នា",
    teamStatsSeason: "ស្ថិតិរដូវកាល",
    seasonAverages: "មធ្យមពេញរដូវកាល",
    avgScored: "ស៊ុតមធ្យម",
    avgConceded: "របូតមធ្យម",
    possession: "គ្រប់គ្រងបាល់",
    avgCards: "កាតមធ្យម",
    topFormation: "ទម្រង់ប្រើញឹកញាប់",
    h2hSummaryTitle: "សង្ខេបប៉ះគ្នា",
    totalMeetings: "ជួបគ្នាសរុប",
    avgGoals: "គ្រាប់បាល់មធ្យម",
    probabilitySource: "ប្រភពប្រូបាប",
    sourceComparison: "ម៉ូឌែលប្រៀបធៀប",
    sourceApi: "ការព្យាករពីម៉ូឌែល",
    modelDiagnostics: "សញ្ញាកម្លាំង",
    diagnosticDescription: "ប្រៀបធៀបកម្លាំងក្រុម និងគម្លាតដែលម៉ូឌែលព្យាករ",
    homeStrength: "កម្លាំងម្ចាស់ផ្ទះ",
    awayStrength: "កម្លាំងក្រុមភ្ញៀវ",
  },
  zh: {
    back: "返回 AI Insight",
    liveNow: "正在比赛",
    generatedAt: "AI 更新时间",
    matchOverview: "比赛概览",
    confidenceSummary: "信心摘要",
    probabilityBreakdown: "赛果概率",
    heatMeter: "比赛接近程度",
    homeAdvantage: "主场优势",
    likelyScore: "预测比分",
    apiAdvice: "模型建议",
    winnerLean: "模型倾向",
    winnerNote: "胜方备注",
    winOrDraw: "胜或平",
    overUnder: "大小球",
    drawOption: "平局",
    aiVerdict: "AI 判断",
    verdictHome: "主队更占优",
    verdictAway: "客队更占优",
    verdictDraw: "平局可能性更高",
    finalResult: "完场结果",
    finalWin: "战胜",
    finalDraw: "与对手战平",
    liveContext: "实时背景",
    predictedGoalsUnavailable: "暂无可靠预测比分",
    noCommunityVotes: "这场比赛暂无社区投票",
    liveLeads: "领先",
    liveLevel: "实时比分",
    matchupBoard: "对阵比较",
    formDeepDive: "状态深度分析",
    formSnapshot: "近期状态",
    seasonPulse: "赛季走势",
    minuteGoals: "进球时间段",
    frequentLineups: "常用阵型",
    biggestTrends: "关键趋势",
    discipline: "纪律",
    specialStats: "额外信号",
    headToHead: "交锋记录",
    advancedStats: "高级数据",
    goalsForTiming: "进球时间",
    goalsAgainstTiming: "失球时间",
    underOver: "大小球数据",
    cardsBreakdown: "黄牌/红牌时间段",
    redCards: "红牌",
    halftime: "半场",
    fulltime: "全场",
    country: "国家",
    referee: "裁判",
    venue: "场地",
    round: "轮次",
    status: "状态",
    injuryDesk: "伤病影响",
    teamImpact: "球队影响",
    quickTake: "快速结论",
    mainPrediction: "AI 摘要",
    tabSummary: "摘要",
    tabModel: "模型",
    tabForm: "状态",
    tabCommunity: "社区",
    noPrediction: "暂无预测数据",
    noHistory: "暂无交锋记录",
    noComparison: "暂无比较数据",
    noGeneratedTime: "暂无更新时间",
    confidenceHigh: "AI 信心较高，热门方较明确",
    confidenceMid: "AI 信心中等，比赛仍有变数",
    confidenceLow: "AI 信心较低，爆冷风险较高",
    strengthGap: "实力差距",
    favoriteTeam: "热门球队",
    upsetRisk: "爆冷风险",
    noImpact: "暂无明显伤病影响",
    playersOut: "伤缺球员",
    cardsLabel: "黄牌",
    cleanSheets: "零封",
    failedToScore: "未能进球",
    penalties: "点球",
    biggestWin: "最大胜利",
    biggestLoss: "最大失利",
    biggestGoalsFor: "最多进球",
    biggestGoalsAgainst: "最多失球",
    winStreak: "连胜",
    drawStreak: "连平",
    lossStreak: "连败",
    played: "已赛",
    wins: "胜",
    draws: "平",
    losses: "负",
    goalsFor: "进球",
    goalsAgainst: "失球",
    avgPerMatch: "场均",
    impactLow: "低影响",
    impactMid: "中等影响",
    impactHigh: "高影响",
    impactSevere: "严重影响",
    fixtureMeta: "比赛资料",
    apiFixtureId: "比赛 ID",
    apiLeagueId: "联赛 ID",
    kickoff: "开赛时间",
    liveFlag: "实时状态",
    formIndex: "状态指数",
    attack: "进攻",
    defense: "防守",
    recentProfile: "近 5 场状态",
    winnerId: "热门球队 ID",
    season: "赛季",
    standings: "积分榜",
    leaguePosition: "联赛排名",
    rankLabel: "排名",
    pointsLabel: "积分",
    goalDiff: "净胜球",
    teamStatsSeason: "赛季数据",
    seasonAverages: "全赛季平均",
    avgScored: "场均进球",
    avgConceded: "场均失球",
    possession: "控球率",
    avgCards: "场均牌数",
    topFormation: "常用阵型",
    h2hSummaryTitle: "交锋摘要",
    totalMeetings: "交锋总数",
    avgGoals: "场均进球",
    probabilitySource: "概率来源",
    sourceComparison: "比较模型",
    sourceApi: "模型预测",
    modelDiagnostics: "实力信号",
    diagnosticDescription: "比较两队实力和模型预测差距",
    homeStrength: "主队实力",
    awayStrength: "客队实力",
  },
};

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

export function resolveHeatMeter(insight: ApiFootballAIInsightDetail) {
  if (typeof insight.homeStrength === "number" && typeof insight.awayStrength === "number") {
    return clampPercent(100 - Math.abs(insight.homeStrength - insight.awayStrength));
  }
  return typeof insight.heatMeter === "number" ? clampPercent(insight.heatMeter) : null;
}

export function formatMultiplier(value: number | null | undefined) {
  return typeof value === "number" ? `x${value.toFixed(2)}` : "-";
}

export function formatBoolean(value: boolean | null | undefined, locale: string) {
  if (value === null || value === undefined) return "-";
  if (locale === "th") return value ? "ใช่" : "ไม่";
  if (locale === "lo") return value ? "ແມ່ນ" : "ບໍ່";
  if (locale === "my") return value ? "ဟုတ်သည်" : "မဟုတ်ပါ";
  if (locale === "km") return value ? "បាទ/ចាស" : "ទេ";
  if (locale === "zh") return value ? "是" : "否";
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
  const normalized = short.trim().toUpperCase();
  if (
    [
      "NS",
      "TBD",
      "FT",
      "AET",
      "PEN",
      "FINISHED",
      "PST",
      "CANC",
      "ABD",
      "AWD",
      "WO",
    ].includes(normalized)
  ) {
    return false;
  }
  if (typeof elapsed === "number" && elapsed > 0) return true;
  return ["LIVE", "1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT"].includes(normalized);
}

export function isFinishedStatus(short: string) {
  return ["FT", "AET", "PEN", "FINISHED"].includes(short.trim().toUpperCase());
}

export function isHoldStatus(short: string) {
  return ["PST", "CANC", "ABD", "AWD", "WO"].includes(short.trim().toUpperCase());
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
  if (value >= 90) return "red" as const;
  if (value >= 75) return "magenta" as const;
  if (value >= 50) return "gold" as const;
  if (value >= 25) return "blue" as const;
  return "green" as const;
}

export function getHeatDescription(
  value: number | null | undefined,
  locale: string,
  copy: ReturnType<typeof getAIInsightPageCopy>
) {
  if (typeof value !== "number") return copy.labels.heat;
  const heatCopy = heatMeterCopy[locale as keyof typeof heatMeterCopy] ?? heatMeterCopy.en;
  if (value >= 90) return heatCopy.scorching;
  if (value >= 75) return heatCopy.exciting;
  if (value >= 50) return heatCopy.ok;
  if (value >= 25) return heatCopy.light;
  return heatCopy.boring;
}

const heatMeterCopy = {
  th: {
    scorching: "🔥 เดือดมาก — สูสีสุดๆ พลิกได้ทุกวินาที",
    exciting: "⚡️ มันส์ — ใกล้เคียง ลุ้นสนุก",
    ok: "🤔 พอได้ — ห่างกันบ้าง มีตัวเต็ง",
    light: "😐 เบาๆ — ชัดเจนว่าใครเหนือกว่า",
    boring: "💤 น่าเบื่อ — ข้างเดียว รู้ผลล่วงหน้า",
  },
  en: {
    scorching: "🔥 Very heated — extremely close, can swing any second",
    exciting: "⚡️ Exciting — close enough to be fun",
    ok: "🤔 Decent — some gap, one side is favored",
    light: "😐 Light — clear which side is stronger",
    boring: "💤 One-sided — the outcome looks predictable",
  },
  lo: {
    scorching: "🔥 ເດືອດຫຼາຍ — ສູສີສຸດໆ ພິກໄດ້ທຸກວິນາທີ",
    exciting: "⚡️ ມັນສ໌ — ໃກ້ຄຽງ ລຸ້ນສະໜຸກ",
    ok: "🤔 ພໍໄດ້ — ຫ່າງກັນບາງສ່ວນ ມີທີມເຕັງ",
    light: "😐 ເບົາໆ — ເຫັນຊັດວ່າໃຜເໜືອກວ່າ",
    boring: "💤 ນ່າເບື່ອ — ຂ້າງດຽວ ເດົາຜົນໄດ້ງ່າຍ",
  },
  my: {
    scorching: "🔥 အရမ်းပြင်း — အလွန်နီးစပ်ပြီး အချိန်မရွေးပြောင်းနိုင်",
    exciting: "⚡️ စိတ်လှုပ်ရှားစရာ — နီးစပ်ပြီး လိုက်ကြည့်ရสนุก",
    ok: "🤔 အသင့်အတင့် — ကွာဟချက်ရှိပြီး ရေပန်းစားအသင်းရှိ",
    light: "😐 ပေါ့ပါး — ဘယ်ဘက်က သာလွန်သည်ကိုရှင်း",
    boring: "💤 တစ်ဖက်သတ် — ရလဒ်ခန့်မှန်းရလွယ်",
  },
  km: {
    scorching: "🔥 ក្តៅខ្លាំង — ស្មើសាច់ខ្លាំង អាចប្រែបានគ្រប់វិនាទី",
    exciting: "⚡️ រំភើប — ប្រកៀកគ្នា លุ้นសប្បាយ",
    ok: "🤔 ពោលបាន — មានគម្លាតខ្លះ មានក្រុមពេញនិយម",
    light: "😐 ស្រាល — ច្បាស់ថាខាងណាលើស",
    boring: "💤 ម្ខាង — លទ្ធផលមើលទៅព្យាករបាន",
  },
  zh: {
    scorching: "🔥 非常激烈 — 极其接近，随时可能翻转",
    exciting: "⚡️ 精彩 — 双方接近，值得期待",
    ok: "🤔 还可以 — 有一定差距，存在热门方",
    light: "😐 较轻 — 谁更强已经比较明显",
    boring: "💤 一边倒 — 结果看起来较好预测",
  },
} as const;

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
  if (isFinishedStatus(fixture.statusShort)) {
    return getFinalResultVerdict(fixture, details);
  }

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

function getFinalResultVerdict(
  fixture: ApiFootballFixture,
  details: LocalizedDetailCopy
) {
  const homeScore = fixture.score.home;
  const awayScore = fixture.score.away;
  const scoreLabel =
    typeof homeScore === "number" && typeof awayScore === "number"
      ? `${homeScore}-${awayScore}`
      : "";

  if (typeof homeScore !== "number" || typeof awayScore !== "number") {
    return {
      title: details.finalResult,
      detail: getStatusLabelFallback(fixture.statusShort, details),
      liveNote: null,
    };
  }

  if (homeScore === awayScore) {
    return {
      title: details.finalResult,
      detail: `${details.finalDraw} ${scoreLabel}`,
      liveNote: null,
    };
  }

  const winner = homeScore > awayScore ? fixture.home.name : fixture.away.name;
  const loser = homeScore > awayScore ? fixture.away.name : fixture.home.name;

  return {
    title: details.finalResult,
    detail: `${winner} ${details.finalWin} ${loser} ${scoreLabel}`,
    liveNote: null,
  };
}

function getStatusLabelFallback(
  statusShort: string,
  details: LocalizedDetailCopy
) {
  const short = statusShort.trim().toUpperCase();
  if (isFinishedStatus(short)) return short;
  if (isHoldStatus(short)) return short;
  return details.finalResult;
}

export function getLocalizedModelAdvice(
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail,
  details: LocalizedDetailCopy
) {
  const verdict = getAIVerdict(fixture, insight, details);
  const confidence = getConfidenceDescription(insight.confidenceScore, details);
  const score = formatScorePrediction(insight.apiPredictedGoals);
  const scoreText = score ? `${details.likelyScore}: ${score}` : details.predictedGoalsUnavailable;

  return `${details.aiVerdict}: ${verdict.title}. ${details.confidenceSummary}: ${formatPercent(
    insight.confidenceScore
  )} • ${confidence}. ${scoreText}.`;
}

export function getLocalizedWinnerComment(
  fixture: ApiFootballFixture,
  insight: ApiFootballAIInsightDetail,
  details: LocalizedDetailCopy
) {
  if (insight.apiWinner?.name === fixture.home.name) return details.verdictHome;
  if (insight.apiWinner?.name === fixture.away.name) return details.verdictAway;
  if (insight.drawProbability !== null && insight.drawProbability !== undefined) return details.verdictDraw;
  return details.noPrediction;
}

export function getLocalizedUpsetDescription(
  insight: ApiFootballAIInsightDetail,
  details: LocalizedDetailCopy
) {
  if (!insight.upsetAlert) return details.confidenceHigh;
  return `${details.upsetRisk}: ${formatPercent(insight.upsetRisk)} • ${details.confidenceLow}`;
}

export function getCloseProbabilityNote(details: LocalizedDetailCopy) {
  return `${details.probabilityBreakdown}: ${details.confidenceMid}`;
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
  if (isLiveStatus(short, fixture.elapsed)) {
    return fixture.elapsed !== null ? `${details.liveNow} ${fixture.elapsed}'` : details.liveNow;
  }
  if (isFinishedStatus(short)) return short || copy.labels.finished;
  if (short === "PST") return copy.labels.postponed;
  if (short === "CANC") return copy.labels.cancelled;
  if (short === "ABD" || short === "AWD" || short === "WO") return copy.labels.cancelled;
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
