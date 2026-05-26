export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-start justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="w-full max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
