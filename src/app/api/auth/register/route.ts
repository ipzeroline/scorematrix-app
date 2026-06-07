import {
  backendAuthHeaders,
  extractAuthTokens,
  getBackendApiUrl,
  isSameOriginMutation,
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
  const { refreshToken } = extractAuthTokens(payload);

  if (response.ok && refreshToken) {
    await setRefreshSession(refreshToken, true);
  }

  return Response.json(stripRefreshToken(payload), {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}
