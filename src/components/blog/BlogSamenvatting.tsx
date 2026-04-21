import { renderInlineMarkdownLinks } from "./inlineMarkdownLinks";

interface BlogSamenvattingProps {
  tekst: string;
}

export default function BlogSamenvatting({ tekst }: BlogSamenvattingProps) {
  return (
    <aside
      aria-label="Samenvatting"
      className="rounded-xl border border-stone-200 bg-stone-50 px-6 py-5"
    >
      <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-stone-400">
        Samenvatting
      </p>
      <p className="text-[1.0625rem] leading-[1.75] text-stone-700">
        {renderInlineMarkdownLinks(tekst)}
      </p>
    </aside>
  );
}
