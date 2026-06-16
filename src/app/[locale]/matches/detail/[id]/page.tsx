import type { Metadata } from "next";
import MatchDetailPage, { generateMetadata as generateMatchMetadata } from "@/app/[locale]/livescore/[matchId]/page";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;

  const metadata = await generateMatchMetadata({
    params: Promise.resolve({
      locale,
      matchId: id,
    }),
  });

  const pathname = `/${locale}/matches/detail/${id}`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    ["th", "en", "lo", "my", "km", "zh"].map((code) => [code, `${SITE_URL}/${code}/matches/detail/${id}`])
  );

  return {
    ...metadata,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/matches/detail/${id}`,
      },
    },
    openGraph: {
      ...metadata.openGraph,
      url: canonical,
    },
  };
}

export default async function MatchDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;

  return (
    <MatchDetailPage
      params={Promise.resolve({
        locale,
        matchId: id,
      })}
    />
  );
}
