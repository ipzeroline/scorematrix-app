import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function PredictErrorShell({
  locale,
  backLabel,
  children,
}: {
  locale: string;
  backLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <Link
        href={`/${locale}/matches`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-white"
      >
        <ArrowLeft size={14} />
        {backLabel}
      </Link>
      <Card className="border-amber-500/20 bg-amber-500/5 p-6 text-center">
        {children}
      </Card>
    </div>
  );
}
