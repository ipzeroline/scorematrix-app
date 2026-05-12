import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Footer } from "@/components/layout/Footer";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 pb-20 lg:pb-4">{children}</main>
      </div>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
