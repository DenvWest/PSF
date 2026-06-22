interface BlogKernpuntenProps {
  punten: string[];
}

export default function BlogKernpunten({ punten }: BlogKernpuntenProps) {
  return (
    <aside
      role="note"
      aria-label="Kernpunten om te onthouden"
      className="max-w-[72ch] rounded-2xl px-7 py-7 md:px-8 md:py-8"
      style={{ backgroundColor: "#0E1A14" }}
    >
      <p className="mb-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em]" style={{ color: "#5A8F6A" }}>
        Kernpunten om te onthouden
      </p>
      <ul className="flex flex-col gap-3.5">
        {punten.map((punt, index) => (
          <li key={index} className="flex items-start gap-3.5">
            <span
              className="mt-[0.35em] h-4 w-4 shrink-0 rounded-full"
              style={{ boxShadow: "0 0 0 2px #5A8F6A" }}
              aria-hidden="true"
            />
            <span className="text-[0.9375rem] leading-[1.78] text-stone-100">{punt}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
