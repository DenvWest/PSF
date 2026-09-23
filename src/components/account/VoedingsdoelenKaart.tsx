"use client";

import { useEffect, useState } from "react";
import { Button, Card, TextField } from "@/components/app/primitives";
import { trackEvent } from "@/lib/ga4";
import {
  isGeldigEiwitDoel,
  isGeldigGewicht,
  type Voedingsdoelen,
  type VoedingsdoelenWeergave,
} from "@/lib/account-voedingsdoelen";
import { fetchVoedingsdoelen, postVoedingsdoelen } from "@/lib/voedingsdoelen-client";

/**
 * Je eigen voedingsdoelen: gewicht, hoe zwaar je traint, en een eiwitdoel.
 *
 * ## Waarom de richtlijn van de server komt
 *
 * Het gewicht uit je check blijft server-side — dezelfde regel die
 * `DashboardData` aanhoudt ("nooit het ruwe gewicht — alleen de afgeleide
 * range bereikt de client"). Deze kaart krijgt dus de uitgerekende range
 * binnen, niet de ingrediënten, en haalt na elke wijziging een nieuwe op.
 *
 * Dat betekent dat de richtlijn pas meebeweegt ná opslaan en niet tijdens het
 * typen. Dat is het eerlijke ruilpunt: een live meerekenende richtlijn zou het
 * check-gewicht in de browser vereisen.
 *
 * ## Waarom het eiwitdoel standaard leeg blijft
 *
 * De richtlijn komt uit `protein-target.ts`, dat met gewicht, belasting en
 * leeftijd rekent (PROT-AGE/ESPEN). Een vooringevuld getal zou die afleiding
 * stilzetten op de dag dat je het scherm opende.
 *
 * Het veld is daarom een uitzondering, geen instelling: leeg betekent "volg
 * de richtlijn", en de richtlijn blijft er altijd naast staan. Wie hem
 * overschrijft ziet dus wat hij overschrijft.
 *
 * ## Waarom hier geen calorieën staan
 *
 * Het dagboek kent de voedingsmiddelen die de vijf gemeten stoffen dragen,
 * niet je hele dag. Een caloriedoel zou een bovengrens-vraag stellen aan data
 * die alleen een ondergrens kan bewijzen — precies omgekeerd aan de
 * asymmetrie-regel waar het hele tekortsysteem op rust.
 */

const SURFACE = "voedingsdoelen";

const BELASTING_OPTIES: ReadonlyArray<{ waarde: number; label: string; uitleg: string }> = [
  { waarde: 1, label: "Weinig", uitleg: "Nauwelijks kracht- of duurtraining" },
  { waarde: 2, label: "Licht", uitleg: "Af en toe, één of twee keer per week" },
  { waarde: 3, label: "Actief", uitleg: "Regelmatig, drie tot vier keer per week" },
  { waarde: 4, label: "Zwaar", uitleg: "Bijna dagelijks of gericht op opbouw" },
];

type Status =
  | { fase: "laden" }
  | { fase: "klaar"; weergave: VoedingsdoelenWeergave }
  | { fase: "fout"; bericht: string };

/** Accepteert zowel "82,5" als "82.5" — een Nederlandse komma is hier het normale geval. */
function leesGewicht(invoer: string): number | null {
  const genormaliseerd = invoer.trim().replace(",", ".");
  if (genormaliseerd === "") return null;
  const waarde = Number.parseFloat(genormaliseerd);
  return Number.isFinite(waarde) ? Math.round(waarde * 10) / 10 : null;
}

function leesEiwit(invoer: string): number | null {
  const tekst = invoer.trim();
  if (tekst === "") return null;
  const waarde = Number.parseInt(tekst, 10);
  return Number.isFinite(waarde) ? waarde : null;
}

function toonGewicht(waarde: number | null): string {
  return waarde === null ? "" : String(waarde).replace(".", ",");
}

