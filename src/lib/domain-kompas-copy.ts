import type { PillarId } from "@/types/dashboard";

/**
 * De domeinen met een eigen Kompas-scherm in React. Verbinding staat nog als
 * prebuild-iframe op Kompas; die verhuist hierheen zodra zijn check per laag
 * een staat oplevert (zie `resolveDomainLadderReadout`). Voeding heeft die
 * staat nog niet — de ladder toont er zes lagen zonder oordeel, wat al zo
 * werkte voordat dit scherm bestond.
 */
export type DomainKompasDomain = Extract<PillarId, "beweging" | "slaap" | "voeding" | "stress">;

export type DomainKompasCopy = {
  /** De meetregel bij het cijfer: "nog geen beweegcheck". */
  checkNoun: string;
  /** Wat er zonder eigen check over je stand te zeggen valt. */
  noCheckStatusLine: string;
  /** Kop boven de ladder zolang er geen check is om winst uit af te lezen. */
  ladderEyebrowWithoutCheck: string;
  /** De primaire knop naar Voortgang › domein. */
  voortgangLabel: string;
  /** De knop naar Mijn Dag — slaap zegt "vanavond", beweging "vandaag". */
  agendaLabel: string;
  /** Meet-surface; blijft gelijk aan wat er vóór 20 augustus al gestuurd werd. */
  surface: string;
  /**
   * Waarom er op déze laag niets klaarstaat. Alleen waar de laag geen acties
   * draagt; anders wordt hij nooit gelezen. Null = val terug op de
   * wacht-regel uit de check, en anders op de samenvatting van de laag.
   */
  emptyLine?: (layerId: number) => string | null;
};

export const DOMAIN_KOMPAS_COPY: Record<DomainKompasDomain, DomainKompasCopy> = {
  beweging: {
    checkNoun: "beweegcheck",
    noCheckStatusLine:
      "Waar jouw winst zit lezen we af uit je beweegcheck. Je prioriteiten staan er wel — lees ze, en kies wat herkenbaar is.",
    ladderEyebrowWithoutCheck: "Van fundament naar finetunen",
    voortgangLabel: "Open je beweegbeeld",
    agendaLabel: "Mijn Dag › vandaag",
    surface: "kompas_beweging",
    emptyLine: (layerId) =>
      layerId === 6
        ? "Of aanvullen aan de orde is, lees je in je beweegbeeld. Kiezen doe je daarna op je schap, niet hier."
        : null,
  },
  slaap: {
    checkNoun: "slaapcheck",
    noCheckStatusLine:
      "Waar jouw winst zit lezen we af uit je slaapcheck. Je prioriteiten staan er wel — lees ze, en kies wat herkenbaar is.",
    ladderEyebrowWithoutCheck: "Van basis naar finetunen",
    voortgangLabel: "Open je slaapbeeld",
    // "Vanavond", niet "vandaag": wat je op de slaapladder kiest speelt zich
    // 's avonds af. Woordelijk uit slaap v2 `renderK` (r.1590).
    agendaLabel: "Mijn Dag › vanavond",
    surface: "kompas_slaap",
  },
  voeding: {
    checkNoun: "voedingscheck",
    noCheckStatusLine:
      "Waar jouw winst zit lezen we af uit je voedingscheck. Je prioriteiten staan er wel — lees ze, en kies wat herkenbaar is.",
    ladderEyebrowWithoutCheck: "Van onder naar boven",
    voortgangLabel: "Open je voedingsbeeld",
    agendaLabel: "Mijn Dag › vandaag",
    surface: "kompas_voeding",
  },
  stress: {
    checkNoun: "stress-check",
    noCheckStatusLine:
      "Waar jouw winst zit lezen we af uit je stress-check. Je prioriteiten staan er wel — lees ze, en kies wat herkenbaar is.",
    ladderEyebrowWithoutCheck: "Van grens naar meten",
    voortgangLabel: "Open je stressbeeld",
    agendaLabel: "Mijn Dag › vandaag",
    surface: "kompas_stress",
  },
};

export function isDomainKompasDomain(domain: PillarId): domain is DomainKompasDomain {
  return domain === "beweging" || domain === "slaap" || domain === "voeding" || domain === "stress";
}
