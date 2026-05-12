import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "cyan"
  | "magenta"
  | "green"
  | "gold"
  | "red"
  | "purple";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  magenta: "bg-magenta-500/10 text-magenta-400 border-magenta-500/20",
  green: "bg-green-500/10 text-green-400 border-green-500/20",
  gold: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  red: "bg-red-500/10 text-red-400 border-red-500/20",
  purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
