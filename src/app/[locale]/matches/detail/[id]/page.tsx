import MatchDetailPage from "@/app/[locale]/livescore/[matchId]/page";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

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
