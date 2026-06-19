import "server-only";

import { getDataApiUrl } from "@/lib/backend-api-urls";
import type { ScoringRules } from "@/types/scoring-rules";

type ScoringRulesResponse = {
  data?: ScoringRules;
};

export async function getScoringRules(): Promise<ScoringRules | null> {
  try {
    const response = await fetch(getDataApiUrl("/scoring-rules"), {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ScoringRulesResponse & ScoringRules;
    return payload.data ?? payload ?? null;
  } catch {
    return null;
  }
}
