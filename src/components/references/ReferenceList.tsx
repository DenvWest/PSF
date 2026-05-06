import { Reference } from "@/types/reference"

interface ReferenceListProps {
  references: Reference[]
}

export function ReferenceList({ references }: ReferenceListProps) {
  if (references.length === 0) return null

  return (
    <section className="mt-12 border-t border-stone-200 pt-6">
      <h2 className="font-display text-lg text-stone-700">Bronnen</h2>
      <ol className="mt-4 space-y-3 text-sm leading-relaxed text-stone-500">
        {references.map((ref, index) => (
          <li key={ref.id} id={`ref-${index + 1}`} className="pl-1">
            <span className="mr-1 font-medium text-stone-600">[{index + 1}]</span>
            {ref.authors} ({ref.year}). <em>{ref.title}</em>. {ref.journal}
            {ref.volume && `, ${ref.volume}`}
            {ref.pages && `, ${ref.pages}`}.
            {ref.doi && (
              <>
                {" "}
                <a
                  href={`https://doi.org/${ref.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                >
                  DOI
                </a>
              </>
            )}
            {ref.pmid && (
              <>
                {" "}
                <a
                  href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#5A8F6A] underline decoration-[#5A8F6A]/35 underline-offset-[3px]"
                >
                  PubMed
                </a>
              </>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
