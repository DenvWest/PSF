import Link from "next/link";
import Container from "@/components/layout/Container";
import { HOMEPAGE_THEMES } from "@/data/homepage";

export default function HomeThemeLinksSection() {
  return (
    <section
      className="border-b border-stone-200/60 bg-white px-6 py-12 lg:px-8"
      aria-labelledby="thema-gidsen-heading"
    >
      <Container>
        <h2
          id="thema-gidsen-heading"
          className="font-serif text-xl text-stone-900 sm:text-2xl"
        >
          Thema&apos;s na je 40e
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-600">
          Diepgaande gidsen per thema — van slaap en stress tot energie, herstel en testosteron.
        </p>
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {HOMEPAGE_THEMES.map((theme) => (
            <li key={theme.href} className="list-none">
              <Link
                href={theme.href}
                className="group flex h-full flex-col rounded-xl border border-stone-200 bg-stone-50/50 px-4 py-4 transition hover:border-ps-green/30 hover:bg-white"
              >
                <span className="text-lg" aria-hidden>
                  {theme.icon}
                </span>
                <span className="mt-2 text-sm font-semibold text-stone-900 group-hover:text-ps-green">
                  {theme.label}
                </span>
                <span className="mt-1 text-xs leading-snug text-stone-500">
                  {theme.description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
