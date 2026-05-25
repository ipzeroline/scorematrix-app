import {
  ApiFootballError,
  getApiFootballTodayFixtures,
} from "@/lib/api-football";

export const revalidate = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = toPositiveInt(searchParams.get("limit"), 50);

  try {
    const result = await getApiFootballTodayFixtures({
      limit,
      revalidate: 10,
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    const apiError =
      error instanceof ApiFootballError
        ? error
        : new ApiFootballError("Unable to fetch today's football fixtures", 500);

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
