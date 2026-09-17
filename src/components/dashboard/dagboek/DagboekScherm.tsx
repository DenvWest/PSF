"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { catalogEntry, searchCatalog } from "@/data/nutrition/food-catalog";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { trackEvent } from "@/lib/ga4";
import { dagSoortVoor, type DagboekDag } from "@/lib/nutrition-dagboek";
import {
  nutrientenUitItems,
  portiesUitItems,
  sanitizeItems,
  type DagboekItem,
} from "@/lib/nutrition-dagboek-items";
import { EETMOMENTEN, type EetmomentId } from "@/lib/nutrition-eetmomenten";
import DagboekMaaltijd from "@/components/dashboard/dagboek/DagboekMaaltijd";
import DagboekRingen from "@/components/dashboard/dagboek/DagboekRingen";
import DagboekWeekstrip, {
  meetdagenUit,
  weekRond,
} from "@/components/dashboard/dagboek/DagboekWeekstrip";

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

export default function DagboekScherm({
  checkSliders = null,
}: {
  checkSliders?: Record<string, number> | null;
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
  const [laden, setLaden] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoekMoment, setZoekMoment] = useState<EetmomentId | null>(null);
  const [zoek, setZoek] = useState("");

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

  const ondergrens = useMemo(() => nutrientenUitItems(items), [items]);
  const treffers = useMemo(
    () => (zoek.trim() ? searchCatalog(zoek, MAX_TREFFERS) : []),
    [zoek],
  );

  const bewaar = useCallback(
    async (volgende: DagboekItem[]) => {
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

        const nieuweDag: DagboekDag = {
          date: datum,
          soort: dagSoortVoor(datum),
          porties: portiesUitItems(volgende),
          items: volgende,
        };
        setDagen((vorige) => [nieuweDag, ...vorige.filter((d) => d.date !== datum)]);

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
        setError(cause instanceof Error ? cause.message : "Kon je dag niet opslaan.");
      } finally {
        setBusy(false);
      }
    },
    [datum, gevuldeDatums.length],
  );

  function wijzig(volgende: DagboekItem[]) {
    setBewerkt({ datum, items: volgende });
    void bewaar(volgende);
  }

  function voegToe(key: string) {
    if (!zoekMoment || !catalogEntry(key)) return;
    const entry = catalogEntry(key)!;
    const grams = entry.porties[0]?.grams ?? 100;
    wijzig([...items, { moment: zoekMoment, key, grams }]);
    setZoek("");
    setZoekMoment(null);
  }

  const dagLabel = new Date(datum).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="m-0 font-serif text-[19px] font-normal text-[#F1EFE8]">Je dag</h2>
        <span className="text-[11px] capitalize text-[#7E8C82]">{dagLabel}</span>
      </header>

      {ondergrens.length > 0 ? (
        <DagboekRingen stoffen={ondergrens} />
      ) : (
        <p className="m-0 rounded-2xl border border-white/8 bg-white/[0.02] px-3.5 py-3 text-[12px] leading-relaxed text-[#7E8C82]">
          {laden
            ? "Je dagboek wordt geladen…"
            : "Nog niets geregistreerd voor deze dag. Zodra je een product toevoegt, staat hier wat het minstens levert."}
        </p>
      )}

      <DagboekWeekstrip
        dagen={stripDagen}
        geselecteerd={datum}
        onSelecteer={setDatum}
        busy={busy}
      />

      {zoekMoment ? (
        <div className="relative">
          <input
            type="search"
            autoFocus
            value={zoek}
            disabled={busy}
            onChange={(event) => setZoek(event.target.value)}
            onBlur={() => window.setTimeout(() => setZoekMoment(null), 150)}
            placeholder={`Zoek een product voor ${
              EETMOMENTEN.find((m) => m.id === zoekMoment)?.label.toLowerCase() ?? ""
            }…`}
            aria-label="Zoek een product"
            className="w-full rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-[13px] text-[#F1EFE8] outline-none transition-colors placeholder:text-[#6F8177] focus:border-white/40"
          />
          {treffers.length > 0 ? (
            <ul className="absolute z-20 m-0 mt-1 w-full list-none overflow-hidden rounded-xl border border-white/15 bg-[#16241a] p-0 shadow-2xl">
              {treffers.map((entry) => (
                <li key={entry.key}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => voegToe(entry.key)}
                    className="flex w-full cursor-pointer items-baseline justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-white/[0.06]"
                  >
                    <span className="text-[13px] text-[#F1EFE8]">{entry.labelNl}</span>
                    <span className="text-[10.5px] text-[#6F8177]">
                      {entry.porties[0]?.labelNl ?? ""}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {EETMOMENTEN.map((moment) => (
          <DagboekMaaltijd
            key={moment.id}
            moment={moment.id}
            label={moment.label}
            items={items}
            busy={busy}
            onToevoegen={(id) => {
              setZoekMoment(id);
              setZoek("");
            }}
            onGram={(item, grams) =>
              wijzig(
                items.map((i) =>
                  i === item ? { ...i, grams: Math.max(1, Math.trunc(grams) || 1) } : i,
                ),
              )
            }
            onVerwijder={(item) => wijzig(items.filter((i) => i !== item))}
          />
        ))}
      </div>

      {error ? (
        <p role="status" className="m-0 text-[11.5px] leading-relaxed text-[#C8956C]">
          {error}
        </p>
      ) : null}

      {ondergrens.length > 0 ? (
        <p className="m-0 rounded-xl border-l-2 border-[#5A8F6A] bg-white/[0.03] px-3 py-2.5 text-[11.5px] leading-relaxed text-[#9FB0A6]">
          <strong className="font-bold text-[#F1EFE8]">
            Alles hier is een ondergrens.
          </strong>{" "}
          Niemand noemt alles — de koffie, de olijfolie, het broodje dat je
          vergat. Wat je niet registreerde kan er alleen bij komen, nooit af.
          Daarom staat er &ldquo;minstens&rdquo; en nooit een tekort.
        </p>
      ) : null}
    </div>
  );
}
