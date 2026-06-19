export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-0">{children}</div>
      </main>
    </div>
  );
}
