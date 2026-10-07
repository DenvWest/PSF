"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import * as Icons from "@/components/app/icons";
import { VoedingThemaProvider } from "@/components/dashboard/patroon/VoedingThema";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { IngredientClaimKey } from "@/data/approved-claims";
import { clarityTag } from "@/lib/clarity";
import { buildDagboekVoegHref, gaNaarDashboard } from "@/lib/dagboek-deeplink";
import { trackEvent } from "@/lib/ga4";
import { emitIntakeClientEvent } from "@/lib/intake-events-client";
import {
  brengtOokMee,
  checkOordeelVoorStof,
  euroPerDag,
  ingredientVanStof,
  supplementErbij,
} from "@/lib/keuze-stofkaart";
import { keuzeStofStand, type KeuzeStand, type KeuzeStofStand } from "@/lib/keuze-stof-stand";
import type { DagboekDag } from "@/lib/nutrition-dagboek";
import { verschuifDag } from "@/lib/nutrition-periode";
import { pastBijVoedingswijze, rijksteBronnen } from "@/lib/nutrition-rijkste-bronnen";
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
import { buildAfleiding, buildVerdictFacts } from "@/lib/supplement-afleiding";
import {
  psScoreAantalVoorStof,
  psScoreBestePerVorm,
  psScoreCatalogusHref,
  type KeuzeProduct,
} from "@/lib/supplement-hub/ps-score-per-stof";
import { toVerdictCardCopy } from "@/lib/supplement-verdict-copy";
import { useKernstofProfiel } from "@/lib/use-kernstof-normen";
import { useVoortgangFavorites } from "@/lib/voortgang-favorites-context";
import type { StoredSupplementVerdict } from "@/types/verdict";

/**
 * Keuze → Vergelijken: per stof je eten naast een supplement, gevoed door je
 * dagboek (`BESLUIT_KEUZE_VERGELIJKEN_2026-10.md`, herziening 6 okt).
 *
 * ## Twee kolommen, dezelfde kleuren als het dagboek
 *
 * Sage is voeding, blauw (`--vd-accent-2`) is supplement — dezelfde twee
 * accenten als de dekkingscirkels in het dagboek. Wie van Dagboek via Patroon
 * naar Keuze gaat, ziet steeds dezelfde twee kanten.
 *
 * ## Geen slot, wel nadruk
 *
 * De laag-6-poort uit de check-ladder is vervangen door wat je dagboek laat
 * zien ({@link keuzeStofStand}). Haalt je eten de norm, dan blijft de
 * supplementkant rustig en ingeklapt; laat je dagboek ruimte zien, dan staat hij
 * open. Kiezen kan altijd: één kaart is die route, beide kaarten is "allebei".
 *
 * ## Geen dubbele dingen
 *
 * Per vorm alleen het product met de hoogste PS-Score. De volledige lijst staat
 * op `/supplementen`, de prijsvergelijking op `/beste/*`; hier staat de keuze.
 *
 * ## Eén kaart per stof (herziening 7 okt)
 *
 * Het oordeel uit je check stond tot 7 oktober als los blok onder de
 * vergelijking, en sprak die tegen: omega-3 "op je norm" uit het dagboek
 * boven "Aanvullen" uit de check. Nu draagt elke stofkaart één stand — die
 * van het dagboek — en de check staat erin als context (signaal, zekerheid,
 * bloedwaarde, EU-claim, hoe we hier komen). Alleen waar het dagboek niets
 * kan zeggen (te weinig dagen, of een stof die een dagboek niet meet) leest
 * het oordeel van de check als het antwoord.
 *
 * Aan de supplementkant per product wat het etiket per dag levert, waar je
 * daarmee op uitkomt (minstens: dagboek + etiket), de veilige bovengrens en
 * de prijs per dag. Aan de eetkant wat een portie nog meer meebrengt.
 */

const STAND_KLEUR: Record<KeuzeStand, string> = {
  op_koers: "var(--vd-sage)",
  ruimte: "var(--vd-amber)",
  niet_meetbaar: "var(--vd-ink-4)",
  onbekend: "var(--vd-ink-4)",
};

