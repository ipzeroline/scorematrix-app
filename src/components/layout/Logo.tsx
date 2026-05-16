"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

interface LogoProps {
  size?: "sm" | "md";
}

const logoSize = {
  sm: {
    shell: "h-10 w-[184px]",
    width: 368,
    height: 92,
  },
  md: {
    shell: "h-12 w-[210px] sm:w-[272px]",
    width: 544,
    height: 136,
  },
};

export function Logo({ size = "md" }: LogoProps) {
  const { locale } = useParams<{ locale: string }>();
  const config = logoSize[size];

  return (
    <Link
      href={`/${locale || "th"}`}
      aria-label="ScoreMatrix"
      className="group flex shrink-0 items-center no-underline"
    >
      <span
        className={`scorematrix-logo-shell relative flex ${config.shell} items-center justify-center overflow-hidden px-1 transition-transform duration-300 group-hover:-translate-y-0.5`}
      >
        <span className="scorematrix-logo-sheen absolute inset-y-1 -left-1/3 z-20" />
        <Image
          src="/brand/scorematrix-logo.png"
          alt="ScoreMatrix"
          width={config.width}
          height={config.height}
          priority
          className="relative z-10 h-auto w-full object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.42)]"
        />
      </span>
    </Link>
  );
}
