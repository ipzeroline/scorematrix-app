import { DEFAULT_LOCALE, LOCALE_CODES, type LocaleCode } from "@/i18n";
import {
  AUTH_TOKEN_COOKIE_NAME,
  REFRESH_SESSION_COOKIE_NAME,
} from "@/lib/auth-guard";

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
  formData?: boolean;
  authRefreshAttempted?: boolean;
};

type AuthRefreshData = {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
  };
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

export function isAuthSessionExpiredError(error: unknown) {
  if (error instanceof ApiClientError) {
    return (
      normalizeAuthErrorValue(error.code) === "token_expired" ||
      isAuthExpiredPayload(error.payload) ||
      normalizeAuthErrorValue(error.message)?.includes("token_expired") === true ||
      normalizeAuthErrorValue(error.message)?.includes("token_expire") === true
    );
  }

  return isAuthExpiredPayload(error);
}

const Backend_BASE_URL = "/api/data";

const LEGACY_AUTH_TOKEN_STORAGE_KEY = "scorematrix-auth-token";
const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;

export const AUTH_SESSION_EXPIRED_EVENT = "scorematrix:auth-session-expired";

let refreshTokenRequest: Promise<boolean> | null = null;
let authSessionExpiredDispatched = false;

export function getApiBaseUrl() {
  return Backend_BASE_URL;
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

export function getStoredRefreshSession() {
  if (typeof window === "undefined") return null;
  return readCookie(REFRESH_SESSION_COOKIE_NAME);
}

export function setStoredAuthToken(token: string, remember = true) {
  if (typeof window === "undefined") return;
  const maxAge = remember ? ACCESS_TOKEN_MAX_AGE_SECONDS : undefined;
  writeCookie(AUTH_TOKEN_COOKIE_NAME, token, maxAge);
  clearLegacyStoredAuthToken();
}

export function setStoredAuthTokens(
  accessToken: string,
  remember = true
) {
  authSessionExpiredDispatched = false;
  setStoredAuthToken(accessToken, remember);
}

export function clearStoredAuthToken() {
  if (typeof window === "undefined") return;
  deleteCookie(AUTH_TOKEN_COOKIE_NAME);
  deleteCookie(REFRESH_SESSION_COOKIE_NAME);
  clearLegacyStoredAuthToken();
}

// Suppresses the "session expired" event for intentional logouts, so any
// in-flight 401 that resolves afterwards does not surface the expiry toast.
// Reset on the next successful login via setStoredAuthTokens.
export function suppressAuthSessionExpired() {
  authSessionExpiredDispatched = true;
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

export async function apiPostFormRaw<T>(
  path: string,
  body: FormData,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRawRequest<T>("POST", path, body, { ...options, formData: true });
}

export async function apiPatchFormRaw<T>(
  path: string,
  body: FormData,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRawRequest<T>("PATCH", path, body, { ...options, formData: true });
}

export async function apiPatch<T, B = unknown>(
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<ApiSuccess<T>> {
  return apiRequest<T>("PATCH", path, body, options);
}

export async function apiPatchRaw<T, B = unknown>(
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<T> {
  return apiRawRequest<T>("PATCH", path, body, options);
}

export async function apiRequest<T, B = unknown>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<ApiSuccess<T>> {
  const response = await fetchApi(method, path, body, options);

  const payload = await parseApiResponse(response);
  if (shouldRefreshAuth(path, response, options, payload)) {
    const refreshed = await refreshAccessToken(options);
    if (refreshed) {
      return apiRequest<T, B>(method, path, body, {
        ...options,
        token: null,
        authRefreshAttempted: true,
        headers: withoutAuthorization(options.headers),
      });
    }
  }

  if (shouldExpireAuthSession(path, response, options, payload)) {
    expireAuthSession();
    const failure = toApiFailure(payload);
    throw new ApiClientError(
      failure?.message ?? response.statusText,
      response.status,
      failure?.code,
      payload
    );
  }

  if (!response.ok || !isApiSuccess<T>(payload)) {
    const failure = toApiFailure(payload);
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
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
): Promise<T> {
  const response = await fetchApi(method, path, body, options);

  const payload = await parseApiResponse(response);
  if (shouldRefreshAuth(path, response, options, payload)) {
    const refreshed = await refreshAccessToken(options);
    if (refreshed) {
      return apiRawRequest<T, B>(method, path, body, {
        ...options,
        token: null,
        authRefreshAttempted: true,
        headers: withoutAuthorization(options.headers),
      });
    }
  }

  if (shouldExpireAuthSession(path, response, options, payload)) {
    expireAuthSession();
    const failure = toApiFailure(payload);
    throw new ApiClientError(
      failure?.message ?? response.statusText,
      response.status,
      failure?.code,
      payload
    );
  }

  if (!response.ok) {
    const failure = toApiFailure(payload);
    throw new ApiClientError(
      failure?.message ?? response.statusText,
      response.status,
      failure?.code,
      payload
    );
  }

  return payload as T;
}

async function fetchApi<B>(
  method: "GET" | "POST" | "PATCH",
  path: string,
  body?: B,
  options: ApiRequestOptions = {}
) {
  return fetch(buildApiUrl(path), {
    method,
    headers: buildApiHeaders(options, body !== undefined),
    body:
      body === undefined
        ? undefined
        : options.formData
          ? (body as BodyInit)
          : JSON.stringify(body),
    signal: options.signal,
    cache: "no-store",
  });
}

function buildApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${Backend_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
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
  const token =
    options.token === undefined ? getStoredAuthToken() : options.token;

  headers.set("Accept", "application/json");
  headers.set("Accept-Language", locale);
  headers.set("Content-Language", locale);
  headers.set("X-Locale", locale);
  headers.set("X-App-Locale", locale);

  if (hasBody && !options.formData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

function shouldRefreshAuth(
  path: string,
  response: Response,
  options: ApiRequestOptions,
  payload: unknown
) {
  return (
    !options.authRefreshAttempted &&
    isRefreshableAuthFailure(path, response, options, payload)
  );
}

function shouldExpireAuthSession(
  path: string,
  response: Response,
  options: ApiRequestOptions,
  payload: unknown
) {
  return (
    isRefreshableAuthFailure(path, response, options, payload) &&
    options.authRefreshAttempted === true
  );
}

function isRefreshableAuthFailure(
  path: string,
  response: Response,
  options: ApiRequestOptions,
  payload: unknown
) {
  return (
    isAuthRequestUsingStoredToken(options) &&
    isAuthenticatedPath(path) &&
    isAuthExpiredResponse(response, payload)
  );
}

function isAuthRequestUsingStoredToken(options: ApiRequestOptions) {
  return options.token === undefined || options.authRefreshAttempted === true;
}

function isAuthenticatedPath(path: string) {
  return (
    !path.startsWith("/auth/login") &&
    !path.startsWith("/auth/register") &&
    !path.startsWith("/auth/refresh")
  );
}

function isAuthExpiredResponse(response: Response, payload: unknown) {
  return response.status === 401 || isAuthExpiredPayload(payload);
}

async function refreshAccessToken(options: ApiRequestOptions) {
  if (refreshTokenRequest) return refreshTokenRequest;

  refreshTokenRequest = requestRefreshedAccessToken(options).finally(() => {
    refreshTokenRequest = null;
  });

  return refreshTokenRequest;
}

async function requestRefreshedAccessToken(options: ApiRequestOptions) {
  const locale = normalizeLocale(options.locale);
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Language": locale,
      "Content-Language": locale,
      "X-Locale": locale,
      "X-App-Locale": locale,
    },
    cache: "no-store",
  });
  const payload = await parseApiResponse(response);

  if (!response.ok || !isApiSuccess<AuthRefreshData>(payload)) {
    expireAuthSession();
    return false;
  }

  return true;
}

function expireAuthSession() {
  clearStoredAuthToken();
  void fetch("/api/auth/logout", { method: "POST", cache: "no-store" }).catch(() => {});

  if (typeof window === "undefined" || authSessionExpiredDispatched) return;

  authSessionExpiredDispatched = true;
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
}

function withoutAuthorization(headers?: HeadersInit) {
  const nextHeaders = new Headers(headers);
  nextHeaders.delete("Authorization");
  return nextHeaders;
}

async function parseApiResponse(response: Response) {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      return {
        success: false,
        code: "invalid_backend_response",
        message: response.statusText || "backend request failed",
        details: {
          contentType: contentType || "unknown",
          body: text.slice(0, 500),
        },
      } satisfies ApiFailure;
    }

    throw new ApiClientError("Invalid backend response", response.status, undefined, text);
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

function toApiFailure(payload: unknown): ApiFailure | undefined {
  if (isApiFailure(payload)) return payload;

  if (typeof payload !== "object" || payload === null || !("error" in payload)) {
    return undefined;
  }

  const error = (payload as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) return undefined;

  const message = (error as { message?: unknown }).message;
  const errors = readValidationErrors(error);
  const details = readRecord((error as { details?: unknown }).details);
  const detailMessage = formatValidationMessage(errors ?? details);

  return {
    success: false,
    code: stringValue((error as { code?: unknown }).code),
    message:
      detailMessage ??
      (typeof message === "string" ? message : "backend request failed"),
    ...(errors ? { errors } : {}),
    ...(details ? { details } : {}),
  };
}

function readValidationErrors(value: unknown) {
  const errors = readRecord((value as { errors?: unknown }).errors);
  if (!errors) return undefined;

  return Object.fromEntries(
    Object.entries(errors).map(([key, rawValue]) => [
      key,
      Array.isArray(rawValue)
        ? rawValue.map(String)
        : rawValue === undefined || rawValue === null
          ? []
          : [String(rawValue)],
    ])
  );
}

function readRecord(value: unknown) {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function formatValidationMessage(
  errors: Record<string, string[] | unknown> | undefined
) {
  if (!errors) return undefined;

  const messages = Object.entries(errors)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((item) => `${key}: ${String(item)}`);
      }
      return [`${key}: ${String(value)}`];
    })
    .filter(Boolean);

  return messages.length > 0 ? messages.join("\n") : undefined;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isAuthExpiredPayload(payload: unknown) {
  const failure = toApiFailure(payload);
  const values = [
    failure?.code,
    failure?.error_code,
    failure?.message,
    getNestedString(payload, ["error", "code"]),
    getNestedString(payload, ["error", "error_code"]),
    getNestedString(payload, ["error", "message"]),
  ];

  return values.some((value) => {
    const normalized = value?.toLowerCase().replace(/[\s-]+/g, "_");
    return (
      normalized === "token_expired" ||
      normalized === "jwt_expired" ||
      normalized === "access_token_expired" ||
      normalized === "expired_token" ||
      normalized === "token_expired_error" ||
      normalized === "missing_token" ||
      normalized === "token_missing" ||
      normalized === "access_token_missing" ||
      normalized?.includes("token_expired") ||
      normalized?.includes("token_expire") ||
      normalized?.includes("token_is_expired") ||
      normalized?.includes("missing_access_token") ||
      normalized?.includes("authorization_header_missing")
    );
  });
}

function normalizeAuthErrorValue(value: unknown) {
  return typeof value === "string"
    ? value.toLowerCase().replace(/[\s-]+/g, "_")
    : undefined;
}

function getNestedString(payload: unknown, path: string[]) {
  let current = payload;

  for (const key of path) {
    if (typeof current !== "object" || current === null || !(key in current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }

  return stringValue(current);
}
