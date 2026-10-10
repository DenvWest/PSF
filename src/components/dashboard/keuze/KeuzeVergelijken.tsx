"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Icons from "@/components/app/icons";
import MomentChips, { useMomentOpslag } from "@/components/dashboard/keuze/MomentChips";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import FoodThumbnail from "@/components/dashboard/voortgang/FoodThumbnail";
import { catalogEntry, searchCatalog, type CatalogEntry } from "@/data/nutrition/food-catalog";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IngredientClaimKey } from "@/data/approved-claims";
import type { Voedingswijze } from "@/lib/account-kernstof-profiel";
import { clarityTag } from "@/lib/clarity";
import { gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import {
  brengtOokMee,
  checkOordeelVoorStof,
  euroPerDag,
  ingredientVanStof,
  supplementErbij,
} from "@/lib/keuze-stofkaart";
import {
  etenKeuzeId,
  etenKeuzesVoorStof,
  etenMomentVoor,
  itemMomentIdsVoor,
  metKeuzeHerkomst,
  momentVoorStof,
  parseEtenKeuze,
  productKeuzeId,
  productKeuzeIdsVoorStof,
  productKeuzeTitel,
  productKeuzeVoorStof,
} from "@/lib/keuze-product-keuze";
import { keuzeStofStand, type KeuzeStand, type KeuzeStofStand } from "@/lib/keuze-stof-stand";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { verschuifDag } from "@/lib/nutrition-periode";
import { gehaltePerPortie, pastBijVoedingswijze, rijksteBronnen } from "@/lib/nutrition-rijkste-bronnen";
import {
  NUTRITION_ROUTE_CHOICES,
  routeMatchesQuery,
  nutritionRouteChoiceId,
  resolveNutritionRouteChoice,
  routeChoiceConfirmation,
  routeChoiceFavoriteTitle,
  type NutritionRouteChoice,
} from "@/lib/nutrition-route-choice";
import type { NutrientRouteStatus } from "@/lib/nutrition-route-status";
import { bronnenVanStof, ruimteBij, stofPerMoment } from "@/lib/nutrition-stof-bronnen";
import type { Vensterreeks } from "@/lib/nutrition-tekortsysteem";
import { hoeveelheid, percentageADH } from "@/lib/nutrition-tekortsysteem-copy";
import { buildAfleiding } from "@/lib/supplement-afleiding";
import {
  psScoreAantalVoorStof,
  psScoreBestePerVorm,
  keuzeProductVoorSlug,
  zoekKeuzeProducten,
  type KeuzeProduct,
} from "@/lib/supplement-hub/ps-score-per-stof";
import { toVerdictCardCopy } from "@/lib/supplement-verdict-copy";
import {
  useDagboekVoedingsfavorieten,
  type DagboekVoedingsfavorieten,
} from "@/lib/use-dagboek-voedingsfavorieten";
import { useEiwitDoel, useKernstofProfiel } from "@/lib/use-kernstof-normen";
import { omgekeerdWisPlan, planAllesWeg, planEtenWeg, planSupplementWeg, type WisPlan } from "@/lib/keuze-overzicht-wissen";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * Keuze → Vergelijken: één stof tegelijk, je eten naast een supplement, gevoed
 * door je dagboek (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, ronde 12, variant B).
 *
 * ## Opbouw
 *
 * Een stofkeuze (chips) bepaalt het werkblad. Bovenaan de hero: je stand uit
 * het dagboek en één balk, eten + supplement tegenover je norm, zodat de
 * keuze zichtbaar effect heeft vóór je klikt. Daaronder twee kolommen in de
 * dezelfde twee accenten als de dekkingscirkels van het dagboek (sage = eten,
 * blauw = supplement): per kolom de beste keuze groot, de rest als compacte
 * rijen. Rechts (brede inhoud) een zijkolom met al je keuzes; daaronder een
 * uitklapbare lade.
 *
 * ## Geen slot, wel nadruk
 *
 * De laag-6-poort uit de check-ladder is vervangen door wat je dagboek laat
 * zien ({@link keuzeStofStand}). Haalt je eten de norm, dan blijft de
 * supplementkant rustig en ingeklapt; laat je dagboek ruimte zien, dan staat hij
 * open. Kiezen kan altijd.
 *
 * ## Eén kaart per stof
 *
 * Het oordeel uit je check staat erin als context; het dagboek weegt zwaarder
 * (herziening 7 okt). Aan de supplementkant per product wat het etiket per dag
 * levert, waar je daarmee op uitkomt (minstens: dagboek + etiket), de veilige
 * bovengrens en de prijs per dag. Geen affiliate-link in het dashboard: de
 * koopknop staat op de productpagina.
 */

export const STAND_KLEUR: Record<KeuzeStand, string> = {
  op_koers: "var(--vd-sage)",
  ruimte: "var(--vd-amber)",
  niet_meetbaar: "var(--vd-ink-4)",
  onbekend: "var(--vd-ink-4)",
  geen_doel: "var(--vd-ink-4)",
};

export const STAND_KORT: Record<KeuzeStand, string> = {
  op_koers: "op je norm",
  ruimte: "ruimte",
  niet_meetbaar: "niet te meten",
  onbekend: "te weinig dagen",
  geen_doel: "geen eiwitdoel",
};

export function kortGetal(stand: KeuzeStofStand): string {
  if (stand.gemiddeld === null) return STAND_KORT[stand.stand];
  const norm = stand.norm ? ` / ${hoeveelheid(stand.norm)}` : "";
  return `${stand.benaderd ? "≈ " : ""}${hoeveelheid(stand.gemiddeld)}${norm} ${stand.unit}`;
}

function heeftVoeding(keuze: NutritionRouteChoice | null): boolean {
  return keuze === "bord" || keuze === "beide";
}

function heeftSupplement(keuze: NutritionRouteChoice | null): boolean {
  return keuze === "potje" || keuze === "beide";
}

function samen(voeding: boolean, supplement: boolean): NutritionRouteChoice | null {
  if (voeding && supplement) return "beide";
  if (voeding) return "bord";
  if (supplement) return "potje";
  return null;
}

export default function KeuzeVergelijken({
  statuses,
  reeksen,
  dagen,
  vandaag,
  surface,
  verdicts,
  products,
  onNaarMijnKeuzes,
}: {
  statuses: readonly NutrientRouteStatus[];
  reeksen: readonly Vensterreeks[];
  dagen: readonly DagboekDag[];
  vandaag: string;
  surface: string;
  verdicts: readonly StoredSupplementVerdict[];
  products?: readonly KeuzeProduct[];
  /** Naar het tabblad Mijn keuzes; zonder deze prop staat de link er niet. */
  onNaarMijnKeuzes?: () => void;
}) {
  const eiwitDoelG = useEiwitDoel();
  const standen = useMemo(
    () =>
      new Map(
        statuses.map((status) => [
          status.nutrient,
          keuzeStofStand(status.nutrient, reeksen.find((r) => r.nutrient === status.nutrient), eiwitDoelG),
        ]),
      ),
    [statuses, reeksen, eiwitDoelG],
  );

  const eersteMetRuimte = statuses.find((s) => standen.get(s.nutrient)?.stand === "ruimte")?.nutrient ?? null;
  const [gekozenStof, setGekozenStof] = useState<NutrientId | null>(eersteMetRuimte ?? statuses[0]?.nutrient ?? null);
  const [zoek, setZoek] = useState("");
  const voedingsfavorieten = useDagboekVoedingsfavorieten("keuze_stof");
  const overzicht = useKeuzesOverzicht(statuses, products);
  const beheer = useKeuzesBeheer(surface);

  // Terug van een productpagina (`?tab=keuze&stof=…`): die stof open, daarna de
  // parameter uit de URL zodat herladen niet opnieuw springt.
  useEffect(() => {
    const url = new URL(window.location.href);
    const stof = url.searchParams.get("stof");
    const gevonden = statuses.find((status) => status.nutrient === stof);
    if (!gevonden) return;
    url.searchParams.delete("stof");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    requestAnimationFrame(() => {
      setGekozenStof(gevonden.nutrient);
      requestAnimationFrame(() => document.getElementById("keuze-werkblad")?.scrollIntoView?.({ block: "start" }));
    });
    // Alleen bij binnenkomst.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const telling = useMemo(() => {
    const t: Record<KeuzeStand, number> = { op_koers: 0, ruimte: 0, niet_meetbaar: 0, onbekend: 0, geen_doel: 0 };
    for (const stand of standen.values()) t[stand.stand] += 1;
    return t;
  }, [standen]);
  const meetbaar = telling.op_koers + telling.ruimte;
  const metRuimte = statuses.filter((s) => standen.get(s.nutrient)?.stand === "ruimte").map((s) => s.label.toLowerCase());

  const datums = useMemo(
    () => Array.from({ length: 7 }, (_, i) => verschuifDag(vandaag, -i)),
    [vandaag],
  );

  const zoekterm = zoek.trim();
  const getoond = zoekterm ? statuses.filter((s) => routeMatchesQuery(s, zoekterm)) : statuses;
  const actief = getoond.find((s) => s.nutrient === gekozenStof) ?? getoond[0] ?? null;
  const actiefStand = actief ? standen.get(actief.nutrient) : undefined;

  const kiesStof = (nutrient: NutrientId) => {
    setGekozenStof(nutrient);
    trackEvent("keuze_stof_geopend", { surface, nutrient, stand: standen.get(nutrient)?.stand ?? "onbekend" });
    clarityTag("keuze_stof", nutrient);
  };

  return (
    <VoedingThemaProvider>
      <div className="vd-paneel">
        <div className="@container">
          <p className="m-0 mb-2.5 max-w-[62ch] text-[0.75rem] leading-relaxed text-[var(--vd-ink-3)]">
            {meetbaar > 0
              ? `${telling.op_koers} van ${meetbaar} meetbare kernstoffen op je norm${
                  metRuimte.length > 0 ? ` · ${metRuimte.join(" en ")} ${metRuimte.length === 1 ? "heeft" : "hebben"} ruimte` : ""
                }.`
              : "Vul een paar dagen je dagboek in, dan zie je hier per stof waar je staat."}
          </p>

          <div className="relative mb-2.5">
            <span aria-hidden className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--vd-ink-3)]">
              <Icons.Search s={13} />
            </span>
            <input
              type="search"
              value={zoek}
              onChange={(event) => setZoek(event.target.value)}
              onBlur={() => {
                if (zoekterm) trackEvent("nutrition_logboek_search", { surface, results: getoond.length });
              }}
              placeholder="Zoek een stof of voedingsmiddel — bijvoorbeeld haring"
              aria-label="Zoek een stof of voedingsmiddel"
              className="min-h-[40px] w-full rounded-[10px] border border-[var(--vd-line)] bg-[var(--vd-bg)] pl-8 pr-2.5 text-[0.8125rem] text-[var(--vd-ink)] placeholder:text-[var(--vd-ink-4)] focus:border-[var(--vd-sage)] focus:outline-none"
            />
          </div>

          {zoekterm && getoond.length === 0 ? (
            <p className="vd-note mt-0">Niets gevonden voor &ldquo;{zoekterm}&rdquo;.</p>
          ) : null}

          <nav aria-label="Kies een stof" className="mb-3.5 flex flex-wrap gap-1.5">
            {getoond.map((status) => {
              const stand = standen.get(status.nutrient);
              const aan = actief?.nutrient === status.nutrient;
              return (
                <button
                  key={status.nutrient}
                  type="button"
                  aria-pressed={aan}
                  onClick={() => kiesStof(status.nutrient)}
                  className={`vd-chip inline-flex min-h-[40px] items-center gap-1.5 ${aan ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`}
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: stand ? STAND_KLEUR[stand.stand] : "var(--vd-ink-4)" }}
                  />
                  {status.label}
                </button>
              );
            })}
          </nav>

          <div className="grid gap-4 @[56rem]:grid-cols-[minmax(0,1fr)_18.5rem] @[56rem]:items-start">
            <div id="keuze-werkblad" className="min-w-0 scroll-mt-20">
              {actief && actiefStand ? (
                <StofWerkblad
                  key={actief.nutrient}
                  status={actief}
                  stand={actiefStand}
                  dagen={dagen}
                  datums={datums}
                  surface={surface}
                  verdict={checkOordeelVoorStof(actief.nutrient, verdicts)}
                  products={products}
                  voedingsfavorieten={voedingsfavorieten}
                  onNaarMijnKeuzes={onNaarMijnKeuzes}
                />
              ) : null}
            </div>
            <KeuzesZijkolom
              overzicht={overzicht}
              surface={surface}
              onNaarMijnKeuzes={onNaarMijnKeuzes}
              beheer={beheer}
            />
          </div>

          <KeuzesLade overzicht={overzicht} surface={surface} onNaarMijnKeuzes={onNaarMijnKeuzes} beheer={beheer} />
        </div>

        <p className="vd-note">
          Wat je dagboek laat zien is minstens wat je binnenkreeg. Onder je norm zitten is geen tekort — dat
          stelt alleen een arts vast. De PS-Score beoordeelt het product, niet jouw voeding. Via de
          productpagina&apos;s ontvangen we commissie als je koopt; de score en dit overzicht staan daar los van.
        </p>
      </div>
    </VoedingThemaProvider>
  );
}

