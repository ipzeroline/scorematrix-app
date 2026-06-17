"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface Slide {
  gradient: string;
  href: "/predict" | "/ai-insight" | "/rewards";
  key: "predict" | "ai" | "rewards";
}

const slides: Slide[] = [
  {
    gradient: "from-cyan-500/20 via-purple-500/10 to-[#0a0a0f]",
    href: "/predict",
    key: "predict",
  },
  {
    gradient: "from-magenta-500/20 via-cyan-500/10 to-[#0a0a0f]",
    href: "/ai-insight",
    key: "ai",
  },
  {
    gradient: "from-amber-500/20 via-purple-500/10 to-[#0a0a0f]",
    href: "/rewards",
    key: "rewards",
  },
];

export function HeroBanner() {
  const locale = useLocale();
  const t = useTranslations("dashboard.heroSlides");
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    window.setTimeout(() => setIsTransitioning(false), 400);
  }, [current]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = (current + 1) % slides.length;
      setIsTransitioning(true);
      setCurrent(next);
      window.setTimeout(() => setIsTransitioning(false), 400);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [current]);

  const slide = slides[current];

  return (
    <div className="scorematrix-hero-slider relative h-36 w-full overflow-hidden rounded-xl border border-gray-800 bg-[#0a0a0f] sm:h-[168px] md:h-48">
      {/* Slide content */}
      <div
        className={`hero-fade absolute inset-0 bg-gradient-to-r ${slide.gradient} ${
          isTransitioning ? "opacity-80" : "opacity-100"
        }`}
      />

      <div className="relative z-10 flex h-full min-w-0 flex-col items-start justify-center px-4 md:px-6">
        <h1
          className={`hero-content mb-1.5 max-w-full truncate text-xl font-bold text-white sm:overflow-visible sm:whitespace-normal sm:text-2xl md:text-[1.65rem] ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{
            width: "min(100%, calc(100vw - 3rem))",
            overflowWrap: "anywhere",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {t(`${slide.key}.headline`)}
        </h1>
        <p
          className={`hero-content hero-content-delay mb-3 hidden max-w-full truncate text-xs leading-5 text-gray-400 sm:block sm:max-w-lg sm:overflow-visible sm:whitespace-normal md:text-[13px] ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{
            width: "min(100%, calc(100vw - 3rem))",
            overflowWrap: "anywhere",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {t(`${slide.key}.subtitle`)}
        </p>
        <div
          className={`hero-content hero-content-delay-long ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <Link
            href={`/${locale}${slide.href}`}
            className="neon-cyan inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {t(`${slide.key}.cta`)}
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`hero-dot h-1.5 w-1.5 rounded-full ${
              i === current
                ? "w-5 bg-cyan-400"
                : "bg-gray-600 hover:bg-gray-400"
            }`}
            aria-label={t("goToSlide", { index: i + 1 })}
          />
        ))}
      </div>
    </div>
  );
}
