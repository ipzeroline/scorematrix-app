export interface CreditPackage {
  id: string;
  name: string;
  priceTHB: number;
  baseCredits: number;
  bonusPercent: number;
  bonusCredits: number;
  totalCredits: number;
  tier: "free" | "starter" | "fan" | "pro" | "elite" | "legend";
  color: "slate" | "emerald" | "cyan" | "violet" | "amber";
  features: CreditFeature[];
  popular?: boolean;
  savingsLabel?: string;
}

export interface CreditFeature {
  key: string;
  name: string;
  included: boolean;
  value?: string;
  highlighted?: boolean;
}

export interface FirstPurchaseBonus {
  bonusCredits: number;
  minAmountThb: number;
}

// ── Stripe Checkout ──────────────────────────────────────────────────────

export interface CheckoutSessionRequest {
  packageId: string;
  successUrl: string;
  cancelUrl: string;
}

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
