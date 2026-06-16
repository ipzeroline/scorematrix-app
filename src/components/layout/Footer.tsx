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
    { href: "/legal/contact", label: t("nav.contactTeam") },
  ];

  return (
    <footer className="mt-auto border-t border-gray-800/50 bg-[#0a0a0f]">
      <div className="mx-auto max-w-[1440px] px-4 py-6 pb-20 lg:pb-6">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
          <div className="flex max-w-sm flex-col gap-2">
            <Logo />
            <p className="text-xs leading-5 text-gray-500">
              {t("common.disclaimer")}
            </p>
          </div>
          <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-3 lg:w-auto lg:gap-8">
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
        <div className="mt-6 flex flex-col items-start justify-between gap-2 border-t border-gray-800/50 pt-4 sm:flex-row sm:items-center">
          <p className="text-xs leading-5 text-gray-600">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs leading-5 text-gray-600 sm:text-right">
            {t("common.noGambling")}
          </p>
        </div>
      </div>
    </footer>
  );
}
