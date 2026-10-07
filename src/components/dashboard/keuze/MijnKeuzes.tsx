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
  type MomentKant,
} from "@/lib/keuze-product-keuze";
import { keuzeStofStand, type KeuzeStofStand } from "@/lib/keuze-stof-stand";
import { euroPerDag, hoofdStof, isBronVan } from "@/lib/keuze-stofkaart";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { gehaltePerPortie, pastBijVoedingswijze, rijksteBronnen } from "@/lib/nutrition-rijkste-bronnen";
import { resolveNutritionRouteChoice, type NutritionRouteChoice } from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import { keuzeProductVoorSlug, type KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";
import { useDagboekVoedingsfavorieten } from "@/lib/use-dagboek-voedingsfavorieten";
import { useEiwitDoel, useKernstofProfiel } from "@/lib/use-kernstof-normen";
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
  /** Gesterde voedingsmiddelen die het meest aan déze stof bijdragen. */
  bronnen: CatalogEntry[];
  /** Gesterd, ook een bron van deze stof, maar met hun hoofdplek bij een andere stof. */
  ookVia: { entry: CatalogEntry; bij: string }[];
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
    const stoffen = statuses.map((status) => status.nutrient);
    const hoofd = new Map(entries.map((entry) => [entry.key, hoofdStof(entry, stoffen)]));
    const label = new Map(statuses.map((status) => [status.nutrient, status.label]));
    return statuses.map((status) => {
      const slug = productKeuzeVoorStof(status.nutrient, items);
      return {
        status,
        stand: keuzeStofStand(status.nutrient, reeksen.find((r) => r.nutrient === status.nutrient), eiwitDoelG),
        route: resolveNutritionRouteChoice(status.nutrient, items),
        product: slug ? keuzeProductVoorSlug(status.nutrient, slug, products) : null,
        bronnen: entries.filter((entry) => hoofd.get(entry.key) === status.nutrient),
        ookVia: entries
          .filter((entry) => hoofd.get(entry.key) !== status.nutrient && isBronVan(entry, status.nutrient))
          .map((entry) => ({ entry, bij: (label.get(hoofd.get(entry.key) ?? status.nutrient) ?? "").toLowerCase() })),
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
  const { status, stand } = keuze;

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

      {/* Eten en supplement naast elkaar, zoals in Vergelijken: vanaf een
          containerbreedte van 30rem twee kolommen, op een smalle telefoon
          onder elkaar — twee kolommen van 160 px dragen de productnaam,
          prijs en vier momentknoppen niet. */}
      <div className="@container border-t border-[var(--vd-line)] px-3.5 pb-3.5 pt-3">
        <div className="grid grid-cols-1 gap-2.5 @[30rem]:grid-cols-2">
          <EtenKant keuze={keuze} voedingsfavorieten={voedingsfavorieten} onWijzig={onWijzig} />
          <SupplementKant keuze={keuze} onWijzig={onWijzig} />
        </div>
      </div>
    </article>
  );
}

function Kant({
  kleur,
  titel,
  children,
}: {
  kleur: "sage" | "accent-2";
  titel: string;
  children: React.ReactNode;
}) {
  const accent = kleur === "sage" ? "var(--vd-sage)" : "var(--vd-accent-2)";
  return (
    <section
      aria-label={titel}
      className="flex flex-col rounded-[11px] border border-[var(--vd-line)] bg-[var(--vd-bg)] p-3"
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <p className="m-0 mb-1.5 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {titel}
      </p>
      <div className="flex flex-1 flex-col">{children}</div>
    </section>
  );
}

const MOMENT_ACTIEF: Record<MomentKant, string> = {
  eten: "!border-[var(--vd-sage)] !bg-[var(--vd-sage-fill)] !text-[var(--vd-sage-2)]",
  supplement: "!border-[var(--vd-accent-2)] !bg-[var(--vd-accent-2-fill)] !text-[var(--vd-accent-2)]",
};

/**
 * Eén moment per stof en per kant. Een tweede tik op hetzelfde moment wist
 * het. Dezelfde vier momenten als het dagboek.
 */
function MomentKiezer({
  nutrient,
  kant,
  vraag,
  titel,
}: {
  nutrient: NutrientId;
  kant: MomentKant;
  vraag: string;
  titel: string;
}) {
  const { items, save, remove } = useVoortgangFavorites();
  const moment = momentVoorStof(nutrient, items, kant);

  const kies = (volgende: EetmomentId) => {
    const wissen = moment === volgende;
    for (const id of momentKeuzeIdsVoorStof(nutrient, items, kant)) remove(id);
    if (!wissen) {
      save(
        {
          id: momentKeuzeId(nutrient, volgende, kant),
          title: `${titel}: bij ${EETMOMENTEN.find((m) => m.id === volgende)?.label.toLowerCase() ?? volgende}`,
          kind: kant === "eten" ? "activiteit" : "supplement",
          domain: "voeding",
          source: "mijn_keuze",
        },
        SURFACE,
      );
    }
    trackEvent("mijn_keuzes_moment", { nutrient, kant, moment: wissen ? "geen" : volgende });
    clarityTag("mijn_keuzes_moment", `${nutrient}_${kant}_${wissen ? "geen" : volgende}`);
  };

  return (
    <fieldset className="m-0 mt-2.5 border-0 p-0">
      <legend className="mb-1 p-0 text-[0.6875rem] text-[var(--vd-ink-3)]">{vraag}</legend>
      <div className="flex flex-wrap gap-1.5">
        {EETMOMENTEN.map((optie) => (
          <button
            key={optie.id}
            type="button"
            aria-pressed={moment === optie.id}
            onClick={() => kies(optie.id)}
            className={`vd-chip ${moment === optie.id ? MOMENT_ACTIEF[kant] : ""}`}
          >
            {optie.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function EtenKant({
  keuze,
  voedingsfavorieten,
  onWijzig,
}: {
  keuze: StofKeuze;
  voedingsfavorieten: ReturnType<typeof useDagboekVoedingsfavorieten>;
  onWijzig: () => void;
}) {
  const { status, route, bronnen, ookVia } = keuze;
  const { items } = useVoortgangFavorites();
  const profiel = useKernstofProfiel();
  const moment = momentVoorStof(status.nutrient, items, "eten") ?? "ontbijt";
  const gekozen = route === "bord" || route === "beide" || bronnen.length > 0;
  const voorstellen = useMemo(
    () =>
      bronnen.length > 0
        ? []
        : rijksteBronnen(status.nutrient, "portie", 30)
            .filter((bron) => pastBijVoedingswijze(bron.entry, profiel.voedingswijze))
            .filter((bron) => !voedingsfavorieten.isBewaard(bron.entry.key))
            .slice(0, 2),
    [bronnen.length, status.nutrient, profiel.voedingswijze, voedingsfavorieten],
  );

  return (
    <Kant kleur="sage" titel="Uit je eten">
      {!gekozen ? (
        <Leeg tekst="Geen eten gekozen." knop="Kies in Vergelijken →" kleur="sage" onClick={onWijzig} />
      ) : bronnen.length > 0 ? (
        <>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {bronnen.map((entry) => {
              const levert = gehaltePerPortie(entry, status.nutrient);
              return (
                <li key={entry.key} className="flex items-center justify-between gap-2 text-[0.78125rem]">
                  <span className="min-w-0">
                    <span className="text-[var(--vd-ink)]">{entry.labelNl}</span>
                    {levert ? (
                      <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">
                        {entry.porties[0]?.labelNl} · {hoeveelheid(levert.value)} {levert.unit}
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
                      aria-label={`${entry.labelNl} in je dagboek zetten bij ${moment}`}
                      onClick={() => {
                        trackEvent("keuze_bron_naar_dagboek", { nutrient: status.nutrient, moment, surface: SURFACE });
                        gaNaarDashboard(buildDagboekVoegHref({ bron: "voeding", key: entry.key, moment }));
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
          <MomentKiezer nutrient={status.nutrient} kant="eten" vraag="Wanneer eet je het?" titel={`${status.label} uit eten`} />
        </>
      ) : (
        <>
          <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">Kies een bron met ☆:</p>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
            {voorstellen.map((bron) => (
              <li key={bron.entry.key} className="flex items-center justify-between gap-2 text-[0.78125rem]">
                <span className="min-w-0">
                  <span className="text-[var(--vd-ink)]">{bron.entry.labelNl}</span>
                  <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">
                    {bron.portieLabel} · {hoeveelheid(bron.perPortie)} {bron.unit}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={`${bron.entry.labelNl} bewaren in Mijn producten`}
                  disabled={voedingsfavorieten.bezig === bron.entry.key}
                  onClick={() => void voedingsfavorieten.wissel(bron.entry.key, status.nutrient)}
                  className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[1rem] leading-none text-[var(--vd-sage-2)] disabled:opacity-50"
                >
                  ☆
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onWijzig}
            className="mt-1.5 cursor-pointer self-start border-0 bg-transparent p-0 text-[0.6875rem] font-semibold text-[var(--vd-sage-2)] hover:underline"
          >
            Meer bronnen in Vergelijken →
          </button>
        </>
      )}
      {gekozen && ookVia.length > 0 ? (
        <p className="m-0 mt-2 text-[0.6875rem] leading-relaxed text-[var(--vd-ink-3)]">
          Telt ook mee: {ookVia.map(({ entry, bij }) => `${entry.labelNl} (bij ${bij})`).join(", ")}
        </p>
      ) : null}
    </Kant>
  );
}

function SupplementKant({ keuze, onWijzig }: { keuze: StofKeuze; onWijzig: () => void }) {
  const { status, route, product } = keuze;
  const nutrient = status.nutrient;

  if (!product) {
    return (
      <Kant kleur="accent-2" titel="Uit een supplement">
        {route === "potje" || route === "beide" ? (
          <Leeg tekst="Je koos een supplement, maar nog niet welk." knop="Kies een product →" kleur="accent-2" onClick={onWijzig} />
        ) : (
          <Leeg tekst="Geen supplement gekozen." knop="Kies in Vergelijken →" kleur="accent-2" onClick={onWijzig} />
        )}
      </Kant>
    );
  }

  const etiket =
    product.dosisPerDag !== null && product.eenheid ? `${hoeveelheid(product.dosisPerDag)} ${product.eenheid} per dag` : null;

  return (
    <Kant kleur="accent-2" titel="Uit een supplement">
      <p className="m-0 text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{product.naam}</p>
      <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">
        {[product.vorm, etiket, `PS-Score ${product.score}`].filter(Boolean).join(" · ")}
      </p>
      {product.centenPerDag !== null ? (
        <p className="m-0 mt-1 text-[0.75rem] font-semibold text-[var(--vd-ink)]">
          {euroPerDag(product.centenPerDag)} per dag
        </p>
      ) : null}
      <MomentKiezer nutrient={nutrient} kant="supplement" vraag="Wanneer neem je het?" titel={product.naam} />
      <Link
        href={metKeuzeHerkomst(product.href, nutrient)}
        onClick={() =>
          trackEvent("keuze_vergelijken_ps_score_click", { surface: SURFACE, nutrient, doel: "productpagina", product: product.slug })
        }
        className="mt-2 inline-block text-[0.6875rem] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
      >
        Naar de productpagina →
      </Link>
    </Kant>
  );
}

function Leeg({
  tekst,
  knop,
  kleur,
  onClick,
}: {
  tekst: string;
  knop: string;
  kleur: "sage" | "accent-2";
  onClick: () => void;
}) {
  return (
    <p className="m-0 text-[0.75rem] leading-relaxed text-[var(--vd-ink-3)]">
      {tekst}{" "}
      <button
        type="button"
        onClick={onClick}
        className="cursor-pointer border-0 bg-transparent p-0 font-semibold hover:underline"
        style={{ color: kleur === "sage" ? "var(--vd-sage-2)" : "var(--vd-accent-2)" }}
      >
        {knop}
      </button>
    </p>
  );
}
