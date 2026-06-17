"use client";
import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  size = "md",
}: ModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (open) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex min-h-full items-start justify-center p-4 sm:items-center">
        <div
          className={cn(
            "relative my-6 flex max-h-[calc(100vh-3rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#12121a] p-6 shadow-2xl animate-slide-up",
            sizeClasses[size],
            className
          )}
        >
          {title && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="min-w-0 truncate text-lg font-semibold text-white">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="min-h-0 overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
