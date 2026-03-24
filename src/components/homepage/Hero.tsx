import Link from "next/link";
import Container from "@/components/layout/Container";

const heroLinks = [
  {
    title: "Omega-3 vergelijken",
    description: "Dosering, prijs per dag en kwaliteit naast elkaar.",
    href: "/omega-3-vergelijken",
  },
  {
    title: "Beste omega-3 keuzes",
    description: "Overall, budget en premium aanbevelingen.",
    href: "/beste-omega-3-supplement",
  },
  {
    title: "Vitamine D uitleg",
    description: "Vormen, dosering en wat je moet weten.",
    href: "/supplementen",
  },
];

export default function Hero() {
  return (
    <section className="flex min-h-[calc(100svh-72px)] items-center bg-slate-50">
      <Container>
        <div className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-0">

          {/* Left column */}
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Onafhankelijke supplement gids · Omega-3 &amp; vitamine D
            </p>

            <h1 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem]">
              Begrijp omega-3 en vitamine D beter en maak slimmere keuzes
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
              Praktische analyses van dosering, kwaliteit, vormen en
              toepasbaarheid. Rustig opgebouwd, duidelijk uitgelegd.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/supplementen"
                className="inline-flex rounded-xl bg-green-700 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-green-800"
              >
                Bekijk supplementen
              </Link>

              <Link
                href="/methodologie"
                className="text-sm font-medium text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-800 hover:decoration-slate-400"
              >
                Bekijk methodologie
              </Link>
            </div>
          </div>

          {/* Right column — editorial card */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-7 py-5">
                <p className="text-sm font-medium text-slate-500">
                  Waar wil je mee beginnen?
                </p>
              </div>

              <div className="divide-y divide-slate-100">
                {heroLinks.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex items-start justify-between gap-4 px-7 py-5 transition hover:bg-slate-50"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 transition group-hover:text-green-700">
                        {item.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {item.description}
                      </p>
                    </div>

                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-green-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 10h12" />
                      <path d="M12 5l5 5-5 5" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
