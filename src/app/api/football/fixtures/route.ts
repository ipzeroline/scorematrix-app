import {
  ApiFootballError,
  getApiFootballFixtures,
} from "@/lib/api-football";

export const revalidate = 20;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = toPositiveInt(searchParams.get("limit"), 30);

  try {
    const result = await getApiFootballFixtures({
      date: searchParams.get("date") ?? undefined,
      live: searchParams.get("live") === "true",
      league: searchParams.get("league") ?? undefined,
      season: searchParams.get("season") ?? undefined,
      limit,
      revalidate: searchParams.get("live") === "true" ? 10 : 20,
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch football fixtures", 500);

    return Response.json(
      {
        source: "api-football",
        fetchedAt: new Date().toISOString(),
        query: Object.fromEntries(searchParams.entries()),
        count: 0,
        fixtures: [],
        rateLimit: {
          requestsRemaining: null,
          requestsLimit: null,
        },
        error: apiError.message,
      },
      { status: apiError.status }
    );
  }
}

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
}
