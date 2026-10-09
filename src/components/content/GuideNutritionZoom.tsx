import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import {
  GUIDE_NUTRITION_ZOOM,
  type GuideNutritionZoomKey,
} from "@/data/guide-nutrition-zoom";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";

type GuideNutritionZoomProps = {
  guide: GuideNutritionZoomKey;
};

const LADDER = [
  {
    step: "1",
    title: "Wat mis je?",
    meta: "3 minuten · gratis",
    body: "Een eerste inschatting uit hoe vaak je iets eet, per stof naast de richtlijn.",
  },
  {
    step: "2",
    title: "Een week bijhouden",
    meta: "gratis",
    body: "In je dagboek telt mee wat je echt at. Na 7 dagen zie je je eigen patroon per stof.",
  },
  {
    step: "3",
    title: "Je patroon over tijd",
    meta: "premium",
    body: "Over 30 tot 90 dagen: welke maaltijd welke stof draagt, en wat je kunt aanpassen.",
  },
] as const;

export default function GuideNutritionZoom({ guide }: GuideNutritionZoomProps) {
  const content = GUIDE_NUTRITION_ZOOM[guide];

  return (
    <section
      id="wat-mis-je"
      className="mt-14 scroll-mt-24"
      {...{ [INBODY_LEEFSTIJLCHECK_CTA_ATTR]: "" }}
    >
      <h2 className="font-serif text-3xl font-bold text-gray-900">{content.heading}</h2>
      <p className="mt-4 text-lg leading-relaxed text-gray-700">{content.intro}</p>

      <ul className="mt-5 flex flex-wrap gap-2">
        {content.factors.map((factor) => (
          <li
            key={factor}
            className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm text-gray-700"
          >
            {factor}
          </li>
        ))}
      </ul>

      <h3 className="mt-8 font-serif text-2xl font-bold text-gray-900">
        Vandaag: wat je meteen merkt
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {content.today.map((item) => (
          <article key={item.title} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.body}</p>
          </article>
        ))}
      </div>

      <h3 className="mt-8 font-serif text-2xl font-bold text-gray-900">
        Over weken: wat zich optelt
      </h3>
      <p className="mt-3 leading-relaxed text-gray-700">{content.weeks.body}</p>
      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Stoffen die zich over weken optellen">
        {content.weeks.nutrients.map((nutrient) => (
          <li
            key={nutrient}
            className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-900"
          >
            {nutrient}
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        Je weet het pas als je het ziet. Een dag zegt weinig; een week laat zien wat er is.
      </p>

      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-6 md:p-8">
        <h3 className="text-center font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          Wat mis je?
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-center leading-relaxed text-gray-600">
          {content.ctaLead} De gratis check laat in 3 minuten zien wat er op je bord ontbreekt, en
          pas daarna kijken we of een supplement past.
        </p>

        <ol className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-3">
          {LADDER.map((rung) => (
            <li key={rung.step} className="rounded-xl border border-green-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
                Stap {rung.step} · {rung.meta}
              </p>
              <p className="mt-1 font-semibold text-gray-900">{rung.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">{rung.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 text-center">
          <IntakeCtaLink
            locatie={`gids-${guide}-voeding-zoom`}
            className="inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
          >
            Zie wat jij mist — gratis →
          </IntakeCtaLink>
          <p className="mx-auto mt-3 max-w-lg text-sm text-gray-500">
            Een paar korte vragen · 3 minuten · gratis · geen medische test.
          </p>
        </div>
      </div>
    </section>
  );
}
