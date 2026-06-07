import {
  backendAuthHeaders,
  clearRefreshSession,
  getBackendApiUrl,
  isSameOriginMutation,
} from "@/lib/auth-session-server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
  }

  try {
    const response = await fetch(getBackendApiUrl("/auth/logout"), {
      method: "POST",
      headers: backendAuthHeaders(request),
      cache: "no-store",
    });
    const text = await response.text();

    return new Response(text || null, {
      status: response.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } finally {
    await clearRefreshSession();
  }
}
