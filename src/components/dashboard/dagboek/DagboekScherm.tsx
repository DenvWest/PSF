"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NutrientId } from "@/data/nutrition/intake-reference";
import type { DagboekFavoriet } from "@/lib/account-dagboek-favorieten";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { dagSoortVoor, type DagboekDag } from "@/lib/nutrition-dagboek";
import {
  nutrientenGesplitstUitItems,
  sanitizeItems,
  portiesUitItems,
  type DagboekItem,
  type DagboekItemBron,
} from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import type { ProteinTargetRange } from "@/lib/protein-target";
import {
  type SupermarktPortie,
  type SupermarktVeld,
} from "@/lib/nutrition-supermarkt-items";
import { LEGE_MACRO_DOELEN, type MacroDoelen } from "@/lib/account-macro-doelen";
import { fetchMacroDoelen } from "@/lib/macro-doelen-client";
import type { SupermarktProduct } from "@/types/supermarkt-product";
import { bouwVoedingWeekoverzicht } from "@/lib/nutrition-voeding-weekoverzicht";
import { verschuifWeek, weekDatums, weekStart } from "@/lib/nutrition-weekoverzicht";
import DagboekCatalogusZoek from "@/components/dashboard/dagboek/DagboekCatalogusZoek";
import DagboekKrans from "@/components/dashboard/dagboek/DagboekKrans";
import DagboekMaaltijd from "@/components/dashboard/dagboek/DagboekMaaltijd";
import DagboekMacroRing, {
  MACRO_RING_KLEUREN,
} from "@/components/dashboard/dagboek/DagboekMacroRing";
import DagboekNutrientDetail from "@/components/dashboard/dagboek/DagboekNutrientDetail";
import DagboekVoedingPortie from "@/components/dashboard/dagboek/DagboekVoedingPortie";
import DagboekPortieInvoer from "@/components/dashboard/dagboek/DagboekPortieInvoer";
import DagboekProductDetail from "@/components/dashboard/dagboek/DagboekProductDetail";
import DagboekSubtabs, { type DagboekSectie } from "@/components/dashboard/dagboek/DagboekSubtabs";
import DagboekSupermarktSectie from "@/components/dashboard/dagboek/DagboekSupermarktSectie";
import DagboekVoedingWeektabel from "@/components/dashboard/dagboek/DagboekVoedingWeektabel";
import DagboekVergelijkTabel from "@/components/dashboard/dagboek/DagboekVergelijkTabel";
import DagboekVergelijkZoek, {
  MAX_VERGELIJK,
  type VergelijkResultaat,
} from "@/components/dashboard/dagboek/DagboekVergelijkZoek";
import DagboekWeekstrip, {
  meetdagenUit,
  weekRond,
} from "@/components/dashboard/dagboek/DagboekWeekstrip";
import SupermarktBronRegel from "@/components/dashboard/dagboek/SupermarktBronRegel";
import SupermarktPortieInvoer from "@/components/dashboard/dagboek/SupermarktPortieInvoer";
import VoedingswaardeTabel from "@/components/dashboard/dagboek/VoedingswaardeTabel";
import { berekenVoedingswaarde, nevoCodesVoorItems } from "@/lib/nutrition-voedingswaarde";
import { useNevoProducten } from "@/lib/use-nevo-producten";

/**
 * De vier toestanden van het scherm-achter-een-balk: overzicht (het bestaande
 * dagboek), detail (status + lijst per stof), zoek (catalogus) en portie
 * (aantal + eenheid, vlak vóór opslaan). Eén union in plaats van vier losse
 * booleans, zodat "welk scherm is actief" nooit tegenstrijdig kan worden.
 *
 * Bewust géén eigen App Router-route per stof: de rest van het dashboard
 * navigeert ook via in-memory state (zie `tab`/`domainView` in Dashboard.tsx),
 * en een sub-route zou de rail-conditie uit een later plak nodeloos
 * compliceren.
 */
type NutrientScherm =
  | { scherm: "overzicht" }
  | { scherm: "detail"; nutrient: NutrientId }
  | { scherm: "zoek"; nutrient: NutrientId | null; moment: EetmomentId }
  | {
      scherm: "portie";
      nutrient: NutrientId | null;
      bron: DagboekItemBron;
      key: string;
      moment: EetmomentId;
    }
  | {
      /**
       * Supermarktproduct-portie (Laag A) — eigen tak naast "portie" omdat
       * een supermarktproduct geen `DagboekItemBron`/`nutrient` draagt, zie
       * `nutrition-supermarkt-items.ts`.
       */
      scherm: "supermarktPortie";
      product: SupermarktProduct;
      moment: EetmomentId;
    }
  | { scherm: "product"; item: DagboekItem }
  | { scherm: "vergelijkZoek" }
  | { scherm: "vergelijk" };

