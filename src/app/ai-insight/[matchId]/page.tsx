import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/i18n";

type Props = {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AIInsightRedirectPage({
  params,
  searchParams,
}: Props) {
  const { matchId } = await params;
  const query = await searchParams;
  const target = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => target.append(key, item));
      return;
    }

    if (value !== undefined) {
      target.set(key, value);
    }
  });

  const suffix = target.size > 0 ? `?${target.toString()}` : "";

  redirect(`/${DEFAULT_LOCALE}/ai-insight/${matchId}${suffix}`);
}
