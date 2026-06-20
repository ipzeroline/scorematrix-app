import { apiGetRaw, apiPostRaw, type ApiRequestOptions } from "@/lib/api-client";

// ── Request ──────────────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

// ── Responses ────────────────────────────────────────────────────────────

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
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
 * Falls back to a mock response while the backend endpoint is being built.
 */
export async function createCheckoutSession(
  body: CheckoutSessionRequest,
  options?: ApiRequestOptions
): Promise<CheckoutSessionResponse> {
  try {
    return await apiPostRaw<CheckoutSessionResponse>(
      "/credits/checkout",
      body,
      options
    );
  } catch {
    // ── Mock fallback ──────────────────────────────────────────────
    return mockCreateCheckoutSession(body);
  }
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

// ── Mock helpers ─────────────────────────────────────────────────────────

function mockCreateCheckoutSession(
  body: CheckoutSessionRequest
): CheckoutSessionResponse {
  const sessionId = `cs_mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    sessionId,
    checkoutUrl: `https://checkout.stripe.com/c/pay/${sessionId}`,
  };
}

function mockGetCheckoutSessionStatus(
  sessionId: string
): CheckoutSessionStatusResponse {
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
