import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";
import type { SpecialEvent, EventReward, EventBadge, EventMatchData, EventLeaderboardEntry } from "@/types/event";

export type ApiEvent = {
  id: string;
  title: string;
  description: string;
  eventType: "tournament" | "single-match" | "season" | string;
  entryFeePoints: number;
  entryFeeCredits: number;
  startAt: string;
  endAt: string;
  maxParticipants: number | null;
  currentParticipants: number;
  bannerUrl: string | null;
  status: "upcoming" | "active" | "ended";
  isRegistered: boolean;
  rewards?: EventReward[];
  badges?: EventBadge[];
  rules?: string[];
  matches?: EventMatchData[];
  leaderboard?: EventLeaderboardEntry[];
};

export type EventsResponse = {
  data: ApiEvent[];
};

type EventsApiPayload =
  | ApiEvent[]
  | EventsResponse
  | {
      events?: ApiEvent[];
    };

export const DEFAULT_EVENTS_RESPONSE: EventsResponse = {
  data: [
    {
      id: "afc-champions-2026",
      title: "AFC Champions League 2026",
      description:
        "ทายผลเอเอฟซี แชมเปี้ยนส์ลีก\n\n🏆 ทีมจากทั่วเอเชีย\n📅 กันยายน - พฤศจิกายน 2026",
      eventType: "tournament",
      entryFeePoints: 100,
      entryFeeCredits: 0,
      startAt: "2026-09-01 00:00:00",
      endAt: "2026-11-30 23:59:59",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 30000, premiumCredits: 3000, badge: "afc2026-champion" },
        { rank: 2, freePoints: 15000, premiumCredits: 1500 },
        { rank: 3, freePoints: 7500, premiumCredits: 750 },
        { rank: [4, 10], freePoints: 3000, premiumCredits: 300 },
        { rank: [11, 25], freePoints: 1500 },
      ],
      badges: [
        { id: "afc2026-champion", name: "AFC Oracle", icon: "trophy", description: "Won the AFC Champions League 2026 predictor" },
        { id: "afc2026-participant", name: "AFC Player", icon: "globe", description: "Participated in the AFC Champions League 2026 predictor" },
      ],
    },
    {
      id: "epl-2026-27-kickoff",
      title: "PL เปิดฤดูกาล 2026/27",
      description: "ทายผลพรีเมียร์ลีกนัดเปิดสนามฤดูกาลใหม่\n\n📅 สิงหาคม 2026",
      eventType: "tournament",
      entryFeePoints: 200,
      entryFeeCredits: 0,
      startAt: "2026-08-01 00:00:00",
      endAt: "2026-08-16 18:00:00",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 50000, premiumCredits: 5000, badge: "epl2026-champion" },
        { rank: 2, freePoints: 25000, premiumCredits: 2500 },
        { rank: 3, freePoints: 12000, premiumCredits: 1200 },
        { rank: [4, 10], freePoints: 5000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 2000 },
        { rank: [51, 100], freePoints: 1000 },
      ],
      badges: [
        { id: "epl2026-champion", name: "PL Kickoff King", icon: "trophy", description: "Won the Premier League 2026/27 kickoff predictor" },
        { id: "epl2026-participant", name: "PL Kickoff Player", icon: "star", description: "Participated in the PL 2026/27 kickoff event" },
      ],
    },
    {
      id: "wc-2026-final",
      title: "ฟุตบอลโลก 2026 รอบชิง",
      description:
        "ทายผลรอบชิงชนะเลิศ FIFA World Cup 2026\n\n🏆 MetLife Stadium, New Jersey\n📅 19 กรกฎาคม 2026",
      eventType: "single-match",
      entryFeePoints: 500,
      entryFeeCredits: 50,
      startAt: "2026-07-01 00:00:00",
      endAt: "2026-07-19 18:00:00",
      maxParticipants: null,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 100000, premiumCredits: 5000, badge: "wc2026-champion" },
        { rank: 2, freePoints: 50000, premiumCredits: 2500, badge: "wc2026-runnerup" },
        { rank: 3, freePoints: 25000, premiumCredits: 1000, badge: "wc2026-third" },
        { rank: [4, 10], freePoints: 10000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 5000 },
        { rank: [51, 100], freePoints: 2500 },
      ],
      badges: [
        { id: "wc2026-champion", name: "World Cup Oracle", icon: "trophy", description: "Won the 2026 World Cup Final predictor" },
        { id: "wc2026-runnerup", name: "World Cup Silver", icon: "medal", description: "2nd place in the 2026 World Cup Final predictor" },
        { id: "wc2026-third", name: "World Cup Bronze", icon: "medal", description: "3rd place in the 2026 World Cup Final predictor" },
        { id: "wc2026-participant", name: "World Cup 2026 Player", icon: "globe", description: "Participated in the 2026 World Cup Final predictor" },
      ],
      matches: [
        { id: "wc-semi-01", homeTeam: "France", awayTeam: "England", date: "2026-07-14T20:00:00Z", status: "predicted", predictedScore: "2-1" },
        { id: "wc-semi-02", homeTeam: "Spain", awayTeam: "Germany", date: "2026-07-15T20:00:00Z", status: "predicted", predictedScore: "1-2" },
        { id: "wc-final-01", homeTeam: "TBD", awayTeam: "TBD", date: "2026-07-19T18:00:00Z", status: "upcoming" },
      ],
      leaderboard: [
        { rank: 1, username: "WorldChamp", points: 2450, accuracy: 88, predictions: 28 },
        { rank: 2, username: "GoalKing", points: 2320, accuracy: 84, predictions: 28 },
        { rank: 3, username: "FootOracle", points: 2180, accuracy: 81, predictions: 27 },
        { rank: 4, username: "ScoreMaster", points: 2050, accuracy: 79, predictions: 28 },
        { rank: 5, username: "BallSeer", points: 1950, accuracy: 77, predictions: 26 },
      ],
    },
    {
      id: "copa-america-2026",
      title: "Copa América 2026",
      description:
        "ทำนายผลโคปาอเมริกา 2026\n\n🌎 ทีมชาติอเมริกาใต้\n📅 มิถุนายน - กรกฎาคม 2026",
      eventType: "tournament",
      entryFeePoints: 300,
      entryFeeCredits: 20,
      startAt: "2026-06-01 00:00:00",
      endAt: "2026-07-15 23:59:59",
      maxParticipants: 10000,
      currentParticipants: 342,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 80000, premiumCredits: 4000, badge: "copa2026-champion" },
        { rank: 2, freePoints: 40000, premiumCredits: 2000, badge: "copa2026-runnerup" },
        { rank: 3, freePoints: 20000, premiumCredits: 1000 },
        { rank: [4, 10], freePoints: 8000, premiumCredits: 400 },
        { rank: [11, 50], freePoints: 3000 },
        { rank: [51, 100], freePoints: 1500 },
        { rank: [101, 200], freePoints: 500 },
      ],
      badges: [
        { id: "copa2026-champion", name: "Copa América Oracle", icon: "trophy", description: "Won the Copa América 2026 predictor" },
        { id: "copa2026-runnerup", name: "Copa América Silver", icon: "medal", description: "2nd place in Copa América 2026" },
        { id: "copa2026-participant", name: "Copa Player", icon: "globe", description: "Participated in Copa América 2026" },
      ],
      matches: [
        { id: "copa-match-01", homeTeam: "Argentina", awayTeam: "Brazil", date: "2026-06-20T20:00:00Z", status: "upcoming" },
        { id: "copa-match-02", homeTeam: "Uruguay", awayTeam: "Colombia", date: "2026-06-21T18:00:00Z", status: "predicted", predictedScore: "2-1" },
        { id: "copa-match-03", homeTeam: "Chile", awayTeam: "Paraguay", date: "2026-06-21T21:00:00Z", status: "live" },
        { id: "copa-match-04", homeTeam: "Ecuador", awayTeam: "Peru", date: "2026-06-19T20:00:00Z", status: "finished", actualScore: "2-0" },
        { id: "copa-match-05", homeTeam: "Venezuela", awayTeam: "Bolivia", date: "2026-06-19T18:00:00Z", status: "predicted", predictedScore: "1-1" },
        { id: "copa-match-06", homeTeam: "Brazil", awayTeam: "Uruguay", date: "2026-06-24T20:00:00Z", status: "upcoming" },
        { id: "copa-match-07", homeTeam: "Argentina", awayTeam: "Colombia", date: "2026-06-25T20:00:00Z", status: "upcoming" },
      ],
      leaderboard: [
        { rank: 1, username: "FutbolKing", points: 1240, accuracy: 82, predictions: 15 },
        { rank: 2, username: "CopaMaster", points: 1180, accuracy: 78, predictions: 15 },
        { rank: 3, username: "SudamericaPro", points: 1095, accuracy: 75, predictions: 14 },
        { rank: 4, username: "GoalHunter", points: 1020, accuracy: 72, predictions: 15 },
        { rank: 5, username: "PredicThor", points: 980, accuracy: 71, predictions: 14 },
        { rank: 6, username: "BallWizard", points: 920, accuracy: 68, predictions: 13 },
        { rank: 7, username: "ScoreSeeker", points: 880, accuracy: 67, predictions: 15 },
        { rank: 8, username: "คุณ", points: 680, accuracy: 65, predictions: 12, isCurrentUser: true },
        { rank: 9, username: "FootballFan", points: 640, accuracy: 62, predictions: 14 },
        { rank: 10, username: "MatchPoint", points: 600, accuracy: 60, predictions: 13 },
      ],
    },
    {
      id: "ucl-2026-final",
      title: "UCL 2026 รอบชิง",
      description:
        "ทายผลยูฟ่าแชมเปี้ยนส์ลีก รอบชิง\n\n🏟️ Puskás Aréna, Budapest\n📅 30 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 300,
      entryFeeCredits: 30,
      startAt: "2026-05-20 00:00:00",
      endAt: "2026-05-30 18:00:00",
      maxParticipants: 5000,
      currentParticipants: 0,
      bannerUrl: null,
      status: "upcoming",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 60000, premiumCredits: 3000, badge: "ucl2026-champion" },
        { rank: 2, freePoints: 30000, premiumCredits: 1500 },
        { rank: 3, freePoints: 15000, premiumCredits: 750 },
        { rank: [4, 10], freePoints: 5000, premiumCredits: 500 },
        { rank: [11, 50], freePoints: 2000 },
      ],
      badges: [
        { id: "ucl2026-champion", name: "European Oracle", icon: "trophy", description: "Won the UCL 2026 Final predictor" },
        { id: "ucl2026-participant", name: "UCL Player", icon: "star", description: "Participated in the UCL 2026 Final predictor" },
      ],
    },
    {
      id: "el-classico-2026",
      title: "El Clásico พิเศษ",
      description: "ศึกเอลกลาซิโก\n\n⚔️ บาร์เซโลน่า vs เรอัล มาดริด\n🏟️ Camp Nou",
      eventType: "single-match",
      entryFeePoints: 100,
      entryFeeCredits: 10,
      startAt: "2026-05-20 00:00:00",
      endAt: "2026-06-01 18:00:00",
      maxParticipants: 2000,
      currentParticipants: 856,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 25000, premiumCredits: 1000, badge: "elclassico2026-champion" },
        { rank: 2, freePoints: 12000, premiumCredits: 500 },
        { rank: 3, freePoints: 6000, premiumCredits: 250 },
        { rank: [4, 10], freePoints: 2000, premiumCredits: 100 },
        { rank: [11, 25], freePoints: 800 },
      ],
      badges: [
        { id: "elclassico2026-champion", name: "El Clásico King", icon: "trophy", description: "Won the El Clásico 2026 predictor" },
        { id: "elclassico2026-participant", name: "Clásico Player", icon: "zap", description: "Participated in El Clásico 2026" },
      ],
    },
    {
      id: "fa-cup-2026",
      title: "FA Cup 2026 รอบชิง",
      description: "FA Cup Final 2026\n\n🏟️ Wembley Stadium\n📅 16 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 200,
      entryFeeCredits: 20,
      startAt: "2026-05-01 00:00:00",
      endAt: "2026-05-16 14:00:00",
      maxParticipants: 3000,
      currentParticipants: 2198,
      bannerUrl: null,
      status: "ended",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 40000, premiumCredits: 2000, badge: "facup2026-champion" },
        { rank: 2, freePoints: 20000, premiumCredits: 1000 },
        { rank: 3, freePoints: 10000, premiumCredits: 500 },
        { rank: [4, 10], freePoints: 4000, premiumCredits: 200 },
        { rank: [11, 50], freePoints: 1500 },
      ],
      badges: [
        { id: "facup2026-champion", name: "FA Cup Oracle", icon: "trophy", description: "Won the FA Cup 2026 Final predictor" },
        { id: "facup2026-participant", name: "FA Cup Player", icon: "shield", description: "Participated in the FA Cup 2026 Final predictor" },
      ],
    },
    {
      id: "thai-league-2026",
      title: "ไทยลีก 2026/27 ทำนายแม่น",
      description:
        "ทำนายผลบอลไทยลีกทั้งฤดูกาล 2026/27\n\n🇹🇭 ทีมไทยแลนด์\n📅 แข่งขันทุกสัปดาห์",
      eventType: "season",
      entryFeePoints: 0,
      entryFeeCredits: 0,
      startAt: "2026-05-01 00:00:00",
      endAt: "2027-04-30 23:59:59",
      maxParticipants: null,
      currentParticipants: 128,
      bannerUrl: null,
      status: "active",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 20000, premiumCredits: 2000, badge: "thaileague2026-champion" },
        { rank: 2, freePoints: 10000, premiumCredits: 1000 },
        { rank: 3, freePoints: 5000, premiumCredits: 500 },
        { rank: [4, 10], freePoints: 2000 },
        { rank: [11, 25], freePoints: 800 },
        { rank: [26, 50], freePoints: 300 },
      ],
      badges: [
        { id: "thaileague2026-champion", name: "ไทยลีกออราเคิล", icon: "trophy", description: "Won the Thai League 2026/27 predictor" },
        { id: "thaileague2026-participant", name: "ไทยลีกเพลเยอร์", icon: "flag", description: "Participated in Thai League 2026/27" },
      ],
    },
    {
      id: "derby-milan-2026",
      title: "Derby della Madonnina",
      description:
        "ศึกมิลานดาร์บี้\n\n🔴⚫ AC Milan vs Inter Milan 🔵⚫\n🏟️ San Siro\n📅 10 พฤษภาคม 2026",
      eventType: "single-match",
      entryFeePoints: 150,
      entryFeeCredits: 15,
      startAt: "2026-04-20 00:00:00",
      endAt: "2026-05-10 18:00:00",
      maxParticipants: 1500,
      currentParticipants: 1203,
      bannerUrl: null,
      status: "ended",
      isRegistered: false,
      rewards: [
        { rank: 1, freePoints: 30000, premiumCredits: 1500, badge: "milan-derby2026-champion" },
        { rank: 2, freePoints: 15000, premiumCredits: 750 },
        { rank: 3, freePoints: 7500, premiumCredits: 350 },
        { rank: [4, 10], freePoints: 3000, premiumCredits: 150 },
        { rank: [11, 25], freePoints: 1000 },
      ],
      badges: [
        { id: "milan-derby2026-champion", name: "Derby King", icon: "trophy", description: "Won the Derby della Madonnina 2026 predictor" },
        { id: "milan-derby2026-participant", name: "Derby Player", icon: "zap", description: "Participated in Derby della Madonnina 2026" },
      ],
    },
  ],
};

