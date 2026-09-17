import Container from "@/components/layout/Container";

const MOMENTS = [
  {
    title: "Op een drukke dinsdag",
    body: "Energie die tot de avond staat, in plaats van een dip die je toeschrijft aan ‘gewoon druk’.",
  },
  {
    title: "In de winter",
    body: "Niet nóg een seizoen waarin je wegzakt omdat zon én bord allebei weinig vitamine D leveren.",
  },
  {
    title: "Plantaardig blijven",
    body: "Je patroon houden — mét B12, jodium, algenolie en verrijkte drank. Geen terug naar vlees omdat je het bord niet vertrouwde.",
  },
  {
    title: "Over twintig jaar",
    body: "Botten en zenuwen die meewerken. De stoffen waren klein. De jaren waren lang.",
  },
];

export default function NutritionGapFuture() {
  return (
    <section
      id="toekomst"
      className="border-b border-black/10 bg-[#F7F0E6] text-[#2A211A]"
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#8A6A4E]">
              De andere versie van je toekomst
            </p>
            <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08]">
              Hoe het óók kan voelen — jarenlang
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-[#5B4A3B]">
              Niet perfect. Niet “elke stof tot op de milligram”. Gewoon: een
              patroon waarin de bekende gaten dichtzitten, of je nu vegan eet of
              niet.
            </p>

            <figure className="mt-8 border-l-[3px] border-[#C9713F] py-0.5 pl-6">
              <blockquote className="font-serif text-[clamp(19px,2.4vw,24px)] italic leading-[1.32]">
                Weet je wat het fijnste is? Dat ik plantaardig bleef eten
                zonder later te denken: had ik die B12 maar eerder serieus
                genomen. Dat lijkt klein. Voor mij is het alles.
              </blockquote>
              <p className="mt-3 text-[13px] text-[#8A6A4E]">
                — jij, ergens rond je 70e — de versie die de gaten dichtzette
              </p>
            </figure>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            {MOMENTS.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-black/10 bg-white/60 p-5"
              >
                <p className="font-serif text-[18px] text-[#2A211A]">
                  {m.title}
                </p>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#5B4A3B]">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
