"use client";

import { useEffect, useState } from "react";
import * as Icons from "@/components/app/icons";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { fetchAgendaBlocks } from "@/lib/agenda-blocks-client";
import { addAgendaDays, todayInAgendaTimezone } from "@/lib/agenda-week-preview";
import { clarityTag } from "@/lib/clarity";
import { trackEvent } from "@/lib/ga4";
import {
  reflectieNaklank,
  reflectieReeksRegel,
  reflectieVraag,
  resolveReflectieMoment,
  REFLECTIE_OPTIES,
  REFLECTIE_WINDOW_DAYS,
  type ReflectieAntwoord,
  type ReflectieMoment,
} from "@/lib/nutrition-reflectie";

/**
 * "Hoe ging het?" — de weg terug van een gepland moment naar je voortgang.
 *
 * Staat op P5 (Meten & timing), naast de eigen reeks. Dat is de laag die over
 * verandering gaat, en een terugblik op wat je deed hoort daar eerder thuis
 * dan bij de feiten uit je check: die zeggen wat je eet, dit zegt wat je
 * probeerde.
 *
 * ## Waarom dit component zijn eigen blokken laadt
 *
 * `LadderMomentsProvider` kijkt vooruit (vandaag → +28 dagen) omdat hij één
 * vraag beantwoordt: staat er al een moment voor deze actie. Reflectie kijkt
 * precies de andere kant op. Die twee vensters in één provider persen zou de
 * planknop blokken laten laden die hij nooit gebruikt, op elk domeinscherm.
 *
 * ## Wat het niet doet
 *
 * Geen score, geen streak, geen inhaalvraag. Wie niet antwoordt krijgt bij de
 * volgende keer hetzelfde blok nog één keer te zien en daarna niet meer — het
 * venster in `resolveReflectieMoment` sluit vanzelf.
 */
export default function NutritionReflectiePaneel({ surface }: { surface: string }) {
  const [moment, setMoment] = useState<ReflectieMoment | null>(null);
  const [reeks, setReeks] = useState<ReflectieAntwoord[]>([]);
  const [gegeven, setGegeven] = useState<ReflectieAntwoord | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const today = todayInAgendaTimezone();
    const startDate = addAgendaDays(today, -REFLECTIE_WINDOW_DAYS);

    // Twee bronnen, één beeld: welke blokken lagen achter je, en op welke keek
    // je al terug. Setten gebeurt in de callback en niet in de effect-body —
    // zelfde vorm als LadderMomentsProvider, om cascading renders te vermijden.
    Promise.all([
      fetchAgendaBlocks(startDate, today),
      fetch("/api/account/action-reflections?domain=voeding", { credentials: "include" })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null),
    ])
      .then(([blocks, opgeslagen]) => {
        if (cancelled) return;
        const beantwoord = new Set<string>(
          Array.isArray(opgeslagen?.answeredBlockIds) ? opgeslagen.answeredBlockIds : [],
        );
        setReeks(Array.isArray(opgeslagen?.answers) ? opgeslagen.answers : []);
        setMoment(resolveReflectieMoment(blocks, beantwoord, today));
      })
      // Uitgelogd of nog geen agenda: dan is er niets om op terug te kijken,
      // en dat is een geldig antwoord — het paneel blijft dan leeg.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!moment) return;
    trackEvent("nutrition_reflectie_view", { surface, afgevinkt: moment.afgevinkt });
    emitAccountClientEvent("nutrition.reflectie_shown", {
      block_date: moment.date,
      afgevinkt: moment.afgevinkt,
      surface,
    });
    clarityTag("nutrition_reflectie", surface);
  }, [moment, surface]);

  async function antwoord(keuze: ReflectieAntwoord) {
    if (!moment || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/action-reflections", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block_id: moment.blockId,
          domain: "voeding",
          answer: keuze,
        }),
      });
      if (!response.ok) {
        throw new Error("Kon je terugblik niet opslaan.");
      }
      trackEvent("nutrition_reflectie_answered", { surface, answer: keuze });
      emitAccountClientEvent("nutrition.reflectie_answered", {
        answer: keuze,
        afgevinkt: moment.afgevinkt,
        surface,
      });
      setGegeven(keuze);
      setReeks((current) => [keuze, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Kon je terugblik niet opslaan.");
    } finally {
      setBusy(false);
    }
  }

  const reeksRegel = reflectieReeksRegel(reeks);

  // Niets om op terug te kijken en niets om te melden: dan geen leeg kader.
  if (!moment && !reeksRegel) {
    return null;
  }

  return (
    <section
      aria-label="Terugblik op je geplande momenten"
      className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3.5"
    >
      <h4 className="m-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9FB0A6]">
        Terugblik
      </h4>

      {moment && !gegeven ? (
        <>
          <p className="m-0 mt-2 max-w-[58ch] text-[13px] leading-relaxed text-[#E7EDE8] text-pretty">
            {reflectieVraag(moment)}
          </p>
          <p className="m-0 mt-1 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
            {moment.title}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {REFLECTIE_OPTIES.map((optie) => (
              <button
                key={optie.id}
                type="button"
                disabled={busy}
                onClick={() => void antwoord(optie.id)}
                className="inline-flex min-h-9 cursor-pointer items-center rounded-full border border-white/15 bg-white/[0.03] px-3 text-[12px] font-medium text-[#9FB0A6] transition-colors hover:border-white/30 hover:text-[#E7EDE8] disabled:opacity-60"
              >
                {optie.label}
              </button>
            ))}
          </div>
          {error ? (
            <p role="status" className="mt-2 text-[11.5px] leading-relaxed text-[#C8956C]">
              {error}
            </p>
          ) : null}
        </>
      ) : null}

      {gegeven ? (
        <p className="m-0 mt-2 flex max-w-[58ch] items-start gap-1.5 text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          <span aria-hidden className="mt-[2px] shrink-0 text-[#9CC5A9]">
            <Icons.Check s={13} />
          </span>
          {reflectieNaklank(gegeven)}
        </p>
      ) : null}

      {reeksRegel && !moment ? (
        <p className="m-0 mt-2 max-w-[58ch] text-[12px] leading-relaxed text-[#9FB0A6] text-pretty">
          {reeksRegel}
        </p>
      ) : null}
    </section>
  );
}
