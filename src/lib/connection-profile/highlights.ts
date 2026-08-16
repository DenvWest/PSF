import { CONNECTION_PRIORITY_LAYERS } from "@/data/connection/lifestyle-priorities";
import {
  contentPillarsForTopics,
  type ContentPillar,
} from "@/data/connection/topic-content";
import {
  CONNECTION_ACTIVITIES,
  CONNECTION_FORMS,
  activityLabel,
  topicLabel,
  type ActivityId,
  type AvailabilityId,
  type ConnectionFormId,
  type TopicId,
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
 *
 * `style` is de naad naar de andere domeinen: vorm × tijdvak × ritme bepaalt hoe
 * een voorstel elders geformuleerd wordt (samen fietsen op zaterdag i.p.v. een
 * losse tip). Die richting is eenrichtingsverkeer — dit profiel vormt de
 * presentatie, en leest nooit iets uit de leefstijlcheck terug (§7).
 */

export type ProfileChip = { id: string; label: string };

export type ConnectionStyle = {
  /** Vorm waarin een voorstel hoort te landen ("samen iets doen"). */
  formLabel: string | null;
  /** Zelfgekozen tijdvak ("zaterdag", "een doordeweekse avond"). */
  timeLabel: string | null;
  /** Activiteit met ritme om aan te haken ("fietsen"). */
  anchorLabel: string | null;
  /** Waar het moet landen wanneer iemand daar expliciet in koos. */
  reach: "lokaal" | "online" | null;
};

export type ProfileHighlights = {
  /** Wat de gebruiker koos, teruggegeven — de zichtbare verantwoording. */
  topics: ProfileChip[];
  /** De sterkste helft van de doorsnede: waar iemand een ander mee helpt. */
  brengen: ProfileChip[];
  /** De andere helft: waar iemand beter in wil worden. */
  ontdekken: ProfileChip[];
  /** Prioriteitsvlakken die bij de gekozen vorm passen. */
  ways: { id: number; name: string; subtitle: string }[];
  /** Eén concrete eerste stap, afgeleid uit wat iemand al doet. */
  firstStep: { title: string; body: string } | null;
  /** De vorm-naad voor andere domeinen. */
  style: ConnectionStyle;
  /** Pijlers waarvoor content bestaat; de resolutie zelf gebeurt buiten deze map. */
  contentPillars: ContentPillar[];
};

const MAX_WAYS = 2;

/**
 * Welk tijdvak we noemen wanneer iemand er meerdere aanvinkt. Weekend eerst:
 * een sociale afspraak die op een weekenddag valt hoeft niet met werk te
 * concurreren, en dat is precies de drempel die we verlagen.
 */
const TIME_PREFERENCE: readonly AvailabilityId[] = [
  "zaterdag",
  "zondag",
  "doordeweeks_avond",
  "doordeweeks_overdag",
];

const TIME_LABEL: Record<AvailabilityId, string> = {
  zaterdag: "zaterdag",
  zondag: "zondag",
  doordeweeks_avond: "een doordeweekse avond",
  doordeweeks_overdag: "doordeweeks overdag",
};

/**
 * Welke vorm we noemen wanneer iemand er meerdere kiest. "Samen iets doen"
 * eerst: dat is de vorm met de laagste drempel voor deze doelgroep (P3), en
 * "maakt me niet uit" stuurt niets aan en staat er daarom niet in.
 */
const FORM_PREFERENCE: readonly ConnectionFormId[] = [
  "samen_doen",
  "een_op_een",
  "kleine_groep",
  "samen_leren",
  "kennis_delen",
  "grotere_groep",
];

function chips(ids: readonly TopicId[]): ProfileChip[] {
  return ids.map((id) => ({ id, label: topicLabel(id) }));
}

/** Activiteiten met een ritme; `niets_vasts` is een antwoord, geen anker. */
function regularActivities(doet: readonly ActivityId[]): ActivityId[] {
  return doet.filter((id) => id !== "niets_vasts");
}

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
 * Vorm, tijdvak en ritme in één vorm die elk domein kan lezen. Bevat alleen
 * labels uit de woordenlijst — nooit vrije tekst, nooit iets afgeleids.
 */
export function resolveConnectionStyle(profile: ConnectionProfile): ConnectionStyle {
  const form = FORM_PREFERENCE.find((id) => profile.vorm.includes(id));
  const slot = TIME_PREFERENCE.find((id) => profile.beschikbaarheid.includes(id));
  const anchor = regularActivities(profile.doet)[0];

  const wantsLocal = profile.vorm.includes("lokaal_ontmoeten");
  const wantsOnline = profile.vorm.includes("online");

  return {
    formLabel: form
      ? (CONNECTION_FORMS.find((option) => option.id === form)?.label.toLowerCase() ?? null)
      : null,
    timeLabel: slot ? TIME_LABEL[slot] : null,
    anchorLabel: anchor ? activityLabel(anchor).toLowerCase() : null,
    reach:
      wantsLocal === wantsOnline ? null : wantsLocal ? "lokaal" : "online",
  };
}

/**
 * De goedkoopste sociale actie is niet iets nieuws beginnen maar iemand vragen
 * bij iets dat er al staat. Doet iemand nog niets met een vast ritme, dan is de
 * eerste stap een moment zetten (P1) in plaats van iemand uitnodigen (P3).
 *
 * Het gekozen tijdvak wordt eraan geplakt wanneer het er is: een stap met een
 * dag erin is een afspraak, een stap zonder dag is een voornemen.
 */
function resolveFirstStep(
  profile: ConnectionProfile,
  style: ConnectionStyle,
): ProfileHighlights["firstStep"] {
  const when = style.timeLabel ? ` Zet het op ${style.timeLabel}.` : "";

  if (regularActivities(profile.doet).length === 0) {
    const layer = CONNECTION_PRIORITY_LAYERS[0];
    return {
      title: layer.name,
      body: `Er staat nog niets met een vast ritme in je week. Eén moment dat vastligt is goedkoper dan een reeks goede voornemens.${when}`,
    };
  }

  const activity = CONNECTION_ACTIVITIES.find(
    (option) => option.id === regularActivities(profile.doet)[0],
  );
  const label = activity ? activityLabel(activity.id).toLowerCase() : "iets";

  return {
    title: CONNECTION_PRIORITY_LAYERS[2].name,
    body: `Je doet al aan ${label}. Dat is het goedkoopste moment om iemand bij te vragen — je hoeft er geen uur voor vrij te maken.${when}`,
  };
}

export function resolveProfileHighlights(profile: ConnectionProfile): ProfileHighlights {
  const style = resolveConnectionStyle(profile);

  return {
    topics: chips(profile.interests),
    brengen: chips(profile.brengen),
    ontdekken: chips(profile.ontdekken),
    ways: resolveWays(profile),
    firstStep: resolveFirstStep(profile, style),
    style,
    contentPillars: contentPillarsForTopics(profile.ontdekken, profile.interests),
  };
}

/** Of er genoeg is ingevuld om een zinnige opbrengst te tonen. */
export function isProfileUsable(profile: ConnectionProfile): boolean {
  return profile.interests.length > 0;
}
