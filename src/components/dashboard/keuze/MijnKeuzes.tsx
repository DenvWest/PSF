"use client";

import Link from "next/link";
import { useMemo } from "react";
import { kortGetal, STAND_KLEUR, STAND_KORT } from "@/components/dashboard/keuze/KeuzeVergelijken";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import { catalogEntry, type CatalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { buildDagboekVoegHref, gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import {
  metKeuzeHerkomst,
  momentKeuzeId,
  momentKeuzeIdsVoorStof,
  momentVoorStof,
  productKeuzeVoorStof,
} from "@/lib/keuze-product-keuze";
import { keuzeStofStand, type KeuzeStofStand } from "@/lib/keuze-stof-stand";
import { euroPerDag, isBronVan } from "@/lib/keuze-stofkaart";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { gehaltePerPortie } from "@/lib/nutrition-rijkste-bronnen";
import { resolveNutritionRouteChoice, type NutritionRouteChoice } from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import { keuzeProductVoorSlug, type KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";
import { useDagboekVoedingsfavorieten } from "@/lib/use-dagboek-voedingsfavorieten";
import { useEiwitDoel } from "@/lib/use-kernstof-normen";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";

/**
 * Keuze → Mijn keuzes (tot 7 oktober "Favorieten"): wat je per stof koos, op
 * één plek, in dezelfde volgorde als Vergelijken
 * (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, zesde ronde).
 *
 * Per stof met een keuze één kaart: de stand uit je dagboek, je gesterde
 * voedingsmiddelen die echt een bron van die stof zijn (＋ naar het dagboek),
 * en je gekozen supplement met dosis, prijs per dag, het moment waarop je het
 * neemt en de productpagina. Bovenaan wat het je per dag en per maand kost.
 *
 * Gratis, en bewust per stof. Wat over al je keuzes samen gaat — dubbelingen,
 * de bovengrens over alle bronnen, timing, een goedkopere combinatie — is
 * "Jouw stack" (premium, nog niet gebouwd).
 */

const SURFACE = "mijn_keuzes";

type StofKeuze = {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  route: NutritionRouteChoice | null;
  product: KeuzeProduct | null;
  moment: EetmomentId | null;
  bronnen: CatalogEntry[];
};

export default function MijnKeuzes({
  statuses,
  reeksen,
  products,
  onNaarVergelijken,
}: {
  statuses: readonly NutrientRouteStatus[];
  reeksen: readonly Vensterreeks[];
  products?: readonly KeuzeProduct[];
  onNaarVergelijken: (nutrient: NutrientId | null) => void;
}) {
  const { items } = useVoortgangFavorites();
  const eiwitDoelG = useEiwitDoel();
  const voedingsfavorieten = useDagboekVoedingsfavorieten(SURFACE);
  const gesterd = voedingsfavorieten.keys;

  const keuzes = useMemo((): StofKeuze[] => {
    const entries = gesterd.map((key) => catalogEntry(key)).filter((entry): entry is CatalogEntry => entry !== null);
    return statuses.map((status) => {
      const slug = productKeuzeVoorStof(status.nutrient, items);
      return {
        status,
        stand: keuzeStofStand(status.nutrient, reeksen.find((r) => r.nutrient === status.nutrient), eiwitDoelG),
        route: resolveNutritionRouteChoice(status.nutrient, items),
        product: slug ? keuzeProductVoorSlug(status.nutrient, slug, products) : null,
        moment: momentVoorStof(status.nutrient, items),
        bronnen: entries.filter((entry) => isBronVan(entry, status.nutrient)),
      };
    });
  }, [statuses, reeksen, eiwitDoelG, items, products, gesterd]);

  const gekozen = keuzes.filter((k) => k.route !== null || k.product !== null || k.bronnen.length > 0);
  const open = keuzes.filter((k) => !gekozen.includes(k));
  const supplementen = gekozen.filter((k) => k.product !== null);
  const centenPerDag = supplementen.reduce((som, k) => som + (k.product?.centenPerDag ?? 0), 0);

  return (
    <VoedingThemaProvider>
      <div className="vd-paneel">
        <header className="mb-3">
          <p className="vd-eyebrow m-0">Wat je per stof koos</p>
          <h2 className="mt-1 text-[1.375rem] text-[var(--vd-ink)]">Mijn keuzes</h2>
          {gekozen.length > 0 ? (
            <p className="m-0 mt-1.5 max-w-[60ch] text-[0.8125rem] leading-relaxed text-[var(--vd-ink-2)]">
              {gekozen.length} van {statuses.length} stoffen gekozen
              {supplementen.length > 0
                ? ` · ${supplementen.length} ${supplementen.length === 1 ? "supplement" : "supplementen"}`
                : ""}
              {centenPerDag > 0
                ? ` · ${euroPerDag(centenPerDag)} per dag (± ${euroPerDag(centenPerDag * 30)} per maand)`
                : ""}
            </p>
          ) : null}
        </header>

        {gekozen.length === 0 ? (
          <div className="rounded-[13px] border border-[var(--vd-line)] bg-[var(--vd-surface)] px-3.5 py-3.5">
            <p className="m-0 max-w-[60ch] text-[0.8125rem] leading-relaxed text-[var(--vd-ink-2)]">
              Je hebt nog niets gekozen. In Vergelijken zie je per stof je eten naast een supplement, en kies je je
              route.
            </p>
            <NaarVergelijkenKnop onClick={() => naar(null)} label="Naar Vergelijken →" />
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {gekozen.map((keuze) => (
              <StofKeuzeKaart key={keuze.status.nutrient} keuze={keuze} voedingsfavorieten={voedingsfavorieten} onWijzig={() => naar(keuze.status.nutrient)} />
            ))}
          </div>
        )}

        {gekozen.length > 0 && open.length > 0 ? (
          <p className="m-0 mt-3 text-[0.75rem] leading-relaxed text-[var(--vd-ink-3)]">
            Nog geen keuze: {open.map((k) => k.status.label.toLowerCase()).join(", ")}.{" "}
            <button
              type="button"
              onClick={() => naar(open[0]?.status.nutrient ?? null)}
              className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-[var(--vd-sage-2)] hover:underline"
            >
              Kies in Vergelijken →
            </button>
          </p>
        ) : null}
      </div>
    </VoedingThemaProvider>
  );

  function naar(nutrient: NutrientId | null) {
    trackEvent("mijn_keuzes_naar_vergelijken", { nutrient: nutrient ?? "geen" });
    onNaarVergelijken(nutrient);
  }
}

function NaarVergelijkenKnop({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 inline-flex min-h-[36px] cursor-pointer items-center rounded-[10px] border border-[var(--vd-sage)] bg-transparent px-3 text-[0.75rem] font-semibold text-[var(--vd-sage-2)]"
    >
      {label}
    </button>
  );
}

function StofKeuzeKaart({
  keuze,
  voedingsfavorieten,
  onWijzig,
}: {
  keuze: StofKeuze;
  voedingsfavorieten: ReturnType<typeof useDagboekVoedingsfavorieten>;
  onWijzig: () => void;
}) {
  const { status, stand, route, product, moment, bronnen } = keuze;
  const eten = route === "bord" || route === "beide" || bronnen.length > 0;

  return (
    <article className="overflow-hidden rounded-[13px] border border-[var(--vd-line)] bg-[var(--vd-surface)]">
      <div className="flex items-center gap-3 px-3.5 py-3">
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: STAND_KLEUR[stand.stand] }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.875rem] font-bold text-[var(--vd-ink)]">{status.label}</span>
          <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">
            {kortGetal(stand)}
            {stand.gemiddeld !== null ? ` · ${STAND_KORT[stand.stand]}` : ""}
          </span>
        </span>
        <button
          type="button"
          onClick={onWijzig}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[0.6875rem] font-semibold text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)] hover:underline"
        >
          Wijzig
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--vd-line)] px-3.5 pb-3.5 pt-3">
        {eten ? (
          <section aria-label="Uit je eten" className="border-l-[3px] border-[var(--vd-sage)] pl-2.5">
            <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--vd-sage)]">Uit je eten</p>
            {bronnen.length > 0 ? (
              <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
                {bronnen.map((entry) => {
                  const levert = gehaltePerPortie(entry, status.nutrient);
                  return (
                    <li key={entry.key} className="flex items-center justify-between gap-2 text-[0.78125rem]">
                      <span className="min-w-0">
                        <span className="text-[var(--vd-ink)]">{entry.labelNl}</span>
                        {levert ? (
                          <span className="text-[var(--vd-ink-3)]">
                            {" "}
                            · {entry.porties[0]?.labelNl} · {hoeveelheid(levert.value)} {levert.unit}
                          </span>
                        ) : null}
                      </span>
                      <span className="flex shrink-0 items-center gap-2.5">
                        <button
                          type="button"
                          aria-label={`${entry.labelNl} weghalen uit Mijn producten`}
                          disabled={voedingsfavorieten.bezig === entry.key}
                          onClick={() => void voedingsfavorieten.wissel(entry.key, status.nutrient)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[1rem] leading-none text-[var(--vd-sage-2)] disabled:opacity-50"
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          aria-label={`${entry.labelNl} in je dagboek zetten`}
                          onClick={() => {
                            trackEvent("keuze_bron_naar_dagboek", { nutrient: status.nutrient, moment: "ontbijt", surface: SURFACE });
                            gaNaarDashboard(buildDagboekVoegHref({ bron: "voeding", key: entry.key, moment: "ontbijt" }));
                          }}
                          className="cursor-pointer border-0 bg-transparent p-0 text-[1rem] font-semibold leading-none text-[var(--vd-sage-2)]"
                        >
                          ＋
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="m-0 mt-1 text-[0.75rem] leading-relaxed text-[var(--vd-ink-3)]">
                Je koos je eten, maar zette nog geen ☆ bij een bron.{" "}
                <button
                  type="button"
                  onClick={onWijzig}
                  className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-[var(--vd-sage-2)] hover:underline"
                >
                  Kies je bronnen →
                </button>
              </p>
            )}
          </section>
        ) : null}

        {product ? (
          <SupplementKeuze nutrient={status.nutrient} product={product} moment={moment} />
        ) : route === "potje" || route === "beide" ? (
          <section aria-label="Uit een supplement" className="border-l-[3px] border-[var(--vd-accent-2)] pl-2.5">
            <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--vd-accent-2)]">
              Uit een supplement
            </p>
            <p className="m-0 mt-1 text-[0.75rem] leading-relaxed text-[var(--vd-ink-3)]">
              Je koos een supplement, maar nog niet welk.{" "}
              <button
                type="button"
                onClick={onWijzig}
                className="cursor-pointer border-0 bg-transparent p-0 font-semibold text-[var(--vd-accent-2)] hover:underline"
              >
                Kies een product →
              </button>
            </p>
          </section>
        ) : null}
      </div>
    </article>
  );
}

