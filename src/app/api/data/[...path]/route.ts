import { getDataApiUrl } from "@/lib/backend-api-urls";
import { getAccessToken, isSameOriginMutation } from "@/lib/auth-session-server";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";

type DataProxyContext = {
  params: Promise<{ path: string[] }>;
};

const DATA_PROXY_TIMEOUT_MS = 10_000;

const ALLOWED_DATA_PROXY_PREFIXES = [
  "achievements",
  "auth/forgot-password",
  "auth/register/banks",
  "auth/reset-password",
  "checkins",
  "credits",
  "events",
  "leaderboard",
  "levels",
  "leagues",
  "member",
  "missions",
  "points",
  "predictable-matches",
  "predictions",
  "referral",
  "referrals",
  "rewards",
  "scoring-rules",
  "stats",
  "threads",
  "users/me",
];

export function GET(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

export function HEAD(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

export function POST(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

export function PUT(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

export function PATCH(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

export function DELETE(request: Request, context: DataProxyContext) {
  return proxyDataRequest(request, context);
}

async function proxyDataRequest(request: Request, context: DataProxyContext) {
  if (!["GET", "HEAD"].includes(request.method) && !isSameOriginMutation(request)) {
    return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const { path } = await context.params;
    const normalizedPath = normalizeProxyPath(path);
    if (!isAllowedProxyPath(normalizedPath)) {
      return Response.json(
        { success: false, code: "not_found", message: "Data route is not available" },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }

    const requestUrl = new URL(request.url);
    const backendUrl = getDataApiUrl(
      normalizedPath.split("/").map(encodeURIComponent).join("/")
    );
    requestUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    const response = await fetch(backendUrl, {
      method: request.method,
      headers: await buildProxyHeaders(request),
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await readRequestBody(request),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(DATA_PROXY_TIMEOUT_MS),
    });

    return normalizeProxyResponse(response, request.method);
  } catch (error) {
    console.error("[data-proxy] request failed", error);
    const isTimeout = isAbortTimeout(error);
    return Response.json(
      {
        success: false,
        code: isTimeout ? "data_proxy_timeout" : "data_proxy_error",
        message: isTimeout
          ? "Data backend request timed out"
          : "Data backend request failed",
      },
      { status: 502, headers: NO_CACHE_HEADERS }
    );
  }
}

async function buildProxyHeaders(request: Request) {
  const headers = new Headers();

  for (const name of [
    "accept",
    "accept-language",
    "content-language",
    "content-type",
    "x-app-locale",
    "x-locale",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  if (!headers.has("authorization")) {
    const accessToken = await getAccessToken();
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

function normalizeProxyPath(path: string[]) {
  return path
    .map((segment) => decodeURIComponent(segment).trim())
    .filter(Boolean)
    .join("/");
}

function isAllowedProxyPath(path: string) {
  return ALLOWED_DATA_PROXY_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

async function readRequestBody(request: Request) {
  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}

async function normalizeProxyResponse(response: Response, method: string) {
  const contentType = response.headers.get("content-type") ?? "";

  if (method === "HEAD" || response.status === 204 || isJsonContentType(contentType)) {
    return new Response(response.body, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
        ...NO_CACHE_HEADERS,
      },
    });
  }

  const body = await response.text();
  return Response.json(
    {
      success: false,
      code: "invalid_backend_response",
      message: response.ok
        ? "Data backend returned a non-JSON response"
        : response.statusText || "Data backend request failed",
      details: {
        contentType: contentType || "unknown",
        body: body.slice(0, 500),
      },
    },
    {
      status: response.ok ? 502 : response.status,
      headers: NO_CACHE_HEADERS,
    }
  );
}

function isJsonContentType(contentType: string) {
  return /(^|[/+])json($|;)/i.test(contentType);
}

function isAbortTimeout(error: unknown) {
  return (
    error instanceof DOMException &&
    (error.name === "TimeoutError" || error.name === "AbortError")
  );
}
