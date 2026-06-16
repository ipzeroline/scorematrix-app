import { regenerateTodayNews } from "@/lib/news-generator";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.NEWS_REGENERATION_SECRET ?? process.env.CRON_SECRET;
  const token = getBearerToken(request);

  if (!secret || token !== secret) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: NO_CACHE_HEADERS }
    );
  }

  const result = await regenerateTodayNews();
  return NextResponse.json(result, { headers: NO_CACHE_HEADERS });
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer ?? request.headers.get("x-cron-secret");
}
