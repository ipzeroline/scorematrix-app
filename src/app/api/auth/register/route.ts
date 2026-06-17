import {
  backendAuthHeaders,
  extractAuthTokens,
  getBackendApiUrl,
  isSameOriginMutation,
  setAccessSession,
  setRefreshSession,
  stripRefreshToken,
} from "@/lib/auth-session-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const response = await fetch(getBackendApiUrl("/auth/register"), {
    method: "POST",
    headers: backendAuthHeaders(request),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const payload = await response.json();
  const { accessToken, refreshToken } = extractAuthTokens(payload);

  if (response.ok) {
    if (accessToken) await setAccessSession(accessToken, true);
    if (refreshToken) await setRefreshSession(refreshToken, true);
  }

  return Response.json(stripRefreshToken(payload), {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
