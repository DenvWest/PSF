"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import type { Micronutrient } from "@/data/nutrition/micronutrients";
import { emitAccountClientEvent } from "@/lib/account-events-client";
import { bouwDagdekking } from "@/lib/nutrition-dagdekking";
import { useVoedingDagboek } from "@/lib/use-voeding-dagboek";
import MicronutrientBronnen from "@/components/dashboard/kompas/voeding/MicronutrientBronnen";
import VoedingDagboek from "@/components/dashboard/kompas/voeding/VoedingDagboek";
import VoedingLaagPaneel from "@/components/dashboard/kompas/voeding/VoedingLaagPaneel";

/**
 * Voeding op Kompas: één dag, zes lezingen.
 *
 * Deze sectie bestaat om de dagboekstaat op één plek te houden. P1 vult in,
 * P2, P3, P4 en P6 lezen dezelfde dag; als elk paneel zijn eigen fetch deed
 * zouden ze na een wijziging uit elkaar lopen en zou het Kompas op twee plekken
 * iets anders over dezelfde ochtend zeggen.
 *
 * Hij wordt alleen gerenderd op het voedingsscherm — daarom staat de haak hier
 * en niet in `DomainKompasScreen`, waar hij ook op Slaap en Beweging een
 * dagboek zou ophalen dat die domeinen niet hebben.
 */
export default function VoedingKompasSectie({
  laag,
  surface,
  onGoVoortgang,
  metenSlot,
}: {
  /** De ladderlaag die openstaat. P1 is het dagboek zelf. */
  laag: number;
  surface: string;
  onGoVoortgang?: () => void;
  /** P5 blijft de meetreeks uit de check tonen; die komt van buiten. */
  metenSlot?: ReactNode;
}) {
  const [losseStof, setLosseStof] = useState<Micronutrient | null>(null);

  const meldToevoeging = useCallback(
    (moment: string, productKey: string, groep: string) => {
      emitAccountClientEvent("nutrition.dagboek_item_added", {
        surface,
        moment,
        product: productKey,
        groep,
      });
    },
    [surface],
  );

  const dagboek = useVoedingDagboek((moment, product) =>
    meldToevoeging(moment, product.key, product.groep),
  );

  const dekking = useMemo(() => bouwDagdekking(dagboek.items), [dagboek.items]);

  const openStof = useCallback(
    (stof: Micronutrient) => {
      setLosseStof(stof);
      emitAccountClientEvent("nutrition.micronutrient_bronnen_opened", {
        surface,
        stof: stof.id,
      });
    },
    [surface],
  );

  // Het dagboek staat er altijd, ook op de hogere lagen: die lezen de dag die
  // je erin zet, en er dan naartoe moeten scrollen via een andere laag maakt
  // van invullen een omweg. Wat per laag verschilt is wat eronder staat.
  return (
    <>
      <VoedingDagboek dagboek={dagboek} surface={surface} onGoVoortgang={onGoVoortgang} />

      {laag !== 1 ? (
        <VoedingLaagPaneel
          laag={laag}
          items={dagboek.items}
          dekking={dekking}
          surface={surface}
          onOpenStof={openStof}
          metenSlot={metenSlot}
        />
      ) : null}

      {losseStof ? (
        <MicronutrientBronnen
          stof={losseStof}
          onSluit={() => setLosseStof(null)}
          onKiesProduct={(product) => {
            dagboek.voegToe("avondeten", product);
            setLosseStof(null);
          }}
        />
      ) : null}
    </>
  );
}
