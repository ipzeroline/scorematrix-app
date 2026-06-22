import "server-only";

import { getDataApiUrl } from "@/lib/backend-api-urls";
import { getAccessToken } from "@/lib/auth-session-server";
import {
  normalizeEventResponse,
  type EventResponse,
} from "@/lib/events-api";

export class ServerEventApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ServerEventApiError";
    this.status = status;
  }
}

export async function getEventServer(
  eventId: string,
  options: { locale?: string | null } = {}
): Promise<EventResponse> {
  const url = getDataApiUrl(`events/${encodeURIComponent(eventId)}`);
  const headers = new Headers({ Accept: "application/json" });
  const locale = options.locale || "th";

  await applyEventHeaders(headers, locale);

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ServerEventApiError(
      extractErrorMessage(payload) || response.statusText || "Event request failed",
      response.status
    );
  }

  const eventResponse = normalizeEventResponse(payload);
  const leaderboardPayload = await fetchEventLeaderboardPayload(eventId, headers);

  if (!leaderboardPayload) return eventResponse;

  return normalizeEventResponse({
    event: eventResponse.data,
    ...extractLeaderboardEnvelope(leaderboardPayload),
  } as Parameters<typeof normalizeEventResponse>[0]);
}

async function fetchEventLeaderboardPayload(eventId: string, headers: Headers) {
  const url = getDataApiUrl(`events/${encodeURIComponent(eventId)}/leaderboard`);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "10");

  const response = await fetch(url, {
    headers,
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json().catch(() => null);
}

async function applyEventHeaders(headers: Headers, locale: string) {
  headers.set("Accept-Language", locale);
  headers.set("Content-Language", locale);
  headers.set("X-Locale", locale);
  headers.set("X-App-Locale", locale);

  const accessToken = await getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
}

function extractLeaderboardEnvelope(payload: unknown) {
  const record = readRecord(payload);
  const data = readRecord(record?.data);
  const source = data ?? record ?? {};

  return {
    entries: readArray(source.entries) ?? [],
    userEntry: readRecord(source.userEntry) ?? readRecord(source.user_entry) ?? null,
    pagination: readRecord(source.pagination) ?? null,
  };
}

function readRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function readArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function extractErrorMessage(payload: unknown) {
  if (typeof payload !== "object" || payload === null) return null;
  if ("message" in payload && typeof payload.message === "string") {
    return payload.message;
  }
  if ("error" in payload) {
    const error = payload.error;
    if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof error.message === "string"
    ) {
      return error.message;
    }
  }
  return null;
}
