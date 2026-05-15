const MEDIA_BASE_URL = "https://media.api-sports.io";
const ALLOWED_MEDIA_ROOTS = new Set(["football", "flags"]);

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!isAllowedPath(path)) {
    return new Response("Not found", { status: 404 });
  }

  return proxyImage(`${MEDIA_BASE_URL}/${path.map(encodeURIComponent).join("/")}`);
}

function isAllowedPath(path: string[]) {
  return path.length > 1 && ALLOWED_MEDIA_ROOTS.has(path[0]);
}

async function proxyImage(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "image/*" },
    next: { revalidate: 86400 },
  });

  if (!response.ok || !response.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
