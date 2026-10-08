import { IntakeCtaLink } from "@/components/common/IntakeCtaLink";
import {
  GUIDE_NUTRITION_ZOOM,
  type GuideNutritionZoomKey,
} from "@/data/guide-nutrition-zoom";
import { INBODY_LEEFSTIJLCHECK_CTA_ATTR } from "@/lib/leefstijlcheck-inbody-cta";

type GuideNutritionZoomProps = {
  guide: GuideNutritionZoomKey;
};

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
        {content.nutritionTitle}
      </h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {content.nutrition.map((item) => (
          <article key={item.title} className="rounded-xl border border-stone-200 bg-stone-50 p-5">
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-700">{item.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <h3 className="font-serif text-2xl font-bold text-gray-900 md:text-3xl">
          Wat mis je?
        </h3>
        <p className="mx-auto mt-3 max-w-lg leading-relaxed text-gray-600">
          {content.ctaLead} De gratis check laat in 3 minuten zien waar je voeding tekortschiet, en
          pas daarna kijken we of een supplement past.
        </p>
        <p className="mx-auto mt-4 max-w-lg text-sm text-gray-500">
          Een paar korte vragen · 3 minuten · gratis · geen medische test.
        </p>
        <IntakeCtaLink
          locatie={`gids-${guide}-voeding-zoom`}
          className="mt-5 inline-block rounded-lg bg-green-700 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-800"
        >
          Zie wat jij mist — gratis →
        </IntakeCtaLink>
      </div>
    </section>
  );
}
