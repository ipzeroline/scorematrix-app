"use client";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const t = useTranslations("auth");
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold font-display text-white">
          {t("login")}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Welcome back to ScoreMatrix
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-800 bg-[#12121a] p-6 space-y-4"
      >
        <Input label={t("email")} type="email" placeholder="cyberfan@example.com" />
        <Input label={t("password")} type="password" placeholder="••••••••" />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {t("login")}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        {t("noAccount")}{" "}
        <Link
          href={`/${locale}/auth/register`}
          className="text-cyan-400 hover:underline"
        >
          {t("register")}
        </Link>
      </p>
    </div>
  );
}
