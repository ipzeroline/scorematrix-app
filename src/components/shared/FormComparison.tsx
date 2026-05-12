import { cn } from "@/lib/utils";

type FormResult = "W" | "D" | "L";

interface FormComparisonProps {
  homeForm: FormResult[];
  awayForm: FormResult[];
  homeTeamName: string;
  awayTeamName: string;
  className?: string;
}

function FormBadge({ result }: { result: FormResult }) {
  const config: Record<
    FormResult,
    { label: string; className: string }
  > = {
    W: {
      label: "W",
      className: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    D: {
      label: "D",
      className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    L: {
      label: "L",
      className: "bg-red-500/20 text-red-400 border-red-500/30",
    },
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold border font-mono",
        config[result].className
      )}
      title={
        result === "W" ? "Win" : result === "D" ? "Draw" : "Loss"
      }
    >
      {config[result].label}
    </span>
  );
}

function FormRow({
  form,
  teamName,
  side,
}: {
  form: FormResult[];
  teamName: string;
  side: "home" | "away";
}) {
  const displayForm = form.slice(-5);
  const padded: (FormResult | null)[] = Array(5).fill(null);

  for (let i = 0; i < displayForm.length; i++) {
    padded[5 - displayForm.length + i] = displayForm[i];
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "text-xs font-medium w-16 truncate",
          side === "home" ? "text-cyan-400 text-right" : "text-magenta-400 text-left",
          side === "away" && "order-1"
        )}
      >
        {teamName}
      </span>

      <div
        className={cn(
          "flex items-center gap-1",
          side === "away" && "order-1 flex-row-reverse"
        )}
      >
        {padded.map((result, i) =>
          result ? (
            <FormBadge key={i} result={result} />
          ) : (
            <span
              key={i}
              className="w-6 h-6 rounded border border-gray-800 bg-gray-800/30 text-[10px] flex items-center justify-center text-gray-700 font-mono"
            >
              -
            </span>
          )
        )}
      </div>
    </div>
  );
}

export function FormComparison({
  homeForm,
  awayForm,
  homeTeamName,
  awayTeamName,
  className,
}: FormComparisonProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <FormRow form={homeForm} teamName={homeTeamName} side="home" />
      <FormRow form={awayForm} teamName={awayTeamName} side="away" />
    </div>
  );
}