type KeuzeRij = {
  id: string;
  nutrient: NutrientId;
  /** Catalogussleutel van het voedingsmiddel; `null` bij een supplement. */
  key: string | null;
  soort: "eten" | "supplement";
  titel: string;
  context: string;
  entry: CatalogEntry | null;
  product: KeuzeProduct | null;
  centenPerDag: number | null;
};

type KeuzesOverzicht = { rijen: KeuzeRij[]; centenPerDag: number };

type KeuzesBeheer = {
  wisRij: (rij: KeuzeRij, plek: "zijkolom" | "lade") => void;
  wisAlles: (plek: "zijkolom" | "lade") => void;
  /** Wat net gewist is; staat een paar seconden klaar om terug te zetten. */
  laatste: { tekst: string } | null;
  maakOngedaan: () => void;
};

/**
 * Keuzes weghalen vanuit de zijkolom en de lade, met "Ongedaan maken". Wist
 * alleen je keuzes; de sterren in je dagboek blijven staan.
 */
function useKeuzesBeheer(surface: string): KeuzesBeheer {
  const { items, save, remove } = useVoortgangFavorites();
  const [laatste, setLaatste] = useState<{ plan: WisPlan; tekst: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const toepas = useCallback(
    (plan: WisPlan) => {
      for (const item of plan.verwijder) remove(item.id);
      for (const item of plan.voegToe) save(item, "keuze_overzicht");
    },
    [remove, save],
  );

  const meld = useCallback((plan: WisPlan, tekst: string) => {
    setLaatste({ plan, tekst });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setLaatste(null), 8000);
  }, []);

  const wisRij = useCallback(
    (rij: KeuzeRij, plek: "zijkolom" | "lade") => {
      const plan = rij.key ? planEtenWeg(rij.nutrient, rij.key, items) : planSupplementWeg(rij.nutrient, items);
      toepas(plan);
      meld(plan, `${rij.titel} weggehaald.`);
      trackEvent("keuze_overzicht_wis", { surface, plek, soort: rij.soort, nutrient: rij.nutrient });
    },
    [items, toepas, meld, surface],
  );

  const wisAlles = useCallback(
    (plek: "zijkolom" | "lade") => {
      const plan = planAllesWeg(items);
      if (plan.verwijder.length === 0) return;
      toepas(plan);
      meld(plan, "Al je keuzes weggehaald.");
      trackEvent("keuze_overzicht_wis", { surface, plek, soort: "alles", aantal: plan.verwijder.length });
    },
    [items, toepas, meld, surface],
  );

  const maakOngedaan = useCallback(() => {
    if (!laatste) return;
    toepas(omgekeerdWisPlan(laatste.plan));
    trackEvent("keuze_overzicht_ongedaan", { surface });
    if (timer.current) clearTimeout(timer.current);
    setLaatste(null);
  }, [laatste, toepas, surface]);

  return { wisRij, wisAlles, laatste: laatste ? { tekst: laatste.tekst } : null, maakOngedaan };
}

function OngedaanBalk({ beheer }: { beheer: KeuzesBeheer }) {
  if (!beheer.laatste) return null;
  return (
    <p
      role="status"
      className="m-0 flex items-center justify-between gap-2 rounded-[10px] border border-[var(--vd-line)] bg-[var(--vd-bg)] px-3 py-2 text-[0.75rem] text-[var(--vd-ink-2)]"
    >
      <span className="min-w-0">{beheer.laatste.tekst}</span>
      <button
        type="button"
        onClick={beheer.maakOngedaan}
        className="min-h-[44px] shrink-0 cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-[0.75rem] font-semibold text-[var(--vd-accent-2)] hover:underline"
      >
        Ongedaan maken
      </button>
    </p>
  );
}

/**
 * Alles wat je in Vergelijken koos, over alle stoffen heen: de voedingsmiddelen
 * (`voeding-eten-…`) en het supplement per stof (`voeding-product-…`). Bron voor
 * de zijkolom en de lade; Mijn keuzes blijft de plek om ze te beheren.
 */
function useKeuzesOverzicht(statuses: readonly NutrientRouteStatus[], products?: readonly KeuzeProduct[]): KeuzesOverzicht {
  const { items } = useVoortgangFavorites();
  return useMemo(() => {
    const rijen: KeuzeRij[] = [];
    let centenPerDag = 0;
    for (const status of statuses) {
      for (const key of etenKeuzesVoorStof(status.nutrient, items)) {
        const entry = catalogEntry(key);
        if (!entry) continue;
        rijen.push({
          id: `eten-${status.nutrient}-${key}`,
          nutrient: status.nutrient,
          key,
          soort: "eten",
          titel: entry.labelNl,
          context: `${status.label} · ${etenMomentVoor(status.nutrient, key, items)}`,
          entry,
          product: null,
          centenPerDag: null,
        });
      }
      const slug = productKeuzeVoorStof(status.nutrient, items);
      const product = slug ? keuzeProductVoorSlug(status.nutrient, slug, products) : null;
      if (product) {
        const supplementMoment = momentVoorStof(status.nutrient, items, "supplement") ?? "ontbijt";
        rijen.push({
          id: `supplement-${status.nutrient}-${product.slug}`,
          nutrient: status.nutrient,
          key: null,
          soort: "supplement",
          titel: product.naam,
          context: `${status.label} · ${supplementMoment}`,
          entry: null,
          product,
          centenPerDag: product.centenPerDag,
        });
        centenPerDag += product.centenPerDag ?? 0;
      }
    }
    return { rijen, centenPerDag };
  }, [statuses, items, products]);
}

