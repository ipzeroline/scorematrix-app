import { getDataApiUrl } from "@/lib/backend-api-urls";
import { isSameOriginMutation } from "@/lib/auth-session-server";
import { NO_CACHE_HEADERS } from "@/lib/no-cache";

export const dynamic = "force-dynamic";

type ReferralClickPayload = {
  referral_code?: unknown;
  referralCode?: unknown;
  referer?: unknown;
};

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return Response.json(
      { success: false, message: "Forbidden" },
      { status: 403, headers: NO_CACHE_HEADERS }
    );
  }

  let payload: ReferralClickPayload = {};
  try {
    payload = (await request.json()) as ReferralClickPayload;
  } catch {
    payload = {};
  }

  const referralCode = sanitizeReferralCode(
    stringValue(payload.referral_code) ?? stringValue(payload.referralCode) ?? ""
  );

  if (!referralCode) {
    return Response.json(
      { success: false, message: "referral_code is required" },
      { status: 400, headers: NO_CACHE_HEADERS }
    );
  }

  const userAgent = request.headers.get("user-agent") ?? "";
  const referer =
    stringValue(payload.referer) ?? request.headers.get("referer") ?? "";
  const ipAddress = getClientIpAddress(request);
  const backendHeaders = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  if (userAgent) backendHeaders.set("User-Agent", userAgent);
  if (referer) backendHeaders.set("Referer", referer);
  if (ipAddress) {
    backendHeaders.set("X-Forwarded-For", ipAddress);
    backendHeaders.set("X-Real-IP", ipAddress);
  }

  const response = await fetch(getDataApiUrl("referral-clicks"), {
    method: "POST",
    headers: backendHeaders,
    body: JSON.stringify({
      ip_address: ipAddress,
      user_agent: userAgent,
      referer,
      referral_code: referralCode,
    }),
    cache: "no-store",
    redirect: "manual",
  });

  if (!response.ok) {
    return Response.json(
      { success: false, message: "Referral click tracking failed" },
      { status: response.status, headers: NO_CACHE_HEADERS }
    );
  }

  return Response.json(
    { success: true },
    { status: 200, headers: NO_CACHE_HEADERS }
  );
}

function getClientIpAddress(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    ""
  );
}

function sanitizeReferralCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 24);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