export default function VoedingsdoelenKaart() {
  const [status, setStatus] = useState<Status>({ fase: "laden" });
  const [gewichtInvoer, setGewichtInvoer] = useState("");
  const [eiwitInvoer, setEiwitInvoer] = useState("");
  const [bezig, setBezig] = useState(false);
  const [bewaard, setBewaard] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  function neemOver(weergave: VoedingsdoelenWeergave) {
    setStatus({ fase: "klaar", weergave });
    setGewichtInvoer(toonGewicht(weergave.doelen.gewichtKg));
    setEiwitInvoer(
      weergave.doelen.eiwitDoelG === null ? "" : String(weergave.doelen.eiwitDoelG),
    );
  }

  useEffect(() => {
    let actief = true;
    fetchVoedingsdoelen()
      .then((geladen) => {
        if (!actief) return;
        neemOver(geladen);
      })
      .catch((error: unknown) => {
        if (!actief) return;
        setStatus({
          fase: "fout",
          bericht: error instanceof Error ? error.message : "Kon je doelen niet laden.",
        });
      });
    return () => {
      actief = false;
    };
  }, []);

  async function bewaar(patch: Partial<Voedingsdoelen>, setting: string) {
    setBezig(true);
    setFout(null);
    setBewaard(false);
    try {
      neemOver(await postVoedingsdoelen(patch));
      setBewaard(true);
      trackEvent("voedingsdoel_aangepast", { setting, surface: SURFACE });
    } catch (error: unknown) {
      setFout(error instanceof Error ? error.message : "Kon je doelen niet opslaan.");
    } finally {
      setBezig(false);
    }
  }

  if (status.fase === "laden") {
    return (
      <Card>
        <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14 }}>
          Je doelen worden geladen…
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

  const { doelen, richtlijn, gewichtBron, checkHeeftGewicht } = status.weergave;

  const gewichtWaarde = leesGewicht(gewichtInvoer);
  const eiwitWaarde = leesEiwit(eiwitInvoer);
  const gewichtOngeldig = gewichtInvoer.trim() !== "" && !isGeldigGewicht(gewichtWaarde);
  const eiwitOngeldig = eiwitInvoer.trim() !== "" && !isGeldigEiwitDoel(eiwitWaarde);

  return (
    <Card>
      <div style={{ display: "grid", gap: 20 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
            Je voedingsdoelen
          </h2>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--text-muted)" }}>
            Je eiwitdoel schaalt met je gewicht en hoe zwaar je traint. Vul je hier
            niets in, dan rekenen we met wat je in je laatste check opgaf.
          </p>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Gewicht"
            value={gewichtInvoer}
            onChange={setGewichtInvoer}
            placeholder="bijv. 82"
            inputMode="decimal"
            hint={
              gewichtOngeldig
                ? "Vul een gewicht tussen 40 en 250 kg in."
                : gewichtBron === "check"
                  ? "Je rekent nu met het gewicht uit je laatste check. Vul hier iets in om dat te overschrijven."
                  : "In kilo's. Leeg laten betekent: gebruik je laatste check."
            }
          />
          <Button
            variant="secondary"
            disabled={bezig || gewichtOngeldig}
            onClick={() => void bewaar({ gewichtKg: gewichtWaarde }, "gewicht")}
          >
            Gewicht opslaan
          </Button>
        </div>

        <fieldset style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 10 }}>
          <legend
            style={{
              padding: 0,
              color: "var(--text-muted)",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            Hoe zwaar train je?
          </legend>
          <div style={{ display: "grid", gap: 8 }}>
            {BELASTING_OPTIES.map((optie) => {
              const actief = doelen.trainingsbelasting === optie.waarde;
              return (
                <button
                  key={optie.waarde}
                  type="button"
                  aria-pressed={actief}
                  disabled={bezig}
                  onClick={() =>
                    void bewaar(
                      { trainingsbelasting: actief ? null : optie.waarde },
                      "trainingsbelasting",
                    )
                  }
                  style={{
                    display: "grid",
                    gap: 2,
                    textAlign: "left",
                    padding: "10px 14px",
                    borderRadius: 12,
                    cursor: bezig ? "not-allowed" : "pointer",
                    border: `1px solid ${actief ? "var(--sage)" : "var(--panel-border)"}`,
                    background: actief ? "rgba(90,143,106,0.16)" : "transparent",
                    color: "var(--text)",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{optie.label}</span>
                  <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                    {optie.uitleg}
                  </span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-subtle)" }}>
            {doelen.trainingsbelasting === null
              ? "Je rekent nu met je laatste check. Kies hierboven om dat te overschrijven."
              : "Nogmaals tikken op je keuze zet hem terug naar je check."}
          </p>
        </fieldset>

        <div
          style={{
            display: "grid",
            gap: 4,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(90,143,106,0.10)",
            border: "1px solid var(--panel-border)",
          }}
        >
          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Richtlijn voor jou</span>
          <strong style={{ fontSize: 18, color: "var(--text)" }}>
            {richtlijn
              ? `${richtlijn.gramsLow}–${richtlijn.gramsHigh} g eiwit per dag`
              : "Nog geen richtlijn"}
          </strong>
          <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "var(--text-subtle)" }}>
            {richtlijn
              ? "Op basis van je gewicht, je training en je leeftijd — een richtlijn, geen medisch advies."
              : checkHeeftGewicht
                ? "Vul je gewicht in, dan rekenen we je richtlijn uit."
                : "Vul je gewicht in of doe de check, dan rekenen we je richtlijn uit."}
          </span>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <TextField
            label="Eigen eiwitdoel (optioneel)"
            value={eiwitInvoer}
            onChange={setEiwitInvoer}
            placeholder={richtlijn ? String(richtlijn.gramsLow) : "bijv. 120"}
            inputMode="numeric"
            hint={
              eiwitOngeldig
                ? "Vul een eiwitdoel tussen 20 en 400 gram in."
                : "In gram per dag. Leeg laten betekent: volg de richtlijn hierboven."
            }
          />
          <Button
            variant="secondary"
            disabled={bezig || eiwitOngeldig}
            onClick={() => void bewaar({ eiwitDoelG: eiwitWaarde }, "eiwitdoel")}
          >
            Eiwitdoel opslaan
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
