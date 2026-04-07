interface FAQItemProps {
  vraag: string;
  antwoord: string;
}

export default function FAQItem({ vraag, antwoord }: FAQItemProps) {
  return (
    <details className="group border-b border-stone-100 pb-5 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-1 text-sm font-semibold text-stone-900 marker:hidden [&::-webkit-details-marker]:hidden">
        <span>{vraag}</span>
        <span
          className="mt-0.5 shrink-0 text-stone-400 transition group-open:rotate-45"
          aria-hidden
        >
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-7 text-stone-600">{antwoord}</p>
    </details>
  );
}
