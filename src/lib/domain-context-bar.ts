import { STRESS_LIFESTYLE_FIRST_REASON } from "@/data/domain-product-stance";
import { PILLAR } from "@/data/dashboard";
import { buildDashboardSchapHref } from "@/lib/dashboard-url";
import {
  buildDomainCheckHref,
  CHECK_NAME,
  supportsDomainCheck,
} from "@/lib/kompas-domain-check";
import { hasSchap } from "@/lib/schap-availability";
import type { DashboardData, PillarId } from "@/types/dashboard";

/**
 * Wat de contextkolom per domein te zeggen heeft.
 *
 * De vorm van de kolom is domein-agnostisch (`kompas-context-spine.ts`); wat
 * er per domein ánders is, staat hier — net zoals {@link DOMAIN_KOMPAS_COPY}
 * dat doet voor het middenscherm. Vijf domeinen, vijf verschillende standen:
 *
 * | Domein | Ladder-readout | Eigen check | Schap |
 * |---|---|---|---|
 * | slaap | staten + feitrijen | slaapcheck | magnesium |
 * | beweging | staten + feitrijen | beweegcheck | creatine · eiwit · diensten |
 * | voeding | geen (ladder zonder oordeel) | voedingscheck | vijf nutriënten |
 * | stress | staten, geen feitrijen | stresscheck | **geen** — `lifestyle_first` |
 * | verbinding | geen | **geen** — meet mee in de hermeting | **geen** — `geen_schap` |
 *
 * Twee dingen die daaruit volgen en die de kolom eerder niet deed:
 *
 * 1. Zonder readout viel de urgentie-zone wég. Op een Kompas-home met voeding
 *    of verbinding als prioriteit stond de kolom dus half leeg, precies bij de
 *    domeinen die de meeste uitleg nodig hebben. Nu draagt hij daar de reden en
 *    de check die het oplost.
 * 2. Het schap hing alleen aan `KompasOndersteuningTile` op de home, en dus aan
 *    je *prioriteitsdomein*. Open je een ander domein, dan was er geen weg naar
 *    het aanbod van dát domein. Nu draagt elke domeincontext zijn eigen schap —
 *    of de reden waarom het er niet is, wat op stress en verbinding een
 *    genomen besluit is en geen ontbrekende lijst.
 */

export type DomainSchapZone =
  | {
      kind: "open";
      label: string;
      line: string;
      href: string;
      ctaLabel: string;
    }
  | { kind: "gate"; label: string; reason: string };

export type DomainCheckCta = { label: string; href: string };

export type DomainContextBar = {
  domain: PillarId;
  label: string;
  color: string;
  /** De check die een winst-laag oplevert, of null als dit domein er geen heeft. */
  checkCta: DomainCheckCta | null;
  /** Wat er over je winst te zeggen valt zolang de check die niet aanwijst. */
  noReadoutLine: string;
  schap: DomainSchapZone;
};

type DomainContextCopy = {
  noReadoutLine: string;
  schapLine: string;
  /** Alleen voor domeinen zonder schap: waarom dat een oordeel is. */
  schapGateReason?: string;
};

