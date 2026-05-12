import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Logo } from "./Logo";

export async function Footer() {
  const locale = await getLocale();
  const t = await getTranslations();
  const platformLinks = [
    { href: "/livescore", label: t("nav.livescore") },
    { href: "/predict", label: t("nav.predict") },
    { href: "/ai-insight", label: t("nav.aiInsight") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
  ];
  const featureLinks = [
    { href: "/missions", label: t("nav.missions") },
    { href: "/rewards", label: t("nav.rewards") },
    { href: "/leagues", label: t("nav.leagues") },
    { href: "/news", label: t("nav.news") },
  ];
  const legalLinks = [
    { href: "/legal/terms", label: t("legal.terms") },
    { href: "/legal/privacy", label: t("legal.privacy") },
    { href: "/legal/reward-rules", label: t("legal.rewardRules") },
    { href: "/legal/legal-notice", label: t("legal.legalNotice") },
  ];

  return (
    <footer className="hidden lg:block border-t border-gray-800/50 bg-[#0a0a0f] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="text-xs text-gray-500 max-w-xs">
              {t("common.disclaimer")}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2">
                {t("footer.platform")}
              </h4>
              <ul className="space-y-1">
                {platformLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2">
                {t("footer.features")}
              </h4>
              <ul className="space-y-1">
                {featureLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-400 mb-2">
                {t("footer.legal")}
              </h4>
              <ul className="space-y-1">
                {legalLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-gray-600">
            {t("common.noGambling")}
          </p>
        </div>
      </div>
    </footer>
  );
}
