import Container from "@/components/layout/Container";
import HomeCheckCta from "@/components/homepage/HomeCheckCta";
import { IntakeCtaMicro } from "@/components/common/IntakeCtaMicro";
import { HOMEPAGE_CLOSING } from "@/data/homepage";

export default function HomeClosingCta() {
  const { title, body } = HOMEPAGE_CLOSING;

  return (
    <section
      className="border-t border-stone-200/60 bg-[#F7F5F0] px-6 py-16 lg:px-8 lg:py-20"
      aria-labelledby="afsluiting-heading"
    >
      <Container>
        <div className="mx-auto max-w-2xl">
          <h2
            id="afsluiting-heading"
            className="font-serif text-2xl leading-tight text-stone-900 sm:text-3xl"
          >
            {title}
          </h2>
          <p className="home-lead mt-4 text-stone-600">{body}</p>
          <div className="mt-8">
            <HomeCheckCta location="homepage_closing" className="w-full sm:w-auto" />
            <IntakeCtaMicro className="mt-3 text-xs text-stone-500" />
          </div>
        </div>
      </Container>
    </section>
  );
}
