import {
  backendAuthHeaders,
  clearRefreshSession,
  extractAuthTokens,
  getBackendApiUrl,
  getRefreshToken,
  getRememberedAuthSession,
  isSameOriginMutation,
  setRefreshSession,
  stripRefreshToken,
} from "@/lib/auth-session-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    await clearRefreshSession();
    return Response.json(
      { success: false, code: "REFRESH_TOKEN_MISSING", message: "Session expired" },
      { status: 401 }
    );
  }

  const remember = await getRememberedAuthSession();
  const response = await fetch(getBackendApiUrl("/auth/refresh"), {
    method: "POST",
    headers: backendAuthHeaders(request),
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });
  const payload = await response.json();
  const tokens = extractAuthTokens(payload);

  if (!response.ok || !tokens.accessToken) {
    await clearRefreshSession();
  } else if (tokens.refreshToken) {
    await setRefreshSession(tokens.refreshToken, remember);
  }

  return Response.json(stripRefreshToken(payload), {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
