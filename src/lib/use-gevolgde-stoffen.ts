"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import type { SupermarktVeld } from "@/lib/nutrition-supermarkt-items";

/**
 * De gevolgde stoffen als één gedeelde toestand in de browser. De kiezer op
 * Je doelen, de "+" in Je patroon en de tabel die de rijen toont lezen
 * hetzelfde, dus een stof die je toevoegt staat meteen overal.
 *
 * Wijzigen gaat optimistisch: de lijst past zich direct aan, en bij een
 * mislukte opslag springt hij terug en komt de fout terug bij de aanroeper.
 */

type Toestand = { stoffen: readonly SupermarktVeld[]; geladen: boolean };

const LEEG: Toestand = { stoffen: [], geladen: false };

let toestand: Toestand = LEEG;
let laden: Promise<void> | null = null;
const luisteraars = new Set<() => void>();

function zetToestand(volgende: Toestand) {
  toestand = volgende;
  for (const luisteraar of luisteraars) luisteraar();
}

function abonneer(luisteraar: () => void) {
  luisteraars.add(luisteraar);
  return () => {
    luisteraars.delete(luisteraar);
  };
}

async function leesFout(response: Response, terugval: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error?.trim() || terugval;
  } catch {
    return terugval;
  }
}

function laadEenmaal(): Promise<void> {
  laden ??= fetch("/api/account/gevolgde-stoffen", { credentials: "include" })
    .then(async (response) => {
      if (!response.ok) throw new Error("laden mislukt");
      const body = (await response.json()) as { stoffen?: SupermarktVeld[] };
      zetToestand({ stoffen: body.stoffen ?? [], geladen: true });
    })
    .catch(() => {
      laden = null;
      zetToestand({ stoffen: toestand.stoffen, geladen: true });
    });
  return laden;
}

async function bewaar(stoffen: readonly SupermarktVeld[]): Promise<void> {
  const vorige = toestand;
  zetToestand({ stoffen, geladen: true });
  const response = await fetch("/api/account/gevolgde-stoffen", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ stoffen }),
  });
  if (!response.ok) {
    zetToestand(vorige);
    throw new Error(await leesFout(response, "Kon je gevolgde stoffen niet opslaan."));
  }
}

export function useGevolgdeStoffen(): {
  stoffen: readonly SupermarktVeld[];
  geladen: boolean;
  zetGevolgd: (veld: SupermarktVeld, aan: boolean) => Promise<void>;
  /** Eén plek eerder (-1) of later (1) in de lijst; de volgorde wordt met de lijst bewaard. */
  verschuif: (veld: SupermarktVeld, richting: -1 | 1) => Promise<void>;
} {
  const huidig = useSyncExternalStore(
    abonneer,
    () => toestand,
    () => LEEG,
  );

  useEffect(() => {
    void laadEenmaal();
  }, []);

  const zetGevolgd = useCallback(async (veld: SupermarktVeld, aan: boolean) => {
    const zonder = toestand.stoffen.filter((stof) => stof !== veld);
    await bewaar(aan ? [...zonder, veld] : zonder);
  }, []);

  const verschuif = useCallback(async (veld: SupermarktVeld, richting: -1 | 1) => {
    const lijst = [...toestand.stoffen];
    const van = lijst.indexOf(veld);
    const naar = van + richting;
    if (van < 0 || naar < 0 || naar >= lijst.length) return;
    [lijst[van], lijst[naar]] = [lijst[naar]!, lijst[van]!];
    await bewaar(lijst);
  }, []);

  return { stoffen: huidig.stoffen, geladen: huidig.geladen, zetGevolgd, verschuif };
}
