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

export const DEFAULT_CREDIT_PACKAGES_RESPONSE: CreditPackagesResponse = {
  packages: [
    {
      id: "p50",
      name: "50 THB",
      amountThb: 50,
      baseCredits: 50,
      bonusCredits: 0,
      totalCredits: 50,
      isFeatured: false,
    },
    {
      id: "p100",
      name: "100 THB",
      amountThb: 100,
      baseCredits: 100,
      bonusCredits: 10,
      totalCredits: 110,
      isFeatured: false,
    },
    {
      id: "p200",
      name: "200 THB",
      amountThb: 200,
      baseCredits: 200,
      bonusCredits: 50,
      totalCredits: 250,
      isFeatured: true,
    },
    {
      id: "p500",
      name: "500 THB",
      amountThb: 500,
      baseCredits: 500,
      bonusCredits: 150,
      totalCredits: 650,
      isFeatured: false,
    },
    {
      id: "p1000",
      name: "1000 THB",
      amountThb: 1000,
      baseCredits: 1000,
      bonusCredits: 400,
      totalCredits: 1400,
      isFeatured: false,
    },
  ],
  firstPurchaseBonus: {
    bonusCredits: 50,
    minAmountThb: 200,
  },
};

type CreditPackagesApiPayload =
  | CreditPackagesResponse
  | {
      data?: CreditPackagesResponse;
    };

export async function getCreditPackages(options?: ApiRequestOptions) {
  const response = await apiGetRaw<CreditPackagesApiPayload>(
    "/credits/packages",
    options
  );

  return normalizeCreditPackagesResponse(response);
}

function normalizeCreditPackagesResponse(
  response: CreditPackagesApiPayload
): CreditPackagesResponse {
  if ("packages" in response && Array.isArray(response.packages)) {
    return response;
  }

  if ("data" in response && response.data?.packages && Array.isArray(response.data.packages)) {
    return response.data;
  }

  return DEFAULT_CREDIT_PACKAGES_RESPONSE;
}
