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
