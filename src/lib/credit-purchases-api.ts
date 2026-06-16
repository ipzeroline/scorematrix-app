import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type CreditPurchaseStatus =
  | "pending"
  | "completed"
  | "failed"
  | "refunded";

export type CreditPaymentMethod =
  | "promptpay"
  | "credit_card"
  | "truemoney"
  | "rabbit_linepay"
  | string;

export type CreditPurchaseItem = {
  id: string;
  packageId: string | null;
  packageName: string | null;
  amountThb: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  status: CreditPurchaseStatus | string;
  paymentMethod: CreditPaymentMethod | null;
  transactionId: string | null;
  createdAt: string | null;
  paidAt: string | null;
};

export type CreditPurchasesResult = {
  items: CreditPurchaseItem[];
  totalSpentThb: number;
  hasMore: boolean;
};

type CreditPurchasesOptions = {
  status?: CreditPurchaseStatus | "all";
  page: number;
  limit: number;
} & ApiRequestOptions;

export async function getCreditPurchases({
  status = "all",
  page,
  limit,
  ...options
}: CreditPurchasesOptions): Promise<CreditPurchasesResult> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status !== "all") {
    params.set("status", status);
  }

  const response = await apiGetRaw<unknown>(
    `/credits/purchases?${params.toString()}`,
    options
  );

  return {
    items: normalizeCreditPurchases(response).sort(byCreatedAtDesc),
    totalSpentThb: pickTotalSpent(response),
    hasMore: hasMorePages(response, page),
  };
}

function byCreatedAtDesc(a: CreditPurchaseItem, b: CreditPurchaseItem): number {
  const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
  const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
  return tb - ta;
}

function normalizeCreditPurchases(payload: unknown): CreditPurchaseItem[] {
  return extractList(payload).flatMap((raw, index) => {
    if (!isRecord(raw)) return [];

    const id =
      pickString(raw.id, raw._id, raw.uuid, raw.purchaseId, raw.purchase_id) ??
      `purchase-${index}`;
    const status = pickString(raw.status, raw.paymentStatus, raw.payment_status);

    return [
      {
        id,
        packageId: pickString(raw.packageId, raw.package_id),
        packageName: pickString(raw.packageName, raw.package_name, raw.name),
        amountThb: pickNumber(raw.amountThb, raw.amount_thb, raw.amount) ?? 0,
        baseCredits:
          pickNumber(raw.baseCredits, raw.base_credits, raw.credits) ?? 0,
        bonusCredits:
          pickNumber(raw.bonusCredits, raw.bonus_credits, raw.bonus) ?? 0,
        totalCredits:
          pickNumber(
            raw.totalCredits,
            raw.total_credits,
            raw.creditAmount,
            raw.credit_amount
          ) ?? 0,
        status: status ?? "pending",
        paymentMethod: pickString(
          raw.paymentMethod,
          raw.payment_method,
          raw.method
        ),
        transactionId: pickString(
          raw.transactionId,
          raw.transaction_id,
          raw.gatewayTransactionId,
          raw.gateway_transaction_id
        ),
        createdAt: pickString(raw.createdAt, raw.created_at, raw.date),
        paidAt: pickString(raw.paidAt, raw.paid_at, raw.completedAt),
      },
    ];
  });
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.purchases)) return payload.purchases;
  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.items)) return payload.data.items;
    if (Array.isArray(payload.data.purchases)) return payload.data.purchases;
  }
  return [];
}

function pickTotalSpent(payload: unknown): number {
  if (!isRecord(payload)) return 0;
  const direct = pickNumber(payload.totalSpentThb, payload.total_spent_thb);
  if (direct !== null) return direct;
  if (isRecord(payload.data)) {
    return pickNumber(payload.data.totalSpentThb, payload.data.total_spent_thb) ?? 0;
  }
  return 0;
}

function hasMorePages(payload: unknown, currentPage: number): boolean {
  if (!isRecord(payload)) return false;
  const pagination = isRecord(payload.pagination)
    ? payload.pagination
    : isRecord(payload.meta)
      ? payload.meta
      : isRecord(payload.data) && isRecord(payload.data.pagination)
        ? payload.data.pagination
        : undefined;
  if (!pagination) return false;

  const page = pickNumber(pagination.page) ?? currentPage;
  const totalPages = pickNumber(pagination.totalPages, pagination.total_pages);
  return totalPages !== null ? page < totalPages : false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function pickNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}