function SupplementKeuze({
  nutrient,
  product,
  moment,
}: {
  nutrient: NutrientId;
  product: KeuzeProduct;
  moment: EetmomentId | null;
}) {
  const { items, save, remove } = useVoortgangFavorites();
  const etiket =
    product.dosisPerDag !== null && product.eenheid ? `${hoeveelheid(product.dosisPerDag)} ${product.eenheid} per dag` : null;
  const prijs = product.centenPerDag !== null ? `${euroPerDag(product.centenPerDag)} per dag` : null;

  const kiesMoment = (volgende: EetmomentId) => {
    const wissen = moment === volgende;
    for (const id of momentKeuzeIdsVoorStof(nutrient, items)) remove(id);
    if (!wissen) {
      save(
        {
          id: momentKeuzeId(nutrient, volgende),
          title: `${product.naam}: bij ${EETMOMENTEN.find((m) => m.id === volgende)?.label.toLowerCase() ?? volgende}`,
          kind: "supplement",
          domain: "voeding",
          source: "mijn_keuze",
        },
        SURFACE,
      );
    }
    trackEvent("mijn_keuzes_moment", { nutrient, moment: wissen ? "geen" : volgende });
    clarityTag("mijn_keuzes_moment", `${nutrient}_${wissen ? "geen" : volgende}`);
  };

  return (
    <section aria-label="Uit een supplement" className="border-l-[3px] border-[var(--vd-accent-2)] pl-2.5">
      <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--vd-accent-2)]">
        Uit een supplement
      </p>
      <p className="m-0 mt-1 text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{product.naam}</p>
      <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">
        {[product.vorm, etiket, prijs, `PS-Score ${product.score}`].filter(Boolean).join(" · ")}
      </p>

      <fieldset className="m-0 mt-2 border-0 p-0">
        <legend className="mb-1 p-0 text-[0.6875rem] text-[var(--vd-ink-3)]">Wanneer neem je het?</legend>
        <div className="flex flex-wrap gap-1.5">
          {EETMOMENTEN.map((optie) => (
            <button
              key={optie.id}
              type="button"
              aria-pressed={moment === optie.id}
              onClick={() => kiesMoment(optie.id)}
              className={`vd-chip ${moment === optie.id ? "!border-[var(--vd-accent-2)] !bg-[var(--vd-accent-2-fill)] !text-[var(--vd-accent-2)]" : ""}`}
            >
              {optie.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Link
        href={metKeuzeHerkomst(product.href, nutrient)}
        onClick={() =>
          trackEvent("keuze_vergelijken_ps_score_click", { surface: SURFACE, nutrient, doel: "productpagina", product: product.slug })
        }
        className="mt-2 inline-block text-[0.6875rem] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
      >
        Naar de productpagina →
      </Link>
    </section>
  );
}
