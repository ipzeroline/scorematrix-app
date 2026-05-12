import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface UpsetAlertProps {
  description: string;
  probability: number;
  className?: string;
}

export function UpsetAlert({
  description,
  probability,
  className,
}: UpsetAlertProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-3",
        "bg-gradient-to-r from-red-500/10 via-magenta-500/10 to-red-500/5",
        "border-red-500/30",
        "animate-slide-up",
        className
      )}
    >
      {/* Background subtle glow */}
      <div className="absolute -inset-1 bg-red-500/5 blur-md rounded-xl" />

      <div className="relative flex items-start gap-3">
        {/* Warning Icon */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle size={16} className="text-red-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-display font-bold text-red-400 uppercase tracking-wider">
              Upset Alert
            </span>
            <span className="text-[10px] font-mono text-magenta-400 bg-magenta-500/10 px-1.5 py-0.5 rounded-full border border-magenta-500/20">
              {probability}% Probability
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
