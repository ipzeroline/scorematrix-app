import MatchDetailPage from "@/app/[locale]/livescore/[matchId]/page";

type Props = {
  params: Promise<{ locale: string; providerId: string }>;
};

export default async function LivescoreProviderMatchPage({ params }: Props) {
  const { locale, providerId } = await params;

  return (
    <MatchDetailPage
      params={Promise.resolve({
        locale,
        matchId: providerId,
      })}
    />
  );
}