export async function getEvents(options?: ApiRequestOptions) {
  const response = await apiGetRaw<EventsApiPayload>("/events", options);
  return normalizeEventsResponse(response);
}

export function normalizeEventsResponse(response: EventsApiPayload): EventsResponse {
  if (Array.isArray(response)) return { data: response };
  if ("data" in response && Array.isArray(response.data)) return response;
  if ("events" in response && Array.isArray(response.events)) {
    return { data: response.events };
  }
  return DEFAULT_EVENTS_RESPONSE;
}

export function mapApiEvent(event: ApiEvent): SpecialEvent {
  return {
    id: event.id,
    name: event.title,
    description: event.description,
    tournamentType: mapEventType(event.eventType),
    startDate: event.startAt,
    endDate: event.endAt,
    entryFee: Number(event.entryFeeCredits ?? 0),
    entryFeePoints: Number(event.entryFeePoints ?? 0),
    entryFeeCredits: Number(event.entryFeeCredits ?? 0),
    rewards: event.rewards ?? [],
    badges: event.badges ?? [],
    matches: event.matches ?? [],
    leaderboard: event.leaderboard ?? [],
    participantCount: Number(event.currentParticipants ?? 0),
    maxParticipants: event.maxParticipants,
    bannerUrl: event.bannerUrl,
    isRegistered: event.isRegistered,
    status: event.status,
    rules: event.rules ?? [],
  };
}

function mapEventType(eventType: ApiEvent["eventType"]): SpecialEvent["tournamentType"] {
  if (eventType === "tournament") return "custom";
  if (eventType === "season") return "custom";
  if (eventType === "single-match") return "custom";
  return "custom";
}