const DOMAIN_CONTEXT_COPY: Record<PillarId, DomainContextCopy> = {
  slaap: {
    noReadoutLine:
      "Je slaapcheck wijst je winst-laag aan. Zonder die check staan je prioriteiten er wel, maar zonder oordeel.",
    schapLine: "Magnesium, met ons oordeel erbij — ook wanneer dat oordeel 'nee' is.",
  },
  beweging: {
    noReadoutLine:
      "Je beweegcheck wijst je winst-laag aan. Zonder die check staan je prioriteiten er wel, maar zonder oordeel.",
    schapLine: "Creatine en eiwit, plus begeleiding — met ons oordeel erbij.",
  },
  voeding: {
    // Voeding hééft een ladder maar geen readout: de voedingscheck levert
    // innamebanden, geen staat per laag. Dat is de eerlijke stand — niet doen
    // alsof er een winst-laag ligt.
    noReadoutLine:
      "Je voedingscheck schat je inname per nutriënt, maar wijst nog geen winst-laag aan. Je prioriteiten lees je hier zonder oordeel.",
    schapLine: "De vijf nutriënten die je voedingscheck schat — met ons oordeel per stof.",
  },
  stress: {
    noReadoutLine:
      "Je stress-check wijst je winst-laag aan. Zonder die check staan je prioriteiten er wel, maar zonder oordeel.",
    schapLine: "",
    schapGateReason: STRESS_LIFESTYLE_FIRST_REASON,
  },
  verbinding: {
    noReadoutLine:
      "Verbinding meet mee in je hermeting — er is geen aparte check die hier een winst-laag aanwijst. Je prioriteiten staan er zonder oordeel.",
    schapLine: "",
    schapGateReason:
      "Op verbinding verkopen we niets, ook niet ons eigen aanbod. Er is geen supplement waarvan wij kunnen onderbouwen dat het contact vervangt — dus staat er ook geen schap.",
  },
  energie: {
    noReadoutLine:
      "Energie is een uitkomst, geen knop. Wat eraan trekt lees je op slaap, voeding en beweging.",
    schapLine: "",
    schapGateReason:
      "Energie is een uitkomst van andere domeinen. Aanbod hoort waar het gemeten wordt — op slaap, voeding of beweging.",
  },
  herstel: {
    noReadoutLine:
      "Herstel is een uitkomst, geen knop. Wat eraan trekt lees je op slaap, beweging en stress.",
    schapLine: "",
    schapGateReason:
      "Herstel is een uitkomst van andere domeinen. Aanbod hoort waar het gemeten wordt — op slaap, beweging of stress.",
  },
};

function buildCheckCta(domain: PillarId): DomainCheckCta | null {
  if (!supportsDomainCheck(domain)) {
    return null;
  }
  const name = CHECK_NAME[domain];
  return name ? { label: `Doe de ${name}`, href: buildDomainCheckHref(domain) } : null;
}

function buildSchapZone(domain: PillarId, copy: DomainContextCopy): DomainSchapZone {
  const label = PILLAR[domain].label;

  if (hasSchap(domain)) {
    return {
      kind: "open",
      label: `Je schap · ${label.toLowerCase()}`,
      line: copy.schapLine,
      href: buildDashboardSchapHref(domain, "producten"),
      ctaLabel: "Open je schap",
    };
  }

  return {
    kind: "gate",
    label: `Geen schap op ${label.toLowerCase()}`,
    reason: copy.schapGateReason ?? "",
  };
}

export function buildDomainContextBar(domain: PillarId): DomainContextBar {
  const copy = DOMAIN_CONTEXT_COPY[domain];
  const pillar = PILLAR[domain];

  return {
    domain,
    label: pillar.label,
    color: pillar.color,
    checkCta: buildCheckCta(domain),
    noReadoutLine: copy.noReadoutLine,
    schap: buildSchapZone(domain, copy),
  };
}

/**
 * De domeinspecifieke ritme-regel: wat er op dít domein aan continuïteit
 * hangt en niet uit de cyclus af te lezen is.
 *
 * Alleen waar er echt iets te melden valt. Een regel per domein verzinnen zou
 * de ritme-zone vullen zonder hem iets te laten zeggen.
 */
export function buildDomainRitmeHint(
  domain: PillarId,
  data: DashboardData | undefined,
): { line: string; alert: boolean } | null {
  if (domain === "voeding") {
    // Zonder geladen dashboard weten we niets over de log. "Nog geen
    // voedingslog" tonen tijdens de eerste render zou een alert flitsen die
    // een seconde later onwaar blijkt.
    if (!data) {
      return null;
    }
    const days = data.daysSinceNutritionLog ?? null;
    if (data.nutritionRelogDue && days != null) {
      return {
        line: `Je voedingslog is ${days} dagen oud — je inname-schatting loopt erop achter.`,
        alert: true,
      };
    }
    if (days == null) {
      return {
        line: "Nog geen voedingslog — zonder log blijft je inname-schatting leeg.",
        alert: true,
      };
    }
    return null;
  }

  if (domain === "verbinding") {
    return {
      line: "Verbinding meet mee in je hermeting — er is geen aparte check om vol te houden.",
      alert: false,
    };
  }

  return null;
}
