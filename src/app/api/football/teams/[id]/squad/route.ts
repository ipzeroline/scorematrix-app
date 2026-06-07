import { getFootballApiUrl } from "@/lib/backend-api-urls";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  
  if (isNaN(teamId)) {
    return Response.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const url = getFootballApiUrl(`/teams/${teamId}/squad`);

  const response = await fetch(url.toString(), {
    headers: buildHeaders(request),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => ({
    error: "Invalid squad response",
  }));

  if (!response.ok) {
    return Response.json(
      {
        error: "Unable to fetch squad",
        details: payload,
      },
      { status: response.status }
    );
  }

  return Response.json(payload, {
    headers: NO_CACHE_HEADERS,
  });
}

function buildHeaders(request: Request): HeadersInit {
  const headers = new Headers();
  headers.set("Accept", "application/json");

  const locale =
    request.headers.get("X-Locale") ??
    request.headers.get("X-App-Locale") ??
    request.headers.get("Accept-Language");

  if (locale) {
    headers.set("Accept-Language", locale);
    headers.set("X-Locale", locale);
    headers.set("X-App-Locale", locale);
  }

  return headers;
}
