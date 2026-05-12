"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

interface Slide {
  gradient: string;
  key: "predict" | "ai" | "rewards";
}

const slides: Slide[] = [
  {
    gradient: "from-cyan-500/20 via-purple-500/10 to-[#0a0a0f]",
    key: "predict",
  },
  {
    gradient: "from-magenta-500/20 via-cyan-500/10 to-[#0a0a0f]",
    key: "ai",
  },
  {
    gradient: "from-amber-500/20 via-purple-500/10 to-[#0a0a0f]",
    key: "rewards",
  },
];

export function HeroBanner() {
  const t = useTranslations("dashboard.heroSlides");
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 400);
    },
    [current, isTransitioning]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const slide = slides[current];

  return (
    <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-2xl overflow-hidden border border-gray-800 bg-[#0a0a0f]">
      {/* Slide content */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} transition-opacity duration-500 ${
          isTransitioning ? "opacity-80" : "opacity-100"
        }`}
      />

      <div className="relative z-10 flex flex-col items-start justify-center h-full px-6 md:px-10">
        <h1
          className={`font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 transition-all duration-400 ${
            isTransitioning
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {t(`${slide.key}.headline`)}
        </h1>
        <p
          className={`text-sm sm:text-base text-gray-400 max-w-lg mb-4 transition-all duration-400 delay-75 ${
            isTransitioning
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          {t(`${slide.key}.subtitle`)}
        </p>
        <div
          className={`transition-all duration-400 delay-100 ${
            isTransitioning
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          <Button variant="primary" neon size="md">
            {t(`${slide.key}.cta`)}
          </Button>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-cyan-400 w-6"
                : "bg-gray-600 hover:bg-gray-400"
            }`}
            aria-label={t("goToSlide", { index: i + 1 })}
          />
        ))}
      </div>
    </div>
  );
}
