import { renderInlineMarkdownLinks } from "./inlineMarkdownLinks";

interface BlogSamenvattingProps {
  tekst: string;
}

export default function BlogSamenvatting({ tekst }: BlogSamenvattingProps) {
  return (
    <aside
      aria-label="Samenvatting"
      className="max-w-[72ch] rounded-xl border border-stone-200/90 bg-stone-50/60 px-6 py-6 md:px-7 md:py-7"
    >
      <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
        Samenvatting
      </p>
      <p className="text-[1.0625rem] leading-[1.82] text-stone-700">
        {renderInlineMarkdownLinks(tekst)}
      </p>
    </aside>
  );
}
