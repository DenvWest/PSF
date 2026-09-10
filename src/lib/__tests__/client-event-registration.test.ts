import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { DOMAIN_EVENT_TYPES } from "@/lib/events";

/**
 * De drie-plekken-regel uit CLAUDE.md, als test in plaats van als afspraak.
 *
 * Een nieuw client-event moet op drie plekken staan:
 *   1. `src/lib/events.ts` (DOMAIN_EVENT_TYPES) — het type bestaat;
 *   2. `src/lib/intake-events-client.ts` (ClientEmitType) — de client mag hem sturen;
 *   3. de allowlist in `src/app/api/intake/events/route.ts` — de server accepteert hem.
 *
 * Staat hij op twee van de drie, dan compileert alles en verdwijnt het event
 * stil: de client vuurt, de route weigert, en niemand merkt dat het meetpunt
 * dood is. Precies dat gat stond er tot september 2026 voor
 * `wearable.interest_clicked`, die in de intake-client-union stond maar alleen
 * in de account-allowlist — dood config met een val erin.
 *
 * De test leest de bronbestanden als tekst, omdat een TypeScript-union en een
 * route-constante geen van beide op runtime uit te lezen zijn.
 */

function lees(relatief: string): string {
  return fs.readFileSync(path.join(process.cwd(), relatief), "utf8");
}

/** De strings tussen twee ankers — de leden van een union of een Set-literal. */
function stringsTussen(bron: string, start: string, eind: string): string[] {
  const vanaf = bron.indexOf(start);
  if (vanaf === -1) throw new Error(`anker niet gevonden: ${start}`);
  const tot = bron.indexOf(eind, vanaf + start.length);
  if (tot === -1) throw new Error(`sluitanker niet gevonden: ${eind}`);
  const blok = bron.slice(vanaf + start.length, tot);
  return [...blok.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
}

const clientTypes = stringsTussen(
  lees("src/lib/intake-events-client.ts"),
  "type ClientEmitType = Extract<",
  ">;",
);

const routeAllowlist = stringsTussen(
  lees("src/app/api/intake/events/route.ts"),
  "const CLIENT_EMIT_TYPES = new Set<DomainEventType>([",
  "]);",
);

describe("client-events staan op alle drie de plekken", () => {
  it("leest beide lijsten überhaupt uit", () => {
    expect(clientTypes.length).toBeGreaterThan(10);
    expect(routeAllowlist.length).toBeGreaterThan(10);
  });

  it("kent elk client-event ook in DOMAIN_EVENT_TYPES", () => {
    const bekend = new Set<string>(DOMAIN_EVENT_TYPES);
    for (const type of clientTypes) {
      expect(bekend.has(type), `${type} mist in events.ts`).toBe(true);
    }
  });

  it("accepteert de route elk event dat de client mag sturen", () => {
    const toegestaan = new Set(routeAllowlist);
    const ontbreekt = clientTypes.filter((t) => !toegestaan.has(t));
    expect(ontbreekt, "client mag sturen, route weigert — stil dood meetpunt").toEqual([]);
  });

  it("staat er niets in de allowlist dat de client niet kan sturen", () => {
    const kanSturen = new Set(clientTypes);
    const overbodig = routeAllowlist.filter((t) => !kanSturen.has(t));
    expect(overbodig, "allowlist noemt een event dat geen client emit").toEqual([]);
  });

  it("registreert de drie schap-events van de omgekeerde index", () => {
    for (const type of [
      "nutrition.schap_bronnen_getoond",
      "nutrition.schap_bron_clicked",
      "nutrition.schap_categorie_gefilterd",
    ]) {
      expect(DOMAIN_EVENT_TYPES).toContain(type);
      expect(clientTypes, `${type} mist in de client`).toContain(type);
      expect(routeAllowlist, `${type} mist in de allowlist`).toContain(type);
    }
  });
});
