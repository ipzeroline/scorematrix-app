"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { HomepageBanner } from "@/types/banner";

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

interface HeroBannerProps {
  banners?: HomepageBanner[];
}

export function HeroBanner({ banners = [] }: HeroBannerProps) {
  const locale = useLocale();
  const t = useTranslations("dashboard.heroSlides");
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hasApiBanners = banners.length > 0;
  const totalSlides = hasApiBanners ? banners.length : slides.length;

  const goTo = useCallback((index: number) => {
    if (index === current) return;
    setIsTransitioning(true);
    setCurrent(index);
    window.setTimeout(() => setIsTransitioning(false), 400);
  }, [current]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = (current + 1) % totalSlides;
      setIsTransitioning(true);
      setCurrent(next);
      window.setTimeout(() => setIsTransitioning(false), 400);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [current, totalSlides]);

  const apiBanner = hasApiBanners ? banners[current] ?? banners[0] : null;
  const slide = slides[current] ?? slides[0];
  const title = apiBanner ? apiBanner.title : t(`${slide.key}.headline`);
  const description = apiBanner ? apiBanner.description : t(`${slide.key}.subtitle`);
  const href = apiBanner ? normalizeBannerHref(apiBanner.linkUrl, locale) : `/${locale}${slide.href}`;
  const cta = apiBanner ? getBannerCta(apiBanner.linkUrl, locale) : t(`${slide.key}.cta`);
  const backgroundImage = apiBanner?.imageUrl
    ? `linear-gradient(90deg, rgba(3,7,18,0.92) 0%, rgba(3,7,18,0.72) 42%, rgba(3,7,18,0.28) 100%), url(${apiBanner.imageUrl})`
    : undefined;

  return (
    <div className="scorematrix-hero-slider relative h-36 w-full overflow-hidden rounded-xl border border-gray-800 bg-[#0a0a0f] sm:h-[168px] md:h-48">
      {/* Slide content */}
      <div
        className={`hero-fade absolute inset-0 bg-gradient-to-r ${apiBanner ? "from-black/80 via-black/45 to-black/5 bg-cover bg-center" : slide.gradient} ${
          isTransitioning ? "opacity-80" : "opacity-100"
        }`}
        style={backgroundImage ? { backgroundImage } : undefined}
      />
      {apiBanner && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.38))]" />
      )}

      <div className="relative z-10 flex h-full min-w-0 flex-col items-start justify-center px-4 md:px-6">
        <h1
          className={`hero-content mb-1.5 max-w-full truncate text-xl font-black text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.65)] sm:overflow-visible sm:whitespace-normal sm:text-2xl md:text-[1.65rem] ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{
            width: "min(100%, calc(100vw - 3rem))",
            overflowWrap: "anywhere",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {title}
        </h1>
        <p
          className={`hero-content hero-content-delay mb-3 hidden max-w-full truncate text-xs font-semibold leading-5 text-gray-300 drop-shadow-[0_2px_14px_rgba(0,0,0,0.7)] sm:block sm:max-w-lg sm:overflow-visible sm:whitespace-normal md:text-[13px] ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
          style={{
            width: "min(100%, calc(100vw - 3rem))",
            overflowWrap: "anywhere",
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {description}
        </p>
        <div
          className={`hero-content hero-content-delay-long ${
            isTransitioning ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <Link
            href={href}
            className="neon-cyan inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
          >
            {cta}
          </Link>
        </div>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {Array.from({ length: totalSlides }).map((_, i) => (
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

function normalizeBannerHref(linkUrl: string, locale: string) {
  try {
    const url = new URL(linkUrl);
    if (url.hostname === "scorematrix.live" || url.hostname === "www.scorematrix.live") {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    // Relative URLs are accepted below.
  }

  if (linkUrl.startsWith("/")) {
    return linkUrl.startsWith(`/${locale}/`) || linkUrl === `/${locale}`
      ? linkUrl
      : `/${locale}${linkUrl}`;
  }

  return linkUrl;
}

function getBannerCta(linkUrl: string, locale: string) {
  const normalized = normalizeBannerHref(linkUrl, locale);
  const path = normalized.toLowerCase();

  if (path.includes("/rewards")) return locale === "th" ? "ดูรางวัล" : "View rewards";
  if (path.includes("/predict")) return locale === "th" ? "ทายผล" : "Predict";
  if (path.includes("/ai-insight")) return locale === "th" ? "ดู AI วิเคราะห์" : "View AI insights";
  return locale === "th" ? "เปิดดู" : "Open";
}
