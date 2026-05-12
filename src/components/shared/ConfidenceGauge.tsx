"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number;
  size?: number;
  className?: string;
}

function getConfidenceColor(value: number): string {
  if (value >= 70) return "#22d3ee";
  if (value >= 40) return "#d946ef";
  return "#ef4444";
}

function getConfidenceLabel(value: number): string {
  if (value >= 80) return "High";
  if (value >= 60) return "Medium";
  if (value >= 30) return "Low";
  return "Very Low";
}

export function ConfidenceGauge({
  value,
  size = 120,
  className,
}: ConfidenceGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const clamped = Math.min(100, Math.max(0, value));
  const color = getConfidenceColor(clamped);
  const label = getConfidenceLabel(clamped);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(clamped);
    }, 100);
    return () => clearTimeout(timer);
  }, [clamped]);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const dashArray = `${arcLength} ${circumference - arcLength}`;
  const dashOffset = -circumference * 0.125;

  const progressOffset =
    dashOffset - (arcLength * (100 - animatedValue)) / 100;

  // Label color class
  const labelColors: Record<string, string> = {
    High: "text-cyan-400",
    Medium: "text-magenta-400",
    Low: "text-red-400",
    "Very Low": "text-red-500",
  };

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {/* Background ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[135deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-800"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute transform -rotate-[135deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={dashArray}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1s ease-out",
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl font-display font-bold text-white transition-colors duration-500"
          style={{ color }}
        >
          {Math.round(animatedValue)}%
        </span>
        <span
          className={cn("text-[10px] font-medium uppercase tracking-wider", labelColors[label] ?? "text-gray-400")}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
