const API_FOOTBALL_BASE_URL = requiredEnv(
  process.env.API_FOOTBALL_BASE_URL,
  "API_FOOTBALL_BASE_URL"
);

export const revalidate = 600; // Squads don't change very often, 10 min cache is great

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teamId = parseInt(id, 10);
  
  if (isNaN(teamId)) {
    return Response.json({ error: "Invalid team ID" }, { status: 400 });
  }

  const url = buildSoccerBackendUrl(`/teams/${teamId}/squad`);

  const response = await fetch(url.toString(), {
    headers: buildHeaders(request),
    next: { revalidate },
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
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1200",
    },
  });
}

function buildSoccerBackendUrl(pathname: string) {
  const baseUrl = API_FOOTBALL_BASE_URL.endsWith("/")
    ? API_FOOTBALL_BASE_URL
    : `${API_FOOTBALL_BASE_URL}/`;

  return new URL(pathname.replace(/^\/+/, ""), baseUrl);
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

function requiredEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required. Add it to .env.`);
  }

  return value;
}
