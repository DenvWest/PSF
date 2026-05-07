import type { BlogSectie as BlogSectieType } from "@/types/blog";
import { renderInlineMarkdownLinks } from "@/components/blog/inlineMarkdownLinks";
import ArticleEvidenceNiveau from "@/components/content/ArticleEvidenceNiveau";
import { blogSubsectionDomId } from "@/lib/article-heading-id";

interface BlogSectieProps {
  sectie: BlogSectieType;
  /** Uniek kop-id voor ankers — gelijk aan `blogSectionDomId` in de TOC-builder. */
  anchorId: string;
}

const PROSE_BODY =
  "text-[1.0625rem] leading-[1.82] tracking-[0.003em] text-stone-600";

export default function BlogSectie({ sectie, anchorId }: BlogSectieProps) {
  return (
    <section aria-labelledby={anchorId} className="border-b border-stone-200/55 py-14 last:border-b-0 md:py-[4.25rem]">
      <div className="flex flex-wrap items-start justify-between gap-3 md:gap-5">
        <h2
          id={anchorId}
          tabIndex={-1}
          className="scroll-mt-[var(--reading-scroll-margin)] max-w-[min(62ch,calc(100%-2rem))] font-display text-[clamp(1.25rem,2.5vw,1.5625rem)] font-semibold leading-snug tracking-tight text-stone-900"
        >
          {sectie.titel}
        </h2>
        {sectie.bewijsNiveau && (
          <div className="shrink-0">
            <ArticleEvidenceNiveau niveau={sectie.bewijsNiveau} />
          </div>
        )}
      </div>

      {sectie.type === "tekst" && sectie.tekst && (
        <p className={`mt-6 max-w-[72ch] ${PROSE_BODY} md:mt-7`}>
          {renderInlineMarkdownLinks(sectie.tekst)}
        </p>
      )}

      {sectie.type === "opsomming" && (
        <div className="mt-6 md:mt-7">
          {sectie.inleiding && (
            <p className={`mb-6 max-w-[72ch] ${PROSE_BODY} md:mb-7`}>
              {renderInlineMarkdownLinks(sectie.inleiding)}
            </p>
          )}
          <ol className="max-w-[72ch] space-y-4 md:space-y-5">
            {sectie.items?.map((item, index) => {
              const colonIdx = item.indexOf(":");
              const hasLabel = colonIdx !== -1 && colonIdx < 40;
              return (
                <li key={index} className="flex gap-3">
                  <span
                    className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border border-stone-200/95 bg-white/90 text-[0.6875rem] font-semibold text-stone-500"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className={`${PROSE_BODY} min-w-0`}>
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

      {sectie.subkoppen?.map((sub, subIndex) => {
        const subId = blogSubsectionDomId(anchorId, subIndex, sub.titel);
        return (
          <div key={subId} className="mt-8 md:mt-10">
            <h3
              id={subId}
              tabIndex={-1}
              className="scroll-mt-[calc(var(--reading-scroll-margin)-0.35rem)] font-display text-[1.0625rem] font-semibold leading-snug text-stone-900 md:text-[1.125rem]"
            >
              {sub.titel}
            </h3>
            {sub.tekst ? (
              <p className={`mt-4 max-w-[72ch] ${PROSE_BODY} md:mt-5`}>
                {renderInlineMarkdownLinks(sub.tekst)}
              </p>
            ) : null}
          </div>
        );
      })}

      {sectie.bewijsKanttekening && (
        <p
          className="mt-7 max-w-[72ch] rounded-lg border border-amber-200/80 bg-amber-50/45 px-4 py-3 text-[0.8125rem] leading-relaxed text-stone-700 md:mt-8"
          role="note"
        >
          <span className="font-semibold text-stone-800">Bewijs & nuance:</span>{" "}
          {renderInlineMarkdownLinks(sectie.bewijsKanttekening)}
        </p>
      )}
    </section>
  );
}
