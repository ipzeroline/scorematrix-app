import { LegalDocument } from "@/components/legal/LegalDocument";
import { getLegalDocument } from "@/data/legal-documents";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RewardRulesPage({ params }: Props) {
  const { locale } = await params;
  return <LegalDocument content={getLegalDocument(locale, "rewardRules")} />;
}
