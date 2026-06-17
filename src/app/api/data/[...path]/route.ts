import { getDataApiUrl } from "@/lib/backend-api-urls";
import { getAccessToken, isSameOriginMutation } from "@/lib/auth-session-server";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";

type DataProxyContext = {
  params: Promise<{ path: string[] }>;
};

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

  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const backendUrl = getDataApiUrl(path.map(encodeURIComponent).join("/"));
  requestUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  const response = await fetch(backendUrl, {
    method: request.method,
    headers: await buildProxyHeaders(request),
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await readRequestBody(request),
    cache: "no-store",
    redirect: "manual",
  });

  return new Response(response.body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/json",
      ...NO_CACHE_HEADERS,
    },
  });
}

async function buildProxyHeaders(request: Request) {
  const headers = new Headers();

  for (const name of [
    "accept",
    "accept-language",
    "authorization",
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

async function readRequestBody(request: Request) {
  const body = await request.arrayBuffer();
  return body.byteLength > 0 ? body : undefined;
}
