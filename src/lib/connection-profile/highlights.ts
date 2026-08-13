import { CONNECTION_PRIORITY_LAYERS } from "@/data/connection/lifestyle-priorities";
import {
  CONNECTION_ACTIVITIES,
  CONNECTION_FORMS,
  activityLabel,
  topicLabel,
} from "@/data/connection/vocabulary";
import type { ConnectionProfile } from "@/lib/connection-profile/types";

/**
 * De opbrengst direct ná het invullen — zie
 * docs/design/BESLUIT_CONNECTION_PROFILE_V1_2026-08.md §6.
 *
 * HARDE EIS: alles hier is berekenbaar uit statische data plus het eigen
 * profiel. Nul afhankelijkheid van andere gebruikers, want een profiel dat pas
 * iets oplevert als er genoeg anderen zijn, is een leeg formulier met een
 * belofte. Dat is precies de fout die van het verbinding-scherm is weggehaald.
 */

export type ProfileHighlights = {
  /** Wat de gebruiker koos, teruggegeven — de zichtbare verantwoording. */
  topics: string[];
  /** Prioriteitsvlakken die bij de gekozen vorm passen. */
  ways: { id: number; name: string; subtitle: string }[];
  /** Eén concrete eerste stap, afgeleid uit wat iemand al doet. */
  firstStep: { title: string; body: string } | null;
};

const MAX_TOPICS = 3;
const MAX_WAYS = 2;

/**
 * De vlakken die bij de gekozen verbindingsvorm horen. Kiest iemand niets of
 * "maakt me niet uit", dan vallen we terug op de bovenste twee vlakken —
 * die zijn het goedkoopst en dragen het meest.
 */
function resolveWays(profile: ConnectionProfile): ProfileHighlights["ways"] {
  const layerIds = new Set<number>();

  for (const formId of profile.vorm) {
    const form = CONNECTION_FORMS.find((option) => option.id === formId);
    if (form?.layer != null) {
      layerIds.add(form.layer);
    }
  }

  const ordered = CONNECTION_PRIORITY_LAYERS.filter((layer) => layerIds.has(layer.id));
  const chosen = ordered.length > 0 ? ordered : CONNECTION_PRIORITY_LAYERS.slice(0, MAX_WAYS);

  return chosen.slice(0, MAX_WAYS).map((layer) => ({
    id: layer.id,
    name: layer.name,
    subtitle: layer.subtitle,
  }));
}

/**
 * De goedkoopste sociale actie is niet iets nieuws beginnen maar iemand vragen
 * bij iets dat er al staat. Doet iemand nog niets met een vast ritme, dan is de
 * eerste stap een moment zetten (P1) in plaats van iemand uitnodigen (P3).
 */
function resolveFirstStep(profile: ConnectionProfile): ProfileHighlights["firstStep"] {
  const regular = profile.doet.filter((id) => id !== "niets_vasts");

  if (regular.length === 0) {
    const layer = CONNECTION_PRIORITY_LAYERS[0];
    return {
      title: layer.name,
      body: "Er staat nog niets met een vast ritme in je week. Eén moment dat vastligt is goedkoper dan een reeks goede voornemens.",
    };
  }

  const activity = CONNECTION_ACTIVITIES.find((option) => option.id === regular[0]);
  const label = activity ? activityLabel(activity.id).toLowerCase() : "iets";

  return {
    title: CONNECTION_PRIORITY_LAYERS[2].name,
    body: `Je doet al aan ${label}. Dat is het goedkoopste moment om iemand bij te vragen — je hoeft er geen uur voor vrij te maken.`,
  };
}

export function resolveProfileHighlights(profile: ConnectionProfile): ProfileHighlights {
  return {
    topics: profile.interests.slice(0, MAX_TOPICS).map(topicLabel),
    ways: resolveWays(profile),
    firstStep: resolveFirstStep(profile),
  };
}

/** Of er genoeg is ingevuld om een zinnige opbrengst te tonen. */
export function isProfileUsable(profile: ConnectionProfile): boolean {
  return profile.interests.length > 0;
}
