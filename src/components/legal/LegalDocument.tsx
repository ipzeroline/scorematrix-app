type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocumentContent = {
  title: string;
  updated: string;
  intro?: string;
  notice?: {
    tone: "cyan" | "green" | "amber" | "red";
    title: string;
    body: string;
  };
  sections: LegalSection[];
};

const noticeClasses = {
  cyan: "border-cyan-500/20 bg-cyan-500/5 text-cyan-300",
  green: "border-green-500/20 bg-green-500/5 text-green-300",
  amber: "border-amber-500/20 bg-amber-500/5 text-amber-300",
  red: "border-red-500/20 bg-red-500/5 text-red-300",
};

export function LegalDocument({ content }: { content: LegalDocumentContent }) {
  return (
    <article className="prose prose-invert max-w-none">
      <h1 className="mb-3 font-display text-2xl font-bold text-white">
        {content.title}
      </h1>
      <p className="mb-6 text-sm text-gray-500">{content.updated}</p>

      {content.intro && (
        <p className="mb-6 text-sm leading-7 text-gray-300">{content.intro}</p>
      )}

      {content.notice && (
        <div
          className={`mb-8 rounded-xl border p-4 ${noticeClasses[content.notice.tone]}`}
        >
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wider">
            {content.notice.title}
          </h2>
          <p className="text-sm leading-6 text-gray-300">{content.notice.body}</p>
        </div>
      )}

      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <section key={section.title}>
            <h2 className="mb-3 text-lg font-semibold text-white">
              {index + 1}. {section.title}
            </h2>
            <div className="space-y-3">
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-sm leading-7 text-gray-400"
                >
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-gray-400">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
