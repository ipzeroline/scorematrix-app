import { hasAuthSession } from "@/lib/auth-session-server";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(
    { authenticated: await hasAuthSession() },
    { headers: NO_CACHE_HEADERS }
  );
}
