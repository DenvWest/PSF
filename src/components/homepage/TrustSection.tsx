import Container from "@/components/layout/Container";

export default function TrustSection() {
  return (
    <section className="py-28">
      <div className="ps-divider" />
      <Container>
        <div className="pt-28">
          <div className="max-w-[520px]">
            <p className="ps-eyebrow">Onze filosofie</p>
            <h2 className="ps-display mt-5 text-[2.25rem] leading-[1.1] text-stone-900 sm:text-[2.75rem]">
              Rust boven complexiteit.
            </h2>
            <div className="mt-8 space-y-4 text-[0.9375rem] leading-[1.85] text-stone-400">
              <p>
                Geen ingewikkelde trajecten of overvolle schema&apos;s.
                We beginnen met een sterke basis — en bouwen van daaruit verder.
              </p>
              <p>
                Door beter te begrijpen wat je gebruikt en waarom, maak je
                vanzelf betere keuzes. Niet alles tegelijk, maar stap voor stap.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
