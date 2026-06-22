import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";
import { StoreInitializer } from "@/components/shared/StoreInitializer";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { LOCALE_CODES, type LocaleCode } from "@/i18n";
import { hasAuthSession } from "@/lib/auth-session-server";

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
  const hasSession = await hasAuthSession();

  return (
    <NextIntlClientProvider key={locale} locale={locale} messages={messages}>
      <StoreInitializer hasAuthSession={hasSession} />
      <ScrollToTop />
      <ToastContainer />
      <div className="flex min-h-screen flex-col pt-14">
        <Header />
        <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-x-hidden overflow-y-visible px-2.5 py-3 pb-20 sm:px-3 lg:px-4 lg:py-3 lg:pb-4 [overflow-anchor:none] [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch]">{children}</main>
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    </NextIntlClientProvider>
  );
}
