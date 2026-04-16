type Props = {
  items: Array<{ question: string; answer: string }>;
};

export function FaqSection({ items }: Props) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4">
        <div className="space-y-3">
          {items.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between p-5 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                {item.question}
                <span
                  aria-hidden
                  className="ml-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <div className="border-t border-slate-100 px-5 pb-5 pt-3">
                <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
