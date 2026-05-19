import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from "@/i18n";

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiFailure;

export type ApiSuccess<T = unknown> = {
  success: true;
  code: string;
  message: string;
  data?: T;
};

export type ApiFailure = {
  success: false;
  code?: string;
  message: string;
  errors?: Record<string, string[]>;
  error_fields?: string[];
  duplicate_fields?: string[];
  details?: Record<string, unknown>;
  error_code?: string;
};

export type ApiRequestOptions = {
  token?: string | null;
  locale?: string | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  payload?: ApiFailure | unknown;

  constructor(message: string, status: number, code?: string, payload?: ApiFailure | unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SCOREMATRIX_API_BASE_URL ??
  "https://api.scorematrix.live/api/v1";

const AUTH_TOKEN_COOKIE_NAME = "scorematrix-auth-token";
const LEGACY_AUTH_TOKEN_STORAGE_KEY = "scorematrix-auth-token";
const REMEMBERED_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getStoredAuthToken() {
  if (typeof window === "undefined") return null;
  const token = readCookie(AUTH_TOKEN_COOKIE_NAME);
  if (token) return token;

  const legacyToken =
    window.localStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY) ??
    window.sessionStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);

  if (legacyToken) {
    setStoredAuthToken(
      legacyToken,
      window.localStorage.getItem(LEGACY_AUTH_TOKEN_STORAGE_KEY) === legacyToken
    );
  }

  return legacyToken;
}

export function setStoredAuthToken(token: string, remember = true) {
  if (typeof window === "undefined") return;
  const maxAge = remember ? REMEMBERED_TOKEN_MAX_AGE_SECONDS : undefined;
  writeCookie(AUTH_TOKEN_COOKIE_NAME, token, maxAge);
  clearLegacyStoredAuthToken();
}

export function clearStoredAuthToken() {
  if (typeof window === "undefined") return;
  deleteCookie(AUTH_TOKEN_COOKIE_NAME);
  clearLegacyStoredAuthToken();
}

export async function apiGet<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiSuccess<T>> {
  return apiRequest<T>("GET", path, undefined, options);
}

export async function apiGetRaw<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRawRequest<T>("GET", path, undefined, options);
}

export async function apiPost<T, B = unknown>(
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<ApiSuccess<T>> {
  return apiRequest<T>("POST", path, body, options);
}

export async function apiPostRaw<T, B = unknown>(
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRawRequest<T>("POST", path, body, options);
}

export async function apiRequest<T, B = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<ApiSuccess<T>> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: buildApiHeaders(options, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options.signal,
    cache: options.cache,
    next: options.next,
  });

  const payload = await parseApiResponse(response);
  if (!response.ok || !isApiSuccess<T>(payload)) {
    const failure = isApiFailure(payload) ? payload : undefined;
    throw new ApiClientError(
      failure?.message ?? response.statusText,
      response.status,
      failure?.code,
      payload
    );
  }

  return payload;
}

export async function apiRawRequest<T, B = unknown>(
  method: "GET" | "POST",
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: buildApiHeaders(options, body !== undefined),
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options.signal,
    cache: options.cache,
    next: options.next,
  });

  const payload = await parseApiResponse(response);
  if (!response.ok) {
    const failure = isApiFailure(payload) ? payload : undefined;
    throw new ApiClientError(
      failure?.message ?? response.statusText,
      response.status,
      failure?.code,
      payload
    );
  }

  return payload as T;
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function readCookie(name: string) {
  const prefix = `${encodeURIComponent(name)}=`;
  const value = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length);

  return value ? decodeURIComponent(value) : null;
}

function writeCookie(name: string, value: string, maxAge?: number) {
  const attributes = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "Path=/",
    "SameSite=Lax",
  ];

  if (maxAge !== undefined) {
    attributes.push(`Max-Age=${maxAge}`);
  }

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  document.cookie = attributes.join("; ");
}

function deleteCookie(name: string) {
  document.cookie = `${encodeURIComponent(
    name
  )}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function clearLegacyStoredAuthToken() {
  window.localStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
  window.sessionStorage.removeItem(LEGACY_AUTH_TOKEN_STORAGE_KEY);
}

function buildApiHeaders(options: ApiRequestOptions, hasBody: boolean) {
  const headers = new Headers(options.headers);
  const locale = normalizeLocale(options.locale);
  const token = options.token ?? getStoredAuthToken();

  headers.set("Accept", "application/json");
  headers.set("Accept-Language", locale);
  headers.set("Content-Language", locale);
  headers.set("X-Locale", locale);
  headers.set("X-App-Locale", locale);

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function parseApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ApiClientError("Invalid API response", response.status, undefined, text);
  }
}

function normalizeLocale(locale?: string | null): LocaleCode {
  if (locale && LOCALE_CODES.includes(locale as LocaleCode)) {
    return locale as LocaleCode;
  }
  return DEFAULT_LOCALE;
}

function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    (payload as { success: unknown }).success === true
  );
}

function isApiFailure(payload: unknown): payload is ApiFailure {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in payload &&
    (payload as { success: unknown }).success === false
  );
}
