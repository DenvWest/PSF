import type { BlogSectie as BlogSectieType } from "@/types/blog";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";
import ArticleEvidenceNiveau from "@/components/content/ArticleEvidenceNiveau";
import InsightBlock from "@/components/content/InsightBlock";
import { blogSubsectionDomId } from "@/lib/article-heading-id";

interface BlogSectieProps {
  sectie: BlogSectieType;
  anchorId: string;
}

const PROSE_BODY =
  "text-[1.0625rem] leading-[1.86] tracking-[0.008em] text-stone-600";

export default function BlogSectie({ sectie, anchorId }: BlogSectieProps) {
  return (
    <section
      aria-labelledby={anchorId}
      className="border-b border-stone-200/50 py-[3.25rem] last:border-b-0 md:py-[4.5rem]"
    >
      {sectie.bewijsNiveau ? (
        <div className="mb-4 max-w-[70ch] md:mb-5">
          <ArticleEvidenceNiveau niveau={sectie.bewijsNiveau} />
        </div>
      ) : null}

      <h2
        id={anchorId}
        tabIndex={-1}
        className="scroll-mt-[var(--reading-scroll-margin)] max-w-[70ch] font-display text-[clamp(1.28rem,2.4vw,1.55rem)] font-semibold leading-[1.26] tracking-tight text-stone-900"
      >
        {sectie.titel}
      </h2>

      {sectie.type === "tekst" && sectie.tekst && (
        <p className={`mt-7 max-w-[70ch] ${PROSE_BODY} md:mt-8`}>
          {renderInlineMarkdownLinks(sectie.tekst)}
        </p>
      )}

      {sectie.type === "opsomming" && (
        <div className="mt-7 md:mt-8">
          {sectie.inleiding && (
            <p className={`mb-7 max-w-[70ch] ${PROSE_BODY} md:mb-[1.875rem]`}>
              {renderInlineMarkdownLinks(sectie.inleiding)}
            </p>
          )}
          <ol className="max-w-[70ch] space-y-4 md:space-y-[1.125rem]">
            {sectie.items?.map((item, index) => {
              const colonIdx = item.indexOf(":");
              const hasLabel = colonIdx !== -1 && colonIdx < 40;
              return (
                <li key={index} className="flex gap-3 md:gap-[0.9375rem]">
                  <span
                    className="mt-[0.4375rem] flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border border-stone-200/90 bg-white text-[0.65rem] font-semibold tabular-nums text-stone-500"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className={`${PROSE_BODY} min-w-0 pt-px`}>
                    {hasLabel ? (
                      <>
                        <strong className="font-semibold text-stone-800">
                          {item.slice(0, colonIdx + 1)}
                        </strong>
                        {renderInlineMarkdownLinks(item.slice(colonIdx + 1))}
                      </>
                    ) : (
                      renderInlineMarkdownLinks(item)
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {sectie.callouts && sectie.callouts.length > 0 && (
        <div className="mt-7 flex flex-col gap-4 md:mt-8">
          {sectie.callouts.map((c, i) => (
            <InsightBlock key={i} variant={c.variant}>
              {renderInlineMarkdownLinks(c.tekst)}
            </InsightBlock>
          ))}
        </div>
      )}

      {sectie.subkoppen?.map((sub, subIndex) => {
        const subId = blogSubsectionDomId(anchorId, subIndex, sub.titel);
        return (
          <section
            key={subId}
            id={subId}
            tabIndex={-1}
            aria-labelledby={`h3-${subId}`}
            className="scroll-mt-[calc(var(--reading-scroll-margin)-0.45rem)] mt-9 border-l border-stone-200/65 pl-4 md:mt-11 md:pl-[1.0625rem]"
          >
            <h3
              id={`h3-${subId}`}
              className="font-display text-[1.05rem] font-semibold leading-snug text-stone-800 md:text-[1.09rem]"
            >
              {sub.titel}
            </h3>
            {sub.tekst ? (
              <p className={`mt-4 max-w-[70ch] ${PROSE_BODY} md:mt-[1.125rem]`}>
                {renderInlineMarkdownLinks(sub.tekst)}
              </p>
            ) : null}
          </section>
        );
      })}

      {sectie.bewijsKanttekening && (
        <p
          className="mt-8 max-w-[70ch] rounded-md border border-amber-200/65 bg-stone-50/90 px-4 py-[0.9375rem] text-[0.8125rem] leading-[1.65] text-stone-700 md:mt-[2rem]"
          role="note"
        >
          <span className="font-semibold text-stone-800">Nuance:</span>{" "}
          {renderInlineMarkdownLinks(sectie.bewijsKanttekening)}
        </p>
      )}
    </section>
  );
}
