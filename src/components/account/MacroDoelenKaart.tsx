"use client";

import { useEffect, useState } from "react";
import { Button, Card, TextField } from "@/components/app/primitives";
import { trackEvent } from "@/lib/ga4";
import {
  isGeldigPercentage,
  isGeldigeCalorieen,
  type MacroDoelen,
} from "@/lib/account-macro-doelen";
import { fetchMacroDoelen, postMacroDoelen } from "@/lib/macro-doelen-client";

/**
 * Je eigen macro/calorie-doel — 100% wat je hier zelf invult.
 *
 * ## Waarom dit geen richtlijn toont zoals de eiwitkaart ernaast
 *
 * `VoedingsdoelenKaart` toont een server-gerekende richtlijn naast het
 * eiwitdoel, want die richtlijn komt uit een gepubliceerde formule
 * (PROT-AGE/ESPEN). Voor calorieën/macro's bestaat die formule hier niet: het
 * systeem berekent niets voor (zie
 * `docs/plan/BESLUIT_MACRO_MICRONUTRIENT_UITBREIDING_2026-09.md` §4). Leeg
 * betekent dus "nog niet ingesteld", nooit een vooringevulde vuistregel zoals
 * 50/30/20, en de copy zegt "jouw ingestelde verdeling", nooit "aanbevolen"
 * of "optimaal".
 *
 * ## Waarom er geen som-check op de percentages zit
 *
 * Een controle dat de drie percentages optellen tot 100 zou dit scherm laten
 * corrigeren wat iemand invulde — zelf een vorm van berekenen. Elk veld staat
 * los.
 */

const SURFACE = "macro_doelen";

type Status =
  | { fase: "laden" }
  | { fase: "klaar"; doelen: MacroDoelen }
  | { fase: "fout"; bericht: string };

function leesGetal(invoer: string): number | null {
  const tekst = invoer.trim();
  if (tekst === "") return null;
  const waarde = Number.parseInt(tekst, 10);
  return Number.isFinite(waarde) ? waarde : null;
}

function toonGetal(waarde: number | null): string {
  return waarde === null ? "" : String(waarde);
}

export default function MacroDoelenKaart() {
  const [status, setStatus] = useState<Status>({ fase: "laden" });
  const [calorieenInvoer, setCalorieenInvoer] = useState("");
  const [koolhydratenInvoer, setKoolhydratenInvoer] = useState("");
  const [vetInvoer, setVetInvoer] = useState("");
  const [eiwitInvoer, setEiwitInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [bewaard, setBewaard] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  function neemOver(doelen: MacroDoelen) {
    setStatus({ fase: "klaar", doelen });
    setCalorieenInvoer(toonGetal(doelen.calorieenKcal));
    setKoolhydratenInvoer(toonGetal(doelen.koolhydratenPct));
    setVetInvoer(toonGetal(doelen.vetPct));
    setEiwitInvoer(toonGetal(doelen.eiwitPct));
  }

  useEffect(() => {
    let actief = true;
    fetchMacroDoelen()
      .then((geladen) => {
        if (!actief) return;
        neemOver(geladen);
      })
      .catch((error: unknown) => {
        if (!actief) return;
        setStatus({
          fase: "fout",
          bericht: error instanceof Error ? error.message : "Kon je macro-doel niet laden.",
        });
      });
    return () => {
      actief = false;
    };
  }, []);

  async function bewaar(patch: Partial<MacroDoelen>, setting: string) {
    setBezig(true);
    setFout(null);
    setBewaard(false);
    try {
      neemOver(await postMacroDoelen(patch));
      setBewaard(true);
      trackEvent("macro_doel_aangepast", { setting, surface: SURFACE });
    } catch (error: unknown) {
      setFout(error instanceof Error ? error.message : "Kon je macro-doel niet opslaan.");
    } finally {
      setBezig(false);
    }
  }

  if (status.fase === "laden") {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
          Je macro-doel wordt geladen…
        </p>
      </Card>
    );
  }

  if (status.fase === "fout") {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--text)", fontSize: 14 }}>{status.bericht}</p>
      </Card>
    );
  }

  const calorieenWaarde = leesGetal(calorieenInvoer);
  const koolhydratenWaarde = leesGetal(koolhydratenInvoer);
  const vetWaarde = leesGetal(vetInvoer);
  const eiwitWaarde = leesGetal(eiwitInvoer);
  const calorieenOngeldig =
    calorieenInvoer.trim() !== "" && !isGeldigeCalorieen(calorieenWaarde);
  const koolhydratenOngeldig =
    koolhydratenInvoer.trim() !== "" && !isGeldigPercentage(koolhydratenWaarde);
  const vetOngeldig = vetInvoer.trim() !== "" && !isGeldigPercentage(vetWaarde);
  const eiwitOngeldig = eiwitInvoer.trim() !== "" && !isGeldigPercentage(eiwitWaarde);

  return (
    <Card>
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
            Je macro-doel
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--text-muted)" }}>
            Jouw ingestelde verdeling — wij rekenen hier niets voor uit. Leeg
            laten betekent: nog niet ingesteld.
          </p>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Calorierichtlijn (optioneel)"
            value={calorieenInvoer}
            onChange={setCalorieenInvoer}
            placeholder="bijv. 2200"
            inputMode="numeric"
            hint={
              calorieenOngeldig
                ? "Vul een richtlijn tussen 500 en 6000 kcal in."
                : "In kcal per dag. Leeg laten betekent: geen richtlijn ingesteld."
            }
          />
          <Button
            variant="secondary"
            disabled={bezig || calorieenOngeldig}
            onClick={() => void bewaar({ calorieenKcal: calorieenWaarde }, "calorieen")}
          >
            Calorierichtlijn opslaan
          </Button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Koolhydraten (%, optioneel)"
            value={koolhydratenInvoer}
            onChange={setKoolhydratenInvoer}
            placeholder="bijv. 50"
            inputMode="numeric"
            hint={
              koolhydratenOngeldig
                ? "Vul een percentage tussen 0 en 100 in."
                : "Jouw eigen verdeling — geen vereiste dat de drie percentages optellen tot 100."
            }
          />
          <Button
            variant="secondary"
            disabled={bezig || koolhydratenOngeldig}
            onClick={() =>
              void bewaar({ koolhydratenPct: koolhydratenWaarde }, "koolhydraten")
            }
          >
            Koolhydraten opslaan
          </Button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Vet (%, optioneel)"
            value={vetInvoer}
            onChange={setVetInvoer}
            placeholder="bijv. 30"
            inputMode="numeric"
            hint={vetOngeldig ? "Vul een percentage tussen 0 en 100 in." : undefined}
          />
          <Button
            variant="secondary"
            disabled={bezig || vetOngeldig}
            onClick={() => void bewaar({ vetPct: vetWaarde }, "vet")}
          >
            Vet opslaan
          </Button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Eiwit (%, optioneel)"
            value={eiwitInvoer}
            onChange={setEiwitInvoer}
            placeholder="bijv. 20"
            inputMode="numeric"
            hint={eiwitOngeldig ? "Vul een percentage tussen 0 en 100 in." : undefined}
          />
          <Button
            variant="secondary"
            disabled={bezig || eiwitOngeldig}
            onClick={() => void bewaar({ eiwitPct: eiwitWaarde }, "eiwit")}
          >
            Eiwit opslaan
          </Button>
        </div>

        {fout ? (
          <p role="alert" style={{ margin: 0, fontSize: 13, color: "var(--terra, #b4543a)" }}>
            {fout}
          </p>
        ) : bewaard ? (
          <p role="status" style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Opgeslagen.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
