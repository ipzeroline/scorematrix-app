import { ChevronDown } from "lucide-react";
import { getFaqContent } from "@/data/legal-info-pages";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FAQPage({ params }: Props) {
  const { locale } = await params;
  const content = getFaqContent(locale);

  return (
    <div>
      <h1 className="mb-3 font-display text-2xl font-bold text-white">
        {content.title}
      </h1>
      <p className="mb-6 text-sm leading-7 text-gray-400">{content.intro}</p>
      <div className="space-y-2">
        {content.items.map((faq) => (
          <details
            key={faq.q}
            className="group overflow-hidden rounded-xl border border-gray-800 bg-[#12121a]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 text-left transition-colors hover:bg-white/[0.02]">
              <span className="text-sm font-medium text-white">{faq.q}</span>
              <ChevronDown
                size={16}
                className="shrink-0 text-gray-500 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm leading-7 text-gray-400">{faq.a}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
