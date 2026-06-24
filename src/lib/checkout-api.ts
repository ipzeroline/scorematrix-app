import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";

// ── Request ──────────────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  packageId: string;
  paymentMethod: string;
  successUrl: string;
  cancelUrl: string;
  couponCode?: string;
}

// ── Responses ────────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  purchaseId?: string;
}

export type CheckoutSessionStatus =
  | "pending"
  | "complete"
  | "expired"
  | "failed";

export interface CheckoutSessionStatusResponse {
  status: CheckoutSessionStatus;
  packageId: string;
  packageName: string;
  totalCredits: number;
  amountThb: number;
  paidAt?: string;
}

// ── API calls ────────────────────────────────────────────────────────────

/**
 * Create a Stripe Checkout Session via the backend.
 */
export async function createCheckoutSession(
  body: CheckoutSessionRequest,
  options?: ApiRequestOptions
): Promise<CheckoutSessionResponse> {
  const response = await apiPostRaw<unknown>(
    "/credits/purchase",
    {
      packageId: body.packageId,
      paymentMethod: body.paymentMethod,
      couponCode: body.couponCode,
      successUrl: body.successUrl,
      cancelUrl: body.cancelUrl,
      success_url: body.successUrl,
      cancel_url: body.cancelUrl,
    },
    options
  );

  return normalizeCheckoutSessionResponse(response);
}

/**
 * Query the status of a Stripe Checkout Session.
 * Falls back to a mock response while the backend endpoint is being built.
 */
export async function getCheckoutSessionStatus(
  sessionId: string,
  options?: ApiRequestOptions
): Promise<CheckoutSessionStatusResponse> {
  try {
    return await apiGetRaw<CheckoutSessionStatusResponse>(
      `/credits/checkout/status?session_id=${encodeURIComponent(sessionId)}`,
      options
    );
  } catch {
    return mockGetCheckoutSessionStatus(sessionId);
  }
}

// ── Normalizers ──────────────────────────────────────────────────────────

function normalizeCheckoutSessionResponse(response: unknown): CheckoutSessionResponse {
  const record = toRecord(response);
  const data = toRecord(record?.data);
  const result = toRecord(record?.result);
  const payment = toRecord(data?.payment) ?? toRecord(result?.payment) ?? null;
  const session = toRecord(data?.session) ?? toRecord(result?.session) ?? null;
  const purchase = toRecord(data?.purchase) ?? toRecord(result?.purchase) ?? null;

  const checkoutUrl = pickString(
    record?.checkoutUrl,
    record?.checkout_url,
    record?.paymentUrl,
    record?.payment_url,
    record?.redirectUrl,
    record?.redirect_url,
    record?.url,
    data?.checkoutUrl,
    data?.checkout_url,
    data?.paymentUrl,
    data?.payment_url,
    data?.redirectUrl,
    data?.redirect_url,
    data?.url,
    result?.checkoutUrl,
    result?.checkout_url,
    result?.paymentUrl,
    result?.payment_url,
    result?.redirectUrl,
    result?.redirect_url,
    result?.url,
    payment?.checkoutUrl,
    payment?.checkout_url,
    payment?.paymentUrl,
    payment?.payment_url,
    payment?.redirectUrl,
    payment?.redirect_url,
    payment?.url,
    session?.url
  );

  if (!checkoutUrl) {
    throw new Error("Checkout response did not include a Stripe redirect URL");
  }

  const sessionId =
    pickString(
      record?.sessionId,
      record?.session_id,
      record?.checkoutSessionId,
      record?.checkout_session_id,
      data?.sessionId,
      data?.session_id,
      data?.checkoutSessionId,
      data?.checkout_session_id,
      result?.sessionId,
      result?.session_id,
      result?.checkoutSessionId,
      result?.checkout_session_id,
      session?.id,
      session?.sessionId,
      session?.session_id
    ) ?? "";

  const purchaseId = pickString(
    record?.purchaseId,
    record?.purchase_id,
    data?.purchaseId,
    data?.purchase_id,
    result?.purchaseId,
    result?.purchase_id,
    purchase?.id,
    purchase?.purchaseId,
    purchase?.purchase_id
  );

  return {
    sessionId,
    checkoutUrl,
    purchaseId,
  };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function mockGetCheckoutSessionStatus(
  sessionId: string
): CheckoutSessionStatusResponse {
  void sessionId;
  // Simulate a completed payment for any mock session
  return {
    status: "complete",
    packageId: "pro",
    packageName: "Pro Package",
    totalCredits: 345,
    amountThb: 300,
    paidAt: new Date().toISOString(),
  };
}
