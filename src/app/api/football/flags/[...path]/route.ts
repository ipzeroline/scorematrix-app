const FLAG_BASE_URL = "https://flagcdn.com";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;

  if (!isAllowedPath(path)) {
    return new Response("Not found", { status: 404 });
  }

  const response = await fetch(`${FLAG_BASE_URL}/${path.map(encodeURIComponent).join("/")}`, {
    headers: { Accept: "image/*" },
    next: { revalidate: 86400 },
  });

  if (!response.ok || !response.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

function isAllowedPath(path: string[]) {
  if (path.length !== 2) return false;
  return /^w\d+$/.test(path[0]) && /^[a-z]{2}\.png$/.test(path[1]);
}
