function firstForwardedValue(value: string | null) {
  return value?.split(",")[0]?.trim() || undefined;
}

function isLocalHost(host: string) {
  const hostname = host.split(":")[0]?.toLowerCase();
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getPublicRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost ?? firstForwardedValue(request.headers.get("host"));

  if (host && !isLocalHost(host)) {
    const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto"));
    const proto = forwardedProto ?? requestUrl.protocol.replace(/:$/, "") ?? "https";
    return `${proto}://${host}`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configuredUrl && process.env.NODE_ENV === "production") {
    return configuredUrl;
  }

  return requestUrl.origin;
}
