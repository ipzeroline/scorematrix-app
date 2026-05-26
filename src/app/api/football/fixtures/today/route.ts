import {
  ApiFootballError,
  getApiFootballTodayFixtures,
} from "@/lib/api-football";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await getApiFootballTodayFixtures({
      revalidate: 0,
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
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
