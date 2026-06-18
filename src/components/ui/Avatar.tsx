import Image from "next/image";
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

const imageSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
};

export function Avatar({
  src,
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  if (src) {
    if (src.startsWith("data:") || src.startsWith("blob:")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={fallback || ""}
          width={imageSizes[size]}
          height={imageSizes[size]}
          className={cn(
            "rounded-full object-cover border border-gray-700",
            sizeClasses[size],
            className
          )}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={fallback || ""}
        width={imageSizes[size]}
        height={imageSizes[size]}
        unoptimized
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
