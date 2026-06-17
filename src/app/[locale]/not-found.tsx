import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SearchX } from "lucide-react";

export default async function LocaleNotFound() {
  const t = await getTranslations("common");

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-cyan-300/15 bg-[#0b111d] px-4 py-10 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
        <SearchX size={22} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-white">{t("notFound")}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">
        {t("notFoundDescription")}
      </p>
      <Link
        href="/th"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-cyan-500 px-3.5 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
      >
        {t("backHome")}
      </Link>
    </section>
  );
}
