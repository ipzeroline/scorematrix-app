"use client";
import { useState, useRef, useEffect, useId } from "react";
import { cn } from "@/lib/utils";

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  containerClassName?: string;
}

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
  containerClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", containerClassName)}>
      <button
        id={triggerId}
        type="button"
        onClick={() => setOpen(!open)}
        className="cursor-pointer rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          aria-labelledby={triggerId}
          className={cn(
            "absolute top-full mt-2 rounded-xl border border-gray-800 bg-[#1a1a2e] shadow-2xl py-1 min-w-[180px] z-50 animate-slide-up",
            align === "right" ? "right-0" : "left-0",
            className
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  danger,
  active,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      role="menuitem"
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer",
        active && "bg-cyan-500/10 text-cyan-400",
        danger ? "text-red-400 hover:bg-red-500/10" : "text-gray-300 hover:bg-white/5",
        className
      )}
    >
      {children}
    </button>
  );
}
