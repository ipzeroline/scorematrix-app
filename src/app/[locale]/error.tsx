"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");

  return (
    <section className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-10 text-center">
      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-300">
        <AlertTriangle size={22} aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-white">{t("error")}</h2>
      <p className="mt-2 text-sm leading-6 text-gray-400">
        {t("errorDescription")}
      </p>
      <Button className="mt-5" onClick={reset}>
        {t("retry")}
      </Button>
    </section>
  );
}
