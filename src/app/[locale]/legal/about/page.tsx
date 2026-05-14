import { LegalDocument } from "@/components/legal/LegalDocument";
import { getAboutContent } from "@/data/legal-info-pages";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  return <LegalDocument content={getAboutContent(locale)} />;
}
