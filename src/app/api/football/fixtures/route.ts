import {
  ApiFootballError,
  getMockApiFootballFixtures,
  getApiFootballFixtures,
} from "@/lib/api-football";

export const dynamic = "force-dynamic";

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
    });

    return Response.json(result);
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch football fixtures", 500);
    const fixtures = getMockApiFootballFixtures(limit);

    return Response.json(
      {
        source: "mock",
        fetchedAt: new Date().toISOString(),
        query: Object.fromEntries(searchParams.entries()),
        count: fixtures.length,
        fixtures,
        rateLimit: {
          requestsRemaining: null,
          requestsLimit: null,
        },
        warning: apiError.message,
      },
      { status: 200 }
    );
  }
}

function toPositiveInt(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, 100);
}
