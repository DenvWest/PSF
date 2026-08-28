import Link from "next/link";
import { CATALOG } from "@/data/supplement-hub/catalog";

const THEMA_LINKS = [
  { label: "Slaap", href: "/gids/slaap" },
  { label: "Stress", href: "/gids/stress" },
  { label: "Energie", href: "/gids/energie" },
  { label: "Herstel", href: "/gids/herstel" },
];

export default function HubVerderLezen() {
  const gidsen = CATALOG.filter((entry) => !entry.comingSoon);

  return (
    <section
      aria-label="Verder lezen"
      className="rounded-2xl border border-stone-200 bg-white px-6 py-7 md:px-8 md:py-8"
    >
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="font-display text-lg font-semibold text-stone-900">
            Gidsen per supplement
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            Wat een stof doet, voor wie, en waar je op het etiket op let.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {gidsen.map((entry) => (
              <li key={entry.slug}>
                <Link
                  href={entry.guideHref}
                  className="text-sm font-medium text-ps-green transition-colors hover:text-ps-green-hover"
                >
                  {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold text-stone-900">
            Gratis themagidsen
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-stone-500">
            De leefstijlkant van slaap, stress, energie en herstel — vóór het
            potje.
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {THEMA_LINKS.map((thema) => (
              <li key={thema.href}>
                <Link
                  href={thema.href}
                  className="text-sm font-medium text-ps-green transition-colors hover:text-ps-green-hover"
                >
                  {thema.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-8 border-t border-stone-100 pt-5 text-xs leading-relaxed text-stone-500">
        Geen gesponsorde rangen en geen betaalde plaatsing: de PS-Score wordt
        berekend uit etiket- en labgegevens, prijs telt niet mee.{" "}
        <Link
          href="/ps-score"
          className="font-medium text-ps-green transition-colors hover:text-ps-green-hover"
        >
          Lees de methode →
        </Link>
      </p>
    </section>
  );
}
