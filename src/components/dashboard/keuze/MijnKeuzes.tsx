"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { kortGetal, STAND_KLEUR, STAND_KORT } from "@/components/dashboard/keuze/KeuzeVergelijken";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { catalogEntry, type CatalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import { clarityTag } from "@/lib/clarity";
import { buildDagboekVoegHref, gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import {
  etenKeuzeId,
  etenKeuzesVoorStof,
  metKeuzeHerkomst,
  momentKeuzeId,
  parseEtenKeuze,
  momentKeuzeIdsVoorStof,
  momentVoorStof,
  productKeuzeIdsVoorStof,
  productKeuzeVoorStof,
  type MomentKant,
} from "@/lib/keuze-product-keuze";
import { dagboekProductVan } from "@/lib/keuze-dagboek-product";
import { keuzeStofStand, type KeuzeStofStand } from "@/lib/keuze-stof-stand";
import { euroPerDag, hoofdStof, isBronVan } from "@/lib/keuze-stofkaart";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import { gehaltePerPortie, pastBijVoedingswijze, rijksteBronnen } from "@/lib/nutrition-rijkste-bronnen";
import {
  NUTRITION_ROUTE_CHOICES,
  nutritionRouteChoiceId,
  resolveNutritionRouteChoice,
  routeChoiceFavoriteTitle,
  type NutritionRouteChoice,
} from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { hoeveelheid } from "@/lib/nutrition-tekortsysteem-copy";
import { keuzeProductVoorSlug, psScoreCatalogusHref, type KeuzeProduct } from "@/lib/supplement-hub/ps-score-per-stof";
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

type DagRij = {
  id: string;
  moment: EetmomentId;
  titel: string;
  sub: string;
  entry: CatalogEntry | null;
  product: KeuzeProduct | null;
  nutrient: NutrientId;
};

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
    const stoffen = statuses.map((status) => status.nutrient);
    const label = new Map(statuses.map((status) => [status.nutrient, status.label]));
    // Waar een voedingsmiddel staat: bij de stof(fen) waar je het in
    // Vergelijken koos; een oudere ster zonder stof bij de stof waar het het
    // meest aan bijdraagt (`hoofdStof`).
    const plek = new Map<string, NutrientId[]>();
    for (const stof of stoffen) {
      for (const key of etenKeuzesVoorStof(stof, items)) plek.set(key, [...(plek.get(key) ?? []), stof]);
    }
    for (const key of gesterd) {
      if (plek.has(key)) continue;
      const entry = catalogEntry(key);
      const stof = entry ? hoofdStof(entry, stoffen) : null;
      if (stof) plek.set(key, [stof]);
    }
    const entries = [...new Set([...plek.keys(), ...gesterd])]
      .map((key) => catalogEntry(key))
      .filter((entry): entry is CatalogEntry => entry !== null);
    return statuses.map((status) => {
      const slug = productKeuzeVoorStof(status.nutrient, items);
      return {
        status,
        stand: keuzeStofStand(status.nutrient, reeksen.find((r) => r.nutrient === status.nutrient), eiwitDoelG),
        route: resolveNutritionRouteChoice(status.nutrient, items),
        product: slug ? keuzeProductVoorSlug(status.nutrient, slug, products) : null,
        bronnen: entries.filter((entry) => plek.get(entry.key)?.includes(status.nutrient)),
        ookVia: entries
          .filter((entry) => {
            const stoffenVan = plek.get(entry.key);
            return stoffenVan && !stoffenVan.includes(status.nutrient) && isBronVan(entry, status.nutrient);
          })
          .map((entry) => ({ entry, bij: (label.get(plek.get(entry.key)?.[0] ?? status.nutrient) ?? "").toLowerCase() })),
      };
    });
  }, [statuses, reeksen, eiwitDoelG, items, products, gesterd]);

  const gekozen = keuzes.filter((k) => k.route !== null || k.product !== null || k.bronnen.length > 0);
  const open = keuzes.filter((k) => !gekozen.includes(k));
  const supplementen = gekozen.filter((k) => k.product !== null);
  const centenPerDag = supplementen.reduce((som, k) => som + (k.product?.centenPerDag ?? 0), 0);
  const dag = ((): DagRij[] => {
    const rijen: DagRij[] = [];
    const gezien = new Set<string>();
    for (const k of gekozen) {
      const nutrient = k.status.nutrient;
      const etenMoment = momentVoorStof(nutrient, items, "eten") ?? "ontbijt";
      for (const entry of k.bronnen) {
        if (gezien.has(entry.key)) continue;
        gezien.add(entry.key);
        const levert = gehaltePerPortie(entry, nutrient);
        rijen.push({
          id: `eten-${entry.key}`,
          moment: etenMoment,
          titel: entry.labelNl,
          sub: [entry.porties[0]?.labelNl, levert ? `${hoeveelheid(levert.value)} ${levert.unit} ${k.status.label.toLowerCase()}` : null]
            .filter(Boolean)
            .join(" · "),
          entry,
          product: null,
          nutrient,
        });
      }
      if (k.product) {
        const etiket =
          k.product.dosisPerDag !== null && k.product.eenheid ? `${hoeveelheid(k.product.dosisPerDag)} ${k.product.eenheid}` : null;
        rijen.push({
          id: `supplement-${k.product.slug}`,
          moment: momentVoorStof(nutrient, items, "supplement") ?? "ontbijt",
          titel: k.product.naam,
          sub: [etiket, k.product.centenPerDag !== null ? euroPerDag(k.product.centenPerDag) : null].filter(Boolean).join(" · "),
          entry: null,
          product: k.product,
          nutrient,
        });
      }
    }
    return rijen;
  })();

  return (
    <VoedingThemaProvider>
      <div className="vd-paneel">
        <header className="mb-3">
          <p className="vd-eyebrow m-0">Wat je per stof koos</p>
          <h2 className="mt-1 text-[1.375rem] text-[var(--vd-ink)]">Mijn keuzes</h2>
          {gekozen.length > 0 ? (
            <dl className="m-0 mt-3 grid grid-cols-3 gap-2">
              <Tegel label="Stoffen gekozen" waarde={`${gekozen.length} van ${statuses.length}`} />
              <Tegel label="Supplementen" waarde={String(supplementen.length)} />
              <Tegel
                label="Per dag"
                waarde={centenPerDag > 0 ? euroPerDag(centenPerDag) : "—"}
                sub={centenPerDag > 0 ? `± ${euroPerDag(centenPerDag * 30)} per maand` : undefined}
              />
            </dl>
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
          <>
            <JeDag rijen={dag} />
            <p className="vd-eyebrow m-0 mt-6">Per stof</p>
            <h3 className="mb-3 mt-1 text-[1.125rem] text-[var(--vd-ink)]">Wat het samen doet</h3>
            <div className="flex flex-col gap-2.5">
              {gekozen.map((keuze) => (
                <StofKeuzeKaart key={keuze.status.nutrient} keuze={keuze} voedingsfavorieten={voedingsfavorieten} onWijzig={() => naar(keuze.status.nutrient)} />
              ))}
            </div>
          </>
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

function Tegel({ label, waarde, sub }: { label: string; waarde: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-[12px] border border-[var(--vd-line)] bg-[var(--vd-surface)] px-3 py-2.5">
      <dt className="text-[0.6875rem] text-[var(--vd-ink-3)]">{label}</dt>
      <dd className="m-0 mt-0.5 font-mono text-[1.125rem] leading-tight tabular-nums text-[var(--vd-ink)]">{waarde}</dd>
      {sub ? <dd className="m-0 text-[0.65625rem] text-[var(--vd-ink-3)]">{sub}</dd> : null}
    </div>
  );
}

/**
 * Je keuzes over de dag: de vier momenten van het dagboek, met per moment wat
 * je koos. Het moment staat per stof en per kant onder "Beheer" in de stofkaart;
 * hier doe je het: met één tik naar het dagboek.
 */
function JeDag({ rijen }: { rijen: readonly DagRij[] }) {
  return (
    <section aria-label="Je dag" className="mt-5">
      <p className="vd-eyebrow m-0">Je dag</p>
      <h3 className="mb-3 mt-1 text-[1.125rem] text-[var(--vd-ink)]">Wanneer neem je wat?</h3>
      <div className="@container">
        <div className="grid grid-cols-1 items-start gap-2.5 @[34rem]:grid-cols-2">
          {EETMOMENTEN.map((moment) => {
            const hier = rijen.filter((rij) => rij.moment === moment.id);
            return (
              <section
                key={moment.id}
                aria-label={moment.label}
                className="flex min-w-0 flex-col gap-2 rounded-[14px] border border-[var(--vd-line)] bg-[var(--vd-surface)] p-3"
              >
                <h4 className="m-0 flex items-baseline justify-between text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--vd-ink-3)]">
                  {moment.label}
                  {hier.length > 0 ? (
                    <span className="text-[0.65625rem] font-normal normal-case tracking-normal text-[var(--vd-ink-4)]">
                      {hier.length} {hier.length === 1 ? "keuze" : "keuzes"}
                    </span>
                  ) : null}
                </h4>
                {hier.length === 0 ? (
                  <p className="m-0 flex min-h-[44px] items-center justify-center rounded-[11px] border border-dashed border-[var(--vd-line-2)] text-[0.75rem] text-[var(--vd-ink-3)]">
                    Nog niets gekozen
                  </p>
                ) : (
                  hier.map((rij) => <DagRegel key={rij.id} rij={rij} moment={moment.id} />)
                )}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function DagRegel({ rij, moment }: { rij: DagRij; moment: EetmomentId }) {
  const logbaar = rij.entry !== null || (rij.product !== null && dagboekProductVan(rij.product) !== null);
  return (
    <div className="flex items-center gap-2.5 border-t border-[var(--vd-line)] pt-2 first-of-type:border-t-0 first-of-type:pt-0">
      {rij.entry ? (
        <FoodThumbnail entry={rij.entry} size={48} />
      ) : rij.product?.imageSrc ? (
        <Image
          src={rij.product.imageSrc}
          alt={rij.product.imageAlt}
          width={96}
          height={96}
          loading="lazy"
          className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-0.5"
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{rij.titel}</span>
        <span className="block truncate text-[0.6875rem] text-[var(--vd-ink-3)]">
          {logbaar ? rij.sub : `${rij.sub} · loggen kan nog niet`}
        </span>
      </span>
      {logbaar ? (
        <button
          type="button"
          aria-label={`${rij.titel} in je dagboek zetten bij ${moment}`}
          onClick={() => {
            trackEvent("keuze_bron_naar_dagboek", {
              nutrient: rij.nutrient,
              moment,
              surface: SURFACE,
              ...(rij.product ? { kant: "supplement" } : {}),
            });
            gaNaarDashboard(
              buildDagboekVoegHref(
                rij.entry
                  ? { bron: "voeding", key: rij.entry.key, moment }
                  : { bron: "product", key: rij.product?.slug ?? "", moment },
              ),
            );
          }}
          className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center rounded-[12px] border bg-transparent px-3 text-[0.75rem] font-semibold text-[var(--vd-ink)] hover:border-[var(--vd-ink-3)] ${
            rij.entry ? "border-[var(--vd-sage)]" : "border-[var(--vd-accent-2)]"
          }`}
        >
          ＋ Dagboek
        </button>
      ) : null}
    </div>
  );
}

/** De stand van één stof als balk: je eten, je supplement erbij, en je norm. */
function StofBalk({ stand, product }: { stand: KeuzeStofStand; product: KeuzeProduct | null }) {
  const eten = stand.gemiddeld;
  const norm = stand.norm;
  if (eten === null || norm === null || norm <= 0) return null;
  const erbij = product && product.dosisPerDag !== null && product.eenheid === stand.unit ? product.dosisPerDag : 0;
  const schaal = Math.max(norm * 1.3, (eten + erbij) * 1.05);
  const pct = (waarde: number) => `${Math.min(100, (waarde / schaal) * 100)}%`;
  return (
    <div className="px-3.5 pb-3">
      <div
        role="img"
        aria-label={`Minstens ${hoeveelheid(eten + erbij)} van ${hoeveelheid(norm)} ${stand.unit}`}
        className="relative h-2.5 rounded-full bg-[var(--vd-track)]"
      >
        <div className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--vd-sage)]" style={{ width: pct(eten) }} />
        {erbij > 0 ? (
          <div className="absolute inset-y-0 rounded-r-full bg-[var(--vd-accent-2)]" style={{ left: pct(eten), width: pct(erbij) }} />
        ) : null}
        <div className="absolute -bottom-1 -top-1 w-0.5 rounded bg-[var(--vd-ink)]" style={{ left: pct(norm) }} />
      </div>
      <p className="m-0 mt-1.5 text-[0.71875rem] text-[var(--vd-ink-2)]">
        Minstens {stand.benaderd ? "≈ " : ""}
        <b className="font-semibold text-[var(--vd-ink)]">
          {hoeveelheid(eten + erbij)} van {hoeveelheid(norm)} {stand.unit}
        </b>
        {erbij > 0 ? ", met je supplement" : ""}
      </p>
      <p className="m-0 text-[0.65625rem] text-[var(--vd-ink-3)]">
        Per dag: je eten gemiddeld over de laatste {stand.venster?.dagen_terug ?? 7} dagen{erbij > 0 ? " + het etiket van je supplement" : ""}.
      </p>
    </div>
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

      <StofBalk stand={stand} product={keuze.product} />

      {/* Beheer per stof: het moment, weghalen en de productpagina. Eten en
          supplement naast elkaar, zoals in Vergelijken: vanaf een
          containerbreedte van 30rem twee kolommen, op een smalle telefoon
          onder elkaar — twee kolommen van 160 px dragen de productnaam,
          prijs en vier momentknoppen niet. */}
      <details className="border-t border-[var(--vd-line)]">
        <summary className="flex min-h-[44px] cursor-pointer items-center px-3.5 text-[0.75rem] font-semibold text-[var(--vd-ink-2)]">
          Beheer: moment kiezen, weghalen, productpagina
        </summary>
        <div className="@container px-3.5 pb-3.5 pt-1">
          <div className="grid grid-cols-1 items-start gap-2.5 @[30rem]:grid-cols-2">
            <EtenKant keuze={keuze} voedingsfavorieten={voedingsfavorieten} onWijzig={onWijzig} />
            <SupplementKant keuze={keuze} onWijzig={onWijzig} />
          </div>
        </div>
      </details>
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
  const { items, save, remove } = useVoortgangFavorites();

  const kiesHier = (key: string, naam: string) => {
    save(
      { id: etenKeuzeId(status.nutrient, key), title: `${status.label}: ${naam}`, kind: "activiteit", domain: "voeding", source: "mijn_keuze" },
      SURFACE,
    );
    if (!voedingsfavorieten.isBewaard(key)) void voedingsfavorieten.wissel(key, status.nutrient);
    trackEvent("keuze_eten_gekozen", { nutrient: status.nutrient, product: key, actie: "gekozen", via: "mijn_keuzes" });
  };

  /** Weg uit Mijn keuzes bij deze stof; de dagboekster alleen als hij bij geen andere stof gekozen is. */
  const haalWeg = (key: string) => {
    remove(etenKeuzeId(status.nutrient, key));
    const elders = items.some((item) => {
      const keuze = parseEtenKeuze(item.id);
      return keuze?.key === key && keuze.nutrient !== status.nutrient;
    });
    if (!elders && voedingsfavorieten.isBewaard(key)) void voedingsfavorieten.wissel(key, status.nutrient);
    trackEvent("keuze_eten_gekozen", { nutrient: status.nutrient, product: key, actie: "gewist", via: "mijn_keuzes" });
  };
  const profiel = useKernstofProfiel();
  const gekozen = route === "bord" || route === "beide" || bronnen.length > 0;
  const voorstellen = useMemo(
    () =>
      bronnen.length > 0
        ? []
        : rijksteBronnen(status.nutrient, "portie", 30)
            .filter((bron) => pastBijVoedingswijze(bron.entry, profiel.voedingswijze))
            .filter((bron) => !etenKeuzesVoorStof(status.nutrient, items).includes(bron.entry.key))
            .slice(0, 2),
    [bronnen.length, status.nutrient, profiel.voedingswijze, items],
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
                      aria-label={`${entry.labelNl} weghalen uit Mijn keuzes`}
                      disabled={voedingsfavorieten.bezig === entry.key}
                      onClick={() => haalWeg(entry.key)}
                      className="inline-flex min-h-[44px] cursor-pointer items-center rounded-[12px] border border-[var(--vd-line-2)] bg-transparent px-3 text-[0.75rem] font-semibold text-[var(--vd-ink-2)] hover:border-[var(--vd-amber)] hover:text-[var(--vd-ink)] disabled:opacity-50"
                    >
                      Haal weg
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
                  onClick={() => kiesHier(bron.entry.key, bron.entry.labelNl)}
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
  const { status, route, product, stand } = keuze;
  const nutrient = status.nutrient;
  const { items, save, remove } = useVoortgangFavorites();

  /**
   * Het supplement uit Mijn keuzes: het product, zijn moment en de
   * supplementroute. Koos je ook eten, dan blijft de route "bord" staan —
   * dezelfde uitkomst als "Zet supplement uit" in Vergelijken.
   */
  const haalWeg = () => {
    for (const id of productKeuzeIdsVoorStof(nutrient, items)) remove(id);
    for (const id of momentKeuzeIdsVoorStof(nutrient, items, "supplement")) remove(id);
    const volgende: NutritionRouteChoice | null = route === "beide" ? "bord" : null;
    for (const optie of NUTRITION_ROUTE_CHOICES) {
      if (optie !== volgende) remove(nutritionRouteChoiceId(nutrient, optie));
    }
    if (volgende) {
      save(
        {
          id: nutritionRouteChoiceId(nutrient, volgende),
          title: routeChoiceFavoriteTitle(nutrient, volgende),
          kind: "activiteit",
          domain: "voeding",
          source: "mijn_keuze",
        },
        SURFACE,
      );
    }
    trackEvent("keuze_product_gekozen", {
      surface: SURFACE,
      nutrient,
      product: product?.slug ?? "",
      actie: "gewist",
      stand: stand.stand,
    });
    clarityTag("keuze_product", `${nutrient}_gewist`);
  };

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
      <div className="flex items-center gap-2.5">
        {product.imageSrc ? (
          <Image
            src={product.imageSrc}
            alt={product.imageAlt}
            width={112}
            height={112}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-md bg-white object-contain p-0.5"
          />
        ) : null}
        <div className="min-w-0">
          <p className="m-0 text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{product.naam}</p>
          <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">
            {[product.vorm, etiket, `PS-Score ${product.score}`].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>
      {product.centenPerDag !== null ? (
        <p className="m-0 mt-1 text-[0.75rem] font-semibold text-[var(--vd-ink)]">
          {euroPerDag(product.centenPerDag)} per dag
        </p>
      ) : null}
      <MomentKiezer nutrient={nutrient} kant="supplement" vraag="Wanneer neem je het?" titel={product.naam} />
      <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          href={metKeuzeHerkomst(product.href, nutrient, "favorieten")}
          onClick={() =>
            trackEvent("keuze_vergelijken_ps_score_click", { surface: SURFACE, nutrient, doel: "productpagina", product: product.slug })
          }
          className="text-[0.6875rem] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
        >
          Naar de productpagina →
        </Link>
        <Link
          href={metKeuzeHerkomst(psScoreCatalogusHref(nutrient), nutrient, "favorieten")}
          onClick={() => trackEvent("keuze_vergelijken_ps_score_click", { surface: SURFACE, nutrient, doel: "catalogus" })}
          className="text-[0.6875rem] font-semibold text-[var(--vd-ink-2)] no-underline hover:underline"
        >
          Vergelijk met andere →
        </Link>
      </span>
      <button
        type="button"
        onClick={haalWeg}
        className="mt-3 inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[12px] border border-[var(--vd-line-2)] bg-transparent px-3 text-[0.75rem] font-semibold text-[var(--vd-ink-2)] hover:border-[var(--vd-amber)] hover:text-[var(--vd-ink)]"
      >
        Haal uit Mijn keuzes
      </button>
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
