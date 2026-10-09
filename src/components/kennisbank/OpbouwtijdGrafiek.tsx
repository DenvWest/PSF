"use client";

import { useEffect, useRef, useState } from "react";

interface Rij {
  label: string;
  meting: string;
  waarde: string;
  balkKlasse: string;
  vervolgKlasse?: string;
}

const RIJEN: Rij[] = [
  {
    label: "Creatine, 20 g per dag",
    meting: "in de spier",
    waarde: "6 dagen",
    balkKlasse: "w-[33.8%]",
  },
  {
    label: "Creatine, 3 g per dag",
    meting: "in de spier",
    waarde: "28 dagen",
    balkKlasse: "w-[62.9%]",
  },
  {
    label: "EPA uit visolie",
    meting: "in bloedserum",
    waarde: "4 tot 8 weken",
    balkKlasse: "w-[62.9%]",
    vervolgKlasse: "w-[13.1%]",
  },
  {
    label: "EPA uit visolie",
    meting: "in rode bloedcellen",
    waarde: "± 180 dagen",
    balkKlasse: "w-[98%]",
  },
];

const TICKS = [
  { label: "1 dag", klasse: "left-0" },
  { label: "1 week", klasse: "left-[36.7%]" },
  { label: "1 mnd", klasse: "left-[64.2%]" },
  { label: "6 mnd", klasse: "left-[98%]" },
];

const SAMENVATTING =
  "Opbouwtijd tot een stabiel niveau: creatine in de spier 6 dagen bij 20 gram per dag en 28 dagen bij 3 gram per dag; EPA in bloedserum 4 tot 8 weken; EPA in rode bloedcellen ongeveer 180 dagen.";

export default function OpbouwtijdGrafiek() {
  const ref = useRef<HTMLElement>(null);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setZichtbaar(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setZichtbaar(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={ref}
      className="my-10 max-w-[72ch] rounded-xl border border-stone-200/80 bg-white px-5 py-7 md:px-8"
    >
      <figcaption className="font-display text-lg font-semibold leading-snug text-stone-900 md:text-xl">
        Hoe lang duurt het voor het niveau op peil is?
      </figcaption>
      <p className="mt-1 text-[0.8125rem] text-stone-500">
        Gemeten bij gezonde mannen · tijdas logaritmisch
      </p>
      <div role="img" aria-label={SAMENVATTING} className="mt-6 space-y-5">
        {RIJEN.map((rij) => (
          <div key={`${rij.label}-${rij.meting}`}>
            <p className="text-[0.9375rem] font-semibold text-stone-900">
              {rij.label}{" "}
              <span className="font-normal text-stone-500">{rij.meting}</span>
            </p>
            <div className="mt-1.5 flex h-7 overflow-hidden rounded-md bg-stone-100">
              <div
                className={`h-full bg-ps-green motion-safe:transition-[width] motion-safe:duration-1000 motion-safe:ease-out ${
                  zichtbaar ? rij.balkKlasse : "w-0"
                }`}
              />
              {rij.vervolgKlasse ? (
                <div
                  className={`h-full bg-ps-green/35 motion-safe:transition-[width] motion-safe:delay-1000 motion-safe:duration-700 motion-safe:ease-out ${
                    zichtbaar ? rij.vervolgKlasse : "w-0"
                  }`}
                />
              ) : null}
            </div>
            <p className="mt-1 text-[0.875rem] font-semibold text-stone-800">
              {rij.waarde}
            </p>
          </div>
        ))}
      </div>
      <div aria-hidden className="relative mt-4 h-5 border-t border-stone-200 text-[0.75rem] text-stone-500">
        {TICKS.map((tick) => (
          <span
            key={tick.label}
            className={`absolute top-1 -translate-x-1/2 first:translate-x-0 ${tick.klasse}`}
          >
            {tick.label}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[0.75rem] leading-relaxed text-stone-500">
        Bronnen: Hultman 1996 (J Appl Physiol), Katan 1997 (J Lipid Res). Gemiddelden uit kleine
        studies; jouw tempo kan afwijken.
      </p>
    </figure>
  );
}
