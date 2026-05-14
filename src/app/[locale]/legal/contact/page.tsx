import { Mail, ShieldCheck } from "lucide-react";
import { getContactContent } from "@/data/legal-info-pages";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const content = getContactContent(locale);

  return (
    <div>
      <h1 className="mb-2 font-display text-2xl font-bold text-white">
        {content.title}
      </h1>
      <p className="mb-6 text-sm leading-7 text-gray-400">{content.intro}</p>

      <section className="rounded-2xl border border-gray-800 bg-[#12121a] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {content.channelsTitle}
        </h2>
        <div className="grid gap-3">
          {content.channels.map((channel) => (
            <a
              key={channel.value}
              href={`mailto:${channel.value}`}
              className="flex gap-3 rounded-xl border border-gray-800 bg-black/20 p-4 transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5"
            >
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-200">
                <Mail size={18} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white">
                  {channel.label}
                </span>
                <span className="block break-all font-mono text-xs text-cyan-300">
                  {channel.value}
                </span>
                <span className="mt-1 block text-xs leading-5 text-gray-500">
                  {channel.note}
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-800 bg-[#0d1118] p-5">
        <div className="mb-3 flex items-center gap-2 text-amber-300">
          <ShieldCheck size={18} />
          <h2 className="text-lg font-semibold text-white">
            {content.responseTitle}
          </h2>
        </div>
        <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-400">
          {content.responseItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="mt-5 rounded-2xl border border-gray-800 bg-[#12121a] p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          {content.send}
        </h2>
        <form className="space-y-4">
          <Field label={content.name} placeholder={content.namePlaceholder} />
          <Field label={content.email} placeholder={content.emailPlaceholder} type="email" />
          <Field label={content.topic} placeholder={content.topicPlaceholder} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              {content.message}
            </label>
            <textarea
              className="min-h-[120px] w-full resize-y rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
              placeholder={content.messagePlaceholder}
              rows={4}
            />
          </div>
          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-cyan-400"
          >
            {content.send}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
}: {
  label: string;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-400">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-700 bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/20"
      />
    </div>
  );
}
