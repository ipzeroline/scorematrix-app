import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { DEFAULT_LOCALE } from "@/i18n";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://scorematrix.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ScoreMatrix — Predict. Compete. Win.",
  description:
    "The ultimate skill-based football prediction platform. Predict matches, earn points, claim rewards. No gambling — pure skill.",
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${inter.variable} ${spaceGrotesk.variable} h-full`}
    >
      <body className="min-h-full bg-[#0a0a0f] text-[#e2e8f0] antialiased">
        {children}
      </body>
    </html>
  );
}
