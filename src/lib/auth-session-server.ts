import "server-only";

import { cookies } from "next/headers";
import {
  REFRESH_SESSION_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/lib/auth-guard";
import { getDataApiUrl } from "@/lib/backend-api-urls";

const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60;

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

export function getBackendApiUrl(path: string) {
  return getDataApiUrl(path);
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");

  if (fetchSite === "same-origin") return true;
  if (fetchSite === "cross-site") return false;
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost || request.headers.get("host");

    if (!host) {
      const requestOriginUrl = new URL(request.url);
      return originUrl.hostname === requestOriginUrl.hostname;
    }

    const hostName = host.split(":")[0];
    return originUrl.hostname === hostName;
  } catch {
    return false;
  }
}

export function backendAuthHeaders(request: Request) {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  for (const name of [
    "accept-language",
    "content-language",
    "x-locale",
    "x-app-locale",
    "authorization",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

export function extractAuthTokens(payload: unknown): AuthTokens {
  if (!isRecord(payload) || !isRecord(payload.data)) return {};

  const data = payload.data;
  const tokens = isRecord(data.tokens) ? data.tokens : undefined;

  return {
    accessToken: stringValue(data.accessToken) ?? stringValue(tokens?.accessToken),
    refreshToken: stringValue(data.refreshToken) ?? stringValue(tokens?.refreshToken),
  };
}

export function stripRefreshToken(payload: unknown) {
  if (!isRecord(payload)) return payload;

  const sanitized = structuredClone(payload);
  if (!isRecord(sanitized.data)) return sanitized;

  delete sanitized.data.refreshToken;
  if (isRecord(sanitized.data.tokens)) {
    delete sanitized.data.tokens.refreshToken;
  }

  return sanitized;
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE_NAME)?.value ?? null;
}

export async function getRememberedAuthSession() {
  return (await cookies()).get(REFRESH_SESSION_COOKIE_NAME)?.value === "persistent";
}

export async function setRefreshSession(refreshToken: string, remember: boolean) {
  const cookieStore = await cookies();
  const sharedOptions = {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  };

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...sharedOptions,
    httpOnly: true,
    priority: "high",
  });
  cookieStore.set(
    REFRESH_SESSION_COOKIE_NAME,
    remember ? "persistent" : "session",
    sharedOptions
  );
}

export async function clearRefreshSession() {
  const cookieStore = await cookies();
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_SESSION_COOKIE_NAME);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}
