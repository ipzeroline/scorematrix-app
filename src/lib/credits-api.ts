import { apiGetRaw, type ApiRequestOptions } from "@/lib/api-client";

export type CreditPackageApiItem = {
  id: string;
  name: string;
  amountThb: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  isFeatured: boolean;
};

export type CreditPackagesResponse = {
  packages: CreditPackageApiItem[];
  firstPurchaseBonus?: {
    bonusCredits: number;
    minAmountThb: number;
  } | null;
};

export async function getCreditPackages(options?: ApiRequestOptions) {
  const response = await apiGetRaw<unknown>(
    "/credits/packages",
    options
  );

  return normalizeCreditPackagesResponse(response);
}

function normalizeCreditPackagesResponse(
  response: unknown
): CreditPackagesResponse {
  const record = toRecord(response);
  const data = toRecord(record?.data);
  const result = toRecord(record?.result);
  const packageValues =
    findArray(record?.packages) ??
    findArray(data?.packages) ??
    findArray(data?.items) ??
    findArray(result?.packages) ??
    findArray(result?.items) ??
    findArray(response);

  const firstPurchaseBonus =
    normalizeFirstPurchaseBonus(record?.firstPurchaseBonus) ??
    normalizeFirstPurchaseBonus(record?.first_purchase_bonus) ??
    normalizeFirstPurchaseBonus(data?.firstPurchaseBonus) ??
    normalizeFirstPurchaseBonus(data?.first_purchase_bonus) ??
    normalizeFirstPurchaseBonus(result?.firstPurchaseBonus) ??
    normalizeFirstPurchaseBonus(result?.first_purchase_bonus) ??
    null;

  return {
    packages: (packageValues ?? [])
      .map(normalizeCreditPackage)
      .filter(isCreditPackageApiItem),
    firstPurchaseBonus,
  };
}

function normalizeCreditPackage(value: unknown, index: number): CreditPackageApiItem | null {
  const record = toRecord(value);
  if (!record) return null;

  const amountThb =
    pickNumber(record.amountThb, record.amount_thb, record.priceThb, record.price_thb, record.price, record.amount) ??
    0;
  const baseCredits =
    pickNumber(record.baseCredits, record.base_credits, record.credits, record.credit_amount, record.amountCredits) ??
    0;
  const bonusCredits =
    pickNumber(record.bonusCredits, record.bonus_credits, record.bonus, record.bonusCredit) ??
    0;
  const totalCredits =
    pickNumber(record.totalCredits, record.total_credits, record.total, record.totalCredit) ??
    baseCredits + bonusCredits;

  if (amountThb <= 0 && baseCredits <= 0 && totalCredits <= 0) return null;

  const id =
    pickString(record.id, record.packageId, record.package_id, record.slug) ??
    `package-${index + 1}`;
  const name =
    pickString(record.name, record.title, record.label) ??
    (amountThb > 0 ? `${amountThb} THB` : `${totalCredits} Credits`);

  return {
    id,
    name,
    amountThb,
    baseCredits,
    bonusCredits,
    totalCredits,
    isFeatured: pickBoolean(record.isFeatured, record.is_featured, record.featured, record.popular) ?? false,
  };
}

function normalizeFirstPurchaseBonus(value: unknown) {
  const record = toRecord(value);
  if (!record) return null;

  const bonusCredits = pickNumber(record.bonusCredits, record.bonus_credits, record.credits);
  const minAmountThb = pickNumber(
    record.minAmountThb,
    record.min_amount_thb,
    record.minimumAmountThb,
    record.minimum_amount_thb,
    record.minPurchaseAmount,
    record.min_purchase_amount
  );

  if (bonusCredits === undefined || minAmountThb === undefined) return null;

  return {
    bonusCredits,
    minAmountThb,
  };
}

function toRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function findArray(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function pickNumber(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const normalized = Number(value.replace(/,/g, ""));
      if (Number.isFinite(normalized)) return normalized;
    }
  }
  return undefined;
}

function pickBoolean(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "1", "yes"].includes(normalized)) return true;
      if (["false", "0", "no"].includes(normalized)) return false;
    }
  }
  return undefined;
}

function isCreditPackageApiItem(
  value: CreditPackageApiItem | null
): value is CreditPackageApiItem {
  return value !== null;
}
