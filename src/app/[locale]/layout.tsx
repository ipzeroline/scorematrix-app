import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { StoreInitializer } from "@/components/shared/StoreInitializer";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { LOCALE_CODES, type LocaleCode } from "@/i18n";

function isLocale(value: string): value is LocaleCode {
  return LOCALE_CODES.includes(value as LocaleCode);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <StoreInitializer />
      <ToastContainer />
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 pb-20 lg:pb-4">{children}</main>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    </NextIntlClientProvider>
  );
}
