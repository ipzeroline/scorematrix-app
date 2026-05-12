import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

type StatColor = "cyan" | "green" | "gold" | "purple" | "magenta" | "red";
type StatTrend = "up" | "down" | "neutral";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: StatTrend;
  trendValue?: string | number;
  color?: StatColor;
  className?: string;
}

const colorClasses: Record<StatColor, string> = {
  cyan: "text-cyan-400",
  green: "text-green-400",
  gold: "text-amber-400",
  purple: "text-purple-400",
  magenta: "text-magenta-400",
  red: "text-red-400",
};

const colorBgClasses: Record<StatColor, string> = {
  cyan: "bg-cyan-500/10",
  green: "bg-green-500/10",
  gold: "bg-amber-500/10",
  purple: "bg-purple-500/10",
  magenta: "bg-magenta-500/10",
  red: "bg-red-500/10",
};

function TrendIndicator({
  trend,
  value,
}: {
  trend: StatTrend;
  value?: string | number;
}) {
  const config: Record<
    StatTrend,
    { icon: React.ReactNode; color: string }
  > = {
    up: {
      icon: <TrendingUp size={12} />,
      color: "text-green-400",
    },
    down: {
      icon: <TrendingDown size={12} />,
      color: "text-red-400",
    },
    neutral: {
      icon: <Minus size={12} />,
      color: "text-gray-500",
    },
  };

  const { icon, color } = config[trend];

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs", color)}>
      {icon}
      {value !== undefined && (
        <span className="font-mono font-medium">{value}</span>
      )}
    </span>
  );
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = "cyan",
  className,
}: StatCardProps) {
  return (
    <Card className={cn("animate-slide-up", className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <span className={cn(colorBgClasses[color], "p-1.5 rounded-lg")}>
            <span className={colorClasses[color]}>{icon}</span>
          </span>
        )}
      </div>

      <div className="space-y-1">
        <span
          className={cn(
            "text-2xl font-display font-bold",
            colorClasses[color]
          )}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>

        {trend && (
          <div>
            <TrendIndicator trend={trend} value={trendValue} />
          </div>
        )}
      </div>
    </Card>
  );
}
