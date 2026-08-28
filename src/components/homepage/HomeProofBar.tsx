import Container from "@/components/layout/Container";
import { HOMEPAGE_PROOF } from "@/data/homepage";
import { getHomepageProofCounts } from "@/lib/homepage-proof";

export default function HomeProofBar() {
  const counts = getHomepageProofCounts();

  return (
    <section
      className="border-b border-stone-200/60 bg-[#F7F5F0] px-6 py-6 lg:px-8 lg:py-7"
      aria-label={HOMEPAGE_PROOF.ariaLabel}
    >
      <Container>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {HOMEPAGE_PROOF.items.map((item) => (
            <div key={item.key} className="flex flex-col-reverse gap-1">
              <dt className="text-xs leading-snug text-stone-600 sm:text-[13px]">
                {item.label}
              </dt>
              <dd className="font-serif text-2xl leading-none text-stone-900 sm:text-[1.75rem]">
                {counts[item.key]}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
