import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Headphones,
  LifeBuoy,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  getTeamContactContent,
  SUPPORT_EMAIL,
} from "@/data/team-contact-content";
import { LOCALE_CODES } from "@/i18n";
import { serializeJsonLd } from "@/lib/json-ld";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const content = getTeamContactContent(locale);
  const pathname = `/${locale}/legal/contact`;
  const canonical = `${SITE_URL}${pathname}`;
  const languages = Object.fromEntries(
    LOCALE_CODES.map((code) => [code, `${SITE_URL}/${code}/legal/contact`])
  );

  return {
    title: content.title,
    description: content.description,
    keywords: content.keywords,
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": `${SITE_URL}/th/legal/contact`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: content.ogTitle,
      description: content.ogDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      type: "website",
      images: [
        {
          url: "/brand/scorematrix-logo.png",
          width: 512,
          height: 512,
          alt: `${SITE_NAME} support`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.ogTitle,
      description: content.ogDescription,
      images: ["/brand/scorematrix-logo.png"],
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  const content = getTeamContactContent(locale);
  const structuredData = buildContactStructuredData(locale, content);
  const mailHref = `mailto:${SUPPORT_EMAIL}`;

  return (
    <div className="space-y-5 pb-8">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-[#0b111d] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-lime-300 to-purple-300" />
        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -bottom-28 left-10 h-56 w-56 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="relative grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:items-stretch">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase tracking-wide text-cyan-100">
              <LifeBuoy size={14} />
              {content.eyebrow}
            </div>
            <h1 className="text-3xl font-black leading-tight text-white md:text-4xl">
              {content.heroTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-gray-400">
              {content.heroDescription}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-xs font-black text-lime-100">
                <CheckCircle2 size={14} />
                {content.responseItems[2]}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-black text-cyan-100">
                <ShieldCheck size={14} />
                {content.responseItems[3]}
              </span>
            </div>
          </div>

          <aside className="rounded-3xl border border-cyan-300/20 bg-black/25 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Mail size={21} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  {content.email}
                </p>
                <p className="truncate text-sm font-black text-white">
                  {SUPPORT_EMAIL}
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm font-semibold leading-6 text-gray-400">
              {content.privacyNote}
            </p>
            <a
              href={mailHref}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-black transition-colors hover:bg-cyan-300"
            >
              <Mail size={17} />
              {content.send}
              <ArrowRight size={16} />
            </a>
          </aside>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-3xl border border-white/10 bg-[#0d111a] p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
              <Headphones size={20} />
            </span>
            <h2 className="text-xl font-black text-white">
              {content.channelsTitle}
            </h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {content.channels.map((channel) => (
              <a
                key={channel.label}
                href={mailHref}
                className="group flex min-h-[150px] flex-col rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/[0.06]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200 transition group-hover:scale-105">
                  <ShieldCheck size={18} />
                </span>
                <h3 className="mt-3 text-base font-black leading-6 text-white group-hover:text-cyan-100">
                  {channel.label}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-400">
                  {channel.note}
                </p>
                <span className="mt-auto pt-3 text-xs font-black uppercase tracking-wide text-cyan-300 opacity-80">
                  {content.send}
                </span>
              </a>
            ))}
          </div>
        </div>

        <aside className="rounded-3xl border border-amber-300/15 bg-[#0b111d] p-4 md:p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-200">
              <Clock size={22} />
            </span>
            <h2 className="text-xl font-black leading-7 text-white">
              {content.responseTitle}
            </h2>
          </div>
          <ul className="space-y-3 text-sm font-semibold leading-6 text-gray-400">
            {content.responseItems.map((item) => (
              <li
                key={item}
                className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <ShieldCheck className="mt-1 shrink-0 text-cyan-300" size={15} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#0b111d] p-4 md:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-200">
            <LifeBuoy size={20} />
          </span>
          <h2 className="text-xl font-black text-white">{content.faqTitle}</h2>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {content.faqs.map((faq) => (
            <article
              key={faq.question}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <h3 className="text-base font-black leading-6 text-white">
                {faq.question}
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-gray-400">
                {faq.answer}
              </p>
            </article>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
    </div>
  );
}

function buildContactStructuredData(
  locale: string,
  content: ReturnType<typeof getTeamContactContent>
) {
  const url = `${SITE_URL}/${locale}/legal/contact`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "@id": `${url}#webpage`,
      url,
      name: content.title,
      description: content.description,
      inLanguage: locale,
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      email: SUPPORT_EMAIL,
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: SUPPORT_EMAIL,
          contactType: "customer support",
          availableLanguage: LOCALE_CODES,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: content.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: SITE_NAME,
          item: `${SITE_URL}/${locale}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: content.heroTitle,
          item: url,
        },
      ],
    },
  ];
}
