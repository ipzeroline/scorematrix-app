import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";
import type { SpecialEvent } from "@/types/event";

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
    rewards: [],
    badges: [],
    participantCount: Number(event.currentParticipants ?? 0),
    maxParticipants: event.maxParticipants,
    bannerUrl: event.bannerUrl,
    isRegistered: event.isRegistered,
    status: event.status,
    rules: [],
  };
}

function mapEventType(eventType: ApiEvent["eventType"]): SpecialEvent["tournamentType"] {
  if (eventType === "tournament") return "custom";
  if (eventType === "season") return "custom";
  if (eventType === "single-match") return "custom";
  return "custom";
}
