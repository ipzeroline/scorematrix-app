import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

export function Avatar({
  src,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={fallback || ""}
        className={cn(
          "rounded-full object-cover border border-gray-700",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gray-800 flex items-center justify-center text-gray-400 border border-gray-700",
        sizeClasses[size],
        className
      )}
    >
      {fallback ? (
        <span className="font-medium">{fallback.slice(0, 2).toUpperCase()}</span>
      ) : (
        <User size={size === "sm" ? 12 : size === "md" ? 16 : 20} />
      )}
    </div>
  );
}
