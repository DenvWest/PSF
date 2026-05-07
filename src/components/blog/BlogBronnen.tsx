interface BlogBronnenProps {
  bronnen: string[];
}

export default function BlogBronnen({ bronnen }: BlogBronnenProps) {
  if (bronnen.length === 0) return null;
  return (
    <section
      aria-labelledby="blog-bronnen-heading"
      className="scroll-mt-8 rounded-xl border border-stone-200/80 bg-white px-5 py-6 sm:px-6"
    >
      <h2
        id="blog-bronnen-heading"
        className="font-display text-xl font-semibold leading-snug tracking-tight text-stone-900"
      >
        Bronnen
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-stone-600 marker:text-stone-400">
        {bronnen.map((bron, i) => (
          <li key={i} className="pl-1">
            {bron}
          </li>
        ))}
      </ol>
    </section>
  );
}
