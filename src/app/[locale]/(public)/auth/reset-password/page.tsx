import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";

export const metadata: Metadata = {
  title: "Reset Password | ScoreMatrix",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const token = typeof resolvedSearchParams.token === "string" ? resolvedSearchParams.token : "";
  const email = typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : "";

  return <ResetPasswordClient token={token} email={email} />;
}