/**
 * Het dagboek als eigen scherm: je week, je stand, je maaltijden.
 *
 * ## Waarom dit naast `NutritionDagboekPaneel` bestaat
 *
 * Dat paneel is gebouwd voor laag 5 van het leefstijlprofiel, waar het tussen
 * de meetreeks en de reflectie staat en dus compact moet zijn: vier slots, een
 * datumkiezer, een uitklapper. Die vorm werkt daar en is daar gebleven.
 *
 * Op een eigen tab is compact juist verkeerd. Dan is het dagboek niet een blok
 * in een reeks maar het scherm zelf, en heeft het ruimte voor wat het paneel
 * moest weglaten: de hele week in één blik, de stand per stof als ring, en de
 * maaltijden als tabellen waarin je verticaal kunt vergelijken.
 *
 * ## De volgorde is een argument
 *
 * Ringen boven, week eronder, maaltijden daaronder. Dat is van uitkomst naar
 * invoer, niet andersom — je opent dit scherm om te zien waar je staat, en
 * vult pas daarna aan. Een invoerformulier bovenaan zou van elke bezoek een
 * taak maken.
 */

const MAX_TREFFERS = 8;

/** De drie macro-velden die het "Macro's"-tabblad toont, uit `SUPERMARKT_MACRO_VELDEN`. */
const MACRO_VELDEN = new Set<SupermarktVeld>(["carbohydrateG", "fatG", "proteinG"]);

