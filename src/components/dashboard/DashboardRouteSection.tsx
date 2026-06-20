import {
  DASHBOARD_ROUTE_DISCLAIMER,
  DASHBOARD_ROUTE_HERO,
  DASHBOARD_ROUTE_STEPS,
} from "@/data/dashboard-route";

export default function DashboardRouteSection() {
  return (
    <section aria-labelledby="route-beschrijving" className="mb-10">
      <header className="mb-6">
        <h2
          id="route-beschrijving"
          className="font-serif text-2xl text-stone-900 md:text-3xl"
        >
          {DASHBOARD_ROUTE_HERO.routeSectionTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-stone-600">
          {DASHBOARD_ROUTE_HERO.routeSectionSubtitle}
        </p>
      </header>

      <ol className="space-y-0">
        {DASHBOARD_ROUTE_STEPS.map((item, index) => (
          <li
            key={item.step}
            className={`relative flex gap-4 border-l border-stone-200 py-5 pl-6 ${
              index === DASHBOARD_ROUTE_STEPS.length - 1 ? "border-l-transparent" : ""
            }`}
          >
            <span
              aria-hidden
              className="absolute -left-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white font-serif text-sm font-semibold text-stone-900 shadow-sm"
            >
              {item.step}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold text-stone-900">
                  {item.title}
                </h3>
                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                  {item.timeLabel}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-600">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <aside className="mt-2 rounded-xl border border-amber-200/80 bg-amber-50 px-5 py-4">
        <p className="text-sm italic leading-relaxed text-stone-700">
          {DASHBOARD_ROUTE_DISCLAIMER}
        </p>
      </aside>
    </section>
  );
}
