import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  neon?: "cyan" | "magenta" | "green" | "gold";
  hover?: boolean;
  glass?: boolean;
}

export function Card({
  neon,
  hover,
  glass,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-gray-800 bg-[#111722] p-3",
        hover && "transition-colors duration-150 hover:border-gray-700 hover:bg-[#151d2a] cursor-pointer",
        glass && "glass",
        neon === "cyan" && "hover:border-cyan-500/30 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]",
        neon === "magenta" && "hover:border-magenta-500/30 hover:shadow-[0_0_15px_rgba(217,70,239,0.1)]",
        neon === "green" && "hover:border-green-500/30 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]",
        neon === "gold" && "hover:border-amber-500/30 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
