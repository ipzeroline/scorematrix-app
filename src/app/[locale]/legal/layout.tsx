import { Logo } from "@/components/layout/Logo";
import { getTranslations } from "next-intl/server";

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "terms" },
  { href: "/legal/privacy", label: "privacy" },
  { href: "/legal/reward-rules", label: "rewardRules" },
  { href: "/legal/legal-notice", label: "legalNotice" },
  { href: "/legal/faq", label: "faq" },
  { href: "/legal/contact", label: "contact" },
  { href: "/legal/about", label: "about" },
];

export default async function LegalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 glass border-b border-gray-800/50">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center">
          <Logo />
        </div>
      </header>
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 flex gap-8">
        <aside className="hidden md:block w-48 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={`/${locale}${link.href}`}
                className="block px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {t(link.label)}
              </a>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
