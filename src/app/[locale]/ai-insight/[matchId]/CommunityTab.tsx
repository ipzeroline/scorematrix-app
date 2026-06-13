import { Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { getAIInsightPageCopy } from "@/data/ai-insight-page-content";
import type { ApiFootballAIInsightDetail, ApiFootballFixture } from "@/lib/api-football";
import { formatNumber } from "./_detail-shared";
import type { LocalizedDetailCopy } from "./_detail-shared";
import { SectionHeading } from "./_detail-ui";

type CommunityTabProps = {
  fixture: ApiFootballFixture;
  insight: ApiFootballAIInsightDetail;
  details: LocalizedDetailCopy;
  locale: string;
  copy: ReturnType<typeof getAIInsightPageCopy>;
};

export default function CommunityTab({
  fixture,
  insight,
  details,
  locale,
  copy,
}: CommunityTabProps) {
  return (
    <div className="w-full">
      <CommunityCard
        insight={insight}
        copy={copy}
        fixture={fixture}
        locale={locale}
        details={details}
      />
    </div>
  );
}

function CommunityCard({
  insight,
  copy,
  fixture,
  locale,
  details,
}: {
  insight: ApiFootballAIInsightDetail;
  copy: ReturnType<typeof getAIInsightPageCopy>;
  fixture: ApiFootballFixture;
  locale: string;
  details: LocalizedDetailCopy;
}) {
  const sentiment = insight.communitySentiment;
  if (!sentiment) return null;

  return (
    <Card className="border-white/10 bg-[linear-gradient(180deg,rgba(11,17,32,0.96),rgba(7,10,18,0.98))] p-5">
      <SectionHeading
        icon={Users}
        title={copy.labels.community}
        description={`${formatNumber(sentiment.totalVotes, locale)} ${copy.labels.votes}`}
        accent="purple"
      />
      {sentiment.totalVotes > 0 ? (
        <div className="mt-4 space-y-4">
          <ProbabilityRow label={fixture.home.name} value={sentiment.homePercentage} color="cyan" />
          <ProbabilityRow label={copy.labels.draw} value={sentiment.drawPercentage} color="purple" />
          <ProbabilityRow label={fixture.away.name} value={sentiment.awayPercentage} color="magenta" />
        </div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-3 py-4 text-center">
          <Users size={32} className="text-gray-600" />
          <p className="text-sm text-gray-400">{details.noCommunityVotes}</p>
        </div>
      )}
    </Card>
  );
}

function ProbabilityRow({
  label,
  value,
  color,
}: {
  label: string;
  value: number | null;
  color: "cyan" | "purple" | "magenta";
}) {
  const percent = typeof value === "number" ? `${Math.round(value)}%` : "-";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-gray-200">{label}</span>
        <span className="font-mono text-sm text-white">{percent}</span>
      </div>
      <ProgressBar value={value ?? 0} color={color} size="lg" className="w-full" />
    </div>
  );
}
