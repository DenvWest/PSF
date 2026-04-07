import type { BlogSectie as BlogSectieType } from "@/types/blog";

interface BlogSectieProps {
  sectie: BlogSectieType;
}

export default function BlogSectie({ sectie }: BlogSectieProps) {
  return (
    <section aria-labelledby={`sectie-${sectie.titel.toLowerCase().replace(/\s+/g, "-")}`}>
      <h2
        id={`sectie-${sectie.titel.toLowerCase().replace(/\s+/g, "-")}`}
        className="font-display text-xl font-semibold leading-snug tracking-tight text-stone-900 sm:text-2xl"
      >
        {sectie.titel}
      </h2>

      {sectie.type === "tekst" && sectie.tekst && (
        <p className="mt-4 text-[1.0625rem] leading-[1.75] text-stone-600">
          {sectie.tekst}
        </p>
      )}

      {sectie.type === "opsomming" && (
        <div className="mt-4">
          {sectie.inleiding && (
            <p className="mb-4 text-[1.0625rem] leading-[1.75] text-stone-600">
              {sectie.inleiding}
            </p>
          )}
          <ol className="space-y-3">
            {sectie.items?.map((item, index) => {
              const colonIdx = item.indexOf(":");
              const hasLabel = colonIdx !== -1 && colonIdx < 40;
              return (
                <li key={index} className="flex gap-3">
                  <span
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-500"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <p className="text-[1.0625rem] leading-[1.75] text-stone-600">
                    {hasLabel ? (
                      <>
                        <strong className="font-semibold text-stone-800">
                          {item.slice(0, colonIdx + 1)}
                        </strong>
                        {item.slice(colonIdx + 1)}
                      </>
                    ) : (
                      item
                    )}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </section>
  );
}