export default function DagboekScherm({
  checkSliders = null,
  proteinTarget = null,
}: {
  checkSliders?: Record<string, number> | null;
  proteinTarget?: ProteinTargetRange | null;
}) {
  void checkSliders;

  const vandaag = todayInAgendaTimezone();
  const [dagen, setDagen] = useState<DagboekDag[]>([]);
  const [datum, setDatum] = useState(vandaag);
  /**
   * Wat je op déze dag hebt staan, als afgeleide van `dagen` — met een lokale
   * override zodat een wijziging meteen zichtbaar is en niet pas na de POST.
   *
   * De override draagt zijn datum mee, zodat hij vanzelf vervalt bij het
   * wisselen van dag. Dat is de reden dat dit geen effect is: een effect dat
   * `items` bij elke dagwissel opnieuw zet, veroorzaakt een tweede render en
   * kan de invoer die je net deed overschrijven.
   */
  const [bewerkt, setBewerkt] = useState<{ datum: string; items: DagboekItem[] } | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  /**
   * Volgnummer van de laatste schrijving. Alleen het antwoord op het hoogste
   * nummer mag nog state zetten — zie `bewaar`.
   */
  const schrijfTeller = useRef(0);
  const [laden, setLaden] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scherm, setScherm] = useState<NutrientScherm>({ scherm: "overzicht" });
  const [favorieten, setFavorieten] = useState<DagboekFavoriet[]>([]);
  const [vergelijkSelectie, setVergelijkSelectie] = useState<VergelijkResultaat[]>([]);
  const [busyFavoriet, setBusyFavoriet] = useState(false);
  /**
   * Supermarkt-portie-logs (Laag A) — apart geladen en opgeslagen, net als
   * `favorieten`. Geen `DagboekItem`, geen deel van `bewerkt`/`bewaar()`: een
   * eigen tabel (`account_supermarkt_portie_logs`), zie
   * `nutrition-supermarkt-items.ts`.
   */
  const [supermarktLogs, setSupermarktLogs] = useState<SupermarktPortie[]>([]);
  const [busySupermarkt, setBusySupermarkt] = useState(false);

  /** Laag B: welk tabblad van het dagboek-overzicht actief is. */
  const [dagboekSectie, setDagboekSectie] = useState<DagboekSectie>("vandaag");
  /** Laag C: het zelf ingestelde macro/calorie-doel, apart geladen. */
  const [macroDoelen, setMacroDoelen] = useState<MacroDoelen>(LEGE_MACRO_DOELEN);
  /** Weeknavigatie voor de Voedingsstoffen/Macro's-tabbladen — los van `datum`. */
  const [weekOffset, setWeekOffset] = useState(0);
  /** Supermarkt-logs van de bekeken week, per datum — apart van `supermarktLogs` (dat is alleen de geselecteerde dag). */
  const [weekSupermarktLogs, setWeekSupermarktLogs] = useState<Map<string, SupermarktPortie[]>>(
    new Map(),
  );

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { days?: DagboekDag[] };
        if (afgebroken) return;
        setDagen(body.days ?? []);
      } catch {
        // Een mislukte GET laat het scherm leeg achter in plaats van kapot:
        // je kunt nog steeds een dag invullen, en die post apart.
        if (!afgebroken) setDagen([]);
      } finally {
        if (!afgebroken) setLaden(false);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const response = await fetch("/api/account/dagboek-favorieten", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { items?: DagboekFavoriet[] };
        if (!afgebroken) setFavorieten(body.items ?? []);
      } catch {
        // Zonder favorieten valt de tab terug op alleen geschiedenis — geen
        // reden om het hele scherm te laten mislukken.
        if (!afgebroken) setFavorieten([]);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/account/supermarkt-portie-logs?date=${encodeURIComponent(datum)}`,
          { credentials: "include" },
        );
        if (!response.ok) throw new Error("laden mislukt");
        const body = (await response.json()) as { items?: SupermarktPortie[] };
        if (!afgebroken) setSupermarktLogs(body.items ?? []);
      } catch {
        if (!afgebroken) setSupermarktLogs([]);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, [datum]);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      try {
        const doelen = await fetchMacroDoelen();
        if (!afgebroken) setMacroDoelen(doelen);
      } catch {
        // Zonder doel toont het weekoverzicht "geen doel ingesteld" — geen
        // reden om het hele scherm te laten mislukken.
        if (!afgebroken) setMacroDoelen(LEGE_MACRO_DOELEN);
      }
    })();
    return () => {
      afgebroken = true;
    };
  }, []);

  const bekekenWeekStart = useMemo(
    () => verschuifWeek(weekStart(vandaag), weekOffset),
    [vandaag, weekOffset],
  );
  const bekekenWeekDatums = useMemo(() => weekDatums(bekekenWeekStart), [bekekenWeekStart]);

  useEffect(() => {
    let afgebroken = false;
    void (async () => {
      const paren = await Promise.all(
        bekekenWeekDatums.map(async (dagDatum) => {
          try {
            const response = await fetch(
              `/api/account/supermarkt-portie-logs?date=${encodeURIComponent(dagDatum)}`,
              { credentials: "include" },
            );
            if (!response.ok) throw new Error("laden mislukt");
            const body = (await response.json()) as { items?: SupermarktPortie[] };
            return [dagDatum, body.items ?? []] as [string, SupermarktPortie[]];
          } catch {
            return [dagDatum, []] as [string, SupermarktPortie[]];
          }
        }),
      );
      if (!afgebroken) setWeekSupermarktLogs(new Map(paren));
    })();
    return () => {
      afgebroken = true;
    };
  }, [bekekenWeekDatums]);

  const isHuidigeBekekenWeek = weekOffset === 0;

  function bladerWeek(weken: number) {
    const volgendeOffset = weekOffset + weken;
    if (volgendeOffset > 0) return; // nooit de toekomst in
    setWeekOffset(volgendeOffset);
  }

  const items = useMemo(() => {
    if (bewerkt && bewerkt.datum === datum) return bewerkt.items;
    return sanitizeItems(dagen.find((dag) => dag.date === datum)?.items ?? []);
  }, [bewerkt, dagen, datum]);

  const week = useMemo(() => weekRond(datum), [datum]);
  const gevuldeDatums = useMemo(
    () => dagen.filter((dag) => (dag.items?.length ?? 0) > 0).map((dag) => dag.date),
    [dagen],
  );
  const meetdagen = useMemo(() => meetdagenUit(gevuldeDatums), [gevuldeDatums]);

  const stripDagen = useMemo(
    () =>
      week.map((dag) => ({
        datum: dag,
        gevuld: gevuldeDatums.includes(dag),
        meetdag: meetdagen.has(dag),
      })),
    [week, gevuldeDatums, meetdagen],
  );

  const ondergrens = useMemo(() => nutrientenGesplitstUitItems(items), [items]);
  const nevoCodes = useMemo(() => nevoCodesVoorItems(items), [items]);
  const weekItemsPerDag = useMemo(
    () =>
      new Map(
        bekekenWeekDatums.map((dagDatum) => [
          dagDatum,
          dagDatum === datum
            ? items
            : sanitizeItems(dagen.find((dag) => dag.date === dagDatum)?.items ?? []),
        ]),
      ),
    [bekekenWeekDatums, datum, items, dagen],
  );
  const alleNevoCodes = useMemo(
    () => [...new Set([...nevoCodes, ...nevoCodesVoorItems([...weekItemsPerDag.values()].flat())])].sort(),
    [nevoCodes, weekItemsPerDag],
  );
  const nevoProducten = useNevoProducten(alleNevoCodes);
  const dagVoedingswaarde = useMemo(
    () => berekenVoedingswaarde({ items, supermarktLogs, nevoProducten }),
    [items, supermarktLogs, nevoProducten],
  );
  const weekoverzicht = useMemo(() => {
    const perDag = new Map(
      bekekenWeekDatums.map((dagDatum) => [
        dagDatum,
        berekenVoedingswaarde({
          items: weekItemsPerDag.get(dagDatum) ?? [],
          supermarktLogs: weekSupermarktLogs.get(dagDatum) ?? [],
          nevoProducten,
        }),
      ]),
    );
    return bouwVoedingWeekoverzicht(perDag, bekekenWeekDatums, macroDoelen);
  }, [bekekenWeekDatums, weekItemsPerDag, weekSupermarktLogs, nevoProducten, macroDoelen]);
  const dagMacro = (veld: SupermarktVeld) =>
    dagVoedingswaarde.rijen.find((rij) => rij.veld === veld)?.waarde ?? null;

  /**
   * Zelfde "eerder gebruikt"-gedachte als `recent`, maar als ruwe items in
   * plaats van alleen `CatalogEntry` — de nutriëntdetail-zoekflow (plak C)
   * toont ook supplementen, en die heeft `bron` nodig om de juiste catalogus
   * te raadplegen.
   */
  const recenteItems = useMemo(() => {
    const gezien = new Set<string>();
    const uit: DagboekItem[] = [];
    for (const dag of [...dagen].sort((a, b) => b.date.localeCompare(a.date))) {
      for (const item of sanitizeItems(dag.items ?? [])) {
        const dedupSleutel = `${item.bron}:${item.key}`;
        if (gezien.has(dedupSleutel)) continue;
        gezien.add(dedupSleutel);
        uit.push(item);
        if (uit.length >= MAX_TREFFERS * 2) return uit;
      }
    }
    return uit;
  }, [dagen]);

  const bewaar = useCallback(
    async (volgende: DagboekItem[]) => {
      // Elke schrijving claimt een nummer; alleen de nieuwste mag het
      // resultaat nog neerzetten. Twee snelle toevoegingen (op mobiel niet
      // theoretisch: tik, tik) kunnen elkaar op een trage verbinding inhalen,
      // en dan zou een laat antwoord op een oud verzoek de nieuwere lijst
      // terugdraaien zonder dat er iets misging.
      const nummer = ++schrijfTeller.current;
      const isNieuwste = () => schrijfTeller.current === nummer;

      setBusy(true);
      setError(null);
      try {
        const response = await fetch("/api/account/nutrition-daybook", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: datum, items: volgende }),
        });
        if (!response.ok) throw new Error("Kon je dag niet opslaan.");
        if (!isNieuwste()) return;

        const nieuweDag: DagboekDag = {
          date: datum,
          soort: dagSoortVoor(datum),
          porties: portiesUitItems(volgende),
          items: volgende,
        };
        setDagen((vorige) => [nieuweDag, ...vorige.filter((d) => d.date !== datum)]);
        // De server heeft deze lijst nu; de lokale override mag weg. Laten
        // staan zou hem bij een volgende dagwissel alsnog kunnen terugzetten.
        setBewerkt((huidig) => (huidig?.datum === datum ? null : huidig));

        trackEvent("nutrition_dagboek_day_saved", {
          surface: "dagboek_tab",
          soort: nieuweDag.soort,
        });
        emitAccountClientEvent("nutrition.dagboek_day_saved", {
          day_kind: nieuweDag.soort,
          filled_days: gevuldeDatums.length,
          surface: "dagboek_tab",
        });
      } catch (cause) {
        if (!isNieuwste()) return;
        // Terugdraaien naar wat de server bevestigd heeft. Zonder dit bleef de
        // optimistische regel staan en zag je een product dat níét is
        // opgeslagen — bij een herlaadslag was het weg, zonder dat iets dat
        // aankondigde.
        setBewerkt((huidig) => (huidig?.datum === datum ? null : huidig));
        setError(cause instanceof Error ? cause.message : "Kon je dag niet opslaan.");
      } finally {
        if (isNieuwste()) setBusy(false);
      }
    },
    [datum, gevuldeDatums.length],
  );

  function wijzig(volgende: DagboekItem[]) {
    setBewerkt({ datum, items: volgende });
    void bewaar(volgende);
  }

  /**
   * Sluit de zoek+portie-flow af: schrijft het item en gaat terug naar de
   * zoeklijst. Werkt zowel vanuit een nutriëntdetail (`nutrient` gezet) als
   * vanuit een maaltijd (`nutrient` null) — in beide gevallen dezelfde route
   * terug, zodat een tweede product één tik verder is dan het eerste.
   */
  function voegNutrientItemToe(
    nutrient: NutrientId | null,
    bron: DagboekItemBron,
    key: string,
    moment: EetmomentId,
    grams: number,
  ) {
    wijzig([...items, { moment, bron, key, grams }]);
    emitAccountClientEvent("nutrition.dagboek_portie_bevestigd", {
      nutrient,
      bron,
      surface: "dagboek_tab",
    });
    trackEvent("nutrition_dagboek_portie_bevestigd", { nutrient: nutrient ?? "geen", bron });
    setScherm({ scherm: "zoek", nutrient, moment });
  }

  /** De ster-knop: optimistisch bijwerken, dan pas de server-call. */
  async function bewaarFavoriet(bron: DagboekItemBron, key: string) {
    setFavorieten((vorige) =>
      vorige.some((f) => f.bron === bron && f.key === key)
        ? vorige
        : [...vorige, { bron, key }],
    );
    setBusyFavoriet(true);
    try {
      await fetch("/api/account/dagboek-favorieten", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bron, key }),
      });
      emitAccountClientEvent("nutrition.dagboek_favoriet_toegevoegd", {
        bron,
        surface: "dagboek_tab",
      });
      trackEvent("nutrition_dagboek_favoriet_toegevoegd", { bron });
    } finally {
      setBusyFavoriet(false);
    }
  }

  async function verwijderFavoriet(bron: DagboekItemBron, key: string) {
    setFavorieten((vorige) => vorige.filter((f) => !(f.bron === bron && f.key === key)));
    setBusyFavoriet(true);
    try {
      await fetch(
        `/api/account/dagboek-favorieten?bron=${encodeURIComponent(bron)}&key=${encodeURIComponent(key)}`,
        { method: "DELETE", credentials: "include" },
      );
      emitAccountClientEvent("nutrition.dagboek_favoriet_verwijderd", {
        bron,
        surface: "dagboek_tab",
      });
      trackEvent("nutrition_dagboek_favoriet_verwijderd", { bron });
    } finally {
      setBusyFavoriet(false);
    }
  }

  const berekendeBronProducten = [
    ...alleNevoCodes.flatMap((code) => nevoProducten.get(`nevo:${code}`) ?? []),
    ...[...supermarktLogs, ...[...weekSupermarktLogs.values()].flat()].flatMap((log) =>
      log.product ? [log.product] : [],
    ),
  ];
  const dagBronProducten = [
    ...nevoCodes.flatMap((code) => nevoProducten.get(`nevo:${code}`) ?? []),
    ...supermarktLogs.flatMap((log) => (log.product ? [log.product] : [])),
  ];

  function kiesSectie(volgende: DagboekSectie) {
    setDagboekSectie(volgende);
    trackEvent("nutrition_dagboek_subtab_gekozen", { sectie: volgende });
  }

  const kransBijSelect = (nutrient: NutrientId) => {
    emitAccountClientEvent("nutrition.dagboek_nutrient_opened", {
      nutrient,
      surface: "dagboek_tab",
    });
    trackEvent("nutrition_dagboek_nutrient_opened", { nutrient });
    setScherm({ scherm: "detail", nutrient });
  };

  /**
   * Voegt een supermarktproduct-portie toe: optimistisch lokaal, dan de
   * server-call — zelfde vorm als `bewaarFavoriet`, niet als `bewaar()` (geen
   * schrijfteller/rollback nodig: een los log-event heeft geen dagbrede
   * consistentie te bewaken zoals `items`).
   */
  async function voegSupermarktPortieToe(moment: EetmomentId, product: SupermarktProduct, grams: number) {
    setBusySupermarkt(true);
    try {
      const response = await fetch("/api/account/supermarkt-portie-logs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: datum, moment, prodId: product.prodId, grams }),
      });
      if (!response.ok) throw new Error("Kon portie niet opslaan.");
      const body = (await response.json()) as { item?: SupermarktPortie };
      if (body.item) {
        setSupermarktLogs((vorige) => [...vorige, body.item as SupermarktPortie]);
      }
      emitAccountClientEvent("nutrition.dagboek_supermarkt_portie_bevestigd", {
        surface: "dagboek_tab",
        bron: product.bron,
      });
      trackEvent("nutrition_dagboek_supermarkt_portie_bevestigd", { bron: product.bron });
    } finally {
      setBusySupermarkt(false);
    }
  }

  async function verwijderSupermarktPortie(id: string) {
    setSupermarktLogs((vorige) => vorige.filter((log) => log.id !== id));
    setBusySupermarkt(true);
    try {
      await fetch(`/api/account/supermarkt-portie-logs?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });
    } finally {
      setBusySupermarkt(false);
    }
  }

  function toggleVergelijk(resultaat: VergelijkResultaat) {
    setVergelijkSelectie((vorige) => {
      const aanwezig = vorige.some(
        (r) => r.bron === resultaat.bron && r.entry.key === resultaat.entry.key,
      );
      if (aanwezig) {
        return vorige.filter(
          (r) => !(r.bron === resultaat.bron && r.entry.key === resultaat.entry.key),
        );
      }
      if (vorige.length >= MAX_VERGELIJK) return vorige;
      return [...vorige, resultaat];
    });
  }

  const dagLabel = new Date(datum).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Zoeken en portie-invoer delen één scherm: de portielaag ligt óver de
  // zoeklijst in plaats van ernaast. Een maaltijd is zelden één product, en zo
  // is het tweede product één tik verder dan het eerste in plaats van de hele
  // route terug.
  // Eigen, volledig scherm — geen laag over de zoeklijst zoals "portie": de
  // MyFitnessPal-vorm (27 sep) toont rijen (maaltijd/porties/portiegrootte)
  // vóór de ring, en dat leest beter als eigen pagina dan als overlay.
  if (scherm.scherm === "supermarktPortie") {
    return (
      <SupermarktPortieInvoer
        product={scherm.product}
        moment={scherm.moment}
        busy={busySupermarkt}
        onTerug={() => setScherm({ scherm: "zoek", nutrient: null, moment: scherm.moment })}
        onBevestig={(gekozenMoment, grams) => {
          void voegSupermarktPortieToe(gekozenMoment, scherm.product, grams);
          setScherm({ scherm: "zoek", nutrient: null, moment: gekozenMoment });
        }}
      />
    );
  }

  // Voeding krijgt dezelfde volledige rijen als een NEVO-product; een supplement
  // blijft een laag over de zoeklijst (hele porties, geen gram).
  if (scherm.scherm === "portie" && scherm.bron === "voeding") {
    const { nutrient, moment: portieMoment, key } = scherm;
    return (
      <DagboekVoedingPortie
        itemKey={key}
        nutrient={nutrient}
        moment={portieMoment}
        favorieten={favorieten}
        busy={busy}
        busyFavoriet={busyFavoriet}
        onBewaarFavoriet={(bron, k) => void bewaarFavoriet(bron, k)}
        onVerwijderFavoriet={(bron, k) => void verwijderFavoriet(bron, k)}
        onTerug={() => setScherm({ scherm: "zoek", nutrient, moment: portieMoment })}
        onBevestig={(gekozenMoment, grams) =>
          voegNutrientItemToe(nutrient, "voeding", key, gekozenMoment, grams)
        }
      />
    );
  }

  if (scherm.scherm === "zoek" || scherm.scherm === "portie") {
    const moment = scherm.moment;
    const nutrient = scherm.nutrient;
    return (
      <>
        <DagboekCatalogusZoek
          nutrient={nutrient}
          eerderGebruikt={recenteItems}
          favorieten={favorieten}
          moment={moment}
          onMomentChange={(volgende) => setScherm({ ...scherm, moment: volgende })}
          onTerug={() =>
            setScherm(nutrient ? { scherm: "detail", nutrient } : { scherm: "overzicht" })
          }
          onKies={(bron, key) => {
            emitAccountClientEvent("nutrition.dagboek_zoek_item_gekozen", {
              nutrient,
              bron,
              surface: "dagboek_tab",
            });
            trackEvent("nutrition_dagboek_zoek_item_gekozen", { nutrient: nutrient ?? "geen", bron });
            setScherm({ scherm: "portie", nutrient, bron, key, moment });
          }}
          onKiesSupermarkt={(product) => {
            setScherm({ scherm: "supermarktPortie", product, moment });
          }}
          onBewaarFavoriet={(bron, key) => void bewaarFavoriet(bron, key)}
          onVerwijderFavoriet={(bron, key) => void verwijderFavoriet(bron, key)}
          busyFavoriet={busyFavoriet}
        />

        {scherm.scherm === "portie" && scherm.bron === "supplement" ? (
          <DagboekPortieInvoer
            itemKey={scherm.key}
            nutrient={nutrient}
            moment={moment}
            favorieten={favorieten}
            busy={busy}
            busyFavoriet={busyFavoriet}
            onBewaarFavoriet={(bron, key) => void bewaarFavoriet(bron, key)}
            onVerwijderFavoriet={(bron, key) => void verwijderFavoriet(bron, key)}
            onTerug={() => setScherm({ scherm: "zoek", nutrient, moment })}
            onBevestig={(gekozenMoment, grams) =>
              voegNutrientItemToe(nutrient, "supplement", scherm.key, gekozenMoment, grams)
            }
          />
        ) : null}
      </>
    );
  }

  if (scherm.scherm === "product") {
    return (
      <DagboekProductDetail
        item={scherm.item}
        busy={busy}
        onTerug={() => setScherm({ scherm: "overzicht" })}
        onVerwijder={(item) => {
          wijzig(items.filter((i) => i !== item));
          setScherm({ scherm: "overzicht" });
        }}
      />
    );
  }

  if (scherm.scherm === "vergelijkZoek") {
    return (
      <DagboekVergelijkZoek
        eerderGebruikt={recenteItems}
        geselecteerd={vergelijkSelectie}
        onToggle={toggleVergelijk}
        onTerug={() => setScherm({ scherm: "overzicht" })}
        onVergelijk={() => {
          trackEvent("nutrition_dagboek_vergelijk_gestart", {
            aantal: vergelijkSelectie.length,
          });
          emitAccountClientEvent("nutrition.dagboek_vergelijk_gestart", {
            aantal: vergelijkSelectie.length,
            surface: "dagboek_tab",
          });
          setScherm({ scherm: "vergelijk" });
        }}
      />
    );
  }

  if (scherm.scherm === "vergelijk") {
    return (
      <DagboekVergelijkTabel
        producten={vergelijkSelectie}
        onTerug={() => setScherm({ scherm: "vergelijkZoek" })}
        onVerwijder={(resultaat) => {
          toggleVergelijk(resultaat);
          if (vergelijkSelectie.length <= 2) setScherm({ scherm: "vergelijkZoek" });
        }}
      />
    );
  }

  if (scherm.scherm === "detail") {
    return (
      <DagboekNutrientDetail
        nutrient={scherm.nutrient}
        items={items}
        stof={ondergrens.find((s) => s.nutrient === scherm.nutrient)}
        busy={busy}
        onTerug={() => setScherm({ scherm: "overzicht" })}
        onVoegToe={() =>
          setScherm({ scherm: "zoek", nutrient: scherm.nutrient, moment: "ontbijt" })
        }
        onVerwijder={(item) => wijzig(items.filter((i) => i !== item))}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-serif text-[19px] font-normal text-[var(--vd-ink)]">Je dag</h2>
        <span className="flex items-center gap-2.5">
          <span className="text-[11px] capitalize text-[var(--vd-ink-3)]">{dagLabel}</span>
          <button
            type="button"
            onClick={() => {
              trackEvent("nutrition_dagboek_vergelijk_geopend", {});
              setScherm({ scherm: "vergelijkZoek" });
            }}
            className="cursor-pointer whitespace-nowrap rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1 text-[11px] font-semibold text-[var(--vd-ink-2)] transition-colors hover:border-[var(--vd-sage)] hover:text-[var(--vd-sage-2)]"
          >
            Vergelijk producten
          </button>
        </span>
      </header>

      <DagboekSubtabs
        actief={dagboekSectie}
        onKies={kiesSectie}
      />

      {dagboekSectie === "vandaag" ? (
        <div
          id="dagboek-subtab-paneel-vandaag"
          role="tabpanel"
          aria-labelledby="dagboek-subtab-vandaag"
          className="flex flex-col gap-4"
        >
          <DagboekKrans
            stoffen={ondergrens}
            proteinTarget={proteinTarget}
            onSelect={kransBijSelect}
            onBegin={() => {
              emitAccountClientEvent("nutrition.dagboek_maaltijd_geopend", {
                moment: "ontbijt",
                surface: "dagboek_tab",
              });
              trackEvent("nutrition_dagboek_maaltijd_geopend", { moment: "ontbijt" });
              setScherm({ scherm: "zoek", nutrient: null, moment: "ontbijt" });
            }}
          />

          {ondergrens.length > 0 || supermarktLogs.length > 0 ? (
            <button
              type="button"
              onClick={() => kiesSectie("voedingsstoffen")}
              className="cursor-pointer self-center text-[12px] font-semibold text-[var(--vd-sage-2)] underline-offset-2 hover:underline"
            >
              Alle voedingsstoffen van deze dag →
            </button>
          ) : null}

          {ondergrens.length === 0 ? (
            <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--vd-ink-3)]">
              {laden
                ? "Je dagboek wordt geladen…"
                : "Nog niets geregistreerd voor deze dag. Zodra je een product toevoegt, staat hier wat het minstens levert."}
            </p>
          ) : null}

          <DagboekWeekstrip
            dagen={stripDagen}
            geselecteerd={datum}
            onSelecteer={setDatum}
            busy={busy}
          />

          <div id="dagboek-eetmomenten" className="flex flex-col gap-2.5">
            {EETMOMENTEN.map((moment) => (
              <DagboekMaaltijd
                key={moment.id}
                moment={moment.id}
                label={moment.label}
                items={items}
                busy={busy}
                onToevoegen={(id) => {
                  emitAccountClientEvent("nutrition.dagboek_maaltijd_geopend", {
                    moment: id,
                    surface: "dagboek_tab",
                  });
                  trackEvent("nutrition_dagboek_maaltijd_geopend", { moment: id });
                  setScherm({ scherm: "zoek", nutrient: null, moment: id });
                }}
                onGram={(item, grams) =>
                  wijzig(
                    items.map((i) =>
                      i === item ? { ...i, grams: Math.max(1, Math.trunc(grams) || 1) } : i,
                    ),
                  )
                }
                onVerwijder={(item) => wijzig(items.filter((i) => i !== item))}
                onOpenProduct={(item) => {
                  emitAccountClientEvent("nutrition.dagboek_product_geopend", {
                    bron: item.bron,
                    surface: "dagboek_tab",
                  });
                  trackEvent("nutrition_dagboek_product_geopend", { bron: item.bron });
                  setScherm({ scherm: "product", item });
                }}
              />
            ))}
          </div>

          <DagboekSupermarktSectie
            logs={supermarktLogs}
            busy={busySupermarkt}
            onVerwijder={(id) => void verwijderSupermarktPortie(id)}
          />

          {error ? (
            <p role="status" className="m-0 text-[11.5px] leading-relaxed text-[var(--vd-terra)]">
              {error}
            </p>
          ) : null}

          {ondergrens.length > 0 ? (
            <p className="m-0 rounded-xl border-l-2 border-[var(--vd-sage)] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[var(--vd-ink-2)]">
              <strong className="font-bold text-[var(--vd-ink)]">
                Alles hier is een ondergrens.
              </strong>{" "}
              Niemand noemt alles — de koffie, de olijfolie, het broodje dat je
              vergat. Wat je niet registreerde kan er alleen bij komen, nooit af.
              Daarom staat er &ldquo;minstens&rdquo; en nooit een tekort.
            </p>
          ) : null}
        </div>
      ) : dagboekSectie === "voedingsstoffen" ? (
        <div
          id="dagboek-subtab-paneel-voedingsstoffen"
          role="tabpanel"
          aria-labelledby="dagboek-subtab-voedingsstoffen"
          className="flex flex-col gap-4"
        >
          <DagboekWeekstrip
            dagen={stripDagen}
            geselecteerd={datum}
            onSelecteer={setDatum}
            busy={busy}
          />
          <DagboekKrans
            stoffen={ondergrens}
            proteinTarget={proteinTarget}
            onSelect={kransBijSelect}
            onBegin={() => setScherm({ scherm: "zoek", nutrient: null, moment: "ontbijt" })}
          />
          <VoedingswaardeTabel
            titel="Alles wat je at"
            toelichting={dagLabel}
            voedingswaarde={dagVoedingswaarde}
            bronProducten={dagBronProducten}
          />
          <DagboekVoedingWeektabel
            overzicht={weekoverzicht}
            rijen={weekoverzicht.rijen}
            onVorigeWeek={() => bladerWeek(-1)}
            onVolgendeWeek={() => bladerWeek(1)}
            isHuidigeWeek={isHuidigeBekekenWeek}
          />
          <SupermarktBronRegel producten={berekendeBronProducten} berekend />
        </div>
      ) : (
        <div
          id="dagboek-subtab-paneel-macros"
          role="tabpanel"
          aria-labelledby="dagboek-subtab-macros"
          className="flex flex-col gap-4"
        >
          <DagboekWeekstrip
            dagen={stripDagen}
            geselecteerd={datum}
            onSelecteer={setDatum}
            busy={busy}
          />

          <DagboekMacroRing
            kcal={dagMacro("energyKcal")}
            segmenten={[
              {
                key: "koolhydraten",
                label: "Koolhydraten",
                gram: dagMacro("carbohydrateG"),
                kcalPerGram: 4,
                kleur: MACRO_RING_KLEUREN.koolhydraten,
              },
              {
                key: "vet",
                label: "Vet",
                gram: dagMacro("fatG"),
                kcalPerGram: 9,
                kleur: MACRO_RING_KLEUREN.vet,
              },
              {
                key: "eiwit",
                label: "Eiwit",
                gram: dagMacro("proteinG"),
                kcalPerGram: 4,
                kleur: MACRO_RING_KLEUREN.eiwit,
              },
            ]}
          />

          <DagboekSupermarktSectie
            logs={supermarktLogs}
            busy={busySupermarkt}
            onVerwijder={(id) => void verwijderSupermarktPortie(id)}
          />

          <DagboekVoedingWeektabel
            overzicht={weekoverzicht}
            rijen={weekoverzicht.rijen.filter((rij) => MACRO_VELDEN.has(rij.veld))}
            onVorigeWeek={() => bladerWeek(-1)}
            onVolgendeWeek={() => bladerWeek(1)}
            isHuidigeWeek={isHuidigeBekekenWeek}
          />
          <SupermarktBronRegel producten={berekendeBronProducten} berekend />
        </div>
      )}
    </div>
  );
}
