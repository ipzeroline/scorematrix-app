"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { LOCALES } from "@/lib/constants";

const LOCALE_FLAGS: Record<string, string> = {
  th: "🇹🇭",
  en: "🇬🇧",
  lo: "🇱🇦",
  my: "🇲🇲",
  km: "🇰🇭",
  zh: "🇨🇳",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(`${newPath}${window.location.search}`);
  };

  const currentLocale = LOCALES.find((l) => l.code === locale);
  const currentFlag = LOCALE_FLAGS[locale] ?? "🌐";

  return (
    <Dropdown
      align="right"
      containerClassName="w-auto"
      className="z-[80] w-[min(14rem,calc(100vw-2rem))] max-h-[70vh] overflow-y-auto"
      trigger={
        <div
          className="flex h-9 w-[58px] items-center justify-center gap-1.5 rounded-lg border border-gray-800 bg-white/[0.03] px-2 text-gray-300 transition-colors hover:border-cyan-500/40 hover:bg-white/5 hover:text-white"
          aria-label={`Change language, current language ${currentLocale?.label ?? locale}`}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {currentFlag}
          </span>
          <span className="text-[10px] font-bold leading-none text-gray-400">
            {currentLocale?.code.toUpperCase()}
          </span>
        </div>
      }
    >
      {LOCALES.map((l) => (
        <DropdownItem
          key={l.code}
          active={locale === l.code}
          onClick={() => switchLocale(l.code)}
          className="min-w-0"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-base leading-none" aria-hidden="true">
              {LOCALE_FLAGS[l.code] ?? "🌐"}
            </span>
            <span className="min-w-0 flex-1 truncate">{l.native}</span>
            <span className="shrink-0 text-[10px] font-bold text-gray-500">
              {l.code.toUpperCase()}
            </span>
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