const STAND_KORT: Record<KeuzeStand, string> = {
  op_koers: "op je norm",
  ruimte: "ruimte",
  niet_meetbaar: "niet te meten",
  onbekend: "te weinig dagen",
};

function kortGetal(stand: KeuzeStofStand): string {
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
}: {
  statuses: readonly NutrientRouteStatus[];
  reeksen: readonly Vensterreeks[];
  dagen: readonly DagboekDag[];
  vandaag: string;
  surface: string;
  verdicts: readonly StoredSupplementVerdict[];
  products?: readonly KeuzeProduct[];
}) {
  const standen = useMemo(
    () =>
      new Map(
        statuses.map((status) => [
          status.nutrient,
          keuzeStofStand(status.nutrient, reeksen.find((r) => r.nutrient === status.nutrient)),
        ]),
      ),
    [statuses, reeksen],
  );

  const eersteMetRuimte = statuses.find((s) => standen.get(s.nutrient)?.stand === "ruimte")?.nutrient ?? null;
  const [open, setOpen] = useState<NutrientId | null>(eersteMetRuimte ?? statuses[0]?.nutrient ?? null);
  const [filter, setFilter] = useState<NutrientId | null>(null);
  const [zoek, setZoek] = useState("");

  const telling = useMemo(() => {
    const t: Record<KeuzeStand, number> = { op_koers: 0, ruimte: 0, niet_meetbaar: 0, onbekend: 0 };
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
  const getoond = zoekterm
    ? statuses.filter((s) => routeMatchesQuery(s, zoekterm))
    : filter
      ? statuses.filter((s) => s.nutrient === filter)
      : statuses;

  const toggle = (nutrient: NutrientId) => {
    const volgende = open === nutrient ? null : nutrient;
    setOpen(volgende);
    if (volgende) {
      trackEvent("keuze_stof_geopend", { surface, nutrient, stand: standen.get(nutrient)?.stand ?? "onbekend" });
      clarityTag("keuze_stof", nutrient);
    }
  };

  return (
    <VoedingThemaProvider>
      <div className="vd-paneel">
        <header className="mb-3">
          <p className="vd-eyebrow m-0">Laatste 7 dagen · uit je dagboek</p>
          <h2 className="mt-1 text-[1.375rem] text-[var(--vd-ink)]">Je eten naast een supplement</h2>
          <p className="m-0 mt-1.5 max-w-[60ch] text-[0.8125rem] leading-relaxed text-[var(--vd-ink-2)]">
            {meetbaar > 0
              ? `${telling.op_koers} van ${meetbaar} meetbare kernstoffen op je norm${
                  metRuimte.length > 0 ? ` · ${metRuimte.join(" en ")} ${metRuimte.length === 1 ? "heeft" : "hebben"} ruimte` : ""
                }.`
              : "Vul een paar dagen je dagboek in, dan zie je hier per stof waar je staat."}{" "}
            Kies per stof je route: uit je eten, uit een supplement, of allebei.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-[var(--vd-ink-3)]">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--vd-sage)]" /> Uit je eten
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--vd-accent-2)]" /> Uit een supplement
            </span>
          </div>
        </header>

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
            className="min-h-[36px] w-full rounded-[10px] border border-[var(--vd-line)] bg-[var(--vd-bg)] pl-8 pr-2.5 text-[0.75rem] text-[var(--vd-ink)] placeholder:text-[var(--vd-ink-4)] focus:border-[var(--vd-sage)] focus:outline-none"
          />
        </div>

        {zoekterm && getoond.length === 0 ? (
          <p className="vd-note mt-0">Niets gevonden voor &ldquo;{zoekterm}&rdquo;.</p>
        ) : null}

        <nav aria-label="Kies een stof" className="mb-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
            className={`vd-chip ${filter === null ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`}
          >
            Alles
          </button>
          {statuses.map((status) => {
            const stand = standen.get(status.nutrient);
            const actief = filter === status.nutrient;
            return (
              <button
                key={status.nutrient}
                type="button"
                aria-pressed={actief}
                onClick={() => {
                  setFilter(actief ? null : status.nutrient);
                  if (!actief) setOpen(status.nutrient);
                }}
                className={`vd-chip inline-flex items-center gap-1.5 ${actief ? "!border-[var(--vd-sage)] !text-[var(--vd-sage-2)]" : ""}`}
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

        <div className="flex flex-col gap-2.5">
          {getoond.map((status) => {
            const stand = standen.get(status.nutrient);
            if (!stand) return null;
            return (
              <StofRij
                key={status.nutrient}
                status={status}
                stand={stand}
                open={open === status.nutrient}
                onToggle={() => toggle(status.nutrient)}
                dagen={dagen}
                datums={datums}
                surface={surface}
                verdict={checkOordeelVoorStof(status.nutrient, verdicts)}
                products={products}
              />
            );
          })}
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

function StofRij({
  status,
  stand,
  open,
  onToggle,
  dagen,
  datums,
  surface,
  verdict,
  products,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  open: boolean;
  onToggle: () => void;
  dagen: readonly DagboekDag[];
  datums: readonly string[];
  surface: string;
  verdict: StoredSupplementVerdict | null;
  products?: readonly KeuzeProduct[];
}) {
  const { items, save, remove } = useVoortgangFavorites();
  const keuze = resolveNutritionRouteChoice(status.nutrient, items);
  const vulling = stand.aandeel === null ? 0 : Math.min(stand.aandeel, 1) * 100;

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

  return (
    <article className="overflow-hidden rounded-[13px] border border-[var(--vd-line)] bg-[var(--vd-surface)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-3.5 py-3 text-left font-[inherit] text-inherit"
      >
        <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: STAND_KLEUR[stand.stand] }} />
        <span className="min-w-0 flex-1">
          <span className="block text-[0.875rem] font-bold text-[var(--vd-ink)]">{status.label}</span>
          <span className="block text-[0.6875rem] text-[var(--vd-ink-3)]">
            {kortGetal(stand)}
            {stand.gemiddeld !== null ? ` · ${STAND_KORT[stand.stand]}` : ""}
          </span>
        </span>
        {keuze ? (
          <span className="flex shrink-0 gap-1" aria-label="Jouw route">
            {heeftVoeding(keuze) ? (
              <span className="rounded-full bg-[var(--vd-sage-fill)] px-2 py-0.5 text-[0.625rem] font-semibold text-[var(--vd-sage-2)]">
                eten
              </span>
            ) : null}
            {heeftSupplement(keuze) ? (
              <span className="rounded-full bg-[var(--vd-accent-2-fill)] px-2 py-0.5 text-[0.625rem] font-semibold text-[var(--vd-accent-2)]">
                supplement
              </span>
            ) : null}
          </span>
        ) : null}
        <Icons.ChevronDown s={14} style={{ transform: open ? "rotate(180deg)" : undefined, color: "var(--vd-ink-3)" }} />
      </button>

      {open ? (
        <div className="border-t border-[var(--vd-line)] px-3.5 pb-3.5 pt-3">
          {stand.aandeel !== null ? (
            <div className="mb-2 h-[6px] overflow-hidden rounded-full bg-[var(--vd-track)]">
              <div
                className="h-full rounded-full"
                style={{ width: `${vulling}%`, background: stand.stand === "op_koers" ? "var(--vd-sage)" : "var(--vd-ink-3)" }}
              />
            </div>
          ) : null}
          <p className="m-0 mb-3 max-w-[62ch] text-[0.78125rem] leading-relaxed text-[var(--vd-ink-2)]">{stand.zin}</p>

          {verdict ? (
            <CheckContext nutrient={status.nutrient} stand={stand} verdict={verdict} surface={surface} />
          ) : null}

          <div className="@container">
            <div className="grid grid-cols-1 gap-2.5 @[34rem]:grid-cols-2">
              <VoedingKant
                status={status}
                dagen={dagen}
                datums={datums}
                gekozen={heeftVoeding(keuze)}
                onKies={() => kies(samen(!heeftVoeding(keuze), heeftSupplement(keuze)))}
              />
              <SupplementKant
                status={status}
                stand={stand}
                surface={surface}
                products={products}
                gekozen={heeftSupplement(keuze)}
                onKies={() => kies(samen(heeftVoeding(keuze), !heeftSupplement(keuze)))}
              />
            </div>
          </div>

          {keuze ? (
            <p className="m-0 mt-2.5 max-w-[62ch] text-[0.71875rem] leading-relaxed text-[var(--vd-ink-2)]">
              {keuze === "beide" ? "Allebei: " : ""}
              {routeChoiceConfirmation(keuze, status)}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function oordeelDatum(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short" }).format(date);
}

/**
 * Het oordeel uit je check, binnen de stofkaart. Meet het dagboek de stof
 * (op koers of ruimte), dan is dit context en zegt de kaart dat het dagboek
 * zwaarder weegt; anders is het oordeel van de check het enige antwoord.
 */
function CheckContext({
  nutrient,
  stand,
  verdict,
  surface,
}: {
  nutrient: NutrientId;
  stand: KeuzeStofStand;
  verdict: StoredSupplementVerdict;
  surface: string;
}) {
  const [open, setOpen] = useState(false);
  const ingredient: IngredientClaimKey = ingredientVanStof(nutrient);
  const kaart = toVerdictCardCopy(verdict);
  const feiten = buildVerdictFacts(ingredient, verdict);
  const afleiding = buildAfleiding(ingredient, verdict);
  const datum = oordeelDatum(verdict.createdAt);
  const dagboekWeegtZwaarder = stand.stand === "op_koers" || stand.stand === "ruimte";
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
        {dagboekWeegtZwaarder ? (
          <>
            Je check zei &ldquo;{kaart.label.toLowerCase()}&rdquo;. Je dagboek weegt hier zwaarder: dat is wat je at,
            de check schatte het uit vragen.
          </>
        ) : (
          <>
            <span className="font-semibold text-[var(--vd-ink)]">{kaart.label}.</span> {kaart.reason}
          </>
        )}
      </p>
      <dl className="m-0 mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 @[34rem]:grid-cols-4">
        {feiten.map((feit) => (
          <div key={feit.label} className="min-w-0">
            <dt className="text-[0.5625rem] uppercase tracking-[0.1em] text-[var(--vd-ink-4)]">{feit.label}</dt>
            <dd className="m-0 text-[0.75rem] font-semibold text-[var(--vd-ink)]">{feit.value}</dd>
          </div>
        ))}
      </dl>
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
            </ul>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function RouteKnop({
  gekozen,
  onKies,
  kleur,
  label,
}: {
  gekozen: boolean;
  onKies: () => void;
  kleur: "sage" | "accent-2";
  label: string;
}) {
  const vol = kleur === "sage" ? "var(--vd-sage)" : "var(--vd-accent-2)";
  return (
    <button
      type="button"
      aria-pressed={gekozen}
      onClick={onKies}
      className="mt-3 inline-flex min-h-[36px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-[10px] border px-3 text-[0.75rem] font-semibold transition-colors"
      style={
        gekozen
          ? { background: vol, borderColor: vol, color: "#0D190B" }
          : { background: "transparent", borderColor: "var(--vd-line-2)", color: "var(--vd-ink)" }
      }
    >
      {gekozen ? <Icons.Check s={12} /> : null}
      {gekozen ? `Mijn route · ${label}` : `Kies ${label}`}
    </button>
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
      className={`flex flex-col rounded-[11px] border border-[var(--vd-line)] bg-[var(--vd-bg)] p-3 ${gedempt ? "opacity-80" : ""}`}
      style={{ borderTop: `3px solid ${accent}` }}
    >
      <p className="m-0 mb-2 text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: accent }}>
        {titel}
      </p>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function VoedingKant({
  status,
  dagen,
  datums,
  gekozen,
  onKies,
}: {
  status: NutrientRouteStatus;
  dagen: readonly DagboekDag[];
  datums: readonly string[];
  gekozen: boolean;
  onKies: () => void;
}) {
  const profiel = useKernstofProfiel();
  const bronnen = useMemo(() => bronnenVanStof(dagen, datums, status.nutrient), [dagen, datums, status.nutrient]);
  const perMoment = useMemo(() => stofPerMoment(dagen, datums, status.nutrient), [dagen, datums, status.nutrient]);
  const totaal = bronnen.reduce((som, b) => som + b.totaal, 0);
  const momentTotaal = perMoment.reduce((som, m) => som + m.totaal, 0);
  const ruimte = ruimteBij(perMoment, momentTotaal);
  const voorstellen = useMemo(
    () =>
      rijksteBronnen(status.nutrient, "portie", 30)
        .filter((bron) => pastBijVoedingswijze(bron.entry, profiel.voedingswijze))
        .slice(0, 3)
        .map((bron) => ({ ...bron, ook: brengtOokMee(bron.entry, status.nutrient) })),
    [status.nutrient, profiel.voedingswijze],
  );
  const voorMoment = ruimte?.moment ?? "ontbijt";

  return (
    <Kant kleur="sage" titel="Uit je eten">
      {bronnen.length > 0 ? (
        <>
          <p className="m-0 text-[0.6875rem] text-[var(--vd-ink-3)]">Jouw bronnen, 7 dagen</p>
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
        </>
      ) : (
        <p className="m-0 text-[0.75rem] text-[var(--vd-ink-3)]">Nog geen bron voor deze stof in je dagboek.</p>
      )}
      {ruimte ? (
        <p className="m-0 mt-2 text-[0.6875rem] text-[var(--vd-ink-2)]">
          Meeste ruimte bij je {ruimte.label.toLowerCase()}.
        </p>
      ) : null}

      {voorstellen.length > 0 ? (
        <>
          <p className="m-0 mt-2.5 text-[0.6875rem] text-[var(--vd-ink-3)]">
            Kan erbij{ruimte ? ` · bij je ${ruimte.label.toLowerCase()}` : ""}
          </p>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1 p-0">
            {voorstellen.map((bron) => (
              <li key={bron.entry.key} className="flex items-center justify-between gap-2 text-[0.78125rem]">
                <span className="min-w-0">
                  <span className="text-[var(--vd-ink)]">{bron.entry.labelNl}</span>
                  <span className="text-[var(--vd-ink-3)]">
                    {" "}
                    · {bron.portieLabel} · {hoeveelheid(bron.perPortie)} {bron.unit}
                  </span>
                  {bron.ook.length > 0 ? (
                    <span className="block text-[0.6875rem] text-[var(--vd-sage-2)]">ook: {bron.ook.join(", ")}</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  aria-label={`${bron.entry.labelNl} in je dagboek zetten`}
                  onClick={() => {
                    trackEvent("keuze_bron_naar_dagboek", { nutrient: status.nutrient, moment: voorMoment });
                    gaNaarDashboard(buildDagboekVoegHref({ bron: "voeding", key: bron.entry.key, moment: voorMoment }));
                  }}
                  className="shrink-0 cursor-pointer border-0 bg-transparent text-[1rem] font-semibold leading-none text-[var(--vd-sage-2)]"
                >
                  ＋
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
      <Link
        href={`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`}
        onClick={(event) => {
          event.preventDefault();
          trackEvent("keuze_naar_patroon_stof", { nutrient: status.nutrient });
          gaNaarDashboard(`/dashboard?tab=voortgang&sectie=stof&stof=${status.nutrient}`);
        }}
        className="mt-2 inline-block text-[0.6875rem] font-semibold text-[var(--vd-sage-2)] no-underline hover:underline"
      >
        Meer in Je patroon →
      </Link>
      {voorstellen.some((bron) => bron.ook.length > 0) ? (
        <p className="m-0 mt-2 text-[0.6875rem] leading-relaxed text-[var(--vd-ink-3)]">
          Eten brengt meer mee dan deze ene stof; &ldquo;ook&rdquo; noemt wat één portie minstens 15&nbsp;% van de
          referentie levert.
        </p>
      ) : null}
      <RouteKnop gekozen={gekozen} onKies={onKies} kleur="sage" label="eten" />
    </Kant>
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

function SupplementKant({
  status,
  stand,
  surface,
  products,
  gekozen,
  onKies,
}: {
  status: NutrientRouteStatus;
  stand: KeuzeStofStand;
  surface: string;
  products?: readonly KeuzeProduct[];
  gekozen: boolean;
  onKies: () => void;
}) {
  const rustig = stand.stand === "op_koers";
  const [toon, setToon] = useState(!rustig);
  const vormen = useMemo(() => psScoreBestePerVorm(status.nutrient, products), [status.nutrient, products]);
  const aantal = useMemo(() => psScoreAantalVoorStof(status.nutrient, products), [status.nutrient, products]);
  const klik = (doel: "product" | "catalogus" | "vergelijking", slug?: string) =>
    trackEvent("keuze_vergelijken_ps_score_click", {
      surface,
      nutrient: status.nutrient,
      doel,
      stand: stand.stand,
      ...(slug ? { product: slug } : {}),
    });

  return (
    <Kant kleur="accent-2" titel="Uit een supplement" gedempt={rustig && !gekozen}>
      {rustig ? (
        <p className="m-0 text-[0.75rem] leading-relaxed text-[var(--vd-ink-2)]">
          Je eten haalt je norm. Een supplement voegt hier weinig toe.
        </p>
      ) : null}

      {toon ? (
        <>
          <p className="m-0 mt-1 text-[0.6875rem] text-[var(--vd-ink-3)]">Per vorm de hoogste PS-Score</p>
          <ul className="m-0 mt-1 flex list-none flex-col gap-1.5 p-0">
            {vormen.map((product) => (
              <li
                key={product.slug}
                className="rounded-lg border border-[var(--vd-line)] transition-colors hover:border-[var(--vd-line-2)]"
              >
                <Link
                  href={product.href}
                  onClick={() => klik("product", product.slug)}
                  className="flex items-center justify-between gap-2 px-2.5 pb-1 pt-1.5 no-underline"
                >
                  <span className="min-w-0">
                    <span className="block text-[0.6875rem] font-semibold text-[var(--vd-accent-2)]">{product.vorm}</span>
                    <span className="block truncate text-[0.75rem] text-[var(--vd-ink)]">{product.naam}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block font-mono text-[0.875rem] tabular-nums text-[var(--vd-ink)]">{product.score}</span>
                    <span className="block text-[0.5625rem] uppercase tracking-[0.08em] text-[var(--vd-ink-3)]">
                      {product.bandLabel}
                    </span>
                  </span>
                </Link>
                <ProductErbij nutrient={status.nutrient} stand={stand} product={product} />
              </li>
            ))}
          </ul>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <Link
              href={psScoreCatalogusHref(status.nutrient)}
              onClick={() => klik("catalogus")}
              className="text-[0.6875rem] font-semibold text-[var(--vd-accent-2)] no-underline hover:underline"
            >
              Alle {aantal} met PS-Score →
            </Link>
            <Link
              href={status.comparisonPath}
              onClick={() => klik("vergelijking")}
              className="text-[0.6875rem] font-semibold text-[var(--vd-ink-2)] no-underline hover:underline"
            >
              Vergelijk op prijs →
            </Link>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setToon(true)}
          className="mt-1 cursor-pointer border-0 bg-transparent p-0 text-left text-[0.6875rem] font-semibold text-[var(--vd-accent-2)]"
        >
          Toon de vormen met PS-Score
        </button>
      )}
      <RouteKnop gekozen={gekozen} onKies={onKies} kleur="accent-2" label="supplement" />
    </Kant>
  );
}
