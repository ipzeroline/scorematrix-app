"use client";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { Globe } from "lucide-react";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { LOCALES } from "@/lib/constants";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const currentLocale = LOCALES.find((l) => l.code === locale);

  return (
    <Dropdown
      trigger={
        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors cursor-pointer">
          <Globe size={16} />
          <span className="text-xs font-medium hidden sm:inline">
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
        >
          <span className="flex items-center gap-2">
            <span>{l.native}</span>
            <span className="text-gray-500 text-xs">{l.label}</span>
          </span>
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
