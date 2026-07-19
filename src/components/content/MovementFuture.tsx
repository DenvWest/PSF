import Container from "@/components/layout/Container";

const MOMENTS = [
  {
    title: "Op vakantie",
    body: "De berg op voor het uitzicht, zonder halverwege te twijfelen of je het haalt.",
  },
  {
    title: "Met je (klein)kinderen",
    body: "Optillen, ravotten, een potje voetballen — meedoen in plaats van toekijken.",
  },
  {
    title: "Thuis",
    body: "De verhuisdozen, de kast omhoog, het tuinwerk — je pakt het aan zonder er dagen van te voelen.",
  },
  {
    title: "Elke ochtend",
    body: "Uit bed komen met energie die stabiel is, in plaats van de dag doorkomen op wilskracht.",
  },
];

export default function MovementFuture() {
  return (
    <section
      id="toekomst"
      className="border-b border-black/10 bg-[#F7F0E6] text-[#2A211A]"
    >
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-[#8A6A4E]">
              De andere versie van je toekomst
            </p>
            <h2 className="mt-3 font-serif text-[clamp(24px,3.4vw,38px)] font-normal leading-[1.08]">
              Hoe het óók kan voelen — jarenlang
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-[#5B4A3B]">
              Niet perfect. Niet “de fitste van de sportschool”. Gewoon: een
              lichaam dat meewerkt in het leven dat je wilt leven.
            </p>

            <figure className="mt-8 border-l-[3px] border-[#C9713F] py-0.5 pl-6">
              <blockquote className="font-serif text-[clamp(19px,2.4vw,24px)] italic leading-[1.32]">
                Weet je wat het fijnste is? Dat ik mijn kleinkind nog gewoon
                kan optillen. En dat ik mijn eigen boodschappen doe. Dat lijkt
                klein. Voor mij is het alles.
              </blockquote>
              <p className="mt-3 text-[13px] text-[#8A6A4E]">
                — jij, ergens rond je 75e — de versie die begon
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