function KeuzesLijst({
  overzicht,
  onWis,
}: {
  overzicht: KeuzesOverzicht;
  onWis?: (rij: KeuzeRij) => void;
}) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0">
      {overzicht.rijen.map((rij) => (
        <li
          key={rij.id}
          className="flex items-center gap-2.5 rounded-[12px] border border-[var(--vd-line)] bg-[var(--vd-bg)] p-2"
        >
          {rij.entry ? (
            <FoodThumbnail entry={rij.entry} size={40} />
          ) : rij.product?.imageSrc ? (
            <Image
              src={rij.product.imageSrc}
              alt={rij.product.imageAlt}
              width={80}
              height={80}
              loading="lazy"
              className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-0.5"
            />
          ) : (
            <span aria-hidden className="h-10 w-10 shrink-0 rounded-lg bg-[var(--vd-accent-2-fill)]" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{rij.titel}</span>
            <span className="block truncate text-[0.6875rem] text-[var(--vd-ink-3)]">{rij.context}</span>
          </span>
          {rij.centenPerDag !== null ? (
            <span className="shrink-0 font-mono text-[0.75rem] tabular-nums text-[var(--vd-ink-2)]">
              {euroPerDag(rij.centenPerDag)}
            </span>
          ) : null}
          {onWis ? (
            <button
              type="button"
              aria-label={`Haal ${rij.titel} weg uit je keuzes`}
              onClick={() => onWis(rij)}
              className="-mr-1 inline-flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[1.125rem] leading-none text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)]"
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function KeuzesTotaal({ overzicht }: { overzicht: KeuzesOverzicht }) {
  const supplementen = overzicht.rijen.filter((rij) => rij.soort === "supplement").length;
  if (supplementen === 0) return null;
  return (
    <div className="flex items-baseline justify-between gap-2 border-t border-[var(--vd-line)] pt-3 text-[0.75rem] text-[var(--vd-ink-2)]">
      <span>
        Supplementen per dag
        <span className="block text-[0.65625rem] text-[var(--vd-ink-3)]">
          ± {euroPerDag(overzicht.centenPerDag * 30)} per maand
        </span>
      </span>
      <b className="font-mono text-[1.0625rem] font-medium tabular-nums text-[var(--vd-ink)]">
        {euroPerDag(overzicht.centenPerDag)}
      </b>
    </div>
  );
}

function NaarMijnKeuzesKnop({
  overzicht,
  surface,
  plek,
  onNaarMijnKeuzes,
}: {
  overzicht: KeuzesOverzicht;
  surface: string;
  plek: "zijkolom" | "lade";
  onNaarMijnKeuzes?: () => void;
}) {
  if (!onNaarMijnKeuzes) return null;
  return (
    <button
      type="button"
      onClick={() => {
        trackEvent("keuze_naar_mijn_keuzes", { surface, plek, aantal: overzicht.rijen.length });
        onNaarMijnKeuzes();
      }}
      className="inline-flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-[12px] border border-[var(--vd-sage)] bg-[var(--vd-sage)] px-4 text-[0.8125rem] font-bold text-[#0D190B]"
    >
      Naar Mijn keuzes →
    </button>
  );
}

/** Brede inhoud: al je keuzes naast het werkblad. Smaller: zie {@link KeuzesLade}. */
function KeuzesZijkolom({
  overzicht,
  surface,
  onNaarMijnKeuzes,
  beheer,
}: {
  overzicht: KeuzesOverzicht;
  surface: string;
  onNaarMijnKeuzes?: () => void;
  beheer: KeuzesBeheer;
}) {
  const aantal = overzicht.rijen.length;

  return (
    <aside
      aria-label="Je keuzes"
      className="hidden rounded-[16px] border border-[var(--vd-line)] bg-[var(--vd-surface)] p-4 @[56rem]:sticky @[56rem]:top-20 @[56rem]:block"
    >
      <p className="vd-eyebrow m-0">Mijn keuzes</p>
      <h3 className="mb-3 mt-1 text-[1.125rem] text-[var(--vd-ink)]">Je keuzes</h3>
      <div className="flex flex-col gap-3">
        <OngedaanBalk beheer={beheer} />
        {aantal === 0 ? (
          <p className="m-0 text-[0.78125rem] leading-relaxed text-[var(--vd-ink-3)]">
            Nog niets gekozen. Kies een bron uit je eten of een supplement, dan staat het hier.
          </p>
        ) : (
          <>
            <KeuzesLijst overzicht={overzicht} onWis={(rij) => beheer.wisRij(rij, "zijkolom")} />
            <KeuzesTotaal overzicht={overzicht} />
            <NaarMijnKeuzesKnop overzicht={overzicht} surface={surface} plek="zijkolom" onNaarMijnKeuzes={onNaarMijnKeuzes} />
            <button
              type="button"
              onClick={() => beheer.wisAlles("zijkolom")}
              className="min-h-[44px] cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-[0.75rem] text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)] hover:underline"
            >
              Alles weghalen
            </button>
          </>
        )}
      </div>
    </aside>
  );
}

/**
 * Smallere inhoud: een vaste lade onderaan met de teller, uit te klappen tot
 * de lijst. Op mobiel boven de hoofdnavigatie (`CockpitBottomNav`, alleen < sm).
 * Verschijnt pas bij de eerste keuze, zodat de teller zelf het bewijs is dat
 * de tik gelukt is.
 */
function KeuzesLade({
  overzicht,
  surface,
  onNaarMijnKeuzes,
  beheer,
}: {
  overzicht: KeuzesOverzicht;
  surface: string;
  onNaarMijnKeuzes?: () => void;
  beheer: KeuzesBeheer;
}) {
  const [open, setOpen] = useState(false);
  if (overzicht.rijen.length === 0) {
    return beheer.laatste ? (
      <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 mt-4 sm:bottom-3 @[56rem]:hidden">
        <OngedaanBalk beheer={beheer} />
      </div>
    ) : null;
  }
  const aantal = overzicht.rijen.length;
  const supplementen = overzicht.rijen.some((rij) => rij.soort === "supplement");

  return (
    <section
      aria-label="Je keuzes"
      className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 mt-4 rounded-[14px] border border-[var(--vd-line-2)] bg-[rgba(13,25,11,0.95)] shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md sm:bottom-3 @[56rem]:hidden"
    >
      {beheer.laatste ? (
        <div className="border-b border-[var(--vd-line)] p-2">
          <OngedaanBalk beheer={beheer} />
        </div>
      ) : null}
      {open ? (
        <div className="flex max-h-[40vh] flex-col gap-2 overflow-y-auto border-b border-[var(--vd-line)] p-3">
          <KeuzesLijst overzicht={overzicht} onWis={(rij) => beheer.wisRij(rij, "lade")} />
          <button
            type="button"
            onClick={() => beheer.wisAlles("lade")}
            className="min-h-[44px] cursor-pointer self-start border-0 bg-transparent p-0 font-[inherit] text-[0.75rem] text-[var(--vd-ink-3)] hover:text-[var(--vd-ink)] hover:underline"
          >
            Alles weghalen
          </button>
        </div>
      ) : null}
      <div className="flex items-center gap-3 p-2.5 pl-3.5">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((huidig) => !huidig)}
          className="flex min-h-[44px] min-w-0 flex-1 cursor-pointer flex-col justify-center border-0 bg-transparent p-0 text-left font-[inherit] text-inherit"
        >
          <span className="text-[0.6875rem] text-[var(--vd-ink-3)]">
            {aantal} {aantal === 1 ? "keuze" : "keuzes"} · {open ? "verberg" : "bekijk"}
          </span>
          <span className="font-mono text-[0.9375rem] tabular-nums text-[var(--vd-ink)]">
            {supplementen ? `${euroPerDag(overzicht.centenPerDag)} per dag` : "Eten gekozen"}
          </span>
        </button>
        <div className="shrink-0">
          <NaarMijnKeuzesKnop overzicht={overzicht} surface={surface} plek="lade" onNaarMijnKeuzes={onNaarMijnKeuzes} />
        </div>
      </div>
    </section>
  );
}

function StofWerkblad({
  status,
  stand,
  dagen,
  datums,
  surface,
  verdict,
  products,
  voedingsfavorieten,
  onNaarMijnKeuzes,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  dagen: readonly DagboekDag[];
  datums: readonly string[];
  surface: string;
  verdict: StoredSupplementVerdict | null;
  products?: readonly KeuzeProduct[];
  voedingsfavorieten: DagboekVoedingsfavorieten;
  onNaarMijnKeuzes?: () => void;
}) {
  const { items, save, remove } = useVoortgangFavorites();
  const keuze = resolveNutritionRouteChoice(status.nutrient, items);
  const gekozenProduct = productKeuzeVoorStof(status.nutrient, items);
  const [voorbeeldSlug, setVoorbeeldSlug] = useState<string | null>(null);

  const kies = (volgende: NutritionRouteChoice | null) => {
    for (const optie of NUTRITION_ROUTE_CHOICES) {
      if (optie !== volgende) remove(nutritionRouteChoiceId(status.nutrient, optie));
    }
    if (volgende) {
      save(
        {
          id: nutritionRouteChoiceId(status.nutrient, volgende),
          title: routeChoiceFavoriteTitle(status.nutrient, volgende),
          kind: volgende === "bord" ? "activiteit" : "supplement",
          domain: "voeding",
          source: "mijn_keuze",
        },
        surface,
      );
    }
    trackEvent("nutrition_route_choice", {
      surface,
      nutrient: status.nutrient,
      choice: volgende ?? "geen",
      route_status: stand.stand,
    });
    clarityTag("nutrition_route_keuze", `${status.nutrient}_${volgende ?? "geen"}`);
  };

  /**
   * Eén product per stof. Een product kiezen zet de supplementroute aan, het
   * weer wissen zet hem uit: "Kies supplement" betekent sinds 7 oktober "dít
   * supplement", niet alleen "een supplement".
   */
  const kiesProduct = (product: KeuzeProduct) => {
    const wissen = gekozenProduct === product.slug;
    for (const id of productKeuzeIdsVoorStof(status.nutrient, items)) remove(id);
    if (!wissen) {
      save(
        {
          id: productKeuzeId(status.nutrient, product.slug),
          title: productKeuzeTitel(status.nutrient, product.naam),
          kind: "supplement",
          domain: "voeding",
          source: "mijn_keuze",
        },
        surface,
      );
    }
    if (wissen ? heeftSupplement(keuze) : !heeftSupplement(keuze)) {
      kies(samen(heeftVoeding(keuze), !wissen));
    }
    trackEvent("keuze_product_gekozen", {
      surface,
      nutrient: status.nutrient,
      product: product.slug,
      actie: wissen ? "gewist" : "gekozen",
      stand: stand.stand,
    });
    clarityTag("keuze_product", `${status.nutrient}_${wissen ? "gewist" : "gekozen"}`);
  };

  const zetSupplementUit = () => {
    for (const id of productKeuzeIdsVoorStof(status.nutrient, items)) remove(id);
    kies(samen(heeftVoeding(keuze), false));
  };

  const gekozenProductData = gekozenProduct ? keuzeProductVoorSlug(status.nutrient, gekozenProduct, products) : null;
  const voorbeeld = voorbeeldSlug && !gekozenProductData ? keuzeProductVoorSlug(status.nutrient, voorbeeldSlug, products) : null;
  const etenNamen = etenKeuzesVoorStof(status.nutrient, items).flatMap((key) => {
    const entry = catalogEntry(key);
    return entry ? [entry.labelNl] : [];
  });

  return (
    <article aria-label={status.label} className="flex flex-col gap-3">
      <StofHero
        status={status}
        stand={stand}
        surface={surface}
        gekozenProduct={gekozenProductData}
        voorbeeld={voorbeeld}
        etenNamen={etenNamen}
      />

      {verdict && !dagboekMeetStof(stand) ? <CheckContext nutrient={status.nutrient} verdict={verdict} surface={surface} /> : null}

      <div className="@container">
        <div className="grid grid-cols-1 gap-3 @[34rem]:grid-cols-2 @[34rem]:items-start">
          <VoedingKant
            status={status}
            stand={stand}
            dagen={dagen}
            datums={datums}
            routeGekozen={heeftVoeding(keuze)}
            onZetEten={(aan) => kies(samen(aan, heeftSupplement(keuze)))}
            onNaarMijnKeuzes={onNaarMijnKeuzes}
            voedingsfavorieten={voedingsfavorieten}
          />
          <SupplementKant
            status={status}
            stand={stand}
            surface={surface}
            products={products}
            routeGekozen={heeftSupplement(keuze)}
            gekozenProduct={gekozenProduct}
            onKiesProduct={kiesProduct}
            onVoorbeeld={setVoorbeeldSlug}
            onZetUit={zetSupplementUit}
            onNaarMijnKeuzes={onNaarMijnKeuzes}
          />
        </div>
      </div>

      {keuze ? (
        <p className="m-0 max-w-[62ch] text-[0.71875rem] leading-relaxed text-[var(--vd-ink-2)]">
          {keuze === "beide" ? "Allebei: " : ""}
          {routeChoiceConfirmation(keuze, status)}
        </p>
      ) : null}
    </article>
  );
}

/**
 * De stand uit je dagboek en één balk: je eten, wat een supplement erbij zou
 * doen (gestreept bij hover of focus, vol zodra je kiest) en je norm. Het
 * getal is "minstens": het dagboek is gemeten inname, geen totaal.
 */
function StofHero({
  status,
  stand,
  surface,
  gekozenProduct,
  voorbeeld,
  etenNamen,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  surface: string;
  gekozenProduct: KeuzeProduct | null;
  voorbeeld: KeuzeProduct | null;
  etenNamen: string[];
}) {
  const eten = stand.gemiddeld;
  const norm = stand.norm;
  const kanBalk = eten !== null && norm !== null && norm > 0;
  const bijdrage = (product: KeuzeProduct | null): number =>
    product && product.dosisPerDag !== null && product.eenheid === stand.unit ? product.dosisPerDag : 0;
  const erbij = bijdrage(gekozenProduct);
  const erbijVoorbeeld = gekozenProduct ? 0 : bijdrage(voorbeeld);
  const grens = gekozenProduct ? supplementErbij(status.nutrient, stand, gekozenProduct).bovengrens : null;
  const venster = stand.venster?.dagen_terug ?? 7;
  const keuzeNamen = [...etenNamen, ...(gekozenProduct ? [gekozenProduct.naam] : [])];

  let balk: React.ReactNode = null;
  if (kanBalk) {
    const schaal = Math.max(norm * 1.3, (eten + erbij + erbijVoorbeeld) * 1.05);
    const pct = (waarde: number) => `${Math.min(100, (waarde / schaal) * 100)}%`;
    balk = (
      <div>
        <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-mono text-[1.75rem] leading-none tabular-nums text-[var(--vd-ink)]">
            {stand.benaderd ? "≈ " : ""}
            {hoeveelheid(eten + erbij)}
            <small className="ml-1 text-[0.75rem] text-[var(--vd-ink-3)]">
              / {hoeveelheid(norm)} {stand.unit}
            </small>
          </span>
          <span className="vd-eyebrow m-0 text-right">minstens{erbij > 0 ? ", met supplement" : ""}</span>
        </div>
        <div
          role="img"
          aria-label={`Je eten ${hoeveelheid(eten)} ${stand.unit}${erbij > 0 ? `, plus supplement ${hoeveelheid(erbij)} ${stand.unit}` : ""}, norm ${hoeveelheid(norm)} ${stand.unit}`}
          className="relative h-4 rounded-full bg-[var(--vd-track)]"
        >
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--vd-sage)] transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: pct(eten) }}
          />
          {erbij > 0 ? (
            <div
              className="absolute inset-y-0 rounded-r-full bg-[var(--vd-accent-2)] transition-all duration-300 motion-reduce:transition-none"
              style={{ left: pct(eten), width: pct(erbij) }}
            />
          ) : null}
          {erbijVoorbeeld > 0 ? (
            <div
              className="absolute inset-y-0 rounded-r-full bg-[repeating-linear-gradient(135deg,var(--vd-accent-2-fill)_0_6px,transparent_6px_12px)] outline-dashed outline-1 -outline-offset-1 outline-[var(--vd-accent-2)]"
              style={{ left: pct(eten), width: pct(erbijVoorbeeld) }}
            />
          ) : null}
          <div className="absolute -bottom-1.5 -top-1.5 w-0.5 rounded bg-[var(--vd-ink)]" style={{ left: pct(norm) }}>
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[0.5625rem] uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
              norm
            </span>
          </div>
        </div>
        <p className="m-0 mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.71875rem] text-[var(--vd-ink-2)]">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-[3px] bg-[var(--vd-sage)]" /> Uit je eten
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-2 w-2 rounded-[3px] bg-[var(--vd-accent-2)]" /> Uit een supplement
          </span>
        </p>
        {grens ? (
          <p className={`m-0 mt-2 text-[0.6875rem] ${grens.boven ? "font-semibold text-[var(--vd-amber)]" : "text-[var(--vd-ink-3)]"}`}>
            {bovengrensRegel(grens)}
          </p>
        ) : null}
      </div>
    );
  } else if (stand.gemiddeld !== null) {
    balk = <p className="m-0 font-mono text-[1.25rem] tabular-nums text-[var(--vd-ink)]">{kortGetal(stand)}</p>;
  }

  return (
    <section
      aria-label={`${status.label}, stand uit je dagboek`}
      className="@container rounded-[16px] border border-[var(--vd-line)] bg-gradient-to-br from-[var(--vd-surface-2)] to-[var(--vd-surface)] p-4 @[34rem]:p-5"
    >
      <div className={`grid gap-4 ${balk ? "@[34rem]:grid-cols-[1.15fr_1fr] @[34rem]:items-center @[34rem]:gap-6" : ""}`}>
        <div className="min-w-0">
          <p className="vd-eyebrow m-0">Laatste {venster} dagen · uit je dagboek</p>
          <h3 className="mb-2 mt-1 text-[1.625rem] leading-none text-[var(--vd-ink)]">{status.label}</h3>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold"
            style={{ color: STAND_KLEUR[stand.stand], background: "rgba(255,255,255,0.06)" }}
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
            {STAND_KORT[stand.stand].charAt(0).toUpperCase() + STAND_KORT[stand.stand].slice(1)}
          </span>
          <p className="m-0 mt-2.5 max-w-[56ch] text-[0.8125rem] leading-relaxed text-[var(--vd-ink-2)]">
            {stand.zin}
            {stand.stand === "geen_doel" ? (
              <>
                {" "}
                <Link
                  href="/dashboard/doelen"
                  onClick={() => trackEvent("keuze_eiwitdoel_instellen", { surface })}
                  className="font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
                >
                  Stel je eiwitdoel in →
                </Link>
              </>
            ) : null}
          </p>
          <Link
            href={`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`}
            onClick={(event) => {
              event.preventDefault();
              trackEvent("keuze_naar_patroon_stof", { nutrient: status.nutrient, plek: "hero" });
              gaNaarDashboard(`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`);
            }}
            className="mt-2 inline-block text-[0.75rem] font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
          >
            Bekijk {status.label.toLowerCase()} in je patroon →
          </Link>
        </div>
        {balk}
      </div>
      <p
        aria-live="polite"
        className="m-0 mt-3.5 rounded-[11px] border border-dashed border-[var(--vd-line-2)] px-3 py-2 text-[0.75rem] text-[var(--vd-ink-2)]"
      >
        {keuzeNamen.length > 0 ? (
          <>
            Jouw keuze: <b className="font-semibold text-[var(--vd-ink)]">{keuzeNamen.join(" + ")}</b>
          </>
        ) : (
          "Nog niets gekozen. Kies hieronder een bron of een supplement."
        )}
      </p>
    </section>
  );
}

function oordeelDatum(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(date);
}

function dagboekMeetStof(stand: KeuzeStofStand): boolean {
  return stand.stand === "op_koers" || stand.stand === "ruimte";
}

/**
 * Het oordeel uit je check, binnen de stofkaart. Alleen waar het dagboek de
 * stof niet kan meten (te weinig dagen, zink, vitamine D) is het oordeel van
 * de check het enige antwoord; meet het dagboek de stof, dan toont de kaart
 * het niet.
 */
function CheckContext({
  nutrient,
  verdict,
  surface,
}: {
  nutrient: NutrientId;
  verdict: StoredSupplementVerdict;
  surface: string;
}) {
  const [open, setOpen] = useState(false);
  const ingredient: IngredientClaimKey = ingredientVanStof(nutrient);
  const kaart = toVerdictCardCopy(verdict);
  const afleiding = buildAfleiding(ingredient, verdict);
  const datum = oordeelDatum(verdict.createdAt);
  const regels = afleiding
    ? [afleiding.signaalLine, afleiding.zekerheidLine, afleiding.bloedLine, afleiding.claimLine].filter(
        (regel): regel is string => Boolean(regel),
      )
    : [];

  const toggle = () => {
    const volgende = !open;
    setOpen(volgende);
    if (volgende) {
      trackEvent("dashboard_afleiding_open", { ingredient, verdict: verdict.verdict, surface });
      clarityTag("dashboard_afleiding", ingredient);
      emitIntakeClientEvent("dashboard.afleiding_opened", {
        ingredient_key: ingredient,
        verdict: verdict.verdict,
        surface,
      });
    }
  };

  return (
    <section
      aria-label="Uit je check"
      className="@container mb-3 rounded-[11px] border border-[var(--vd-line)] bg-[var(--vd-bg)] px-3 py-2.5"
    >
      <p className="m-0 flex flex-wrap items-baseline justify-between gap-x-3 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-[var(--vd-ink-3)]">
        <span>Uit je check</span>
        {datum ? <span className="font-medium normal-case tracking-normal text-[var(--vd-ink-4)]">{datum}</span> : null}
      </p>
      <p className="m-0 mt-1 max-w-[62ch] text-[0.75rem] leading-relaxed text-[var(--vd-ink-2)]">
        <span className="font-semibold text-[var(--vd-ink)]">{kaart.label}.</span> {kaart.reason}
      </p>
      {regels.length > 0 ? (
        <>
          <button
            type="button"
            aria-expanded={open}
            onClick={toggle}
            className="mt-2 inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-[0.6875rem] font-semibold text-[var(--vd-sage-2)]"
          >
            Hoe we hier komen
            <Icons.ChevronDown s={11} style={{ transform: open ? "rotate(180deg)" : undefined }} />
          </button>
          {open ? (
            <ul className="m-0 mt-1.5 flex max-w-[62ch] list-none flex-col gap-1 p-0 text-[0.71875rem] leading-relaxed text-[var(--vd-ink-2)]">
              {regels.map((regel) => (
                <li key={regel}>{regel}</li>
              ))}
              {ingredient === "eiwitpoeder" ? (
                <li>
                  <Link
                    href="/dashboard/doelen"
                    onClick={() => trackEvent("keuze_eiwitdoel_instellen", { surface, plek: "afleiding" })}
                    className="font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
                  >
                    Naar Je doelen →
                  </Link>
                </li>
              ) : null}
            </ul>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function Kant({
  kleur,
  titel,
  children,
  gedempt = false,
}: {
  kleur: "sage" | "accent-2";
  titel: string;
  children: React.ReactNode;
  gedempt?: boolean;
}) {
  const accent = kleur === "sage" ? "var(--vd-sage)" : "var(--vd-accent-2)";
  return (
    <section
      aria-label={titel}
      className={`flex min-w-0 flex-col rounded-[14px] border border-[var(--vd-line)] bg-[var(--vd-bg)] p-3 ${gedempt ? "opacity-80" : ""}`}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <p className="m-0 mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {titel}
      </p>
      <div className="flex-1">{children}</div>
    </section>
  );
}

type EtenRij = {
  entry: CatalogEntry;
  portie: string;
  levert: string;
  waarde: number;
  unit: string;
  ook: string[];
};

/**
 * Het balkje onder een bron of product: je eten van de laatste dagen (vol) en
 * wat dít erbij doet (gestreept), tegenover je norm. Staat er altijd, dus ook
 * op een telefoon waar hover niet bestaat. Alleen als de eenheden kloppen en
 * er een norm en een gemeten stand is; het blijft "minstens".
 */
function ErbijBalkje({
  stand,
  erbij,
  eenheid,
  kleur,
}: {
  stand: KeuzeStofStand;
  erbij: number | null;
  eenheid: string | null;
  kleur: "sage" | "accent-2";
}) {
  const eten = stand.gemiddeld;
  const norm = stand.norm;
  if (eten === null || norm === null || norm <= 0 || erbij === null || erbij <= 0 || eenheid !== stand.unit) return null;
  const schaal = Math.max(norm * 1.3, (eten + erbij) * 1.05);
  const pct = (waarde: number) => `${Math.min(100, (waarde / schaal) * 100)}%`;
  const accent = kleur === "sage" ? "var(--vd-sage)" : "var(--vd-accent-2)";
  return (
    <div
      role="img"
      aria-label={`Hier komt ${hoeveelheid(erbij)} ${stand.unit} bij, op ${hoeveelheid(eten)} uit je eten, norm ${hoeveelheid(norm)} ${stand.unit}`}
      className="relative mt-1.5 ml-[3.625rem] h-1.5 rounded-full bg-[var(--vd-track)]"
    >
      <div className="absolute inset-y-0 left-0 rounded-l-full bg-[var(--vd-sage)] opacity-50" style={{ width: pct(eten) }} />
      <div
        className="absolute inset-y-0 rounded-r-full"
        style={{
          left: pct(eten),
          width: pct(erbij),
          background: accent,
        }}
      />
      <div className="absolute -bottom-0.5 -top-0.5 w-0.5 rounded bg-[var(--vd-ink)]" style={{ left: pct(norm) }} />
    </div>
  );
}

function aandeelVanNorm(rij: Pick<EtenRij, "waarde" | "unit">, stand: KeuzeStofStand): number | null {
  if (!stand.norm || rij.unit !== stand.unit) return null;
  return Math.round((rij.waarde / stand.norm) * 100);
}

function VoedingKant({
  status,
  stand,
  dagen,
  datums,
  routeGekozen,
  onZetEten,
  onNaarMijnKeuzes,
  voedingsfavorieten,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  dagen: readonly DagboekDag[];
  datums: readonly string[];
  routeGekozen: boolean;
  onZetEten: (aan: boolean) => void;
  onNaarMijnKeuzes?: () => void;
  voedingsfavorieten: DagboekVoedingsfavorieten;
}) {
  const profiel = useKernstofProfiel();
  const { zetEten } = useMomentOpslag("keuze_vergelijken");
  const [zoek, setZoek] = useState("");
  const bronnen = useMemo(() => bronnenVanStof(dagen, datums, status.nutrient), [dagen, datums, status.nutrient]);
  const perMoment = useMemo(() => stofPerMoment(dagen, datums, status.nutrient), [dagen, datums, status.nutrient]);
  const totaal = bronnen.reduce((som, b) => som + b.totaal, 0);
  const momentTotaal = perMoment.reduce((som, m) => som + m.totaal, 0);
  const ruimte = ruimteBij(perMoment, momentTotaal);
  const term = zoek.trim();
  const voorstellen = useMemo<EtenRij[]>(
    () =>
      rijksteBronnen(status.nutrient, "portie", 30)
        .filter((bron) => pastBijVoedingswijze(bron.entry, profiel.voedingswijze))
        .slice(0, 5)
        .map((bron) => ({
          entry: bron.entry,
          portie: bron.portieLabel,
          levert: `${hoeveelheid(bron.perPortie)} ${bron.unit}`,
          waarde: bron.perPortie,
          unit: bron.unit,
          ook: brengtOokMee(bron.entry, status.nutrient),
        })),
    [status.nutrient, profiel.voedingswijze],
  );
  // Zoeken binnen deze stof: alleen wat er per portie iets van levert, rijkste eerst.
  const treffers = useMemo<EtenRij[]>(() => {
    if (!term) return [];
    return searchCatalog(term, 40)
      .map((entry) => ({ entry, levert: gehaltePerPortie(entry, status.nutrient) }))
      .filter((rij): rij is { entry: CatalogEntry; levert: { value: number; unit: string } } => (rij.levert?.value ?? 0) > 0)
      .sort((x, y) => y.levert.value - x.levert.value)
      .slice(0, 5)
      .map(({ entry, levert }) => ({
        entry,
        portie: entry.porties[0]?.labelNl ?? "",
        levert: `${hoeveelheid(levert.value)} ${levert.unit}`,
        waarde: levert.value,
        unit: levert.unit,
        ook: brengtOokMee(entry, status.nutrient),
      }));
  }, [term, status.nutrient]);
  const beste = voorstellen[0] ?? null;
  const rijen = term ? treffers : voorstellen.slice(1);
  const { items, save, remove } = useVoortgangFavorites();
  const etenKeuzes = etenKeuzesVoorStof(status.nutrient, items);
  const gekozenHier = etenKeuzes.length;
  const getoond = new Set([...(beste ? [beste.entry.key] : []), ...rijen.map((rij) => rij.entry.key)]);
  const elders = etenKeuzes.filter((key) => !getoond.has(key));

  /**
   * Eén actie per voedingsmiddel. Kiezen bewaart het bij déze stof in Mijn
   * keuzes (`voeding-eten-<stof>-<key>`), zet de ☆ in het dagboek zodat het
   * bovenaan staat bij toevoegen, en kiest de route eten. Wissen haalt de
   * ster alleen weg als je het bij geen andere stof koos.
   */
  const kies = (key: string, naam: string) => {
    const wasGekozen = etenKeuzes.includes(key);
    if (wasGekozen) {
      remove(etenKeuzeId(status.nutrient, key));
      for (const id of itemMomentIdsVoor(status.nutrient, key, items)) remove(id);
      const bijAnder = items.some((item) => {
        const keuze = parseEtenKeuze(item.id);
        return keuze?.key === key && keuze.nutrient !== status.nutrient;
      });
      if (!bijAnder && voedingsfavorieten.isBewaard(key)) void voedingsfavorieten.wissel(key, status.nutrient);
    } else {
      save(
        {
          id: etenKeuzeId(status.nutrient, key),
          title: `${status.label}: ${naam}`,
          kind: "activiteit",
          domain: "voeding",
          source: "mijn_keuze",
        },
        "keuze_stof",
      );
      if (!voedingsfavorieten.isBewaard(key)) void voedingsfavorieten.wissel(key, status.nutrient);
      if (!routeGekozen) onZetEten(true);
    }
    trackEvent("keuze_eten_gekozen", {
      nutrient: status.nutrient,
      product: key,
      actie: wasGekozen ? "gewist" : "gekozen",
      via: term ? "zoek" : "voorstel",
    });
  };

  return (
    <Kant kleur="sage" titel="Uit je eten">
      {beste ? (
        <article
          className={`grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-2.5 rounded-[12px] border bg-[var(--vd-surface)] p-2.5 ${
            etenKeuzes.includes(beste.entry.key)
              ? "border-[var(--vd-sage)] ring-1 ring-[var(--vd-sage)]"
              : "border-[var(--vd-line)]"
          }`}
        >
          <FoodThumbnail entry={beste.entry} size={72} />
          <div className="min-w-0">
            <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[var(--vd-sage-2)]">
              Beste uit je eten
            </p>
            <h4 className="m-0 mt-0.5 text-[0.9375rem] font-semibold leading-tight text-[var(--vd-ink)]">
              {beste.entry.labelNl}
            </h4>
            <p className="m-0 mt-1 text-[0.75rem] leading-snug text-[var(--vd-ink-2)]">
              {beste.portie} levert {beste.levert}
              {aandeelVanNorm(beste, stand) !== null ? ` · ${aandeelVanNorm(beste, stand)}% van je norm` : ""}.
            </p>
            {beste.ook.length > 0 ? (
              <p className="m-0 mt-0.5 text-[0.6875rem] text-[var(--vd-sage-2)]">ook: {beste.ook.join(", ")}</p>
            ) : null}
          </div>
          <div className="col-span-2">
            <KiesPil
              groot
              gekozen={etenKeuzes.includes(beste.entry.key)}
              bezig={voedingsfavorieten.bezig === beste.entry.key}
              kleur="sage"
              onClick={() => kies(beste.entry.key, beste.entry.labelNl)}
              label={beste.entry.labelNl}
              tekst={{ aan: "In Mijn keuzes", uit: "Kies deze bron" }}
            />
            {etenKeuzes.includes(beste.entry.key) ? (
              <MomentChips
                kant="eten"
                vraag="Wanneer eet je het?"
                moment={etenMomentVoor(status.nutrient, beste.entry.key, items)}
                onKies={(moment) => zetEten(status.nutrient, beste.entry.key, beste.entry.labelNl, moment)}
              />
            ) : null}
          </div>
        </article>
      ) : (
        <p className="m-0 text-[0.75rem] text-[var(--vd-ink-3)]">Geen bron gevonden binnen je voedingswijze.</p>
      )}

      {elders.length > 0 ? (
        <>
          <p className="m-0 mt-3 text-[0.6875rem] text-[var(--vd-ink-3)]">Jouw keuze</p>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
            {elders.map((key) => {
              const entry = catalogEntry(key);
              if (!entry) return null;
              const levert = gehaltePerPortie(entry, status.nutrient);
              return (
                <li key={key} className="flex items-center justify-between gap-2 text-[0.78125rem]">
                  <span className="min-w-0">
                    <span className="text-[var(--vd-ink)]">{entry.labelNl}</span>
                    {levert ? (
                      <span className="text-[var(--vd-ink-3)]">
                        {" "}
                        · {entry.porties[0]?.labelNl} · {hoeveelheid(levert.value)} {levert.unit}
                      </span>
                    ) : null}
                  </span>
                  <KiesPil gekozen kleur="sage" onClick={() => kies(key, entry.labelNl)} label={entry.labelNl} />
                </li>
              );
            })}
          </ul>
        </>
      ) : null}

      <KolomZoek
        waarde={zoek}
        onChange={setZoek}
        label={`Zoek eten met ${status.label.toLowerCase()}`}
        onZoek={() => trackEvent("keuze_eten_zoek", { nutrient: status.nutrient, treffers: treffers.length })}
      />

      <p className="m-0 mt-2.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
        {term ? "Gevonden · rijkste eerst" : `Meer bronnen${ruimte ? ` · bij je ${ruimte.label.toLowerCase()}` : ""}`}
      </p>
      {!term ? <Voedingswijze voedingswijze={profiel.voedingswijze} nutrient={status.nutrient} /> : null}
      {term && rijen.length === 0 ? (
        <p className="m-0 mt-1 text-[0.75rem] text-[var(--vd-ink-3)]">
          Niets gevonden met {status.label.toLowerCase()} voor &ldquo;{term}&rdquo;.
        </p>
      ) : null}
      <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
        {rijen.map((rij) => {
          const gekozen = etenKeuzes.includes(rij.entry.key);
          const aandeel = aandeelVanNorm(rij, stand);
          return (
            <li
              key={rij.entry.key}
              className={`rounded-[12px] border bg-[var(--vd-surface)] p-1.5 pr-2 transition-colors ${
                gekozen ? "border-[var(--vd-sage)]" : "border-[var(--vd-line)] hover:border-[var(--vd-line-2)]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FoodThumbnail entry={rij.entry} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-semibold text-[var(--vd-ink)]">
                    {rij.entry.labelNl}
                  </span>
                  <span className="block truncate text-[0.6875rem] text-[var(--vd-ink-3)]">{rij.portie}</span>
                  {rij.ook.length > 0 ? (
                    <span className="block truncate text-[0.6875rem] text-[var(--vd-sage-2)]">ook: {rij.ook.join(", ")}</span>
                  ) : null}
                </span>
                <span className="shrink-0 text-right font-mono text-[0.8125rem] tabular-nums text-[var(--vd-ink)]">
                  {rij.levert}
                  {aandeel !== null ? (
                    <small className="block font-sans text-[0.625rem] text-[var(--vd-ink-3)]">{aandeel}% norm</small>
                  ) : null}
                </span>
                <KiesPil
                  gekozen={gekozen}
                  bezig={voedingsfavorieten.bezig === rij.entry.key}
                  kleur="sage"
                  onClick={() => kies(rij.entry.key, rij.entry.labelNl)}
                  label={rij.entry.labelNl}
                />
              </div>
              <ErbijBalkje stand={stand} erbij={rij.waarde} eenheid={rij.unit} kleur="sage" />
              {gekozen ? (
                <div className="px-1 pb-1">
                  <MomentChips
                    kant="eten"
                    vraag="Wanneer eet je het?"
                    moment={etenMomentVoor(status.nutrient, rij.entry.key, items)}
                    onKies={(moment) => zetEten(status.nutrient, rij.entry.key, rij.entry.labelNl, moment)}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      {bronnen.length > 0 ? (
        <details className="mt-3 text-[0.75rem]">
          <summary className="cursor-pointer text-[0.6875rem] text-[var(--vd-ink-3)]">Jouw bronnen, 7 dagen</summary>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
            {bronnen
              .filter((b) => !b.supplement)
              .slice(0, 3)
              .map((bron) => (
                <li key={bron.naam} className="flex items-baseline justify-between gap-2 text-[0.78125rem]">
                  <span className="min-w-0 truncate text-[var(--vd-ink)]">{bron.naam}</span>
                  <span className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-[var(--vd-ink-3)]">
                    {totaal > 0 ? `${Math.round((bron.totaal / totaal) * 100)}%` : ""}
                  </span>
                </li>
              ))}
          </ul>
        </details>
      ) : (
        <p className="m-0 mt-3 text-[0.6875rem] text-[var(--vd-ink-3)]">Nog geen bron voor deze stof in je dagboek.</p>
      )}

      <Link
        href={`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`}
        onClick={(event) => {
          event.preventDefault();
          trackEvent("keuze_naar_patroon_stof", { nutrient: status.nutrient, plek: "bronnen" });
          gaNaarDashboard(`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`);
        }}
        className="mt-2 inline-block text-[0.6875rem] font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
      >
        Alle rijkste bronnen in Je patroon →
      </Link>
      {beste?.ook.length || rijen.some((rij) => rij.ook.length > 0) ? (
        <p className="m-0 mt-2 text-[0.6875rem] leading-relaxed text-[var(--vd-ink-3)]">
          Eten brengt meer mee dan deze ene stof; &ldquo;ook&rdquo; noemt wat één portie minstens 15&nbsp;% van de
          referentie levert.
        </p>
      ) : null}

      <RouteStand
        kleur="sage"
        gekozen={routeGekozen}
        hint="Kies hierboven wat je wilt eten. Het komt in Mijn keuzes, en daar zet je het in je dagboek."
        bevestiging={
          gekozenHier > 0 || routeGekozen ? "Eten staat in Mijn keuzes. Daar zet je het met één tik in je dagboek." : null
        }
        onNaarMijnKeuzes={onNaarMijnKeuzes}
        onZetUit={() => onZetEten(false)}
        zetUitLabel="Zet eten uit"
      />
    </Kant>
  );
}

const KIES_KLEUR = {
  sage: {
    aan: "border-[var(--vd-sage)] bg-[var(--vd-sage)] text-[#0D190B]",
    uit: "border-[var(--vd-line-2)] bg-transparent text-[var(--vd-ink)] hover:border-[var(--vd-sage)]",
  },
  "accent-2": {
    aan: "border-[var(--vd-accent-2)] bg-[var(--vd-accent-2)] text-[#0D190B]",
    uit: "border-[var(--vd-line-2)] bg-transparent text-[var(--vd-ink)] hover:border-[var(--vd-accent-2)]",
  },
} as const;

function KiesPil({
  gekozen,
  bezig = false,
  kleur,
  onClick,
  label,
  groot = false,
  tekst = { aan: "Gekozen", uit: "Kies" },
}: {
  gekozen: boolean;
  bezig?: boolean;
  kleur: "sage" | "accent-2";
  onClick: () => void;
  label: string;
  groot?: boolean;
  tekst?: { aan: string; uit: string };
}) {
  return (
    <button
      type="button"
      aria-pressed={gekozen}
      aria-label={gekozen ? `${label}: gekozen, tik om te wissen` : `${label} kiezen`}
      disabled={bezig}
      onClick={onClick}
      className={`inline-flex min-h-[44px] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[12px] border text-[0.8125rem] font-bold transition-colors disabled:opacity-50 ${
        groot ? "w-full px-4" : "min-w-[76px] px-3"
      } ${gekozen ? KIES_KLEUR[kleur].aan : KIES_KLEUR[kleur].uit}`}
    >
      {gekozen ? <Icons.Check s={12} /> : null}
      {gekozen ? tekst.aan : tekst.uit}
    </button>
  );
}

/**
 * Onderaan een kolom: wat er met je keuze gebeurt. Geen grote kiesknop meer —
 * je kiest per voedingsmiddel of per product — wel de weg naar Mijn keuzes en
 * een manier om de route weer uit te zetten.
 */
function RouteStand({
  kleur,
  gekozen,
  hint,
  bevestiging,
  onNaarMijnKeuzes,
  onZetUit,
  zetUitLabel,
}: {
  kleur: "sage" | "accent-2";
  gekozen: boolean;
  hint: string;
  bevestiging: string | null;
  onNaarMijnKeuzes?: () => void;
  onZetUit: () => void;
  zetUitLabel: string;
}) {
  const accent = kleur === "sage" ? "var(--vd-sage-2)" : "var(--vd-accent-2)";
  if (!bevestiging) {
    return hint ? <p className="m-0 mt-3 text-[0.6875rem] leading-relaxed text-[var(--vd-ink-3)]">{hint}</p> : null;
  }
  return (
    <div className="mt-3 rounded-[9px] border border-[var(--vd-line)] px-2.5 py-2 text-[0.6875rem] leading-relaxed">
      <p className="m-0 text-[var(--vd-ink-2)]">
        <Icons.Check s={11} style={{ color: accent, display: "inline", verticalAlign: "-1px" }} /> {bevestiging}
      </p>
      <p className="m-0 mt-1 flex flex-wrap gap-x-3">
        {onNaarMijnKeuzes ? (
          <button
            type="button"
            onClick={onNaarMijnKeuzes}
            className="min-h-[32px] cursor-pointer border-0 bg-transparent p-0 font-semibold hover:underline"
            style={{ color: accent }}
          >
            Naar Mijn keuzes →
          </button>
        ) : null}
        {gekozen ? (
          <button
            type="button"
            onClick={onZetUit}
            className="min-h-[32px] cursor-pointer border-0 bg-transparent p-0 font-semibold text-[var(--vd-ink-3)] hover:underline"
          >
            {zetUitLabel}
          </button>
        ) : null}
      </p>
    </div>
  );
}

function SupplementKant({
  status,
  stand,
  surface,
  products,
  routeGekozen,
  gekozenProduct,
  onKiesProduct,
  onVoorbeeld,
  onZetUit,
  onNaarMijnKeuzes,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  surface: string;
  products?: readonly KeuzeProduct[];
  routeGekozen: boolean;
  gekozenProduct: string | null;
  onKiesProduct: (product: KeuzeProduct) => void;
  onVoorbeeld: (slug: string | null) => void;
  onZetUit: () => void;
  onNaarMijnKeuzes?: () => void;
}) {
  const rustig = stand.stand === "op_koers";
  const { items } = useVoortgangFavorites();
  const { zetSupplement } = useMomentOpslag("keuze_vergelijken");
  const supplementMoment = momentVoorStof(status.nutrient, items, "supplement") ?? "ontbijt";
  const [toon, setToon] = useState(!rustig || gekozenProduct !== null);
  const [zoek, setZoek] = useState("");
  const term = zoek.trim();
  const treffers = useMemo(
    () => (term ? zoekKeuzeProducten(status.nutrient, term, products) : []),
    [term, status.nutrient, products],
  );
  const vormen = useMemo(() => {
    const top = psScoreBestePerVorm(status.nutrient, products);
    // Een eerder gekozen product blijft zichtbaar, ook als het niet (meer) de beste van zijn vorm is.
    const gekozen =
      gekozenProduct && !top.some((p) => p.slug === gekozenProduct)
        ? keuzeProductVoorSlug(status.nutrient, gekozenProduct, products)
        : null;
    return gekozen ? [gekozen, ...top] : top;
  }, [status.nutrient, products, gekozenProduct]);
  const aantal = useMemo(() => psScoreAantalVoorStof(status.nutrient, products), [status.nutrient, products]);
  const gekozen = vormen.find((product) => product.slug === gekozenProduct) ?? null;
  const hoogste = useMemo(() => [...vormen].sort((a, b) => b.scoreTotaal - a.scoreTotaal)[0] ?? null, [vormen]);
  const rijen = term ? treffers : vormen.filter((product) => product.slug !== hoogste?.slug);
  const klik = (doel: "product" | "catalogus" | "vergelijking" | "productpagina", slug?: string) =>
    trackEvent("keuze_vergelijken_ps_score_click", {
      surface,
      nutrient: status.nutrient,
      doel,
      stand: stand.stand,
      ...(slug ? { product: slug } : {}),
    });
  const voorbeeldHandlers = (slug: string) => ({
    onPointerEnter: () => onVoorbeeld(slug),
    onPointerLeave: () => onVoorbeeld(null),
    onFocus: () => onVoorbeeld(slug),
    onBlur: () => onVoorbeeld(null),
  });

  return (
    <Kant kleur="accent-2" titel="Uit een supplement" gedempt={rustig && !routeGekozen}>
      {rustig ? (
        <p className="m-0 mb-2 text-[0.75rem] leading-relaxed text-[var(--vd-ink-2)]">
          Je eten haalt je norm. Een supplement voegt hier weinig toe.
        </p>
      ) : null}

      {toon ? (
        <>
          {hoogste ? (
            <article
              {...voorbeeldHandlers(hoogste.slug)}
              className={`grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-2.5 rounded-[12px] border bg-[var(--vd-surface)] p-2.5 ${
                hoogste.slug === gekozenProduct
                  ? "border-[var(--vd-accent-2)] ring-1 ring-[var(--vd-accent-2)]"
                  : "border-[var(--vd-line)]"
              }`}
            >
              <Link
                href={metKeuzeHerkomst(hoogste.href, status.nutrient)}
                onClick={() => klik("product", hoogste.slug)}
                aria-label={`Productpagina ${hoogste.naam}`}
                className="block h-[72px] w-[72px] overflow-hidden rounded-[10px] bg-white"
              >
                {hoogste.imageSrc ? (
                  <Image
                    src={hoogste.imageSrc}
                    alt={hoogste.imageAlt}
                    width={144}
                    height={144}
                    loading="lazy"
                    className="h-full w-full object-contain p-1"
                  />
                ) : null}
              </Link>
              <div className="min-w-0">
                <p className="m-0 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[var(--vd-accent-2)]">
                  Hoogste PS-Score
                </p>
                <h4 className="m-0 mt-0.5 text-[0.9375rem] font-semibold leading-tight text-[var(--vd-ink)]">
                  {hoogste.naam}
                </h4>
                <p className="m-0 mt-1 flex flex-wrap items-baseline gap-x-3 text-[var(--vd-ink-3)]">
                  <span className="text-[0.6875rem] font-semibold text-[var(--vd-accent-2)]">{hoogste.vorm}</span>
                  <span className="font-mono text-[1rem] tabular-nums text-[var(--vd-ink)]">
                    {hoogste.score}
                    <small className="ml-1 font-sans text-[0.625rem] uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
                      {hoogste.bandLabel}
                    </small>
                  </span>
                </p>
              </div>
              <div className="col-span-2 -mx-2.5 -mt-1">
                <ProductErbij nutrient={status.nutrient} stand={stand} product={hoogste} />
              </div>
              <div className="col-span-2">
                <KiesPil
                  groot
                  gekozen={hoogste.slug === gekozenProduct}
                  kleur="accent-2"
                  onClick={() => onKiesProduct(hoogste)}
                  label={hoogste.naam}
                  tekst={{ aan: "Mijn supplement", uit: "Kies dit supplement" }}
                />
                {hoogste.slug === gekozenProduct ? (
                  <MomentChips
                    kant="supplement"
                    vraag="Wanneer neem je het?"
                    moment={supplementMoment}
                    onKies={(moment) => zetSupplement(status.nutrient, hoogste.naam, moment)}
                  />
                ) : null}
              </div>
            </article>
          ) : null}

          <KolomZoek
            waarde={zoek}
            onChange={setZoek}
            label={`Zoek een ${status.label.toLowerCase()}-supplement`}
            onZoek={() => trackEvent("keuze_supplement_zoek", { nutrient: status.nutrient, treffers: treffers.length })}
          />
          <p className="m-0 mt-2.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
            {term ? "Gevonden · hoogste PS-Score eerst" : "Per vorm de hoogste PS-Score"}
          </p>
          {term && treffers.length === 0 ? (
            <p className="m-0 mt-1 text-[0.75rem] text-[var(--vd-ink-3)]">Geen product gevonden voor &ldquo;{term}&rdquo;.</p>
          ) : null}
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0">
            {rijen.map((product) => {
              const aan = product.slug === gekozenProduct;
              const erbij = supplementErbij(status.nutrient, stand, product);
              return (
                <li
                  key={product.slug}
                  {...voorbeeldHandlers(product.slug)}
                  className={`rounded-[12px] border bg-[var(--vd-surface)] p-1.5 pr-2 transition-colors ${
                    aan ? "border-[var(--vd-accent-2)]" : "border-[var(--vd-line)] hover:border-[var(--vd-line-2)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Link
                      href={metKeuzeHerkomst(product.href, status.nutrient)}
                      onClick={() => klik("product", product.slug)}
                      aria-label={`Productpagina ${product.naam}`}
                      className="block h-12 w-12 shrink-0 overflow-hidden rounded-[9px] bg-white"
                    >
                      {product.imageSrc ? (
                        <Image
                          src={product.imageSrc}
                          alt={product.imageAlt}
                          width={96}
                          height={96}
                          loading="lazy"
                          className="h-full w-full object-contain p-0.5"
                        />
                      ) : null}
                    </Link>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-semibold text-[var(--vd-ink)]">{product.naam}</span>
                      <span className="block truncate text-[0.6875rem] text-[var(--vd-ink-3)]">
                        {product.vorm} · PS-Score {product.score}
                      </span>
                    </span>
                    {product.centenPerDag !== null ? (
                      <span className="shrink-0 text-right font-mono text-[0.8125rem] tabular-nums text-[var(--vd-ink)]">
                        {euroPerDag(product.centenPerDag)}
                        <small className="block font-sans text-[0.625rem] text-[var(--vd-ink-3)]">per dag</small>
                      </span>
                    ) : null}
                    <KiesPil
                      gekozen={aan}
                      kleur="accent-2"
                      onClick={() => onKiesProduct(product)}
                      label={product.naam}
                    />
                  </div>
                  {aan ? (
                    <div className="px-1 pb-1">
                      <MomentChips
                        kant="supplement"
                        vraag="Wanneer neem je het?"
                        moment={supplementMoment}
                        onKies={(moment) => zetSupplement(status.nutrient, product.naam, moment)}
                      />
                    </div>
                  ) : null}
                  <ErbijBalkje stand={stand} erbij={product.dosisPerDag} eenheid={product.eenheid} kleur="accent-2" />
                  {erbij.samen !== null ? (
                    <p className="m-0 mt-1 pl-[3.625rem] text-[0.6875rem] text-[var(--vd-accent-2)]">
                      Samen met je eten minstens {stand.benaderd ? "≈ " : ""}
                      {hoeveelheid(erbij.samen)}
                      {stand.norm ? ` van ${hoeveelheid(stand.norm)}` : ""} {stand.unit}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
          <Link
            href={metKeuzeHerkomst(status.comparisonPath, status.nutrient)}
            onClick={() => klik("vergelijking")}
            className="mt-1 inline-flex min-h-[44px] items-center text-[0.75rem] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
          >
            Vergelijk prijs en PS-Score van alle {aantal} →
          </Link>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setToon(true)}
          className="mt-1 min-h-[44px] cursor-pointer border-0 bg-transparent p-0 text-left text-[0.75rem] font-semibold text-[var(--vd-accent-2)]"
        >
          Toon de vormen met PS-Score
        </button>
      )}
      <RouteStand
        kleur="accent-2"
        gekozen={routeGekozen}
        hint={toon && vormen.length > 0 ? "Kies hierboven het supplement dat je wilt nemen. Het komt in Mijn keuzes." : ""}
        bevestiging={
          gekozen
            ? `${gekozen.naam} staat in Mijn keuzes.`
            : routeGekozen
              ? "Je koos een supplement, maar nog niet welk. Kies er hierboven een."
              : null
        }
        onNaarMijnKeuzes={gekozen ? onNaarMijnKeuzes : undefined}
        onZetUit={onZetUit}
        zetUitLabel="Zet supplement uit"
      />
      {gekozen ? (
        <>
          <Link
            href={metKeuzeHerkomst(gekozen.href, status.nutrient)}
            onClick={() => klik("productpagina", gekozen.slug)}
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-[12px] border border-[var(--vd-accent-2)] bg-[var(--vd-accent-2)] px-3 text-center text-[0.8125rem] font-bold text-[#0D190B] no-underline"
          >
            Prijs en winkels →
          </Link>
          <p className="m-0 mt-1.5 text-[0.65625rem] leading-relaxed text-[var(--vd-ink-3)]">
            Daar staan de winkels en prijzen. Koop je via ons, dan ontvangen we commissie; je keuze en de PS-Score
            staan daar los van.
          </p>
        </>
      ) : null}
    </Kant>
  );
}

function KolomZoek({
  waarde,
  onChange,
  label,
  onZoek,
}: {
  waarde: string;
  onChange: (waarde: string) => void;
  label: string;
  onZoek: () => void;
}) {
  return (
    <div className="relative mt-2.5">
      <span aria-hidden className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[var(--vd-ink-3)]">
        <Icons.Search s={12} />
      </span>
      <input
        type="search"
        value={waarde}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (waarde.trim()) onZoek();
        }}
        placeholder={label}
        aria-label={label}
        className="min-h-[34px] w-full rounded-[9px] border border-[var(--vd-line)] bg-[var(--vd-surface)] pl-7 pr-2 text-[0.75rem] text-[var(--vd-ink)] placeholder:text-[var(--vd-ink-4)] focus:border-[var(--vd-sage)] focus:outline-none"
      />
    </div>
  );
}

/**
 * Op welke voedingswijze de "kan erbij"-lijst al filtert, met de weg naar Je
 * doelen om het te wijzigen. Het filter bestond al; zonder deze regel zag je
 * niet waarom er bij een veganist geen vis in de lijst staat.
 */
function Voedingswijze({
  voedingswijze,
  nutrient,
}: {
  voedingswijze: Voedingswijze | null;
  nutrient: NutrientId;
}) {
  return (
    <p className="m-0 mt-0.5 text-[0.65625rem] text-[var(--vd-ink-4)]">
      {voedingswijze ? `Afgestemd op: ${voedingswijze}` : "Eet je vegetarisch of veganistisch?"}{" "}
      ·{" "}
      <Link
        href="/dashboard/doelen"
        onClick={() => trackEvent("keuze_voedingswijze_wijzig", { nutrient, voedingswijze: voedingswijze ?? "alles" })}
        className="font-semibold text-[var(--vd-ink-3)] no-underline hover:underline"
      >
        {voedingswijze ? "wijzig in Je doelen" : "stel het in bij Je doelen"}
      </Link>
    </p>
  );
}

const CLAIM_REGEL: Partial<Record<KeuzeProduct["claimStance"], string>> = {
  voldoet: "Haalt de dagdosis van de EU-claim",
  voldoet_deels: "Haalt de dagdosis van de EU-claim deels",
  voldoet_niet: "Onder de dagdosis van de EU-claim",
};

/**
 * Wat dit product aan je dag toevoegt: etiket per dag en prijs, waar je
 * daarmee minstens op uitkomt, de veilige bovengrens en of het de dagdosis
 * van de EU-claim haalt (art. 10 1924/2006: de claim hoort bij de stof en
 * geldt alleen boven die dosis).
 */
function ProductErbij({
  nutrient,
  stand,
  product,
}: {
  nutrient: NutrientId;
  stand: KeuzeStofStand;
  product: KeuzeProduct;
}) {
  const erbij = supplementErbij(nutrient, stand, product);
  const grens = erbij.bovengrens;
  const claim = CLAIM_REGEL[product.claimStance];
  const etiket =
    product.dosisPerDag !== null && product.eenheid
      ? `${hoeveelheid(product.dosisPerDag)} ${product.eenheid} per dag (etiket)`
      : null;
  const prijs = product.centenPerDag !== null ? `${euroPerDag(product.centenPerDag)} per dag` : null;
  const kop = [etiket, prijs].filter(Boolean).join(" · ");

  if (!kop && erbij.samen === null && !grens && !claim) return null;

  return (
    <div className="flex flex-col gap-0.5 border-t border-[var(--vd-line)] px-2.5 pb-1.5 pt-1 text-[0.6875rem] leading-snug">
      {kop ? <span className="text-[var(--vd-ink-2)]">{kop}</span> : null}
      {erbij.samen !== null ? (
        <span className="text-[var(--vd-accent-2)]">
          Samen met je eten minstens {stand.benaderd ? "≈ " : ""}
          {hoeveelheid(erbij.samen)}
          {stand.norm ? ` van ${hoeveelheid(stand.norm)}` : ""} {stand.unit}
          {erbij.aandeelNorm !== null ? ` (${percentageADH(erbij.aandeelNorm)} van je norm)` : ""}
        </span>
      ) : null}
      {grens ? (
        <span className={grens.boven ? "font-semibold text-[var(--vd-amber)]" : "text-[var(--vd-ink-3)]"}>
          {bovengrensRegel(grens)}
        </span>
      ) : null}
      {claim ? <span className="text-[var(--vd-ink-3)]">{claim}</span> : null}
    </div>
  );
}

function bovengrensRegel(grens: NonNullable<ReturnType<typeof supplementErbij>["bovengrens"]>): string {
  const waarde = `${hoeveelheid(grens.waarde)} ${grens.unit} per dag`;
  if (grens.basis === "etiket") {
    return grens.boven
      ? `Boven de veilige bovengrens van ${waarde} uit supplementen (${grens.bron})`
      : `Binnen de veilige bovengrens van ${waarde} uit supplementen`;
  }
  if (grens.basis === "samen") {
    return grens.boven
      ? `Samen met je eten boven de veilige bovengrens van ${waarde} (${grens.bron})`
      : `Samen met je eten binnen de veilige bovengrens van ${waarde}`;
  }
  return grens.boven
    ? `Het etiket alleen zit al boven de veilige bovengrens van ${waarde} (${grens.bron})`
    : `Veilige bovengrens: ${waarde}, eten en supplementen samen — je dagboek kan deze stof niet meten`;
}
