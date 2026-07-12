export interface DossierSection {
  id: string;
  label: string;
}

export function SectionAnchorNav({ sections }: { sections: DossierSection[] }) {
  return (
    <nav className="sticky top-6 hidden w-44 shrink-0 flex-col gap-0.5 lg:flex">
      {sections.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="rounded-md px-3 py-1.5 text-sm text-[var(--ps-body)] hover:bg-[var(--ps-bg)] hover:text-[var(--ps-ink)]"
        >
          {s.label}
        </a>
      ))}
    </nav>
  );
}
