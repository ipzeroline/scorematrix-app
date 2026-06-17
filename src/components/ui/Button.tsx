"use client";
import { ButtonHTMLAttributes } from "react";
import { FootballSpinner } from "@/components/ui/FootballLoading";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "gold"
  | "green";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  neon?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-cyan-500 text-black font-semibold hover:bg-cyan-400 disabled:bg-cyan-500/50",
  secondary:
    "bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30",
  outline:
    "border border-gray-600 text-gray-300 hover:border-cyan-500/50 hover:text-cyan-400",
  ghost: "text-gray-400 hover:text-white hover:bg-white/5",
  danger:
    "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
  gold: "bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:bg-amber-500/50",
  green:
    "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30",
};

const sizeClasses: Record<Size, string> = {
  sm: "min-h-9 px-3 py-2 text-xs rounded-lg",
  md: "min-h-10 px-3.5 py-2 text-sm rounded-lg",
  lg: "min-h-11 px-4 py-2.5 text-sm rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  neon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variantClasses[variant],
        sizeClasses[size],
        neon && variant === "primary" && "neon-cyan",
        neon && variant === "gold" && "neon-gold",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <FootballSpinner />}
      {children}
    </button>
  );
}
